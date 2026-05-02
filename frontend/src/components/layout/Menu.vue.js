import { computed } from 'vue';
import { ElMenu } from 'element-plus-secondary';
import { useRoute, useRouter } from 'vue-router';
import MenuItem from './MenuItem.vue';
import { useUserStore } from '@/stores/user';
// import { routes } from '@/router'
const userStore = useUserStore();
const router = useRouter();
const __VLS_props = defineProps({
    collapse: Boolean,
});
const route = useRoute();
// const menuList = computed(() => route.matched[0]?.children || [])
const activeMenu = computed(() => route.path);
/* const activeIndex = computed(() => {
  const arr = route.path.split('/')
  return arr[arr.length - 1]
}) */
const showSysmenu = computed(() => {
    return route.path.includes('/system');
});
const formatRoute = (arr, parentPath = '') => {
    return arr.map((element) => {
        let children = [];
        const path = `${parentPath ? parentPath + '/' : ''}${element.path}`;
        if (element.children?.length) {
            children = formatRoute(element.children, path);
        }
        return {
            ...element,
            path,
            children,
        };
    });
};
const routerList = computed(() => {
    if (showSysmenu.value) {
        const [sysRouter] = formatRoute(router.getRoutes().filter((route) => route?.name === 'system'));
        return sysRouter.children;
    }
    const list = router.getRoutes().filter((route) => {
        return (!route.path.includes('embeddedPage') &&
            !route.path.includes('assistant') &&
            !route.path.includes('canvas') &&
            !route.path.includes('member') &&
            !route.path.includes('professional') &&
            !route.path.includes('401') &&
            !route.path.includes('training') &&
            !route.path.includes('prompt') &&
            !route.path.includes('permission') &&
            !route.path.includes('embeddedCommon') &&
            !route.path.includes('preview') &&
            !route.path.includes('audit') &&
            route.path !== '/login' &&
            route.path !== '/admin-login' &&
            route.path !== '/chatPreview' &&
            !route.path.includes('/system') &&
            !route.path.includes('/dsTable') &&
            !route.path.includes('/set') &&
            !route.path.includes('/dashboard') &&
            !route.path.includes('/chat') &&
            route.path !== '/' &&
            route.path !== '/home' &&
            ((route.path.includes('set') && userStore.isSpaceAdmin) || !route.redirect) &&
            route.path !== '/:pathMatch(.*)*' &&
            route.path.length > 1 &&
            !route.path.startsWith('/tools'));
    });
    return list;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElMenu;
/** @type {[typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    defaultActive: (__VLS_ctx.activeMenu),
    ...{ class: "el-menu-demo ed-menu-vertical" },
    collapse: (__VLS_ctx.collapse),
}));
const __VLS_2 = __VLS_1({
    defaultActive: (__VLS_ctx.activeMenu),
    ...{ class: "el-menu-demo ed-menu-vertical" },
    collapse: (__VLS_ctx.collapse),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
for (const [menu] of __VLS_getVForSourceType((__VLS_ctx.routerList))) {
    /** @type {[typeof MenuItem, typeof MenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(MenuItem, new MenuItem({
        key: (menu.path),
        menu: (menu),
    }));
    const __VLS_6 = __VLS_5({
        key: (menu.path),
        menu: (menu),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['el-menu-demo']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-menu-vertical']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElMenu: ElMenu,
            MenuItem: MenuItem,
            activeMenu: activeMenu,
            routerList: routerList,
        };
    },
    props: {
        collapse: Boolean,
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        collapse: Boolean,
    },
});
; /* PartiallyEnd: #4569/main.vue */
