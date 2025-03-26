import { DONATE_URL } from '../common/constants';
import uuid from './uuid';

const openDonate = (amount: number, refcode: string) => {
  window.open(
    `${DONATE_URL}?refcode=${refcode}&refcode2=${uuid.callerID()}&amount=${amount}`,
    '_blank',
  );
};

// sometimes it's convenient to call small functions from hugo js-world
interface fivecallsGlobal {
  openDonate: (amount: number, refcode: string) => void;
}

const globalAdditions: fivecallsGlobal = { openDonate };
declare global {
  interface Window {
    fivecalls: fivecallsGlobal;
  }
}
window.fivecalls = globalAdditions;
