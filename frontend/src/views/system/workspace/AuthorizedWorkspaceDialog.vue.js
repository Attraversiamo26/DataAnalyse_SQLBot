import { ref, computed, watch } from 'vue';
import { workspaceOptionUserList, workspaceUwsCreate } from '@/api/workspace';
import avatar_personal from '@/assets/svg/avatar_personal.svg';
import Close from '@/assets/svg/icon_close_outlined_w.svg';
import Search from '@/assets/svg/icon_search-outline_outlined.svg';
const checkAll = ref(false);
const isIndeterminate = ref(false);
const checkedWorkspace = ref([]);
const workspace = ref([]);
const listType = ref(0);
const search = ref('');
const loading = ref(false);
const centerDialogVisible = ref(false);
const checkTableList = ref([]);
const workspaceWithKeywords = computed(() => {
    return workspace.value.filter((ele) => ele.name.toLowerCase().includes(search.value.toLowerCase()));
});
watch(search, () => {
    const tableNameArr = workspaceWithKeywords.value.map((ele) => ele.name);
    checkedWorkspace.value = checkTableList.value.filter((ele) => tableNameArr.includes(ele.name));
    const checkedCount = checkedWorkspace.value.length;
    checkAll.value = checkedCount === workspaceWithKeywords.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < workspaceWithKeywords.value.length;
});
const handleCheckAllChange = (val) => {
    const tableNameArr = workspaceWithKeywords.value.map((ele) => ele.name);
    checkedWorkspace.value = val
        ? [
            ...new Set([
                ...workspaceWithKeywords.value,
                ...checkedWorkspace.value.filter((ele) => !tableNameArr.includes(ele.name)),
            ]),
        ]
        : [];
    isIndeterminate.value = false;
    checkTableList.value = val
        ? [
            ...new Set([
                ...workspaceWithKeywords.value,
                ...checkTableList.value.filter((ele) => !tableNameArr.includes(ele.name)),
            ]),
        ]
        : checkTableList.value.filter((ele) => !tableNameArr.includes(ele.name));
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
};
let oid = null;
const open = async (id) => {
    loading.value = true;
    search.value = '';
    oid = id;
    checkedWorkspace.value = [];
    checkTableList.value = [];
    checkAll.value = false;
    isIndeterminate.value = false;
    const systemWorkspaceList = await workspaceOptionUserList({ oid }, 1, 1000);
    workspace.value = JSON.parse(JSON.stringify(systemWorkspaceList.items.filter((ele) => +ele.id !== 1)));
    loading.value = false;
    centerDialogVisible.value = true;
};
const emits = defineEmits(['refresh']);
const handleConfirm = () => {
    workspaceUwsCreate({
        uid_list: checkTableList.value.map((ele) => ele.id),
        oid,
        weight: listType.value,
    }).then(() => {
        centerDialogVisible.value = false;
        emits('refresh');
    });
};
const clearWorkspace = (val) => {
    checkedWorkspace.value = checkedWorkspace.value.filter((ele) => ele.id !== val.id);
    checkTableList.value = checkTableList.value.filter((ele) => ele.id !== val.id);
    handleCheckedWorkspaceChange(checkedWorkspace.value);
};
const clearWorkspaceAll = () => {
    checkedWorkspace.value = [];
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
    title: (__VLS_ctx.$t('workspace.add_member')),
    modalClass: "authorized-workspace",
    width: "840",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.centerDialogVisible),
    title: (__VLS_ctx.$t('workspace.add_member')),
    modalClass: "authorized-workspace",
    width: "840",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mb-8 lighter" },
});
(__VLS_ctx.$t('workspace.member_type'));
const __VLS_5 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.listType),
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.listType),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    value: (0),
}));
const __VLS_11 = __VLS_10({
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
(__VLS_ctx.$t('workspace.ordinary_member'));
var __VLS_12;
const __VLS_13 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    value: (1),
}));
const __VLS_15 = __VLS_14({
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
(__VLS_ctx.$t('workspace.administrator'));
var __VLS_16;
var __VLS_8;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mb-8 lighter mt-16" },
});
(__VLS_ctx.$t('workspace.select_member'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex border" },
    ...{ style: {} },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "p-16 border-r" },
});
const __VLS_17 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    modelValue: (__VLS_ctx.search),
    validateEvent: (false),
    placeholder: (__VLS_ctx.$t('datasource.search')),
    ...{ style: {} },
    clearable: true,
}));
const __VLS_19 = __VLS_18({
    modelValue: (__VLS_ctx.search),
    validateEvent: (false),
    placeholder: (__VLS_ctx.$t('datasource.search')),
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_20.slots;
    const __VLS_21 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
    const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    const __VLS_25 = {}.Search;
    /** @type {[typeof __VLS_components.Search, typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
    const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
    var __VLS_24;
}
var __VLS_20;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-8 max-height_workspace" },
});
const __VLS_29 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkAll),
    ...{ class: "mb-8" },
    ...{ style: {} },
    indeterminate: (__VLS_ctx.isIndeterminate),
}));
const __VLS_31 = __VLS_30({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkAll),
    ...{ class: "mb-8" },
    ...{ style: {} },
    indeterminate: (__VLS_ctx.isIndeterminate),
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onChange: (__VLS_ctx.handleCheckAllChange)
};
__VLS_32.slots.default;
(__VLS_ctx.$t('datasource.select_all'));
var __VLS_32;
const __VLS_37 = {}.ElCheckboxGroup;
/** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkedWorkspace),
    ...{ class: "checkbox-group-block" },
}));
const __VLS_39 = __VLS_38({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkedWorkspace),
    ...{ class: "checkbox-group-block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_41;
let __VLS_42;
let __VLS_43;
const __VLS_44 = {
    onChange: (__VLS_ctx.handleCheckedWorkspaceChange)
};
__VLS_40.slots.default;
for (const [space] of __VLS_getVForSourceType((__VLS_ctx.workspaceWithKeywords))) {
    const __VLS_45 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        key: (space.id),
        label: (space.name),
        value: (space),
        ...{ class: "hover-bg" },
    }));
    const __VLS_47 = __VLS_46({
        key: (space.id),
        label: (space.name),
        value: (space),
        ...{ class: "hover-bg" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex" },
    });
    const __VLS_49 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        size: "28",
    }));
    const __VLS_51 = __VLS_50({
        size: "28",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    const __VLS_53 = {}.avatar_personal;
    /** @type {[typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({}));
    const __VLS_55 = __VLS_54({}, ...__VLS_functionalComponentArgsRest(__VLS_54));
    var __VLS_52;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "ml-4 ellipsis" },
        ...{ style: {} },
        title: (space.name),
    });
    (space.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "account ellipsis" },
        ...{ style: {} },
        title: (space.account),
    });
    (space.account);
    var __VLS_48;
}
var __VLS_40;
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
const __VLS_57 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_59 = __VLS_58({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
let __VLS_61;
let __VLS_62;
let __VLS_63;
const __VLS_64 = {
    onClick: (__VLS_ctx.clearWorkspaceAll)
};
__VLS_60.slots.default;
(__VLS_ctx.$t('workspace.clear'));
var __VLS_60;
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.checkTableList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (ele.name),
        ...{ style: {} },
        ...{ class: "flex-between align-center hover-bg_select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        title: (`${ele.name}(${ele.account})`),
        ...{ class: "flex align-center ellipsis" },
        ...{ style: {} },
    });
    const __VLS_65 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        size: "28",
    }));
    const __VLS_67 = __VLS_66({
        size: "28",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    const __VLS_69 = {}.avatar_personal;
    /** @type {[typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({}));
    const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
    var __VLS_68;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "ml-4 lighter ellipsis" },
        ...{ style: {} },
        title: (ele.name),
    });
    (ele.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "account ellipsis" },
        ...{ style: {} },
        title: (ele.account),
    });
    (ele.account);
    const __VLS_73 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        ...{ class: "close-btn" },
        text: true,
    }));
    const __VLS_75 = __VLS_74({
        ...{ class: "close-btn" },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_76.slots.default;
    const __VLS_77 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        ...{ 'onClick': {} },
        size: "16",
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onClick': {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_81;
    let __VLS_82;
    let __VLS_83;
    const __VLS_84 = {
        onClick: (...[$event]) => {
            __VLS_ctx.clearWorkspace(ele);
        }
    };
    __VLS_80.slots.default;
    const __VLS_85 = {}.Close;
    /** @type {[typeof __VLS_components.Close, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
    const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
    var __VLS_80;
    var __VLS_76;
}
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_89 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_91 = __VLS_90({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    let __VLS_93;
    let __VLS_94;
    let __VLS_95;
    const __VLS_96 = {
        onClick: (...[$event]) => {
            __VLS_ctx.centerDialogVisible = false;
        }
    };
    __VLS_92.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_92;
    if (!__VLS_ctx.checkedWorkspace.length) {
        const __VLS_97 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
            disabled: true,
            type: "info",
        }));
        const __VLS_99 = __VLS_98({
            disabled: true,
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        __VLS_100.slots.default;
        (__VLS_ctx.$t('model.add'));
        var __VLS_100;
    }
    else {
        const __VLS_101 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_103 = __VLS_102({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        let __VLS_105;
        let __VLS_106;
        let __VLS_107;
        const __VLS_108 = {
            onClick: (__VLS_ctx.handleConfirm)
        };
        __VLS_104.slots.default;
        (__VLS_ctx.$t('model.add'));
        var __VLS_104;
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lighter']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lighter']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-16']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-16']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
/** @type {__VLS_StyleScopedClasses['max-height_workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-group-block']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['account']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
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
/** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
/** @type {__VLS_StyleScopedClasses['lighter']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['account']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            avatar_personal: avatar_personal,
            Close: Close,
            Search: Search,
            checkAll: checkAll,
            isIndeterminate: isIndeterminate,
            checkedWorkspace: checkedWorkspace,
            listType: listType,
            search: search,
            loading: loading,
            centerDialogVisible: centerDialogVisible,
            checkTableList: checkTableList,
            workspaceWithKeywords: workspaceWithKeywords,
            handleCheckAllChange: handleCheckAllChange,
            handleCheckedWorkspaceChange: handleCheckedWorkspaceChange,
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
