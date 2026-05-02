import { reactive, ref, h } from 'vue';
import { ElButton, ElMessage } from 'element-plus-secondary';
import { findNextComponentIndex, saveDashboardResourceTarget, } from '@/views/dashboard/utils/canvasUtils.ts';
import { useI18n } from 'vue-i18n';
import { dashboardApi } from '@/api/dashboard.ts';
import cloneDeep from 'lodash/cloneDeep';
import { findNewComponentFromList } from '@/views/dashboard/components/component-list.ts';
import { guid } from '@/utils/canvas.ts';
const { t } = useI18n();
const resource = ref(null);
const optInit = (viewInfo) => {
    initDashboardList();
    resourceDialogShow.value = true;
    state.viewInfo = viewInfo;
};
const state = reactive({
    dashboardList: [],
    viewInfo: null,
});
const resourceDialogShow = ref(false);
const loading = ref(false);
const resourceForm = reactive({
    addType: 'history',
    dashboardId: '',
    dashboardName: '',
});
const resourceFormRulesNew = ref({
    dashboardName: [
        {
            required: true,
            min: 1,
            max: 64,
            message: t('dashboard.length_limit64'),
            trigger: 'change',
        },
    ],
});
const resourceFormRulesHistory = ref({
    dashboardId: [
        {
            required: true,
            min: 1,
            max: 64,
            message: '请选择仪表板',
            trigger: 'change',
        },
    ],
});
const resetForm = () => {
    resourceForm.dashboardId = '';
    resourceForm.dashboardName = '';
    resourceDialogShow.value = false;
};
const saveResourcePrepare = () => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    resource.value?.validate((result) => {
        if (result) {
            const component = cloneDeep(findNewComponentFromList('SQView'));
            const newComponentId = guid();
            // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
            state.viewInfo.chart['id'] = newComponentId;
            // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
            state.viewInfo['id'] = newComponentId;
            if (resourceForm.addType === 'history' && component) {
                findNextComponentIndex({ id: resourceForm.dashboardId }, (result) => {
                    const { bottomPosition, dashboardInfo, canvasDataResult, canvasStyleResult, canvasViewInfoPreview, } = result;
                    const params = {
                        opt: 'updateLeaf',
                        pid: 'root',
                        id: resourceForm.dashboardId,
                        name: dashboardInfo.name,
                    };
                    component['id'] = newComponentId;
                    component['y'] = bottomPosition;
                    canvasDataResult.push(component);
                    canvasViewInfoPreview[newComponentId] = state.viewInfo;
                    const commonParams = {
                        componentData: canvasDataResult,
                        canvasStyleData: canvasStyleResult,
                        canvasViewInfo: canvasViewInfoPreview,
                    };
                    saveResource(params, commonParams);
                });
            }
            else if (resourceForm.addType === 'new' && component) {
                const params = {
                    opt: 'newLeaf',
                    pid: 'root',
                    name: resourceForm.dashboardName,
                    level: 1,
                    node_type: 'leaf',
                    type: 'dashboard',
                };
                component['id'] = newComponentId;
                const canvasViewInfo = {};
                // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
                canvasViewInfo[newComponentId] = state.viewInfo;
                const commonParams = {
                    componentData: [component],
                    canvasStyleData: {},
                    canvasViewInfo: canvasViewInfo,
                };
                saveResource(params, commonParams);
            }
        }
    });
};
const saveResource = (params, commonParams) => {
    saveDashboardResourceTarget(params, commonParams, (res) => {
        const messageTips = t('dashboard.add_success');
        openMessageLoading(messageTips, 'success', res?.id, callbackExportSuc);
        resetForm();
    });
};
const callbackExportSuc = (curOptDashboardIdValue) => {
    // do open dashboard
    const url = `#/canvas?resourceId=${curOptDashboardIdValue}`;
    window.open(url, '_self');
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const openMessageLoading = (text, type = 'success', dvId, cb) => {
    // success error loading
    const customClass = `sq-message-${type || 'success'} sq-message-export`;
    ElMessage({
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        message: h('p', null, [
            h('span', {
                title: t(text),
                class: 'ellipsis m50-export',
            }, t(text)),
            h(ElButton, {
                text: true,
                size: 'small',
                class: 'btn-text',
                onClick: () => {
                    cb(dvId);
                },
            }, t('dashboard.open_dashboard')),
        ]),
        type,
        showClose: true,
        duration: 2000,
        customClass,
    });
};
const initDashboardList = () => {
    state.dashboardList = [];
    const params = {};
    dashboardApi.list_resource(params).then((res) => {
        state.dashboardList = res || [];
    });
};
const __VLS_exposed = {
    optInit,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSubmit': {} },
    modelValue: (__VLS_ctx.resourceDialogShow),
    ...{ class: "create-dialog" },
    title: (__VLS_ctx.t('chat.add_to_dashboard')),
    width: "420px",
    beforeClose: (__VLS_ctx.resetForm),
    appendToBody: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    modelValue: (__VLS_ctx.resourceDialogShow),
    ...{ class: "create-dialog" },
    title: (__VLS_ctx.t('chat.add_to_dashboard')),
    width: "420px",
    beforeClose: (__VLS_ctx.resetForm),
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: () => { }
};
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_9 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onSubmit': {} },
    ref: "resource",
    labelPosition: "top",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.resourceForm),
    rules: (__VLS_ctx.resourceForm.addType === 'new' ? __VLS_ctx.resourceFormRulesNew : __VLS_ctx.resourceFormRulesHistory),
}));
const __VLS_11 = __VLS_10({
    ...{ 'onSubmit': {} },
    ref: "resource",
    labelPosition: "top",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.resourceForm),
    rules: (__VLS_ctx.resourceForm.addType === 'new' ? __VLS_ctx.resourceFormRulesNew : __VLS_ctx.resourceFormRulesHistory),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onSubmit: () => { }
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {typeof __VLS_ctx.resource} */ ;
var __VLS_17 = {};
__VLS_12.slots.default;
const __VLS_19 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    label: (__VLS_ctx.t('dashboard.dashboard_name')),
    required: true,
    prop: "addType",
}));
const __VLS_21 = __VLS_20({
    label: (__VLS_ctx.t('dashboard.dashboard_name')),
    required: true,
    prop: "addType",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
const __VLS_23 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.resourceForm.addType),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.resourceForm.addType),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_26.slots.default;
const __VLS_27 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    value: "history",
}));
const __VLS_29 = __VLS_28({
    value: "history",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
(__VLS_ctx.t('dashboard.existing_dashboard'));
var __VLS_30;
const __VLS_31 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    value: "new",
}));
const __VLS_33 = __VLS_32({
    value: "new",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
__VLS_34.slots.default;
(__VLS_ctx.t('dashboard.new_dashboard'));
var __VLS_34;
var __VLS_26;
var __VLS_22;
if (__VLS_ctx.resourceForm.addType === 'new') {
    const __VLS_35 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        label: (__VLS_ctx.t('dashboard.dashboard')),
        required: true,
        prop: "dashboardName",
    }));
    const __VLS_37 = __VLS_36({
        label: (__VLS_ctx.t('dashboard.dashboard')),
        required: true,
        prop: "dashboardName",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_38.slots.default;
    const __VLS_39 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
        ...{ 'onKeydown': {} },
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.resourceForm.dashboardName),
        clearable: true,
        placeholder: (__VLS_ctx.t('dashboard.add_dashboard_name_tips')),
    }));
    const __VLS_41 = __VLS_40({
        ...{ 'onKeydown': {} },
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.resourceForm.dashboardName),
        clearable: true,
        placeholder: (__VLS_ctx.t('dashboard.add_dashboard_name_tips')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    let __VLS_43;
    let __VLS_44;
    let __VLS_45;
    const __VLS_46 = {
        onKeydown: () => { }
    };
    const __VLS_47 = {
        onKeyup: () => { }
    };
    var __VLS_42;
    var __VLS_38;
}
if (__VLS_ctx.resourceForm.addType === 'history') {
    const __VLS_48 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        label: (__VLS_ctx.t('dashboard.dashboard')),
        required: true,
        prop: "dashboardId",
    }));
    const __VLS_50 = __VLS_49({
        label: (__VLS_ctx.t('dashboard.dashboard')),
        required: true,
        prop: "dashboardId",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        modelValue: (__VLS_ctx.resourceForm.dashboardId),
        filterable: true,
        placeholder: (__VLS_ctx.t('dashboard.select_dashboard')),
    }));
    const __VLS_54 = __VLS_53({
        modelValue: (__VLS_ctx.resourceForm.dashboardId),
        filterable: true,
        placeholder: (__VLS_ctx.t('dashboard.select_dashboard')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.state.dashboardList))) {
        const __VLS_56 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            key: (item.id),
            label: (item.name),
            value: (item.id),
        }));
        const __VLS_58 = __VLS_57({
            key: (item.id),
            label: (item.name),
            value: (item.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    }
    var __VLS_55;
    var __VLS_51;
}
var __VLS_12;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            __VLS_ctx.resetForm();
        }
    };
    __VLS_63.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_63;
    const __VLS_68 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (...[$event]) => {
            __VLS_ctx.saveResourcePrepare();
        }
    };
    __VLS_71.slots.default;
    (__VLS_ctx.t('common.confirm'));
    var __VLS_71;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['create-dialog']} */ ;
// @ts-ignore
var __VLS_18 = __VLS_17;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElButton: ElButton,
            t: t,
            resource: resource,
            state: state,
            resourceDialogShow: resourceDialogShow,
            loading: loading,
            resourceForm: resourceForm,
            resourceFormRulesNew: resourceFormRulesNew,
            resourceFormRulesHistory: resourceFormRulesHistory,
            resetForm: resetForm,
            saveResourcePrepare: saveResourcePrepare,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
