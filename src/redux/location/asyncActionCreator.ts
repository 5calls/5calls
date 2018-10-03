import { Dispatch } from 'redux';
import { fetchAllIssues } from '../../redux/remoteData';
import { setLocation, setUiState } from './index';
import { ApplicationState } from '../root';
import { LocationUiState } from '../../common/model';

export function setAddress(address: string) {
  return (dispatch: Dispatch<ApplicationState>) => {
    // tslint:disable-next-line:no-any
    return dispatch<any>(fetchAllIssues(address))
      .then(() => {
        dispatch(setLocation(address));
      });
  };
}

export function newLocationLookup(location: string) {
  return (dispatch: Dispatch<ApplicationState>) => {
    // tslint:disable-next-line:no-any
    return dispatch<any>(fetchAllIssues(location))
    .then(() => {
      dispatch(setUiState(LocationUiState.LOCATION_FOUND));
    })
    .catch((error) => {
      dispatch(setUiState(LocationUiState.LOCATION_ERROR));
    });
  };
}
