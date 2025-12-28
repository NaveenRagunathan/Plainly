import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateOnboarding: (data) => api.put('/auth/onboarding', data),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Subscribers
export const subscriberApi = {
    list: (params) => api.get('/subscribers', { params }),
    getStats: () => api.get('/subscribers/stats'),
    get: (id) => api.get(`/subscribers/${id}`),
    create: (data) => api.post('/subscribers', data),
    update: (id, data) => api.put(`/subscribers/${id}`, data),
    delete: (id) => api.delete(`/subscribers/${id}`),
    import: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/subscribers/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    export: () => api.get('/subscribers/export/csv', { responseType: 'blob' }),
    addTag: (id, tag) => api.post(`/subscribers/${id}/tags`, { tag }),
    removeTag: (id, tag) => api.delete(`/subscribers/${id}/tags/${tag}`)
};

// Sequences
export const sequenceApi = {
    list: () => api.get('/sequences'),
    get: (id) => api.get(`/sequences/${id}`),
    create: (data) => api.post('/sequences', data),
    update: (id, data) => api.put(`/sequences/${id}`, data),
    delete: (id) => api.delete(`/sequences/${id}`),
    addStep: (id, data) => api.post(`/sequences/${id}/steps`, data),
    updateStep: (id, stepId, data) => api.put(`/sequences/${id}/steps/${stepId}`, data),
    deleteStep: (id, stepId) => api.delete(`/sequences/${id}/steps/${stepId}`),
    assign: (id, subscriberIds) => api.post(`/sequences/${id}/assign`, { subscriberIds }),
    remove: (id, subscriberIds) => api.post(`/sequences/${id}/remove`, { subscriberIds })
};

// Broadcasts
export const broadcastApi = {
    list: (params) => api.get('/broadcasts', { params }),
    get: (id) => api.get(`/broadcasts/${id}`),
    create: (data) => api.post('/broadcasts', data),
    update: (id, data) => api.put(`/broadcasts/${id}`, data),
    delete: (id) => api.delete(`/broadcasts/${id}`),
    schedule: (id, scheduledAt) => api.post(`/broadcasts/${id}/schedule`, { scheduledAt }),
    send: (id) => api.post(`/broadcasts/${id}/send`),
    cancel: (id) => api.post(`/broadcasts/${id}/cancel`),
    preview: (id) => api.get(`/broadcasts/${id}/preview`)
};

// Landing Pages
export const landingPageApi = {
    list: () => api.get('/landing-pages'),
    get: (id) => api.get(`/landing-pages/${id}`),
    create: (data) => api.post('/landing-pages', data),
    update: (id, data) => api.put(`/landing-pages/${id}`, data),
    delete: (id) => api.delete(`/landing-pages/${id}`)
};

// Analytics
export const analyticsApi = {
    overview: () => api.get('/analytics/overview'),
    growth: (days) => api.get('/analytics/growth', { params: { days } }),
    broadcast: (id) => api.get(`/analytics/broadcasts/${id}`),
    sequence: (id) => api.get(`/analytics/sequences/${id}`)
};

// Payments
export const paymentApi = {
    createCheckout: (planType) => api.post('/payments/create-checkout', { planType }),
    getPortal: () => api.post('/payments/portal'),
    getSubscription: () => api.get('/payments/subscription')
};

export default api;
