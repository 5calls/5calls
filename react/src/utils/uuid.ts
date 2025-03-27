import { v4 as uuidv4 } from 'uuid';

const CallerIDStorageKey = 'callerID';
const callerID = () => {
  const cid = localStorage.getItem(CallerIDStorageKey) ?? uuidv4();
  localStorage.setItem(CallerIDStorageKey, cid);

  return cid;
};

interface UUID {
  callerID: () => string;
}

export default { callerID } as UUID;
