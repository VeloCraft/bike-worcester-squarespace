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
                <figcaption class="source">— ${author}</figcaption>
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
    desktop: document.querySelector('.header-actions--right .showOnDesktop'),
    mobile: document.querySelector('.header-actions--right .showOnMobile'),
  };
  const searchLink = document.createElement('a');
  searchLink.href = '/search';
  searchLink.className = 'search-link';
  const img = document.createElement('img');
  img.src =
    'https://assets.squarespace.com/universal/images-v6/icons/icon-searchqueries-32-light.png';
  img.alt = 'search icon';
  searchLink.appendChild(img);
  const searchLinkClone = searchLink.cloneNode(true);
  headerActions.desktop.appendChild(searchLink);
  headerActions.mobile.appendChild(searchLinkClone);
};

const addHeaderCarousel = () => {
  const headerSections = document.querySelectorAll(
    '.page-section .slide-contents'
  );
  if (!headerSections.length) return;
  const wrapper = document.createElement('div');
  document.getElementById('sections').appendChild(wrapper);
  headerSections.forEach((section, index) => {
    const headerCarousel = section.closest('.page-section');
    if (!headerCarousel) return;
    if (index === 0) {
      wrapper.style = headerCarousel.style;
      console.log(headerCarousel.style);
    }
    headerCarousel.style =
      'margin-right:16px;width:100vw;padding-top:0 !important;';
    wrapper.appendChild(headerCarousel);
  });
  new Flickity(wrapper, {
    wrapAround: true,
    autoPlay: 5000,
  });
};

document.addEventListener('DOMContentLoaded', () => {
  addHeaderCarousel();
  addSearchToHeader();
  addQuoteCarousel();
});

window.addEventListener('load', () => {});
