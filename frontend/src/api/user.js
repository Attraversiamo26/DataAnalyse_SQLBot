import { request } from '@/utils/request';
export const userImportApi = {
    downExcelTemplateApi: () => request.get('/user/template', { responseType: 'blob' }),
    importUserApi: (data) => request.post('/user/batchImport', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    downErrorRecordApi: (key) => request.get(`/user/errorRecord/${key}`, { responseType: 'blob' }),
    clearErrorApi: (key) => {
        request.get(`/user/clearErrorRecord/${key}`);
    },
};
export const userApi = {
    pager: (params, pageNumber, pageSize) => request.get(`/user/pager/${pageNumber}/${pageSize}${params}`),
    add: (data) => request.post('/user', data),
    edit: (data) => request.put('/user', data),
    clearErrorApi: (key) => request.get(`/user/clearErrorRecord/${key}`),
    errorRecord: (key) => request.get(`/user/errorRecord/${key}`, { responseType: 'blob' }),
    delete: (key) => request.delete(`/user/${key}`),
    deleteBatch: (data) => request.delete(`/user`, { data }),
    get: (key) => request.get(`/user/${key}`),
    pwd: (id) => request.patch(`/user/pwd/${id}`),
    status: (data) => request.patch('/user/status', data),
    defaultPwd: () => request.get('/user/defaultPwd'),
};
