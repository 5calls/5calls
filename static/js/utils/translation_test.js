const i18n = require('i18next');
const t = require('./translation.js');
const chai = require('chai');
const expect = chai.expect;

describe('translation', () => {
  describe('getText', () => {
    describe('arguments', () => {
      it('should return the localized phrase in a span when no interpolation or pluraliation arguments are passed in the second, or options, argument', () => {
        let key = 'common.go';
        let expected = '<span>Go</span>';
        let result = t(key);
        expect(result.outerHTML).to.equal(expected);
      });

      it('should return the localized phrase when null is passed for the second, or options, argument', () => {
        let key = 'common.go';
        let expected = '<span>Go</span>';
        let result = t(key, null);
        expect(result.outerHTML).to.equal(expected);
      });

      it('should return the localized phrase when an empty object is passed for the second, or options, argument', () => {
        let key = 'common.go';
        let expected = '<span>Go</span>';
        let result = t(key, {});
        expect(result.outerHTML).to.equal(expected);
      });

      it('should return the localized phrase when properties that are not used are passed in the object for the second, or options, argument', () => {
        let key = 'common.go';
        let options = { notUsed: 1 };
        let expected = '<span>Go</span>';
        let result = t(key, options);
        expect(result.outerHTML).to.equal(expected);
      });

      it('should return the localized phrase in a "span" tag when third argument to getText() is missing', () => {
        let key = 'common.go';
        let expected = '<span>Go</span>';
        let result = t(key, null);
        expect(result.outerHTML).to.equal(expected);
      });

      it('should return the localized phrase in a "span" tag when third argument to getText() is false', () => {
        let key = 'common.go';
        let expected = '<span>Go</span>';
        let result = t(key, null, false);
        expect(result.outerHTML).to.equal(expected);
      });

      it('should not return the localized phrase in a "span" tag when third argument is true', () => {
        let key = 'common.go';
        let expected = 'Go';
        let result = t(key, null, true);
        expect(result).to.equal(expected);
      });

      it('should return the phrase in a "span" tag when fourth, "useDiv", argument is false', () => {
        let key = 'common.go';
        let expected = '<span>Go</span>';
        let result = t(key, null, false, false);
        expect(result.outerHTML).to.equal(expected);
      });

      it('should return the phrase in no tag when third argument(justText) is true and fourth(useDiv) argument is true', () => {
        let key = 'common.go';
        let expected = 'Go';
        let result = t(key, null, true, true);
        expect(result).to.equal(expected);
      });

      it('should return the phrase in a "div" tag when fourth, "useDiv", argument is true', () => {
        let key = 'common.go';
        let expected = '<div>Go</div>';
        let result = t(key, null, false, true);
        expect(result.outerHTML).to.equal(expected);
      });
    });

    describe('simple localization', () => {
      it('should return the english localized string when given the key', () => {
        let key = 'common.go';
        let expected = 'Go';
        let result = t(key, null, true);
        expect(result).to.equal(expected);
      });
    });

    describe('change locales', () => {
      it('should return the spanish localized string when the locale is changed to spanish', (done) => {
        i18n.changeLanguage('es', () => {
          let key = 'common.go';
          let expected = 'Vaya';
          let result = t(key, null, true);
          expect(result).to.equal(expected);
          // change the language back to english so the rest of the tests will be set for that language
          i18n.changeLanguage('en', () => {
            done();
          });
        });
      });
      it('should return the spanish localized string when the country is changed to spanish-mexican', (done) => {
        i18n.changeLanguage('es', () => {
          let key = 'common.go';
          let expected = 'Vaya';
          let result = t(key, null, true);
          expect(result).to.equal(expected);
          // change the language back to english so the rest of the tests will be set for that language
          i18n.changeLanguage('en', () => {
            done();
          });
        });
      });
      it('should return the english localized string when the locale is changed to one that is unsupported', (done) => {
        i18n.changeLanguage('na', () => {
          let key = 'common.go';
          let expected = 'Go';
          let result = t(key, null, true);
          expect(result).to.equal(expected);
          // change the language back to english so the rest of the tests will be set for that language
          i18n.changeLanguage('en', () => {
            done();
          });
        });
      });
    });

    describe('pluralization and interpolation', () => {
      it('should return the "1000 Calls" when given 1000 showing that we have not implement number formatting', () => {
        let key = 'common.callWithCount';
        let options = { 'count': 1000 };
        let expected = '1000 calls';
        let result = t(key, options, true);
        expect(result).to.equal(expected);
      });

      it('should return the singular version of person based on the option provided', () => {
        let key = 'common.person';
        let options = { count: 1 };
        let expected = 'person';
        let result = t(key, options, true);
        expect(result).to.equal(expected);
      });

      it('should return the plural version of person based on the option provided', () => {
        let key = 'common.person';
        let options = { count: 2 };
        let expected = 'people';
        let result = t(key, options, true);
        expect(result).to.equal(expected);
      });

      it('should return the singular version of person based on the option provided', () => {
        let key = 'outcomes.contactsLeft';
        let options = { contactsRemaining: 1 };
        let expected = 'person';
        let result = t(key, options, true);
        expect(result).to.contain(expected);
      });

      it('should return the pluralized version of person based on the option provided', () => {
        let key = 'outcomes.contactsLeft';
        let options = { contactsRemaining: 2 };
        let expected = 'people';
        let result = t(key, options, true);
        expect(result).to.contain(expected);
      });

      it('should return the pluralized version of person for "0" people', () => {
        let key = 'outcomes.contactsLeft';
        let options = { 'contactsRemaining': 0 };
        let expected = 'people';
        let result = t(key, options, true);
        expect(result).to.contain(expected);
      });
    });
  });
});



