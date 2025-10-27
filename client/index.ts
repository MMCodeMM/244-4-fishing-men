import { renderHeaderAndNav } from './sharedHeader';

declare const Swiper: any;

document.addEventListener('DOMContentLoaded', () => {
  const onlyLogo = document.body.dataset.header === 'logo-only';
  renderHeaderAndNav(!onlyLogo);

  // 載入 fish.json 並隨機選取 5 筆資料顯示在 Swiper
  fetch('/api/fish')
    .then(res => res.json())
    .then((fishList: any[]) => {
      // 隨機抽取 5 筆
      const shuffled = fishList.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);
      const swiperWrapper = document.getElementById('fish-swiper-wrapper');
      
      if (swiperWrapper) {
        swiperWrapper.innerHTML = selected.map((fish: any) => `
          <div class="slider-item swiper-slide">
            <div class="slider-image-wrapper">
              <img class="slider-image" src="${fish.image}" alt="${fish.name}">
            </div>
            <div class="slider-item-content">
              <h1>${fish.name}</h1>
              <p>${fish.description || '精美的海洋魚類，值得您細細品味和了解。'}</p>
            </div>
          </div>
        `).join('');
        
        // 初始化 Swiper
        const swiper = new Swiper('.swiper-container', {
          slidesPerView: 1,
          spaceBetween: 20,
          effect: 'fade',
          loop: true,
          speed: 300,
          mousewheel: {
            invert: false,
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
          },
          // Navigation arrows
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }
        });
      }
    })
    .catch(error => {
      console.error('載入魚類資料失敗:', error);
    });
});

