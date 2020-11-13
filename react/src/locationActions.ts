import { Action } from "redux";
import { LocationFetchType } from "./locationReducer";

export enum LocationActionType {
  LOCATION_CLEAR = "LOCATION_CLEAR",
  LOCATION_SET = "LOCATION_SET",
  CACHE_CITY = "CACHE_CITY",
  NEW_LOCATION_LOOKUP = "NEW_LOCATION_LOOKUP",
  SET_LOCATION_FETCH_TYPE = "SET_LOCATION_FETCH_TYPE",
  SET_SPLIT_DISTRICT = "SET_SPLIT_DISTRICT",
  SET_INVALID_ADDRESS = "SET_INVALID_ADDRESS",
}

export interface LocationAction extends Action {
  type: LocationActionType;
  payload?: {};
}

export interface LocationSetAction extends LocationAction {
  type: LocationActionType.LOCATION_SET;
  payload: string;
}

export interface LocationClearedAction extends LocationAction {
  type: LocationActionType.LOCATION_CLEAR;
}

export interface CacheCityAction extends LocationAction {
  type: LocationActionType.CACHE_CITY;
  payload: string | undefined;
}

export interface SetLocationFetchTypeAction extends LocationAction {
  type: LocationActionType.SET_LOCATION_FETCH_TYPE;
  payload: LocationFetchType;
}

export interface NewLocationLookupAction extends LocationAction {
  type: LocationActionType.NEW_LOCATION_LOOKUP;
  payload: string;
}

export interface SetSplitDistrictAction extends LocationAction {
  type: LocationActionType.SET_SPLIT_DISTRICT;
}

export interface SetInvalidAddressAction extends LocationAction {
  type: LocationActionType.SET_INVALID_ADDRESS;
}
