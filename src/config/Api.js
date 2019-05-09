// const config = {
//     // url : 'http://10.12.154.211:3000/api/',
//     url : 'http://192.168.1.9:3001/api/',
// };

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api/'
});

// API.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// API.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default API;
