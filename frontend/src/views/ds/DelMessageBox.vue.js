const __VLS_props = defineProps({
    name: {
        type: String,
        default: '-',
    },
    panelNum: {
        type: Number,
        default: 0,
    },
    smartNum: {
        type: Number,
        default: 0,
    },
    t: {
        type: Function,
        default: () => { },
    },
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "del-box_message" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "del-title" },
});
(__VLS_ctx.t('datasource.data_source', { msg: __VLS_ctx.name }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "use-panel" },
});
(__VLS_ctx.t('workspace.confirm_to_delete'));
/** @type {__VLS_StyleScopedClasses['del-box_message']} */ ;
/** @type {__VLS_StyleScopedClasses['del-title']} */ ;
/** @type {__VLS_StyleScopedClasses['use-panel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        name: {
            type: String,
            default: '-',
        },
        panelNum: {
            type: Number,
            default: 0,
        },
        smartNum: {
            type: Number,
            default: 0,
        },
        t: {
            type: Function,
            default: () => { },
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        name: {
            type: String,
            default: '-',
        },
        panelNum: {
            type: Number,
            default: 0,
        },
        smartNum: {
            type: Number,
            default: 0,
        },
        t: {
            type: Function,
            default: () => { },
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
