import axios from 'axios';

const api = axios.create({
  baseURL: 'https://projeto-pi-04-c4je.onrender.com', 
  withCredentials: true,
});

export default api;
