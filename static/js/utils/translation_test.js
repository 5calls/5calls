const t = require('./translation.js');
const chai = require('chai');
const expect = chai.expect;

describe('translation', () => {
  describe('arguments to getText method', () => {
    it('should return the localized phrase in a span when no interpolation or pluraliation arguments are passed in the second, or options, argument', () => {
      let key = 'common.reset';
      let expected = '<span>reset</span>';
      let result = t.getText(key);
      expect(result.outerHTML).to.equal(expected);
    });

    it('should return the localized phrase when null is passed for the second, or options, argument', () => {
      let key = 'common.reset';
      let expected = '<span>reset</span>';
      let result = t.getText(key, null);
      expect(result.outerHTML).to.equal(expected);
    });

    it('should return the localized phrase when an empty object is passed for the second, or options, argument', () => {
      let key = 'common.reset';
      let expected = '<span>reset</span>';
      let result = t.getText(key, {});
      expect(result.outerHTML).to.equal(expected);
    });

    it('should return the localized phrase when properties that are not used are passed in the object for the second, or options, argument', () => {
      let key = 'common.reset';
      let options = { notUsed: 1 };
      let expected = '<span>reset</span>';
      let result = t.getText(key, options);
      expect(result.outerHTML).to.equal(expected);
    });

    it('should return the localized phrase in a "span" tag when third argument to getText() is missing', () => {
      let key = 'common.reset';
      let expected = '<span>reset</span>';
      let result = t.getText(key, null);
      expect(result.outerHTML).to.equal(expected);
    });

    it('should return the phrase in a "span" tag when third argument to getText() is missing', () => {
      let key = 'common.reset';
      let expected = '<span>reset</span>';
      let result = t.getText(key, null, false);
      expect(result.outerHTML).to.equal(expected);
    });

    it('should not return the phrase in a "span" tag when third argument is true', () => {
      let key = 'common.reset';
      let expected = 'reset';
      let result = t.getText(key, null, true);
      expect(result).to.equal(expected);
    });

    it('should return the phrase in a "span" tag when fourth, "useDiv", argument is false', () => {
      let key = 'common.reset';
      let expected = '<span>reset</span>';
      let result = t.getText(key, null, false, false);
      expect(result.outerHTML).to.equal(expected);
    });

    it('should return the phrase in no tag when third argument(justText) is true and fourth(useDiv) argument is true', () => {
      let key = 'common.reset';
      let expected = 'reset';
      let result = t.getText(key, null, true, true);
      expect(result).to.equal(expected);
    });

    it('should return the phrase in a "div" tag when fourth, "useDiv", argument is true', () => {
      let key = 'common.reset';
      let expected = '<div>reset</div>';
      let result = t.getText(key, null, false, true);
      expect(result.outerHTML).to.equal(expected);
    });
  });

  describe('simple localization', () => {
    it('should return the english localized string when given the key', () => {
      let key = 'common.reset';
      let expected = 'reset';
      let result = t.getText(key, null, true);
      expect(result).to.equal(expected);
    });
  });

  describe('pluralization and interpolation', () => {
    it('should return the "1000 Calls" when given 1000 showing that we have not implement number formatting', () => {
      let key = 'common.callWithCount';
      let options = { 'count': 1000 };
      let expected = '1000 calls';
      let result = t.getText(key, options, true);
      expect(result).to.equal(expected);
    });

    it('should return the singular version of person based on the option provided', () => {
      let key = 'common.person';
      let options = { count: 1 };
      let expected = 'person';
      let result = t.getText(key, options, true);
      expect(result).to.equal(expected);
    });

    it('should return the plural version of person based on the option provided', () => {
      let key = 'common.person';
      let options = { count: 2 };
      let expected = 'people';
      let result = t.getText(key, options, true);
      expect(result).to.equal(expected);
    });

    it('should return the singular version of person based on the option provided', () => {
      let key = 'outcomes.contactsLeft';
      let options = { contactsRemaining: 1 };
      let expected = 'person';
      let result = t.getText(key, options, true);
      expect(result).to.contain(expected);
    });

    it('should return the pluralized version of person based on the option provided', () => {
      let key = 'outcomes.contactsLeft';
      let options = { contactsRemaining: 2 };
      let expected = 'people';
      let result = t.getText(key, options, true);
      expect(result).to.contain(expected);
    });

    it('should return the pluralized version of person for "0" people', () => {
      let key = 'outcomes.contactsLeft';
      let options = { 'contactsRemaining': 0 };
      let expected = 'people';
      let result = t.getText(key, options, true);
      expect(result).to.contain(expected);
    });
  });

  describe('when calling the getLocaleFromBrowserLanguage method', () => {
    it('with an undefined argument, should get "en" locale', () => {
      let lang = undefined;
      let expected = 'en';
      let result = t.getLocaleFromBrowserLanguage(lang);
      expect(result).to.equal(expected);
    });

    it('with an unsupported language, should get "en" locale', () => {
      let lang = 'na';
      let expected = 'en';
      let result = t.getLocaleFromBrowserLanguage(lang);
      expect(result).to.equal(expected);
    });

    it('with a country within a supported locale, should get the supported locale', () => {
      let lang = 'es-mx';
      let expected = 'es';
      let result = t.getLocaleFromBrowserLanguage(lang);
      expect(result).to.equal(expected);
    });

    it('with a supported locale, should get the supported locale', () => {
      let lang = 'es';
      let expected = 'es';
      let result = t.getLocaleFromBrowserLanguage(lang);
      expect(result).to.equal(expected);
    });
  });

});



