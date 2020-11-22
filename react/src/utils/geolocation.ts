import { GeolocationPosition } from "../common/models/geolocation";

// Geolocation PositionOptions properties
// Browser geolocation timeout in milliseconds
export const GEOLOCATION_TIMEOUT = 5000;
// Max age for last geolocation attempt in milliseconds
export const GEOLOCATION_MAX_AGE = 30000;

export const getBrowserGeolocation = (): Promise<GeolocationPosition> => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (navigator.geolocation) {
      const geolocation: Geolocation = navigator.geolocation;
      geolocation.getCurrentPosition(
        // PositionCallback
        (position: Position) => {
          const coords: Coordinates = position.coords;
          // tslint:disable-next-line:no-shadowed-variable
          const geolocation: GeolocationPosition = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
          resolve(geolocation);
        },
        // PositionErrorCallback
        (e: PositionError) => {
          const code = e.code;
          if (
            code === 3 /* PositionError.POSITION_UNAVAILABLE */ ||
            code === 2 /* PositionError.TIMEOUT */ ||
            code === 1 /* PositionError.PERMISSION_DENIED */
          ) {
            const msg = `Browser geolocation not successfully accomplished;
              PositionError code: ${code};
              PositionError message: ${e.message}`;
            // send back an undefined location
            reject(new Error(msg));
          } else {
            const msg = `Problem doing browser geolocation;
            PositionError code: ${code};
            PositionError message: ${e.message}`;
            // tslint:disable-next-line:no-console
            console.error(msg, e);
            reject(new Error(msg));
          }
        },
        // PositionOptions
        {
          enableHighAccuracy: true,
          timeout: GEOLOCATION_TIMEOUT,
          maximumAge: GEOLOCATION_MAX_AGE,
        }
      );
    } else {
      reject(new Error("Browser Geolocation API not available"));
    }
  });
};
