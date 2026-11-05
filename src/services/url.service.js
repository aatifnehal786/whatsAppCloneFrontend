import axios from "axios";

const apiUrl = "https://whatsappclonebackend-149w.onrender.com/api"; // Replace with your backend API URL

const token = localStorage.getItem("login-storage");

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials:true
});

// Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
