import { nextTick, onMounted, reactive, ref, unref } from 'vue';
import icon_export_outlined from '@/assets/svg/icon_export_outlined.svg';
import { professionalApi } from '@/api/professional';
import { formatTimestamp } from '@/utils/date';
import { datasourceApi } from '@/api/datasource';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import IconOpeEdit from '@/assets/svg/icon_edit_outlined.svg';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash-es';
import { convertFilterText, FilterText } from '@/components/filter-text';
import { DrawerMain } from '@/components/drawer-main';
import iconFilter from '@/assets/svg/icon-filter_outlined.svg';
import Uploader from '@/views/system/excel-upload/Uploader.vue';
const { t } = useI18n();
const multipleSelectionAll = ref([]);
const allDsList = ref([]);
const keywords = ref('');
const oldKeywords = ref('');
const searchLoading = ref(false);
const drawerMainRef = ref();
const selectable = () => {
    return true;
};
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
const state = reactive({
    conditions: [],
    filterTexts: [],
});
const dialogTitle = ref('');
const updateLoading = ref(false);
const defaultForm = {
    id: null,
    word: null,
    description: null,
    specific_ds: false,
    datasource_ids: [],
    other_words: [''],
    datasource_names: [],
};
const pageForm = ref(cloneDeep(defaultForm));
const cancelDelete = () => {
    handleToggleRowSelection(false);
    multipleSelectionAll.value = [];
    checkAll.value = false;
    isIndeterminate.value = false;
};
const exportExcel = () => {
    ElMessageBox.confirm(t('professional.export_hint', { msg: pageInfo.total }), {
        confirmButtonType: 'primary',
        confirmButtonText: t('professional.export'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        searchLoading.value = true;
        professionalApi
            .export2Excel(keywords.value ? { word: keywords.value } : {})
            .then((res) => {
            const blob = new Blob([res], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${t('professional.professional_terminology')}.xlsx`;
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
const deleteBatch = () => {
    ElMessageBox.confirm(t('professional.selected_2_terms', { msg: multipleSelectionAll.value.length }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        professionalApi.deleteEmbedded(multipleSelectionAll.value.map((ele) => ele.id)).then(() => {
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
    ElMessageBox.confirm(t('professional.the_term_gmv', { msg: row.word }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        professionalApi.deleteEmbedded([row.id]).then(() => {
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
const configParams = () => {
    let str = '';
    if (keywords.value) {
        str += `word=${keywords.value}`;
    }
    state.conditions.forEach((ele) => {
        ele.value.forEach((itx) => {
            str += str ? `&${ele.field}=${itx}` : `${ele.field}=${itx}`;
        });
    });
    if (str.length) {
        str = `?${str}`;
    }
    return str;
};
const search = ($event = {}) => {
    if ($event?.isComposing) {
        return;
    }
    searchLoading.value = true;
    oldKeywords.value = keywords.value;
    professionalApi
        .getList(pageInfo.currentPage, pageInfo.pageSize, configParams())
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
    word: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('professional.term_name'),
        },
    ],
    description: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('professional.term_description'),
        },
    ],
    datasource_ids: [
        {
            validator: validatePass,
            trigger: 'blur',
        },
    ],
};
const handleChange = () => {
    termFormRef.value.validateField('datasource_ids');
};
const saveHandler = () => {
    termFormRef.value.validate((res) => {
        if (res) {
            const arr = [...pageForm.value.other_words.filter((ele) => !!ele), pageForm.value.word];
            if (arr.length !== new Set(arr).size) {
                return ElMessage.error(t('professional.cannot_be_repeated'));
            }
            const obj = unref(pageForm);
            if (!obj.id) {
                delete obj.id;
            }
            updateLoading.value = true;
            professionalApi
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
const list = () => {
    datasourceApi.list().then((res) => {
        allDsList.value = res;
    });
};
const editHandler = (row) => {
    pageForm.value.id = null;
    if (row) {
        pageForm.value = cloneDeep(row);
        if (!pageForm.value.other_words.length) {
            pageForm.value.other_words = [''];
        }
    }
    dialogTitle.value = row?.id
        ? t('professional.editing_terminology')
        : t('professional.create_new_term');
    dialogFormVisible.value = true;
    list();
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
const deleteHandlerItem = (idx) => {
    pageForm.value.other_words = pageForm.value.other_words.filter((_, index) => index !== idx);
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
const changeStatus = (id, val) => {
    professionalApi
        .enable(id, val + '')
        .then(() => {
        ElMessage({
            message: t('common.save_success'),
            type: 'success',
        });
    })
        .finally(() => {
        search();
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
(__VLS_ctx.$t('professional.professional_terminology'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-row" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('professional.search_term')),
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('professional.search_term')),
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
    onClick: (__VLS_ctx.exportExcel)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.icon_export_outlined;
    /** @type {[typeof __VLS_components.Icon_export_outlined, typeof __VLS_components.icon_export_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
(__VLS_ctx.$t('professional.export_all'));
var __VLS_19;
/** @type {[typeof Uploader, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(Uploader, new Uploader({
    ...{ 'onUploadFinished': {} },
    uploadPath: "/system/terminology/uploadExcel",
    templatePath: "/system/terminology/template",
    templateName: (`${__VLS_ctx.t('professional.professional_terminology')}.xlsx`),
}));
const __VLS_29 = __VLS_28({
    ...{ 'onUploadFinished': {} },
    uploadPath: "/system/terminology/uploadExcel",
    templatePath: "/system/terminology/template",
    templateName: (`${__VLS_ctx.t('professional.professional_terminology')}.xlsx`),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
let __VLS_31;
let __VLS_32;
let __VLS_33;
const __VLS_34 = {
    onUploadFinished: (__VLS_ctx.search)
};
var __VLS_30;
const __VLS_35 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    secondary: true,
}));
const __VLS_37 = __VLS_36({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_39;
let __VLS_40;
let __VLS_41;
const __VLS_42 = {
    onClick: (__VLS_ctx.drawerMainOpen)
};
__VLS_38.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_38.slots;
    const __VLS_43 = {}.iconFilter;
    /** @type {[typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({}));
    const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
}
(__VLS_ctx.$t('user.filter'));
var __VLS_38;
const __VLS_47 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    type: "primary",
}));
const __VLS_49 = __VLS_48({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
let __VLS_51;
let __VLS_52;
let __VLS_53;
const __VLS_54 = {
    onClick: (...[$event]) => {
        __VLS_ctx.editHandler(null);
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
(__VLS_ctx.$t('professional.create_new_term'));
var __VLS_50;
if (!__VLS_ctx.searchLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
        ...{ class: (__VLS_ctx.multipleSelectionAll?.length > 0 && 'show-pagination_height') },
    });
    const __VLS_59 = {}.FilterText;
    /** @type {[typeof __VLS_components.FilterText, typeof __VLS_components.filterText, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        ...{ 'onClearFilter': {} },
        total: (__VLS_ctx.pageInfo.total),
        filterTexts: (__VLS_ctx.state.filterTexts),
    }));
    const __VLS_61 = __VLS_60({
        ...{ 'onClearFilter': {} },
        total: (__VLS_ctx.pageInfo.total),
        filterTexts: (__VLS_ctx.state.filterTexts),
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    let __VLS_63;
    let __VLS_64;
    let __VLS_65;
    const __VLS_66 = {
        onClearFilter: (__VLS_ctx.clearFilter)
    };
    var __VLS_62;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-or-schema" },
    });
    const __VLS_67 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        ...{ 'onRowClick': {} },
        ...{ 'onSelectionChange': {} },
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }));
    const __VLS_69 = __VLS_68({
        ...{ 'onRowClick': {} },
        ...{ 'onSelectionChange': {} },
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_71;
    let __VLS_72;
    let __VLS_73;
    const __VLS_74 = {
        onRowClick: (__VLS_ctx.handleRowClick)
    };
    const __VLS_75 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    /** @type {typeof __VLS_ctx.multipleTableRef} */ ;
    var __VLS_76 = {};
    __VLS_70.slots.default;
    const __VLS_78 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        selectable: (__VLS_ctx.selectable),
        type: "selection",
        width: "55",
    }));
    const __VLS_80 = __VLS_79({
        selectable: (__VLS_ctx.selectable),
        type: "selection",
        width: "55",
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    const __VLS_82 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        prop: "word",
        label: (__VLS_ctx.$t('professional.term_name')),
        width: "280",
    }));
    const __VLS_84 = __VLS_83({
        prop: "word",
        label: (__VLS_ctx.$t('professional.term_name')),
        width: "280",
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_85.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_85.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.word);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (scope.row.other_words.filter((ele) => !!ele).length
            ? `(${scope.row.other_words.join(',')})`
            : '');
    }
    var __VLS_85;
    const __VLS_86 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        label: (__VLS_ctx.$t('professional.term_description')),
        minWidth: "240",
    }));
    const __VLS_88 = __VLS_87({
        label: (__VLS_ctx.$t('professional.term_description')),
        minWidth: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_89.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_89.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-comment_d" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            title: (scope.row.description),
            ...{ class: "notes-in_table" },
        });
        (scope.row.description);
    }
    var __VLS_89;
    const __VLS_90 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        label: (__VLS_ctx.$t('training.effective_data_sources')),
        minWidth: "240",
    }));
    const __VLS_92 = __VLS_91({
        label: (__VLS_ctx.$t('training.effective_data_sources')),
        minWidth: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_93.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_93.slots;
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
    var __VLS_93;
    const __VLS_94 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        label: (__VLS_ctx.t('ds.status')),
        width: "180",
    }));
    const __VLS_96 = __VLS_95({
        label: (__VLS_ctx.t('ds.status')),
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_97.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_97.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: () => { } },
            ...{ style: {} },
        });
        const __VLS_98 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
            ...{ 'onChange': {} },
            modelValue: (scope.row.enabled),
            size: "small",
        }));
        const __VLS_100 = __VLS_99({
            ...{ 'onChange': {} },
            modelValue: (scope.row.enabled),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        let __VLS_102;
        let __VLS_103;
        let __VLS_104;
        const __VLS_105 = {
            onChange: ((val) => __VLS_ctx.changeStatus(scope.row.id, val))
        };
        var __VLS_101;
    }
    var __VLS_97;
    const __VLS_106 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
        prop: "create_time",
        sortable: true,
        label: (__VLS_ctx.$t('dashboard.create_time')),
        width: "240",
    }));
    const __VLS_108 = __VLS_107({
        prop: "create_time",
        sortable: true,
        label: (__VLS_ctx.$t('dashboard.create_time')),
        width: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    __VLS_109.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_109.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatTimestamp(scope.row.create_time, 'YYYY-MM-DD HH:mm:ss'));
    }
    var __VLS_109;
    const __VLS_110 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        fixed: "right",
        width: "80",
        label: (__VLS_ctx.t('ds.actions')),
    }));
    const __VLS_112 = __VLS_111({
        fixed: "right",
        width: "80",
        label: (__VLS_ctx.t('ds.actions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    __VLS_113.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_113.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-comment" },
        });
        const __VLS_114 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('datasource.edit')),
            placement: "top",
        }));
        const __VLS_116 = __VLS_115({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('datasource.edit')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        __VLS_117.slots.default;
        const __VLS_118 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }));
        const __VLS_120 = __VLS_119({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        let __VLS_122;
        let __VLS_123;
        let __VLS_124;
        const __VLS_125 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.searchLoading))
                    return;
                __VLS_ctx.editHandler(scope.row);
            }
        };
        __VLS_121.slots.default;
        const __VLS_126 = {}.IconOpeEdit;
        /** @type {[typeof __VLS_components.IconOpeEdit, typeof __VLS_components.IconOpeEdit, ]} */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({}));
        const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
        var __VLS_121;
        var __VLS_117;
        const __VLS_130 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('dashboard.delete')),
            placement: "top",
        }));
        const __VLS_132 = __VLS_131({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('dashboard.delete')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        __VLS_133.slots.default;
        const __VLS_134 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }));
        const __VLS_136 = __VLS_135({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_135));
        let __VLS_138;
        let __VLS_139;
        let __VLS_140;
        const __VLS_141 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.searchLoading))
                    return;
                __VLS_ctx.deleteHandler(scope.row);
            }
        };
        __VLS_137.slots.default;
        const __VLS_142 = {}.IconOpeDelete;
        /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({}));
        const __VLS_144 = __VLS_143({}, ...__VLS_functionalComponentArgsRest(__VLS_143));
        var __VLS_137;
        var __VLS_133;
    }
    var __VLS_113;
    {
        const { empty: __VLS_thisSlot } = __VLS_70.slots;
        if (!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_146 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                description: (__VLS_ctx.$t('professional.no_term')),
                imgType: "noneWhite",
            }));
            const __VLS_147 = __VLS_146({
                description: (__VLS_ctx.$t('professional.no_term')),
                imgType: "noneWhite",
            }, ...__VLS_functionalComponentArgsRest(__VLS_146));
        }
        if (!!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }));
            const __VLS_150 = __VLS_149({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        }
    }
    var __VLS_70;
}
if (__VLS_ctx.fieldList.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_152 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }));
    const __VLS_154 = __VLS_153({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    let __VLS_156;
    let __VLS_157;
    let __VLS_158;
    const __VLS_159 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_160 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_155;
}
if (__VLS_ctx.multipleSelectionAll.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-select" },
    });
    const __VLS_161 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }));
    const __VLS_163 = __VLS_162({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    let __VLS_165;
    let __VLS_166;
    let __VLS_167;
    const __VLS_168 = {
        onChange: (__VLS_ctx.handleCheckAllChange)
    };
    __VLS_164.slots.default;
    (__VLS_ctx.$t('datasource.select_all'));
    var __VLS_164;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.deleteBatch) },
        ...{ class: "danger-button" },
    });
    (__VLS_ctx.$t('dashboard.delete'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected" },
    });
    (__VLS_ctx.$t('user.selected_2_items', { msg: __VLS_ctx.multipleSelectionAll.length }));
    const __VLS_169 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_171 = __VLS_170({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    let __VLS_173;
    let __VLS_174;
    let __VLS_175;
    const __VLS_176 = {
        onClick: (__VLS_ctx.cancelDelete)
    };
    __VLS_172.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_172;
}
const __VLS_177 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
    modalClass: "professional-add_drawer",
}));
const __VLS_179 = __VLS_178({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
    modalClass: "professional-add_drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_180.slots.default;
const __VLS_181 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}));
const __VLS_183 = __VLS_182({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
let __VLS_185;
let __VLS_186;
let __VLS_187;
const __VLS_188 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.termFormRef} */ ;
var __VLS_189 = {};
__VLS_184.slots.default;
const __VLS_191 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
    prop: "word",
    label: (__VLS_ctx.t('professional.term_name')),
}));
const __VLS_193 = __VLS_192({
    prop: "word",
    label: (__VLS_ctx.t('professional.term_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_192));
__VLS_194.slots.default;
const __VLS_195 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
    modelValue: (__VLS_ctx.pageForm.word),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('professional.term_name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}));
const __VLS_197 = __VLS_196({
    modelValue: (__VLS_ctx.pageForm.word),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('professional.term_name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_196));
var __VLS_194;
const __VLS_199 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
    prop: "description",
    label: (__VLS_ctx.t('professional.term_description')),
}));
const __VLS_201 = __VLS_200({
    prop: "description",
    label: (__VLS_ctx.t('professional.term_description')),
}, ...__VLS_functionalComponentArgsRest(__VLS_200));
__VLS_202.slots.default;
const __VLS_203 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
    modelValue: (__VLS_ctx.pageForm.description),
    placeholder: (__VLS_ctx.$t('datasource.please_enter')),
    autosize: ({ minRows: 3.636, maxRows: 11.09 }),
    type: "textarea",
}));
const __VLS_205 = __VLS_204({
    modelValue: (__VLS_ctx.pageForm.description),
    placeholder: (__VLS_ctx.$t('datasource.please_enter')),
    autosize: ({ minRows: 3.636, maxRows: 11.09 }),
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_204));
var __VLS_202;
const __VLS_207 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({
    ...{ class: "is-required" },
    ...{ class: (!__VLS_ctx.pageForm.specific_ds && 'no-error') },
    prop: "datasource_ids",
    label: (__VLS_ctx.t('training.effective_data_sources')),
}));
const __VLS_209 = __VLS_208({
    ...{ class: "is-required" },
    ...{ class: (!__VLS_ctx.pageForm.specific_ds && 'no-error') },
    prop: "datasource_ids",
    label: (__VLS_ctx.t('training.effective_data_sources')),
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
__VLS_210.slots.default;
const __VLS_211 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({
    modelValue: (__VLS_ctx.pageForm.specific_ds),
}));
const __VLS_213 = __VLS_212({
    modelValue: (__VLS_ctx.pageForm.specific_ds),
}, ...__VLS_functionalComponentArgsRest(__VLS_212));
__VLS_214.slots.default;
const __VLS_215 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
    value: (false),
}));
const __VLS_217 = __VLS_216({
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_216));
__VLS_218.slots.default;
(__VLS_ctx.$t('training.all_data_sources'));
var __VLS_218;
const __VLS_219 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
    value: (true),
}));
const __VLS_221 = __VLS_220({
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_220));
__VLS_222.slots.default;
(__VLS_ctx.$t('training.partial_data_sources'));
var __VLS_222;
var __VLS_214;
if (__VLS_ctx.pageForm.specific_ds) {
    const __VLS_223 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.pageForm.datasource_ids),
        multiple: true,
        filterable: true,
        placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('ds.title')),
        ...{ style: {} },
    }));
    const __VLS_225 = __VLS_224({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.pageForm.datasource_ids),
        multiple: true,
        filterable: true,
        placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('ds.title')),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    let __VLS_227;
    let __VLS_228;
    let __VLS_229;
    const __VLS_230 = {
        onChange: (__VLS_ctx.handleChange)
    };
    __VLS_226.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.allDsList))) {
        const __VLS_231 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({
            key: (item.id),
            label: (item.name),
            value: (item.id),
        }));
        const __VLS_233 = __VLS_232({
            key: (item.id),
            label: (item.name),
            value: (item.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_232));
    }
    var __VLS_226;
}
var __VLS_210;
const __VLS_235 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({}));
const __VLS_237 = __VLS_236({}, ...__VLS_functionalComponentArgsRest(__VLS_236));
__VLS_238.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_238.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('professional.synonyms'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.pageForm.other_words.push('');
            } },
        ...{ class: "btn" },
    });
    const __VLS_239 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_241 = __VLS_240({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_240));
    __VLS_242.slots.default;
    const __VLS_243 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({}));
    const __VLS_245 = __VLS_244({}, ...__VLS_functionalComponentArgsRest(__VLS_244));
    var __VLS_242;
    (__VLS_ctx.$t('model.add'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "synonyms-list" },
});
const __VLS_247 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({}));
const __VLS_249 = __VLS_248({}, ...__VLS_functionalComponentArgsRest(__VLS_248));
__VLS_250.slots.default;
for (const [_, index] of __VLS_getVForSourceType((__VLS_ctx.pageForm.other_words))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "scrollbar-item" },
    });
    const __VLS_251 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({
        modelValue: (__VLS_ctx.pageForm.other_words[index]),
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('professional.synonyms')),
        maxlength: "100",
        clearable: true,
    }));
    const __VLS_253 = __VLS_252({
        modelValue: (__VLS_ctx.pageForm.other_words[index]),
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('professional.synonyms')),
        maxlength: "100",
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_252));
    const __VLS_255 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('dashboard.delete')),
        placement: "top",
    }));
    const __VLS_257 = __VLS_256({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('dashboard.delete')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_256));
    __VLS_258.slots.default;
    const __VLS_259 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
        ...{ 'onClick': {} },
        ...{ class: "hover-icon_with_bg" },
        size: "16",
        ...{ style: {} },
    }));
    const __VLS_261 = __VLS_260({
        ...{ 'onClick': {} },
        ...{ class: "hover-icon_with_bg" },
        size: "16",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_260));
    let __VLS_263;
    let __VLS_264;
    let __VLS_265;
    const __VLS_266 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteHandlerItem(index);
        }
    };
    __VLS_262.slots.default;
    const __VLS_267 = {}.IconOpeDelete;
    /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({}));
    const __VLS_269 = __VLS_268({}, ...__VLS_functionalComponentArgsRest(__VLS_268));
    var __VLS_262;
    var __VLS_258;
}
var __VLS_250;
var __VLS_238;
var __VLS_184;
{
    const { footer: __VLS_thisSlot } = __VLS_180.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.updateLoading) }, null, null);
    const __VLS_271 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_273 = __VLS_272({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_272));
    let __VLS_275;
    let __VLS_276;
    let __VLS_277;
    const __VLS_278 = {
        onClick: (__VLS_ctx.onFormClose)
    };
    __VLS_274.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_274;
    const __VLS_279 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_281 = __VLS_280({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_280));
    let __VLS_283;
    let __VLS_284;
    let __VLS_285;
    const __VLS_286 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_282.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_282;
}
var __VLS_180;
const __VLS_287 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
    modelValue: (__VLS_ctx.rowInfoDialog),
    title: (__VLS_ctx.$t('professional.professional_term_details')),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onRowFormClose),
    modalClass: "professional-term_drawer",
}));
const __VLS_289 = __VLS_288({
    modelValue: (__VLS_ctx.rowInfoDialog),
    title: (__VLS_ctx.$t('professional.professional_term_details')),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onRowFormClose),
    modalClass: "professional-term_drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_288));
__VLS_290.slots.default;
const __VLS_291 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
    ...{ 'onSubmit': {} },
    labelWidth: "180px",
    labelPosition: "top",
    ...{ class: "form-content_error" },
}));
const __VLS_293 = __VLS_292({
    ...{ 'onSubmit': {} },
    labelWidth: "180px",
    labelPosition: "top",
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_292));
let __VLS_295;
let __VLS_296;
let __VLS_297;
const __VLS_298 = {
    onSubmit: () => { }
};
__VLS_294.slots.default;
const __VLS_299 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
    label: (__VLS_ctx.t('professional.business_term')),
}));
const __VLS_301 = __VLS_300({
    label: (__VLS_ctx.t('professional.business_term')),
}, ...__VLS_functionalComponentArgsRest(__VLS_300));
__VLS_302.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.word);
var __VLS_302;
const __VLS_303 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({
    label: (__VLS_ctx.t('professional.synonyms')),
}));
const __VLS_305 = __VLS_304({
    label: (__VLS_ctx.t('professional.synonyms')),
}, ...__VLS_functionalComponentArgsRest(__VLS_304));
__VLS_306.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.other_words.join(','));
var __VLS_306;
const __VLS_307 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({
    label: (__VLS_ctx.t('training.effective_data_sources')),
}));
const __VLS_309 = __VLS_308({
    label: (__VLS_ctx.t('training.effective_data_sources')),
}, ...__VLS_functionalComponentArgsRest(__VLS_308));
__VLS_310.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.specific_ds
    ? __VLS_ctx.pageForm.datasource_names.join(',')
    : __VLS_ctx.t('training.all_data_sources'));
var __VLS_310;
const __VLS_311 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({
    label: (__VLS_ctx.t('professional.term_description')),
}));
const __VLS_313 = __VLS_312({
    label: (__VLS_ctx.t('professional.term_description')),
}, ...__VLS_functionalComponentArgsRest(__VLS_312));
__VLS_314.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.description);
var __VLS_314;
var __VLS_294;
var __VLS_290;
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
/** @type {__VLS_StyleScopedClasses['professional']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
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
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-button']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['is-required']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['synonyms-list']} */ ;
/** @type {__VLS_StyleScopedClasses['scrollbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
// @ts-ignore
var __VLS_77 = __VLS_76, __VLS_190 = __VLS_189, __VLS_324 = __VLS_323;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_export_outlined: icon_export_outlined,
            formatTimestamp: formatTimestamp,
            icon_add_outlined: icon_add_outlined,
            IconOpeEdit: IconOpeEdit,
            IconOpeDelete: IconOpeDelete,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            EmptyBackground: EmptyBackground,
            FilterText: FilterText,
            DrawerMain: DrawerMain,
            iconFilter: iconFilter,
            Uploader: Uploader,
            t: t,
            multipleSelectionAll: multipleSelectionAll,
            allDsList: allDsList,
            keywords: keywords,
            oldKeywords: oldKeywords,
            searchLoading: searchLoading,
            drawerMainRef: drawerMainRef,
            selectable: selectable,
            dialogFormVisible: dialogFormVisible,
            multipleTableRef: multipleTableRef,
            isIndeterminate: isIndeterminate,
            checkAll: checkAll,
            fieldList: fieldList,
            pageInfo: pageInfo,
            state: state,
            dialogTitle: dialogTitle,
            updateLoading: updateLoading,
            pageForm: pageForm,
            cancelDelete: cancelDelete,
            exportExcel: exportExcel,
            deleteBatch: deleteBatch,
            deleteHandler: deleteHandler,
            handleSelectionChange: handleSelectionChange,
            handleCheckAllChange: handleCheckAllChange,
            search: search,
            termFormRef: termFormRef,
            rules: rules,
            handleChange: handleChange,
            saveHandler: saveHandler,
            editHandler: editHandler,
            onFormClose: onFormClose,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            rowInfoDialog: rowInfoDialog,
            handleRowClick: handleRowClick,
            onRowFormClose: onRowFormClose,
            deleteHandlerItem: deleteHandlerItem,
            filterOption: filterOption,
            searchCondition: searchCondition,
            clearFilter: clearFilter,
            drawerMainOpen: drawerMainOpen,
            changeStatus: changeStatus,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
