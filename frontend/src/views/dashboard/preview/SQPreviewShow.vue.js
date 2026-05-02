import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import { reactive, ref, toRefs, onBeforeMount, computed } from 'vue';
import { load_resource_prepare } from '@/views/dashboard/utils/canvasUtils';
import { Icon } from '@/components/icon-custom';
import ResourceTree from '@/views/dashboard/common/ResourceTree.vue';
import SQPreview from '@/views/dashboard/preview/SQPreview.vue';
import SQPreviewHead from '@/views/dashboard/preview/SQPreviewHead.vue';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import EmptyBackgroundSvg from '@/views/dashboard/common/EmptyBackgroundSvg.vue';
import { dashboardStoreWithOut } from '@/stores/dashboard/dashboard.ts';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const dashboardStore = dashboardStoreWithOut();
const previewCanvasContainer = ref(null);
const dashboardPreview = ref(null);
const slideShow = ref(true);
const dataInitState = ref(true);
const state = reactive({
    canvasDataPreview: [],
    canvasStylePreview: {},
    canvasViewInfoPreview: {},
    dashboardInfo: {},
});
const props = defineProps({
    showPosition: {
        required: false,
        type: String,
        default: 'preview',
    },
    noClose: {
        required: false,
        type: Boolean,
        default: false,
    },
});
const { showPosition } = toRefs(props);
const resourceTreeRef = ref();
const hasTreeData = computed(() => {
    return resourceTreeRef.value?.hasData;
});
const mounted = computed(() => {
    return resourceTreeRef.value?.mounted;
});
function createNew() {
    resourceTreeRef.value?.createNewObject();
}
const stateInit = () => {
    state.canvasDataPreview = [];
    state.canvasStylePreview = {};
    state.canvasViewInfoPreview = {};
    state.dashboardInfo = {};
};
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
const getPreviewStateInfo = () => {
    return state;
};
const reload = (params) => {
    loadCanvasData(params);
};
const resourceNodeClick = (prams) => {
    loadCanvasData(prams);
};
// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
const previewShowFlag = computed(() => !!state.dashboardInfo?.name);
onBeforeMount(() => {
    if (showPosition.value === 'preview') {
        dashboardStore.canvasDataInit();
    }
});
const sideTreeStatus = ref(true);
const __VLS_exposed = {
    getPreviewStateInfo,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dv-preview dv-teleport-query no-padding" },
});
const __VLS_0 = {}.ElAside;
/** @type {[typeof __VLS_components.ElAside, typeof __VLS_components.elAside, typeof __VLS_components.ElAside, typeof __VLS_components.elAside, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "node",
    ...{ class: "resource-area" },
    ...{ class: ({ 'close-side': !__VLS_ctx.slideShow, retract: !__VLS_ctx.sideTreeStatus }) },
}));
const __VLS_2 = __VLS_1({
    ref: "node",
    ...{ class: "resource-area" },
    ...{ class: ({ 'close-side': !__VLS_ctx.slideShow, retract: !__VLS_ctx.sideTreeStatus }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.node} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
/** @type {[typeof ResourceTree, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(ResourceTree, new ResourceTree({
    ...{ 'onNodeClick': {} },
    ...{ 'onDeleteCurResource': {} },
    ref: "resourceTreeRef",
    curCanvasType: ('dashboard'),
    showPosition: (__VLS_ctx.showPosition),
}));
const __VLS_7 = __VLS_6({
    ...{ 'onNodeClick': {} },
    ...{ 'onDeleteCurResource': {} },
    ref: "resourceTreeRef",
    curCanvasType: ('dashboard'),
    showPosition: (__VLS_ctx.showPosition),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_9;
let __VLS_10;
let __VLS_11;
const __VLS_12 = {
    onNodeClick: (__VLS_ctx.resourceNodeClick)
};
const __VLS_13 = {
    onDeleteCurResource: (__VLS_ctx.stateInit)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.slideShow) }, null, null);
/** @type {typeof __VLS_ctx.resourceTreeRef} */ ;
var __VLS_14 = {};
var __VLS_8;
var __VLS_3;
const __VLS_16 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "preview-area" },
    ...{ class: ({ 'no-data': !__VLS_ctx.state.dashboardInfo }) },
}));
const __VLS_18 = __VLS_17({
    ...{ class: "preview-area" },
    ...{ class: ({ 'no-data': !__VLS_ctx.state.dashboardInfo }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.dataInitState) }, null, null);
__VLS_19.slots.default;
if (__VLS_ctx.previewShowFlag) {
    /** @type {[typeof SQPreviewHead, ]} */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(SQPreviewHead, new SQPreviewHead({
        ...{ 'onReload': {} },
        dashboardInfo: (__VLS_ctx.state.dashboardInfo),
    }));
    const __VLS_21 = __VLS_20({
        ...{ 'onReload': {} },
        dashboardInfo: (__VLS_ctx.state.dashboardInfo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    let __VLS_23;
    let __VLS_24;
    let __VLS_25;
    const __VLS_26 = {
        onReload: (__VLS_ctx.reload)
    };
    var __VLS_22;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: "sq-preview-content",
        ref: "previewCanvasContainer",
        ...{ class: "content" },
    });
    /** @type {typeof __VLS_ctx.previewCanvasContainer} */ ;
    if (__VLS_ctx.state.canvasStylePreview && __VLS_ctx.dataInitState) {
        /** @type {[typeof SQPreview, typeof SQPreview, ]} */ ;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(SQPreview, new SQPreview({
            ref: "dashboardPreview",
            dashboardInfo: (__VLS_ctx.state.dashboardInfo),
            componentData: (__VLS_ctx.state.canvasDataPreview),
            canvasStyleData: (__VLS_ctx.state.canvasStylePreview),
            canvasViewInfo: (__VLS_ctx.state.canvasViewInfoPreview),
            showPosition: (__VLS_ctx.showPosition),
        }));
        const __VLS_28 = __VLS_27({
            ref: "dashboardPreview",
            dashboardInfo: (__VLS_ctx.state.dashboardInfo),
            componentData: (__VLS_ctx.state.canvasDataPreview),
            canvasStyleData: (__VLS_ctx.state.canvasStylePreview),
            canvasViewInfo: (__VLS_ctx.state.canvasViewInfoPreview),
            showPosition: (__VLS_ctx.showPosition),
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        /** @type {typeof __VLS_ctx.dashboardPreview} */ ;
        var __VLS_30 = {};
        var __VLS_29;
    }
}
else if (__VLS_ctx.hasTreeData && __VLS_ctx.mounted) {
    /** @type {[typeof EmptyBackgroundSvg, ]} */ ;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(EmptyBackgroundSvg, new EmptyBackgroundSvg({
        description: (__VLS_ctx.t('dashboard.select_dashboard_tips')),
    }));
    const __VLS_33 = __VLS_32({
        description: (__VLS_ctx.t('dashboard.select_dashboard_tips')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
}
else if (__VLS_ctx.mounted) {
    /** @type {[typeof EmptyBackground, typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.t('dashboard.no_dashboard_info')),
        imgType: "none",
    }));
    const __VLS_36 = __VLS_35({
        description: (__VLS_ctx.t('dashboard.no_dashboard_info')),
        imgType: "none",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_37.slots.default;
    const __VLS_38 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_40 = __VLS_39({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    let __VLS_42;
    let __VLS_43;
    let __VLS_44;
    const __VLS_45 = {
        onClick: (__VLS_ctx.createNew)
    };
    __VLS_41.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_41.slots;
        const __VLS_46 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
            name: "icon_add_outlined",
        }));
        const __VLS_48 = __VLS_47({
            name: "icon_add_outlined",
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        __VLS_49.slots.default;
        const __VLS_50 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
            ...{ class: "svg-icon" },
        }));
        const __VLS_52 = __VLS_51({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        var __VLS_49;
    }
    (__VLS_ctx.t('dashboard.new_dashboard'));
    var __VLS_41;
    var __VLS_37;
}
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['dv-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['dv-teleport-query']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-area']} */ ;
/** @type {__VLS_StyleScopedClasses['retract']} */ ;
/** @type {__VLS_StyleScopedClasses['close-side']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-area']} */ ;
/** @type {__VLS_StyleScopedClasses['no-data']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4, __VLS_15 = __VLS_14, __VLS_31 = __VLS_30;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_add_outlined: icon_add_outlined,
            Icon: Icon,
            ResourceTree: ResourceTree,
            SQPreview: SQPreview,
            SQPreviewHead: SQPreviewHead,
            EmptyBackground: EmptyBackground,
            EmptyBackgroundSvg: EmptyBackgroundSvg,
            t: t,
            previewCanvasContainer: previewCanvasContainer,
            dashboardPreview: dashboardPreview,
            slideShow: slideShow,
            dataInitState: dataInitState,
            state: state,
            showPosition: showPosition,
            resourceTreeRef: resourceTreeRef,
            hasTreeData: hasTreeData,
            mounted: mounted,
            createNew: createNew,
            stateInit: stateInit,
            reload: reload,
            resourceNodeClick: resourceNodeClick,
            previewShowFlag: previewShowFlag,
            sideTreeStatus: sideTreeStatus,
        };
    },
    props: {
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        noClose: {
            required: false,
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
    props: {
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        noClose: {
            required: false,
            type: Boolean,
            default: false,
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
