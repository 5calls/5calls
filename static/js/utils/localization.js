const i18n = require('i18next');
const xhr = require('i18next-xhr-backend');
const constants = require('../constants');

module.exports = {
    start: (cachedUserLocale, cb) => {
        const options = {
            //'debug': true,
            'lng': cachedUserLocale,
            'backend': {
                'loadPath': constants.localization.loadPath
            },
            'fallbackLng': constants.localization.fallbackLocale
        }

        i18n.use(xhr)
            .init(options, cb);
    }
}