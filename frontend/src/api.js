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

export const uploadFiles = (formData, onUploadProgress) => {
  return axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
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
