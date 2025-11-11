// Test frontend authentication
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2MDk4NzA5MywianRpIjoiOTMyODhiYjctNGFjNi00YjhiLThiMDktNmE3YjdiNDE1ZGE4IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjY4ZjY4NDQyMGRlN2E4ZWUyZjQwOWZkMSIsIm5iZiI6MTc2MDk4NzA5MywiZXhwIjoxNzYwOTg3OTkzLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHZtcy5ldCIsImZ1bGxfbmFtZSI6IlN5c3RlbSBBZG1pbmlzdHJhdG9yIn0.8d6ppx9M6BGb8YHCNi-c1ucsBTo_MAPJSeWJBFFVF20';
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

async function testBirthRecords() {
  try {
    console.log('Testing birth records...');
    const response = await api.get('/births');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data);
  }
}

testBirthRecords();
