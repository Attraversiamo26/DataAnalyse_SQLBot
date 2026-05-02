import { request } from '@/utils/request';
export const dashboardApi = {
    list_resource: (params) => request.post('/dashboard/list_resource', params),
    load_resource: (params) => request.post('/dashboard/load_resource', params),
    create_resource: (params) => request.post('/dashboard/create_resource', params),
    update_resource: (params) => request.post('/dashboard/update_resource', params),
    create_canvas: (params) => request.post('/dashboard/create_canvas', params),
    update_canvas: (params) => request.post('/dashboard/update_canvas', params),
    check_name: (params) => request.post('/dashboard/check_name', params),
    delete_resource: (params) => request.delete(`/dashboard/delete_resource/${params.id}/${params.name}`, params),
    move_resource: (params) => request.delete(`/dashboard/move_resource/${params.id}`, params),
};
