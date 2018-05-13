import { UserContactEvent, UserStatsState } from '../redux/userStats';

export interface LegacyUserStatsState {
  all: UserContactEvent[];
  unavailable: number;
  vm: number;
  contacted: number;
}

export const transform = (legacyStats: LegacyUserStatsState): UserStatsState => {
  let userStats: UserStatsState = {
    all: legacyStats.all.map(i => {
      return {
        contactid: i.contactid,
        issueid: i.issueid,
        result: i.result,
        time: i.time,
        uploaded: false,
      };
    }),
    unavailable: legacyStats.unavailable,
    voicemail: legacyStats.vm,
    contact: legacyStats.contacted,
  };

  return userStats;
};