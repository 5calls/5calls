import { LocationState } from "../state/locationState";
import { CompletedState } from "../state/completedState";

export interface ApplicationState {
  locationState?: LocationState;
  completedState?: CompletedState;
}
