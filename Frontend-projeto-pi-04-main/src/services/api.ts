import axios from 'axios';

const api = axios.create({
  // O Frontend vai ler a URL daqui
  baseURL: import.meta.env.VITE_API_URL, 
});

export default api;
