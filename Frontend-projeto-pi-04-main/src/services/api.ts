import axios from 'axios';

const api = axios.create({
  baseURL: '[projeto-pi-04-c4je.onrender.com](https://projeto-pi-04-c4je.onrender.com)', 
  withCredentials: true,
});

export default api;

export const buscarIndicadores = () => api.get('/api/indicadores');
