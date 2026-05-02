import { ref, onMounted, reactive, nextTick } from 'vue';
import { uwsOption, workspaceUserList, workspaceUwsDelete, workspaceUwsCreate, } from '@/api/workspace';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import assigned from '@/assets/svg/icon_assigned_outlined.svg';
import SuccessFilled from '@/assets/svg/gou_icon.svg';
import CircleCloseFilled from '@/assets/svg/icon_ban_filled.svg';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const multipleSelectionAll = ref([]);
const keywordsMember = ref('');
const userStore = useUserStore();
const searchLoading = ref(false);
const workspaceForm = reactive({
    name: '',
    id: '',
});
const selectable = (row) => {
    if (+userStore.getUid === 1) {
        return true;
    }
    return ![userStore.getUid].includes(row.id) && row.weight !== 1;
};
onMounted(() => {
    search();
});
const fieldDialog = ref(false);
const multipleTableRef = ref();
const isIndeterminate = ref(true);
const checkAll = ref(false);
const fieldList = ref([]);
const pageInfo = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
});
const cancelDelete = () => {
    handleToggleRowSelection(false);
    multipleSelectionAll.value = [];
    checkAll.value = false;
    isIndeterminate.value = false;
};
const deleteBatchUser = () => {
    ElMessageBox.confirm(t('workspace.selected_2_members', { msg: multipleSelectionAll.value.length }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('workspace.remove'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        workspaceUwsDelete({
            uid_list: multipleSelectionAll.value.map((ele) => ele.id),
        }).then(() => {
            ElMessage({
                type: 'success',
                message: t('workspace.removed_successfully'),
            });
            multipleSelectionAll.value = [];
            search();
        });
    });
};
const deleteHandler = (row) => {
    if (row.weight === 1 && +userStore.getUid !== 1)
        return;
    ElMessageBox.confirm(t('workspace.member_feng_yibudao', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('workspace.remove'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        workspaceUwsDelete({
            uid_list: [row.id],
        }).then(() => {
            multipleSelectionAll.value = multipleSelectionAll.value.filter((ele) => row.id !== ele.id);
            ElMessage({
                type: 'success',
                message: t('workspace.removed_successfully'),
            });
            search();
        });
    });
};
const handleSelectionChange = (val) => {
    if (toggleRowLoading.value)
        return;
    const arr = fieldList.value.filter(selectable);
    const ids = arr.map((ele) => ele.id);
    multipleSelectionAll.value = [
        ...multipleSelectionAll.value.filter((ele) => !ids.includes(ele.id)),
        ...val,
    ];
    isIndeterminate.value = !(val.length === 0 || val.length === arr.length);
    checkAll.value = val.length === arr.length;
};
const handleCheckAllChange = (val) => {
    isIndeterminate.value = false;
    handleSelectionChange(val ? fieldList.value.filter(selectable) : []);
    if (val) {
        handleToggleRowSelection();
    }
    else {
        multipleTableRef.value.clearSelection();
    }
};
const toggleRowLoading = ref(false);
const handleToggleRowSelection = (check = true) => {
    toggleRowLoading.value = true;
    const arr = fieldList.value.filter(selectable);
    let i = 0;
    const ids = multipleSelectionAll.value.map((ele) => ele.id);
    for (const key in arr) {
        if (ids.includes(arr[key].id)) {
            i += 1;
            multipleTableRef.value.toggleRowSelection(arr[key], check);
        }
    }
    toggleRowLoading.value = false;
    checkAll.value = i === arr.length;
    isIndeterminate.value = !(i === 0 || i === arr.length);
};
const search = ($event = {}) => {
    if ($event?.isComposing) {
        return;
    }
    searchLoading.value = true;
    workspaceUserList(keywordsMember.value ? { keyword: keywordsMember.value } : {}, pageInfo.currentPage, pageInfo.pageSize)
        .then((res) => {
        toggleRowLoading.value = true;
        fieldList.value = res.items;
        pageInfo.total = res.total;
        searchLoading.value = false;
        nextTick(() => {
            handleToggleRowSelection();
        });
    })
        .finally(() => {
        searchLoading.value = false;
    });
};
const closeField = () => {
    fieldDialog.value = false;
    afterFind.value = false;
    userInfo.value.id = '';
    userInfo.value.name = '';
    userInfo.value.account = '';
};
const saveField = () => {
    workspaceUwsCreate({
        uid_list: [userInfo.value.id],
    }).then(() => {
        ElMessage({
            type: 'success',
            message: t('common.save_success'),
        });
        search();
        closeField();
    });
};
const userInfo = ref({
    id: '',
    name: '',
    account: '',
});
const afterFind = ref(false);
const findUser = () => {
    if (!workspaceForm.name)
        return;
    uwsOption({ keyword: workspaceForm.name })
        .then((res) => {
        userInfo.value = res || {};
    })
        .finally(() => {
        afterFind.value = true;
    });
};
const addWorkspace = () => {
    afterFind.value = false;
    workspaceForm.name = '';
    fieldDialog.value = true;
};
const handleSizeChange = (val) => {
    pageInfo.currentPage = 1;
    pageInfo.pageSize = val;
    search();
};
const handleCurrentChange = (val) => {
    pageInfo.currentPage = val;
    search();
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['not-allow']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "member" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.searchLoading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('workspace.member_management'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-bar" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywordsMember),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('user.name_account_email')),
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywordsMember),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('user.name_account_email')),
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onKeydown: (__VLS_ctx.search)
};
__VLS_3.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
}
var __VLS_3;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.addWorkspace();
    }
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
(__VLS_ctx.$t('workspace.add_member'));
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-content" },
    ...{ class: (__VLS_ctx.multipleSelectionAll.length > 0 && 'show-pagination_height') },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-or-schema" },
});
const __VLS_28 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onSelectionChange': {} },
    ref: "multipleTableRef",
    data: (__VLS_ctx.fieldList),
    ...{ style: {} },
}));
const __VLS_30 = __VLS_29({
    ...{ 'onSelectionChange': {} },
    ref: "multipleTableRef",
    data: (__VLS_ctx.fieldList),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
/** @type {typeof __VLS_ctx.multipleTableRef} */ ;
var __VLS_36 = {};
__VLS_31.slots.default;
const __VLS_38 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    selectable: (__VLS_ctx.selectable),
    type: "selection",
    width: "55",
}));
const __VLS_40 = __VLS_39({
    selectable: (__VLS_ctx.selectable),
    type: "selection",
    width: "55",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
const __VLS_42 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    prop: "name",
    label: (__VLS_ctx.$t('user.name')),
    width: "160",
}));
const __VLS_44 = __VLS_43({
    prop: "name",
    label: (__VLS_ctx.$t('user.name')),
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
const __VLS_46 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    prop: "account",
    label: (__VLS_ctx.$t('user.account')),
    width: "160",
}));
const __VLS_48 = __VLS_47({
    prop: "account",
    label: (__VLS_ctx.$t('user.account')),
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
const __VLS_50 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    prop: "status",
    label: (__VLS_ctx.$t('user.user_status')),
}));
const __VLS_52 = __VLS_51({
    prop: "status",
    label: (__VLS_ctx.$t('user.user_status')),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_53.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "user-status-container" },
        ...{ class: ([scope.row.status ? 'active' : 'disabled']) },
    });
    const __VLS_54 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        size: "16",
    }));
    const __VLS_56 = __VLS_55({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_57.slots.default;
    if (scope.row.status) {
        const __VLS_58 = {}.SuccessFilled;
        /** @type {[typeof __VLS_components.SuccessFilled, ]} */ ;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({}));
        const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
    }
    else {
        const __VLS_62 = {}.CircleCloseFilled;
        /** @type {[typeof __VLS_components.CircleCloseFilled, ]} */ ;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({}));
        const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
    }
    var __VLS_57;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t(`user.${scope.row.status ? 'enabled' : 'disabled'}`));
}
var __VLS_53;
const __VLS_66 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    prop: "email",
    label: (__VLS_ctx.$t('user.email')),
    width: "204",
}));
const __VLS_68 = __VLS_67({
    prop: "email",
    label: (__VLS_ctx.$t('user.email')),
    width: "204",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
const __VLS_70 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    prop: "weight",
    label: (__VLS_ctx.$t('workspace.member_type')),
    width: "120",
}));
const __VLS_72 = __VLS_71({
    prop: "weight",
    label: (__VLS_ctx.$t('workspace.member_type')),
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
__VLS_73.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_73.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (scope.row.weight === 1
        ? __VLS_ctx.t('workspace.administrator')
        : __VLS_ctx.t('workspace.ordinary_member'));
}
var __VLS_73;
const __VLS_74 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    fixed: "right",
    width: "80",
    label: (__VLS_ctx.t('ds.actions')),
}));
const __VLS_76 = __VLS_75({
    fixed: "right",
    width: "80",
    label: (__VLS_ctx.t('ds.actions')),
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
__VLS_77.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_77.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "field-comment" },
    });
    const __VLS_78 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('workspace.remove')),
        placement: "top",
    }));
    const __VLS_80 = __VLS_79({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('workspace.remove')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    __VLS_81.slots.default;
    const __VLS_82 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        ...{ class: (+__VLS_ctx.userStore.getUid !== 1 && scope.row.weight === 1 && 'not-allow') },
        size: "16",
    }));
    const __VLS_84 = __VLS_83({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        ...{ class: (+__VLS_ctx.userStore.getUid !== 1 && scope.row.weight === 1 && 'not-allow') },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    let __VLS_86;
    let __VLS_87;
    let __VLS_88;
    const __VLS_89 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteHandler(scope.row);
        }
    };
    __VLS_85.slots.default;
    const __VLS_90 = {}.assigned;
    /** @type {[typeof __VLS_components.Assigned, typeof __VLS_components.assigned, typeof __VLS_components.Assigned, typeof __VLS_components.assigned, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
    const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
    var __VLS_85;
    var __VLS_81;
}
var __VLS_77;
{
    const { empty: __VLS_thisSlot } = __VLS_31.slots;
    if (!__VLS_ctx.keywordsMember && !__VLS_ctx.fieldList.length) {
        /** @type {[typeof EmptyBackground, ]} */ ;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
            description: (__VLS_ctx.$t('workspace.no_user')),
            imgType: "noneWhite",
        }));
        const __VLS_95 = __VLS_94({
            description: (__VLS_ctx.$t('workspace.no_user')),
            imgType: "noneWhite",
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    }
    if (!!__VLS_ctx.keywordsMember && !__VLS_ctx.fieldList.length) {
        /** @type {[typeof EmptyBackground, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
            description: (__VLS_ctx.$t('datasource.relevant_content_found')),
            imgType: "tree",
        }));
        const __VLS_98 = __VLS_97({
            description: (__VLS_ctx.$t('datasource.relevant_content_found')),
            imgType: "tree",
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    }
}
var __VLS_31;
if (__VLS_ctx.fieldList.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_100 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }));
    const __VLS_102 = __VLS_101({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    let __VLS_104;
    let __VLS_105;
    let __VLS_106;
    const __VLS_107 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_108 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_103;
}
if (__VLS_ctx.multipleSelectionAll.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-select" },
    });
    const __VLS_109 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }));
    const __VLS_111 = __VLS_110({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    let __VLS_113;
    let __VLS_114;
    let __VLS_115;
    const __VLS_116 = {
        onChange: (__VLS_ctx.handleCheckAllChange)
    };
    __VLS_112.slots.default;
    (__VLS_ctx.$t('datasource.select_all'));
    var __VLS_112;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.deleteBatchUser) },
        ...{ class: "danger-button" },
    });
    (__VLS_ctx.$t('workspace.remove'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected" },
    });
    (__VLS_ctx.$t('user.selected_2_items', { msg: __VLS_ctx.multipleSelectionAll.length }));
    const __VLS_117 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_119 = __VLS_118({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    let __VLS_121;
    let __VLS_122;
    let __VLS_123;
    const __VLS_124 = {
        onClick: (__VLS_ctx.cancelDelete)
    };
    __VLS_120.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_120;
}
const __VLS_125 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    ...{ 'onBeforeClosed': {} },
    modelValue: (__VLS_ctx.fieldDialog),
    title: (__VLS_ctx.$t('workspace.add_member')),
    width: "600",
    modalClass: "add-user_dialog",
    destroyOnClose: true,
    closeOnClickModal: (false),
}));
const __VLS_127 = __VLS_126({
    ...{ 'onBeforeClosed': {} },
    modelValue: (__VLS_ctx.fieldDialog),
    title: (__VLS_ctx.$t('workspace.add_member')),
    width: "600",
    modalClass: "add-user_dialog",
    destroyOnClose: true,
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
let __VLS_129;
let __VLS_130;
let __VLS_131;
const __VLS_132 = {
    onBeforeClosed: (__VLS_ctx.closeField)
};
__VLS_128.slots.default;
const __VLS_133 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    modelValue: (__VLS_ctx.workspaceForm.name),
    clearable: true,
    ...{ class: (__VLS_ctx.workspaceForm.name && 'value-input') },
    placeholder: (__VLS_ctx.$t('workspace.id_account_to_add')),
}));
const __VLS_135 = __VLS_134({
    modelValue: (__VLS_ctx.workspaceForm.name),
    clearable: true,
    ...{ class: (__VLS_ctx.workspaceForm.name && 'value-input') },
    placeholder: (__VLS_ctx.$t('workspace.id_account_to_add')),
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
__VLS_136.slots.default;
{
    const { append: __VLS_thisSlot } = __VLS_136.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (__VLS_ctx.findUser) },
        ...{ style: {} },
    });
    (__VLS_ctx.t('workspace.find_user'));
}
var __VLS_136;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user" },
});
if (__VLS_ctx.userInfo.id) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name" },
    });
    (__VLS_ctx.userInfo.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "account" },
    });
    (__VLS_ctx.userInfo.account);
}
else if (__VLS_ctx.afterFind) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty" },
    });
    (__VLS_ctx.$t('common.may_not_exist'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_137 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_139 = __VLS_138({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
let __VLS_141;
let __VLS_142;
let __VLS_143;
const __VLS_144 = {
    onClick: (__VLS_ctx.closeField)
};
__VLS_140.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_140;
if (!__VLS_ctx.userInfo.id) {
    const __VLS_145 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
        disabled: true,
        type: "info",
    }));
    const __VLS_147 = __VLS_146({
        disabled: true,
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    __VLS_148.slots.default;
    (__VLS_ctx.t('model.add'));
    var __VLS_148;
}
else {
    const __VLS_149 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_151 = __VLS_150({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    let __VLS_153;
    let __VLS_154;
    let __VLS_155;
    const __VLS_156 = {
        onClick: (__VLS_ctx.saveField)
    };
    __VLS_152.slots.default;
    (__VLS_ctx.t('model.add'));
    var __VLS_152;
}
var __VLS_128;
/** @type {__VLS_StyleScopedClasses['member']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-or-schema']} */ ;
/** @type {__VLS_StyleScopedClasses['user-status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-button']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['account']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
// @ts-ignore
var __VLS_37 = __VLS_36;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_add_outlined: icon_add_outlined,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            EmptyBackground: EmptyBackground,
            assigned: assigned,
            SuccessFilled: SuccessFilled,
            CircleCloseFilled: CircleCloseFilled,
            t: t,
            multipleSelectionAll: multipleSelectionAll,
            keywordsMember: keywordsMember,
            userStore: userStore,
            searchLoading: searchLoading,
            workspaceForm: workspaceForm,
            selectable: selectable,
            fieldDialog: fieldDialog,
            multipleTableRef: multipleTableRef,
            isIndeterminate: isIndeterminate,
            checkAll: checkAll,
            fieldList: fieldList,
            pageInfo: pageInfo,
            cancelDelete: cancelDelete,
            deleteBatchUser: deleteBatchUser,
            deleteHandler: deleteHandler,
            handleSelectionChange: handleSelectionChange,
            handleCheckAllChange: handleCheckAllChange,
            search: search,
            closeField: closeField,
            saveField: saveField,
            userInfo: userInfo,
            afterFind: afterFind,
            findUser: findUser,
            addWorkspace: addWorkspace,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
