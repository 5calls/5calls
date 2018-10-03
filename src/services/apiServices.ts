import { OutcomeData } from './../redux/callState/asyncActionCreator';
import axios from 'axios';
import * as querystring from 'querystring';
import { ApiData, CountData, MidtermStats } from './../common/model';
import * as Constants from '../common/constants';
import { UserContactEvent } from '../redux/userStats';
import { UserCallDetails } from '../redux/remoteData/asyncActionCreator';

export const getAllIssues = (address: string): Promise<ApiData> => {
  return axios.get(`${Constants.ISSUES_API_URL}${encodeURIComponent(address)}`)
    .then(response => Promise.resolve(response.data))
    .catch(e => Promise.reject(e));
};

export const getCountData = (): Promise<CountData> => {
  return axios.get(`${Constants.COUNTS_API_URL}`)
    .then(response => Promise.resolve(response.data))
    .catch(e => Promise.reject(e));
};

interface BackfillData {
  stats: BackfillOutcome[];
}

interface BackfillOutcome {
  issueID: string;
  contactID: string;
  result: string;
  time: string;
}

export const postBackfillOutcomes = (data: UserContactEvent[], idToken: string) => {
  let postData: BackfillData = {stats: []};

  for (let i = 0; i < data.length; i++) {
    let timeInSeconds = Math.round(data[i].time / 1000);

    let outcome: BackfillOutcome = {
      issueID: data[i].issueid,
      contactID: data[i].contactid,
      result: data[i].result,
      time: timeInSeconds.toString(),
    };

    postData.stats.push(outcome);
  }

  return axios.post(
    `${Constants.STATS_API_URL}`,
    postData,
    {
      headers: {'Authorization': 'Bearer ' + idToken,
                'Content-Type': 'application/json; charset=utf-8'}
    })
  .then(response => {
    return Promise.resolve(null);
  }).catch(e => Promise.reject(e));
};

export interface RemoteUserStats {
  stats: CallStats;
  weeklyStreak: number;
}

export interface CallStats {
  contact: number;
  voicemail: number;
  unavailable: number;
}

export const getUserStats = (idToken: string) => {
  return axios.get(
    `${Constants.STATS_API_URL}`,
    {
      headers: {'Authorization': 'Bearer ' + idToken,
                'Content-Type': 'application/json; charset=utf-8'}
    })
  .then(response => {
    let userData = response.data as RemoteUserStats;
    return Promise.resolve(userData);
  }).catch(e => Promise.reject(e));
};

export const postOutcomeData = (data: OutcomeData) => {
  const postData = querystring.stringify({
    location: data.location,
    result: data.outcome,
    contactid: data.contactId,
    issueid: data.issueId,
    via: data.via,
    userid: data.userId
  });
  // console.log('postOutcomeData() posted data:', postData)
  return axios.post(
      `${Constants.REPORT_API_URL}`,
      postData,
      {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
    .then(response => {
      return Promise.resolve(null);
    }).catch(e => Promise.reject(e));
};

export const getMidterms = (): Promise<MidtermStats> => {
  const midtermsURL = `${Constants.MIDTERMS_API_URL}`;
  return axios.get(`${midtermsURL}`)
    .then(response => Promise.resolve(response.data))
    .catch(e => Promise.reject(e));
};

export const getUserCallDetails = (idToken: string) => {
  let today = new Date();
  // this is fine for now, we can add moment later
  today.setDate(today.getDate() - 60);
  const dateString = today.getFullYear() + '-' +
    ('0' + (today.getMonth() + 1)).slice(-2) + '-' +
    ('0' + today.getDate()).slice(-2);

  return axios.get(
    `${Constants.PROFILE_API_URL}?timestamp=${dateString}`,
    {
      headers: {'Authorization': 'Bearer ' + idToken}
    })
  .then(response => {
    let profile = response.data as UserCallDetails;
    return Promise.resolve(profile);
  }).catch(e => Promise.reject(e));
};

export const postPhoneRemind = (phone: string): Promise<Boolean> => {
  const postData = querystring.stringify({
    phone: phone,
    ref: '',
  });
  return axios.post(
    Constants.REMINDER_API_URL,
    postData,
  )
    .then(response => Promise.resolve(true))
    .catch(e => Promise.reject(e));
};

export const postEmail = (email: string, sub: boolean, idToken: string): Promise<Boolean> => {
  const subscribe = sub ? 'true' : '';

  const postData = querystring.stringify({
    email: email,
    subscribe: subscribe,
  });
  return axios.post(
    Constants.PROFILE_API_URL,
    postData,
    {
      headers: {'Authorization': 'Bearer ' + idToken}
    },
  )
    .then(response => Promise.resolve(true))
    .catch(e => Promise.reject(e));
};
