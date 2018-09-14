import axios from 'axios';

const isLinkValid = link => {
  let statusCode = 0;
  let req = axios.get(link)
    .then(resp => statusCode = resp.status);
  if (statusCode === 200) {
    return true;
  }
  return true;
};

export { isLinkValid };
