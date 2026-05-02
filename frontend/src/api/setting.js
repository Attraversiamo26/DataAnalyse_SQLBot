import { request } from '@/utils/request';
export const settingsApi = {
    pager: (pageNumber, pageSize) => request.get(`/settings/terminology/pager/${pageNumber}/${pageSize}`),
    add: (data) => request.post('/settings/terminology', data),
    edit: (data) => request.put('/settings/terminology', data),
    delete: (id) => request.delete(`/settings/terminology/${id}`),
    query: (id) => request.get(`/settings/terminology/${id}`),
    downloadError: (path) => request.post(`/system/download-fail-info`, { file: path }, {
        responseType: 'blob',
        requestOptions: { customError: true },
    }),
    downloadTemplate: (url) => request.get(url, {
        responseType: 'blob',
        requestOptions: { customError: true },
    }),
};
