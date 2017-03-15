/**
 * Setup script for unit testing. Any configuration specific to test
 * environments should be included here.
 */

const logger = require('loglevel');
logger.setLevel(logger.levels.TRACE, false);

// initialize i18n cache
const i18n = require('i18next');
const en = require('../locales/en.json');
const es = require('../locales/es.json');

// put the locale into the correct namespace for the i18n cache.
// Because we are adding it to the cache manually, we have to give it the hierarchy manually
const namespacedLocaleObject = {
    "en": {
        "translation": en
    },
    "es": {
        "translation": es
    }
}

const options = {
    // turn on this flag to see if you're localization keys are not correct.  It will log a message
    'debug': true,
    // the localized data, adding directly to the cache
    'resources': namespacedLocaleObject,
    // the language we're using for all of the regular tests.
    // There are some tests specific to localization where we reload the cache with another locale, at that point we re-initialize 
    'lng': 'en'
}

// initialize the i18n cache
i18n.init(options);
