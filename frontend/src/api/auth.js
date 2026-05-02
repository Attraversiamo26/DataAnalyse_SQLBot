import { request } from '@/utils/request';
export const userApi = {
    pager: (pageNumber, pageSize) => request.get(`/user/pager/${pageNumber}/${pageSize}`),
    add: (data) => request.post('/settings/terminology', data),
    edit: (data) => request.put('/settings/terminology', data),
    delete: (id) => request.delete(`/settings/terminology/${id}`),
    query: (id) => request.get(`/settings/terminology/${id}`),
    language: (data) => request.put('/user/language', data),
    pwd: (data) => request.put('/user/pwd', data),
    ws_options: () => request.get('/user/ws'),
    ws_change: (oid) => request.put(`/user/ws/${oid}`),
};
