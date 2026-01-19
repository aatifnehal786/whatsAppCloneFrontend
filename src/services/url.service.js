import axios from "axios";

const apiUrl = "https://whatsappclonebackend-149w.onrender.com/api";



const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials:true
});




export default axiosInstance;
