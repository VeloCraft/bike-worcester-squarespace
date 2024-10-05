import Flickity from 'flickity';
import quotes from './quotes';
// import cookies from 'js-cookie';

/*
const loadScript = (src, onLoad, async) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  if (onLoad) script.addEventListener('load', onLoad);
  if (async) script.setAttribute('async', true);
  script.src = src;
  document.getElementsByTagName('head')[0].appendChild(script);
};

const updateDateElement = (elem, date) => {
  const dateFormat = { year: '2-digit', month: 'short', day: 'numeric' };
  const newFormat = date.toLocaleDateString(undefined, dateFormat);
  elem.textContent = newFormat;
};

*/
/*
const formatDates = () => {
  const dateMeta = document.querySelector('[itemprop=datePublished]');
  if (dateMeta != null) {
    //Handle blog post date
    const publishedDate = new Date(dateMeta.content);
    const timeEle = document.querySelector('time');
    const dateElem = timeEle.querySelector('span');
    updateDateElement(dateElem, publishedDate);
    timeEle.className += ' formatted-date';
  }
};
*/

/*
const addAnalytics = () => {
  const measurementId = 'G-QKMQTXTBJG';
  loadScript(
    `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
    null,
    true,
  );
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', measurementId);
  window[`ga-disable-${measurementId}`] =
    cookies.get('ss_cookieAllowed') !== 'true';
  const button = document.querySelector('.sqs-cookie-banner-v2-accept');
  if (button) {
    button.addEventListener('click', () => {
      window[`ga-disable-${measurementId}`] = false;
    });
  }
};
*/

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

document.addEventListener('DOMContentLoaded', () => {
  // formatDates();
  // aspectRatioPolyfill();
  addSearchToHeader();
  addQuoteCarousel();
});

window.addEventListener('load', () => {
  // addAnalytics();
});
