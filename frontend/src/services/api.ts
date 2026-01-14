import axios from 'axios';
import { Task, TaskStatus } from './types.ts';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const getTasks = async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get<Task[]>('/tasks/', { params });
    return response.data;
};

export const createTask = async (title: string, description?: string) => {
    const response = await api.post<Task>('/tasks/', { title, description });
    return response.data;
};

export const updateTaskStatus = async (id: number, status: TaskStatus) => {
    const response = await api.patch<Task>(`/tasks/${id}/`, { status });
    return response.data;
};

export const deleteTask = async (id: number) => {
    await api.delete(`/tasks/${id}/`);
};

export const sendAICommand = async (command: string) => {
    const response = await api.post('/ai/command/', { command });
    return response.data;
};

export default api;
