// string formatting utilities

module.exports = {
  asNumber: (maybeNumber) => {
    let number = Number(maybeNumber);
    // Handle undefined input.
    // Number(undefined) is NaN, while Number("") is 0
    return isNaN(number) ? 0 : number;    
  },

  prettyCount: (unformattedNumber) => {
    let number = module.exports.asNumber(unformattedNumber);
    // Number.toLocaleString() doesn't work on Safari 9 (see https://github.com/5calls/5calls/issues/197)
    if (window.Intl && typeof Intl.NumberFormat == 'function') {
      return number.toLocaleString();
    } else {
      // As a fallback, use a quick-and-dirty regex to insert commas.
      // When in doubt, get code from stackoverflow: http://stackoverflow.com/a/2901298/7542666
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
};