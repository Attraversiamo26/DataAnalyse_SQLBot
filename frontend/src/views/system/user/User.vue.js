import { ref, unref, reactive, onMounted, nextTick, h, shallowRef } from 'vue';
import UserImport from './UserImport.vue';
import SuccessFilled from '@/assets/svg/gou_icon.svg';
import icon_replace_outlined from '@/assets/svg/icon_replace_outlined.svg';
import CircleCloseFilled from '@/assets/svg/icon_ban_filled.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import { useI18n } from 'vue-i18n';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import { convertFilterText, FilterText } from '@/components/filter-text';
import SyncUserDing from './SyncUserDing.vue';
import IconLock from '@/assets/svg/icon-key_outlined.svg';
import IconOpeEdit from '@/assets/svg/icon_edit_outlined.svg';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import iconFilter from '@/assets/svg/icon-filter_outlined.svg';
import logo_dingtalk from '@/assets/img/dingtalk.png';
import logo_lark from '@/assets/img/lark.png';
import logo_wechat_work from '@/assets/img/wechat.png';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import { userApi } from '@/api/user';
import { request } from '@/utils/request';
import { workspaceList } from '@/api/workspace';
import { variablesApi } from '@/api/variables';
import { formatTimestamp } from '@/utils/date';
import { ClickOutside as vClickOutside } from 'element-plus-secondary';
import icon_warning_filled from '@/assets/svg/icon_warning_filled.svg';
import { useClipboard } from '@vueuse/core';
const { copy } = useClipboard({ legacy: true });
const { t } = useI18n();
const defaultPwd = ref('SQLBot@123456');
const keyword = ref('');
const dialogFormVisible = ref(false);
const termFormRef = ref();
const checkAll = ref(false);
const dialogVisiblePassword = ref(false);
const isIndeterminate = ref(true);
const drawerMainRef = ref();
const userImportRef = ref();
const syncUserRef = ref();
const selectionLoading = ref(false);
const filterOption = ref([
    {
        type: 'enum',
        option: [
            { id: 1, name: t('user.enable') },
            { id: 0, name: t('user.disable') },
        ],
        field: 'status',
        title: t('user.user_status'),
        operate: 'in',
    },
    {
        type: 'enum',
        option: [
            { id: '0', name: t('user.local_creation') },
            { id: '1', name: 'CAS' },
            { id: '2', name: 'OIDC' },
            { id: '3', name: 'LDAP' },
            { id: '4', name: 'OAuth2' },
            /* { id: '5', name: 'SAML2' }, */
            { id: '6', name: t('user.wecom') },
            { id: '7', name: t('user.dingtalk') },
            { id: '8', name: t('user.lark') },
            /* { id: '9', name: t('user.larksuite') }, */
        ],
        field: 'origins',
        title: t('user.user_source'),
        operate: 'in',
    },
    {
        type: 'select',
        option: [],
        field: 'oidlist',
        title: t('user.workspace'),
        operate: 'in',
        property: { placeholder: t('common.empty') + t('user.workspace') },
    },
]);
const defaultForm = {
    id: '',
    name: '',
    account: '',
    oid: 0,
    email: '',
    status: 1,
    phoneNumber: '',
    oid_list: [],
    system_variables: [],
};
const options = ref([]);
const variables = shallowRef([]);
const variableValueMap = shallowRef({});
const state = reactive({
    tableData: [],
    filterTexts: [],
    conditions: [],
    form: { ...defaultForm },
    pageInfo: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
    },
});
const currentPlatform = ref({});
const rules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('user.name'),
            trigger: 'blur',
        },
    ],
    account: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('user.account'),
            trigger: 'blur',
        },
    ],
    email: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('user.email'),
            trigger: 'blur',
        },
        {
            required: true,
            pattern: /^[a-zA-Z0-9_._-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
            message: t('datasource.incorrect_email_format'),
            trigger: 'blur',
        },
    ],
};
const platformType = ref([
    {
        icon: logo_wechat_work,
        value: 6,
        name: 'sync.sync_wechat_users',
    },
    {
        icon: logo_dingtalk,
        value: 7,
        name: 'sync.sync_dingtalk_users',
    },
    {
        icon: logo_lark,
        value: 8,
        name: 'sync.sync_lark_users',
    },
]);
const refresh = (res) => {
    showTips(res.successCount, res.errorCount, res.dataKey);
    if (res.successCount) {
        search();
    }
};
const handleSyncUser = (ele) => {
    currentPlatform.value = ele;
    syncUserRef.value.open(ele.value, ele.name);
};
const passwordRules = {
    new: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('user.new_password'),
            trigger: 'blur',
        },
    ],
    old: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('user.confirm_password'),
            trigger: 'blur',
        },
    ],
};
const closeResetInfo = (row) => {
    row.popoverRef?.hide();
    row.resetInfoShow = false;
};
const setPopoverRef = (el, row) => {
    row.popoverRef = el;
};
const loadData = () => {
    const url = '/system/platform';
    request.get(url).then((res) => {
        const idArr = res.filter((card) => card.valid && card.enable).map((ele) => ele.id);
        platformType.value = platformType.value.filter((card) => idArr.includes(card.value));
    });
};
const copyText = () => {
    copy(defaultPwd.value)
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
const copyPassword = () => {
    copy(defaultPwd.value)
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
const setButtonRef = (el, row) => {
    row.buttonRef = el;
};
const onClickOutside = (row) => {
    if (row.popoverRef) {
        unref(row.popoverRef).popperRef?.delayHide?.();
    }
};
const multipleTableRef = ref();
const multipleSelectionAll = ref([]);
const dialogTitle = ref('');
const passwordRef = ref();
const password = ref({
    new: '',
    old: '',
    id: '',
});
const handleClosePassword = () => {
    dialogVisiblePassword.value = false;
};
const deleteValues = (index) => {
    state.form.system_variables.splice(index, 1);
};
const handleEditPassword = (id) => {
    userApi.pwd(id).then(() => {
        ElMessage({
            type: 'success',
            message: t('common.password_reset_successful'),
        });
    });
};
/* const handleUserImport = () => {
  userImportRef.value.showDialog()
} */
const handleConfirmPassword = () => {
    passwordRef.value.validate((val) => {
        if (val) {
            console.info(val);
        }
    });
    dialogVisiblePassword.value = false;
};
const handleSelectionChange = (val) => {
    if (selectionLoading.value)
        return;
    const ids = state.tableData.map((ele) => ele.id);
    multipleSelectionAll.value = [
        ...multipleSelectionAll.value.filter((ele) => !ids.includes(ele.id)),
        ...val,
    ];
    isIndeterminate.value = !(val.length === 0 || val.length === state.tableData.length);
    checkAll.value = val.length === state.tableData.length;
};
const handleCheckAllChange = (val) => {
    isIndeterminate.value = false;
    handleSelectionChange(val ? state.tableData : []);
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
    for (const key in state.tableData) {
        if (ids.includes(state.tableData[key].id)) {
            i += 1;
            multipleTableRef.value.toggleRowSelection(state.tableData[key], check);
        }
    }
    checkAll.value = i === state.tableData.length;
    isIndeterminate.value = !(i === 0 || i === state.tableData.length);
    selectionLoading.value = false;
};
const handleSearch = ($event = {}) => {
    if ($event?.isComposing) {
        return;
    }
    state.pageInfo.currentPage = 1;
    search();
};
const fillFilterText = () => {
    const textArray = state.conditions?.length
        ? convertFilterText(state.conditions, filterOption.value)
        : [];
    state.filterTexts = [...textArray];
    Object.assign(state.filterTexts, textArray);
};
const clearFilter = (params) => {
    let index = params ? params : 0;
    if (isNaN(index)) {
        state.filterTexts = [];
    }
    else {
        state.filterTexts.splice(index, 1);
    }
    drawerMainRef.value.clearFilter(index);
};
const searchCondition = (conditions) => {
    state.conditions = conditions;
    fillFilterText();
    search();
    drawerMainClose();
};
const drawerMainOpen = async () => {
    drawerMainRef.value.init();
};
const drawerMainClose = () => {
    drawerMainRef.value.close();
};
const editHandler = (row) => {
    variablesApi.listAll().then((res) => {
        variables.value = res.filter((ele) => ele.type === 'custom');
        variableValueMap.value = variables.value.reduce((pre, next) => {
            pre[next.id] = {
                value: next.value,
                var_type: next.var_type,
                name: next.name,
            };
            return pre;
        }, {});
        if (row) {
            state.form = {
                ...row,
                system_variables: (row.system_variables || []).map((ele) => ({
                    ...ele,
                    variableValue: ele.variableValues[0],
                })),
            };
        }
    });
    dialogFormVisible.value = true;
    dialogTitle.value = row?.id ? t('user.edit_user') : t('user.add_users');
};
const statusHandler = (row) => {
    /* state.form = { ...row }
    editTerm() */
    const param = {
        id: row.id,
        status: row.status,
    };
    userApi.status(param);
};
const cancelDelete = () => {
    handleToggleRowSelection(false);
    multipleSelectionAll.value = [];
    checkAll.value = false;
    isIndeterminate.value = false;
};
const deleteBatchUser = () => {
    ElMessageBox.confirm(t('user.selected_2_users', { msg: multipleSelectionAll.value.length }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        userApi.deleteBatch(multipleSelectionAll.value.map((ele) => ele.id)).then(() => {
            multipleSelectionAll.value = [];
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
            });
            search();
        });
    });
};
const deleteHandler = (row) => {
    ElMessageBox.confirm(t('user.del_user', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        userApi.delete(row.id).then(() => {
            multipleSelectionAll.value = multipleSelectionAll.value.filter((ele) => ele.id !== row.id);
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
            });
            search();
        });
    });
};
const closeForm = () => {
    dialogFormVisible.value = false;
};
const onFormClose = () => {
    state.form = { ...defaultForm };
    dialogFormVisible.value = false;
};
const configParams = () => {
    let str = '';
    if (keyword.value) {
        str += `keyword=${keyword.value}`;
    }
    state.conditions.forEach((ele) => {
        if (ele.field === 'status' && ele.value.length === 2) {
            return;
        }
        ele.value.forEach((itx) => {
            str += str ? `&${ele.field}=${itx}` : `${ele.field}=${itx}`;
        });
    });
    if (str.length) {
        str = `?${str}`;
    }
    return str;
};
const search = () => {
    userApi
        .pager(configParams(), state.pageInfo.currentPage, state.pageInfo.pageSize)
        .then((res) => {
        state.tableData = res.items;
        state.pageInfo.total = res.total;
        selectionLoading.value = true;
        nextTick(() => {
            handleToggleRowSelection();
        });
    });
};
const formatVariableValues = () => {
    if (!state.form.system_variables?.length)
        return [];
    return state.form.system_variables.map((ele) => ({
        variableId: ele.variableId,
        variableValues: variableValueMap.value[ele.variableId].var_type === 'number'
            ? [ele.variableValue]
            : ele.variableValues,
    }));
};
const addTerm = () => {
    const { account, email, name, oid, status, oid_list } = state.form;
    userApi
        .add({ account, email, name, oid, status, oid_list, system_variables: formatVariableValues() })
        .then(() => {
        onFormClose();
        search();
        ElMessage({
            type: 'success',
            message: t('common.save_success'),
        });
    });
};
const editTerm = () => {
    const { account, id, create_time, email, language, name, oid, oid_list, origin, status } = state.form;
    userApi
        .edit({
        account,
        id,
        create_time,
        email,
        language,
        name,
        oid,
        oid_list,
        origin,
        status,
        system_variables: formatVariableValues(),
    })
        .then(() => {
        onFormClose();
        search();
        ElMessage({
            type: 'success',
            message: t('common.save_success'),
        });
    });
};
const duplicateName = () => {
    if (state.form.id) {
        editTerm();
    }
    else {
        addTerm();
    }
};
const validateSystemVariables = () => {
    const { system_variables = [] } = state.form;
    if (system_variables?.length) {
        return system_variables.some((ele) => {
            const obj = variableValueMap.value[ele.variableId];
            if (obj.var_type !== 'number' && !ele.variableValues.length) {
                ElMessage.error(t('variables.​​cannot_be_empty'));
                return true;
            }
            if (obj.var_type === 'number' && !ele.variableValue) {
                ElMessage.error(t('variables.​​cannot_be_empty'));
                return true;
            }
            if (obj.var_type === 'number') {
                const [min, max] = obj.value;
                if (ele.variableValue > max || ele.variableValue < min) {
                    ElMessage.error(t('variables.1_to_100', { name: obj.name, min, max }));
                    return true;
                }
            }
            if (obj.var_type === 'datetime') {
                const [min, max] = obj.value;
                const [minVal, maxVal] = ele.variableValues;
                if (+new Date(minVal) > +new Date(max) ||
                    +new Date(maxVal) < +new Date(min) ||
                    +new Date(maxVal) > +new Date(max) ||
                    +new Date(minVal) < +new Date(min)) {
                    ElMessage.error(t('variables.1_to_100_de', {
                        name: obj.name,
                        min,
                        max,
                    }));
                    return true;
                }
            }
        });
    }
    return false;
};
const saveHandler = () => {
    termFormRef.value.validate((res) => {
        if (res) {
            if (validateSystemVariables())
                return;
            duplicateName();
        }
    });
};
const handleSizeChange = (val) => {
    state.pageInfo.pageSize = val;
    state.pageInfo.currentPage = 1;
    search();
};
const handleCurrentChange = (val) => {
    state.pageInfo.currentPage = val;
    search();
};
const formatSpaceName = (row_oid_list) => {
    if (!row_oid_list?.length) {
        return '-';
    }
    const wsMap = {};
    options.value.forEach((option) => {
        wsMap[option.id] = option.name;
    });
    return row_oid_list.map((id) => wsMap[id]).join(',');
};
const loadDefaultPwd = () => {
    userApi.defaultPwd().then((res) => {
        if (res) {
            defaultPwd.value = res;
        }
    });
};
const formatUserOrigin = (origin) => {
    if (!origin) {
        return t('user.local_creation');
    }
    const originArray = [
        'CAS',
        'OIDC',
        'LDAP',
        'OAuth2',
        'SAML2',
        t('user.wecom'),
        t('user.dingtalk'),
        t('user.lark'),
        t('user.larksuite'),
    ];
    return originArray[origin - 1];
};
const showSyncBtn = ref(false);
onMounted(() => {
    // 暂时注释掉LicenseGenerator相关代码，因为它不存在
    // const obj = LicenseGenerator.getLicense()
    // if (obj?.status === 'valid') {
    //   showSyncBtn.value = true
    //   loadData()
    // } else {
    //   platformType.value = []
    // }
    // 直接加载数据
    showSyncBtn.value = true;
    loadData();
    workspaceList().then((res) => {
        options.value = res || [];
        filterOption.value[2].option = [...options.value];
    });
    search();
    loadDefaultPwd();
});
const downErrorExcel = (dataKey) => {
    userApi.errorRecord(dataKey).then((res) => {
        const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.download = 'error.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
};
const showTips = (successCount, errorCount, dataKey) => {
    let title = successCount ? t('sync.sync_complete') : t('sync.sync_failed');
    const childrenDomList = [h('span', null, t('sync.synced_10_users', { num: successCount }))];
    const contentDomList = h('div', {
        style: 'display: flex;align-items: center;',
    }, childrenDomList);
    const headerDomList = [
        h('div', {
            style: 'font-weight: 500;font-size: 16px;line-height: 24px;margin-bottom: 24px',
        }, title),
        contentDomList,
    ];
    if (successCount && errorCount) {
        childrenDomList.pop();
        const halfCountDom = h('span', null, t('sync.failed_3_users', { success: successCount, failed: errorCount }));
        childrenDomList.push(halfCountDom);
    }
    if (!successCount && errorCount) {
        const errorCountDom = h('span', null, t('sync.failed_10_users', { num: errorCount }));
        childrenDomList.pop();
        childrenDomList.push(errorCountDom);
    }
    if (errorCount) {
        const errorDom = h('div', { class: 'error-record-tip flex-align-center' }, [
            h(ElButton, {
                onClick: () => downErrorExcel(dataKey),
                text: true,
                class: 'down-button',
            }, t('sync.download_failure_list')),
        ]);
        childrenDomList.push(errorDom);
    }
    ElMessageBox.confirm('', {
        confirmButtonType: 'primary',
        autofocus: false,
        dangerouslyUseHTMLString: true,
        message: h('div', { class: 'sync-tip-box' }, headerDomList),
        cancelButtonText: t('sync.return_to_view'),
        confirmButtonText: t('sync.continue_syncing'),
    })
        .then(() => {
        const { value, name } = currentPlatform.value;
        syncUserRef.value.open(value, name);
    })
        .catch(() => {
        currentPlatform.value = null;
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-table-container professional-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('user.user_management'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-bar" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keyword),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('user.name_account_email')),
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keyword),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('user.name_account_email')),
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onKeydown: (__VLS_ctx.handleSearch)
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
    secondary: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.drawerMainOpen)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.iconFilter;
    /** @type {[typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
(__VLS_ctx.$t('user.filter'));
var __VLS_19;
if (!__VLS_ctx.platformType.length && __VLS_ctx.showSyncBtn) {
    const __VLS_28 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        effect: "dark",
        content: (__VLS_ctx.$t('sync.integration')),
        placement: "left",
    }));
    const __VLS_30 = __VLS_29({
        effect: "dark",
        content: (__VLS_ctx.$t('sync.integration')),
        placement: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        disabled: true,
        secondary: true,
    }));
    const __VLS_34 = __VLS_33({
        disabled: true,
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_36 = {}.icon_replace_outlined;
        /** @type {[typeof __VLS_components.Icon_replace_outlined, typeof __VLS_components.icon_replace_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    }
    (__VLS_ctx.t('sync.sync_users'));
    var __VLS_35;
    var __VLS_31;
}
if (__VLS_ctx.platformType.length && __VLS_ctx.showSyncBtn) {
    const __VLS_40 = {}.ElPopover;
    /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        popperClass: "sync-platform",
        placement: "bottom-start",
    }));
    const __VLS_42 = __VLS_41({
        popperClass: "sync-platform",
        placement: "bottom-start",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    {
        const { reference: __VLS_thisSlot } = __VLS_43.slots;
        const __VLS_44 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            secondary: true,
        }));
        const __VLS_46 = __VLS_45({
            secondary: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_47.slots;
            const __VLS_48 = {}.icon_replace_outlined;
            /** @type {[typeof __VLS_components.Icon_replace_outlined, typeof __VLS_components.icon_replace_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
            const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
        }
        (__VLS_ctx.t('sync.sync_users'));
        var __VLS_47;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover-content" },
    });
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.platformType))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.platformType.length && __VLS_ctx.showSyncBtn))
                        return;
                    __VLS_ctx.handleSyncUser(ele);
                } },
            key: (ele.name),
            ...{ class: "popover-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            height: "24",
            width: "24",
            src: (ele.icon),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "model-name" },
        });
        (__VLS_ctx.$t(ele.name));
    }
    var __VLS_43;
}
const __VLS_52 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (...[$event]) => {
        __VLS_ctx.editHandler(null);
    }
};
__VLS_55.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_55.slots;
    const __VLS_60 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
}
(__VLS_ctx.$t('user.add_users'));
var __VLS_55;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-table_user" },
    ...{ class: ([
            __VLS_ctx.state.filterTexts.length && 'is-filter',
            __VLS_ctx.multipleSelectionAll.length && 'show-pagination_height',
        ]) },
});
const __VLS_64 = {}.FilterText;
/** @type {[typeof __VLS_components.FilterText, typeof __VLS_components.filterText, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onClearFilter': {} },
    total: (__VLS_ctx.state.pageInfo.total),
    filterTexts: (__VLS_ctx.state.filterTexts),
}));
const __VLS_66 = __VLS_65({
    ...{ 'onClearFilter': {} },
    total: (__VLS_ctx.state.pageInfo.total),
    filterTexts: (__VLS_ctx.state.filterTexts),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onClearFilter: (__VLS_ctx.clearFilter)
};
var __VLS_67;
const __VLS_72 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onSelectionChange': {} },
    ref: "multipleTableRef",
    data: (__VLS_ctx.state.tableData),
    ...{ style: {} },
}));
const __VLS_74 = __VLS_73({
    ...{ 'onSelectionChange': {} },
    ref: "multipleTableRef",
    data: (__VLS_ctx.state.tableData),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
/** @type {typeof __VLS_ctx.multipleTableRef} */ ;
var __VLS_80 = {};
__VLS_75.slots.default;
const __VLS_82 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    type: "selection",
    width: "55",
}));
const __VLS_84 = __VLS_83({
    type: "selection",
    width: "55",
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
const __VLS_86 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    prop: "name",
    showOverflowTooltip: true,
    label: (__VLS_ctx.$t('user.name')),
    width: "280",
}));
const __VLS_88 = __VLS_87({
    prop: "name",
    showOverflowTooltip: true,
    label: (__VLS_ctx.$t('user.name')),
    width: "280",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
const __VLS_90 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    prop: "account",
    showOverflowTooltip: true,
    label: (__VLS_ctx.$t('user.account')),
    width: "280",
}));
const __VLS_92 = __VLS_91({
    prop: "account",
    showOverflowTooltip: true,
    label: (__VLS_ctx.$t('user.account')),
    width: "280",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
const __VLS_94 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    prop: "status",
    label: (__VLS_ctx.$t('user.user_status')),
    width: "180",
}));
const __VLS_96 = __VLS_95({
    prop: "status",
    label: (__VLS_ctx.$t('user.user_status')),
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
__VLS_97.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_97.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "user-status-container" },
        ...{ class: ([scope.row.status ? 'active' : 'disabled']) },
    });
    const __VLS_98 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
        size: "16",
    }));
    const __VLS_100 = __VLS_99({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    __VLS_101.slots.default;
    if (scope.row.status) {
        const __VLS_102 = {}.SuccessFilled;
        /** @type {[typeof __VLS_components.SuccessFilled, ]} */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({}));
        const __VLS_104 = __VLS_103({}, ...__VLS_functionalComponentArgsRest(__VLS_103));
    }
    else {
        const __VLS_106 = {}.CircleCloseFilled;
        /** @type {[typeof __VLS_components.CircleCloseFilled, ]} */ ;
        // @ts-ignore
        const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({}));
        const __VLS_108 = __VLS_107({}, ...__VLS_functionalComponentArgsRest(__VLS_107));
    }
    var __VLS_101;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t(`user.${scope.row.status ? 'enabled' : 'disabled'}`));
}
var __VLS_97;
const __VLS_110 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    prop: "email",
    showOverflowTooltip: true,
    label: (__VLS_ctx.$t('user.email')),
}));
const __VLS_112 = __VLS_111({
    prop: "email",
    showOverflowTooltip: true,
    label: (__VLS_ctx.$t('user.email')),
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
const __VLS_114 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    prop: "origin",
    label: (__VLS_ctx.$t('user.user_source')),
    width: "120",
}));
const __VLS_116 = __VLS_115({
    prop: "origin",
    label: (__VLS_ctx.$t('user.user_source')),
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_117.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_117.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatUserOrigin(scope.row.origin));
}
var __VLS_117;
const __VLS_118 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    showOverflowTooltip: true,
    prop: "oid_list",
    label: (__VLS_ctx.$t('user.workspace')),
    width: "280",
}));
const __VLS_120 = __VLS_119({
    showOverflowTooltip: true,
    prop: "oid_list",
    label: (__VLS_ctx.$t('user.workspace')),
    width: "280",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_121.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatSpaceName(scope.row.oid_list));
}
var __VLS_121;
const __VLS_122 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    prop: "create_time",
    width: "180",
    sortable: true,
    label: (__VLS_ctx.$t('user.creation_time')),
}));
const __VLS_124 = __VLS_123({
    prop: "create_time",
    width: "180",
    sortable: true,
    label: (__VLS_ctx.$t('user.creation_time')),
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_125.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatTimestamp(scope.row.create_time, 'YYYY-MM-DD HH:mm:ss'));
}
var __VLS_125;
const __VLS_126 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    fixed: "right",
    width: "150",
    label: (__VLS_ctx.$t('ds.actions')),
}));
const __VLS_128 = __VLS_127({
    fixed: "right",
    width: "150",
    label: (__VLS_ctx.$t('ds.actions')),
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
__VLS_129.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_129.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-operate" },
    });
    const __VLS_130 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
        ...{ 'onChange': {} },
        modelValue: (scope.row.status),
        activeValue: (1),
        inactiveValue: (0),
        size: "small",
    }));
    const __VLS_132 = __VLS_131({
        ...{ 'onChange': {} },
        modelValue: (scope.row.status),
        activeValue: (1),
        inactiveValue: (0),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    let __VLS_134;
    let __VLS_135;
    let __VLS_136;
    const __VLS_137 = {
        onChange: (...[$event]) => {
            __VLS_ctx.statusHandler(scope.row);
        }
    };
    var __VLS_133;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "line" },
    });
    const __VLS_138 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('datasource.edit')),
        placement: "top",
    }));
    const __VLS_140 = __VLS_139({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('datasource.edit')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    __VLS_141.slots.default;
    const __VLS_142 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }));
    const __VLS_144 = __VLS_143({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    let __VLS_146;
    let __VLS_147;
    let __VLS_148;
    const __VLS_149 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editHandler(scope.row);
        }
    };
    __VLS_145.slots.default;
    const __VLS_150 = {}.IconOpeEdit;
    /** @type {[typeof __VLS_components.IconOpeEdit, typeof __VLS_components.IconOpeEdit, ]} */ ;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({}));
    const __VLS_152 = __VLS_151({}, ...__VLS_functionalComponentArgsRest(__VLS_151));
    var __VLS_145;
    var __VLS_141;
    const __VLS_154 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('common.reset_password')),
        placement: "top",
    }));
    const __VLS_156 = __VLS_155({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('common.reset_password')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    __VLS_157.slots.default;
    const __VLS_158 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
        ref: ((el) => {
            __VLS_ctx.setButtonRef(el, scope.row);
        }),
        ...{ class: "action-btn" },
        size: "16",
    }));
    const __VLS_160 = __VLS_159({
        ref: ((el) => {
            __VLS_ctx.setButtonRef(el, scope.row);
        }),
        ...{ class: "action-btn" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    __VLS_asFunctionalDirective(__VLS_directives.vClickOutside)(null, { ...__VLS_directiveBindingRestFields, value: (() => __VLS_ctx.onClickOutside(scope.row)) }, null, null);
    __VLS_161.slots.default;
    const __VLS_162 = {}.IconLock;
    /** @type {[typeof __VLS_components.IconLock, typeof __VLS_components.IconLock, ]} */ ;
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({}));
    const __VLS_164 = __VLS_163({}, ...__VLS_functionalComponentArgsRest(__VLS_163));
    var __VLS_161;
    var __VLS_157;
    const __VLS_166 = {}.ElPopover;
    /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        ref: ((el) => {
            __VLS_ctx.setPopoverRef(el, scope.row);
        }),
        placement: "right",
        virtualTriggering: true,
        width: (300),
        virtualRef: (scope.row.buttonRef),
        trigger: "click",
        showArrow: true,
    }));
    const __VLS_168 = __VLS_167({
        ref: ((el) => {
            __VLS_ctx.setPopoverRef(el, scope.row);
        }),
        placement: "right",
        virtualTriggering: true,
        width: (300),
        virtualRef: (scope.row.buttonRef),
        trigger: "click",
        showArrow: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    __VLS_169.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "reset-pwd-confirm" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "confirm-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon-span" },
    });
    const __VLS_170 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
        size: "24",
    }));
    const __VLS_172 = __VLS_171({
        size: "24",
    }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    __VLS_173.slots.default;
    const __VLS_174 = {}.icon_warning_filled;
    /** @type {[typeof __VLS_components.Icon_warning_filled, typeof __VLS_components.icon_warning_filled, ]} */ ;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
        ...{ class: "svg-icon" },
    }));
    const __VLS_176 = __VLS_175({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    var __VLS_173;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "header-span" },
    });
    (__VLS_ctx.t('datasource.the_original_one'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "confirm-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.defaultPwd);
    const __VLS_178 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
        ...{ 'onClick': {} },
        ...{ style: {} },
        text: true,
    }));
    const __VLS_180 = __VLS_179({
        ...{ 'onClick': {} },
        ...{ style: {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    let __VLS_182;
    let __VLS_183;
    let __VLS_184;
    const __VLS_185 = {
        onClick: (__VLS_ctx.copyText)
    };
    __VLS_181.slots.default;
    (__VLS_ctx.t('datasource.copy'));
    var __VLS_181;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "confirm-foot" },
    });
    const __VLS_186 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_188 = __VLS_187({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    let __VLS_190;
    let __VLS_191;
    let __VLS_192;
    const __VLS_193 = {
        onClick: (...[$event]) => {
            __VLS_ctx.closeResetInfo(scope.row);
        }
    };
    __VLS_189.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_189;
    const __VLS_194 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_196 = __VLS_195({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    let __VLS_198;
    let __VLS_199;
    let __VLS_200;
    const __VLS_201 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleEditPassword(scope.row.id);
        }
    };
    __VLS_197.slots.default;
    (__VLS_ctx.t('datasource.confirm'));
    var __VLS_197;
    var __VLS_169;
    const __VLS_202 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('dashboard.delete')),
        placement: "top",
    }));
    const __VLS_204 = __VLS_203({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('dashboard.delete')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    __VLS_205.slots.default;
    const __VLS_206 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }));
    const __VLS_208 = __VLS_207({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    let __VLS_210;
    let __VLS_211;
    let __VLS_212;
    const __VLS_213 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteHandler(scope.row);
        }
    };
    __VLS_209.slots.default;
    const __VLS_214 = {}.IconOpeDelete;
    /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({}));
    const __VLS_216 = __VLS_215({}, ...__VLS_functionalComponentArgsRest(__VLS_215));
    var __VLS_209;
    var __VLS_205;
}
var __VLS_129;
{
    const { empty: __VLS_thisSlot } = __VLS_75.slots;
    if (!!__VLS_ctx.keyword && !__VLS_ctx.state.tableData.length) {
        /** @type {[typeof EmptyBackground, ]} */ ;
        // @ts-ignore
        const __VLS_218 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
            description: (__VLS_ctx.$t('datasource.relevant_content_found')),
            imgType: "tree",
        }));
        const __VLS_219 = __VLS_218({
            description: (__VLS_ctx.$t('datasource.relevant_content_found')),
            imgType: "tree",
        }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    }
}
var __VLS_75;
if (__VLS_ctx.state.tableData.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_221 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.state.pageInfo.currentPage),
        pageSize: (__VLS_ctx.state.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.state.pageInfo.total),
    }));
    const __VLS_223 = __VLS_222({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.state.pageInfo.currentPage),
        pageSize: (__VLS_ctx.state.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.state.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_222));
    let __VLS_225;
    let __VLS_226;
    let __VLS_227;
    const __VLS_228 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_229 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_224;
}
if (__VLS_ctx.multipleSelectionAll.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-select" },
    });
    const __VLS_230 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }));
    const __VLS_232 = __VLS_231({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    let __VLS_234;
    let __VLS_235;
    let __VLS_236;
    const __VLS_237 = {
        onChange: (__VLS_ctx.handleCheckAllChange)
    };
    __VLS_233.slots.default;
    (__VLS_ctx.$t('datasource.select_all'));
    var __VLS_233;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.deleteBatchUser) },
        ...{ class: "danger-button" },
    });
    (__VLS_ctx.$t('dashboard.delete'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected" },
    });
    (__VLS_ctx.$t('user.selected_2_items', { msg: __VLS_ctx.multipleSelectionAll.length }));
    const __VLS_238 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_240 = __VLS_239({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    let __VLS_242;
    let __VLS_243;
    let __VLS_244;
    const __VLS_245 = {
        onClick: (__VLS_ctx.cancelDelete)
    };
    __VLS_241.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_241;
}
const __VLS_246 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    modalClass: "user-add-class",
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
}));
const __VLS_248 = __VLS_247({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    modalClass: "user-add-class",
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
}, ...__VLS_functionalComponentArgsRest(__VLS_247));
__VLS_249.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
    ...{ class: "down-template" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-span" },
});
const __VLS_250 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({}));
const __VLS_252 = __VLS_251({}, ...__VLS_functionalComponentArgsRest(__VLS_251));
__VLS_253.slots.default;
const __VLS_254 = {}.Icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
// @ts-ignore
const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
    name: "icon_warning_filled",
}));
const __VLS_256 = __VLS_255({
    name: "icon_warning_filled",
}, ...__VLS_functionalComponentArgsRest(__VLS_255));
__VLS_257.slots.default;
const __VLS_258 = {}.icon_warning_filled;
/** @type {[typeof __VLS_components.Icon_warning_filled, typeof __VLS_components.icon_warning_filled, ]} */ ;
// @ts-ignore
const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
    ...{ class: "svg-icon" },
}));
const __VLS_260 = __VLS_259({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_259));
var __VLS_257;
var __VLS_253;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "down-template-content" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('prompt.default_password', { msg: __VLS_ctx.defaultPwd }));
const __VLS_262 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({
    ...{ 'onClick': {} },
    ...{ style: {} },
    size: "small",
    text: true,
}));
const __VLS_264 = __VLS_263({
    ...{ 'onClick': {} },
    ...{ style: {} },
    size: "small",
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_263));
let __VLS_266;
let __VLS_267;
let __VLS_268;
const __VLS_269 = {
    onClick: (__VLS_ctx.copyPassword)
};
__VLS_265.slots.default;
(__VLS_ctx.t('datasource.copy'));
var __VLS_265;
const __VLS_270 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.state.form),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}));
const __VLS_272 = __VLS_271({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.state.form),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_271));
let __VLS_274;
let __VLS_275;
let __VLS_276;
const __VLS_277 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.termFormRef} */ ;
var __VLS_278 = {};
__VLS_273.slots.default;
const __VLS_280 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    prop: "name",
    label: (__VLS_ctx.t('user.name')),
}));
const __VLS_282 = __VLS_281({
    prop: "name",
    label: (__VLS_ctx.t('user.name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
const __VLS_284 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    modelValue: (__VLS_ctx.state.form.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}));
const __VLS_286 = __VLS_285({
    modelValue: (__VLS_ctx.state.form.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
var __VLS_283;
const __VLS_288 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    prop: "account",
    label: (__VLS_ctx.t('user.account')),
}));
const __VLS_290 = __VLS_289({
    prop: "account",
    label: (__VLS_ctx.t('user.account')),
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
const __VLS_292 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    modelValue: (__VLS_ctx.state.form.account),
    disabled: (!!__VLS_ctx.state.form.id),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.account')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}));
const __VLS_294 = __VLS_293({
    modelValue: (__VLS_ctx.state.form.account),
    disabled: (!!__VLS_ctx.state.form.id),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.account')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
var __VLS_291;
const __VLS_296 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    prop: "email",
    label: (__VLS_ctx.$t('user.email')),
}));
const __VLS_298 = __VLS_297({
    prop: "email",
    label: (__VLS_ctx.$t('user.email')),
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
const __VLS_300 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    modelValue: (__VLS_ctx.state.form.email),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.email')),
    autocomplete: "off",
    clearable: true,
}));
const __VLS_302 = __VLS_301({
    modelValue: (__VLS_ctx.state.form.email),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.email')),
    autocomplete: "off",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
var __VLS_299;
const __VLS_304 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    label: (__VLS_ctx.$t('user.workspace')),
}));
const __VLS_306 = __VLS_305({
    label: (__VLS_ctx.$t('user.workspace')),
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
const __VLS_308 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    modelValue: (__VLS_ctx.state.form.oid_list),
    multiple: true,
    placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.workspace')),
}));
const __VLS_310 = __VLS_309({
    modelValue: (__VLS_ctx.state.form.oid_list),
    multiple: true,
    placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.workspace')),
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
__VLS_311.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.options))) {
    const __VLS_312 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_314 = __VLS_313({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_313));
    __VLS_315.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ellipsis" },
        title: (item.name),
        ...{ style: {} },
    });
    (item.name);
    var __VLS_315;
}
var __VLS_311;
var __VLS_307;
const __VLS_316 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({}));
const __VLS_318 = __VLS_317({}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_319.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('variables.system_variables'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.state.form.system_variables.push({
                    variableId: '',
                    variableValues: [],
                    variableValue: '',
                });
            } },
        ...{ class: "btn" },
    });
    const __VLS_320 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_322 = __VLS_321({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_321));
    __VLS_323.slots.default;
    const __VLS_324 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({}));
    const __VLS_326 = __VLS_325({}, ...__VLS_functionalComponentArgsRest(__VLS_325));
    var __VLS_323;
    (__VLS_ctx.$t('model.add'));
}
if (!!__VLS_ctx.state.form.system_variables.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.t('variables.variables'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('variables.variable_value'));
    for (const [_, index] of __VLS_getVForSourceType((__VLS_ctx.state.form.system_variables))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item" },
        });
        const __VLS_328 = {}.ElSelect;
        /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
        // @ts-ignore
        const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
            modelValue: (__VLS_ctx.state.form.system_variables[index].variableId),
            ...{ style: {} },
            placeholder: (__VLS_ctx.$t('datasource.Please_select')),
        }));
        const __VLS_330 = __VLS_329({
            modelValue: (__VLS_ctx.state.form.system_variables[index].variableId),
            ...{ style: {} },
            placeholder: (__VLS_ctx.$t('datasource.Please_select')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_329));
        __VLS_331.slots.default;
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.variables))) {
            const __VLS_332 = {}.ElOption;
            /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
            // @ts-ignore
            const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
                key: (item.id),
                label: (item.name),
                value: (item.id),
            }));
            const __VLS_334 = __VLS_333({
                key: (item.id),
                label: (item.name),
                value: (item.id),
            }, ...__VLS_functionalComponentArgsRest(__VLS_333));
        }
        var __VLS_331;
        if (!__VLS_ctx.state.form.system_variables[index].variableId) {
            const __VLS_336 = {}.ElSelect;
            /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
            // @ts-ignore
            const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
                modelValue: (__VLS_ctx.state.form.system_variables[index].variableValues),
                multiple: true,
                ...{ style: {} },
                placeholder: (__VLS_ctx.$t('datasource.Please_select')),
            }));
            const __VLS_338 = __VLS_337({
                modelValue: (__VLS_ctx.state.form.system_variables[index].variableValues),
                multiple: true,
                ...{ style: {} },
                placeholder: (__VLS_ctx.$t('datasource.Please_select')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_337));
            __VLS_339.slots.default;
            for (const [item] of __VLS_getVForSourceType(([]))) {
                const __VLS_340 = {}.ElOption;
                /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
                // @ts-ignore
                const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
                    key: (item),
                    label: (item),
                    value: (item),
                }));
                const __VLS_342 = __VLS_341({
                    key: (item),
                    label: (item),
                    value: (item),
                }, ...__VLS_functionalComponentArgsRest(__VLS_341));
            }
            var __VLS_339;
        }
        else if (__VLS_ctx.variableValueMap[__VLS_ctx.state.form.system_variables[index].variableId].var_type === 'text') {
            const __VLS_344 = {}.ElSelect;
            /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
            // @ts-ignore
            const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
                modelValue: (__VLS_ctx.state.form.system_variables[index].variableValues),
                multiple: true,
                ...{ style: {} },
                placeholder: (__VLS_ctx.$t('datasource.Please_select')),
            }));
            const __VLS_346 = __VLS_345({
                modelValue: (__VLS_ctx.state.form.system_variables[index].variableValues),
                multiple: true,
                ...{ style: {} },
                placeholder: (__VLS_ctx.$t('datasource.Please_select')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_345));
            __VLS_347.slots.default;
            for (const [item] of __VLS_getVForSourceType((__VLS_ctx.variableValueMap[__VLS_ctx.state.form.system_variables[index].variableId]
                .value))) {
                const __VLS_348 = {}.ElOption;
                /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
                // @ts-ignore
                const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
                    key: (item),
                    label: (item),
                    value: (item),
                }));
                const __VLS_350 = __VLS_349({
                    key: (item),
                    label: (item),
                    value: (item),
                }, ...__VLS_functionalComponentArgsRest(__VLS_349));
            }
            var __VLS_347;
        }
        else if (__VLS_ctx.variableValueMap[__VLS_ctx.state.form.system_variables[index].variableId].var_type ===
            'number') {
            const __VLS_352 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
                modelValue: (__VLS_ctx.state.form.system_variables[index].variableValue),
                modelModifiers: { number: true, },
                ...{ style: {} },
                placeholder: (__VLS_ctx.$t('variables.please_enter_value')),
                autocomplete: "off",
                maxlength: "50",
                clearable: true,
            }));
            const __VLS_354 = __VLS_353({
                modelValue: (__VLS_ctx.state.form.system_variables[index].variableValue),
                modelModifiers: { number: true, },
                ...{ style: {} },
                placeholder: (__VLS_ctx.$t('variables.please_enter_value')),
                autocomplete: "off",
                maxlength: "50",
                clearable: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_353));
        }
        else {
            const __VLS_356 = {}.ElDatePicker;
            /** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
            // @ts-ignore
            const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
                modelValue: (__VLS_ctx.state.form.system_variables[index].variableValues),
                type: "daterange",
                ...{ style: {} },
                valueFormat: "YYYY-MM-DD",
                rangeSeparator: "",
                startPlaceholder: (__VLS_ctx.$t('variables.start_date')),
                endPlaceholder: (__VLS_ctx.$t('variables.end_date')),
            }));
            const __VLS_358 = __VLS_357({
                modelValue: (__VLS_ctx.state.form.system_variables[index].variableValues),
                type: "daterange",
                ...{ style: {} },
                valueFormat: "YYYY-MM-DD",
                rangeSeparator: "",
                startPlaceholder: (__VLS_ctx.$t('variables.start_date')),
                endPlaceholder: (__VLS_ctx.$t('variables.end_date')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_357));
        }
        const __VLS_360 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('dashboard.delete')),
            placement: "top",
        }));
        const __VLS_362 = __VLS_361({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('dashboard.delete')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_361));
        __VLS_363.slots.default;
        const __VLS_364 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }));
        const __VLS_366 = __VLS_365({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_365));
        let __VLS_368;
        let __VLS_369;
        let __VLS_370;
        const __VLS_371 = {
            onClick: (...[$event]) => {
                if (!(!!__VLS_ctx.state.form.system_variables.length))
                    return;
                __VLS_ctx.deleteValues(index);
            }
        };
        __VLS_367.slots.default;
        const __VLS_372 = {}.IconOpeDelete;
        /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
        // @ts-ignore
        const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({}));
        const __VLS_374 = __VLS_373({}, ...__VLS_functionalComponentArgsRest(__VLS_373));
        var __VLS_367;
        var __VLS_363;
    }
}
var __VLS_319;
const __VLS_376 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
    label: (__VLS_ctx.$t('user.user_status')),
}));
const __VLS_378 = __VLS_377({
    label: (__VLS_ctx.$t('user.user_status')),
}, ...__VLS_functionalComponentArgsRest(__VLS_377));
__VLS_379.slots.default;
const __VLS_380 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
    modelValue: (__VLS_ctx.state.form.status),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_382 = __VLS_381({
    modelValue: (__VLS_ctx.state.form.status),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_381));
var __VLS_379;
var __VLS_273;
{
    const { footer: __VLS_thisSlot } = __VLS_249.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_384 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_386 = __VLS_385({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
    let __VLS_388;
    let __VLS_389;
    let __VLS_390;
    const __VLS_391 = {
        onClick: (__VLS_ctx.closeForm)
    };
    __VLS_387.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_387;
    const __VLS_392 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_394 = __VLS_393({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_393));
    let __VLS_396;
    let __VLS_397;
    let __VLS_398;
    const __VLS_399 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_395.slots.default;
    (__VLS_ctx.state.form.id ? __VLS_ctx.$t('common.save') : __VLS_ctx.$t('model.add'));
    var __VLS_395;
}
var __VLS_249;
const __VLS_400 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({
    modelValue: (__VLS_ctx.dialogVisiblePassword),
    title: (__VLS_ctx.$t('user.change_password')),
    width: "500",
    beforeClose: (__VLS_ctx.handleClosePassword),
}));
const __VLS_402 = __VLS_401({
    modelValue: (__VLS_ctx.dialogVisiblePassword),
    title: (__VLS_ctx.$t('user.change_password')),
    width: "500",
    beforeClose: (__VLS_ctx.handleClosePassword),
}, ...__VLS_functionalComponentArgsRest(__VLS_401));
__VLS_403.slots.default;
const __VLS_404 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_405 = __VLS_asFunctionalComponent(__VLS_404, new __VLS_404({
    ...{ 'onSubmit': {} },
    ref: "passwordRef",
    model: (__VLS_ctx.password),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.passwordRules),
    ...{ class: "form-content_error" },
}));
const __VLS_406 = __VLS_405({
    ...{ 'onSubmit': {} },
    ref: "passwordRef",
    model: (__VLS_ctx.password),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.passwordRules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_405));
let __VLS_408;
let __VLS_409;
let __VLS_410;
const __VLS_411 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.passwordRef} */ ;
var __VLS_412 = {};
__VLS_407.slots.default;
const __VLS_414 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_415 = __VLS_asFunctionalComponent(__VLS_414, new __VLS_414({
    prop: "new",
    label: (__VLS_ctx.t('user.new_password')),
}));
const __VLS_416 = __VLS_415({
    prop: "new",
    label: (__VLS_ctx.t('user.new_password')),
}, ...__VLS_functionalComponentArgsRest(__VLS_415));
__VLS_417.slots.default;
const __VLS_418 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({
    modelValue: (__VLS_ctx.password.new),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.new_password')),
    autocomplete: "off",
    clearable: true,
}));
const __VLS_420 = __VLS_419({
    modelValue: (__VLS_ctx.password.new),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.new_password')),
    autocomplete: "off",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_419));
var __VLS_417;
const __VLS_422 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_423 = __VLS_asFunctionalComponent(__VLS_422, new __VLS_422({
    prop: "old",
    label: (__VLS_ctx.t('user.confirm_password')),
}));
const __VLS_424 = __VLS_423({
    prop: "old",
    label: (__VLS_ctx.t('user.confirm_password')),
}, ...__VLS_functionalComponentArgsRest(__VLS_423));
__VLS_425.slots.default;
const __VLS_426 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_427 = __VLS_asFunctionalComponent(__VLS_426, new __VLS_426({
    modelValue: (__VLS_ctx.password.old),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.confirm_password')),
    autocomplete: "off",
    clearable: true,
}));
const __VLS_428 = __VLS_427({
    modelValue: (__VLS_ctx.password.old),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('user.confirm_password')),
    autocomplete: "off",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_427));
var __VLS_425;
var __VLS_407;
{
    const { footer: __VLS_thisSlot } = __VLS_403.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_430 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_432 = __VLS_431({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_431));
    let __VLS_434;
    let __VLS_435;
    let __VLS_436;
    const __VLS_437 = {
        onClick: (__VLS_ctx.handleClosePassword)
    };
    __VLS_433.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_433;
    const __VLS_438 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_439 = __VLS_asFunctionalComponent(__VLS_438, new __VLS_438({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_440 = __VLS_439({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_439));
    let __VLS_442;
    let __VLS_443;
    let __VLS_444;
    const __VLS_445 = {
        onClick: (__VLS_ctx.handleConfirmPassword)
    };
    __VLS_441.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_441;
}
var __VLS_403;
/** @type {[typeof UserImport, typeof UserImport, ]} */ ;
// @ts-ignore
const __VLS_446 = __VLS_asFunctionalComponent(UserImport, new UserImport({
    ...{ 'onRefreshGrid': {} },
    ref: "userImportRef",
}));
const __VLS_447 = __VLS_446({
    ...{ 'onRefreshGrid': {} },
    ref: "userImportRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_446));
let __VLS_449;
let __VLS_450;
let __VLS_451;
const __VLS_452 = {
    onRefreshGrid: (__VLS_ctx.search)
};
/** @type {typeof __VLS_ctx.userImportRef} */ ;
var __VLS_453 = {};
var __VLS_448;
const __VLS_455 = {}.DrawerMain;
/** @type {[typeof __VLS_components.DrawerMain, typeof __VLS_components.drawerMain, ]} */ ;
// @ts-ignore
const __VLS_456 = __VLS_asFunctionalComponent(__VLS_455, new __VLS_455({
    ...{ 'onTriggerFilter': {} },
    ref: "drawerMainRef",
    filterOptions: (__VLS_ctx.filterOption),
}));
const __VLS_457 = __VLS_456({
    ...{ 'onTriggerFilter': {} },
    ref: "drawerMainRef",
    filterOptions: (__VLS_ctx.filterOption),
}, ...__VLS_functionalComponentArgsRest(__VLS_456));
let __VLS_459;
let __VLS_460;
let __VLS_461;
const __VLS_462 = {
    onTriggerFilter: (__VLS_ctx.searchCondition)
};
/** @type {typeof __VLS_ctx.drawerMainRef} */ ;
var __VLS_463 = {};
var __VLS_458;
/** @type {[typeof SyncUserDing, typeof SyncUserDing, ]} */ ;
// @ts-ignore
const __VLS_465 = __VLS_asFunctionalComponent(SyncUserDing, new SyncUserDing({
    ...{ 'onRefresh': {} },
    ref: "syncUserRef",
}));
const __VLS_466 = __VLS_465({
    ...{ 'onRefresh': {} },
    ref: "syncUserRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_465));
let __VLS_468;
let __VLS_469;
let __VLS_470;
const __VLS_471 = {
    onRefresh: (__VLS_ctx.refresh)
};
/** @type {typeof __VLS_ctx.syncUserRef} */ ;
var __VLS_472 = {};
var __VLS_467;
/** @type {__VLS_StyleScopedClasses['sqlbot-table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['professional-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['sqlbot-table_user']} */ ;
/** @type {__VLS_StyleScopedClasses['user-status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-operate']} */ ;
/** @type {__VLS_StyleScopedClasses['line']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-pwd-confirm']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-header']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-span']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['header-span']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-content']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-foot']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-button']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['down-template']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-span']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['down-template-content']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['value-list']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_81 = __VLS_80, __VLS_279 = __VLS_278, __VLS_413 = __VLS_412, __VLS_454 = __VLS_453, __VLS_464 = __VLS_463, __VLS_473 = __VLS_472;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            UserImport: UserImport,
            SuccessFilled: SuccessFilled,
            icon_replace_outlined: icon_replace_outlined,
            CircleCloseFilled: CircleCloseFilled,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            EmptyBackground: EmptyBackground,
            FilterText: FilterText,
            SyncUserDing: SyncUserDing,
            IconLock: IconLock,
            IconOpeEdit: IconOpeEdit,
            IconOpeDelete: IconOpeDelete,
            iconFilter: iconFilter,
            icon_add_outlined: icon_add_outlined,
            formatTimestamp: formatTimestamp,
            vClickOutside: vClickOutside,
            icon_warning_filled: icon_warning_filled,
            t: t,
            defaultPwd: defaultPwd,
            keyword: keyword,
            dialogFormVisible: dialogFormVisible,
            termFormRef: termFormRef,
            checkAll: checkAll,
            dialogVisiblePassword: dialogVisiblePassword,
            isIndeterminate: isIndeterminate,
            drawerMainRef: drawerMainRef,
            userImportRef: userImportRef,
            syncUserRef: syncUserRef,
            filterOption: filterOption,
            options: options,
            variables: variables,
            variableValueMap: variableValueMap,
            state: state,
            rules: rules,
            platformType: platformType,
            refresh: refresh,
            handleSyncUser: handleSyncUser,
            passwordRules: passwordRules,
            closeResetInfo: closeResetInfo,
            setPopoverRef: setPopoverRef,
            copyText: copyText,
            copyPassword: copyPassword,
            setButtonRef: setButtonRef,
            onClickOutside: onClickOutside,
            multipleTableRef: multipleTableRef,
            multipleSelectionAll: multipleSelectionAll,
            dialogTitle: dialogTitle,
            passwordRef: passwordRef,
            password: password,
            handleClosePassword: handleClosePassword,
            deleteValues: deleteValues,
            handleEditPassword: handleEditPassword,
            handleConfirmPassword: handleConfirmPassword,
            handleSelectionChange: handleSelectionChange,
            handleCheckAllChange: handleCheckAllChange,
            handleSearch: handleSearch,
            clearFilter: clearFilter,
            searchCondition: searchCondition,
            drawerMainOpen: drawerMainOpen,
            editHandler: editHandler,
            statusHandler: statusHandler,
            cancelDelete: cancelDelete,
            deleteBatchUser: deleteBatchUser,
            deleteHandler: deleteHandler,
            closeForm: closeForm,
            onFormClose: onFormClose,
            search: search,
            saveHandler: saveHandler,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            formatSpaceName: formatSpaceName,
            formatUserOrigin: formatUserOrigin,
            showSyncBtn: showSyncBtn,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
