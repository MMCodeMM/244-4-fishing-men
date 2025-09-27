import { renderHeaderAndNav } from './sharedHeader';

document.addEventListener('DOMContentLoaded', () => {

  const onlyLogo = document.body.dataset.header === 'logo-only';
  renderHeaderAndNav(!onlyLogo);

  // 載入 fish.json 並隨機選取 5 筆資料顯示在 carousel
  fetch('/api/fish')
    .then(res => res.json())
    .then((fishList) => {
      // 隨機抽取 5 筆
      const shuffled = fishList.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);
      const carousel = document.getElementById('carousel');
      if (carousel) {
        carousel.innerHTML = selected.map(fish => `
          <div class="item">
            <img src="${fish.image}" alt="${fish.name}">
            <h3 class="name">${fish.name}</h3>
          </div>
        `).join('');
      }
    });
});

let carousel = document.querySelector('#carousel') as HTMLElement;

let sliderRadios = document.querySelectorAll<HTMLInputElement>('.slider-radio')

sliderRadios.forEach((radio, index) => {
  function check() {
    if (radio.checked) {
      carousel.style.setProperty('--position', String(index + 1))
    }
  }

  radio.addEventListener('change', check)
  check()
})

