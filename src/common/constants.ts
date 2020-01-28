export const APP_NAME = '5 Calls';
export const APP_URL = 'https://5calls.org';
// export const APP_URL = 'http://localhost:8090';
export const API_URL = 'https://api.5calls.org/v1';
// export const API_URL = 'http://localhost:8090/v1';
export const ISSUES_API_URL = `${API_URL}/issues`;
export const REPS_API_URL = `${API_URL}/reps`;
export const REPORT_API_URL = `${APP_URL}/report`;
export const STATS_API_URL = `${API_URL}/users/stats`;
export const PROFILE_API_URL = `${API_URL}/users/profile`;
export const DONATIONS_API_URL = `${API_URL}/donations`;
export const MIDTERMS_API_URL = `${API_URL}/midterms`;
export const GROUP_API_URL = `${API_URL}/groups`;
export const CONTACTS_API_URL = `${API_URL}/contacts`;
export const REMINDER_API_URL = `${API_URL}/remind`;
export const DONATE_URL = 'https://secure.actblue.com/donate/5calls-donate';
export const WRITER_APPLY_URL = 'https://airtable.com/shrJBbpixnJ09iVb3';
export const CODE_PROJECT_URL =
  'https://github.com/5calls/5calls/wiki/Getting-Involved-with-5-Calls-Development';

export const HELP_SET_LOCATION =
  'https://intercom.help/5calls/using-the-5-calls-website-and-apps/how-do-i-set-my-location-on-5-calls';
export const HELP_OTHER_REPRESENTATIVES =
  'https://intercom.help/5calls/using-the-5-calls-website-and-apps/why-do-i-only-see-some-of-my-representatives';

export const SHARE_BUCKET_URL =
  'https://shareimages.5calls.org/';

const callbackURI = () => {
  if (window.location.host.includes('localhost')) {
    return 'http://localhost:3000/auth0callback';
  } else if (window.location.host.includes('test.5calls.org')) {
    return 'https://test.5calls.org/auth0callback';
  }
  return 'https://5calls.org/auth0callback';
};

export const Auth0Config = {
  domain: '5callsos.auth0.com',
  clientId: 'bVxfNRGD4azuJLWPDPHNNsfMElENPKjF',
  audience: 'https://5callsos.auth0.com/userinfo',
  callbackUri: callbackURI(),
  poweredURL: 'https://5calls.org',
  popupAuth: false
};

export const zipCodeRegex: RegExp = /^\d{5}(-\d{4})?$/;

export const cacheTimeout = {
  default: 24 * 60 * 60 * 1000, // 1 day
  groups: 24 * 60 * 60 * 1000 // 1 day
};

export const contact = {
  email: 'make5calls@gmail.com',
  github: 'https://github.com/5calls',
  twitter: 'https://twitter.com/make5calls',
  facebook: 'https://www.facebook.com/make5calls',
  apps: 'https://crgj.app.link/7R2bEB0R4F'
};
