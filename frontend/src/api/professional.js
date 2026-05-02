import { request } from '@/utils/request';
export const professionalApi = {
    getList: (pageNum, pageSize, params) => request.get(`/system/terminology/page/${pageNum}/${pageSize}${params}`),
    updateEmbedded: (data) => request.put('/system/terminology', data),
    deleteEmbedded: (params) => request.delete('/system/terminology', { data: params }),
    getOne: (id) => request.get(`/system/terminology/${id}`),
    enable: (id, enabled) => request.get(`/system/terminology/${id}/enable/${enabled}`),
    export2Excel: (params) => request.get(`/system/terminology/export`, {
        params,
        responseType: 'blob',
        requestOptions: { customError: true },
    }),
};
