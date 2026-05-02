import { ref, computed, watch } from 'vue';
import { workspaceUserList } from '@/api/workspace';
import avatar_personal from '@/assets/svg/avatar_personal.svg';
import Close from '@/assets/svg/icon_close_outlined_w.svg';
import Search from '@/assets/svg/icon_search-outline_outlined.svg';
const checkAll = ref(false);
const isIndeterminate = ref(false);
const checkedWorkspace = ref([]);
const workspace = ref([]);
const search = ref('');
const loading = ref(false);
const centerDialogVisible = ref(false);
const checkTableList = ref([]);
const workspaceWithKeywords = computed(() => {
    return workspace.value.filter((ele) => ele.name.includes(search.value));
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
const open = async (user) => {
    loading.value = true;
    search.value = '';
    checkedWorkspace.value = [];
    checkAll.value = false;
    checkTableList.value = [];
    isIndeterminate.value = false;
    const systemWorkspaceList = await workspaceUserList({}, 1, 1000);
    workspace.value = JSON.parse(JSON.stringify(systemWorkspaceList.items));
    if (user?.length) {
        checkedWorkspace.value = workspace.value.filter((ele) => user.includes(ele.id));
        checkTableList.value = [...checkedWorkspace.value];
        handleCheckedWorkspaceChange(checkedWorkspace.value);
    }
    loading.value = false;
    centerDialogVisible.value = true;
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
    checkTableList,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-user_permission" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "lighter-bold" },
});
(__VLS_ctx.$t('permission.select_restricted_user'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex border" },
    ...{ style: {} },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "p-16 border-r" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.search),
    validateEvent: (false),
    placeholder: (__VLS_ctx.$t('datasource.search')),
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.search),
    validateEvent: (false),
    placeholder: (__VLS_ctx.$t('datasource.search')),
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_4 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.Search;
    /** @type {[typeof __VLS_components.Search, typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-8 max-height_workspace" },
});
const __VLS_12 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkAll),
    ...{ class: "mb-8" },
    ...{ style: {} },
    indeterminate: (__VLS_ctx.isIndeterminate),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkAll),
    ...{ class: "mb-8" },
    ...{ style: {} },
    indeterminate: (__VLS_ctx.isIndeterminate),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onChange: (__VLS_ctx.handleCheckAllChange)
};
__VLS_15.slots.default;
(__VLS_ctx.$t('datasource.select_all'));
var __VLS_15;
const __VLS_20 = {}.ElCheckboxGroup;
/** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkedWorkspace),
    ...{ class: "checkbox-group-block" },
}));
const __VLS_22 = __VLS_21({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkedWorkspace),
    ...{ class: "checkbox-group-block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onChange: (__VLS_ctx.handleCheckedWorkspaceChange)
};
__VLS_23.slots.default;
for (const [space] of __VLS_getVForSourceType((__VLS_ctx.workspaceWithKeywords))) {
    const __VLS_28 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (space.id),
        label: (space.name),
        value: (space),
        ...{ class: "hover-bg" },
    }));
    const __VLS_30 = __VLS_29({
        key: (space.id),
        label: (space.name),
        value: (space),
        ...{ class: "hover-bg" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex" },
    });
    const __VLS_32 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        size: "28",
    }));
    const __VLS_34 = __VLS_33({
        size: "28",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.avatar_personal;
    /** @type {[typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    var __VLS_35;
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
    var __VLS_31;
}
var __VLS_23;
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
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (__VLS_ctx.clearWorkspaceAll)
};
__VLS_43.slots.default;
(__VLS_ctx.$t('workspace.clear'));
var __VLS_43;
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.checkTableList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (ele.name),
        ...{ style: {} },
        ...{ class: "flex-between align-center hover-bg_select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex align-center ellipsis" },
        ...{ style: {} },
    });
    const __VLS_48 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        size: "28",
    }));
    const __VLS_50 = __VLS_49({
        size: "28",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.avatar_personal;
    /** @type {[typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, typeof __VLS_components.Avatar_personal, typeof __VLS_components.avatar_personal, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
    const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
    var __VLS_51;
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
    const __VLS_56 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ class: "close-btn" },
        text: true,
    }));
    const __VLS_58 = __VLS_57({
        ...{ class: "close-btn" },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    const __VLS_60 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        size: "16",
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            __VLS_ctx.clearWorkspace(ele);
        }
    };
    __VLS_63.slots.default;
    const __VLS_68 = {}.Close;
    /** @type {[typeof __VLS_components.Close, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
    var __VLS_63;
    var __VLS_59;
}
/** @type {__VLS_StyleScopedClasses['select-user_permission']} */ ;
/** @type {__VLS_StyleScopedClasses['lighter-bold']} */ ;
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
            search: search,
            loading: loading,
            checkTableList: checkTableList,
            workspaceWithKeywords: workspaceWithKeywords,
            handleCheckAllChange: handleCheckAllChange,
            handleCheckedWorkspaceChange: handleCheckedWorkspaceChange,
            clearWorkspace: clearWorkspace,
            clearWorkspaceAll: clearWorkspaceAll,
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
