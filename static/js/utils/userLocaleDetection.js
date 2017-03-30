// Get the user's locale.  
// If the user's locale is not supported, we fall back to "en"
// Currently, the supported locales are hardcoded.
//  Shall we check the back end for supported locales? or keep a config file in the front end?

const find = require('lodash/find');
const constants = require('../constants');

function getLocaleFromBrowserLanguage(browserLanguage) {
    if (!browserLanguage){
        return constants.localization.fallbackLocale;
    }

    let locale = find(constants.localization.supportedLocales, (l) => l === browserLanguage.substring(0,2))
    if (!locale){
        locale = constants.localization.fallbackLocale;
    }    

    return locale;
}

module.exports = getLocaleFromBrowserLanguage;