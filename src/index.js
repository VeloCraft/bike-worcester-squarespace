import './index.css';
import Flickity from 'flickity';
import quotes from './quotes';

const addQuoteCarousel = () => {
  document
    .querySelectorAll('section.bikeworcester-quotes')
    .forEach((quoteSection) => {
      // Check if 'data-category' is set
      const category = quoteSection.getAttribute('data-category');
      if (!category) return;
      const quoteList = quotes[category];
      if (!quoteList) return;
      const carousel = document.createElement('div');
      carousel.className = 'main-carousel';
      carousel.innerHTML = quoteList
        .map(
          ({ quote, author }) => `
            <div class="carousel-cell">
              <figure data-author-name="kim" class="sqs-block-quote block-animation-site-default">
                <blockquote data-animation-role="quote">
                  <span>“</span>${quote}<span>”</span>
                </blockquote>
                ${author ? `<figcaption class="source">— ${author}</figcaption>` : ''}
              </figure>
            </div>
          `
        )
        .join('');
      quoteSection.appendChild(carousel);
      new Flickity(carousel, {
        cellAlign: 'left',
        contain: true,
        wrapAround: true,
        prevNextButtons: false,
        autoPlay: 5000,
      });
    });
};

const addSearchToHeader = () => {
  const headerActions = {
    desktop: document.querySelector('.header-display-desktop .header-actions'),
    mobile: document.querySelector('.header-display-mobile .header-burger'),
  };
  const searchLink = document.createElement('a');
  searchLink.href = '/search';
  const img = document.createElement('img');
  img.src =
    'https://assets.squarespace.com/universal/images-v6/icons/icon-searchqueries-32-light.png';
  img.alt = 'search icon';
  searchLink.appendChild(img);
  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'search-link';
  searchWrapper.appendChild(searchLink);
  const searchWrapperClone = searchWrapper.cloneNode(true);
  headerActions.desktop.prepend(searchWrapper);
  headerActions.mobile.prepend(searchWrapperClone);
};

const addMegaMenu = () => {
  if (window.self !== window.top) return;
  const isMobile = window.matchMedia('(max-width: 799px)').matches;
  if (isMobile) return;
  const container = document.querySelector(
    '.header-display-desktop .search-link'
  );
  if (!container) return;
  const menuElement = document.querySelector(
    '[data-section-id="673746954d70e03ea1eed9de"]'
  );
  if (!menuElement) return;
  menuElement.setAttribute('id', 'mega-menu');
  container.addEventListener('mouseenter', () => {
    menuElement.classList.toggle('visible');
  });
  container.addEventListener('mouseleave', () => {
    menuElement.classList.remove('visible');
  });
  container.prepend(menuElement);
};

const addHeaderCarousel = () => {
  if (window.self !== window.top) return;
  const headerSections = document.querySelectorAll(
    '.page-section .slide-contents'
  );
  if (!headerSections.length) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'header-carousel';
  document.getElementById('sections').prepend(wrapper);
  headerSections.forEach((section, index) => {
    const headerCarousel = section.closest('.page-section');
    if (!headerCarousel) return;
    if (index === 0) {
      wrapper.setAttribute('style', headerCarousel.getAttribute('style'));
    }
    headerCarousel.setAttribute('style', 'margin-right:16px;width:100vw;');
    wrapper.appendChild(headerCarousel);
  });
  new Flickity(wrapper, {
    fade:
      window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
      window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true,
    wrapAround: true,
    autoPlay: 5000,
    pauseAutoPlayOnHover: true,
    pageDots: true,
    prevNextButtons: false,
  });
};

document.addEventListener('DOMContentLoaded', () => {
  addHeaderCarousel();
  addSearchToHeader();
  addQuoteCarousel();
  addMegaMenu();
});

window.addEventListener('load', () => {});
