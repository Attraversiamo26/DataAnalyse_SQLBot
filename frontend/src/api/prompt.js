import { request } from '@/utils/request';
export const promptApi = {
    getList: (pageNum, pageSize, type, params) => request.get(`/system/custom_prompt/${type}/page/${pageNum}/${pageSize}${params}`),
    updateEmbedded: (data) => request.put(`/system/custom_prompt`, data),
    deleteEmbedded: (params) => request.delete('/system/custom_prompt', { data: params }),
    getOne: (id) => request.get(`/system/custom_prompt/${id}`),
    export2Excel: (type, params) => request.get(`/system/custom_prompt/${type}/export`, {
        params,
        responseType: 'blob',
        requestOptions: { customError: true },
    }),
};
