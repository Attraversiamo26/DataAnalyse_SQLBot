import { request } from '@/utils/request';
export const getList = () => request.post('/ds_permission/list');
export const savePermissions = (data) => request.post('/ds_permission/save', data);
export const delPermissions = (id) => request.post(`/ds_permission/delete/${id}`);
