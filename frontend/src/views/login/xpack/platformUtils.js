import { request } from '@/utils/request';
export const queryClientInfo = (origin) => {
    const url = `/system/platform/client/${origin}`;
    return request.get(url);
};
