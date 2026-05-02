import { ref, toRefs, computed } from 'vue';
import { findComponent } from '@/views/dashboard/components/component-list.ts';
const componentWrapperInnerRef = ref(null);
const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
    configItem: {
        type: Object,
        required: true,
    },
    canvasViewInfo: {
        type: Object,
        required: true,
    },
    showPosition: {
        required: false,
        type: String,
        default: 'preview',
    },
    canvasId: {
        type: String,
        default: 'canvas-main',
    },
});
const { configItem, showPosition } = toRefs(props);
const component = ref(null);
const wrapperId = 'wrapper-outer-id-' + configItem.value.id;
const viewDemoInnerId = computed(() => 'enlarge-inner-content-' + configItem.value.id);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: (__VLS_ctx.wrapperId),
    ...{ class: "wrapper-outer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: (__VLS_ctx.viewDemoInnerId),
    ref: "componentWrapperInnerRef",
    ...{ class: "wrapper-inner" },
});
/** @type {typeof __VLS_ctx.componentWrapperInnerRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "wrapper-inner-adaptor" },
});
const __VLS_0 = ((__VLS_ctx.findComponent(__VLS_ctx.configItem['component'])));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "component",
    ...{ class: "component" },
    canvasViewInfo: (__VLS_ctx.canvasViewInfo),
    viewInfo: (__VLS_ctx.canvasViewInfo[__VLS_ctx.configItem.id]),
    configItem: (__VLS_ctx.configItem),
    showPosition: (__VLS_ctx.showPosition),
    disabled: (true),
    active: (__VLS_ctx.active),
}));
const __VLS_2 = __VLS_1({
    ref: "component",
    ...{ class: "component" },
    canvasViewInfo: (__VLS_ctx.canvasViewInfo),
    viewInfo: (__VLS_ctx.canvasViewInfo[__VLS_ctx.configItem.id]),
    configItem: (__VLS_ctx.configItem),
    showPosition: (__VLS_ctx.showPosition),
    disabled: (true),
    active: (__VLS_ctx.active),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.component} */ ;
var __VLS_4 = {};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['wrapper-outer']} */ ;
/** @type {__VLS_StyleScopedClasses['wrapper-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['wrapper-inner-adaptor']} */ ;
/** @type {__VLS_StyleScopedClasses['component']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            findComponent: findComponent,
            componentWrapperInnerRef: componentWrapperInnerRef,
            configItem: configItem,
            showPosition: showPosition,
            component: component,
            wrapperId: wrapperId,
            viewDemoInnerId: viewDemoInnerId,
        };
    },
    props: {
        active: {
            type: Boolean,
            default: false,
        },
        configItem: {
            type: Object,
            required: true,
        },
        canvasViewInfo: {
            type: Object,
            required: true,
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        active: {
            type: Boolean,
            default: false,
        },
        configItem: {
            type: Object,
            required: true,
        },
        canvasViewInfo: {
            type: Object,
            required: true,
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
