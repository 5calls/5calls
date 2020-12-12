import { DONATE_URL } from "../common/constants";

const openDonate = (amount: number) => {
  window.open(`${DONATE_URL}?refcode=done&amount=${amount}`);
};

// sometimes it's convenient to call small functions from hugo js-world
interface fivecallsGlobal {
  openDonate: (amount: number) => void;
}

const globalAdditions: fivecallsGlobal = { openDonate };
declare global {
  interface Window {
    fivecalls: fivecallsGlobal;
  }
}
window.fivecalls = globalAdditions;
