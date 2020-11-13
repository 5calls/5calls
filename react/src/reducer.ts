import { combineReducers } from "redux";
import { locationStateReducer } from "./locationReducer";

const rootReducer = combineReducers({
  //   remoteDataState: remoteDataReducer,
  //   callState: callStateReducer,
  locationState: locationStateReducer,
  //   userStatsState: userStatsReducer,
  //   userState: userStateReducer,
});

export default rootReducer;
