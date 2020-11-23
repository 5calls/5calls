import { LocationState } from "../state/locationState";

const LocalStorageKey = "persist:fivecalls";

const saveLocation = (location: LocationState) => {
  const storage = getStorageAsObject();

  const newStorage = Object.assign(storage, { locationState: JSON.stringify(location) });
  localStorage.setItem(LocalStorageKey, JSON.stringify(newStorage));
};

const getStorageAsObject = (): ApplicationState => {
  const storageString = localStorage.getItem(LocalStorageKey) ?? "{}";
  let data: StoredData = JSON.parse(storageString) as StoredData;
  const locationState = JSON.parse(data.locationState ?? "{}") as LocationState;

  const appState: ApplicationState = { locationState: locationState };
  return appState;
};

// const saveStorage = (appState: ApplicationState) => {};

interface ApplicationState {
  locationState?: LocationState;
}

// maybe this is a quirk of our former redux-persist usage,
// each key is not an object, but another json string to parse
// but it's fine because we can abstract around it here
interface StoredData {
  locationState?: string;
}

export default { saveLocation, getStorageAsObject };
