import { findElement } from './utils';

// 檢查用戶是否已登入
function getCurrentUser() {
  try {
    const userData = localStorage.getItem('fishing_currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('讀取用戶資料失敗:', error);
    return null;
  }
}

// 登出函數
function logout() {
  localStorage.removeItem('fishing_currentUser');
  alert('已成功登出！');
  window.location.href = 'index.html';
}

// 將登出函數掛載到全域
(window as any).logout = logout;

export function renderHeaderAndNav(showNav: boolean = true) {
  const container = findElement<HTMLDivElement>('.container');
  const currentUser = getCurrentUser();
  
  let html = `
    <div class="header" style="display: flex; justify-content: center; align-items: center; padding: 20px; background-color: #A1C6E7;">
      <div class="logo">
        <img src="/fishingman_logo.png" alt="Logo" style="height: 80px;" onclick="location.href='index.html'" onmouseover="this.style.cursor='pointer'">
      </div>
    </div>
  `;
  
  // 在 HEADER 和 NAVIGATION 中間添加歡迎訊息
  if (showNav && currentUser) {
    html += `
      <div style="display: flex; justify-content: center; align-items: center; padding: 10px; background-color: #A1C6E7;">
        <span style="color: white; font-weight: bold; font-size: 1.5em; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;">歡迎, ${currentUser.username}</span>
      </div>
    `;
  }
  
  if (showNav) {
    // 根據登入狀態顯示不同的 auth-buttons，移除歡迎訊息
    const authButtonsHTML = currentUser ? `
        <button onclick="location.href='my_album.html'">我的圖鑑</button>
        <button onclick="logout()" style="background-color: #dc3545; color: white;">登出</button>
    ` : `
        <button onclick="location.href='register.html'">注冊/登入</button>
    `;
    
    html += `
      <div class="navigation" style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 10px;">
        <button onclick="location.href='search.html'">搜尋</button>
        <button onclick="location.href='map.html'">地圖</button>
        <button onclick="location.href='album.html'">圖鑑</button>
        ${authButtonsHTML}
      </div>
    `;
  }
  container.insertAdjacentHTML('afterbegin', html);
}