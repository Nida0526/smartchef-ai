import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api',
});

API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem('smartchef_user'));
    if (user && user.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

export default API;
