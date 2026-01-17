import axios from 'axios';
import { TaskStatus } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const getTasks = async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/tasks/', { params });
    return response.data;
};

export const createTask = async (title, description) => {
    const response = await api.post('/tasks/', { title, description });
    return response.data;
};

export const updateTaskStatus = async (id, status) => {
    const response = await api.patch(`/tasks/${id}/`, { status });
    return response.data;
};

export const updateTask = async (id, title, description) => {
    const response = await api.patch(`/tasks/${id}/`, { title, description });
    return response.data;
};

export const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}/`);
};

export const sendAICommand = async (command) => {
    const response = await api.post('/ai/command/', { command });
    return response.data;
};

export default api;
