// const config = {
//     // url : 'http://10.12.154.211:3000/api/',
//     url : 'http://192.168.1.9:3001/api/',
// };

import axios from 'axios';

export const hostName = 'http://localhost:3001';

const APIURL = hostName + '/api/';

const API = axios.create({
  // baseURL: 'http://13.211.174.199:3001/api/'
  baseURL: APIURL,
});

export const imageURL = APIURL + '0/images';

export const descriptionImageURL = APIURL + '1/images';

// API.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// API.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default API;
