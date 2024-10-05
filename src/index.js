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

const moveSearchToHeader = () => {
  // Find the search block
  const search = document.querySelector('#block-3aeb5464488ee9d68588');
  if (!search) return;
  // Move the block to be the first child of ".header-actions--right .showOnDesktop"
  const headerActions = document.querySelector(
    '.header-actions--right .showOnDesktop'
  );
  if (!headerActions) return;
  // If headerActions has children, insert before the first child, otherwise append
  if (headerActions.children.length > 0) {
    headerActions.insertBefore(search, headerActions.firstChild);
  } else {
    headerActions.appendChild(search);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // formatDates();
  // aspectRatioPolyfill();
  moveSearchToHeader();
  addQuoteCarousel();
});

window.addEventListener('load', () => {
  // addAnalytics();
});
