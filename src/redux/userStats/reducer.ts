import { Reducer } from 'redux';
import { UserStatsAction, UserStatsActionType } from './index';

export enum UserContactEventType {
  UNAVAILABLE = 'unavailable',
  VOICEMAIL = 'voicemail',
  CONTACT = 'contact',
  SKIP = 'skip'
}

// for the most part we use the event type enum, but we also want to support arbitrary result strings
export type UserOutcomeResult =  UserContactEventType | string;

export interface UserContactEvent {
  contactid: string;
  issueid: string;
  result: UserOutcomeResult;
  time: number;
  uploaded: boolean;
}

export interface UserStatsState {
  all: UserContactEvent[];
  unavailable: number;
  voicemail: number;
  contact: number;
}

const initialState: UserStatsState = {
  all: [],
  unavailable: 0,
  voicemail: 0,
  contact: 0,
};

export const userStatsReducer: Reducer<UserStatsState> = (
  state: UserStatsState = initialState as UserStatsState, action: UserStatsAction): UserStatsState => {
  switch (action.type) {
    case UserStatsActionType.SET_USER_STATS: {
      const userStats: UserStatsState = action.payload as UserStatsState;

      // create a deep copy of the incoming object to create the new state
      const all: UserContactEvent[] = [...userStats.all];

      // spread the incoming userStats object into a new object
      //  overwrite the "all" property with the new all array, made above
      //  otherwise the "all" array would be a reference to the old/existing "all" array
      const newState: UserStatsState = { ...userStats, all: all };

      return newState;
    }
    case UserStatsActionType.SET_UPLOADED: {
      const eventTime: number = action.payload as number;

      let newEvents = state.all;
      for (let i = 0; i < state.all.length; i++) {
        if (state.all[i].time === eventTime) {
          newEvents[i].uploaded = true;
        }
      }

      const newState: UserStatsState = { ...state, all: newEvents };

      return newState;
    }
    case UserStatsActionType.ADD_CALL_EVENT: {
      const callEvent: UserContactEvent = action.payload as UserContactEvent;
      if (callEvent.result === UserContactEventType.SKIP) {
        return state;
      }

      const createdState: UserStatsState = { ...state, all: [...state.all] };
      let addEvent: boolean = false;
      switch (callEvent.result) {
        case UserContactEventType.UNAVAILABLE: {
          createdState.unavailable = createdState.unavailable + 1;
          addEvent = true;
          break;
        }
        case UserContactEventType.VOICEMAIL: {
          createdState.voicemail = createdState.voicemail + 1;
          addEvent = true;
          break;
        }
        case UserContactEventType.CONTACT: {
          createdState.contact = createdState.contact + 1;
          addEvent = true;
          break;
        }
        default: {
          // anything that isn't the normal type can be added without changing the state
          addEvent = true;
          break;
        }
      }

      if (addEvent) {
        createdState.all.unshift(callEvent);
      }
      return createdState;
    }
    default: {
      return state;
    }
  }
};
