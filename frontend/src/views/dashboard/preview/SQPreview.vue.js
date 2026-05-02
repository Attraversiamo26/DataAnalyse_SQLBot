import elementResizeDetectorMaker from 'element-resize-detector';
const dashboardStore = dashboardStoreWithOut();
const { curComponent } = storeToRefs(dashboardStore);
import { onMounted, toRefs, ref, computed, reactive } from 'vue';
import { dashboardStoreWithOut } from '@/stores/dashboard/dashboard.ts';
import { storeToRefs } from 'pinia';
import SQComponentWrapper from '@/views/dashboard/preview/SQComponentWrapper.vue';
import { useEmittLazy } from '@/utils/useEmitt.ts';
const props = defineProps({
    canvasStyleData: {
        type: Object,
        required: false,
        default: () => { },
    },
    componentData: {
        type: Object,
        required: true,
    },
    canvasViewInfo: {
        type: Object,
        required: true,
    },
    dashboardInfo: {
        type: Object,
        required: false,
        default: () => { },
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
    canvasId: {
        type: String,
        required: false,
        default: 'canvas-main',
    },
    showPosition: {
        required: false,
        type: String,
        default: 'preview',
    },
});
const { componentData, showPosition, canvasId } = toRefs(props);
const domId = 'preview-' + canvasId.value;
const previewCanvas = ref(null);
const renderReady = ref(true);
const state = reactive({
    initState: true,
    scrollMain: 0,
});
const cellWidth = ref(0);
const cellHeight = ref(0);
const baseWidth = ref(0);
const baseHeight = ref(0);
const baseMarginLeft = ref(0);
const baseMarginTop = ref(0);
const canvasStyle = computed(() => {
    return { background: '#f5f6f7' };
});
const restore = () => { };
function nowItemStyle(item) {
    return {
        width: cellWidth.value * item.sizeX - baseMarginLeft.value + 'px',
        height: cellHeight.value * item.sizeY - baseMarginTop.value + 'px',
        left: cellWidth.value * (item.x - 1) + baseMarginLeft.value + 'px',
        top: cellHeight.value * (item.y - 1) + baseMarginTop.value + 'px',
    };
}
const sizeInit = () => {
    if (previewCanvas.value) {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        const screenWidth = previewCanvas.value.offsetWidth;
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        const screenHeight = previewCanvas.value.offsetHeight;
        baseMarginLeft.value = 10;
        baseMarginTop.value = 10;
        baseWidth.value =
            (screenWidth - baseMarginLeft.value) / props.baseMatrixCount.x - baseMarginLeft.value;
        baseHeight.value =
            (screenHeight - baseMarginTop.value) / props.baseMatrixCount.y - baseMarginTop.value;
        cellWidth.value = baseWidth.value + baseMarginLeft.value;
        cellHeight.value = baseHeight.value + baseMarginTop.value;
    }
    useEmittLazy('view-render-all');
};
onMounted(() => {
    sizeInit();
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    elementResizeDetectorMaker().listenTo(document.getElementById(domId), sizeInit);
});
const __VLS_exposed = {
    restore,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.state.initState) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: (__VLS_ctx.domId),
        ref: "previewCanvas",
        ...{ class: "canvas-container" },
        ...{ style: (__VLS_ctx.canvasStyle) },
    });
    /** @type {typeof __VLS_ctx.previewCanvas} */ ;
    if (__VLS_ctx.renderReady) {
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.componentData))) {
            /** @type {[typeof SQComponentWrapper, ]} */ ;
            // @ts-ignore
            const __VLS_0 = __VLS_asFunctionalComponent(SQComponentWrapper, new SQComponentWrapper({
                key: (index),
                active: (!!__VLS_ctx.curComponent && item.id === __VLS_ctx.curComponent['id']),
                configItem: (item),
                canvasViewInfo: (__VLS_ctx.canvasViewInfo),
                showPosition: (__VLS_ctx.showPosition),
                canvasId: (__VLS_ctx.canvasId),
                ...{ style: (__VLS_ctx.nowItemStyle(item)) },
                index: (index),
            }));
            const __VLS_1 = __VLS_0({
                key: (index),
                active: (!!__VLS_ctx.curComponent && item.id === __VLS_ctx.curComponent['id']),
                configItem: (item),
                canvasViewInfo: (__VLS_ctx.canvasViewInfo),
                showPosition: (__VLS_ctx.showPosition),
                canvasId: (__VLS_ctx.canvasId),
                ...{ style: (__VLS_ctx.nowItemStyle(item)) },
                index: (index),
            }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        }
    }
}
/** @type {__VLS_StyleScopedClasses['canvas-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            curComponent: curComponent,
            SQComponentWrapper: SQComponentWrapper,
            componentData: componentData,
            showPosition: showPosition,
            canvasId: canvasId,
            domId: domId,
            previewCanvas: previewCanvas,
            renderReady: renderReady,
            state: state,
            canvasStyle: canvasStyle,
            nowItemStyle: nowItemStyle,
        };
    },
    props: {
        canvasStyleData: {
            type: Object,
            required: false,
            default: () => { },
        },
        componentData: {
            type: Object,
            required: true,
        },
        canvasViewInfo: {
            type: Object,
            required: true,
        },
        dashboardInfo: {
            type: Object,
            required: false,
            default: () => { },
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
        canvasId: {
            type: String,
            required: false,
            default: 'canvas-main',
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    props: {
        canvasStyleData: {
            type: Object,
            required: false,
            default: () => { },
        },
        componentData: {
            type: Object,
            required: true,
        },
        canvasViewInfo: {
            type: Object,
            required: true,
        },
        dashboardInfo: {
            type: Object,
            required: false,
            default: () => { },
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
        canvasId: {
            type: String,
            required: false,
            default: 'canvas-main',
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
