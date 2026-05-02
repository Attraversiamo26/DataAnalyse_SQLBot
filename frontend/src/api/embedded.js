import { request } from '@/utils/request';
export const getList = () => request.get('/system/assistant');
export const getAdvancedApplicationList = () => request.get('/system/assistant/advanced_application');
export const updateAssistant = (data) => request.put('/system/assistant', data);
export const saveAssistant = (data) => request.post('/system/assistant', data);
export const getOne = (id) => request.get(`/system/assistant/${id}`);
export const delOne = (id) => request.delete(`/system/assistant/${id}`);
export const dsApi = (id) => request.get(`/datasource/ws/${id}`);
export const embeddedApi = {
    getList: (pageNum, pageSize, params) => request.get(`/system/embedded/${pageNum}/${pageSize}`, {
        params,
    }),
    secret: (id) => request.patch(`/system/embedded/secret/${id}`),
    updateEmbedded: (data) => request.put('/system/embedded', data),
    addEmbedded: (data) => request.post('/system/embedded', data),
    deleteEmbedded: (params) => request.delete('/system/embedded', { data: params }),
    getOne: (id) => request.get(`/system/embedded/${id}`),
};
