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

document.addEventListener('DOMContentLoaded', () => {
  // formatDates();
  // aspectRatioPolyfill();
});

window.addEventListener('load', () => {
  // addAnalytics();
});
