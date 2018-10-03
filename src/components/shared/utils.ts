import * as Constants from '../../common/constants';
import { Issue } from './../../common/model';
import { RemoteDataState } from '../../redux/remoteData';

import { find } from 'lodash';
import { store } from '../../redux/store';

/**
 * Formats the location for the back end as
 * specified in report.go in the 5calls/5calls repo.
 * The format is either zip code or geolocation (lat/long)
 * with all other location representations formatted
 * as an empty string.
 *
 * @param location the location stored in locationState.address
 */
export const formatLocationForBackEnd = (location: string | null | undefined): string => {
  if (!location) {
    return '';
  }
  const zipRegex: RegExp = Constants.zipCodeRegex;
  // Geolocation contains latitude and logitude which are
  // two negative or positive floating point numbers
  // separated by one or more spaces.
  // First regex group is the latitude
  // Second regex group is the longitude
  const geolocationRegex: RegExp = /^([-]?\d+\.\d+)\s+([-]?\d+\.\d+)$/;
  if (zipRegex.test(location)) {
    return location;
  } else if (geolocationRegex.test(location)) {
    // parse out lat and long
    const match = geolocationRegex.exec(location);
    if (match) {
      // TODO: Format floating point numbers
      // to 2 places as specified in report.go
      return `${match[1]} ${match[2]}`;
    }
  }
  return '';
};

export const isNumber = (maybeNumber: number | string) => {
  const num = Number(maybeNumber);
  // Handle undefined input.
  // Number(undefined) is NaN, while Number("") is 0
  return isNaN(num) ? 0 : num;
};

export const formatNumber = (unformattedNumber: number | string) => {
  const num = isNumber(unformattedNumber);
  // Number.toLocaleString() doesn't work on Safari 9 (see https://github.com/5calls/5calls/issues/197)
  // tslint:disable-next-line:no-string-literal
  if (window['Intl'] && typeof Intl.NumberFormat === 'function') {
    return num.toLocaleString();
  } else {
    // As a fallback, use a quick-and-dirty regex to insert commas.
    // When in doubt, get code from stackoverflow: http://stackoverflow.com/a/2901298/7542666
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

export const getIssue = (remoteDataState: RemoteDataState, issueId: string): Issue | undefined => {
  if (remoteDataState.issues) {
    const currentActiveIssue = find(remoteDataState.issues, (i => i.id === issueId || i.slug === issueId));
    if (currentActiveIssue) {
      return currentActiveIssue;
    }
  }

  if (remoteDataState.inactiveIssues) {
    const currentInactiveIssue = find(remoteDataState.inactiveIssues, (i => i.id === issueId || i.slug === issueId));
    if (currentInactiveIssue) {
      return currentInactiveIssue;
    }
  }

  if (remoteDataState.groupIssues) {
    // issueIDs are numbers from groups :/ they should be strings
    const currentGroupIssue = find(remoteDataState.groupIssues,
                                   (i => i.id.toString() === issueId || i.slug === issueId));
    if (currentGroupIssue) {
      return currentGroupIssue;
    }
  }

  return undefined;
};

export const isIssueComplete = (issueID: string): boolean => {
  let state = store.getState();

  if (state.callState && state.callState.completedIssueIds) {
    return find(state.callState.completedIssueIds, (issueId: string) => issueID === issueId) !== undefined;
  }

  return false;
};
