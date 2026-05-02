import SQPreview from '@/views/dashboard/preview/SQPreview.vue';
import { load_resource_prepare } from '@/views/dashboard/utils/canvasUtils.ts';
import { onMounted, reactive, ref } from 'vue';
import router from '@/router';
const previewCanvasContainer = ref(null);
const dashboardPreview = ref(null);
const dataInitState = ref(true);
const downloadStatus = ref(false);
const state = reactive({
    resourceId: null,
    canvasDataPreview: [],
    canvasStylePreview: {},
    canvasViewInfoPreview: {},
    dashboardInfo: {},
});
onMounted(() => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    state.resourceId = router.currentRoute.value.query.resourceId;
    if (state.resourceId) {
        loadCanvasData({ id: state.resourceId });
    }
});
const loadCanvasData = (params) => {
    dataInitState.value = false;
    load_resource_prepare({ id: params.id }, function ({ dashboardInfo, canvasDataResult, canvasStyleResult, canvasViewInfoPreview }) {
        state.canvasDataPreview = canvasDataResult;
        state.canvasStylePreview = canvasStyleResult;
        state.canvasViewInfoPreview = canvasViewInfoPreview;
        state.dashboardInfo = dashboardInfo;
        dataInitState.value = true;
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "sq-preview-content",
    ref: "previewCanvasContainer",
    ...{ class: "content" },
});
/** @type {typeof __VLS_ctx.previewCanvasContainer} */ ;
if (__VLS_ctx.state.canvasStylePreview && __VLS_ctx.dataInitState) {
    /** @type {[typeof SQPreview, typeof SQPreview, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(SQPreview, new SQPreview({
        ref: "dashboardPreview",
        dashboardInfo: (__VLS_ctx.state.dashboardInfo),
        componentData: (__VLS_ctx.state.canvasDataPreview),
        canvasStyleData: (__VLS_ctx.state.canvasStylePreview),
        canvasViewInfo: (__VLS_ctx.state.canvasViewInfoPreview),
        downloadStatus: (__VLS_ctx.downloadStatus),
    }));
    const __VLS_1 = __VLS_0({
        ref: "dashboardPreview",
        dashboardInfo: (__VLS_ctx.state.dashboardInfo),
        componentData: (__VLS_ctx.state.canvasDataPreview),
        canvasStyleData: (__VLS_ctx.state.canvasStylePreview),
        canvasViewInfo: (__VLS_ctx.state.canvasViewInfoPreview),
        downloadStatus: (__VLS_ctx.downloadStatus),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    /** @type {typeof __VLS_ctx.dashboardPreview} */ ;
    var __VLS_3 = {};
    var __VLS_2;
}
/** @type {__VLS_StyleScopedClasses['content']} */ ;
// @ts-ignore
var __VLS_4 = __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SQPreview: SQPreview,
            previewCanvasContainer: previewCanvasContainer,
            dashboardPreview: dashboardPreview,
            dataInitState: dataInitState,
            downloadStatus: downloadStatus,
            state: state,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
