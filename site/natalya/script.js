document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
  
    if (burger && mobileMenu) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('is-active');
        mobileMenu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', mobileMenu.classList.contains('is-open') ? 'true' : 'false');
      });
  
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          burger.classList.remove('is-active');
          mobileMenu.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
  
      window.addEventListener('resize', () => {
        if (window.innerWidth > 1200) {
          burger.classList.remove('is-active');
          mobileMenu.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });