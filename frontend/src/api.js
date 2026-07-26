import axios from 'axios';

const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL;

  // Always prefer explicit onrender.com backend URL when running in browser on render.com
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com') || (host !== 'localhost' && host !== '127.0.0.1')) {
      return 'https://mediamorph-backend.onrender.com/api';
    }
  }

  if (!url) {
    url = 'http://localhost:5000/api';
  }

  url = url.trim().replace(/\/+$/, '');

  // Handle case where Render sets VITE_API_URL to service name or path without domain
  if (url === 'mediamorph-backend' || url === 'mediamorph-backend/api') {
    return 'https://mediamorph-backend.onrender.com/api';
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
};

export const API_URL = getApiUrl();
console.log('[MediaMorph] Connected API_URL:', API_URL);

const checkJsonResponse = (res) => {
  if (typeof res.data === 'string') {
    if (res.data.includes('<!DOCTYPE html>') || res.data.includes('<html')) {
      throw new Error(`Backend URL Error: Reached HTML page at ${API_URL}. Ensure backend Web Service "mediamorph-backend" is deployed and running on Render.`);
    }
    try {
      res.data = JSON.parse(res.data);
    } catch (e) {
      console.warn('[MediaMorph] Response data is string, could not parse JSON:', res.data);
    }
  }
  return res;
};

export const uploadFiles = async (formData, onUploadProgress) => {
  const res = await axios.post(`${API_URL}/upload`, formData, {
    responseType: 'json',
    onUploadProgress
  });
  return checkJsonResponse(res);
};

export const startConversion = async (data) => {
  const res = await axios.post(`${API_URL}/convert`, data, { responseType: 'json' });
  return checkJsonResponse(res);
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
