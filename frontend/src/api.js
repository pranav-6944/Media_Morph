import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com') || (host !== 'localhost' && host !== '127.0.0.1')) {
      return 'https://mediamorph-backend.onrender.com/api';
    }
  }
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();
console.log('[MediaMorph] Connected API_URL:', API_URL);

const checkJsonResponse = (res) => {
  if (typeof res.data === 'string' && (res.data.includes('<!DOCTYPE html>') || res.data.includes('<html'))) {
    throw new Error(`Backend URL Error: Reached HTML page at ${API_URL}. Ensure backend Web Service "mediamorph-backend" is deployed and running on Render.`);
  }
  return res;
};

export const uploadFiles = async (formData, onUploadProgress) => {
  const res = await axios.post(`${API_URL}/upload`, formData, {
    onUploadProgress
  });
  return checkJsonResponse(res);
};

export const startConversion = (data) => {
  return axios.post(`${API_URL}/convert`, data);
};

export const checkJobStatus = (jobId) => {
  return axios.get(`${API_URL}/convert/status/${jobId}`);
};

export const downloadFileUrl = (filename) => {
  return `${API_URL}/download/${filename}`;
};

export const downloadBatch = (filesData) => {
  return axios.post(`${API_URL}/download/batch`, { files: filesData }, {
    responseType: 'arraybuffer'
  });
};

export const deleteFile = (jobId) => {
  return axios.delete(`${API_URL}/convert/${jobId}`);
};

export const getStats = () => {
  return axios.get(`${API_URL}/stats`);
};
