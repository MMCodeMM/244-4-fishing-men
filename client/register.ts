document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理，這裡只處理註冊功能
});

async function subRegister() {
  const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
  const emailInput = document.getElementById('emailInput') as HTMLInputElement;
  const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
  const confirmPasswordInput = document.getElementById('confirmPasswordInput') as HTMLInputElement;
  const resultMessage = document.getElementById('resultMessage') as HTMLElement;
  const usernameField = document.getElementById('usernameField') as HTMLElement;
  const emailField = document.getElementById('emailField') as HTMLElement;
  const passwordField = document.getElementById('passwordField') as HTMLElement;
  const confirmPasswordField = document.getElementById('confirmPasswordField') as HTMLElement;

  let username = usernameInput.value;
  let email = emailInput.value;
  let password = passwordInput.value;
  let confirmPassword = confirmPasswordInput.value;

  resultMessage.classList.remove("success");

  if (username.length < 3) {
    usernameField.classList.add("error");
    resultMessage.textContent = "Username must be at least 3 characters long";
    return;
  }
  usernameField.classList.remove("error");

  if (!email.includes("@")) {
    emailField.classList.add("error");
    resultMessage.textContent = "email must contain @ ";
    return;
  }
  emailField.classList.remove("error");

  passwordField.classList.remove("error");
  confirmPasswordField.classList.remove("error");

  if (password.length < 4) {
    passwordField.classList.add("error");
    resultMessage.textContent = "Password must be at least 4 characters long";
    return;
  }
  passwordField.classList.remove("error");

  if (password !== confirmPassword) {
    passwordField.classList.add("error");
    confirmPasswordField.classList.add("error");
    resultMessage.textContent = "password not match with confirm password";
    return;
  }

  // 密碼匹配，繼續註冊流程
  resultMessage.textContent = "Processing registration...";
  resultMessage.style.color = "blue";

  try {
    let res = await fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    
    let json = await res.json().catch(error => ({error : String(error)}));
    
    if (res.status === 409) {
      // 重複用戶名或 email
      resultMessage.style.color = "red";
      resultMessage.textContent = json.error;
      
      // 根據錯誤訊息判斷是哪個欄位重複
      if (json.error.includes('Username')) {
        usernameField.classList.add("error");
      } else if (json.error.includes('Email')) {
        emailField.classList.add("error");
      }
    } else if (json.error) {
      resultMessage.style.color = "red";
      resultMessage.textContent = json.error;
    } else {
      resultMessage.style.color = "green";
      resultMessage.textContent = "註冊成功！請前往登入。";
      
      // 清空表單
      usernameInput.value = '';
      emailInput.value = '';
      passwordInput.value = '';
      confirmPasswordInput.value = '';
    }
  } catch (error) {
    resultMessage.style.color = "red";
    resultMessage.textContent = "註冊失敗，請重試。";
    console.error(error);
  }
}

// 將函數掛載到全域，讓 HTML 可以呼叫
(window as any).subRegister = subRegister;