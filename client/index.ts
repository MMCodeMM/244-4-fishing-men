import { renderHeaderAndNav } from './sharedHeader';

document.addEventListener('DOMContentLoaded', () => {
  const onlyLogo = document.body.dataset.header === 'logo-only';
  renderHeaderAndNav(!onlyLogo);
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

