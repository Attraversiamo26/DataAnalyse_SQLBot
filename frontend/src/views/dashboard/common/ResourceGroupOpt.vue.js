import folder from '@/assets/svg/folder.svg';
import { reactive, ref } from 'vue';
import { saveDashboardResource } from '@/views/dashboard/utils/canvasUtils.ts';
import { dashboardApi } from '@/api/dashboard.ts';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const emits = defineEmits(['finish']);
const resource = ref(null);
const state = reactive({
    id: null,
    opt: null,
    placeholder: '',
    nodeType: 'folder',
    parentSelect: false,
    resourceFormNameLabel: t('dashboard.dashboard_name'),
    dialogTitle: '',
    tData: [],
    tDataSource: [],
    nameList: [],
    targetInfo: null,
    attachParams: null,
});
const getTitle = (opt) => {
    switch (opt) {
        case 'newLeaf':
            return t('dashboard.new_dashboard');
        case 'newFolder':
            return t('dashboard.new_folder');
        case 'rename':
            return t('dashboard.rename_dashboard');
        default:
            return;
    }
};
const getResourceNewName = (opt) => {
    switch (opt) {
        case 'newLeaf':
            return 'New Dashboard';
        case 'newFolder':
            return 'New Folder';
        default:
            return;
    }
};
const getTree = async () => {
    const params = { node_type: 'folder' };
    dashboardApi.list_resource(params).then((res) => {
        state.tData = res || [];
        state.tDataSource = [...state.tData];
    });
};
const optInit = (params) => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    state.dialogTitle = getTitle(params.opt);
    state.opt = params.opt;
    state.id = params.id;
    state.parentSelect = params.parentSelect;
    state.targetInfo = params.data;
    state.nodeType = params.nodeType || 'folder';
    resourceDialogShow.value = true;
    resourceForm.name = params.name || getResourceNewName(params.opt);
    resourceForm.pid = params.pid || 'root';
    if (params.parentSelect) {
        getTree();
    }
};
const resourceDialogShow = ref(false);
const loading = ref(false);
const resourceForm = reactive({
    id: null,
    pid: '',
    pName: '',
    name: 'New Dashboard',
});
const resourceFormRules = ref({
    name: [
        {
            required: true,
            min: 1,
            max: 64,
            message: t('dashboard.length_limit64'),
            trigger: 'change',
        },
    ],
    pid: [
        {
            required: true,
            message: 'Please select',
            trigger: 'blur',
        },
    ],
});
const resetForm = () => {
    state.dialogTitle = '';
    resourceForm.name = '';
    resourceForm.pid = '';
    resourceDialogShow.value = false;
};
const propsTree = {
    value: 'id',
    label: 'name',
    children: 'children',
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    isLeaf: (node) => !node.children?.length,
};
const showPid = false;
const saveResource = () => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    resource.value?.validate((result) => {
        if (result) {
            const params = {
                id: state.id,
                node_type: state.nodeType,
                name: resourceForm.name,
                opt: state.opt,
                pid: resourceForm.pid,
                type: 'dashboard',
                level: state.nodeType === 'folder' ? 0 : 1,
            };
            saveDashboardResource(params, function (rsp) {
                const messageTips = t('common.save_success');
                ElMessage({
                    type: 'success',
                    message: messageTips,
                });
                emits('finish', { opt: state.opt, resourceId: rsp.id });
                resetForm();
            });
        }
    });
};
const nodeClick = (data) => {
    resourceForm.pid = data.id;
    resourceForm.pName = data.name;
};
const filterMethod = (value) => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    state.tData = state.tDataSource.filter((item) => item.name.includes(value));
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
    title: (__VLS_ctx.state.dialogTitle),
    width: "420px",
    beforeClose: (__VLS_ctx.resetForm),
    appendToBody: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    modelValue: (__VLS_ctx.resourceDialogShow),
    ...{ class: "create-dialog" },
    title: (__VLS_ctx.state.dialogTitle),
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
    rules: (__VLS_ctx.resourceFormRules),
    ...{ class: "last" },
}));
const __VLS_11 = __VLS_10({
    ...{ 'onSubmit': {} },
    ref: "resource",
    labelPosition: "top",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.resourceForm),
    rules: (__VLS_ctx.resourceFormRules),
    ...{ class: "last" },
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
    label: (__VLS_ctx.state.resourceFormNameLabel),
    prop: "name",
}));
const __VLS_21 = __VLS_20({
    label: (__VLS_ctx.state.resourceFormNameLabel),
    prop: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
const __VLS_23 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    ...{ 'onKeydown': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.resourceForm.name),
    placeholder: (__VLS_ctx.state.placeholder),
    clearable: true,
}));
const __VLS_25 = __VLS_24({
    ...{ 'onKeydown': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.resourceForm.name),
    placeholder: (__VLS_ctx.state.placeholder),
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_27;
let __VLS_28;
let __VLS_29;
const __VLS_30 = {
    onKeydown: () => { }
};
const __VLS_31 = {
    onKeyup: () => { }
};
var __VLS_26;
var __VLS_22;
if (__VLS_ctx.showPid) {
    const __VLS_32 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        label: ('Folder'),
        prop: "pid",
    }));
    const __VLS_34 = __VLS_33({
        label: ('Folder'),
        prop: "pid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.ElTreeSelect;
    /** @type {[typeof __VLS_components.ElTreeSelect, typeof __VLS_components.elTreeSelect, typeof __VLS_components.ElTreeSelect, typeof __VLS_components.elTreeSelect, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onKeydown': {} },
        ...{ 'onKeyup': {} },
        ...{ 'onNodeClick': {} },
        modelValue: (__VLS_ctx.resourceForm.pid),
        ...{ style: {} },
        data: (__VLS_ctx.state.tData),
        props: (__VLS_ctx.propsTree),
        filterMethod: (__VLS_ctx.filterMethod),
        renderAfterExpand: (false),
        filterable: true,
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onKeydown': {} },
        ...{ 'onKeyup': {} },
        ...{ 'onNodeClick': {} },
        modelValue: (__VLS_ctx.resourceForm.pid),
        ...{ style: {} },
        data: (__VLS_ctx.state.tData),
        props: (__VLS_ctx.propsTree),
        filterMethod: (__VLS_ctx.filterMethod),
        renderAfterExpand: (false),
        filterable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onKeydown: () => { }
    };
    const __VLS_44 = {
        onKeyup: () => { }
    };
    const __VLS_45 = {
        onNodeClick: (__VLS_ctx.nodeClick)
    };
    __VLS_39.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_39.slots;
        const { data: { name } } = __VLS_getSlotParam(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "custom-tree-node" },
        });
        const __VLS_46 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({}));
        const __VLS_48 = __VLS_47({}, ...__VLS_functionalComponentArgsRest(__VLS_47));
        __VLS_49.slots.default;
        const __VLS_50 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
            name: "dv-folder",
        }));
        const __VLS_52 = __VLS_51({
            name: "dv-folder",
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        __VLS_53.slots.default;
        const __VLS_54 = {}.folder;
        /** @type {[typeof __VLS_components.Folder, typeof __VLS_components.folder, ]} */ ;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
            ...{ class: "svg-icon custom-tree-folder" },
        }));
        const __VLS_56 = __VLS_55({
            ...{ class: "svg-icon custom-tree-folder" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        var __VLS_53;
        var __VLS_49;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            title: (name),
        });
        (name);
    }
    var __VLS_39;
    var __VLS_35;
}
var __VLS_12;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_58 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_60 = __VLS_59({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    let __VLS_62;
    let __VLS_63;
    let __VLS_64;
    const __VLS_65 = {
        onClick: (...[$event]) => {
            __VLS_ctx.resetForm();
        }
    };
    __VLS_61.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_61;
    const __VLS_66 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_68 = __VLS_67({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    let __VLS_70;
    let __VLS_71;
    let __VLS_72;
    const __VLS_73 = {
        onClick: (...[$event]) => {
            __VLS_ctx.saveResource();
        }
    };
    __VLS_69.slots.default;
    (__VLS_ctx.t('common.confirm'));
    var __VLS_69;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['create-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['last']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-tree-node']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-tree-folder']} */ ;
// @ts-ignore
var __VLS_18 = __VLS_17;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            folder: folder,
            t: t,
            resource: resource,
            state: state,
            resourceDialogShow: resourceDialogShow,
            loading: loading,
            resourceForm: resourceForm,
            resourceFormRules: resourceFormRules,
            resetForm: resetForm,
            propsTree: propsTree,
            showPid: showPid,
            saveResource: saveResource,
            nodeClick: nodeClick,
            filterMethod: filterMethod,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
