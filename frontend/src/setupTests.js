import '@testing-library/jest-dom';

// JSDOM mocks for browser methods not implemented in JSDOM
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = function() {};
  window.HTMLElement.prototype.scrollTo = function() {};
  window.scrollTo = function() {};
}
