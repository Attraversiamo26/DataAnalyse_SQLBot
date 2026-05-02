import { ref, computed, onMounted, reactive } from 'vue';
import { workspaceList, workspaceUserList, workspaceDelete, workspaceUwsDelete, workspaceCreate, workspaceUpdate, workspaceUwsUpdate, } from '@/api/workspace';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import arrow_down from '@/assets/svg/arrow-down.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import icon_form_outlined from '@/assets/svg/icon_moments-categories_outlined.svg';
import assigned from '@/assets/svg/icon_assigned_outlined.svg';
import AuthorizedWorkspaceDialog from './AuthorizedWorkspaceDialog.vue';
import rename from '@/assets/svg/icon_rename_outlined.svg';
import icon_member from '@/assets/svg/icon_member.svg';
import SuccessFilled from '@/assets/svg/gou_icon.svg';
import CircleCloseFilled from '@/assets/svg/icon_ban_filled.svg';
import { useI18n } from 'vue-i18n';
import delIcon from '@/assets/svg/icon_delete.svg';
import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg';
import icon_done_outlined from '@/assets/svg/icon_done_outlined.svg';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
const { t } = useI18n();
const multipleSelectionAll = ref([]);
const tableList = ref([]);
const keyword = ref('');
const keywordsMember = ref('');
const oldKeywordsMember = ref('');
const workspaceFormRef = ref();
const authorizedWorkspaceDialog = ref();
const tableListWithSearch = computed(() => {
    if (!keyword.value)
        return tableList.value;
    return tableList.value.filter((ele) => ele.name.toLowerCase().includes(keyword.value.toLowerCase()));
});
const workspaceForm = reactive({
    name: '',
    id: '',
});
const userTypeList = [
    {
        name: t('workspace.administrator'),
        value: 1,
    },
    {
        name: t('workspace.ordinary_member'),
        value: 0,
    },
];
const handleUserTypeChange = (val, row) => {
    workspaceUwsUpdate({
        uid: row.id,
        oid: currentTable.value.id,
        weight: val,
    }).then(() => {
        ElMessage({
            type: 'success',
            message: t('common.save_success'),
        });
        search();
    });
};
const rules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('workspace.workspace_name'),
            trigger: 'blur',
        },
    ],
};
const fieldListWithSearch = computed(() => {
    if (!keyword.value)
        return fieldList.value;
    return fieldList.value.filter((ele) => ele.name.toLowerCase().includes(keywordsMember.value.toLowerCase()));
});
const currentTable = ref({ id: 1, name: '' });
const init = () => {
    workspaceList().then((res) => {
        tableList.value = res;
        if (currentTable.value.id) {
            tableList.value.forEach((ele) => {
                if (ele.id === currentTable.value.id) {
                    currentTable.value.name = ele.name;
                    clickTable(ele);
                }
            });
        }
    });
};
const duplicateName = async () => {
    const res = await workspaceList();
    const names = res.filter((ele) => ele.id !== workspaceForm.id).map((ele) => ele.name);
    if (names.includes(workspaceForm.name)) {
        ElMessage.error(t('embedded.duplicate_name'));
        return;
    }
    const req = workspaceForm.id ? workspaceUpdate : workspaceCreate;
    req(workspaceForm).then(() => {
        ElMessage({
            type: 'success',
            message: t('common.save_success'),
        });
        init();
        fieldDialog.value = false;
    });
};
onMounted(() => {
    init();
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
const clickTable = (table) => {
    currentTable.value = table;
    pageInfo.currentPage = 1;
    search();
};
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
            oid: currentTable.value.id,
        }).then(() => {
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
            });
            multipleSelectionAll.value = [];
            search();
        });
    });
};
const deleteHandler = (row) => {
    ElMessageBox.confirm(t('workspace.member_feng_yibudao', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('workspace.remove'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        workspaceUwsDelete({
            uid_list: [row.id],
            oid: currentTable.value.id,
        }).then(() => {
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
            });
            search();
        });
    });
};
const handleSelectionChange = (val) => {
    const ids = fieldList.value.map((ele) => ele.id);
    multipleSelectionAll.value = [
        ...multipleSelectionAll.value.filter((ele) => !ids.includes(ele.id)),
        ...val,
    ];
    isIndeterminate.value = !(val.length === 0 || val.length === fieldList.value.length);
    checkAll.value = val.length === fieldList.value.length;
};
const handleCheckAllChange = (val) => {
    isIndeterminate.value = false;
    handleSelectionChange(val ? fieldList.value : []);
    if (val) {
        handleToggleRowSelection();
    }
    else {
        multipleTableRef.value.clearSelection();
    }
};
const handleToggleRowSelection = (check = true) => {
    let i = 0;
    const ids = multipleSelectionAll.value.map((ele) => ele.id);
    for (const key in fieldList.value) {
        if (ids.includes(fieldList.value[key].id)) {
            i += 1;
            multipleTableRef.value.toggleRowSelection(fieldList.value[key], check);
        }
    }
    checkAll.value = i === fieldList.value.length;
    isIndeterminate.value = !(i === 0 || i === fieldList.value.length);
};
const handleAddMember = () => {
    authorizedWorkspaceDialog.value.open(currentTable.value.id);
};
const refresh = () => {
    search();
};
const search = ($event = {}) => {
    if ($event?.isComposing) {
        return;
    }
    workspaceUserList({ oid: currentTable.value.id, keyword: keywordsMember.value }, pageInfo.currentPage, pageInfo.pageSize).then((res) => {
        fieldList.value = res.items.sort((a, b) => b.weight - a.weight);
        pageInfo.total = res.total;
        oldKeywordsMember.value = keywordsMember.value;
    });
};
const closeField = () => {
    fieldDialog.value = false;
};
const saveField = () => {
    workspaceFormRef.value.validate((res) => {
        if (res) {
            duplicateName();
        }
    });
};
const delWorkspace = (row) => {
    ElMessageBox.confirm(t('workspace.workspace_de_workspace', { msg: row.name }), {
        confirmButtonType: 'danger',
        tip: t('workspace.operate_with_caution'),
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        workspaceDelete(row.id).then(async () => {
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
            });
            init();
            if (row.id === currentTable.value.id) {
                currentTable.value = {};
            }
            if (row.id === userStore.getOid) {
                userStore.setOid('1');
                await userStore.info();
            }
        });
    });
};
const addWorkspace = (row) => {
    if (row) {
        workspaceForm.name = row.name;
        workspaceForm.id = row.id;
    }
    else {
        workspaceForm.name = '';
        workspaceForm.id = '';
    }
    fieldDialog.value = true;
};
const handleSizeChange = (val) => {
    pageInfo.pageSize = val;
    pageInfo.currentPage = 1;
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
/** @type {__VLS_StyleScopedClasses['more']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "workspace no-padding" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-table_top" },
});
(__VLS_ctx.$t('user.workspace'));
const __VLS_0 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.$t('workspace.add_workspace')),
    placement: "top",
}));
const __VLS_2 = __VLS_1({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.$t('workspace.add_workspace')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    size: "18",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    size: "18",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.addWorkspace)
};
__VLS_7.slots.default;
const __VLS_12 = {}.icon_add_outlined;
/** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_7;
var __VLS_3;
const __VLS_16 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.keyword),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.keyword),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_20 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ class: "svg-icon" },
    }));
    const __VLS_26 = __VLS_25({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_23;
}
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "list-content" },
});
const __VLS_28 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.tableListWithSearch))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.clickTable(ele);
            } },
        key: (ele.name),
        ...{ class: "model" },
        ...{ class: (__VLS_ctx.currentTable.name === ele.name && 'isActive') },
        title: (ele.name),
    });
    const __VLS_32 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        size: "16",
    }));
    const __VLS_34 = __VLS_33({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.icon_form_outlined;
    /** @type {[typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    var __VLS_35;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "name" },
    });
    (ele.name);
    const __VLS_40 = {}.ElPopover;
    /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        trigger: "click",
        teleported: (false),
        popperClass: "popover-card_workspack",
        placement: "bottom",
    }));
    const __VLS_42 = __VLS_41({
        trigger: "click",
        teleported: (false),
        popperClass: "popover-card_workspack",
        placement: "bottom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    {
        const { reference: __VLS_thisSlot } = __VLS_43.slots;
        const __VLS_44 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            ...{ 'onClick': {} },
            ...{ class: "more" },
            size: "16",
            ...{ style: {} },
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onClick': {} },
            ...{ class: "more" },
            size: "16",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_48;
        let __VLS_49;
        let __VLS_50;
        const __VLS_51 = {
            onClick: () => { }
        };
        __VLS_47.slots.default;
        const __VLS_52 = {}.icon_more_outlined;
        /** @type {[typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
        var __VLS_47;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.addWorkspace(ele);
            } },
        ...{ class: "item" },
    });
    const __VLS_56 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        size: "16",
    }));
    const __VLS_58 = __VLS_57({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    const __VLS_60 = {}.rename;
    /** @type {[typeof __VLS_components.Rename, typeof __VLS_components.rename, typeof __VLS_components.Rename, typeof __VLS_components.rename, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    var __VLS_59;
    (__VLS_ctx.$t('dashboard.rename'));
    if (ele.id !== 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(ele.id !== 1))
                        return;
                    __VLS_ctx.delWorkspace(ele);
                } },
            ...{ class: "item" },
        });
        const __VLS_64 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            size: "16",
        }));
        const __VLS_66 = __VLS_65({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        const __VLS_68 = {}.delIcon;
        /** @type {[typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
        const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
        var __VLS_67;
        (__VLS_ctx.$t('dashboard.delete'));
    }
    var __VLS_43;
}
var __VLS_31;
if (!!__VLS_ctx.keyword && !__VLS_ctx.tableListWithSearch.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-result" },
    });
    (__VLS_ctx.$t('workspace.relevant_content_found'));
}
if (!!__VLS_ctx.keyword && !__VLS_ctx.tableListWithSearch.length) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
        ...{ style: {} },
    }));
    const __VLS_73 = __VLS_72({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
}
if (__VLS_ctx.currentTable.name) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-table" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-name" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name" },
    });
    (__VLS_ctx.currentTable.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "line" },
    });
    const __VLS_75 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_77 = __VLS_76({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    __VLS_78.slots.default;
    const __VLS_79 = {}.icon_member;
    /** @type {[typeof __VLS_components.Icon_member, typeof __VLS_components.icon_member, typeof __VLS_components.Icon_member, typeof __VLS_components.icon_member, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({}));
    const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
    var __VLS_78;
    (__VLS_ctx.pageInfo.total);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notes" },
    });
    const __VLS_83 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_85 = __VLS_84({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    let __VLS_87;
    let __VLS_88;
    let __VLS_89;
    const __VLS_90 = {
        onClick: (__VLS_ctx.handleAddMember)
    };
    __VLS_86.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_86.slots;
        const __VLS_91 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({}));
        const __VLS_93 = __VLS_92({}, ...__VLS_functionalComponentArgsRest(__VLS_92));
    }
    (__VLS_ctx.$t('workspace.add_member'));
    var __VLS_86;
    const __VLS_95 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.keywordsMember),
        clearable: true,
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('workspace.name_username_email')),
    }));
    const __VLS_97 = __VLS_96({
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.keywordsMember),
        clearable: true,
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('workspace.name_username_email')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    let __VLS_99;
    let __VLS_100;
    let __VLS_101;
    const __VLS_102 = {
        onKeydown: (__VLS_ctx.search)
    };
    __VLS_98.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_98.slots;
        const __VLS_103 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({}));
        const __VLS_105 = __VLS_104({}, ...__VLS_functionalComponentArgsRest(__VLS_104));
        __VLS_106.slots.default;
        const __VLS_107 = {}.icon_searchOutline_outlined;
        /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
            ...{ class: "svg-icon" },
        }));
        const __VLS_109 = __VLS_108({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        var __VLS_106;
    }
    var __VLS_98;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
        ...{ class: (__VLS_ctx.multipleSelectionAll.length > 0 && 'show-pagination_height') },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-or-schema" },
    });
    const __VLS_111 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
        ...{ 'onSelectionChange': {} },
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldListWithSearch),
        ...{ style: {} },
    }));
    const __VLS_113 = __VLS_112({
        ...{ 'onSelectionChange': {} },
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldListWithSearch),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    let __VLS_115;
    let __VLS_116;
    let __VLS_117;
    const __VLS_118 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    /** @type {typeof __VLS_ctx.multipleTableRef} */ ;
    var __VLS_119 = {};
    __VLS_114.slots.default;
    const __VLS_121 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        type: "selection",
        width: "55",
    }));
    const __VLS_123 = __VLS_122({
        type: "selection",
        width: "55",
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    const __VLS_125 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
        prop: "name",
        label: (__VLS_ctx.$t('user.name')),
        width: "160",
    }));
    const __VLS_127 = __VLS_126({
        prop: "name",
        label: (__VLS_ctx.$t('user.name')),
        width: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    const __VLS_129 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        prop: "account",
        label: (__VLS_ctx.$t('user.account')),
        width: "160",
    }));
    const __VLS_131 = __VLS_130({
        prop: "account",
        label: (__VLS_ctx.$t('user.account')),
        width: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    const __VLS_133 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
        prop: "status",
        label: (__VLS_ctx.$t('user.user_status')),
    }));
    const __VLS_135 = __VLS_134({
        prop: "status",
        label: (__VLS_ctx.$t('user.user_status')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    __VLS_136.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_136.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-status-container" },
            ...{ class: ([scope.row.status ? 'active' : 'disabled']) },
        });
        const __VLS_137 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
            size: "16",
        }));
        const __VLS_139 = __VLS_138({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        __VLS_140.slots.default;
        if (scope.row.status) {
            const __VLS_141 = {}.SuccessFilled;
            /** @type {[typeof __VLS_components.SuccessFilled, ]} */ ;
            // @ts-ignore
            const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({}));
            const __VLS_143 = __VLS_142({}, ...__VLS_functionalComponentArgsRest(__VLS_142));
        }
        else {
            const __VLS_145 = {}.CircleCloseFilled;
            /** @type {[typeof __VLS_components.CircleCloseFilled, ]} */ ;
            // @ts-ignore
            const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({}));
            const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
        }
        var __VLS_140;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t(`user.${scope.row.status ? 'enabled' : 'disabled'}`));
    }
    var __VLS_136;
    const __VLS_149 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
        prop: "email",
        label: (__VLS_ctx.$t('user.email')),
        width: "204",
    }));
    const __VLS_151 = __VLS_150({
        prop: "email",
        label: (__VLS_ctx.$t('user.email')),
        width: "204",
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    const __VLS_153 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
        className: "user-source",
        prop: "weight",
        label: (__VLS_ctx.$t('workspace.member_type')),
        width: "120",
    }));
    const __VLS_155 = __VLS_154({
        className: "user-source",
        prop: "weight",
        label: (__VLS_ctx.$t('workspace.member_type')),
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_154));
    __VLS_156.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_156.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_157 = {}.ElPopover;
        /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
        // @ts-ignore
        const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
            popperClass: "system-workspace_user",
            placement: "bottom",
        }));
        const __VLS_159 = __VLS_158({
            popperClass: "system-workspace_user",
            placement: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_158));
        __VLS_160.slots.default;
        {
            const { reference: __VLS_thisSlot } = __VLS_160.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (scope.row.weight === 1
                ? __VLS_ctx.t('workspace.administrator')
                : __VLS_ctx.t('workspace.ordinary_member'));
            const __VLS_161 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
                ...{ style: {} },
                size: "16",
            }));
            const __VLS_163 = __VLS_162({
                ...{ style: {} },
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_162));
            __VLS_164.slots.default;
            const __VLS_165 = {}.arrow_down;
            /** @type {[typeof __VLS_components.Arrow_down, typeof __VLS_components.arrow_down, typeof __VLS_components.Arrow_down, typeof __VLS_components.arrow_down, ]} */ ;
            // @ts-ignore
            const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({}));
            const __VLS_167 = __VLS_166({}, ...__VLS_functionalComponentArgsRest(__VLS_166));
            var __VLS_164;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "popover" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "popover-content" },
        });
        for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.userTypeList))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.currentTable.name))
                            return;
                        __VLS_ctx.handleUserTypeChange(ele.value, scope.row);
                    } },
                key: (ele.name),
                ...{ class: "popover-item" },
                ...{ class: (ele.name === scope.row.user_source && 'isActive') },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "model-name" },
            });
            (ele.name);
            const __VLS_169 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
                size: "16",
                ...{ class: "done" },
            }));
            const __VLS_171 = __VLS_170({
                size: "16",
                ...{ class: "done" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_170));
            __VLS_172.slots.default;
            const __VLS_173 = {}.icon_done_outlined;
            /** @type {[typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({}));
            const __VLS_175 = __VLS_174({}, ...__VLS_functionalComponentArgsRest(__VLS_174));
            var __VLS_172;
        }
        var __VLS_160;
    }
    var __VLS_156;
    const __VLS_177 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
        fixed: "right",
        width: "80",
        label: (__VLS_ctx.t('ds.actions')),
    }));
    const __VLS_179 = __VLS_178({
        fixed: "right",
        width: "80",
        label: (__VLS_ctx.t('ds.actions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_178));
    __VLS_180.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_180.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-comment" },
        });
        const __VLS_181 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('workspace.remove')),
            placement: "top",
        }));
        const __VLS_183 = __VLS_182({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('workspace.remove')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_182));
        __VLS_184.slots.default;
        const __VLS_185 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }));
        const __VLS_187 = __VLS_186({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        let __VLS_189;
        let __VLS_190;
        let __VLS_191;
        const __VLS_192 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.currentTable.name))
                    return;
                __VLS_ctx.deleteHandler(scope.row);
            }
        };
        __VLS_188.slots.default;
        const __VLS_193 = {}.assigned;
        /** @type {[typeof __VLS_components.Assigned, typeof __VLS_components.assigned, typeof __VLS_components.Assigned, typeof __VLS_components.assigned, ]} */ ;
        // @ts-ignore
        const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({}));
        const __VLS_195 = __VLS_194({}, ...__VLS_functionalComponentArgsRest(__VLS_194));
        var __VLS_188;
        var __VLS_184;
    }
    var __VLS_180;
    {
        const { empty: __VLS_thisSlot } = __VLS_114.slots;
        if (!__VLS_ctx.oldKeywordsMember && !__VLS_ctx.fieldListWithSearch.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_197 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                description: (__VLS_ctx.$t('workspace.no_user')),
                imgType: "noneWhite",
            }));
            const __VLS_198 = __VLS_197({
                description: (__VLS_ctx.$t('workspace.no_user')),
                imgType: "noneWhite",
            }, ...__VLS_functionalComponentArgsRest(__VLS_197));
        }
        if (!!__VLS_ctx.oldKeywordsMember && !__VLS_ctx.fieldListWithSearch.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_200 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }));
            const __VLS_201 = __VLS_200({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }, ...__VLS_functionalComponentArgsRest(__VLS_200));
        }
    }
    var __VLS_114;
    if (__VLS_ctx.fieldListWithSearch.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pagination-container" },
        });
        const __VLS_203 = {}.ElPagination;
        /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
        // @ts-ignore
        const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
            ...{ 'onSizeChange': {} },
            ...{ 'onCurrentChange': {} },
            currentPage: (__VLS_ctx.pageInfo.currentPage),
            pageSize: (__VLS_ctx.pageInfo.pageSize),
            pageSizes: ([10, 20, 30]),
            background: (true),
            layout: "total, sizes, prev, pager, next, jumper",
            total: (__VLS_ctx.pageInfo.total),
        }));
        const __VLS_205 = __VLS_204({
            ...{ 'onSizeChange': {} },
            ...{ 'onCurrentChange': {} },
            currentPage: (__VLS_ctx.pageInfo.currentPage),
            pageSize: (__VLS_ctx.pageInfo.pageSize),
            pageSizes: ([10, 20, 30]),
            background: (true),
            layout: "total, sizes, prev, pager, next, jumper",
            total: (__VLS_ctx.pageInfo.total),
        }, ...__VLS_functionalComponentArgsRest(__VLS_204));
        let __VLS_207;
        let __VLS_208;
        let __VLS_209;
        const __VLS_210 = {
            onSizeChange: (__VLS_ctx.handleSizeChange)
        };
        const __VLS_211 = {
            onCurrentChange: (__VLS_ctx.handleCurrentChange)
        };
        var __VLS_206;
    }
    if (__VLS_ctx.multipleSelectionAll.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bottom-select" },
        });
        const __VLS_212 = {}.ElCheckbox;
        /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.checkAll),
            indeterminate: (__VLS_ctx.isIndeterminate),
        }));
        const __VLS_214 = __VLS_213({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.checkAll),
            indeterminate: (__VLS_ctx.isIndeterminate),
        }, ...__VLS_functionalComponentArgsRest(__VLS_213));
        let __VLS_216;
        let __VLS_217;
        let __VLS_218;
        const __VLS_219 = {
            onChange: (__VLS_ctx.handleCheckAllChange)
        };
        __VLS_215.slots.default;
        (__VLS_ctx.$t('datasource.select_all'));
        var __VLS_215;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.deleteBatchUser) },
            ...{ class: "danger-button" },
        });
        (__VLS_ctx.$t('workspace.remove'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "selected" },
        });
        (__VLS_ctx.$t('user.selected_2_items', { msg: __VLS_ctx.multipleSelectionAll.length }));
        const __VLS_220 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
            ...{ 'onClick': {} },
            text: true,
        }));
        const __VLS_222 = __VLS_221({
            ...{ 'onClick': {} },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        let __VLS_224;
        let __VLS_225;
        let __VLS_226;
        const __VLS_227 = {
            onClick: (__VLS_ctx.cancelDelete)
        };
        __VLS_223.slots.default;
        (__VLS_ctx.$t('common.cancel'));
        var __VLS_223;
    }
}
/** @type {[typeof AuthorizedWorkspaceDialog, typeof AuthorizedWorkspaceDialog, ]} */ ;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent(AuthorizedWorkspaceDialog, new AuthorizedWorkspaceDialog({
    ...{ 'onRefresh': {} },
    ref: "authorizedWorkspaceDialog",
}));
const __VLS_229 = __VLS_228({
    ...{ 'onRefresh': {} },
    ref: "authorizedWorkspaceDialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
let __VLS_231;
let __VLS_232;
let __VLS_233;
const __VLS_234 = {
    onRefresh: (__VLS_ctx.refresh)
};
/** @type {typeof __VLS_ctx.authorizedWorkspaceDialog} */ ;
var __VLS_235 = {};
var __VLS_230;
const __VLS_237 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
    ...{ 'onBeforeClosed': {} },
    modelValue: (__VLS_ctx.fieldDialog),
    title: (__VLS_ctx.$t(__VLS_ctx.workspaceForm.id ? 'workspace.rename_a_workspace' : 'workspace.add_workspace')),
    width: "420",
    destroyOnClose: true,
    closeOnClickModal: (false),
}));
const __VLS_239 = __VLS_238({
    ...{ 'onBeforeClosed': {} },
    modelValue: (__VLS_ctx.fieldDialog),
    title: (__VLS_ctx.$t(__VLS_ctx.workspaceForm.id ? 'workspace.rename_a_workspace' : 'workspace.add_workspace')),
    width: "420",
    destroyOnClose: true,
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
let __VLS_241;
let __VLS_242;
let __VLS_243;
const __VLS_244 = {
    onBeforeClosed: (__VLS_ctx.closeField)
};
__VLS_240.slots.default;
const __VLS_245 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
    ...{ 'onSubmit': {} },
    ref: "workspaceFormRef",
    model: (__VLS_ctx.workspaceForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}));
const __VLS_247 = __VLS_246({
    ...{ 'onSubmit': {} },
    ref: "workspaceFormRef",
    model: (__VLS_ctx.workspaceForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
let __VLS_249;
let __VLS_250;
let __VLS_251;
const __VLS_252 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.workspaceFormRef} */ ;
var __VLS_253 = {};
__VLS_248.slots.default;
const __VLS_255 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
    prop: "name",
    label: (__VLS_ctx.t('workspace.workspace_name')),
}));
const __VLS_257 = __VLS_256({
    prop: "name",
    label: (__VLS_ctx.t('workspace.workspace_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
__VLS_258.slots.default;
const __VLS_259 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
    modelValue: (__VLS_ctx.workspaceForm.name),
    clearable: true,
    maxlength: "50",
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('workspace.workspace_name')),
}));
const __VLS_261 = __VLS_260({
    modelValue: (__VLS_ctx.workspaceForm.name),
    clearable: true,
    maxlength: "50",
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('workspace.workspace_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
var __VLS_258;
var __VLS_248;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_263 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_265 = __VLS_264({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_264));
let __VLS_267;
let __VLS_268;
let __VLS_269;
const __VLS_270 = {
    onClick: (__VLS_ctx.closeField)
};
__VLS_266.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_266;
const __VLS_271 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_273 = __VLS_272({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
let __VLS_275;
let __VLS_276;
let __VLS_277;
const __VLS_278 = {
    onClick: (__VLS_ctx.saveField)
};
__VLS_274.slots.default;
(__VLS_ctx.t(__VLS_ctx.workspaceForm.id ? 'common.save' : 'model.add'));
var __VLS_274;
var __VLS_240;
/** @type {__VLS_StyleScopedClasses['workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['side-list']} */ ;
/** @type {__VLS_StyleScopedClasses['select-table_top']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['list-content']} */ ;
/** @type {__VLS_StyleScopedClasses['model']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['more']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['no-result']} */ ;
/** @type {__VLS_StyleScopedClasses['info-table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-name']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['line']} */ ;
/** @type {__VLS_StyleScopedClasses['notes']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-or-schema']} */ ;
/** @type {__VLS_StyleScopedClasses['user-status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-button']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
// @ts-ignore
var __VLS_120 = __VLS_119, __VLS_236 = __VLS_235, __VLS_254 = __VLS_253;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_add_outlined: icon_add_outlined,
            arrow_down: arrow_down,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            EmptyBackground: EmptyBackground,
            icon_form_outlined: icon_form_outlined,
            assigned: assigned,
            AuthorizedWorkspaceDialog: AuthorizedWorkspaceDialog,
            rename: rename,
            icon_member: icon_member,
            SuccessFilled: SuccessFilled,
            CircleCloseFilled: CircleCloseFilled,
            delIcon: delIcon,
            icon_more_outlined: icon_more_outlined,
            icon_done_outlined: icon_done_outlined,
            t: t,
            multipleSelectionAll: multipleSelectionAll,
            keyword: keyword,
            keywordsMember: keywordsMember,
            oldKeywordsMember: oldKeywordsMember,
            workspaceFormRef: workspaceFormRef,
            authorizedWorkspaceDialog: authorizedWorkspaceDialog,
            tableListWithSearch: tableListWithSearch,
            workspaceForm: workspaceForm,
            userTypeList: userTypeList,
            handleUserTypeChange: handleUserTypeChange,
            rules: rules,
            fieldListWithSearch: fieldListWithSearch,
            currentTable: currentTable,
            fieldDialog: fieldDialog,
            multipleTableRef: multipleTableRef,
            isIndeterminate: isIndeterminate,
            checkAll: checkAll,
            pageInfo: pageInfo,
            clickTable: clickTable,
            cancelDelete: cancelDelete,
            deleteBatchUser: deleteBatchUser,
            deleteHandler: deleteHandler,
            handleSelectionChange: handleSelectionChange,
            handleCheckAllChange: handleCheckAllChange,
            handleAddMember: handleAddMember,
            refresh: refresh,
            search: search,
            closeField: closeField,
            saveField: saveField,
            delWorkspace: delWorkspace,
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
