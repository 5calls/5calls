const i18n = require('i18next');
const xhr = require('i18next-xhr-backend');
const constants = require('../constants');
const find = require('lodash/find');

module.exports = {
  start: (userLocale, cb) => {
    const options = {
      'lng': userLocale,
      'backend': {
        'loadPath': constants.localization.loadPath
      },
      'fallbackLng': constants.localization.fallbackLocale
    };
    i18n.use(xhr)
            .init(options, cb);
  },

    // Get the user's locale from the browserLanguage and the configured supported locales  
  getLocaleFromBrowserLanguage: (browserLanguage) => {
    if (!browserLanguage){
      return constants.localization.fallbackLocale;
    }

    let locale = find(constants.localization.supportedLocales, (l) => l === browserLanguage.substring(0,2));
    if (!locale){
      locale = constants.localization.fallbackLocale;
    }    

    return locale;
  }
};