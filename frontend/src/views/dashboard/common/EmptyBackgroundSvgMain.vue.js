import nothingSelectDashboard from '@/assets/svg/tool-bar.svg';
const __VLS_props = defineProps({
    imageSize: {
        type: Number,
        default: 125,
    },
    description: {
        type: String,
        default: '',
    },
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ed-empty empty-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ed-empty__image" },
    ...{ style: {} },
});
const __VLS_0 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    size: "125",
    ...{ class: "icon-primary" },
}));
const __VLS_2 = __VLS_1({
    size: "125",
    ...{ class: "icon-primary" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.nothingSelectDashboard;
/** @type {[typeof __VLS_components.NothingSelectDashboard, typeof __VLS_components.nothingSelectDashboard, typeof __VLS_components.NothingSelectDashboard, typeof __VLS_components.nothingSelectDashboard, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ed-empty__description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.description);
/** @type {__VLS_StyleScopedClasses['ed-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-info']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-empty__image']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-empty__description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            nothingSelectDashboard: nothingSelectDashboard,
        };
    },
    props: {
        imageSize: {
            type: Number,
            default: 125,
        },
        description: {
            type: String,
            default: '',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        imageSize: {
            type: Number,
            default: 125,
        },
        description: {
            type: String,
            default: '',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
