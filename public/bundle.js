"use strict";
(() => {
  // client/utils.ts
  function findElement(selector) {
    let element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found, selector: ${selector}`);
    }
    return element;
  }

  // client/sharedHeader.ts
  function getCurrentUser() {
    try {
      const userData = localStorage.getItem("fishing_currentUser");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("\u8B80\u53D6\u7528\u6236\u8CC7\u6599\u5931\u6557:", error);
      return null;
    }
  }
  function logout() {
    localStorage.removeItem("fishing_currentUser");
    alert("\u5DF2\u6210\u529F\u767B\u51FA\uFF01");
    window.location.href = "index.html";
  }
  window.logout = logout;
  function renderHeaderAndNav(showNav = true) {
    const container = findElement(".container");
    const currentUser = getCurrentUser();
    let html = `
    <div class="header" style="display: flex; justify-content: center; align-items: center; padding: 20px; background-color: #A1C6E7;">
      <div class="logo">
        <img src="/fishingman_logo.png" alt="Logo" style="height: 80px;" onclick="location.href='index.html'" onmouseover="this.style.cursor='pointer'">
      </div>
    </div>
  `;
    if (showNav && currentUser) {
      html += `
      <div style="display: flex; justify-content: center; align-items: center; padding: 10px; background-color: #A1C6E7;">
        <span style="color: white; font-weight: bold; font-size: 1.5em; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;">\u6B61\u8FCE, ${currentUser.username}</span>
      </div>
    `;
    }
    if (showNav) {
      const authButtonsHTML = currentUser ? `
        <button onclick="location.href='my_album.html'">\u6211\u7684\u5716\u9451</button>
        <button onclick="logout()" style="background-color: #dc3545; color: white;">\u767B\u51FA</button>
    ` : `
        <button onclick="location.href='register.html'">\u6CE8\u518A/\u767B\u5165</button>
    `;
      html += `
      <div class="navigation" style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 10px;">
        <button onclick="location.href='search.html'">\u641C\u5C0B</button>
        <button onclick="location.href='map.html'">\u5730\u5716</button>
        <button onclick="location.href='album.html'">\u5716\u9451</button>
        ${authButtonsHTML}
      </div>
    `;
    }
    container.insertAdjacentHTML("afterbegin", html);
  }

  // client/index.ts
  document.addEventListener("DOMContentLoaded", () => {
    const onlyLogo = document.body.dataset.header === "logo-only";
    renderHeaderAndNav(!onlyLogo);
    fetch("/api/fish").then((res) => res.json()).then((fishList) => {
      const shuffled = fishList.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);
      const swiperWrapper = document.getElementById("fish-swiper-wrapper");
      if (swiperWrapper) {
        swiperWrapper.innerHTML = selected.map((fish) => `
          <div class="slider-item swiper-slide">
            <div class="slider-image-wrapper">
              <img class="slider-image" src="${fish.image}" alt="${fish.name}">
            </div>
            <div class="slider-item-content">
              <h1>${fish.name}</h1>
              <p>${fish.description || "\u7CBE\u7F8E\u7684\u6D77\u6D0B\u9B5A\u985E\uFF0C\u503C\u5F97\u60A8\u7D30\u7D30\u54C1\u5473\u548C\u4E86\u89E3\u3002"}</p>
            </div>
          </div>
        `).join("");
        const swiper = new Swiper(".swiper-container", {
          slidesPerView: 1,
          spaceBetween: 20,
          effect: "fade",
          loop: true,
          speed: 300,
          mousewheel: {
            invert: false
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
            dynamicBullets: true
          },
          // Navigation arrows
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
          }
        });
      }
    }).catch((error) => {
      console.error("\u8F09\u5165\u9B5A\u985E\u8CC7\u6599\u5931\u6557:", error);
    });
  });
})();
