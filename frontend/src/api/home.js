import { request } from '@/utils/request';
export const homeApi = {
    chat: (data) => request.post('/home/chat', data),
};
