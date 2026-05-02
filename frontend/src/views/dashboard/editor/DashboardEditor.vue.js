import CanvasCore from '@/views/dashboard/canvas/CanvasCore.vue';
import { nextTick, onMounted, ref } from 'vue';
import { useEmitt, useEmittLazy } from '@/utils/useEmitt.ts';
const canvasCoreRef = ref(null);
const dashboardEditorRef = ref(null);
const baseWidth = ref(0);
const baseHeight = ref(0);
const baseMarginLeft = ref(0);
const baseMarginTop = ref(0);
// Props
const props = defineProps({
    canvasId: {
        type: String,
        default: 'canvas-main',
    },
    parentConfigItem: {
        type: Object,
        required: false,
        default: null,
    },
    dashboardInfo: {
        type: Object,
        required: false,
        default: null,
    },
    canvasViewInfo: {
        type: Object,
        required: false,
        default: () => { },
    },
    canvasStyleData: {
        type: Object,
        required: false,
        default: null,
    },
    canvasComponentData: {
        type: Array,
        required: true,
    },
    baseMatrixCount: {
        type: Object,
        default: () => {
            return {
                x: 72,
                y: 36,
            };
        },
    },
    moveInActive: {
        type: Boolean,
        default: false,
    },
});
const canvasSizeInit = () => {
    sizeInit();
    if (canvasCoreRef.value) {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        canvasCoreRef.value.sizeInit();
    }
};
const sizeInit = () => {
    if (dashboardEditorRef.value) {
        baseMarginLeft.value = 16;
        baseMarginTop.value = 16;
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        const screenWidth = dashboardEditorRef.value.offsetWidth;
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        const screenHeight = dashboardEditorRef.value.offsetHeight;
        baseWidth.value =
            (screenWidth - baseMarginLeft.value) / props.baseMatrixCount.x - baseMarginLeft.value;
        baseHeight.value =
            (screenHeight - baseMarginTop.value) / props.baseMatrixCount.y - baseMarginTop.value;
        useEmittLazy('view-render-all');
    }
};
const addItemToBox = (item) => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    canvasCoreRef.value.addItemBox(item);
};
const findPositionX = (width) => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    return canvasCoreRef.value.findPositionX(width);
};
useEmitt({
    name: 'custom-canvas-resize',
    callback: canvasSizeInit,
});
const __VLS_exposed = {
    canvasSizeInit,
    addItemToBox,
    findPositionX,
};
defineExpose(__VLS_exposed);
onMounted(() => {
    window.addEventListener('resize', canvasSizeInit);
    nextTick(() => {
        if (dashboardEditorRef.value) {
            sizeInit();
            nextTick(() => {
                if (canvasCoreRef.value) {
                    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    canvasCoreRef.value.init();
                }
            });
        }
    });
});
const emits = defineEmits(['parentAddItemBox']);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "dashboardEditorRef",
    ...{ class: "dashboard-editor-main" },
    ...{ class: ({ 'move-in-active': __VLS_ctx.moveInActive }) },
});
/** @type {typeof __VLS_ctx.dashboardEditorRef} */ ;
/** @type {[typeof CanvasCore, typeof CanvasCore, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(CanvasCore, new CanvasCore({
    ...{ 'onParentAddItemBox': {} },
    ref: "canvasCoreRef",
    baseWidth: (__VLS_ctx.baseWidth),
    baseHeight: (__VLS_ctx.baseHeight),
    baseMarginLeft: (__VLS_ctx.baseMarginLeft),
    baseMarginTop: (__VLS_ctx.baseMarginTop),
    canvasComponentData: (__VLS_ctx.canvasComponentData),
    canvasStyleData: (__VLS_ctx.canvasStyleData),
    canvasViewInfo: (__VLS_ctx.canvasViewInfo),
    dashboardInfo: (__VLS_ctx.dashboardInfo),
    parentConfigItem: (__VLS_ctx.parentConfigItem),
    canvasId: (__VLS_ctx.canvasId),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onParentAddItemBox': {} },
    ref: "canvasCoreRef",
    baseWidth: (__VLS_ctx.baseWidth),
    baseHeight: (__VLS_ctx.baseHeight),
    baseMarginLeft: (__VLS_ctx.baseMarginLeft),
    baseMarginTop: (__VLS_ctx.baseMarginTop),
    canvasComponentData: (__VLS_ctx.canvasComponentData),
    canvasStyleData: (__VLS_ctx.canvasStyleData),
    canvasViewInfo: (__VLS_ctx.canvasViewInfo),
    dashboardInfo: (__VLS_ctx.dashboardInfo),
    parentConfigItem: (__VLS_ctx.parentConfigItem),
    canvasId: (__VLS_ctx.canvasId),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onParentAddItemBox: ((item) => __VLS_ctx.emits('parentAddItemBox', item))
};
/** @type {typeof __VLS_ctx.canvasCoreRef} */ ;
var __VLS_7 = {};
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['dashboard-editor-main']} */ ;
/** @type {__VLS_StyleScopedClasses['move-in-active']} */ ;
// @ts-ignore
var __VLS_8 = __VLS_7;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CanvasCore: CanvasCore,
            canvasCoreRef: canvasCoreRef,
            dashboardEditorRef: dashboardEditorRef,
            baseWidth: baseWidth,
            baseHeight: baseHeight,
            baseMarginLeft: baseMarginLeft,
            baseMarginTop: baseMarginTop,
            emits: emits,
        };
    },
    emits: {},
    props: {
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
        parentConfigItem: {
            type: Object,
            required: false,
            default: null,
        },
        dashboardInfo: {
            type: Object,
            required: false,
            default: null,
        },
        canvasViewInfo: {
            type: Object,
            required: false,
            default: () => { },
        },
        canvasStyleData: {
            type: Object,
            required: false,
            default: null,
        },
        canvasComponentData: {
            type: Array,
            required: true,
        },
        baseMatrixCount: {
            type: Object,
            default: () => {
                return {
                    x: 72,
                    y: 36,
                };
            },
        },
        moveInActive: {
            type: Boolean,
            default: false,
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    props: {
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
        parentConfigItem: {
            type: Object,
            required: false,
            default: null,
        },
        dashboardInfo: {
            type: Object,
            required: false,
            default: null,
        },
        canvasViewInfo: {
            type: Object,
            required: false,
            default: () => { },
        },
        canvasStyleData: {
            type: Object,
            required: false,
            default: null,
        },
        canvasComponentData: {
            type: Array,
            required: true,
        },
        baseMatrixCount: {
            type: Object,
            default: () => {
                return {
                    x: 72,
                    y: 36,
                };
            },
        },
        moveInActive: {
            type: Boolean,
            default: false,
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
