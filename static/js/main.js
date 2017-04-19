/* global ga */

const choo = require('choo');
const http = require('xhr');
const find = require('lodash/find');
const logger = require('loglevel');
const queryString = require('query-string');
const store = require('./utils/localstorage.js');
const localization = require('./utils/localization');
const scrollIntoView = require('./utils/scrollIntoView.js');

const app = choo();
const appURL = 'https://5calls.org';
// const appURL = 'http://localhost:8090';

// use localStorage directly to set this value *before* bootstrapping the app.
const debug = (localStorage['org.5calls.debug'] === 'true');

if (debug) {
  // we don't need loglevel's built-in persistence; we do it ourselves above ^
  logger.setLevel(logger.levels.TRACE, false);
}

// get the stored zip location
let cachedAddress = '';
store.getAll('org.5calls.location', (location) => {
  if (location.length > 0) {
   cachedAddress = location[0]
  }
});

// get the stored geo location
let cachedGeo = '';
store.getAll('org.5calls.geolocation', (geo) => {
  if (geo.length > 0) {
    logger.debug("geo get", geo[0]);
    cachedGeo = geo[0]
  }
});

let cachedFetchingLocation = (cachedGeo === '') ? true : false;

// get the stored geo location
let cachedAllowBrowserGeo = true;
store.getAll('org.5calls.allow_geolocation', (allowGeo) => {
  if (allowGeo.length > 0) {
    logger.debug("allowGeo get", allowGeo[0]);
    cachedAllowBrowserGeo = allowGeo[0]
  }
});

let cachedLocationFetchType = (cachedAllowBrowserGeo) ? 'browserGeolocation' : 'ipAddress';

// get the time the geo was last fetched
let cachedGeoTime = '';
store.getAll('org.5calls.geolocation_time', (geo) => {
  if (geo.length > 0) {
    logger.debug("geo time get", geo[0]);
    cachedGeoTime = geo[0]
  }
});

let cachedCity = '';
store.getAll('org.5calls.geolocation_city', (city) => {
  if (city.length > 0) {
    logger.debug("city get", city[0]);
    cachedCity = city[0]
  }
});

cachedFetchingLocation  = (cachedCity !== '') ? true : cachedFetchingLocation;
cachedLocationFetchType = (cachedAddress !== '') ? 'address' : cachedLocationFetchType;

// get the stored completed issues
let completedIssues = [];
store.getAll('org.5calls.completed', (completed) => {
  completedIssues = completed == null ? [] : completed;
});

let cachedUserLocale = '';
store.getAll('org.5calls.userlocale', (userLocale) => {
  if (userLocale.length > 0) {
    logger.debug("user locale get", userLocale[0]);
    cachedUserLocale = userLocale[0];
  } else {
    cachedUserLocale = localization.getLocaleFromBrowserLanguage(navigator.language || navigator.userLanguage);
    store.add('org.5calls.userlocale', cachedUserLocale, () => {});
  }
});

// get stored user stats
const defaultStats = {
  all: [],
  contacted: 0,
  vm: 0,
  unavailable: 0,
};
let localStats = defaultStats;
store.getAll('org.5calls.userStats', (stats) => {
  if (stats.length > 0) {
    localStats = stats[0];
  } else {
    let impactLink = document.querySelector('#impact__link');
    impactLink.classList.add('hidden');
  }
});

app.model({
  state: {
    // remote data
    issues: [],
    activeIssues: [],
    inactiveIssues: [],
    totalCalls: 0,
    splitDistrict: false,

    // manual input address
    address: cachedAddress,

    // automatically geolocating
    geolocation: cachedGeo,
    geoCacheTime: cachedGeoTime,
    allowBrowserGeo: cachedAllowBrowserGeo,
    cachedCity: cachedCity,

    // local user stats
    userStats: localStats,

    // view state
    // getInfo: false,
    // activeIssue: false,
    // completeIssue: false,
    askingLocation: false,
    fetchingLocation: cachedFetchingLocation,
    validatingLocation: false,
    locationFetchType: cachedLocationFetchType,
    contactIndices: {},
    completedIssues: completedIssues,

    showFieldOfficeNumbers: false,

    debug: debug,
  },

  reducers: {
    receiveActiveIssues: (state, data) => {
      const response = JSON.parse(data)
      return {
        activeIssues: response.issues,
        splitDistrict: response.splitDistrict,
        invalidAddress: response.invalidAddress,
        validatingLocation: false
      }
    },
    receiveInactiveIssues: (state, data) => {
      const response = JSON.parse(data)
      return {
        inactiveIssues: response.issues,
      }
    },
    mergeIssues: (state) => {
      let issues = state.activeIssues.concat(state.inactiveIssues)
      let contactIndices = state.contactIndices
      issues.forEach(issue => {
        contactIndices[issue.id] = contactIndices[issue.id] || 0;
      })
      return {
        issues,
        contactIndices,
      }
    },
    receiveTotals: (state, data) => {
      const totals = JSON.parse(data);
      return { totalCalls: totals.count }
    },
    receiveIPInfoLoc: (state, data) => {
      const geo = data.loc
      const city = data.city
      const time = new Date().valueOf()
      store.replace("org.5calls.geolocation", 0, geo, () => {});
      store.replace("org.5calls.geolocation_city", 0, city, () => {});
      store.replace("org.5calls.geolocation_time", 0, time, () => {});
      return { geolocation: geo, cachedCity: city, geoCacheTime: time, fetchingLocation: false, askingLocation: false }
    },
    setContactIndices: (state, data) => {
      let contactIndices = state.contactIndices;
      if (data.newIndex != 0) {
        contactIndices[data.issueid] = data.newIndex;
        return { contactIndices: contactIndices }
      } else {
        contactIndices[data.issueid] = 0;
        return { contactIndices: contactIndices, completedIssues: state.completedIssues.concat(data.issueid) }
      }
    },
    setUserStats: (state, data) => {
      let stats = state.userStats;
      stats['all'].push({
        contactid: data.contactid,
        issueid: data.issueid,
        result: data.result,
        time: new Date().valueOf()
      });
      stats[data.result] = stats[data.result] + 1;
      store.replace("org.5calls.userStats", 0, stats, () => {});
      return { userStats: stats }
    },
    setAddress: (state, address) => {
      store.replace("org.5calls.location", 0, address, () => {});

      return { address: address, askingLocation: false, validatingLocation: true }
    },
    setGeolocation: (state, data) => {
      store.replace("org.5calls.geolocation", 0, data, () => {});
      return { geolocation: data, fetchingLocation: false }
    },
    setCachedCity: (state, data) => {
      const response = JSON.parse(data);
      if (response.normalizedLocation && state.cachedCity == '') {
        store.replace("org.5calls.geolocation_city", 0, response.normalizedLocation, () => {});
        return { cachedCity: response.normalizedLocation }
      } else {
        return null
      }
    },
    fetchingLocation: (state, data) => {
      return { fetchingLocation: data }
    },
    allowBrowserGeolocation: (state, data) => {
      store.replace("org.5calls.allow_geolocation", 0, data, () => {})
      return { allowBrowserGeo: data }
    },
    enterLocation: () => {
      return { askingLocation: true }
    },
    setLocationFetchType: (state, data) => {
      let askingLocation = (data === 'address');
      return { locationFetchType: data, askingLocation: askingLocation, fetchingLocation: !askingLocation }
    },
    resetLocation: () => {
      store.remove("org.5calls.location", () => {});
      store.remove("org.5calls.geolocation", () => {});
      store.remove("org.5calls.geolocation_city", () => {});
      store.remove("org.5calls.geolocation_time", () => {});
      return { address: '', geolocation: '', cachedCity: '', geoCacheTime: '' }
    },
    resetCompletedIssues: () => {
      store.remove("org.5calls.completed", () => {});
      return { completedIssues: [] }
    },
    resetUserStats: () => {
      store.replace("org.5calls.userStats", 0, defaultStats, () => {});
      return { userStats: defaultStats }
    },
    home: () => {
      return { activeIssue: false, getInfo: false }
    },
    toggleFieldOfficeNumbers: (state) => ({ showFieldOfficeNumbers: !state.showFieldOfficeNumbers }),
    hideFieldOfficeNumbers: () => ({ showFieldOfficeNumbers: false }),
    setCacheDate: (state, data) => ({ [data]: Date.now() })
  },

  effects: {
    fetchActiveIssues: (state, data, send, done) => {
      let address = "?address="
      if (state.address !== '') {
        address += state.address
      } else if (state.geolocation !== "") {
        address += state.geolocation
      }
      const issueURL = appURL+'/issues/'+address
      logger.debug("fetching url", issueURL);
      http(issueURL, (err, res, body) => {
        send('setCachedCity', body, done)
        send('receiveActiveIssues', body, done)
        send('mergeIssues', body, done)
      })
    },
    fetchInactiveIssues: (state, data, send, done) => {
      let address = "?inactive=true&address="
      if (state.address !== '') {
        address += state.address
      } else if (state.geolocation !== "") {
        address += state.geolocation
      }
      const issueURL = appURL+'/issues/'+address
      logger.debug("fetching url", issueURL);
      http(issueURL, (err, res, body) => {
        send('receiveInactiveIssues', body, done)
        send('mergeIssues', body, done)
      })
    },
    getTotals: (state, data, send, done) => {
      http(appURL+'/report/', (err, res, body) => {
        send('receiveTotals', body, done)
      })
    },
    setLocation: (state, data, send, done) => {
      send('setAddress', data, done);
      send('fetchActiveIssues', {}, done);
    },
    setBrowserGeolocation: (state, data, send, done) => {
      send('setGeolocation', data, done);
      send('fetchActiveIssues', {}, done);
    },
    unsetLocation: (state, data, send, done) => {
      send('resetLocation', data, done)
      send('startup', data, done)
    },
    fetchLocationBy: (state, data, send, done) => {
      send('setLocationFetchType', data, done)
      send('startup', data, done)
    },
    fetchLocationByIP: (state, data, send, done) => {
      http('https://ipinfo.io/json', (err, res, body) => {
        if (res.statusCode == 200) {
          try {
            const response = JSON.parse(body)
            if (response.city != "") {
              send('receiveIPInfoLoc', response, done);
              send('fetchActiveIssues', {}, done);
            } else {
              send('fetchLocationBy', 'address', done);
            }
          } catch(e) {
            send('fetchLocationBy', 'address', done);
          }

        } else {
          send('fetchLocationBy', 'address', done);
        }
      })
    },
    handleBrowserLocationError: (state, data, send, done) => {
      // data = error from navigator.geolocation.getCurrentPosition
      if (data.code === 1) {
        send('allowBrowserGeolocation', false, done);
      }
      if (state.geolocation == '') {
        send('fetchLocationBy', 'ipAddress', done);
      }
    },
    fetchLocationByBrowswer: (state, data, send, done) => {
      let geoSuccess = function(position) {
        window.clearTimeout(slowResponseTimeout);
        if (typeof position.coords !== 'undefined') {
          let lat = position.coords.latitude;
          let long = position.coords.longitude;

          if (lat && long) {
            let geo = Math.floor(lat*10000)/10000 + ',' + Math.floor(long*10000)/10000;
            send('allowBrowserGeolocation', true, done);
            send('setBrowserGeolocation', geo, done);
          } else {
            logger.warn("Error: bad browser location results");
            send('fetchLocationBy', 'ipAddress', done);
          }
        } else {
          logger.warn("Error: bad browser location results");
          send('fetchLocationBy', 'ipAddress', done);
        }
      }
      let geoError = function(error) {
        window.clearTimeout(slowResponseTimeout);

         // We need the most current state, so we need another effect call.
        send('handleBrowserLocationError', error, done)
        logger.warn("Error with browser location (code: " + error.code + ")");
      }
      let handleSlowResponse = function() {
        send('fetchLocationBy', 'ipAddress', done);
      }
      // If necessary, this prompts a permission dialog in the browser.
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

      // Sometimes, the user ignores the prompt or the browser does not
      // provide a response when they do not permit browser location.
      // After 5s, try IP-based location, but let browser-based continue.
      let slowResponseTimeout = window.setTimeout(handleSlowResponse, 5000);
    },
    // If appropriate, focus and select the text for the location input element
    // in the issuesLocation component.
    focusLocation: (state, data, send, done) => {
      let addressElement = document.querySelector('#address')
      addressElement.focus();
      //feedback message above form should also be visible
      let addressLabel = document.querySelector("#locationMessage");
      scrollIntoView(addressLabel);
      // Clear previous address to show placeholder text to
      // reinforce entering a new one.
      addressElement.value = "";
      done();
    },
    startup: (state, data, send, done) => {
      // sometimes we trigger this again when reloading mainView, check for issues
      if (state.activeIssues.length == 0 || state.geolocation == '') {
        // Check for browser support of geolocation
        if ((state.allowBrowserGeo !== false && navigator.geolocation) &&
          state.locationFetchType === 'browserGeolocation' && state.geolocation == '') {
          send('fetchLocationByBrowswer', {}, done);
        }
        else if (state.locationFetchType === 'ipAddress' && state.geolocation == '') {
          send('fetchLocationByIP', {}, done);
        }
        else if (state.address !== '' || state.geolocation !== '') {
          send('fetchingLocation', false, done);
          send('fetchActiveIssues', {}, done);
        }
      }
    },
    oldcall: (state, data, send, done) => {
      ga('send', 'event', 'issue_flow', 'old', 'old');
      done();
    },
    incrementContact: (state, data, send, done) => {
      const issue = find(state.issues, ['id', data.issueid]);

      const currentIndex = state.contactIndices[issue.id];
      if (currentIndex < issue.contacts.length - 1) {
        scrollIntoView(document.querySelector('#contact'));
        send('setContactIndices', { newIndex: currentIndex + 1, issueid: issue.id }, done);
      } else {
        scrollIntoView(document.querySelector('#content'));
        store.add("org.5calls.completed", issue.id, () => {})
        send('location:set', "/done/" + issue.id, done)
        send('setContactIndices', { newIndex: 0, issueid: issue.id }, done);
      }
    },
    callComplete: (state, data, send, done) => {
      send('hideFieldOfficeNumbers', data, done);

      if (data.result == 'unavailable') {
        ga('send', 'event', 'call_result', 'unavailable', 'unavailable');
      } else {
        ga('send', 'event', 'call_result', 'success', data.result);
      }

      send('setUserStats', data, done);

      // This parameter will indicate to the backend api where this call report came from
      // A value of test indicates that it did not come from the production environment
      const viaParameter = window.location.host === '5calls.org' ? 'web' : 'test';

      const body = queryString.stringify({ location: state.zip, result: data.result, contactid: data.contactid, issueid: data.issueid, via: viaParameter })
      http.post(appURL+'/report', { body: body, headers: {"Content-Type": "application/x-www-form-urlencoded"} }, () => {
        // don’t really care about the result
      })
      send('incrementContact', data, done);
    },
    skipCall: (state, data, send, done) => {
      send('hideFieldOfficeNumbers', data, done);

      ga('send', 'event', 'call_result', 'skip', 'skip');

      send('incrementContact', data, done);
    },
    trackSwitchIssue: (state, data, send, done) => {
      send('hideFieldOfficeNumbers', data, done);

      ga('send', 'event', 'issue_flow', 'select', 'select');

      scrollIntoView(document.querySelector('#content'));
    }
  },
});

app.router({ default: '/' }, [
  ['/', require('./pages/mainView.js')],
  ['/issue', require('./pages/mainView.js'),
    [':issueid', require('./pages/mainView.js')]
  ],
  ['/done', require('./pages/doneView.js'),
    [':issueid', require('./pages/doneView.js')]
  ],
  ['/about', require('./pages/aboutView.js')],
  ['/impact', require('./pages/impactView.js')],
  ['/more', require('./pages/issuesView.js')],
]);

let startApp = (err) => {  
  // If we errored on initializing localization, then we won't have the
  // right content for most of the app. For now, just fallback to the default index.html in that case.
  if (err !== undefined) {
    return;
  }
  
  const tree = app.start();
  const rootNode = document.getElementById('root');

  if (rootNode != null) {
    document.body.replaceChild(tree, rootNode);
  }
}

// need to initialize the localization engine/cache before bootstrapping the app's rendering process
// The app's startApp method will be called as the callback after the initialization has taken place.
localization.start(cachedUserLocale, startApp);