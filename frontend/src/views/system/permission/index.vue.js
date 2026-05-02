import { ref, computed, reactive, provide, nextTick } from 'vue';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import IconOpeEdit from '@/assets/svg/icon_edit_outlined.svg';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import icon_close_outlined from '@/assets/svg/operate/ope-close.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import icon_down_outlined from '@/assets/svg/icon_down_outlined.svg';
import ICON_TABLE from '@/assets/svg/chart/icon_form_outlined.svg';
import Card from './Card.vue';
import { dsTypeWithImg } from '@/views/ds/js/ds-type';
import SelectPermission from './SelectPermission.vue';
import AuthTree from './auth-tree/RowAuth.vue';
import { getList, savePermissions, delPermissions } from '@/api/permissions';
import { datasourceApi } from '@/api/datasource';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash-es';
const { t } = useI18n();
const keywords = ref('');
const activeStep = ref(0);
const dialogFormVisible = ref(false);
const ruleConfigvVisible = ref(false);
const editRule = ref(0);
const termFormRef = ref();
const columnFormRef = ref();
const drawerTitle = ref('');
const dialogTitle = ref('');
const activeDs = ref(null);
const activeTable = ref(null);
const ruleList = ref([]);
const defaultPermission = {
    id: '',
    name: '',
    permissions: [],
    users: [],
};
const currentPermission = reactive(cloneDeep(defaultPermission));
const searchColumn = ref('');
const isCreate = ref(false);
const defaultForm = {
    name: '',
    id: '',
    table_id: '',
    type: 'row',
    ds_id: '',
    table_name: '',
    ds_name: '',
    permissions: [],
    expression_tree: {},
};
const columnForm = reactive(cloneDeep(defaultForm));
const selectPermissionRef = ref();
const tableListOptions = ref([]);
const fieldListOptions = ref([]);
const dsListOptions = ref([]);
const ruleListWithSearch = computed(() => {
    if (!keywords.value)
        return ruleList.value;
    return ruleList.value.filter((ele) => ele.name.toLowerCase().includes(keywords.value.toLowerCase()));
});
const tableColumnData = computed(() => {
    if (!searchColumn.value)
        return columnForm.permissions;
    return columnForm.permissions.filter((ele) => ele.field_name.toLowerCase().includes(searchColumn.value.toLowerCase()));
});
provide('filedList', fieldListOptions);
const setDrawerTitle = () => {
    if (activeStep.value === 0 && isCreate.value) {
        drawerTitle.value = t('permission.add_rule_group');
    }
    else {
        if (editRule.value === 1) {
            drawerTitle.value = t('permission.set_permission_rule');
        }
        if (editRule.value === 2) {
            drawerTitle.value = t('permission.select_restricted_user');
        }
    }
};
const userTypeList = [
    {
        name: t('permission.row_permission'),
        value: 1,
    },
    {
        name: t('permission.column_permission'),
        value: 0,
    },
];
const ruleType = ref(0);
const handleAddPermission = (val) => {
    ruleType.value = val;
    Object.assign(columnForm, cloneDeep(defaultForm));
    if (val === 1) {
        handleRowPermission(null);
    }
    else {
        handleColumnPermission(null);
    }
};
const saveAuthTree = (val) => {
    if (val.errorMessage) {
        ElMessage.error(val.errorMessage);
        return;
    }
    delete val.errorMessage;
    columnForm.expression_tree = cloneDeep(val);
    const { expression_tree, table_id, ds_id, type, name, ds_name, table_name } = columnForm;
    if (columnForm.id) {
        for (const key in currentPermission.permissions) {
            if (currentPermission.permissions[key].id === columnForm.id) {
                Object.assign(currentPermission.permissions[key], cloneDeep({
                    expression_tree,
                    tree: expression_tree,
                    table_id,
                    ds_id,
                    type,
                    name,
                    ds_name,
                    table_name,
                }));
            }
        }
    }
    else {
        currentPermission.permissions.push(cloneDeep({
            expression_tree,
            tree: expression_tree,
            table_id,
            ds_id,
            type,
            name,
            ds_name,
            table_name,
            id: +new Date(),
        }));
    }
    dialogFormVisible.value = false;
};
const getDsList = (row) => {
    activeDs.value = null;
    activeTable.value = null;
    datasourceApi
        .list()
        .then((res) => {
        dsListOptions.value = res || [];
        if (!row?.ds_id)
            return;
        dsListOptions.value.forEach((ele) => {
            if (+ele.id === +row.ds_id) {
                activeDs.value = ele;
            }
        });
    })
        .finally(() => {
        if (!row && columnForm.type === 'row') {
            authTreeRef.value.init(columnForm.expression_tree);
        }
    });
    if (row) {
        handleDsIdChange({ id: row.ds_id, name: row.ds_name });
        handleEditeTable(row.table_id);
    }
};
const handleRowPermission = (row) => {
    columnForm.type = 'row';
    getDsList(row);
    if (row) {
        const { name, ds_id, table_id, tree, id, ds_name, table_name } = row;
        Object.assign(columnForm, {
            id,
            name,
            ds_id,
            table_id,
            ds_name,
            table_name,
            expression_tree: typeof tree === 'object' ? tree : JSON.parse(tree),
        });
    }
    dialogFormVisible.value = true;
    dialogTitle.value = row?.id
        ? t('permission.edit_row_permission')
        : t('permission.add_row_permission');
};
const handleColumnPermission = (row) => {
    columnForm.type = 'column';
    getDsList(row);
    if (row) {
        const { name, ds_id, table_id, id, permission_list, ds_name, table_name } = row;
        Object.assign(columnForm, {
            id,
            name,
            ds_id,
            ds_name,
            table_id,
            table_name,
            permissions: permission_list,
        });
    }
    dialogFormVisible.value = true;
    dialogTitle.value = row?.id
        ? t('permission.edit_column_permission')
        : t('permission.add_column_permission');
};
const icon = (item) => {
    return (dsTypeWithImg.find((ele) => item.type === ele.type) || {}).img;
};
let time;
const handleInitDsIdChange = (val) => {
    columnForm.ds_id = val.id;
    columnForm.ds_name = val.name;
    time = setTimeout(() => {
        clearTimeout(time);
        columnFormRef.value.clearValidate('table_id');
    }, 0);
    datasourceApi.tableList(val.id).then((res) => {
        tableListOptions.value = res || [];
        activeTable.value = null;
        fieldListOptions.value = [];
        columnForm.permissions = [];
        if (authTreeRef.value) {
            authTreeRef.value.init({});
        }
    });
};
const handleDsIdChange = (val) => {
    columnForm.ds_id = val.id;
    columnForm.ds_name = val.name;
    datasourceApi.tableList(val.id).then((res) => {
        tableListOptions.value = res || [];
        if (!columnForm.table_id)
            return;
        tableListOptions.value.forEach((ele) => {
            if (+ele.id === +columnForm.table_id) {
                activeTable.value = ele;
            }
        });
    });
};
const handleTableIdChange = (val) => {
    columnForm.table_id = val.id;
    columnForm.table_name = val.table_name;
    datasourceApi.fieldList(val.id).then((res) => {
        fieldListOptions.value = res || [];
        if (columnForm.type === 'row')
            return;
        columnForm.permissions = fieldListOptions.value.map((ele) => {
            const { id, field_name, field_comment } = ele;
            return { field_id: id, field_name, field_comment, enable: true };
        });
    });
};
const handleEditeTable = (val) => {
    datasourceApi
        .fieldList(val)
        .then((res) => {
        fieldListOptions.value = res || [];
        if (columnForm.type === 'row')
            return;
        const enableMap = columnForm.permissions.reduce((pre, next) => {
            pre[next.field_id] = next.enable;
            return pre;
        }, {});
        columnForm.permissions = fieldListOptions.value.map((ele) => {
            const { id, field_name, field_comment } = ele;
            return { field_id: id, field_name, field_comment, enable: enableMap[id] ?? false };
        });
    })
        .finally(() => {
        if (columnForm.type !== 'row')
            return;
        authTreeRef.value.init(columnForm.expression_tree);
    });
};
const beforeClose = () => {
    if (termFormRef.value) {
        termFormRef.value.clearValidate();
    }
    ruleConfigvVisible.value = false;
    activeStep.value = 0;
    isCreate.value = false;
};
const searchLoading = ref(false);
const handleSearch = () => {
    searchLoading.value = true;
    getList()
        .then((res) => {
        ruleList.value = res || [];
    })
        .finally(() => {
        searchLoading.value = false;
    });
};
handleSearch();
const addHandler = () => {
    editRule.value = 0;
    setDrawerTitle();
    isCreate.value = true;
    Object.assign(currentPermission, cloneDeep(defaultPermission));
    ruleConfigvVisible.value = true;
};
const editForm = (row) => {
    if (row.type === 'row') {
        ruleType.value = 1;
        handleRowPermission(row);
    }
    else {
        ruleType.value = 0;
        handleColumnPermission(row);
    }
};
const handleEditRule = (row) => {
    editRule.value = 1;
    isCreate.value = false;
    setDrawerTitle();
    Object.assign(currentPermission, cloneDeep(row));
    ruleConfigvVisible.value = true;
};
const deleteRuleHandler = (row) => {
    ElMessageBox.confirm(t('permission.rule_rule_1', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        currentPermission.permissions = currentPermission.permissions.filter((ele) => ele.id !== row.id);
    });
};
const deleteHandler = (row) => {
    ElMessageBox.confirm(t('permission.rule_group_1', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        delPermissions(row.id).then(() => {
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
            });
            handleSearch();
        });
    });
};
const setUser = (row) => {
    editRule.value = 2;
    setDrawerTitle();
    isCreate.value = false;
    Object.assign(currentPermission, cloneDeep(row));
    activeStep.value = 1;
    ruleConfigvVisible.value = true;
    nextTick(() => {
        selectPermissionRef.value.open(row.users);
    });
};
const rules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('permission.rule_group_name'),
            trigger: 'blur',
        },
    ],
};
const closeForm = () => {
    dialogFormVisible.value = false;
};
const authTreeRef = ref();
const saveHandler = () => {
    columnFormRef.value.validate((res) => {
        const names = currentPermission.permissions
            .filter((ele) => ele.id !== columnForm.id)
            .map((ele) => ele.name);
        if (names.includes(columnForm.name)) {
            ElMessage.error(t('embedded.duplicate_name'));
            return;
        }
        if (res) {
            if (columnForm.type === 'row') {
                authTreeRef.value.submit();
            }
            else {
                const { permissions, table_id, ds_id, type, name, ds_name, table_name } = columnForm;
                if (columnForm.id) {
                    for (const key in currentPermission.permissions) {
                        if (currentPermission.permissions[key].id === columnForm.id) {
                            Object.assign(currentPermission.permissions[key], cloneDeep({
                                permissions,
                                permission_list: permissions,
                                table_id,
                                ds_id,
                                type,
                                name,
                                ds_name,
                                table_name,
                            }));
                        }
                    }
                }
                else {
                    currentPermission.permissions.push(cloneDeep({
                        permissions,
                        permission_list: permissions,
                        table_id,
                        ds_id,
                        type,
                        name,
                        ds_name,
                        table_name,
                        id: +new Date(),
                    }));
                }
                dialogFormVisible.value = false;
            }
        }
    });
};
const preview = () => {
    currentPermission.user = selectPermissionRef.value.checkTableList.map((ele) => ele.id);
    activeStep.value = 0;
};
const next = () => {
    termFormRef.value.validate((res) => {
        if (res) {
            activeStep.value = 1;
            nextTick(() => {
                selectPermissionRef.value.open(currentPermission.users);
            });
        }
    });
};
const saveLoading = ref(false);
const save = () => {
    const { id, name, permissions, users } = cloneDeep(currentPermission);
    const permissionsObj = permissions.map((ele) => {
        return {
            ...cloneDeep(ele),
            permissions: ele.type !== 'row'
                ? typeof ele.permissions === 'object'
                    ? JSON.stringify(ele.permissions || [])
                    : ele.permissions
                : JSON.stringify([]),
            permission_list: [],
            expression_tree: ele.type === 'row'
                ? typeof ele.expression_tree === 'object'
                    ? JSON.stringify(ele.expression_tree || {})
                    : ele.expression_tree
                : JSON.stringify({}),
        };
    });
    const obj = {
        id,
        name,
        permissions: permissionsObj,
        users: isCreate.value || activeStep.value === 1
            ? selectPermissionRef.value.checkTableList.map((ele) => ele.id)
            : users,
    };
    if (!id) {
        delete obj.id;
    }
    if (saveLoading.value)
        return;
    saveLoading.value = true;
    savePermissions(obj)
        .then(() => {
        ElMessage({
            type: 'success',
            message: t('common.save_success'),
        });
        beforeClose();
        handleSearch();
    })
        .finally(() => {
        saveLoading.value = false;
    });
};
const savePermission = () => {
    if (!isCreate.value && activeStep.value === 0) {
        termFormRef.value.validate((res) => {
            if (res) {
                save();
            }
        });
        return;
    }
    save();
};
const columnRules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('permission.rule_name'),
            trigger: 'blur',
        },
    ],
    table_id: [
        {
            required: true,
            message: t('datasource.Please_select') + t('common.empty') + t('permission.data_table'),
            trigger: 'change',
        },
    ],
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "permission no-padding" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.searchLoading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('workspace.permission_configuration'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('permission.search_rule_group')),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('permission.search_rule_group')),
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
    const __VLS_8 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
}
var __VLS_3;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (...[$event]) => {
        __VLS_ctx.addHandler();
    }
};
__VLS_15.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_15.slots;
    const __VLS_20 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
(__VLS_ctx.$t('permission.add_rule_group'));
var __VLS_15;
if (!!__VLS_ctx.keywords && !__VLS_ctx.ruleListWithSearch.length) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
    }));
    const __VLS_25 = __VLS_24({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    const __VLS_27 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        gutter: (16),
        ...{ class: "w-full" },
    }));
    const __VLS_29 = __VLS_28({
        gutter: (16),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_30.slots.default;
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.ruleListWithSearch))) {
        const __VLS_31 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }));
        const __VLS_33 = __VLS_32({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        __VLS_34.slots.default;
        /** @type {[typeof Card, typeof Card, ]} */ ;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(Card, new Card({
            ...{ 'onEdit': {} },
            ...{ 'onDel': {} },
            ...{ 'onSetUser': {} },
            id: (ele.id),
            key: (ele.id),
            name: (ele.name),
            type: (ele.users.length),
            num: (ele.permissions.length),
        }));
        const __VLS_36 = __VLS_35({
            ...{ 'onEdit': {} },
            ...{ 'onDel': {} },
            ...{ 'onSetUser': {} },
            id: (ele.id),
            key: (ele.id),
            name: (ele.name),
            type: (ele.users.length),
            num: (ele.permissions.length),
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        let __VLS_38;
        let __VLS_39;
        let __VLS_40;
        const __VLS_41 = {
            onEdit: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.ruleListWithSearch.length))
                    return;
                __VLS_ctx.handleEditRule(ele);
            }
        };
        const __VLS_42 = {
            onDel: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.ruleListWithSearch.length))
                    return;
                __VLS_ctx.deleteHandler(ele);
            }
        };
        const __VLS_43 = {
            onSetUser: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.ruleListWithSearch.length))
                    return;
                __VLS_ctx.setUser(ele);
            }
        };
        var __VLS_37;
        var __VLS_34;
    }
    var __VLS_30;
}
if (!__VLS_ctx.keywords && !__VLS_ctx.ruleListWithSearch.length && !__VLS_ctx.searchLoading) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        ...{ class: "ed-empty_200" },
        description: (__VLS_ctx.$t('permission.no_permission_rule')),
        imgType: "noneWhite",
    }));
    const __VLS_45 = __VLS_44({
        ...{ class: "ed-empty_200" },
        description: (__VLS_ctx.$t('permission.no_permission_rule')),
        imgType: "noneWhite",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_47 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_49 = __VLS_48({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_51;
    let __VLS_52;
    let __VLS_53;
    const __VLS_54 = {
        onClick: (...[$event]) => {
            if (!(!__VLS_ctx.keywords && !__VLS_ctx.ruleListWithSearch.length && !__VLS_ctx.searchLoading))
                return;
            __VLS_ctx.addHandler();
        }
    };
    __VLS_50.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_50.slots;
        const __VLS_55 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({}));
        const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
    }
    (__VLS_ctx.$t('permission.add_rule_group'));
    var __VLS_50;
}
const __VLS_59 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    modelValue: (__VLS_ctx.ruleConfigvVisible),
    closeOnClickModal: (false),
    size: "calc(100% - 100px)",
    modalClass: "permission-drawer-fullscreen",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}));
const __VLS_61 = __VLS_60({
    modelValue: (__VLS_ctx.ruleConfigvVisible),
    closeOnClickModal: (false),
    size: "calc(100% - 100px)",
    modalClass: "permission-drawer-fullscreen",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_62.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_62.slots;
    const [{ close }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.drawerTitle);
    if (__VLS_ctx.isCreate) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flex-center" },
            ...{ style: {} },
        });
        const __VLS_63 = {}.ElSteps;
        /** @type {[typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, ]} */ ;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
            custom: true,
            ...{ style: {} },
            active: (__VLS_ctx.activeStep),
            alignCenter: true,
        }));
        const __VLS_65 = __VLS_64({
            custom: true,
            ...{ style: {} },
            active: (__VLS_ctx.activeStep),
            alignCenter: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        __VLS_66.slots.default;
        const __VLS_67 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({}));
        const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
        __VLS_70.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_70.slots;
            (__VLS_ctx.$t('permission.set_permission_rule'));
        }
        var __VLS_70;
        const __VLS_71 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({}));
        const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
        __VLS_74.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_74.slots;
            (__VLS_ctx.$t('permission.select_restricted_user'));
        }
        var __VLS_74;
        var __VLS_66;
    }
    const __VLS_75 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        ...{ 'onClick': {} },
        ...{ class: "ed-dialog__headerbtn mrt" },
        ...{ style: {} },
    }));
    const __VLS_77 = __VLS_76({
        ...{ 'onClick': {} },
        ...{ class: "ed-dialog__headerbtn mrt" },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    let __VLS_79;
    let __VLS_80;
    let __VLS_81;
    const __VLS_82 = {
        onClick: (close)
    };
    __VLS_78.slots.default;
    const __VLS_83 = {}.icon_close_outlined;
    /** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({}));
    const __VLS_85 = __VLS_84({}, ...__VLS_functionalComponentArgsRest(__VLS_84));
    var __VLS_78;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeStep === 0) }, null, null);
const __VLS_87 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({}));
const __VLS_89 = __VLS_88({}, ...__VLS_functionalComponentArgsRest(__VLS_88));
__VLS_90.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scroll-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
(__VLS_ctx.$t('ds.form.base_info'));
const __VLS_91 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.currentPermission),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}));
const __VLS_93 = __VLS_92({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.currentPermission),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
let __VLS_95;
let __VLS_96;
let __VLS_97;
const __VLS_98 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.termFormRef} */ ;
var __VLS_99 = {};
__VLS_94.slots.default;
const __VLS_101 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    prop: "name",
    label: (__VLS_ctx.t('permission.rule_group_name')),
}));
const __VLS_103 = __VLS_102({
    prop: "name",
    label: (__VLS_ctx.t('permission.rule_group_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
__VLS_104.slots.default;
const __VLS_105 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    modelValue: (__VLS_ctx.currentPermission.name),
    maxlength: "50",
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('permission.rule_group_name')),
    autocomplete: "off",
}));
const __VLS_107 = __VLS_106({
    modelValue: (__VLS_ctx.currentPermission.name),
    maxlength: "50",
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('permission.rule_group_name')),
    autocomplete: "off",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
var __VLS_104;
const __VLS_109 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    ...{ class: "add-permission_form" },
}));
const __VLS_111 = __VLS_110({
    ...{ class: "add-permission_form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
__VLS_112.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_112.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    (__VLS_ctx.t('permission.permission_rule'));
    const __VLS_113 = {}.ElPopover;
    /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        popperClass: "system-permission_user",
        placement: "bottom",
    }));
    const __VLS_115 = __VLS_114({
        popperClass: "system-permission_user",
        placement: "bottom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    __VLS_116.slots.default;
    {
        const { reference: __VLS_thisSlot } = __VLS_116.slots;
        const __VLS_117 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
            ...{ class: "add-btn" },
            type: "primary",
        }));
        const __VLS_119 = __VLS_118({
            ...{ class: "add-btn" },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        __VLS_120.slots.default;
        (__VLS_ctx.$t('model.add'));
        const __VLS_121 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
            ...{ style: {} },
            size: "16",
        }));
        const __VLS_123 = __VLS_122({
            ...{ style: {} },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_122));
        __VLS_124.slots.default;
        const __VLS_125 = {}.icon_down_outlined;
        /** @type {[typeof __VLS_components.Icon_down_outlined, typeof __VLS_components.icon_down_outlined, typeof __VLS_components.Icon_down_outlined, typeof __VLS_components.icon_down_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({}));
        const __VLS_127 = __VLS_126({}, ...__VLS_functionalComponentArgsRest(__VLS_126));
        var __VLS_124;
        var __VLS_120;
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
                    __VLS_ctx.handleAddPermission(ele.value);
                } },
            key: (ele.name),
            ...{ class: "popover-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "model-name" },
        });
        (ele.name);
    }
    var __VLS_116;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-content" },
    ...{ class: (!__VLS_ctx.currentPermission.permissions.length && 'border-bottom') },
});
const __VLS_129 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    emptyText: (__VLS_ctx.$t('permission.no_rule')),
    data: (__VLS_ctx.currentPermission.permissions),
    ...{ style: {} },
}));
const __VLS_131 = __VLS_130({
    emptyText: (__VLS_ctx.$t('permission.no_rule')),
    data: (__VLS_ctx.currentPermission.permissions),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
const __VLS_133 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    prop: "name",
    label: (__VLS_ctx.$t('permission.rule_name')),
}));
const __VLS_135 = __VLS_134({
    prop: "name",
    label: (__VLS_ctx.$t('permission.rule_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
const __VLS_137 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    prop: "type",
    label: (__VLS_ctx.$t('permission.type')),
}));
const __VLS_139 = __VLS_138({
    prop: "type",
    label: (__VLS_ctx.$t('permission.type')),
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_140.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (scope.row.type === 'row'
        ? __VLS_ctx.$t('permission.row_permission')
        : __VLS_ctx.$t('permission.column_permission'));
}
var __VLS_140;
const __VLS_141 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    prop: "ds_name",
    label: (__VLS_ctx.$t('permission.data_source')),
}));
const __VLS_143 = __VLS_142({
    prop: "ds_name",
    label: (__VLS_ctx.$t('permission.data_source')),
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
const __VLS_145 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    prop: "table_name",
    label: (__VLS_ctx.$t('permission.data_table')),
}));
const __VLS_147 = __VLS_146({
    prop: "table_name",
    label: (__VLS_ctx.$t('permission.data_table')),
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
const __VLS_149 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    className: "actions-methods",
    fixed: "right",
    width: "80",
    label: (__VLS_ctx.$t('ds.actions')),
}));
const __VLS_151 = __VLS_150({
    className: "actions-methods",
    fixed: "right",
    width: "80",
    label: (__VLS_ctx.$t('ds.actions')),
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_152.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_153 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('datasource.edit')),
        placement: "top",
    }));
    const __VLS_155 = __VLS_154({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('datasource.edit')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_154));
    __VLS_156.slots.default;
    const __VLS_157 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }));
    const __VLS_159 = __VLS_158({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    let __VLS_161;
    let __VLS_162;
    let __VLS_163;
    const __VLS_164 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editForm(scope.row);
        }
    };
    __VLS_160.slots.default;
    const __VLS_165 = {}.IconOpeEdit;
    /** @type {[typeof __VLS_components.IconOpeEdit, typeof __VLS_components.IconOpeEdit, ]} */ ;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({}));
    const __VLS_167 = __VLS_166({}, ...__VLS_functionalComponentArgsRest(__VLS_166));
    var __VLS_160;
    var __VLS_156;
    const __VLS_169 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('dashboard.delete')),
        placement: "top",
    }));
    const __VLS_171 = __VLS_170({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('dashboard.delete')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    __VLS_172.slots.default;
    const __VLS_173 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }));
    const __VLS_175 = __VLS_174({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    let __VLS_177;
    let __VLS_178;
    let __VLS_179;
    const __VLS_180 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteRuleHandler(scope.row);
        }
    };
    __VLS_176.slots.default;
    const __VLS_181 = {}.IconOpeDelete;
    /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({}));
    const __VLS_183 = __VLS_182({}, ...__VLS_functionalComponentArgsRest(__VLS_182));
    var __VLS_176;
    var __VLS_172;
}
var __VLS_152;
var __VLS_132;
var __VLS_112;
var __VLS_94;
var __VLS_90;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-permission_content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeStep !== 0) }, null, null);
const __VLS_185 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({}));
const __VLS_187 = __VLS_186({}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_188.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scroll-content" },
});
/** @type {[typeof SelectPermission, typeof SelectPermission, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(SelectPermission, new SelectPermission({
    ref: "selectPermissionRef",
}));
const __VLS_190 = __VLS_189({
    ref: "selectPermissionRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
/** @type {typeof __VLS_ctx.selectPermissionRef} */ ;
var __VLS_192 = {};
var __VLS_191;
var __VLS_188;
{
    const { footer: __VLS_thisSlot } = __VLS_62.slots;
    const __VLS_194 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_196 = __VLS_195({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    let __VLS_198;
    let __VLS_199;
    let __VLS_200;
    const __VLS_201 = {
        onClick: (__VLS_ctx.beforeClose)
    };
    __VLS_197.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_197;
    if (__VLS_ctx.activeStep === 1 && __VLS_ctx.isCreate) {
        const __VLS_202 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
            ...{ 'onClick': {} },
            secondary: true,
        }));
        const __VLS_204 = __VLS_203({
            ...{ 'onClick': {} },
            secondary: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_203));
        let __VLS_206;
        let __VLS_207;
        let __VLS_208;
        const __VLS_209 = {
            onClick: (__VLS_ctx.preview)
        };
        __VLS_205.slots.default;
        (__VLS_ctx.t('ds.previous'));
        var __VLS_205;
    }
    if (__VLS_ctx.activeStep === 0 && __VLS_ctx.isCreate) {
        const __VLS_210 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_212 = __VLS_211({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_211));
        let __VLS_214;
        let __VLS_215;
        let __VLS_216;
        const __VLS_217 = {
            onClick: (__VLS_ctx.next)
        };
        __VLS_213.slots.default;
        (__VLS_ctx.t('common.next'));
        var __VLS_213;
    }
    if ((__VLS_ctx.isCreate && __VLS_ctx.activeStep === 1) || !__VLS_ctx.isCreate) {
        const __VLS_218 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_220 = __VLS_219({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_219));
        let __VLS_222;
        let __VLS_223;
        let __VLS_224;
        const __VLS_225 = {
            onClick: (__VLS_ctx.savePermission)
        };
        __VLS_221.slots.default;
        (__VLS_ctx.$t('common.save'));
        var __VLS_221;
    }
}
var __VLS_62;
const __VLS_226 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "896px",
    modalClass: "column-form_drawer",
    beforeClose: (__VLS_ctx.closeForm),
}));
const __VLS_228 = __VLS_227({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "896px",
    modalClass: "column-form_drawer",
    beforeClose: (__VLS_ctx.closeForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_227));
__VLS_229.slots.default;
const __VLS_230 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
    ...{ 'onSubmit': {} },
    ref: "columnFormRef",
    model: (__VLS_ctx.columnForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.columnRules),
    ...{ class: "form-content_error" },
}));
const __VLS_232 = __VLS_231({
    ...{ 'onSubmit': {} },
    ref: "columnFormRef",
    model: (__VLS_ctx.columnForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.columnRules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_231));
let __VLS_234;
let __VLS_235;
let __VLS_236;
const __VLS_237 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.columnFormRef} */ ;
var __VLS_238 = {};
__VLS_233.slots.default;
const __VLS_240 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    prop: "name",
    label: (__VLS_ctx.t('permission.rule_name')),
}));
const __VLS_242 = __VLS_241({
    prop: "name",
    label: (__VLS_ctx.t('permission.rule_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
const __VLS_244 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.columnForm.name),
    maxlength: "50",
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('permission.rule_name')),
    autocomplete: "off",
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.columnForm.name),
    maxlength: "50",
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('permission.rule_name')),
    autocomplete: "off",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
var __VLS_243;
const __VLS_248 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    prop: "table_id",
    label: (__VLS_ctx.t('permission.data_table')),
}));
const __VLS_250 = __VLS_249({
    prop: "table_id",
    label: (__VLS_ctx.t('permission.data_table')),
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.activeDs),
    filterable: true,
    ...{ style: {} },
    valueKey: "id",
    placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('permission.data_source')),
}));
const __VLS_254 = __VLS_253({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.activeDs),
    filterable: true,
    ...{ style: {} },
    valueKey: "id",
    placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('permission.data_source')),
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
let __VLS_256;
let __VLS_257;
let __VLS_258;
const __VLS_259 = {
    onChange: (__VLS_ctx.handleInitDsIdChange)
};
__VLS_255.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.dsListOptions))) {
    const __VLS_260 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
        key: (item.id),
        label: (item.name),
        value: (item),
    }));
    const __VLS_262 = __VLS_261({
        key: (item.id),
        label: (item.name),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_261));
    __VLS_263.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.icon(item)),
        width: "24",
        height: "24",
        ...{ style: {} },
    });
    (item.name);
    var __VLS_263;
}
var __VLS_255;
const __VLS_264 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.activeTable),
    filterable: true,
    ...{ style: {} },
    disabled: (!__VLS_ctx.columnForm.ds_id),
    valueKey: "id",
    placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('permission.data_table')),
}));
const __VLS_266 = __VLS_265({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.activeTable),
    filterable: true,
    ...{ style: {} },
    disabled: (!__VLS_ctx.columnForm.ds_id),
    valueKey: "id",
    placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('permission.data_table')),
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
let __VLS_268;
let __VLS_269;
let __VLS_270;
const __VLS_271 = {
    onChange: (__VLS_ctx.handleTableIdChange)
};
__VLS_267.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableListOptions))) {
    const __VLS_272 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        key: (item.id),
        label: (item.table_name),
        value: (item),
    }));
    const __VLS_274 = __VLS_273({
        key: (item.id),
        label: (item.table_name),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    __VLS_275.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_276 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
        size: "16",
        ...{ style: {} },
    }));
    const __VLS_278 = __VLS_277({
        size: "16",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
    __VLS_279.slots.default;
    const __VLS_280 = {}.ICON_TABLE;
    /** @type {[typeof __VLS_components.ICON_TABLE, ]} */ ;
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({}));
    const __VLS_282 = __VLS_281({}, ...__VLS_functionalComponentArgsRest(__VLS_281));
    var __VLS_279;
    (item.table_name);
    var __VLS_275;
}
var __VLS_267;
var __VLS_251;
const __VLS_284 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    label: (__VLS_ctx.$t('permission.set_rule')),
}));
const __VLS_286 = __VLS_285({
    label: (__VLS_ctx.$t('permission.set_rule')),
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
if (__VLS_ctx.ruleType !== 1) {
    const __VLS_288 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
        modelValue: (__VLS_ctx.searchColumn),
        placeholder: (__VLS_ctx.$t('permission.search_rule_group')),
        autocomplete: "off",
        clearable: true,
    }));
    const __VLS_290 = __VLS_289({
        modelValue: (__VLS_ctx.searchColumn),
        placeholder: (__VLS_ctx.$t('permission.search_rule_group')),
        autocomplete: "off",
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    __VLS_291.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_291.slots;
        const __VLS_292 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({}));
        const __VLS_294 = __VLS_293({}, ...__VLS_functionalComponentArgsRest(__VLS_293));
        __VLS_295.slots.default;
        const __VLS_296 = {}.icon_searchOutline_outlined;
        /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({}));
        const __VLS_298 = __VLS_297({}, ...__VLS_functionalComponentArgsRest(__VLS_297));
        var __VLS_295;
    }
    var __VLS_291;
}
var __VLS_287;
var __VLS_233;
if (__VLS_ctx.ruleType === 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "auth-tree_content" },
    });
    /** @type {[typeof AuthTree, typeof AuthTree, ]} */ ;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent(AuthTree, new AuthTree({
        ...{ 'onSave': {} },
        ref: "authTreeRef",
    }));
    const __VLS_301 = __VLS_300({
        ...{ 'onSave': {} },
        ref: "authTreeRef",
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    let __VLS_303;
    let __VLS_304;
    let __VLS_305;
    const __VLS_306 = {
        onSave: (__VLS_ctx.saveAuthTree)
    };
    /** @type {typeof __VLS_ctx.authTreeRef} */ ;
    var __VLS_307 = {};
    var __VLS_302;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
    });
    const __VLS_309 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
        emptyText: (__VLS_ctx.$t('permission.no_fields_yet')),
        data: (__VLS_ctx.tableColumnData),
        ...{ style: {} },
    }));
    const __VLS_311 = __VLS_310({
        emptyText: (__VLS_ctx.$t('permission.no_fields_yet')),
        data: (__VLS_ctx.tableColumnData),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_310));
    __VLS_312.slots.default;
    const __VLS_313 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({
        prop: "field_name",
        label: (__VLS_ctx.$t('datasource.field_name')),
    }));
    const __VLS_315 = __VLS_314({
        prop: "field_name",
        label: (__VLS_ctx.$t('datasource.field_name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_314));
    const __VLS_317 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
        prop: "field_comment",
        label: (__VLS_ctx.$t('datasource.field_notes')),
    }));
    const __VLS_319 = __VLS_318({
        prop: "field_comment",
        label: (__VLS_ctx.$t('datasource.field_notes')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_318));
    const __VLS_321 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_322 = __VLS_asFunctionalComponent(__VLS_321, new __VLS_321({
        fixed: "right",
        width: "150",
        label: (__VLS_ctx.$t('ds.actions')),
    }));
    const __VLS_323 = __VLS_322({
        fixed: "right",
        width: "150",
        label: (__VLS_ctx.$t('ds.actions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_322));
    __VLS_324.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_324.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_325 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
            modelValue: (scope.row.enable),
            size: "small",
        }));
        const __VLS_327 = __VLS_326({
            modelValue: (scope.row.enable),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_326));
    }
    var __VLS_324;
    var __VLS_312;
}
{
    const { footer: __VLS_thisSlot } = __VLS_229.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_329 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_331 = __VLS_330({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_330));
    let __VLS_333;
    let __VLS_334;
    let __VLS_335;
    const __VLS_336 = {
        onClick: (__VLS_ctx.closeForm)
    };
    __VLS_332.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_332;
    const __VLS_337 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_339 = __VLS_338({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_338));
    let __VLS_341;
    let __VLS_342;
    let __VLS_343;
    const __VLS_344 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_340.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_340;
}
var __VLS_229;
/** @type {__VLS_StyleScopedClasses['permission']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-16']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-empty_200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-center']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-dialog__headerbtn']} */ ;
/** @type {__VLS_StyleScopedClasses['mrt']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['add-permission_form']} */ ;
/** @type {__VLS_StyleScopedClasses['add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['select-permission_content']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-content']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tree_content']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_100 = __VLS_99, __VLS_193 = __VLS_192, __VLS_239 = __VLS_238, __VLS_308 = __VLS_307;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            icon_add_outlined: icon_add_outlined,
            IconOpeEdit: IconOpeEdit,
            IconOpeDelete: IconOpeDelete,
            icon_close_outlined: icon_close_outlined,
            EmptyBackground: EmptyBackground,
            icon_down_outlined: icon_down_outlined,
            ICON_TABLE: ICON_TABLE,
            Card: Card,
            SelectPermission: SelectPermission,
            AuthTree: AuthTree,
            t: t,
            keywords: keywords,
            activeStep: activeStep,
            dialogFormVisible: dialogFormVisible,
            ruleConfigvVisible: ruleConfigvVisible,
            termFormRef: termFormRef,
            columnFormRef: columnFormRef,
            drawerTitle: drawerTitle,
            dialogTitle: dialogTitle,
            activeDs: activeDs,
            activeTable: activeTable,
            currentPermission: currentPermission,
            searchColumn: searchColumn,
            isCreate: isCreate,
            columnForm: columnForm,
            selectPermissionRef: selectPermissionRef,
            tableListOptions: tableListOptions,
            dsListOptions: dsListOptions,
            ruleListWithSearch: ruleListWithSearch,
            tableColumnData: tableColumnData,
            userTypeList: userTypeList,
            ruleType: ruleType,
            handleAddPermission: handleAddPermission,
            saveAuthTree: saveAuthTree,
            icon: icon,
            handleInitDsIdChange: handleInitDsIdChange,
            handleTableIdChange: handleTableIdChange,
            beforeClose: beforeClose,
            searchLoading: searchLoading,
            addHandler: addHandler,
            editForm: editForm,
            handleEditRule: handleEditRule,
            deleteRuleHandler: deleteRuleHandler,
            deleteHandler: deleteHandler,
            setUser: setUser,
            rules: rules,
            closeForm: closeForm,
            authTreeRef: authTreeRef,
            saveHandler: saveHandler,
            preview: preview,
            next: next,
            savePermission: savePermission,
            columnRules: columnRules,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
