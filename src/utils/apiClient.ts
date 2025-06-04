import axios from 'axios';
 
if (!process.env.FEROOT_API_KEY) {
  throw new Error('FEROOT_API_KEY is not defined in your environment');
}
if (!process.env.FEROOT_API_BASE_URL) {
  throw new Error('FEROOT_API_BASE_URL is not defined in your environment');
}
const apiClient = axios.create({
  baseURL: process.env.FEROOT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.FEROOT_API_KEY,
  },
});

export default apiClient;
