import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:4000/api' })

export default {
    // Projects
    getProjects: async () => (await API.get('/projects')).data,
    createProject: async (payload) => (await API.post('/projects', payload)).data,
    updateProject: async (id, payload) => (await API.put(`/projects/${id}`, payload)).data,
    deleteProject: async (id) => (await API.delete(`/projects/${id}`)).data,
    // Tasks
    getTasksForProject: async (projectId) => (await API.get(`/tasks/project/${projectId}`)).data,
    createTask: async (payload) => (await API.post('/tasks', payload)).data,
    updateTask: async (id, payload) => (await API.put(`/tasks/${id}`, payload)).data,
    deleteTask: async (id) => (await API.delete(`/tasks/${id}`)).data,
    // AI
    summarize: async (projectId) => (await API.get(`/ai/summarize/${projectId}`)).data,
    qa: async (payload) => (await API.post('/ai/qa', payload)).data
}
