import axios from 'axios';
import * as querystring from 'querystring';

import OneSignal from 'react-onesignal';

import { Contact } from '../common/models/contact';
import { ContactList } from '../common/models/contactList';
import * as Constants from '../common/constants';
import {
  OutcomeData,
  UserContactEventType
} from '../common/models/contactEvent';
import uuid from './uuid';
import { LOCAL_STORAGE_KEYS } from '../common/constants';

export const noLocationError = Error('no location entered');

interface ContactResponse {
  location: string;
  lowAccuracy: boolean;
  state: string;
  district: string;
  representatives: Contact[];
}

export const getContacts = async (
  location: string,
  areas: string = ''
): Promise<ContactList> => {
  if (!location || location === '') {
    return Promise.reject(noLocationError);
  }

  let areasQuery = '';
  if (areas !== '') {
    areasQuery = `&areas=${encodeURIComponent(areas)},`;
  }

  return axios
    .get<ContactResponse>(
      `${Constants.REPS_API_URL}?location=${location}${areasQuery}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    )
    .then((result) => {
      const contactList = new ContactList();
      contactList.lowAccuracy = result.data.lowAccuracy;
      contactList.location = result.data.location;
      contactList.representatives = result.data.representatives;
      contactList.state = result.data.state;
      contactList.district = result.data.district;
      if (contactList.generalizedLocationID() !== '-') {
        const districtId = contactList.generalizedLocationID();
        OneSignal.sendTag('districtID', districtId);
        localStorage.setItem(LOCAL_STORAGE_KEYS.DISTRICT, districtId);

        // if there's a sub_id in local storage, post it to the server since we've updated the district
        const subId = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBSCRIBER);
        if (subId) {
          postSubscriberDistrict(subId, districtId);
        }
      }
      return Promise.resolve(contactList);
    })
    .catch((error) => {
      // console.error("bad address",error);
      return Promise.reject(error);
    });
};

export interface CountData {
  count: number; // total call count
}

export const getCountData = (): Promise<CountData> => {
  return axios
    .get(`${Constants.REPORT_API_URL}`)
    .then((response) => Promise.resolve(response.data))
    .catch((e) => Promise.reject(e));
};

export interface IssueCountData {
  issue_id: number;
  name: string;
  slug: string;
  count: number;
  archived: boolean;
}

export interface RegionSummaryData {
  id: string;
  name: string;
  total: number;
  issueCounts: Array<IssueCountData>;
}

export interface UsaSummaryData {
  usa: RegionSummaryData;
  states: Array<RegionSummaryData>;
}

export const getUsaSummary = (): Promise<UsaSummaryData> => {
  return axios
    .get('https://api.5calls.org/v1/reps/usaSummary')
    .then((response) => Promise.resolve(response.data))
    .catch((e) => Promise.reject(e));
};

export interface OutcomeSummaryData {
  result: UserContactEventType;
  count: number;
}

export interface AggregatedCallCount {
  issue_id: number;
  count: number;
  time: number;
}

export interface ContactSummaryData {
  id: string;
  total: number;
  outcomes: OutcomeSummaryData[];
  topIssues: IssueCountData[];
  aggregatedResults: AggregatedCallCount[];
}

export interface RepsSummaryData {
  reps: Contact[];
  repsData: ContactSummaryData[];
}

export const getLocationSummary = (): Promise<RepsSummaryData | null> => {
  const districtId = localStorage.getItem(LOCAL_STORAGE_KEYS.DISTRICT);
  if (
    districtId === null ||
    districtId === undefined ||
    districtId.length === 0
  ) {
    return Promise.resolve(null);
  }
  return axios
    .get(
      `https://api.5calls.org/v1/reps/districtSummary?district=${districtId}`
    )
    .then((response) => Promise.resolve(response.data))
    .catch((e) => Promise.reject(e));
};

export interface IssueCount {
  name: string;
  count: number;
}

export interface GroupCounts {
  total: number;
  issueCounts: IssueCount[];
}

export const getGroupCountData = (group: string): Promise<GroupCounts> => {
  return axios
    .get(`${Constants.REPORT_API_URL}?group=${encodeURIComponent(group)}`)
    .then((response) => Promise.resolve(response.data))
    .catch((e) => Promise.reject(e));
};

export const postOutcomeData = async (data: OutcomeData) => {
  const postData = querystring.stringify({
    result: data.outcome,
    contactid: data.contactId,
    issueid: data.issueId,
    via: data.via,
    callerid: uuid.callerID(),
    ...(data.group ? { group: data.group } : {})
  });

  return axios.post(`${Constants.REPORT_API_URL}`, postData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const postAPIEmail = (email: string): Promise<boolean> => {
  const postData = querystring.stringify({
    email: email
  });
  return axios.post(Constants.API_TOKEN_URL, postData);
};

export const postSubscriberDistrict = (
  sub_id: string,
  district: string
): Promise<boolean> => {
  const postData = querystring.stringify({
    subscriber: sub_id,
    district: district,
    cid: uuid.callerID()
  });
  return axios.post(Constants.UPDATE_DISTRICT_API_URL, postData, {});
};

// sends a message to the server indicating an ad click
export const postGCLID = (gclid: string) => {
  postReferral('gclid', window.location.pathname, gclid);
};

// sends a message to the server indicating a referral
export const postReferral = (
  ref: string,
  path: string,
  meta: string | null
) => {
  const postData = querystring.stringify({
    ref: ref,
    meta: meta,
    path: path,
    cid: uuid.callerID()
  });
  return axios.post(Constants.REFERRAL_API_URL, postData, {});
};

// tracks user search terms for analytics
export const postSearchTerm = async (searchTerm: string) => {
  try {
    await axios.post(Constants.SEARCH_TERM_API_URL, { query: searchTerm });
  } catch (error) {
    // Silently fail - we don't want to disrupt the user experience
    console.debug('Failed to track search term:', error);
  }
};
