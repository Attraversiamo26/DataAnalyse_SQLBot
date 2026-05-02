import { onMounted, ref, computed, reactive } from 'vue';
import Toolbar from '@/views/dashboard/editor/Toolbar.vue';
import DashboardEditor from '@/views/dashboard/editor/DashboardEditor.vue';
import { findNewComponentFromList } from '@/views/dashboard/components/component-list.ts';
import { guid } from '@/utils/canvas.ts';
import cloneDeep from 'lodash/cloneDeep';
import { storeToRefs } from 'pinia';
import { dashboardStoreWithOut } from '@/stores/dashboard/dashboard.ts';
import router from '@/router';
import { initCanvasData } from '@/views/dashboard/utils/canvasUtils.ts';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const dashboardStore = dashboardStoreWithOut();
const { componentData, canvasViewInfo, fullscreenFlag, baseMatrixCount } = storeToRefs(dashboardStore);
const dataInitState = ref(true);
const state = reactive({
    routerPid: null,
    resourceId: null,
    opt: null,
});
const dashboardEditorInnerRef = ref(null);
const addComponents = (componentType, views) => {
    const component = cloneDeep(findNewComponentFromList(componentType));
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    component.x = findPositionX(component.sizeX);
    if (views) {
        views.forEach((view, index) => {
            const target = cloneDeep(view);
            delete target.chart.sourceType;
            if (index > 0) {
                // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
                component.x = ((component.x + component?.sizeX - 1) % baseMatrixCount.value.x) + 1;
            }
            addComponent(component, target);
        });
    }
    else {
        addComponent(component);
    }
};
const addComponent = (componentSource, viewInfo) => {
    const component = cloneDeep(componentSource);
    if (component && dashboardEditorInnerRef.value) {
        component.id = guid();
        // add view
        if (component?.component === 'SQView' && !!viewInfo) {
            viewInfo['sourceId'] = viewInfo['id'];
            viewInfo['id'] = component.id;
            dashboardStore.addCanvasViewInfo(viewInfo);
        }
        else if (component.component === 'SQTab') {
            const subTabName = guid('tab');
            component.propValue[0].name = subTabName;
            component.propValue[0].title = t('dashboard.new_tab');
            component.activeTabName = subTabName;
        }
        component.y = maxYComponentCount() + 2;
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        dashboardEditorInnerRef.value.addItemToBox(component);
    }
};
const maxYComponentCount = () => {
    if (componentData.value.length === 0) {
        return 1;
    }
    else {
        return componentData.value
            .filter((item) => item['y'])
            .map((item) => item['y'] + item['sizeY']) // Calculate the y+sizeY of each element
            .reduce((max, current) => Math.max(max, current), 0);
    }
};
onMounted(() => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    state.opt = router.currentRoute.value.query.opt;
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    state.resourceId = router.currentRoute.value.query.resourceId;
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    state.routerPid = router.currentRoute.value.query.pid;
    if (state.opt === 'create') {
        dashboardStore.updateDashboardInfo({
            dataState: 'prepare',
            name: t('dashboard.new_dashboard'),
            pid: state.routerPid,
        });
    }
    else if (state.resourceId) {
        dataInitState.value = false;
        initCanvasData({ id: state.resourceId }, function () {
            dataInitState.value = true;
        });
    }
});
const baseParams = computed(() => {
    return {
        opt: state.opt,
        resourceId: state.resourceId,
        pid: state.routerPid,
    };
});
const findPositionX = (width) => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    return dashboardEditorInnerRef.value.findPositionX(width);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-content" },
    ...{ class: ({ 'editor-content-fullscreen': __VLS_ctx.fullscreenFlag }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-main" },
});
/** @type {[typeof Toolbar, typeof Toolbar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Toolbar, new Toolbar({
    ...{ 'onAddComponents': {} },
    baseParams: (__VLS_ctx.baseParams),
    findPositionX: (__VLS_ctx.findPositionX),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onAddComponents': {} },
    baseParams: (__VLS_ctx.baseParams),
    findPositionX: (__VLS_ctx.findPositionX),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onAddComponents: (__VLS_ctx.addComponents)
};
var __VLS_2;
if (__VLS_ctx.dataInitState) {
    /** @type {[typeof DashboardEditor, typeof DashboardEditor, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(DashboardEditor, new DashboardEditor({
        ref: "dashboardEditorInnerRef",
        canvasComponentData: (__VLS_ctx.componentData),
        canvasViewInfo: (__VLS_ctx.canvasViewInfo),
    }));
    const __VLS_8 = __VLS_7({
        ref: "dashboardEditorInnerRef",
        canvasComponentData: (__VLS_ctx.componentData),
        canvasViewInfo: (__VLS_ctx.canvasViewInfo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {typeof __VLS_ctx.dashboardEditorInnerRef} */ ;
    var __VLS_10 = {};
    var __VLS_9;
}
/** @type {__VLS_StyleScopedClasses['editor-content']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-content-fullscreen']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-main']} */ ;
// @ts-ignore
var __VLS_11 = __VLS_10;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Toolbar: Toolbar,
            DashboardEditor: DashboardEditor,
            componentData: componentData,
            canvasViewInfo: canvasViewInfo,
            fullscreenFlag: fullscreenFlag,
            dataInitState: dataInitState,
            dashboardEditorInnerRef: dashboardEditorInnerRef,
            addComponents: addComponents,
            baseParams: baseParams,
            findPositionX: findPositionX,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
