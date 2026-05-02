import { request } from '@/utils/request';
export const trainingApi = {
    getList: (pageNum, pageSize, params) => request.get(`/system/data-training/page/${pageNum}/${pageSize}`, {
        params,
    }),
    updateEmbedded: (data) => request.put('/system/data-training', data),
    deleteEmbedded: (params) => request.delete('/system/data-training', { data: params }),
    getOne: (id) => request.get(`/system/data-training/${id}`),
    enable: (id, enabled) => request.get(`/system/data-training/${id}/enable/${enabled}`),
    export2Excel: (params) => request.get(`/system/data-training/export`, {
        params,
        responseType: 'blob',
        requestOptions: { customError: true },
    }),
};
