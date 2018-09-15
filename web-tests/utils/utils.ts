import axios from 'axios';

const isLinkValid = link => {

  axios.get(link)
    .then(response => {
      let resp = response ? response.status : 0;
      return resp === 200;
    })
    .catch(error => {
      return false;
    });
};

export { isLinkValid };
