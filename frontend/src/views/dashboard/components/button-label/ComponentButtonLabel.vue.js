import { toRefs } from 'vue';
const props = defineProps({
    title: { type: String, required: false, default: '' },
    tips: { type: String, required: false, default: '' },
    iconName: { type: String, required: false, default: '' },
    showSplitLine: { type: Boolean, required: false, default: false },
    active: { type: Boolean, required: false, default: false },
});
const { title, tips, iconName, showSplitLine } = toRefs(props);
const emits = defineEmits(['customClick']);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex-align-center" },
});
const __VLS_0 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: "group_icon" },
    title: (__VLS_ctx.tips),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "group_icon" },
    title: (__VLS_ctx.tips),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.emits('customClick');
    }
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    span: (24),
    ...{ class: "group_inner" },
    ...{ class: ({ 'inner-active': __VLS_ctx.active }) },
}));
const __VLS_10 = __VLS_9({
    span: (24),
    ...{ class: "group_inner" },
    ...{ class: ({ 'inner-active': __VLS_ctx.active }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = ((__VLS_ctx.iconName));
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ class: "svg-icon toolbar-icon" },
}));
const __VLS_14 = __VLS_13({
    ...{ class: "svg-icon toolbar-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.title);
var __VLS_11;
var __VLS_3;
if (__VLS_ctx.showSplitLine) {
    const __VLS_16 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ class: "group-right-border" },
        direction: "vertical",
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "group-right-border" },
        direction: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
/** @type {__VLS_StyleScopedClasses['flex-align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['group_icon']} */ ;
/** @type {__VLS_StyleScopedClasses['group_inner']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-active']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['group-right-border']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            title: title,
            tips: tips,
            iconName: iconName,
            showSplitLine: showSplitLine,
            emits: emits,
        };
    },
    emits: {},
    props: {
        title: { type: String, required: false, default: '' },
        tips: { type: String, required: false, default: '' },
        iconName: { type: String, required: false, default: '' },
        showSplitLine: { type: Boolean, required: false, default: false },
        active: { type: Boolean, required: false, default: false },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        title: { type: String, required: false, default: '' },
        tips: { type: String, required: false, default: '' },
        iconName: { type: String, required: false, default: '' },
        showSplitLine: { type: Boolean, required: false, default: false },
        active: { type: Boolean, required: false, default: false },
    },
});
; /* PartiallyEnd: #4569/main.vue */
