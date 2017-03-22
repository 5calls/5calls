require('raf').polyfill();
require('smoothscroll-polyfill').polyfill();

// Uses window scroll instead of element.scrollIntoView
function scrollIntoView (element) {
  if (element){
    const scrollY = element.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
    window.scroll({ top: scrollY, left: 0, behavior: 'smooth' });
  }
}

// smoothscroll wrapper
module.exports = scrollIntoView;