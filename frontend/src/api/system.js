import { request } from '@/utils/request';
export const modelApi = {
    queryAll: (keyword) => request.get('/system/aimodel', { params: keyword ? { keyword } : {} }),
    add: (data) => {
        const param = data;
        return request.post('/system/aimodel', param);
    },
    edit: (data) => {
        const param = data;
        return request.put('/system/aimodel', param);
    },
    delete: (id) => request.delete(`/system/aimodel/${id}`),
    query: (id) => request.get(`/system/aimodel/${id}`),
    setDefault: (id) => request.put(`/system/aimodel/default/${id}`),
    check: (data) => request.fetchStream('/system/aimodel/status', data),
    platform: (id) => request.get(`/system/platform/org/${id}`),
    userSync: (data) => request.post(`/system/platform/user/sync`, data),
};
