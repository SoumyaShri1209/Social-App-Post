import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers['x-auth-token'] = token;
  return req;
});

export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const fetchPosts = () => API.get('/posts');
export const createPost = (data) => API.post('/posts', data);
export const likePost = (id) => API.put(`/posts/${id}/like`);
export const commentOnPost = (id, text) => API.post(`/posts/${id}/comment`, { text });
export const deletePost = (id) => API.delete(`/posts/${id}`);
export default API;