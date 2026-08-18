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

export interface HourlyCallCount {
  time: number; // Unix timestamp in seconds
  count: number;
}

export interface CountData {
  count: number; // total call count
  todayStartTime: number;
  serverTime: number;
  hourlyCalls: HourlyCallCount[];
}

export const getMockCountData = (): CountData => {
  const now = Math.floor(Date.now() / 1000);
  const hourlyCalls: HourlyCallCount[] = [];

  // Start of today in local midnight (mocking server behavior)
  const todayStartTime = new Date().setHours(0, 0, 0, 0) / 1000;

  const currentHourStart = Math.floor(now / 3600) * 3600;
  for (let i = 23; i >= 0; i--) {
    const hourStart = currentHourStart - i * 3600;
    const date = new Date(hourStart * 1000);
    const hour = date.getHours();

    // Diurnal rate pattern: peak calls during standard business hours
    let baseCount = 0;
    if (hour >= 9 && hour < 17) {
      baseCount = Math.floor(800 + (hourStart % 10) * 50); // Peak hours: ~400-800 calls/hr
    } else if (hour >= 17 && hour < 21) {
      baseCount = Math.floor(300 + (hourStart % 10) * 20); // Evening winding down
    } else if (hour >= 6 && hour < 9) {
      baseCount = Math.floor(100 + (hourStart % 10) * 10); // Morning ramping up
    } else {
      baseCount = Math.floor(50 + (hourStart % 5)); // Late night: very low
    }

    // For the current hour, scale linearly by seconds elapsed in the hour
    if (i === 0) {
      const elapsedSeconds = now % 3600;
      baseCount = Math.floor(baseCount * (elapsedSeconds / 3600));
    }

    hourlyCalls.push({
      time: hourStart,
      count: baseCount
    });
  }

  return {
    count: 9123456,
    todayStartTime,
    serverTime: now,
    hourlyCalls
  };
};

// DO NOT SUBMIT
export const getCountData = (): Promise<CountData> => {
  return Promise.resolve(getMockCountData());
};

export interface IssueCountData {
  issue_id: number;
  name: string;
  slug: string;
  count: number; // Total in the time period.
  total_count: number; // All-time total.
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

export const getLocationSummary = (
  districtId: string
): Promise<RepsSummaryData | null> => {
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

export interface DonationStatsData {
  total: number;
}

export const getDonationStats = (): Promise<DonationStatsData> => {
  return axios
    .get(`${Constants.DONATIONS_API_URL}`)
    .then((response) => Promise.resolve(response.data))
    .catch((e) => Promise.reject(e));
};

export interface CustomizedScriptsResponse {
  [contactId: string]: string;
}

export const getCustomizedScripts = async (
  issueId: string,
  contactIds: string[],
  location: string
): Promise<CustomizedScriptsResponse> => {
  const params = new URLSearchParams();
  params.append('contact_ids', contactIds.join(','));
  params.append('location', location);

  return axios
    .get(`${Constants.API_URL}/issue/${issueId}/script?${params.toString()}`)
    .then((response) => Promise.resolve(response.data))
    .catch((e) => Promise.reject(e));
};

export interface SubscriptionPreferences {
  [key: string]: boolean | undefined;
}

export interface UpdateSubscriptionResponse {
  subscriber_id: string;
  message: string;
}

export const getEmailSubscriptions = async (
  subscriberId: string
): Promise<SubscriptionPreferences> => {
  return axios
    .get(`${Constants.API_URL}/subscriptions/${subscriberId}`)
    .then((response) => Promise.resolve(response.data))
    .catch((e) => Promise.reject(e));
};

export const updateEmailSubscriptions = async (
  subscriberId: string,
  preferences: SubscriptionPreferences
): Promise<UpdateSubscriptionResponse> => {
  // Build the post data as JSON
  const postData: { [key: string]: boolean | string } = {
    cid: uuid.callerID()
  };

  // Add all preference keys as boolean values
  Object.keys(preferences).forEach((key) => {
    postData[key] = Boolean(preferences[key]);
  });

  return axios
    .post(`${Constants.API_URL}/subscriptions/${subscriberId}`, postData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => Promise.resolve(response.data))
    .catch((e) => Promise.reject(e));
};
