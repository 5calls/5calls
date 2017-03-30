const userLocaleDetection = require('./userLocaleDetection.js');
const chai = require('chai');
const expect = chai.expect;

describe('userLocaleDetection', () => {
  describe('getLocaleFromBrowserLanguage', () => {
    it('should get "en" locale when an undefined argument is passed', () => {
      let lang = undefined;
      let expected = 'en';
      let result = userLocaleDetection(lang);
      expect(result).to.equal(expected);
    });

    it('should get "en" locale when an unsupported language is passed', () => {
      let lang = 'na';
      let expected = 'en';
      let result = userLocaleDetection(lang);
      expect(result).to.equal(expected);
    });

    it('should get the supported locale when a country within a supported locale is passed', () => {
      let lang = 'es-mx';
      let expected = 'es';
      let result = userLocaleDetection(lang);
      expect(result).to.equal(expected);
    });

    it('should get the supported locale when the supported locale is passed', () => {
      let lang = 'es';
      let expected = 'es';
      let result = userLocaleDetection(lang);
      expect(result).to.equal(expected);
    });
  });
});



