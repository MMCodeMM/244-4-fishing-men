import { findElement } from './utils';

export function renderHeaderAndNav(showNav: boolean = true) {
  const container = findElement<HTMLDivElement>('.container');
  let html = `
    <div class="header">
      <div class="logo">
        <img src="/public/fishingman_logo.png" alt="Logo" style="height: 80px;" onclick="location.href='index.html'" onmouseover="this.style.cursor='pointer'">
      </div>
    </div>
  `;
  if (showNav) {
    html += `
      <div class="navigation">
        <div class="nav-buttons">
          <button onclick="location.href='search.html'">搜尋</button>
          <button onclick="location.href='map.html'">地圖</button>
          <button onclick="location.href='my_album.html'">我的圖鑑</button>
        </div>
        <div class="auth-buttons">
          <button onclick="location.href='login.html'">登入</button>
          <button onclick="location.href='register.html'">注冊</button>
        </div>
      </div>
    `;
  }
  container.insertAdjacentHTML('afterbegin', html);
}