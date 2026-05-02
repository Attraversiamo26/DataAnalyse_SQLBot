import { request } from '@/utils/request';
export const AuthApi = {
    login: (credentials) => {
        const entryCredentials = {
            username: credentials.username,
            password: credentials.password,
        };
        return request.post('/login/access-token', entryCredentials, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    },
    logout: (data) => request.post('/login/logout', data),
    info: () => request.get('/user/info'),
};
