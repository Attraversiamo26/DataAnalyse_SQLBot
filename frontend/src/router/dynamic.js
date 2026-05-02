import LayoutDsl from '@/components/layout/LayoutDsl.vue';
import Datasource from '@/views/ds/Datasource.vue';
import SetAssistant from '@/views/system/embedded/iframe.vue';
import { i18n } from '@/i18n';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
const t = i18n.global.t;
const dynamicRouterList = [
    {
        path: '/ds',
        component: LayoutDsl,
        name: 'ds-menu',
        redirect: '/ds/index',
        children: [
            {
                path: 'index',
                name: 'ds',
                component: Datasource,
                meta: { title: t('menu.Data Connections'), iconActive: 'ds', iconDeActive: 'noDs' },
            },
        ],
    },
    {
        path: '/as',
        component: LayoutDsl,
        name: 'as-menu',
        redirect: '/as/index',
        children: [
            {
                path: 'index',
                name: 'as',
                component: SetAssistant,
                meta: {
                    title: t('embedded.assistant_app'),
                    iconActive: 'embedded',
                    iconDeActive: 'noEmbedded',
                },
            },
        ],
        meta: { title: t('embedded.assistant_app') },
    },
];
const reduceRouters = (router, invalid_router_name_list) => {
    const tree = router.getRoutes();
    const invalid_name_set = [];
    invalid_router_name_list.forEach((router_name) => {
        router.removeRoute(router_name);
        invalid_name_set.push(router_name);
    });
    const pathsSet = new Set(invalid_router_name_list);
    function processNode(node) {
        if (node.name && pathsSet.has(node.name)) {
            return true;
        }
        if (node.children) {
            const newChildren = [];
            for (const child of node.children) {
                const shouldRemove = processNode(child);
                if (!shouldRemove) {
                    newChildren.push(child);
                }
            }
            if (newChildren.length > 0) {
                node.children = newChildren;
                return false;
            }
            else {
                node.children = undefined;
            }
        }
        return false;
    }
    let i = 0;
    while (i < tree.length) {
        if (processNode(tree[i])) {
            tree.splice(i, 1);
        }
        else {
            i++;
        }
    }
};
export const generateDynamicRouters = (router) => {
    if (userStore.isAdmin || userStore.isSpaceAdmin) {
        dynamicRouterList.forEach((item) => {
            if (!item.parent) {
                router.addRoute(item);
            }
            else {
                router.addRoute(item.parent, item);
                const parentRoute = router.getRoutes().find((r) => r.name === item.parent);
                if (parentRoute?.children) {
                    parentRoute.children.push(item);
                }
            }
        });
    }
    else {
        const router_name_list = [];
        const stack = [...dynamicRouterList];
        while (stack.length) {
            const item = stack.pop();
            if (item.name) {
                router_name_list.push(item.name);
            }
            if (item.children?.length) {
                item.children.forEach((child) => {
                    stack.push(child);
                });
            }
        }
        reduceRouters(router, router_name_list);
    }
};
