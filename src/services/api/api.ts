import axios from "axios";
import { getToken } from "../repositories/DangNhap";



const api = axios.create({
    baseURL: "https://localhost:7063",
    timeout: 7000,
    headers: {
        "Content-Type": "application/json"
    }
})

// Thêm token vào header cho mỗi request
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

