import { onMounted, reactive, ref } from 'vue';
import icon_export_outlined from '@/assets/svg/icon_export_outlined.svg';
import { formatTimestamp } from '@/utils/date';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import { useI18n } from 'vue-i18n';
import { convertFilterText, FilterText } from '@/components/filter-text';
import { DrawerMain } from '@/components/drawer-main';
import iconFilter from '@/assets/svg/icon-filter_outlined.svg';
import { audit } from '@/api/audit.ts';
import { workspaceList } from '@/api/workspace.ts';
import { userApi } from '@/api/auth.ts';
import icon_success from '@/assets/svg/icon_success.svg';
import icon_error from '@/assets/svg/icon_error.svg';
import icon_issue from '@/assets/svg/icon_issue.svg';
const { t } = useI18n();
const multipleSelectionAll = ref([]);
const keywords = ref('');
const oldKeywords = ref('');
const searchLoading = ref(false);
const drawerMainRef = ref();
onMounted(() => {
    search();
    initWorkspace();
    initUsers();
    initOptions();
});
const multipleTableRef = ref();
const fieldList = ref([]);
const pageInfo = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
});
const curErrorInfo = ref();
const state = reactive({
    conditions: [],
    filterTexts: [],
});
const exportExcel = () => {
    ElMessageBox.confirm(t('audit.all_236_terms', { msg: pageInfo.total }), {
        confirmButtonType: 'primary',
        confirmButtonText: t('audit.export'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        searchLoading.value = true;
        audit
            .export2Excel(configParams())
            .then((res) => {
            const blob = new Blob([res], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${t('audit.system_log')}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
            .catch(async (error) => {
            if (error.response) {
                try {
                    let text = await error.response.data.text();
                    try {
                        text = JSON.parse(text);
                    }
                    finally {
                        ElMessage({
                            message: text,
                            type: 'error',
                            showClose: true,
                        });
                    }
                }
                catch (e) {
                    console.error('Error processing error response:', e);
                }
            }
            else {
                console.error('Other error:', error);
                ElMessage({
                    message: error,
                    type: 'error',
                    showClose: true,
                });
            }
        })
            .finally(() => {
            searchLoading.value = false;
        });
    });
};
const toggleRowLoading = ref(false);
const configParams = () => {
    let str = '';
    let str_conditions = '';
    if (keywords.value) {
        str += `name=${keywords.value}`;
    }
    state.conditions.forEach((ele) => {
        str_conditions = '';
        ele.value.forEach((itx) => {
            str_conditions += str_conditions ? `__${itx}` : `${ele.field}=${itx}`;
        });
        str += str ? `&${str_conditions}` : `${str_conditions}`;
    });
    if (str.length) {
        str = `?${str}`;
    }
    return str;
};
const search = () => {
    searchLoading.value = true;
    oldKeywords.value = keywords.value;
    audit
        .getList(pageInfo.currentPage, pageInfo.pageSize, configParams())
        .then((res) => {
        toggleRowLoading.value = true;
        fieldList.value = res.data;
        pageInfo.total = res.total_count;
        searchLoading.value = false;
    })
        .finally(() => {
        searchLoading.value = false;
    });
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
const rowInfoDialog = ref(false);
const onErrorInfoOpen = (info) => {
    rowInfoDialog.value = true;
    curErrorInfo.value = info;
};
const onErrorInfoClose = () => {
    rowInfoDialog.value = false;
};
const filterOption = ref([
    {
        type: 'tree-select',
        option: [],
        field: 'opt_type_list',
        title: t('audit.operation_type'),
        operate: 'in',
        property: { placeholder: t('common.empty') + t('audit.operation_type') },
    },
    {
        type: 'select',
        option: [],
        field: 'uid_list',
        title: t('audit.operation_user_name'),
        operate: 'in',
        property: { placeholder: t('common.empty') + t('audit.operation_user_name') },
    },
    {
        type: 'select',
        option: [],
        field: 'oid_list',
        title: t('audit.oid_name'),
        operate: 'in',
        property: { placeholder: t('common.empty') + t('audit.oid_name') },
    },
    {
        type: 'enum',
        option: [
            { id: 'success', name: t('audit.success') },
            { id: 'failed', name: t('audit.failed') },
        ],
        field: 'log_status',
        title: t('user.user_status'),
        operate: 'in',
    },
    {
        type: 'time',
        option: [],
        field: 'time_range',
        title: t('audit.opt_time'),
        operate: 'between',
        property: {
            showType: 'datetimerange',
            format: 'YYYY-MM-DD HH:mm:ss',
            valueFormat: 'x',
        },
    },
]);
const fillFilterText = () => {
    const textArray = state.conditions?.length
        ? convertFilterText(state.conditions, filterOption.value)
        : [];
    state.filterTexts = [...textArray];
    Object.assign(state.filterTexts, textArray);
};
const searchCondition = (conditions) => {
    state.conditions = conditions;
    fillFilterText();
    search();
    drawerMainClose();
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
const drawerMainOpen = async () => {
    drawerMainRef.value.init();
};
const drawerMainClose = () => {
    drawerMainRef.value.close();
};
const initWorkspace = () => {
    workspaceList().then((res) => {
        filterOption.value[2].option = [...res];
    });
};
const initUsers = () => {
    userApi.pager(1, 10000).then((res) => {
        filterOption.value[1].option = [{ id: 1, name: 'Administrator' }, ...res.items];
    });
};
const initOptions = () => {
    audit.getOptions().then((res) => {
        filterOption.value[0].option = [...res];
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['not-allow']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "professional" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.searchLoading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('audit.system_log'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-row" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.exportExcel)
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.icon_export_outlined;
    /** @type {[typeof __VLS_components.Icon_export_outlined, typeof __VLS_components.icon_export_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
(__VLS_ctx.$t('professional.export_all'));
var __VLS_3;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    secondary: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.drawerMainOpen)
};
__VLS_15.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_15.slots;
    const __VLS_20 = {}.iconFilter;
    /** @type {[typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
(__VLS_ctx.$t('user.filter'));
var __VLS_15;
if (!__VLS_ctx.searchLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
        ...{ class: (__VLS_ctx.multipleSelectionAll?.length > 0 && 'show-pagination_height') },
    });
    const __VLS_24 = {}.FilterText;
    /** @type {[typeof __VLS_components.FilterText, typeof __VLS_components.filterText, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClearFilter': {} },
        total: (__VLS_ctx.pageInfo.total),
        filterTexts: (__VLS_ctx.state.filterTexts),
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClearFilter': {} },
        total: (__VLS_ctx.pageInfo.total),
        filterTexts: (__VLS_ctx.state.filterTexts),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClearFilter: (__VLS_ctx.clearFilter)
    };
    var __VLS_27;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-or-schema" },
    });
    const __VLS_32 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }));
    const __VLS_34 = __VLS_33({
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    /** @type {typeof __VLS_ctx.multipleTableRef} */ ;
    var __VLS_36 = {};
    __VLS_35.slots.default;
    const __VLS_38 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
        prop: "word",
        label: (__VLS_ctx.$t('audit.operation_type')),
        width: "140",
    }));
    const __VLS_40 = __VLS_39({
        prop: "word",
        label: (__VLS_ctx.$t('audit.operation_type')),
        width: "140",
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_41.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_41.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.operation_type_name);
    }
    var __VLS_41;
    const __VLS_42 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
        label: (__VLS_ctx.$t('audit.operation_details')),
        minWidth: "200",
    }));
    const __VLS_44 = __VLS_43({
        label: (__VLS_ctx.$t('audit.operation_details')),
        minWidth: "200",
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    __VLS_45.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_45.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.operation_detail_info);
    }
    var __VLS_45;
    const __VLS_46 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
        label: (__VLS_ctx.$t('audit.operation_user_name')),
        minWidth: "120",
    }));
    const __VLS_48 = __VLS_47({
        label: (__VLS_ctx.$t('audit.operation_user_name')),
        minWidth: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_49.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_49.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.user_name);
    }
    var __VLS_49;
    const __VLS_50 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        prop: "word",
        label: (__VLS_ctx.$t('audit.oid_name')),
        width: "120",
    }));
    const __VLS_52 = __VLS_51({
        prop: "word",
        label: (__VLS_ctx.$t('audit.oid_name')),
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_53.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_53.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.oid_name === '-1' ? '-' : scope.row.oid_name);
    }
    var __VLS_53;
    const __VLS_54 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        prop: "word",
        label: (__VLS_ctx.$t('audit.operation_status')),
        width: "100",
    }));
    const __VLS_56 = __VLS_55({
        prop: "word",
        label: (__VLS_ctx.$t('audit.operation_status')),
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_57.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_57.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_58 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
            size: "16",
            ...{ style: {} },
        }));
        const __VLS_60 = __VLS_59({
            size: "16",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        __VLS_61.slots.default;
        if (scope.row.operation_status === 'success') {
            const __VLS_62 = {}.icon_success;
            /** @type {[typeof __VLS_components.Icon_success, typeof __VLS_components.icon_success, typeof __VLS_components.Icon_success, typeof __VLS_components.icon_success, ]} */ ;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({}));
            const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
        }
        if (scope.row.operation_status === 'failed') {
            const __VLS_66 = {}.icon_error;
            /** @type {[typeof __VLS_components.Icon_error, typeof __VLS_components.icon_error, typeof __VLS_components.Icon_error, typeof __VLS_components.icon_error, ]} */ ;
            // @ts-ignore
            const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({}));
            const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
        }
        var __VLS_61;
        (scope.row.operation_status_name);
        if (scope.row.operation_status === 'failed') {
            const __VLS_70 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
                ...{ 'onClick': {} },
                size: "16",
                ...{ style: {} },
            }));
            const __VLS_72 = __VLS_71({
                ...{ 'onClick': {} },
                size: "16",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_71));
            let __VLS_74;
            let __VLS_75;
            let __VLS_76;
            const __VLS_77 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!(scope.row.operation_status === 'failed'))
                        return;
                    __VLS_ctx.onErrorInfoOpen(scope.row.error_message);
                }
            };
            __VLS_73.slots.default;
            const __VLS_78 = {}.icon_issue;
            /** @type {[typeof __VLS_components.Icon_issue, typeof __VLS_components.icon_issue, typeof __VLS_components.Icon_issue, typeof __VLS_components.icon_issue, ]} */ ;
            // @ts-ignore
            const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({}));
            const __VLS_80 = __VLS_79({}, ...__VLS_functionalComponentArgsRest(__VLS_79));
            var __VLS_73;
        }
    }
    var __VLS_57;
    const __VLS_82 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        prop: "word",
        label: (__VLS_ctx.$t('audit.ip_address')),
        width: "140",
    }));
    const __VLS_84 = __VLS_83({
        prop: "word",
        label: (__VLS_ctx.$t('audit.ip_address')),
        width: "140",
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_85.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_85.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.ip_address);
    }
    var __VLS_85;
    const __VLS_86 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        prop: "create_time",
        sortable: true,
        label: (__VLS_ctx.$t('audit.create_time')),
        width: "180",
    }));
    const __VLS_88 = __VLS_87({
        prop: "create_time",
        sortable: true,
        label: (__VLS_ctx.$t('audit.create_time')),
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_89.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_89.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatTimestamp(scope.row.create_time, 'YYYY-MM-DD HH:mm:ss'));
    }
    var __VLS_89;
    {
        const { empty: __VLS_thisSlot } = __VLS_35.slots;
        if (!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                description: (__VLS_ctx.$t('audit.no_log')),
                imgType: "noneWhite",
            }));
            const __VLS_91 = __VLS_90({
                description: (__VLS_ctx.$t('audit.no_log')),
                imgType: "noneWhite",
            }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        }
        if (!!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }));
            const __VLS_94 = __VLS_93({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        }
    }
    var __VLS_35;
}
if (__VLS_ctx.fieldList.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_96 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_104 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_99;
}
const __VLS_105 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    modelValue: (__VLS_ctx.rowInfoDialog),
    title: (__VLS_ctx.$t('audit.failed_info')),
    destroyOnClose: true,
    beforeClose: (__VLS_ctx.onErrorInfoClose),
    direction: "btt",
    size: "80%",
    modalClass: "professional-term_drawer",
}));
const __VLS_107 = __VLS_106({
    modelValue: (__VLS_ctx.rowInfoDialog),
    title: (__VLS_ctx.$t('audit.failed_info')),
    destroyOnClose: true,
    beforeClose: (__VLS_ctx.onErrorInfoClose),
    direction: "btt",
    size: "80%",
    modalClass: "professional-term_drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_108.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
(__VLS_ctx.curErrorInfo);
var __VLS_108;
const __VLS_109 = {}.DrawerMain;
/** @type {[typeof __VLS_components.DrawerMain, typeof __VLS_components.drawerMain, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    ...{ 'onTriggerFilter': {} },
    ref: "drawerMainRef",
    filterOptions: (__VLS_ctx.filterOption),
}));
const __VLS_111 = __VLS_110({
    ...{ 'onTriggerFilter': {} },
    ref: "drawerMainRef",
    filterOptions: (__VLS_ctx.filterOption),
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_113;
let __VLS_114;
let __VLS_115;
const __VLS_116 = {
    onTriggerFilter: (__VLS_ctx.searchCondition)
};
/** @type {typeof __VLS_ctx.drawerMainRef} */ ;
var __VLS_117 = {};
var __VLS_112;
/** @type {__VLS_StyleScopedClasses['professional']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-row']} */ ;
/** @type {__VLS_StyleScopedClasses['no-margin']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-or-schema']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
// @ts-ignore
var __VLS_37 = __VLS_36, __VLS_118 = __VLS_117;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_export_outlined: icon_export_outlined,
            formatTimestamp: formatTimestamp,
            EmptyBackground: EmptyBackground,
            FilterText: FilterText,
            DrawerMain: DrawerMain,
            iconFilter: iconFilter,
            icon_success: icon_success,
            icon_error: icon_error,
            icon_issue: icon_issue,
            multipleSelectionAll: multipleSelectionAll,
            oldKeywords: oldKeywords,
            searchLoading: searchLoading,
            drawerMainRef: drawerMainRef,
            multipleTableRef: multipleTableRef,
            fieldList: fieldList,
            pageInfo: pageInfo,
            curErrorInfo: curErrorInfo,
            state: state,
            exportExcel: exportExcel,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            rowInfoDialog: rowInfoDialog,
            onErrorInfoOpen: onErrorInfoOpen,
            onErrorInfoClose: onErrorInfoClose,
            filterOption: filterOption,
            searchCondition: searchCondition,
            clearFilter: clearFilter,
            drawerMainOpen: drawerMainOpen,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
