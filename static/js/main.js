const choo = require('choo');
const html = require('choo/html');
const http = require('xhr');
const find = require('lodash/find');
const queryString = require('query-string');
const store = require('./utils/localstorage.js');
const scrollIntoView = require('scroll-into-view');

const app = choo();
const appURL = 'https://5calls.org';
const debug = false;
// const appURL = 'http://localhost:8090';

// get the stored zip location
cachedAddress = '';
store.getAll('org.5calls.location', (location) => {
  if (location.length > 0) {
   cachedAddress = location[0]
  }
});

// get the stored geo location
cachedGeo = '';
store.getAll('org.5calls.geolocation', (geo) => {
  if (geo.length > 0) {
    console.log("geo get",geo[0]);
    cachedGeo = geo[0]
  }
});

// get the time the geo was last fetched
cachedGeoTime = '';
store.getAll('org.5calls.geolocation_time', (geo) => {
  if (geo.length > 0) {
    console.log("geo time get",geo[0]);
    cachedGeoTime = geo[0]
  }
});

cachedCity = '';
store.getAll('org.5calls.geolocation_city', (city) => {
  if (city.length > 0) {
    console.log("city get",city[0]);
    cachedCity = city[0]
  }
});

// get the stored completed issues
completedIssues = [];
store.getAll('org.5calls.completed', (completed) => {
  completedIssues = completed == null ? [] : completed;
});

app.model({
  state: {
    // remote data
    issues: [],
    totalCalls: 0,
    splitDistrict: false,

    // manual input address
    address: cachedAddress,

    // automatically geolocating
    geolocation: cachedGeo,
    geoCacheTime: cachedGeoTime,
    cachedCity: cachedCity,

    // view state
    // getInfo: false,
    // activeIssue: false,
    // completeIssue: false,
    askingLocation: false,
    contactIndex: 0,
    completedIssues: completedIssues,

    debug: debug,
  },

  reducers: {
    receiveIssues: (state, data) => {
      response = JSON.parse(data)
      issues = response.issues //.filter((v) => { return v.contacts.length > 0 });
      return { issues: issues, splitDistrict: response.splitDistrict }
    },
    receiveTotals: (state, data) => {
      totals = JSON.parse(data);
      return { totalCalls: totals.count }
    },
    receiveLoc: (state, data) => {
      return
      try {
        response = JSON.parse(data)
        if (response.city != "") {
          geo = response.loc
          city = response.city
          time = new Date().valueOf()
          store.replace("org.5calls.geolocation", 0, geo, () => {});
          store.replace("org.5calls.geolocation_city", 0, city, () => {});
          store.replace("org.5calls.geolocation_time", 0, time, () => {});
          return { geolocation: geo, cachedCity: city, geoCacheTime: time }
        } else {
          Raven.captureMessage("Location with no city: "+response.loc, { level: 'warning' });
        }
      } catch(e) {
        Raven.setExtraContext({ json: data })
        Raven.captureMessage("Couldn't parse ipinfo json", { level: 'error' });
      }
    },
    changeActiveIssue: (state, issueId) => {
      return { contactIndex: 0 }
    },
    setContactIndex: (state, data) => {
      if (data.newIndex != 0) {
        return { contactIndex: data.newIndex }
      } else {
        store.add("org.5calls.completed", data.issueid, () => {})
        return { contactIndex: 0, completedIssues: state.completedIssues.concat(data.issueid) }
      }
    },
    setAddress: (state, address) => {
      Raven.setExtraContext({ address: address })
      store.replace("org.5calls.location", 0, address, () => {});

      return { address: address, askingLocation: false }
    },
    setGeolocation: (state, data) => {
      store.replace("org.5calls.geolocation", 0, data, () => {});
      return { geolocation: data }
    },
    enterLocation: (state, data) => {
      scrollIntoView(document.querySelector('#address'));
      return { askingLocation: true }
    },
    resetLocation: (state, data) => {
      store.remove("org.5calls.location", () => {});
      store.remove("org.5calls.geolocation", () => {});
      store.remove("org.5calls.geolocation_city", () => {});
      store.remove("org.5calls.geolocation_time", () => {});
      return { address: '', geolocation: '', cachedCity: '', geoCacheTime: '' }
    },
    resetCompletedIssues: (state, data) => {
      store.remove("org.5calls.completed", () => {});
      return { completedIssues: [] }
    },
    home: (state, data) => {
      return { activeIssue: false, getInfo: false }
    }
  },

  effects: {
    fetch: (state, data, send, done) => {
      address = "?address="
      if (state.address !== '') {
        address += state.address
      } else if (state.geolocation !== "") {
        address += state.geolocation
      }

      const issueURL = appURL+'/issues/'+address
      // console.log("fetching url",issueURL);
      http(issueURL, (err, res, body) => {
        send('receiveIssues', body, done)
      })
    },
    getTotals: (state, data, send, done) => {
      http(appURL+'/report/', (err, res, body) => {
        send('receiveTotals', body, done)
      })
    },
    changeActiveIssueEffect: (state, issueId, send, done) => {
      send('location:set', "/#issue/"+issueId, done)
      send('changeActiveIssue', issueId, done)
    },
    setLocation: (state, data, send, done) => {
      send('setAddress', data, done);
      send('fetch', {}, done);
    },
    unsetLocation: (state, data, send, done) => {
      send('resetLocation', data, done)
      send('startup', data, done)
    },
    startup: (state, data, send, done) => {
      // sometimes we trigger this again when reloading mainView, check for issues
      if (state.issues.length == 0 || state.geolocation == '') {
        geoFetchTime = state.geoCacheTime
        cachePlusHours = new Date(geoFetchTime)
        cachePlusHours.setHours(cachePlusHours.getHours() + 24)
        // console.log("geo fetch time",geoFetchTime, cachePlusHours)
        now = new Date()

        // only fetch geo if it's 24 hours old
        if (state.geolocation == '' || now.valueOf() > cachePlusHours.valueOf()) {
          http('https://ipinfo.io/json', (err, res, body) => {
            if (res.statusCode == 200) {
              send('receiveLoc', body, done)
            }
            send('fetch', {}, done)
          })
        } else {
          send('fetch', {}, done)
        }
      }
    },
    incrementContact: (state, data, send, done) => {
      const issue = find(state.issues, ['id', data.issueid]);

      if (state.contactIndex < issue.contacts.length - 1) {
        scrollIntoView(document.querySelector('#contact'));
        send('setContactIndex', { newIndex: state.contactIndex + 1, issueid: issue.id }, done)
      } else {
        scrollIntoView(document.querySelector('#content'));
        store.add("org.5calls.completed", issue.id, () => {})
        send('location:set', "/#done/" + issue.id, done)
        send('setContactIndex', { newIndex: 0, issueid: issue.id }, done)
      }
    },
    callComplete: (state, data, send, done) => {
      ga('send', 'called', data.result);

      const body = queryString.stringify({ location: state.zip, result: data.result, contactid: data.contactid, issueid: data.issueid })
      http.post(appURL+'/report', { body: body, headers: {"Content-Type": "application/x-www-form-urlencoded"} }, (err, res, body) => {
        // don't really care about the result
      })
      send('incrementContact', data, done);
    },
    skipCall: (state, data, send, done) => {
      ga('send', 'called', 'skip');

      send('incrementContact', data, done);
    },
    activateIssue: (state, data, send, done) => {
      scrollIntoView(document.querySelector('#content'));
      location.hash = "issue/" + data.id;
    }
  },
});

app.router({ default: '/404' }, [
  ['/', require('./pages/mainView.js')],
  ['/issue', require('./pages/mainView.js'),
    [':issueid', require('./pages/mainView.js')]
  ],
  ['/done', require('./pages/doneView.js'),
    [':issueid', require('./pages/doneView.js')]
  ],
  ['/about', require('./pages/aboutView.js')],
]);

const tree = app.start();
const rootNode = document.getElementById('root');
document.body.replaceChild(tree, rootNode);
