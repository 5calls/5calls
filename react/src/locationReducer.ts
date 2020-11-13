import { Reducer } from "redux";
import { LocationAction, LocationActionType } from "./locationActions";

export enum LocationFetchType {
  CACHED_ADDRESS = "CACHED_ADDRESS",
  BROWSER_GEOLOCATION = "BROWSER_GEOLOCATION",
  IP_INFO = "IP_INFO",
}

export interface LocationState {
  address: string;
  cachedCity: string;
  splitDistrict: boolean;
  invalidAddress: boolean;
  locationFetchType: LocationFetchType | undefined;
}

const initialState: LocationState = {
  address: "",
  cachedCity: "",
  splitDistrict: false,
  invalidAddress: false,
  locationFetchType: undefined,
};

export const locationStateReducer: Reducer<LocationState> = (
  state: LocationState = initialState,
  action: LocationAction
): LocationState => {
  switch (action.type) {
    case LocationActionType.LOCATION_CLEAR:
      return Object.assign({}, state, {
        address: "",
        cachedCity: "",
      });
    case LocationActionType.LOCATION_SET:
      return Object.assign({}, state, {
        address: action.payload,
      });
    case LocationActionType.CACHE_CITY:
      return Object.assign({}, state, {
        cachedCity: action.payload,
      });
    case LocationActionType.SET_SPLIT_DISTRICT:
      return Object.assign({}, state, {
        splitDistrict: action.payload,
      });
    case LocationActionType.SET_INVALID_ADDRESS:
      return Object.assign({}, state, {
        invalidAddress: action.payload,
      });
    case LocationActionType.SET_LOCATION_FETCH_TYPE:
      return Object.assign({}, state, {
        locationFetchType: action.payload,
      });
    default:
      return state;
  }
};
