import { computed } from 'vue';
import { ElMenu } from 'element-plus-secondary';
import { useRoute } from 'vue-router';
import MenuItem from './MenuItem.vue';
const __VLS_props = defineProps({
    collapse: Boolean,
});
const route = useRoute();
const activeMenu = computed(() => route.path);
// 工具菜单列表
const toolMenuList = computed(() => [
    {
        path: '/home',
        name: 'home-assistant',
        meta: { title: '智能助手', iconActive: 'icon_ai', iconDeActive: 'noIcon_ai' },
    },
    {
        path: '/skill/list',
        name: 'skill-list',
        meta: { title: '技能管理', iconActive: 'skill', iconDeActive: 'noSkill' },
    },
    {
        path: '/tools/tool-select',
        name: 'tool-select',
        meta: { title: '工具选择', iconActive: 'set', iconDeActive: 'noSet' },
        children: [
            {
                path: '/tools/chat',
                name: 'chat',
                meta: { title: '智能问数', iconActive: 'chat', iconDeActive: 'noChat' },
            },
            {
                path: '/tools/analysis',
                name: 'analysis',
                meta: { title: '数据分析', iconActive: 'dashboard', iconDeActive: 'noDashboard' },
            },
            {
                path: '/tools/report',
                name: 'report',
                meta: { title: '报告生成', iconActive: 'dashboard', iconDeActive: 'noDashboard' },
            },
        ],
    },
    {
        path: '/tools/datasource',
        name: 'datasource',
        meta: { title: '数据源管理', iconActive: 'ds', iconDeActive: 'noDs' },
    },
    {
        path: '/chat/history',
        name: 'chat-history',
        meta: { title: '会话管理', iconActive: 'chat', iconDeActive: 'noChat' },
    },
    {
        path: '/tools/terminology',
        name: 'terminology',
        meta: { title: '术语配置', iconActive: 'set', iconDeActive: 'noSet' },
    },
    {
        path: '/tools/system',
        name: 'system',
        meta: { title: '系统管理', iconActive: 'set', iconDeActive: 'noSet' },
        children: [
            {
                path: '/tools/system/user',
                name: 'system-user',
                meta: { title: '用户管理', iconActive: 'user', iconDeActive: 'noUser' },
            },
            {
                path: '/tools/system/workspace',
                name: 'system-workspace',
                meta: { title: '工作空间', iconActive: 'workspace', iconDeActive: 'noWorkspace' },
            },
            {
                path: '/tools/system/model',
                name: 'system-model',
                meta: { title: 'AI模型配置', iconActive: 'model', iconDeActive: 'noModel' },
            },
            {
                path: '/tools/system/setting',
                name: 'system-setting',
                meta: { title: '系统设置', iconActive: 'set', iconDeActive: 'noSet' },
                children: [
                    {
                        path: '/tools/system/setting/appearance',
                        name: 'system-appearance',
                        meta: { title: '外观设置' },
                    },
                    {
                        path: '/tools/system/setting/parameter',
                        name: 'system-parameter',
                        meta: { title: '参数配置' },
                    },
                    {
                        path: '/tools/system/setting/variables',
                        name: 'system-variables',
                        meta: { title: '系统变量' },
                    },
                    {
                        path: '/tools/system/setting/authentication',
                        name: 'system-authentication',
                        meta: { title: '认证设置' },
                    },
                    {
                        path: '/tools/system/setting/platform',
                        name: 'system-platform',
                        meta: { title: '平台设置' },
                    },
                ],
            },
            {
                path: '/tools/system/audit',
                name: 'system-audit',
                meta: { title: '审计日志', iconActive: 'log', iconDeActive: 'noLog' },
            },
        ],
    },
]);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-sub-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-sub-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-sub-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-sub-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-menu--popup']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-sub-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['subTitleMenu']} */ ;
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
for (const [menu] of __VLS_getVForSourceType((__VLS_ctx.toolMenuList))) {
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
            toolMenuList: toolMenuList,
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
