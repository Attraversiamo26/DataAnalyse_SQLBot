import { nextTick, onMounted, reactive, ref, unref } from 'vue';
import icon_export_outlined from '@/assets/svg/icon_export_outlined.svg';
import { promptApi } from '@/api/prompt';
import { formatTimestamp } from '@/utils/date';
import { datasourceApi } from '@/api/datasource';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import IconOpeEdit from '@/assets/svg/icon_edit_outlined.svg';
import icon_copy_outlined from '@/assets/embedded/icon_copy_outlined.svg';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash-es';
import { convertFilterText, FilterText } from '@/components/filter-text';
import { DrawerMain } from '@/components/drawer-main';
import iconFilter from '@/assets/svg/icon-filter_outlined.svg';
import Uploader from '@/views/system/excel-upload/Uploader.vue';
const drawerMainRef = ref();
const { t } = useI18n();
const { copy } = useClipboard({ legacy: true });
const multipleSelectionAll = ref([]);
const keywords = ref('');
const oldKeywords = ref('');
const searchLoading = ref(false);
const currentType = ref('GENERATE_SQL');
const options = ref([]);
const selectable = () => {
    return true;
};
const state = reactive({
    conditions: [],
    filterTexts: [],
});
onMounted(() => {
    datasourceApi.list().then((res) => {
        filterOption.value[0].option = [...res];
    });
    search();
});
const dialogFormVisible = ref(false);
const multipleTableRef = ref();
const isIndeterminate = ref(true);
const checkAll = ref(false);
const fieldList = ref([]);
const pageInfo = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
});
const dialogTitle = ref('');
const updateLoading = ref(false);
const defaultForm = {
    id: null,
    type: null,
    prompt: null,
    datasource_ids: [],
    datasource_names: [],
    name: null,
    specific_ds: false,
};
const pageForm = ref(cloneDeep(defaultForm));
const copyCode = () => {
    copy(pageForm.value.prompt)
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
const cancelDelete = () => {
    handleToggleRowSelection(false);
    multipleSelectionAll.value = [];
    checkAll.value = false;
    isIndeterminate.value = false;
};
const getFileName = () => {
    let title = '';
    if (currentType.value === 'GENERATE_SQL') {
        title = t('prompt.ask_sql');
    }
    if (currentType.value === 'ANALYSIS') {
        title = t('prompt.data_analysis');
    }
    if (currentType.value === 'PREDICT_DATA') {
        title = t('prompt.data_prediction');
    }
    return `${title}.xlsx`;
};
const exportExcel = () => {
    let title = '';
    if (currentType.value === 'GENERATE_SQL') {
        title = t('prompt.ask_sql');
    }
    if (currentType.value === 'ANALYSIS') {
        title = t('prompt.data_analysis');
    }
    if (currentType.value === 'PREDICT_DATA') {
        title = t('prompt.data_prediction');
    }
    ElMessageBox.confirm(t('prompt.export_hint', { msg: pageInfo.total, type: title }), {
        confirmButtonType: 'primary',
        confirmButtonText: t('professional.export'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        searchLoading.value = true;
        promptApi
            .export2Excel(currentType.value, keywords.value ? { name: keywords.value } : {})
            .then((res) => {
            const blob = new Blob([res], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${title}.xlsx`;
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
const deleteBatchUser = () => {
    ElMessageBox.confirm(t('prompt.selected_prompt_words', { msg: multipleSelectionAll.value.length }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        promptApi.deleteEmbedded(multipleSelectionAll.value.map((ele) => ele.id)).then(() => {
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
    ElMessageBox.confirm(t('prompt.prompt_word_name_de', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        promptApi.deleteEmbedded([row.id]).then(() => {
            multipleSelectionAll.value = multipleSelectionAll.value.filter((ele) => row.id !== ele.id);
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
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
    oldKeywords.value = keywords.value;
    promptApi
        .getList(pageInfo.currentPage, pageInfo.pageSize, currentType.value, configParams())
        .then((res) => {
        toggleRowLoading.value = true;
        fieldList.value = res.data;
        pageInfo.total = res.total_count;
        searchLoading.value = false;
        nextTick(() => {
            handleToggleRowSelection();
        });
    })
        .finally(() => {
        searchLoading.value = false;
    });
};
const termFormRef = ref();
const validatePass = (_, value, callback) => {
    if (pageForm.value.specific_ds && !value.length) {
        callback(new Error(t('datasource.Please_select') + t('common.empty') + t('ds.title')));
    }
    else {
        callback();
    }
};
const rules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('prompt.prompt_word_name'),
        },
    ],
    datasource_ids: [
        {
            validator: validatePass,
            trigger: 'blur',
        },
    ],
    prompt: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('prompt.replaced_with'),
        },
    ],
};
const list = () => {
    datasourceApi.list().then((res) => {
        options.value = res || [];
    });
};
const saveHandler = () => {
    termFormRef.value.validate((res) => {
        if (res) {
            const obj = unref(pageForm);
            if (!obj.id) {
                delete obj.id;
            }
            updateLoading.value = true;
            promptApi
                .updateEmbedded(obj)
                .then(() => {
                ElMessage({
                    type: 'success',
                    message: t('common.save_success'),
                });
                search();
                onFormClose();
            })
                .finally(() => {
                updateLoading.value = false;
            });
        }
    });
};
const editHandler = (row) => {
    pageForm.value.id = null;
    pageForm.value.type = unref(currentType);
    if (row) {
        pageForm.value = cloneDeep(row);
    }
    list();
    dialogTitle.value = row?.id ? t('prompt.edit_prompt_word') : t('prompt.add_prompt_word');
    dialogFormVisible.value = true;
};
const onFormClose = () => {
    pageForm.value = cloneDeep(defaultForm);
    dialogFormVisible.value = false;
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
const handleRowClick = (row) => {
    pageForm.value = cloneDeep(row);
    rowInfoDialog.value = true;
};
const onRowFormClose = () => {
    pageForm.value = cloneDeep(defaultForm);
    rowInfoDialog.value = false;
};
const handleChange = () => {
    termFormRef.value.validateField('datasource_ids');
};
const typeChange = (val) => {
    currentType.value = val;
    pageInfo.currentPage = 0;
    search();
};
const configParams = () => {
    let str = '';
    if (keywords.value) {
        str += `name=${keywords.value}`;
    }
    state.conditions.forEach((ele) => {
        ele.value.forEach((itx) => {
            str += str ? `_${itx}` : `${ele.field}=${itx}`;
        });
    });
    if (str.length) {
        str = `?${str}`;
    }
    return str;
};
const filterOption = ref([
    {
        type: 'select',
        option: [],
        field: 'dslist',
        title: t('ds.title'),
        operate: 'in',
        property: { placeholder: t('common.empty') + t('ds.title') },
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['not-allow']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "prompt" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "btn-select" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.currentType === 'GENERATE_SQL' && 'is-active']) },
    text: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.currentType === 'GENERATE_SQL' && 'is-active']) },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.typeChange('GENERATE_SQL');
    }
};
__VLS_3.slots.default;
(__VLS_ctx.$t('prompt.ask_sql'));
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.currentType === 'ANALYSIS' && 'is-active']) },
    text: true,
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.currentType === 'ANALYSIS' && 'is-active']) },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.typeChange('ANALYSIS');
    }
};
__VLS_11.slots.default;
(__VLS_ctx.$t('prompt.data_analysis'));
var __VLS_11;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.currentType === 'PREDICT_DATA' && 'is-active']) },
    text: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.currentType === 'PREDICT_DATA' && 'is-active']) },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.typeChange('PREDICT_DATA');
    }
};
__VLS_19.slots.default;
(__VLS_ctx.$t('prompt.data_prediction'));
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-row" },
});
const __VLS_24 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('dashboard.search')),
    clearable: true,
}));
const __VLS_26 = __VLS_25({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('dashboard.search')),
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onKeydown: (__VLS_ctx.search)
};
__VLS_27.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_32 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    var __VLS_35;
}
var __VLS_27;
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (__VLS_ctx.exportExcel)
};
__VLS_43.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_43.slots;
    const __VLS_48 = {}.icon_export_outlined;
    /** @type {[typeof __VLS_components.Icon_export_outlined, typeof __VLS_components.icon_export_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
    const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
(__VLS_ctx.$t('professional.export_all'));
var __VLS_43;
/** @type {[typeof Uploader, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(Uploader, new Uploader({
    ...{ 'onUploadFinished': {} },
    uploadPath: (`/system/custom_prompt/${__VLS_ctx.currentType}/uploadExcel`),
    templatePath: (`/system/custom_prompt/template`),
    templateName: (__VLS_ctx.getFileName()),
}));
const __VLS_53 = __VLS_52({
    ...{ 'onUploadFinished': {} },
    uploadPath: (`/system/custom_prompt/${__VLS_ctx.currentType}/uploadExcel`),
    templatePath: (`/system/custom_prompt/template`),
    templateName: (__VLS_ctx.getFileName()),
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
let __VLS_55;
let __VLS_56;
let __VLS_57;
const __VLS_58 = {
    onUploadFinished: (__VLS_ctx.search)
};
var __VLS_54;
const __VLS_59 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    secondary: true,
}));
const __VLS_61 = __VLS_60({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
let __VLS_63;
let __VLS_64;
let __VLS_65;
const __VLS_66 = {
    onClick: (__VLS_ctx.drawerMainOpen)
};
__VLS_62.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_62.slots;
    const __VLS_67 = {}.iconFilter;
    /** @type {[typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({}));
    const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
}
(__VLS_ctx.$t('user.filter'));
var __VLS_62;
const __VLS_71 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    type: "primary",
}));
const __VLS_73 = __VLS_72({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_75;
let __VLS_76;
let __VLS_77;
const __VLS_78 = {
    onClick: (...[$event]) => {
        __VLS_ctx.editHandler(null);
    }
};
__VLS_74.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_74.slots;
    const __VLS_79 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({}));
    const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
}
(__VLS_ctx.$t('prompt.add_prompt_word'));
var __VLS_74;
if (!__VLS_ctx.searchLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
        ...{ class: (__VLS_ctx.multipleSelectionAll?.length > 0 && 'show-pagination_height') },
    });
    const __VLS_83 = {}.FilterText;
    /** @type {[typeof __VLS_components.FilterText, typeof __VLS_components.filterText, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        ...{ 'onClearFilter': {} },
        total: (__VLS_ctx.pageInfo.total),
        filterTexts: (__VLS_ctx.state.filterTexts),
    }));
    const __VLS_85 = __VLS_84({
        ...{ 'onClearFilter': {} },
        total: (__VLS_ctx.pageInfo.total),
        filterTexts: (__VLS_ctx.state.filterTexts),
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    let __VLS_87;
    let __VLS_88;
    let __VLS_89;
    const __VLS_90 = {
        onClearFilter: (__VLS_ctx.clearFilter)
    };
    var __VLS_86;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-or-schema" },
    });
    const __VLS_91 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        ...{ 'onRowClick': {} },
        ...{ 'onSelectionChange': {} },
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }));
    const __VLS_93 = __VLS_92({
        ...{ 'onRowClick': {} },
        ...{ 'onSelectionChange': {} },
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    let __VLS_95;
    let __VLS_96;
    let __VLS_97;
    const __VLS_98 = {
        onRowClick: (__VLS_ctx.handleRowClick)
    };
    const __VLS_99 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    /** @type {typeof __VLS_ctx.multipleTableRef} */ ;
    var __VLS_100 = {};
    __VLS_94.slots.default;
    const __VLS_102 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
        selectable: (__VLS_ctx.selectable),
        type: "selection",
        width: "55",
    }));
    const __VLS_104 = __VLS_103({
        selectable: (__VLS_ctx.selectable),
        type: "selection",
        width: "55",
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    const __VLS_106 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
        prop: "name",
        label: (__VLS_ctx.$t('prompt.prompt_word_name')),
        width: "280",
    }));
    const __VLS_108 = __VLS_107({
        prop: "name",
        label: (__VLS_ctx.$t('prompt.prompt_word_name')),
        width: "280",
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_110 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        prop: "prompt",
        label: (__VLS_ctx.$t('prompt.prompt_word_content')),
        minWidth: "240",
    }));
    const __VLS_112 = __VLS_111({
        prop: "prompt",
        label: (__VLS_ctx.$t('prompt.prompt_word_content')),
        minWidth: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    __VLS_113.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_113.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-comment_d" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            title: (scope.row.prompt),
            ...{ class: "notes-in_table" },
        });
        (scope.row.prompt);
    }
    var __VLS_113;
    const __VLS_114 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
        label: (__VLS_ctx.$t('training.effective_data_sources')),
        minWidth: "240",
    }));
    const __VLS_116 = __VLS_115({
        label: (__VLS_ctx.$t('training.effective_data_sources')),
        minWidth: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    __VLS_117.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_117.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        if (scope.row.specific_ds) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "field-comment_d" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                title: (scope.row.datasource_names),
                ...{ class: "notes-in_table" },
            });
            (scope.row.datasource_names.join(','));
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            (__VLS_ctx.t('training.all_data_sources'));
        }
    }
    var __VLS_117;
    const __VLS_118 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
        prop: "create_time",
        sortable: true,
        label: (__VLS_ctx.$t('dashboard.create_time')),
        width: "240",
    }));
    const __VLS_120 = __VLS_119({
        prop: "create_time",
        sortable: true,
        label: (__VLS_ctx.$t('dashboard.create_time')),
        width: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    __VLS_121.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_121.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatTimestamp(scope.row.create_time, 'YYYY-MM-DD HH:mm:ss'));
    }
    var __VLS_121;
    const __VLS_122 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
        fixed: "right",
        width: "80",
        label: (__VLS_ctx.t('ds.actions')),
    }));
    const __VLS_124 = __VLS_123({
        fixed: "right",
        width: "80",
        label: (__VLS_ctx.t('ds.actions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    __VLS_125.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_125.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-comment" },
        });
        const __VLS_126 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('datasource.edit')),
            placement: "top",
        }));
        const __VLS_128 = __VLS_127({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('datasource.edit')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        __VLS_129.slots.default;
        const __VLS_130 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }));
        const __VLS_132 = __VLS_131({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        let __VLS_134;
        let __VLS_135;
        let __VLS_136;
        const __VLS_137 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.searchLoading))
                    return;
                __VLS_ctx.editHandler(scope.row);
            }
        };
        __VLS_133.slots.default;
        const __VLS_138 = {}.IconOpeEdit;
        /** @type {[typeof __VLS_components.IconOpeEdit, typeof __VLS_components.IconOpeEdit, ]} */ ;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({}));
        const __VLS_140 = __VLS_139({}, ...__VLS_functionalComponentArgsRest(__VLS_139));
        var __VLS_133;
        var __VLS_129;
        const __VLS_142 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('dashboard.delete')),
            placement: "top",
        }));
        const __VLS_144 = __VLS_143({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('dashboard.delete')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_143));
        __VLS_145.slots.default;
        const __VLS_146 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }));
        const __VLS_148 = __VLS_147({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_147));
        let __VLS_150;
        let __VLS_151;
        let __VLS_152;
        const __VLS_153 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.searchLoading))
                    return;
                __VLS_ctx.deleteHandler(scope.row);
            }
        };
        __VLS_149.slots.default;
        const __VLS_154 = {}.IconOpeDelete;
        /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
        // @ts-ignore
        const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({}));
        const __VLS_156 = __VLS_155({}, ...__VLS_functionalComponentArgsRest(__VLS_155));
        var __VLS_149;
        var __VLS_145;
    }
    var __VLS_125;
    {
        const { empty: __VLS_thisSlot } = __VLS_94.slots;
        if (!!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_158 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }));
            const __VLS_159 = __VLS_158({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }, ...__VLS_functionalComponentArgsRest(__VLS_158));
        }
        if (!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_161 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                ...{ class: "datasource-yet" },
                description: (__VLS_ctx.$t('prompt.no_prompt_words')),
                imgType: "noneWhite",
            }));
            const __VLS_162 = __VLS_161({
                ...{ class: "datasource-yet" },
                description: (__VLS_ctx.$t('prompt.no_prompt_words')),
                imgType: "noneWhite",
            }, ...__VLS_functionalComponentArgsRest(__VLS_161));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            const __VLS_164 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_166 = __VLS_165({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_165));
            let __VLS_168;
            let __VLS_169;
            let __VLS_170;
            const __VLS_171 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.editHandler(null);
                }
            };
            __VLS_167.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_167.slots;
                const __VLS_172 = {}.icon_add_outlined;
                /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
                // @ts-ignore
                const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({}));
                const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
            }
            (__VLS_ctx.$t('prompt.add_prompt_word'));
            var __VLS_167;
        }
    }
    var __VLS_94;
}
if (__VLS_ctx.fieldList.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_176 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }));
    const __VLS_178 = __VLS_177({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    let __VLS_180;
    let __VLS_181;
    let __VLS_182;
    const __VLS_183 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_184 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_179;
}
if (__VLS_ctx.multipleSelectionAll.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-select" },
    });
    const __VLS_185 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }));
    const __VLS_187 = __VLS_186({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    let __VLS_189;
    let __VLS_190;
    let __VLS_191;
    const __VLS_192 = {
        onChange: (__VLS_ctx.handleCheckAllChange)
    };
    __VLS_188.slots.default;
    (__VLS_ctx.$t('datasource.select_all'));
    var __VLS_188;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.deleteBatchUser) },
        ...{ class: "danger-button" },
    });
    (__VLS_ctx.$t('dashboard.delete'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected" },
    });
    (__VLS_ctx.$t('user.selected_2_items', { msg: __VLS_ctx.multipleSelectionAll.length }));
    const __VLS_193 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_195 = __VLS_194({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_194));
    let __VLS_197;
    let __VLS_198;
    let __VLS_199;
    const __VLS_200 = {
        onClick: (__VLS_ctx.cancelDelete)
    };
    __VLS_196.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_196;
}
const __VLS_201 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
    modalClass: "prompt-add_drawer",
}));
const __VLS_203 = __VLS_202({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
    modalClass: "prompt-add_drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
__VLS_204.slots.default;
const __VLS_205 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}));
const __VLS_207 = __VLS_206({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
let __VLS_209;
let __VLS_210;
let __VLS_211;
const __VLS_212 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.termFormRef} */ ;
var __VLS_213 = {};
__VLS_208.slots.default;
const __VLS_215 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
    prop: "name",
    label: (__VLS_ctx.t('prompt.prompt_word_name')),
}));
const __VLS_217 = __VLS_216({
    prop: "name",
    label: (__VLS_ctx.t('prompt.prompt_word_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_216));
__VLS_218.slots.default;
const __VLS_219 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
    modelValue: (__VLS_ctx.pageForm.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('prompt.prompt_word_name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}));
const __VLS_221 = __VLS_220({
    modelValue: (__VLS_ctx.pageForm.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('prompt.prompt_word_name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_220));
var __VLS_218;
const __VLS_223 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
    prop: "prompt",
    label: (__VLS_ctx.t('prompt.prompt_word_content')),
}));
const __VLS_225 = __VLS_224({
    prop: "prompt",
    label: (__VLS_ctx.t('prompt.prompt_word_content')),
}, ...__VLS_functionalComponentArgsRest(__VLS_224));
__VLS_226.slots.default;
const __VLS_227 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({
    modelValue: (__VLS_ctx.pageForm.prompt),
    placeholder: (__VLS_ctx.$t('prompt.replaced_with')),
    autosize: ({ minRows: 3.636, maxRows: 11.09 }),
    type: "textarea",
}));
const __VLS_229 = __VLS_228({
    modelValue: (__VLS_ctx.pageForm.prompt),
    placeholder: (__VLS_ctx.$t('prompt.replaced_with')),
    autosize: ({ minRows: 3.636, maxRows: 11.09 }),
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tips" },
});
(__VLS_ctx.t('prompt.loss_exercise_caution'));
var __VLS_226;
const __VLS_231 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({
    ...{ class: "is-required" },
    ...{ class: (!__VLS_ctx.pageForm.specific_ds && 'no-error') },
    prop: "datasource_ids",
    label: (__VLS_ctx.t('training.effective_data_sources')),
}));
const __VLS_233 = __VLS_232({
    ...{ class: "is-required" },
    ...{ class: (!__VLS_ctx.pageForm.specific_ds && 'no-error') },
    prop: "datasource_ids",
    label: (__VLS_ctx.t('training.effective_data_sources')),
}, ...__VLS_functionalComponentArgsRest(__VLS_232));
__VLS_234.slots.default;
const __VLS_235 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
    modelValue: (__VLS_ctx.pageForm.specific_ds),
}));
const __VLS_237 = __VLS_236({
    modelValue: (__VLS_ctx.pageForm.specific_ds),
}, ...__VLS_functionalComponentArgsRest(__VLS_236));
__VLS_238.slots.default;
const __VLS_239 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
    value: (false),
}));
const __VLS_241 = __VLS_240({
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_240));
__VLS_242.slots.default;
(__VLS_ctx.$t('training.all_data_sources'));
var __VLS_242;
const __VLS_243 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
    value: (true),
}));
const __VLS_245 = __VLS_244({
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_244));
__VLS_246.slots.default;
(__VLS_ctx.$t('training.partial_data_sources'));
var __VLS_246;
var __VLS_238;
if (__VLS_ctx.pageForm.specific_ds) {
    const __VLS_247 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.pageForm.datasource_ids),
        multiple: true,
        filterable: true,
        placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('ds.title')),
        ...{ style: {} },
    }));
    const __VLS_249 = __VLS_248({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.pageForm.datasource_ids),
        multiple: true,
        filterable: true,
        placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('ds.title')),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    let __VLS_251;
    let __VLS_252;
    let __VLS_253;
    const __VLS_254 = {
        onChange: (__VLS_ctx.handleChange)
    };
    __VLS_250.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.options))) {
        const __VLS_255 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
            key: (item.id),
            label: (item.name),
            value: (item.id),
        }));
        const __VLS_257 = __VLS_256({
            key: (item.id),
            label: (item.name),
            value: (item.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_256));
    }
    var __VLS_250;
}
var __VLS_234;
var __VLS_208;
{
    const { footer: __VLS_thisSlot } = __VLS_204.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.updateLoading) }, null, null);
    const __VLS_259 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_261 = __VLS_260({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_260));
    let __VLS_263;
    let __VLS_264;
    let __VLS_265;
    const __VLS_266 = {
        onClick: (__VLS_ctx.onFormClose)
    };
    __VLS_262.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_262;
    const __VLS_267 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_269 = __VLS_268({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_268));
    let __VLS_271;
    let __VLS_272;
    let __VLS_273;
    const __VLS_274 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_270.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_270;
}
var __VLS_204;
const __VLS_275 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({
    modelValue: (__VLS_ctx.rowInfoDialog),
    title: (__VLS_ctx.$t('menu.Details')),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onRowFormClose),
    modalClass: "prompt-term_drawer",
}));
const __VLS_277 = __VLS_276({
    modelValue: (__VLS_ctx.rowInfoDialog),
    title: (__VLS_ctx.$t('menu.Details')),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onRowFormClose),
    modalClass: "prompt-term_drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_276));
__VLS_278.slots.default;
const __VLS_279 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
    ...{ 'onSubmit': {} },
    labelWidth: "180px",
    labelPosition: "top",
    ...{ class: "form-content_error" },
}));
const __VLS_281 = __VLS_280({
    ...{ 'onSubmit': {} },
    labelWidth: "180px",
    labelPosition: "top",
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_280));
let __VLS_283;
let __VLS_284;
let __VLS_285;
const __VLS_286 = {
    onSubmit: () => { }
};
__VLS_282.slots.default;
const __VLS_287 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
    label: (__VLS_ctx.t('prompt.prompt_word_name')),
}));
const __VLS_289 = __VLS_288({
    label: (__VLS_ctx.t('prompt.prompt_word_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_288));
__VLS_290.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.name);
var __VLS_290;
const __VLS_291 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
    label: (__VLS_ctx.t('prompt.prompt_word_content')),
}));
const __VLS_293 = __VLS_292({
    label: (__VLS_ctx.t('prompt.prompt_word_content')),
}, ...__VLS_functionalComponentArgsRest(__VLS_292));
__VLS_294.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.prompt);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "copy-icon" },
});
const __VLS_295 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.t('datasource.copy')),
    placement: "top",
}));
const __VLS_297 = __VLS_296({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.t('datasource.copy')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_296));
__VLS_298.slots.default;
const __VLS_299 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
    ...{ 'onClick': {} },
    ...{ class: "hover-icon_with_bg" },
    ...{ style: {} },
    size: "16",
}));
const __VLS_301 = __VLS_300({
    ...{ 'onClick': {} },
    ...{ class: "hover-icon_with_bg" },
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_300));
let __VLS_303;
let __VLS_304;
let __VLS_305;
const __VLS_306 = {
    onClick: (__VLS_ctx.copyCode)
};
__VLS_302.slots.default;
const __VLS_307 = {}.icon_copy_outlined;
/** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
// @ts-ignore
const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({}));
const __VLS_309 = __VLS_308({}, ...__VLS_functionalComponentArgsRest(__VLS_308));
var __VLS_302;
var __VLS_298;
var __VLS_294;
const __VLS_311 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({
    label: (__VLS_ctx.t('ds.title')),
}));
const __VLS_313 = __VLS_312({
    label: (__VLS_ctx.t('ds.title')),
}, ...__VLS_functionalComponentArgsRest(__VLS_312));
__VLS_314.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.datasource_names.length && __VLS_ctx.pageForm.specific_ds
    ? __VLS_ctx.pageForm.datasource_names.join()
    : __VLS_ctx.t('training.all_data_sources'));
var __VLS_314;
var __VLS_282;
var __VLS_278;
const __VLS_315 = {}.DrawerMain;
/** @type {[typeof __VLS_components.DrawerMain, typeof __VLS_components.drawerMain, ]} */ ;
// @ts-ignore
const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({
    ...{ 'onTriggerFilter': {} },
    ref: "drawerMainRef",
    filterOptions: (__VLS_ctx.filterOption),
}));
const __VLS_317 = __VLS_316({
    ...{ 'onTriggerFilter': {} },
    ref: "drawerMainRef",
    filterOptions: (__VLS_ctx.filterOption),
}, ...__VLS_functionalComponentArgsRest(__VLS_316));
let __VLS_319;
let __VLS_320;
let __VLS_321;
const __VLS_322 = {
    onTriggerFilter: (__VLS_ctx.searchCondition)
};
/** @type {typeof __VLS_ctx.drawerMainRef} */ ;
var __VLS_323 = {};
var __VLS_318;
/** @type {__VLS_StyleScopedClasses['prompt']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-select']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-row']} */ ;
/** @type {__VLS_StyleScopedClasses['no-margin']} */ ;
/** @type {__VLS_StyleScopedClasses['no-margin']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-or-schema']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment_d']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-in_table']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment_d']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-in_table']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-yet']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-button']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['tips']} */ ;
/** @type {__VLS_StyleScopedClasses['is-required']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
// @ts-ignore
var __VLS_101 = __VLS_100, __VLS_214 = __VLS_213, __VLS_324 = __VLS_323;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_export_outlined: icon_export_outlined,
            formatTimestamp: formatTimestamp,
            icon_add_outlined: icon_add_outlined,
            IconOpeEdit: IconOpeEdit,
            icon_copy_outlined: icon_copy_outlined,
            IconOpeDelete: IconOpeDelete,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            EmptyBackground: EmptyBackground,
            FilterText: FilterText,
            DrawerMain: DrawerMain,
            iconFilter: iconFilter,
            Uploader: Uploader,
            drawerMainRef: drawerMainRef,
            t: t,
            multipleSelectionAll: multipleSelectionAll,
            keywords: keywords,
            oldKeywords: oldKeywords,
            searchLoading: searchLoading,
            currentType: currentType,
            options: options,
            selectable: selectable,
            state: state,
            dialogFormVisible: dialogFormVisible,
            multipleTableRef: multipleTableRef,
            isIndeterminate: isIndeterminate,
            checkAll: checkAll,
            fieldList: fieldList,
            pageInfo: pageInfo,
            dialogTitle: dialogTitle,
            updateLoading: updateLoading,
            pageForm: pageForm,
            copyCode: copyCode,
            cancelDelete: cancelDelete,
            getFileName: getFileName,
            exportExcel: exportExcel,
            deleteBatchUser: deleteBatchUser,
            deleteHandler: deleteHandler,
            handleSelectionChange: handleSelectionChange,
            handleCheckAllChange: handleCheckAllChange,
            search: search,
            termFormRef: termFormRef,
            rules: rules,
            saveHandler: saveHandler,
            editHandler: editHandler,
            onFormClose: onFormClose,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            rowInfoDialog: rowInfoDialog,
            handleRowClick: handleRowClick,
            onRowFormClose: onRowFormClose,
            handleChange: handleChange,
            typeChange: typeChange,
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
