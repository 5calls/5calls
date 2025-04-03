import { v4 as uuidv4 } from 'uuid';
import { LOCAL_STORAGE_KEYS } from '../common/constants';

const callerID = () => {
  const cid = localStorage.getItem(LOCAL_STORAGE_KEYS.CALLER_ID) ?? uuidv4();
  localStorage.setItem(LOCAL_STORAGE_KEYS.CALLER_ID, cid);

  return cid;
};

interface UUID {
  callerID: () => string;
}

export default { callerID } as UUID;
