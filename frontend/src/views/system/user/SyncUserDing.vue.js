import { ref, computed, watch, nextTick } from 'vue';
import { modelApi } from '@/api/system';
import { ElLoading } from 'element-plus-secondary';
import avatar_personal from '@/assets/svg/avatar_personal.svg';
import avatar_organize from '@/assets/svg/avatar_organize.svg';
import Close from '@/assets/svg/icon_close_outlined_w.svg';
import Search from '@/assets/svg/icon_search-outline_outlined.svg';
import { cloneDeep } from 'lodash-es';
const checkAll = ref(false);
const existingUser = ref(false);
const isIndeterminate = ref(false);
const checkedWorkspace = ref([]);
const workspace = ref([]);
const search = ref('');
const dialogTitle = ref('');
const organizationUserRef = ref();
const defaultCheckedKeys = ref([]);
const defaultProps = {
    children: 'children',
    label: 'name',
};
let rawTree = [];
const organizationUserList = ref([]);
const loading = ref(false);
const centerDialogVisible = ref(false);
const checkTableList = ref([]);
const workspaceWithKeywords = computed(() => {
    return workspace.value.filter((ele) => ele.name.toLowerCase().includes(search.value.toLowerCase()));
});
const dfsTree = (arr) => {
    return arr.filter((ele) => {
        if (ele.children?.length) {
            ele.children = dfsTree(ele.children);
        }
        if (ele.name.toLowerCase().includes(search.value.toLowerCase()) ||
            ele.children?.length) {
            return true;
        }
        return false;
    });
};
const dfsTreeIds = (arr, ids) => {
    return arr.filter((ele) => {
        if (ele.children?.length) {
            ele.children = dfsTreeIds(ele.children, ids);
        }
        if (ele.name.toLowerCase().includes(search.value.toLowerCase()) ||
            ele.children?.length) {
            ids.push(ele.id);
            return true;
        }
        return false;
    });
};
watch(search, () => {
    organizationUserList.value = dfsTree(cloneDeep(rawTree));
    nextTick(() => {
        organizationUserRef.value.setCheckedKeys(checkTableList.value.map((ele) => ele.id));
    });
});
const filterNode = (value, data) => {
    if (!value)
        return true;
    return data.name.includes(value);
};
function isLeafNode(node) {
    return node.options.is_user;
}
const handleCheck = () => {
    const treeIds = [];
    dfsTreeIds(cloneDeep(rawTree), treeIds);
    const checkNodes = organizationUserRef.value.getCheckedNodes();
    const checkNodesIds = checkNodes.map((ele) => ele.id);
    checkTableList.value = checkTableList.value.filter((ele) => !treeIds.includes(ele.id) || (treeIds.includes(ele.id) && checkNodesIds.includes(ele.id)));
    const userList = [...checkNodes, ...checkTableList.value];
    let idArr = [...new Set(userList.map((ele) => ele.id))];
    checkTableList.value = userList.filter((ele) => {
        if (idArr.includes(ele.id) && isLeafNode(ele)) {
            idArr = idArr.filter((itx) => itx !== ele.id);
            return true;
        }
        return false;
    });
};
const handleCheckedWorkspaceChange = (value) => {
    const checkedCount = value.length;
    checkAll.value = checkedCount === workspaceWithKeywords.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < workspaceWithKeywords.value.length;
    const tableNameArr = workspaceWithKeywords.value.map((ele) => ele.name);
    checkTableList.value = [
        ...new Set([
            ...checkTableList.value.filter((ele) => !tableNameArr.includes(ele.name)),
            ...value,
        ]),
    ];
    organizationUserRef.value.setCheckedKeys(checkTableList.value.map((ele) => ele.id));
};
let oid = null;
const open = async (id, title) => {
    dialogTitle.value = title;
    loading.value = true;
    search.value = '';
    oid = id;
    checkedWorkspace.value = [];
    checkTableList.value = [];
    checkAll.value = false;
    isIndeterminate.value = false;
    const loadingInstance = ElLoading.service({ fullscreen: true });
    const systemWorkspaceList = await modelApi.platform(id);
    organizationUserList.value = systemWorkspaceList.tree || [];
    rawTree = cloneDeep(systemWorkspaceList.tree);
    loadingInstance?.close();
    loading.value = false;
    centerDialogVisible.value = true;
};
const emits = defineEmits(['refresh']);
const handleConfirm = () => {
    modelApi
        .userSync({
        user_list: checkTableList.value.map((ele) => ({
            id: ele.id,
            name: ele.name,
            email: ele.options.email || '',
        })),
        origin: oid,
        cover: existingUser.value,
    })
        .then((res) => {
        centerDialogVisible.value = false;
        emits('refresh', res);
    });
};
const clearWorkspace = (val) => {
    checkedWorkspace.value = checkedWorkspace.value.filter((ele) => ele.id !== val.id);
    checkTableList.value = checkTableList.value.filter((ele) => ele.id !== val.id);
    handleCheckedWorkspaceChange(checkedWorkspace.value);
};
const clearWorkspaceAll = () => {
    checkedWorkspace.value = [];
    checkTableList.value = [];
    handleCheckedWorkspaceChange([]);
};
const __VLS_exposed = {
    open,
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
    modelValue: (__VLS_ctx.centerDialogVisible),
    title: (__VLS_ctx.$t(__VLS_ctx.dialogTitle)),
    modalClass: "sync-user_ding",
    width: "840",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.centerDialogVisible),
    title: (__VLS_ctx.$t(__VLS_ctx.dialogTitle)),
    modalClass: "sync-user_ding",
    width: "840",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex border" },
    ...{ style: {} },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "p-16 border-r" },
});
const __VLS_5 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.search),
    validateEvent: (false),
    placeholder: (__VLS_ctx.$t('datasource.search')),
    ...{ style: {} },
    clearable: true,
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.search),
    validateEvent: (false),
    placeholder: (__VLS_ctx.$t('datasource.search')),
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_8.slots;
    const __VLS_9 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
    const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    const __VLS_13 = {}.Search;
    /** @type {[typeof __VLS_components.Search, typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
    const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
    var __VLS_12;
}
var __VLS_8;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-8 max-height_workspace" },
});
const __VLS_17 = {}.ElTree;
/** @type {[typeof __VLS_components.ElTree, typeof __VLS_components.elTree, typeof __VLS_components.ElTree, typeof __VLS_components.elTree, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ 'onCheck': {} },
    ref: "organizationUserRef",
    ...{ style: {} },
    ...{ class: "checkbox-group-block" },
    data: (__VLS_ctx.organizationUserList),
    filterNodeMethod: (__VLS_ctx.filterNode),
    showCheckbox: true,
    defaultCheckedKeys: (__VLS_ctx.defaultCheckedKeys),
    props: (__VLS_ctx.defaultProps),
    nodeKey: "id",
    defaultExpandAll: true,
    expandOnClickNode: (false),
}));
const __VLS_19 = __VLS_18({
    ...{ 'onCheck': {} },
    ref: "organizationUserRef",
    ...{ style: {} },
    ...{ class: "checkbox-group-block" },
    data: (__VLS_ctx.organizationUserList),
    filterNodeMethod: (__VLS_ctx.filterNode),
    showCheckbox: true,
    defaultCheckedKeys: (__VLS_ctx.defaultCheckedKeys),
    props: (__VLS_ctx.defaultProps),
    nodeKey: "id",
    defaultExpandAll: true,
    expandOnClickNode: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
let __VLS_21;
let __VLS_22;
let __VLS_23;
const __VLS_24 = {
    onCheck: (__VLS_ctx.handleCheck)
};
/** @type {typeof __VLS_ctx.organizationUserRef} */ ;
var __VLS_25 = {};
__VLS_20.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_20.slots;
    const [{ node, data }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "custom-tree-node flex" },
    });
    const __VLS_27 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        size: "28",
    }));
    const __VLS_29 = __VLS_28({
        size: "28",
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_30.slots.default;
    if (!data.options.is_user) {
        const __VLS_31 = {}.avatar_organize;
        /** @type {[typeof __VLS_components.Avatar_organize, typeof __VLS_components.avatar_organize, typeof __VLS_components.Avatar_organize, typeof __VLS_components.avatar_organize, ]} */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({}));
        const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
    }
    else {
        const __VLS_35 = {}.avatar_personal;
        /** @type {[typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, ]} */ ;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({}));
        const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
    }
    var __VLS_30;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "ml-8 ellipsis" },
        ...{ style: {} },
        title: (node.label),
    });
    (node.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "account ellipsis ml-8" },
        ...{ style: {} },
        title: (data.id),
    });
    (data.id);
}
{
    const { empty: __VLS_thisSlot } = __VLS_20.slots;
    (__VLS_ctx.$t(!!__VLS_ctx.search ? 'dashboard.no_data' : 'qa.no_data'));
}
var __VLS_20;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "p-16 w-full" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex-between mb-16" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "lighter" },
});
(__VLS_ctx.$t('workspace.selected_2_people', { msg: __VLS_ctx.checkTableList.length }));
const __VLS_39 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_41 = __VLS_40({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_43;
let __VLS_44;
let __VLS_45;
const __VLS_46 = {
    onClick: (__VLS_ctx.clearWorkspaceAll)
};
__VLS_42.slots.default;
(__VLS_ctx.$t('workspace.clear'));
var __VLS_42;
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.checkTableList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (ele.name),
        ...{ style: {} },
        ...{ class: "flex-between align-center hover-bg_select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        title: (`${ele.name}(${ele.id})`),
        ...{ class: "flex align-center ellipsis" },
        ...{ style: {} },
    });
    const __VLS_47 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        size: "28",
    }));
    const __VLS_49 = __VLS_48({
        size: "28",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    __VLS_50.slots.default;
    const __VLS_51 = {}.avatar_personal;
    /** @type {[typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({}));
    const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
    var __VLS_50;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "ml-8 lighter ellipsis" },
        ...{ style: {} },
        title: (ele.name),
    });
    (ele.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "account ellipsis ml-8" },
        ...{ style: {} },
        title: (ele.id),
    });
    (ele.id);
    const __VLS_55 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
        ...{ class: "close-btn" },
        text: true,
    }));
    const __VLS_57 = __VLS_56({
        ...{ class: "close-btn" },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_58.slots.default;
    const __VLS_59 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        ...{ 'onClick': {} },
        size: "16",
    }));
    const __VLS_61 = __VLS_60({
        ...{ 'onClick': {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    let __VLS_63;
    let __VLS_64;
    let __VLS_65;
    const __VLS_66 = {
        onClick: (...[$event]) => {
            __VLS_ctx.clearWorkspace(ele);
        }
    };
    __VLS_62.slots.default;
    const __VLS_67 = {}.Close;
    /** @type {[typeof __VLS_components.Close, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({}));
    const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
    var __VLS_62;
    var __VLS_58;
}
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_71 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
        modelValue: (__VLS_ctx.existingUser),
        ...{ style: {} },
    }));
    const __VLS_73 = __VLS_72({
        modelValue: (__VLS_ctx.existingUser),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    __VLS_74.slots.default;
    (__VLS_ctx.$t('sync.the_existing_user'));
    var __VLS_74;
    const __VLS_75 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_77 = __VLS_76({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    let __VLS_79;
    let __VLS_80;
    let __VLS_81;
    const __VLS_82 = {
        onClick: (...[$event]) => {
            __VLS_ctx.centerDialogVisible = false;
        }
    };
    __VLS_78.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_78;
    if (!__VLS_ctx.checkTableList.length) {
        const __VLS_83 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
            disabled: true,
            type: "info",
        }));
        const __VLS_85 = __VLS_84({
            disabled: true,
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        __VLS_86.slots.default;
        (__VLS_ctx.$t('common.confirm2'));
        var __VLS_86;
    }
    else {
        const __VLS_87 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_89 = __VLS_88({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_88));
        let __VLS_91;
        let __VLS_92;
        let __VLS_93;
        const __VLS_94 = {
            onClick: (__VLS_ctx.handleConfirm)
        };
        __VLS_90.slots.default;
        (__VLS_ctx.$t('common.confirm2'));
        var __VLS_90;
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-16']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
/** @type {__VLS_StyleScopedClasses['max-height_workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-group-block']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-tree-node']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-8']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['account']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-8']} */ ;
/** @type {__VLS_StyleScopedClasses['p-16']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-16']} */ ;
/** @type {__VLS_StyleScopedClasses['lighter']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-bg_select']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lighter']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['account']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-8']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
// @ts-ignore
var __VLS_26 = __VLS_25;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            avatar_personal: avatar_personal,
            avatar_organize: avatar_organize,
            Close: Close,
            Search: Search,
            existingUser: existingUser,
            search: search,
            dialogTitle: dialogTitle,
            organizationUserRef: organizationUserRef,
            defaultCheckedKeys: defaultCheckedKeys,
            defaultProps: defaultProps,
            organizationUserList: organizationUserList,
            loading: loading,
            centerDialogVisible: centerDialogVisible,
            checkTableList: checkTableList,
            filterNode: filterNode,
            handleCheck: handleCheck,
            handleConfirm: handleConfirm,
            clearWorkspace: clearWorkspace,
            clearWorkspaceAll: clearWorkspaceAll,
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
