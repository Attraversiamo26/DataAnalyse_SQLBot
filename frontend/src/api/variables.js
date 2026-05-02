import { request } from '@/utils/request';
export const variablesApi = {
    save: (data) => request.post('/sys_variable/save', data),
    listAll: () => request.post('/sys_variable/listAll', {}),
    listPage: (pageNum, pageSize, data) => request.post(`/sys_variable/listPage/${pageNum}/${pageSize}`, data),
    delete: (data) => request.post(`/sys_variable/delete`, data),
};
