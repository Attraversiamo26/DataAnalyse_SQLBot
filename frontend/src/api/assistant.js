import { request } from '@/utils/request';
export const assistantApi = {
    queryAll: (keyword) => request.get('/system/assistant', { params: keyword ? { keyword } : {} }),
    add: (data) => request.post('/system/assistant', data),
    edit: (data) => request.put('/system/assistant', data),
    delete: (id) => request.delete(`/system/assistant/${id}`),
    query: (id) => request.get(`/system/assistant/${id}`),
    validate: (data) => request.get('/system/assistant/validator', { params: data }),
};
