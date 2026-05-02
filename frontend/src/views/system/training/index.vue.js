import { computed, nextTick, onMounted, reactive, ref, unref } from 'vue';
import icon_export_outlined from '@/assets/svg/icon_export_outlined.svg';
import { trainingApi } from '@/api/training';
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
import { getAdvancedApplicationList } from '@/api/embedded.ts';
import Uploader from '@/views/system/excel-upload/Uploader.vue';
const { t } = useI18n();
const multipleSelectionAll = ref([]);
const keywords = ref('');
const oldKeywords = ref('');
const searchLoading = ref(false);
const { copy } = useClipboard({ legacy: true });
const options = ref([]);
const adv_options = ref([]);
const selectable = () => {
    return true;
};
onMounted(() => {
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
    question: null,
    description: null,
    datasource: null,
    datasource_name: null,
    advanced_application: null,
    advanced_application_name: null,
};
const pageForm = ref(cloneDeep(defaultForm));
const copyCode = () => {
    copy(pageForm.value.description)
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
const exportExcel = () => {
    ElMessageBox.confirm(t('training.export_hint', { msg: pageInfo.total }), {
        confirmButtonType: 'primary',
        confirmButtonText: t('professional.export'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        searchLoading.value = true;
        trainingApi
            .export2Excel(keywords.value ? { question: keywords.value } : {})
            .then((res) => {
            const blob = new Blob([res], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${t('training.data_training')}.xlsx`;
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
    ElMessageBox.confirm(t('training.training_data_items', { msg: multipleSelectionAll.value.length }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        trainingApi.deleteEmbedded(multipleSelectionAll.value.map((ele) => ele.id)).then(() => {
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
    ElMessageBox.confirm(t('training.sales_this_year', { msg: row.question }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        trainingApi.deleteEmbedded([row.id]).then(() => {
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
    trainingApi
        .getList(pageInfo.currentPage, pageInfo.pageSize, keywords.value ? { question: keywords.value } : {})
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
const rules = computed(() => {
    let _list = {
        question: [
            {
                required: true,
                message: t('datasource.please_enter') + t('common.empty') + t('training.problem_description'),
            },
        ],
        datasource: [],
        description: [
            {
                required: true,
                message: t('datasource.please_enter') + t('common.empty') + t('training.sample_sql'),
            },
        ],
    };
    // _list.datasource = [
    //   {
    //     required: true,
    //     message: t('datasource.Please_select') + t('common.empty') + t('ds.title'),
    //   },
    // ]
    return _list;
});
const list = () => {
    datasourceApi.list().then((res) => {
        options.value = res || [];
    });
    getAdvancedApplicationList().then((res) => {
        adv_options.value = res || [];
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
            trainingApi
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
    if (row) {
        pageForm.value = cloneDeep(row);
    }
    list();
    dialogTitle.value = row?.id ? t('training.edit_training_data') : t('training.add_training_data');
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
const changeStatus = (id, val) => {
    trainingApi
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
const onRowFormClose = () => {
    pageForm.value = cloneDeep(defaultForm);
    rowInfoDialog.value = false;
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
    ...{ class: "training" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.searchLoading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
(__VLS_ctx.$t('training.data_training'));
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
    placeholder: (__VLS_ctx.$t('training.search_problem')),
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('training.search_problem')),
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
    uploadPath: "/system/data-training/uploadExcel",
    templatePath: "/system/data-training/template",
    templateName: (`${__VLS_ctx.t('training.data_training')}.xlsx`),
}));
const __VLS_29 = __VLS_28({
    ...{ 'onUploadFinished': {} },
    uploadPath: "/system/data-training/uploadExcel",
    templatePath: "/system/data-training/template",
    templateName: (`${__VLS_ctx.t('training.data_training')}.xlsx`),
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
    type: "primary",
}));
const __VLS_37 = __VLS_36({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_39;
let __VLS_40;
let __VLS_41;
const __VLS_42 = {
    onClick: (...[$event]) => {
        __VLS_ctx.editHandler(null);
    }
};
__VLS_38.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_38.slots;
    const __VLS_43 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({}));
    const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
}
(__VLS_ctx.$t('training.add_training_data'));
var __VLS_38;
if (!__VLS_ctx.searchLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
        ...{ class: (__VLS_ctx.multipleSelectionAll?.length > 0 && 'show-pagination_height') },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-or-schema" },
    });
    const __VLS_47 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        ...{ 'onRowClick': {} },
        ...{ 'onSelectionChange': {} },
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }));
    const __VLS_49 = __VLS_48({
        ...{ 'onRowClick': {} },
        ...{ 'onSelectionChange': {} },
        ref: "multipleTableRef",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_51;
    let __VLS_52;
    let __VLS_53;
    const __VLS_54 = {
        onRowClick: (__VLS_ctx.handleRowClick)
    };
    const __VLS_55 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    /** @type {typeof __VLS_ctx.multipleTableRef} */ ;
    var __VLS_56 = {};
    __VLS_50.slots.default;
    const __VLS_58 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        selectable: (__VLS_ctx.selectable),
        type: "selection",
        width: "55",
    }));
    const __VLS_60 = __VLS_59({
        selectable: (__VLS_ctx.selectable),
        type: "selection",
        width: "55",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const __VLS_62 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        prop: "question",
        label: (__VLS_ctx.$t('training.problem_description')),
        width: "280",
    }));
    const __VLS_64 = __VLS_63({
        prop: "question",
        label: (__VLS_ctx.$t('training.problem_description')),
        width: "280",
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const __VLS_66 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        prop: "description",
        label: (__VLS_ctx.$t('training.sample_sql')),
        minWidth: "240",
    }));
    const __VLS_68 = __VLS_67({
        prop: "description",
        label: (__VLS_ctx.$t('training.sample_sql')),
        minWidth: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_69.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_69.slots;
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
    var __VLS_69;
    const __VLS_70 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        prop: "datasource_name",
        label: (__VLS_ctx.$t('ds.title')),
        minWidth: "180",
    }));
    const __VLS_72 = __VLS_71({
        prop: "datasource_name",
        label: (__VLS_ctx.$t('ds.title')),
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const __VLS_74 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        prop: "advanced_application_name",
        label: (__VLS_ctx.$t('embedded.advanced_application')),
        minWidth: "180",
    }));
    const __VLS_76 = __VLS_75({
        prop: "advanced_application_name",
        label: (__VLS_ctx.$t('embedded.advanced_application')),
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const __VLS_78 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        label: (__VLS_ctx.t('ds.status')),
        width: "100",
    }));
    const __VLS_80 = __VLS_79({
        label: (__VLS_ctx.t('ds.status')),
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    __VLS_81.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_81.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: () => { } },
            ...{ style: {} },
        });
        const __VLS_82 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
            ...{ 'onChange': {} },
            modelValue: (scope.row.enabled),
            size: "small",
        }));
        const __VLS_84 = __VLS_83({
            ...{ 'onChange': {} },
            modelValue: (scope.row.enabled),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        let __VLS_86;
        let __VLS_87;
        let __VLS_88;
        const __VLS_89 = {
            onChange: ((val) => __VLS_ctx.changeStatus(scope.row.id, val))
        };
        var __VLS_85;
    }
    var __VLS_81;
    const __VLS_90 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        prop: "create_time",
        sortable: true,
        label: (__VLS_ctx.$t('dashboard.create_time')),
        width: "240",
    }));
    const __VLS_92 = __VLS_91({
        prop: "create_time",
        sortable: true,
        label: (__VLS_ctx.$t('dashboard.create_time')),
        width: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_93.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_93.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatTimestamp(scope.row.create_time, 'YYYY-MM-DD HH:mm:ss'));
    }
    var __VLS_93;
    const __VLS_94 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        fixed: "right",
        width: "80",
        label: (__VLS_ctx.t('ds.actions')),
    }));
    const __VLS_96 = __VLS_95({
        fixed: "right",
        width: "80",
        label: (__VLS_ctx.t('ds.actions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_97.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_97.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-comment" },
        });
        const __VLS_98 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('datasource.edit')),
            placement: "top",
        }));
        const __VLS_100 = __VLS_99({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('datasource.edit')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        __VLS_101.slots.default;
        const __VLS_102 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }));
        const __VLS_104 = __VLS_103({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        let __VLS_106;
        let __VLS_107;
        let __VLS_108;
        const __VLS_109 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.searchLoading))
                    return;
                __VLS_ctx.editHandler(scope.row);
            }
        };
        __VLS_105.slots.default;
        const __VLS_110 = {}.IconOpeEdit;
        /** @type {[typeof __VLS_components.IconOpeEdit, typeof __VLS_components.IconOpeEdit, ]} */ ;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({}));
        const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
        var __VLS_105;
        var __VLS_101;
        const __VLS_114 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('dashboard.delete')),
            placement: "top",
        }));
        const __VLS_116 = __VLS_115({
            offset: (14),
            effect: "dark",
            content: (__VLS_ctx.$t('dashboard.delete')),
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
                __VLS_ctx.deleteHandler(scope.row);
            }
        };
        __VLS_121.slots.default;
        const __VLS_126 = {}.IconOpeDelete;
        /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({}));
        const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
        var __VLS_121;
        var __VLS_117;
    }
    var __VLS_97;
    {
        const { empty: __VLS_thisSlot } = __VLS_50.slots;
        if (!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_130 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                ...{ class: "datasource-yet" },
                description: (__VLS_ctx.$t('qa.no_data')),
                imgType: "noneWhite",
            }));
            const __VLS_131 = __VLS_130({
                ...{ class: "datasource-yet" },
                description: (__VLS_ctx.$t('qa.no_data')),
                imgType: "noneWhite",
            }, ...__VLS_functionalComponentArgsRest(__VLS_130));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            const __VLS_133 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_135 = __VLS_134({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_134));
            let __VLS_137;
            let __VLS_138;
            let __VLS_139;
            const __VLS_140 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.editHandler(null);
                }
            };
            __VLS_136.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_136.slots;
                const __VLS_141 = {}.icon_add_outlined;
                /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
                // @ts-ignore
                const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({}));
                const __VLS_143 = __VLS_142({}, ...__VLS_functionalComponentArgsRest(__VLS_142));
            }
            (__VLS_ctx.$t('prompt.add_sql_sample'));
            var __VLS_136;
        }
        if (!!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
            /** @type {[typeof EmptyBackground, ]} */ ;
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }));
            const __VLS_146 = __VLS_145({
                description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                imgType: "tree",
            }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        }
    }
    var __VLS_50;
}
if (__VLS_ctx.fieldList.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_148 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }));
    const __VLS_150 = __VLS_149({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    let __VLS_152;
    let __VLS_153;
    let __VLS_154;
    const __VLS_155 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_156 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_151;
}
if (__VLS_ctx.multipleSelectionAll.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-select" },
    });
    const __VLS_157 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }));
    const __VLS_159 = __VLS_158({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    let __VLS_161;
    let __VLS_162;
    let __VLS_163;
    const __VLS_164 = {
        onChange: (__VLS_ctx.handleCheckAllChange)
    };
    __VLS_160.slots.default;
    (__VLS_ctx.$t('datasource.select_all'));
    var __VLS_160;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.deleteBatchUser) },
        ...{ class: "danger-button" },
    });
    (__VLS_ctx.$t('dashboard.delete'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected" },
    });
    (__VLS_ctx.$t('user.selected_2_items', { msg: __VLS_ctx.multipleSelectionAll.length }));
    const __VLS_165 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_167 = __VLS_166({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    let __VLS_169;
    let __VLS_170;
    let __VLS_171;
    const __VLS_172 = {
        onClick: (__VLS_ctx.cancelDelete)
    };
    __VLS_168.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_168;
}
const __VLS_173 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
    modalClass: "training-add_drawer",
}));
const __VLS_175 = __VLS_174({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
    modalClass: "training-add_drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}));
const __VLS_179 = __VLS_178({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
let __VLS_181;
let __VLS_182;
let __VLS_183;
const __VLS_184 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.termFormRef} */ ;
var __VLS_185 = {};
__VLS_180.slots.default;
const __VLS_187 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
    prop: "question",
    label: (__VLS_ctx.t('training.problem_description')),
}));
const __VLS_189 = __VLS_188({
    prop: "question",
    label: (__VLS_ctx.t('training.problem_description')),
}, ...__VLS_functionalComponentArgsRest(__VLS_188));
__VLS_190.slots.default;
const __VLS_191 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
    modelValue: (__VLS_ctx.pageForm.question),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('training.problem_description')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}));
const __VLS_193 = __VLS_192({
    modelValue: (__VLS_ctx.pageForm.question),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('training.problem_description')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_192));
var __VLS_190;
const __VLS_195 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
    prop: "description",
    label: (__VLS_ctx.t('training.sample_sql')),
}));
const __VLS_197 = __VLS_196({
    prop: "description",
    label: (__VLS_ctx.t('training.sample_sql')),
}, ...__VLS_functionalComponentArgsRest(__VLS_196));
__VLS_198.slots.default;
const __VLS_199 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
    modelValue: (__VLS_ctx.pageForm.description),
    placeholder: (__VLS_ctx.$t('datasource.please_enter')),
    autosize: ({ minRows: 3.636, maxRows: 11.09 }),
    type: "textarea",
}));
const __VLS_201 = __VLS_200({
    modelValue: (__VLS_ctx.pageForm.description),
    placeholder: (__VLS_ctx.$t('datasource.please_enter')),
    autosize: ({ minRows: 3.636, maxRows: 11.09 }),
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_200));
var __VLS_198;
const __VLS_203 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
    prop: "datasource",
    label: (__VLS_ctx.t('ds.title')),
}));
const __VLS_205 = __VLS_204({
    prop: "datasource",
    label: (__VLS_ctx.t('ds.title')),
}, ...__VLS_functionalComponentArgsRest(__VLS_204));
__VLS_206.slots.default;
const __VLS_207 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({
    modelValue: (__VLS_ctx.pageForm.datasource),
    filterable: true,
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('ds.title')),
    ...{ style: {} },
}));
const __VLS_209 = __VLS_208({
    modelValue: (__VLS_ctx.pageForm.datasource),
    filterable: true,
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.Please_select') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('ds.title')),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
__VLS_210.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.options))) {
    const __VLS_211 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_213 = __VLS_212({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_212));
}
var __VLS_210;
var __VLS_206;
const __VLS_215 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
    prop: "advanced_application",
    label: (__VLS_ctx.t('embedded.advanced_application')),
}));
const __VLS_217 = __VLS_216({
    prop: "advanced_application",
    label: (__VLS_ctx.t('embedded.advanced_application')),
}, ...__VLS_functionalComponentArgsRest(__VLS_216));
__VLS_218.slots.default;
const __VLS_219 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
    modelValue: (__VLS_ctx.pageForm.advanced_application),
    filterable: true,
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.Please_select') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.advanced_application')),
    ...{ style: {} },
}));
const __VLS_221 = __VLS_220({
    modelValue: (__VLS_ctx.pageForm.advanced_application),
    filterable: true,
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.Please_select') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.advanced_application')),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_220));
__VLS_222.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.adv_options))) {
    const __VLS_223 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_225 = __VLS_224({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
}
var __VLS_222;
var __VLS_218;
var __VLS_180;
{
    const { footer: __VLS_thisSlot } = __VLS_176.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.updateLoading) }, null, null);
    const __VLS_227 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_229 = __VLS_228({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_228));
    let __VLS_231;
    let __VLS_232;
    let __VLS_233;
    const __VLS_234 = {
        onClick: (__VLS_ctx.onFormClose)
    };
    __VLS_230.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_230;
    const __VLS_235 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_237 = __VLS_236({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    let __VLS_239;
    let __VLS_240;
    let __VLS_241;
    const __VLS_242 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_238.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_238;
}
var __VLS_176;
const __VLS_243 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
    modelValue: (__VLS_ctx.rowInfoDialog),
    title: (__VLS_ctx.$t('training.training_data_details')),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onRowFormClose),
    modalClass: "training-term_drawer",
}));
const __VLS_245 = __VLS_244({
    modelValue: (__VLS_ctx.rowInfoDialog),
    title: (__VLS_ctx.$t('training.training_data_details')),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onRowFormClose),
    modalClass: "training-term_drawer",
}, ...__VLS_functionalComponentArgsRest(__VLS_244));
__VLS_246.slots.default;
const __VLS_247 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
    ...{ 'onSubmit': {} },
    labelWidth: "180px",
    labelPosition: "top",
    ...{ class: "form-content_error" },
}));
const __VLS_249 = __VLS_248({
    ...{ 'onSubmit': {} },
    labelWidth: "180px",
    labelPosition: "top",
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_248));
let __VLS_251;
let __VLS_252;
let __VLS_253;
const __VLS_254 = {
    onSubmit: () => { }
};
__VLS_250.slots.default;
const __VLS_255 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
    label: (__VLS_ctx.t('training.problem_description')),
}));
const __VLS_257 = __VLS_256({
    label: (__VLS_ctx.t('training.problem_description')),
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
__VLS_258.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.question);
var __VLS_258;
const __VLS_259 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
    label: (__VLS_ctx.t('training.sample_sql')),
}));
const __VLS_261 = __VLS_260({
    label: (__VLS_ctx.t('training.sample_sql')),
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
__VLS_262.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.description);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "copy-icon" },
});
const __VLS_263 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.t('datasource.copy')),
    placement: "top",
}));
const __VLS_265 = __VLS_264({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.t('datasource.copy')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_264));
__VLS_266.slots.default;
const __VLS_267 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
    ...{ 'onClick': {} },
    ...{ class: "hover-icon_with_bg" },
    ...{ style: {} },
    size: "16",
}));
const __VLS_269 = __VLS_268({
    ...{ 'onClick': {} },
    ...{ class: "hover-icon_with_bg" },
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
let __VLS_271;
let __VLS_272;
let __VLS_273;
const __VLS_274 = {
    onClick: (__VLS_ctx.copyCode)
};
__VLS_270.slots.default;
const __VLS_275 = {}.icon_copy_outlined;
/** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
// @ts-ignore
const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({}));
const __VLS_277 = __VLS_276({}, ...__VLS_functionalComponentArgsRest(__VLS_276));
var __VLS_270;
var __VLS_266;
var __VLS_262;
const __VLS_279 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
    label: (__VLS_ctx.t('ds.title')),
}));
const __VLS_281 = __VLS_280({
    label: (__VLS_ctx.t('ds.title')),
}, ...__VLS_functionalComponentArgsRest(__VLS_280));
__VLS_282.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.datasource_name);
var __VLS_282;
const __VLS_283 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
    label: (__VLS_ctx.t('embedded.advanced_application')),
}));
const __VLS_285 = __VLS_284({
    label: (__VLS_ctx.t('embedded.advanced_application')),
}, ...__VLS_functionalComponentArgsRest(__VLS_284));
__VLS_286.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
(__VLS_ctx.pageForm.advanced_application_name);
var __VLS_286;
var __VLS_250;
var __VLS_246;
/** @type {__VLS_StyleScopedClasses['training']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-row']} */ ;
/** @type {__VLS_StyleScopedClasses['no-margin']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-or-schema']} */ ;
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
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
// @ts-ignore
var __VLS_57 = __VLS_56, __VLS_186 = __VLS_185;
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
            Uploader: Uploader,
            t: t,
            multipleSelectionAll: multipleSelectionAll,
            keywords: keywords,
            oldKeywords: oldKeywords,
            searchLoading: searchLoading,
            options: options,
            adv_options: adv_options,
            selectable: selectable,
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
            changeStatus: changeStatus,
            onRowFormClose: onRowFormClose,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
