import { LocationState } from '../state/locationState';
import { ApplicationState } from '../state/appState';
import { CompletedIssueMap } from '../state/completedState';
import { LOCAL_STORAGE_KEYS } from '../common/constants';

const saveLocation = (location: LocationState) => {
  const newStoredData: StoredData = {
    locationState: JSON.stringify(location)
  };
  localStorage.setItem(LOCAL_STORAGE_KEYS.LOCATION_KEY, JSON.stringify(newStoredData));
};

const saveCompleted = (completedIssueMap: CompletedIssueMap) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.COMPLETION_KEY, JSON.stringify(completedIssueMap));
};

const getStorageAsObject = (): ApplicationState => {
  const getStoredState = <T>(key: string): T => {
    const storageString = localStorage.getItem(key) ?? '{}';
    return JSON.parse(storageString) as T;
  };

  const locationData: StoredData = getStoredState<StoredData>(LOCAL_STORAGE_KEYS.LOCATION_KEY);
  const locationState = JSON.parse(
    locationData.locationState ?? '{}'
  ) as LocationState;

  const completedIssueMap = getStoredState<StoredData>(
    LOCAL_STORAGE_KEYS.COMPLETION_KEY
  ) as CompletedIssueMap;

  const appState: ApplicationState = { locationState, completedIssueMap };
  return appState;
};

// maybe this is a quirk of our former redux-persist usage,
// each key is not an object, but another json string to parse
// but it's fine because we can abstract around it here
interface StoredData {
  locationState?: string;
  completedState?: string;
}

interface Storage {
  saveLocation(location: LocationState): void;
  saveCompleted(completed: CompletedIssueMap): void;
  getStorageAsObject(): ApplicationState;
}

export default { saveLocation, saveCompleted, getStorageAsObject } as Storage;
