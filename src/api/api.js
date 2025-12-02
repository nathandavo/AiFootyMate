import axios from 'axios';

const BASE_URL = 'https://football-predictor-im87.onrender.com';

export const footballApi = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

export const openAiApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const loginUser = async (email, password) => {
  const response = await footballApi.post('/login', { email, password });
  return response.data;
};

export const registerUser = async (email, password) => {
  const response = await footballApi.post('/register', { email, password });
  return response.data;
};

export const getFixtures = async () => {
  const response = await footballApi.get('/fixtures');
  return response.data;
};

export const getPrediction = async (match) => {
  const response = await openAiApi.post('/predict', { match });
  return response.data;
};
