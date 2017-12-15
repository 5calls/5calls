
export const APP_NAME = '5 Calls';
export const APP_URL = 'https://5calls.org';
// export const APP_URL = 'http://localhost:8090';
export const API_URL = 'https://api.5calls.org/v1';
export const ISSUES_API_URL = `${APP_URL}/issues/?all=true&address=`;
export const REPORT_API_URL = `${APP_URL}/report`;
export const COUNTS_API_URL = `${API_URL}/counts`;
export const DONATIONS_API_URL = `${API_URL}/donations`;
export const GROUP_API_URL = `${API_URL}/groups`;
export const CONTACTS_API_URL = `${API_URL}/contacts`;
export const IP_INFO_URL = 'https://ipinfo.io/json';
export const DONATE_URL = 'https://secure.actblue.com/donate/5calls-donate';

export const zipCodeRegex: RegExp = /^\d{5}(-\d{4})?$/;

export const cacheTimeout = {
  default:  24 * 60 * 60 * 1000, // 1 day
  groups: 24 * 60 * 60 * 1000 // 1 day
};

export const contact = {
  email: 'make5calls@gmail.com',
  github: 'https://github.com/5calls',
  twitter: 'https://twitter.com/make5calls',
  facebook: 'https://www.facebook.com/make5calls',
  apps: 'https://crgj.app.link/7R2bEB0R4F',
};
