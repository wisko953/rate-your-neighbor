import axios from 'axios';

const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || process.env.API_GATEWAY_URL;
const API_METIER_URL = process.env.REACT_APP_API_METIER_URL || process.env.API_METIER_URL;

// Instance pour l'API Login (authentification)
const apiGateway = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance pour l'API Métier (logique métier)
const apiMetier = axios.create({
  baseURL: API_METIER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes des deux instances
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiGateway.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiMetier.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

export { apiGateway, apiMetier };
export default apiGateway;
