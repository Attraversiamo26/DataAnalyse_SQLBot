import { dashboardStoreWithOut } from '@/stores/dashboard/dashboard.ts';
import { storeToRefs } from 'pinia';
import ComponentButtonLabel from '@/views/dashboard/components/button-label/ComponentButtonLabel.vue';
import dvTab from '@/assets/svg/dv-tab.svg';
import dvText from '@/assets/svg/dv-text.svg';
import dvView from '@/assets/svg/dv-view.svg';
import ResourceGroupOpt from '@/views/dashboard/common/ResourceGroupOpt.vue';
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { snapshotStoreWithOut } from '@/stores/dashboard/snapshot.ts';
import icon_undo_outlined from '@/assets/svg/icon_undo_outlined.svg';
import icon_redo_outlined from '@/assets/svg/icon_redo_outlined.svg';
import icon_arrow_left_outlined from '@/assets/svg/icon_arrow-left_outlined.svg';
import { saveDashboardResource } from '@/views/dashboard/utils/canvasUtils.ts';
import ChatChartSelection from '@/views/dashboard/editor/ChatChartSelection.vue';
import icon_pc_outlined from '@/assets/svg/icon_pc_outlined.svg';
const fullScreeRef = ref(null);
const { t } = useI18n();
const dashboardStore = dashboardStoreWithOut();
const { dashboardInfo, fullscreenFlag } = storeToRefs(dashboardStore);
const snapshotStore = snapshotStoreWithOut();
const { snapshotIndex } = storeToRefs(snapshotStore);
const emits = defineEmits(['addComponents']);
const resourceGroupOptRef = ref(null);
const chatChartSelectionRef = ref(null);
const openViewDialog = () => {
    // @ts-expect-error  @typescript-eslint/ban-ts-comment
    chatChartSelectionRef.value?.dialogInit();
};
import cloneDeep from 'lodash/cloneDeep';
import SQFullscreen from '@/views/dashboard/common/SQFullscreen.vue';
let nameEdit = ref(false);
let inputName = ref('');
let nameInput = ref(null);
const onDvNameChange = () => { };
const saveCanvasWithCheck = () => {
    if (dashboardInfo.value.dataState === 'prepare') {
        const createParams = {
            name: dashboardInfo.value.name,
            pid: props.baseParams?.pid,
            opt: 'newLeaf',
            nodeType: 'leaf',
            parentSelect: true,
        };
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        resourceGroupOptRef.value?.optInit(createParams);
    }
    else if (dashboardInfo.value.id) {
        const updateParams = {
            opt: 'updateLeaf',
            id: dashboardInfo.value.id,
            name: dashboardInfo.value.name,
            pid: 'root',
        };
        saveDashboardResource(updateParams, function () {
            ElMessage({
                type: 'success',
                message: t('common.save_success'),
            });
        });
    }
};
const props = defineProps({
    baseParams: {
        type: Object,
        required: false,
        default: null,
    },
});
const groupOptFinish = (result) => {
    let url = window.location.href;
    url = url.replace(/(#\/[^?]*)(?:\?[^#]*)?/, `$1?resourceId=${result.resourceId}`);
    window.history.replaceState({ path: url }, '', url);
};
const chartSelectionFinish = () => { };
const editCanvasName = () => {
    nameEdit.value = true;
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    inputName.value = dashboardInfo.value.name;
    nextTick(() => {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        nameInput.value?.focus();
    });
};
const handleEnterEditCanvasName = (event) => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    event.target?.blur();
};
const closeEditCanvasName = () => {
    nameEdit.value = false;
    if (!inputName.value || !inputName.value.trim()) {
        ElMessage.warning(t('dashboard.length_1_64_characters'));
        return;
    }
    if (inputName.value.trim() === dashboardInfo.value.name) {
        return;
    }
    if (inputName.value.trim().length > 64 || inputName.value.trim().length < 1) {
        ElMessage.warning(t('dashboard.length_1_64_characters'));
        editCanvasName();
        return;
    }
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    dashboardInfo.value.name = inputName.value;
    inputName.value = '';
};
const undo = () => {
    if (snapshotIndex.value > 0) {
        snapshotStore.undo();
    }
};
const redo = () => {
    if (snapshotIndex.value !== snapshotStore.snapshotData.length - 1) {
        snapshotStore.redo();
    }
};
const backToMain = () => {
    let url = '#/dashboard/index';
    if (dashboardInfo.value.id) {
        url = url + '?resourceId=' + dashboardInfo.value.id;
    }
    if (history.state.back) {
        history.back();
    }
    else {
        window.open(url, '_self');
    }
};
const addChatChart = (views) => {
    emits('addComponents', 'SQView', views);
    views.forEach((view) => {
        const target = cloneDeep(view);
        delete target.chart.sourceType;
        emits('addComponents', 'SQView', target);
    });
    ElMessage({
        type: 'success',
        message: t('dashboard.add_success'),
    });
};
const previewInner = () => {
    if (fullScreeRef.value) {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        fullScreeRef.value.toggleFullscreen();
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar-main" },
    ...{ class: ({ 'toolbar-main-hidden': __VLS_ctx.fullscreenFlag }) },
});
const __VLS_0 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: "custom-el-icon back-icon" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "custom-el-icon back-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.backToMain();
    }
};
__VLS_3.slots.default;
const __VLS_8 = {}.Icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    name: "icon_left_outlined",
}));
const __VLS_10 = __VLS_9({
    name: "icon_left_outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.icon_arrow_left_outlined;
/** @type {[typeof __VLS_components.Icon_arrow_left_outlined, typeof __VLS_components.icon_arrow_left_outlined, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ class: "toolbar-hover-icon toolbar-icon" },
}));
const __VLS_14 = __VLS_13({
    ...{ class: "toolbar-hover-icon toolbar-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "left-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onDblclick: (__VLS_ctx.editCanvasName) },
    id: "canvas-name",
    ...{ class: "name-area" },
});
(__VLS_ctx.dashboardInfo.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "opt-area" },
});
const __VLS_16 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    effect: "dark",
    content: (__VLS_ctx.t('dashboard.undo')),
    placement: "bottom",
}));
const __VLS_18 = __VLS_17({
    effect: "dark",
    content: (__VLS_ctx.t('dashboard.undo')),
    placement: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    ...{ class: "toolbar-hover-icon" },
    ...{ class: ({ 'toolbar-icon-disabled': __VLS_ctx.snapshotIndex < 1 }) },
    disabled: (__VLS_ctx.snapshotIndex < 1),
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    ...{ class: "toolbar-hover-icon" },
    ...{ class: ({ 'toolbar-icon-disabled': __VLS_ctx.snapshotIndex < 1 }) },
    disabled: (__VLS_ctx.snapshotIndex < 1),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (...[$event]) => {
        __VLS_ctx.undo();
    }
};
__VLS_23.slots.default;
const __VLS_28 = {}.Icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    name: "icon_undo_outlined",
}));
const __VLS_30 = __VLS_29({
    name: "icon_undo_outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.icon_undo_outlined;
/** @type {[typeof __VLS_components.Icon_undo_outlined, typeof __VLS_components.icon_undo_outlined, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ class: "svg-icon" },
}));
const __VLS_34 = __VLS_33({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
var __VLS_31;
var __VLS_23;
var __VLS_19;
const __VLS_36 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    effect: "dark",
    content: (__VLS_ctx.t('dashboard.reduction')),
    placement: "bottom",
}));
const __VLS_38 = __VLS_37({
    effect: "dark",
    content: (__VLS_ctx.t('dashboard.reduction')),
    placement: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    ...{ class: "toolbar-hover-icon opt-icon-redo" },
    ...{ class: ({
            'toolbar-icon-disabled': __VLS_ctx.snapshotIndex === __VLS_ctx.snapshotStore.snapshotData.length - 1,
        }) },
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    ...{ class: "toolbar-hover-icon opt-icon-redo" },
    ...{ class: ({
            'toolbar-icon-disabled': __VLS_ctx.snapshotIndex === __VLS_ctx.snapshotStore.snapshotData.length - 1,
        }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (...[$event]) => {
        __VLS_ctx.redo();
    }
};
__VLS_43.slots.default;
const __VLS_48 = {}.Icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    name: "icon_redo_outlined",
}));
const __VLS_50 = __VLS_49({
    name: "icon_redo_outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.icon_redo_outlined;
/** @type {[typeof __VLS_components.Icon_redo_outlined, typeof __VLS_components.icon_redo_outlined, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ class: "svg-icon" },
}));
const __VLS_54 = __VLS_53({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
var __VLS_43;
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "core-toolbar" },
});
/** @type {[typeof ComponentButtonLabel, typeof ComponentButtonLabel, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(ComponentButtonLabel, new ComponentButtonLabel({
    ...{ 'onCustomClick': {} },
    iconName: (__VLS_ctx.dvView),
    title: (__VLS_ctx.t('dashboard.add_view')),
    themes: "light",
    isLabel: true,
    showSplitLine: true,
}));
const __VLS_57 = __VLS_56({
    ...{ 'onCustomClick': {} },
    iconName: (__VLS_ctx.dvView),
    title: (__VLS_ctx.t('dashboard.add_view')),
    themes: "light",
    isLabel: true,
    showSplitLine: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
let __VLS_59;
let __VLS_60;
let __VLS_61;
const __VLS_62 = {
    onCustomClick: (__VLS_ctx.openViewDialog)
};
var __VLS_58;
/** @type {[typeof ComponentButtonLabel, typeof ComponentButtonLabel, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(ComponentButtonLabel, new ComponentButtonLabel({
    ...{ 'onCustomClick': {} },
    iconName: (__VLS_ctx.dvText),
    title: (__VLS_ctx.t('dashboard.text')),
    themes: "light",
    isLabel: true,
}));
const __VLS_64 = __VLS_63({
    ...{ 'onCustomClick': {} },
    iconName: (__VLS_ctx.dvText),
    title: (__VLS_ctx.t('dashboard.text')),
    themes: "light",
    isLabel: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_66;
let __VLS_67;
let __VLS_68;
const __VLS_69 = {
    onCustomClick: (() => __VLS_ctx.emits('addComponents', 'SQText'))
};
var __VLS_65;
/** @type {[typeof ComponentButtonLabel, typeof ComponentButtonLabel, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(ComponentButtonLabel, new ComponentButtonLabel({
    ...{ 'onCustomClick': {} },
    iconName: (__VLS_ctx.dvTab),
    title: "Tab",
    themes: "light",
    isLabel: true,
}));
const __VLS_71 = __VLS_70({
    ...{ 'onCustomClick': {} },
    iconName: (__VLS_ctx.dvTab),
    title: "Tab",
    themes: "light",
    isLabel: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_73;
let __VLS_74;
let __VLS_75;
const __VLS_76 = {
    onCustomClick: (() => __VLS_ctx.emits('addComponents', 'SQTab'))
};
var __VLS_72;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "right-toolbar" },
});
const __VLS_77 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_79 = __VLS_78({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
let __VLS_81;
let __VLS_82;
let __VLS_83;
const __VLS_84 = {
    onClick: (__VLS_ctx.previewInner)
};
__VLS_80.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_80.slots;
    const __VLS_85 = {}.icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.icon, typeof __VLS_components.Icon, typeof __VLS_components.icon, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        name: "icon_pc_outlined",
    }));
    const __VLS_87 = __VLS_86({
        name: "icon_pc_outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_88.slots.default;
    const __VLS_89 = {}.icon_pc_outlined;
    /** @type {[typeof __VLS_components.Icon_pc_outlined, typeof __VLS_components.icon_pc_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        ...{ class: "svg-icon" },
    }));
    const __VLS_91 = __VLS_90({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    var __VLS_88;
}
(__VLS_ctx.t('dashboard.preview'));
var __VLS_80;
const __VLS_93 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    ...{ 'onClick': {} },
    ...{ style: {} },
    type: "primary",
}));
const __VLS_95 = __VLS_94({
    ...{ 'onClick': {} },
    ...{ style: {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
let __VLS_97;
let __VLS_98;
let __VLS_99;
const __VLS_100 = {
    onClick: (...[$event]) => {
        __VLS_ctx.saveCanvasWithCheck();
    }
};
__VLS_96.slots.default;
(__VLS_ctx.t('common.save'));
var __VLS_96;
if (__VLS_ctx.nameEdit) {
    const __VLS_101 = {}.Teleport;
    /** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        to: ('#canvas-name'),
    }));
    const __VLS_103 = __VLS_102({
        to: ('#canvas-name'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    __VLS_104.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeydown: (__VLS_ctx.handleEnterEditCanvasName) },
        ...{ onChange: (__VLS_ctx.onDvNameChange) },
        ...{ onBlur: (__VLS_ctx.closeEditCanvasName) },
        ref: "nameInput",
    });
    (__VLS_ctx.inputName);
    /** @type {typeof __VLS_ctx.nameInput} */ ;
    var __VLS_104;
}
/** @type {[typeof ResourceGroupOpt, typeof ResourceGroupOpt, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(ResourceGroupOpt, new ResourceGroupOpt({
    ...{ 'onFinish': {} },
    ref: "resourceGroupOptRef",
}));
const __VLS_106 = __VLS_105({
    ...{ 'onFinish': {} },
    ref: "resourceGroupOptRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onFinish: (__VLS_ctx.groupOptFinish)
};
/** @type {typeof __VLS_ctx.resourceGroupOptRef} */ ;
var __VLS_112 = {};
var __VLS_107;
/** @type {[typeof ChatChartSelection, typeof ChatChartSelection, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(ChatChartSelection, new ChatChartSelection({
    ...{ 'onAddChatChart': {} },
    ...{ 'onFinish': {} },
    ref: "chatChartSelectionRef",
}));
const __VLS_115 = __VLS_114({
    ...{ 'onAddChatChart': {} },
    ...{ 'onFinish': {} },
    ref: "chatChartSelectionRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
let __VLS_117;
let __VLS_118;
let __VLS_119;
const __VLS_120 = {
    onAddChatChart: (__VLS_ctx.addChatChart)
};
const __VLS_121 = {
    onFinish: (__VLS_ctx.chartSelectionFinish)
};
/** @type {typeof __VLS_ctx.chatChartSelectionRef} */ ;
var __VLS_122 = {};
var __VLS_116;
/** @type {[typeof SQFullscreen, typeof SQFullscreen, ]} */ ;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent(SQFullscreen, new SQFullscreen({
    ref: "fullScreeRef",
    showPosition: "edit",
}));
const __VLS_125 = __VLS_124({
    ref: "fullScreeRef",
    showPosition: "edit",
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
/** @type {typeof __VLS_ctx.fullScreeRef} */ ;
var __VLS_127 = {};
var __VLS_126;
/** @type {__VLS_StyleScopedClasses['toolbar-main']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-main-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['back-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-hover-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['left-area']} */ ;
/** @type {__VLS_StyleScopedClasses['name-area']} */ ;
/** @type {__VLS_StyleScopedClasses['opt-area']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-hover-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-icon-disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-hover-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['opt-icon-redo']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-icon-disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['core-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['right-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
// @ts-ignore
var __VLS_113 = __VLS_112, __VLS_123 = __VLS_122, __VLS_128 = __VLS_127;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ComponentButtonLabel: ComponentButtonLabel,
            dvTab: dvTab,
            dvText: dvText,
            dvView: dvView,
            ResourceGroupOpt: ResourceGroupOpt,
            icon_undo_outlined: icon_undo_outlined,
            icon_redo_outlined: icon_redo_outlined,
            icon_arrow_left_outlined: icon_arrow_left_outlined,
            ChatChartSelection: ChatChartSelection,
            icon_pc_outlined: icon_pc_outlined,
            fullScreeRef: fullScreeRef,
            t: t,
            dashboardInfo: dashboardInfo,
            fullscreenFlag: fullscreenFlag,
            snapshotStore: snapshotStore,
            snapshotIndex: snapshotIndex,
            emits: emits,
            resourceGroupOptRef: resourceGroupOptRef,
            chatChartSelectionRef: chatChartSelectionRef,
            openViewDialog: openViewDialog,
            SQFullscreen: SQFullscreen,
            nameEdit: nameEdit,
            inputName: inputName,
            nameInput: nameInput,
            onDvNameChange: onDvNameChange,
            saveCanvasWithCheck: saveCanvasWithCheck,
            groupOptFinish: groupOptFinish,
            chartSelectionFinish: chartSelectionFinish,
            editCanvasName: editCanvasName,
            handleEnterEditCanvasName: handleEnterEditCanvasName,
            closeEditCanvasName: closeEditCanvasName,
            undo: undo,
            redo: redo,
            backToMain: backToMain,
            addChatChart: addChatChart,
            previewInner: previewInner,
        };
    },
    emits: {},
    props: {
        baseParams: {
            type: Object,
            required: false,
            default: null,
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        baseParams: {
            type: Object,
            required: false,
            default: null,
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
