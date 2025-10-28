// register.ts - 會員註冊與登入功能

document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理，這裡只處理註冊功能
  // 初始化為註冊模式
  switchTab('register');
});

// Tab 切換功能
function switchTab(mode: 'register' | 'login') {
  const registerTab = document.getElementById('registerTab') as HTMLButtonElement;
  const loginTab = document.getElementById('loginTab') as HTMLButtonElement;
  const emailField = document.getElementById('emailField') as HTMLElement;
  const confirmPasswordField = document.getElementById('confirmPasswordField') as HTMLElement;
  const registerButton = document.getElementById('registerButton') as HTMLButtonElement;
  const loginButton = document.getElementById('loginButton') as HTMLButtonElement;

  // 清除所有欄位的錯誤狀態
  clearFieldErrors();

  if (mode === 'register') {
    // 註冊模式
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    emailField.classList.remove('hidden');
    confirmPasswordField.classList.remove('hidden');
    registerButton.style.display = 'inline-block';
    loginButton.style.display = 'none';
  } else {
    // 登入模式
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    emailField.classList.add('hidden');
    confirmPasswordField.classList.add('hidden');
    registerButton.style.display = 'none';
    loginButton.style.display = 'inline-block';
  }
}

// 清除欄位錯誤狀態的輔助函數
function clearFieldErrors() {
  const fields = ['usernameField', 'emailField', 'passwordField', 'confirmPasswordField'];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove('error', 'success');
    }
  });
  const resultMessage = document.getElementById('resultMessage') as HTMLElement;
  if (resultMessage) {
    resultMessage.textContent = '';
  }
}

// 將 switchTab 函數添加到全域範圍
(window as any).switchTab = switchTab;

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
      resultMessage.textContent = "註冊成功！正在自動登入...";
      
      // 註冊成功後自動登入
      try {
        const loginResponse = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });

        const loginResult = await loginResponse.json();

        if (loginResult.success) {
          // 自動登入成功，儲存用戶資訊到 LocalStorage
          localStorage.setItem('fishing_currentUser', JSON.stringify(loginResult.user));
          
          resultMessage.style.color = "green";
          resultMessage.textContent = `歡迎加入，${loginResult.user.username}！正在跳轉...`;
          
          // 2 秒後跳轉到主頁面
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
          
        } else {
          // 註冊成功但自動登入失敗，提示手動登入
          resultMessage.style.color = "orange";
          resultMessage.textContent = "註冊成功！但自動登入失敗，請手動登入。";
          
          // 清空表單
          usernameInput.value = '';
          emailInput.value = '';
          passwordInput.value = '';
          confirmPasswordInput.value = '';
        }
        
      } catch (autoLoginError) {
        console.error('自動登入失敗:', autoLoginError);
        resultMessage.style.color = "orange";
        resultMessage.textContent = "註冊成功！但自動登入失敗，請手動登入。";
        
        // 清空表單
        usernameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
      }
    }
  } catch (error) {
    resultMessage.style.color = "red";
    resultMessage.textContent = "註冊失敗，請重試。";
    console.error(error);
  }
}

// 登入函數
async function submitLogin() {
  const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
  const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
  const resultMessage = document.getElementById('resultMessage') as HTMLElement;
  const usernameField = document.getElementById('usernameField') as HTMLElement;
  const passwordField = document.getElementById('passwordField') as HTMLElement;

  let username = usernameInput.value.trim();
  let password = passwordInput.value.trim();

  // 清除之前的錯誤樣式
  resultMessage.classList.remove("success");
  usernameField.classList.remove("error");
  passwordField.classList.remove("error");

  // 基本驗證
  if (!username) {
    usernameField.classList.add("error");
    resultMessage.textContent = "請輸入用戶名";
    resultMessage.style.color = "red";
    return;
  }

  if (!password) {
    passwordField.classList.add("error");
    resultMessage.textContent = "請輸入密碼";
    resultMessage.style.color = "red";
    return;
  }

  // 顯示載入中
  resultMessage.textContent = "正在登入...";
  resultMessage.style.color = "blue";

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
      // 登入成功，儲存用戶資訊到 LocalStorage
      localStorage.setItem('fishing_currentUser', JSON.stringify(result.user));
      
      resultMessage.style.color = "green";
      resultMessage.textContent = `歡迎回來，${result.user.username}！`;
      
      // 1.5 秒後跳轉到主頁面
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      
    } else {
      // 登入失敗
      resultMessage.style.color = "red";
      resultMessage.textContent = result.error;
      
      // 根據錯誤類型標記錯誤欄位
      if (result.error.includes('帳號') || result.error.includes('用戶')) {
        usernameField.classList.add("error");
      }
      if (result.error.includes('密碼')) {
        passwordField.classList.add("error");
      }
      if (result.error.includes('帳號或密碼錯誤')) {
        usernameField.classList.add("error");
        passwordField.classList.add("error");
      }
    }

  } catch (error) {
    console.error('登入請求失敗:', error);
    resultMessage.style.color = "red";
    resultMessage.textContent = "網路錯誤，請檢查連線後重試";
  }
}

// 將函數掛載到全域，讓 HTML 可以呼叫
(window as any).subRegister = subRegister;
(window as any).submitLogin = submitLogin;