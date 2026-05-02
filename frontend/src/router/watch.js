import { useCache } from '@/utils/useCache';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
import { useUserStore } from '@/stores/user';
import { generateDynamicRouters } from './dynamic';
const appearanceStore = useAppearanceStoreWithOut();
const userStore = useUserStore();
const { wsCache } = useCache();
export const watchRouter = (router) => {
    router.beforeEach(async (to, _from, next) => {
        await loadXpackStatic();
        // 只在第一次加载时设置外观
        if (!appearanceStore.getLoaded) {
            await appearanceStore.setAppearance();
        }
        // 设置默认用户信息
        if (!userStore.getUid) {
            userStore.setUid('1');
            userStore.setAccount('admin');
            userStore.setName('Admin');
            userStore.setOid('1');
            userStore.setLanguage('zh-CN');
            userStore.setToken('default-token');
            // 存储token到缓存
            wsCache.set('user.token', 'default-token');
            generateDynamicRouters(router);
        }
        // 如果访问根路径或登录页面，直接跳转到聊天页面
        if (to.path === '/' || to.path === '/login' || to.path === '/admin-login') {
            next('/chat');
            return;
        }
        if (to.path === '/docs') {
            location.href = to.fullPath;
            return;
        }
        next();
    });
};
const loadXpackStatic = () => {
    // 暂时跳过加载 xpack 静态脚本
    return Promise.resolve();
};
