import { LocationState } from "../state/locationState";
import { ApplicationState } from "../state/appState";
import { CompletedState } from "../state/completedState";

const LocalStorageKey = "persist:fivecalls";

const saveLocation = (location: LocationState) => {
  const storage = getStorageAsObject();

  const newStoredData: StoredData = {
    locationState: JSON.stringify(location),
    completedState: JSON.stringify(storage.completedState),
  };
  localStorage.setItem(LocalStorageKey, JSON.stringify(newStoredData));
};

const saveCompleted = (completed: CompletedState) => {
  const storage = getStorageAsObject();

  const newStoredData: StoredData = {
    locationState: JSON.stringify(storage.locationState),
    completedState: JSON.stringify(completed),
  };
  localStorage.setItem(LocalStorageKey, JSON.stringify(newStoredData));
};

const getStorageAsObject = (): ApplicationState => {
  const storageString = localStorage.getItem(LocalStorageKey) ?? "{}";
  let data: StoredData = JSON.parse(storageString) as StoredData;
  const locationState = JSON.parse(data.locationState ?? "{}") as LocationState;
  const completedState = JSON.parse(data.completedState ?? "{}") as CompletedState;

  const appState: ApplicationState = { locationState: locationState, completedState: completedState };
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
  saveCompleted(completed: CompletedState): void;
  getStorageAsObject(): ApplicationState;
}

export default { saveLocation, saveCompleted, getStorageAsObject } as Storage;
