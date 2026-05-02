import { ref, onMounted, reactive, unref, nextTick } from 'vue';
import { variablesApi } from '@/api/variables';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import IconOpeEdit from '@/assets/svg/icon_edit_outlined.svg';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash-es';
const { t } = useI18n();
const multipleSelectionAll = ref([]);
const keywords = ref('');
const oldKeywords = ref('');
const searchLoading = ref(false);
const selectable = (row) => {
    return ![1, 2, 3].includes(row.id);
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
const var_type = {
    text: 'model.text',
    number: 'model.number',
    datetime: 'variables.date',
};
const dialogTitle = ref('');
const defaultForm = {
    id: null,
    name: null,
    var_type: 'text',
    value: [''],
};
const pageForm = ref(cloneDeep(defaultForm));
const cancelDelete = () => {
    handleToggleRowSelection(false);
    multipleSelectionAll.value = [];
    checkAll.value = false;
    isIndeterminate.value = false;
};
const deleteBatchUser = () => {
    ElMessageBox.confirm(t('embedded.delete_10_apps', { msg: multipleSelectionAll.value.length }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        variablesApi.delete(multipleSelectionAll.value.map((ele) => ele.id)).then(() => {
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
    if (row.type === 'system')
        return;
    ElMessageBox.confirm(t('embedded.delete', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        variablesApi.delete([row.id]).then(() => {
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
    let data = keywords.value ? { name: keywords.value } : {};
    variablesApi
        .listPage(pageInfo.currentPage, pageInfo.pageSize, data)
        .then((res) => {
        toggleRowLoading.value = true;
        fieldList.value = res.items.map((ele) => ({
            ...ele,
            value: ele.type === 'system' ? t('variables.built_in') : ele.value,
        }));
        pageInfo.total = res.total;
        searchLoading.value = false;
        nextTick(() => {
            handleToggleRowSelection();
        });
    })
        .finally(() => {
        oldKeywords.value = keywords.value;
        searchLoading.value = false;
    });
};
const deleteValues = (index) => {
    if (index === 0 && pageForm.value.value.length === 1)
        return;
    pageForm.value.value.splice(index, 1);
};
const termFormRef = ref();
const validateValue = (_, value, callback) => {
    const { var_type } = pageForm.value;
    if (var_type === 'text') {
        if (value === '') {
            callback(new Error(t('datasource.please_enter') + t('common.empty') + t('variables.variable_value')));
        }
        else {
            callback();
        }
        return;
    }
    if (value.some((ele) => ele === '')) {
        callback(new Error(t('datasource.please_enter') +
            t('common.empty') +
            t(pageForm.value.var_type === 'number' ? 'model.number' : 'variables.date')));
    }
    else {
        callback();
    }
};
const rules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('embedded.application_name'),
        },
    ],
    value: [
        {
            required: true,
            validator: validateValue,
            trigger: 'blur',
        },
    ],
};
const varTypeChange = (val) => {
    if (val === 'text') {
        pageForm.value.value = [''];
        return;
    }
    pageForm.value.value = ['', ''];
};
const saveHandler = () => {
    termFormRef.value.validate((res) => {
        if (res) {
            const obj = unref(pageForm);
            if (obj.id === '' || obj.id === null) {
                delete obj.id;
            }
            variablesApi.save(obj).then(() => {
                ElMessage({
                    type: 'success',
                    message: t('common.save_success'),
                });
                search();
                onFormClose();
            });
        }
    });
};
const editHandler = (row) => {
    pageForm.value.id = null;
    if (row) {
        if (row.type === 'system')
            return;
        const { id, name, var_type, value } = row;
        pageForm.value.id = id;
        pageForm.value.name = name;
        pageForm.value.var_type = var_type;
        pageForm.value.value = value;
    }
    dialogTitle.value = row?.id ? t('variables.edit_variable') : t('variables.add_variable');
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['not-allow']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "variables" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.searchLoading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
(__VLS_ctx.t('variables.system_variables'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('variables.search_variables')),
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('variables.search_variables')),
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
        __VLS_ctx.editHandler(null);
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
(__VLS_ctx.$t('variables.add_variable'));
var __VLS_19;
if (!__VLS_ctx.searchLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
        ...{ class: (__VLS_ctx.multipleSelectionAll.length > 0 && 'show-pagination_height') },
    });
    if (!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
        /** @type {[typeof EmptyBackground, ]} */ ;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
            ...{ class: "datasource-yet" },
            description: (__VLS_ctx.$t('variables.no_variables_yet')),
            imgType: "noneWhite",
        }));
        const __VLS_29 = __VLS_28({
            ...{ class: "datasource-yet" },
            description: (__VLS_ctx.$t('variables.no_variables_yet')),
            imgType: "noneWhite",
        }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-or-schema" },
        });
        const __VLS_31 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
            ...{ 'onSelectionChange': {} },
            ref: "multipleTableRef",
            data: (__VLS_ctx.fieldList),
            ...{ style: {} },
        }));
        const __VLS_33 = __VLS_32({
            ...{ 'onSelectionChange': {} },
            ref: "multipleTableRef",
            data: (__VLS_ctx.fieldList),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        let __VLS_35;
        let __VLS_36;
        let __VLS_37;
        const __VLS_38 = {
            onSelectionChange: (__VLS_ctx.handleSelectionChange)
        };
        /** @type {typeof __VLS_ctx.multipleTableRef} */ ;
        var __VLS_39 = {};
        __VLS_34.slots.default;
        const __VLS_41 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
            selectable: (__VLS_ctx.selectable),
            type: "selection",
            width: "55",
        }));
        const __VLS_43 = __VLS_42({
            selectable: (__VLS_ctx.selectable),
            type: "selection",
            width: "55",
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        const __VLS_45 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
            prop: "name",
            label: (__VLS_ctx.$t('variables.variable_name')),
        }));
        const __VLS_47 = __VLS_46({
            prop: "name",
            label: (__VLS_ctx.$t('variables.variable_name')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        __VLS_48.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_48.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
                title: (scope.row.name),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "ellipsis" },
                ...{ style: {} },
            });
            (scope.row.name);
            if (scope.row.type === 'system') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "system-flag" },
                });
                (__VLS_ctx.t('variables.system'));
            }
        }
        var __VLS_48;
        const __VLS_49 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
            width: "160",
            prop: "var_type",
            label: (__VLS_ctx.$t('variables.variable_type')),
        }));
        const __VLS_51 = __VLS_50({
            width: "160",
            prop: "var_type",
            label: (__VLS_ctx.$t('variables.variable_type')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        __VLS_52.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_52.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            (__VLS_ctx.t(__VLS_ctx.var_type[scope.row.var_type]));
        }
        var __VLS_52;
        const __VLS_53 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            prop: "value",
            width: "420",
            label: (__VLS_ctx.$t('variables.variable_value')),
            showOverflowTooltip: true,
        }));
        const __VLS_55 = __VLS_54({
            prop: "value",
            width: "420",
            label: (__VLS_ctx.$t('variables.variable_value')),
            showOverflowTooltip: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        const __VLS_57 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
            fixed: "right",
            width: "80",
            label: (__VLS_ctx.t('ds.actions')),
        }));
        const __VLS_59 = __VLS_58({
            fixed: "right",
            width: "80",
            label: (__VLS_ctx.t('ds.actions')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        __VLS_60.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_60.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "field-comment" },
            });
            const __VLS_61 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
                offset: (14),
                effect: "dark",
                content: (__VLS_ctx.$t('datasource.edit')),
                placement: "top",
            }));
            const __VLS_63 = __VLS_62({
                offset: (14),
                effect: "dark",
                content: (__VLS_ctx.$t('datasource.edit')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_62));
            __VLS_64.slots.default;
            const __VLS_65 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                ...{ class: (scope.row.type === 'system' && 'not-allow') },
                size: "16",
            }));
            const __VLS_67 = __VLS_66({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                ...{ class: (scope.row.type === 'system' && 'not-allow') },
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_66));
            let __VLS_69;
            let __VLS_70;
            let __VLS_71;
            const __VLS_72 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.editHandler(scope.row);
                }
            };
            __VLS_68.slots.default;
            const __VLS_73 = {}.IconOpeEdit;
            /** @type {[typeof __VLS_components.IconOpeEdit, typeof __VLS_components.IconOpeEdit, ]} */ ;
            // @ts-ignore
            const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({}));
            const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
            var __VLS_68;
            var __VLS_64;
            const __VLS_77 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
                offset: (14),
                effect: "dark",
                content: (__VLS_ctx.$t('dashboard.delete')),
                placement: "top",
            }));
            const __VLS_79 = __VLS_78({
                offset: (14),
                effect: "dark",
                content: (__VLS_ctx.$t('dashboard.delete')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_78));
            __VLS_80.slots.default;
            const __VLS_81 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                ...{ class: (scope.row.type === 'system' && 'not-allow') },
                size: "16",
            }));
            const __VLS_83 = __VLS_82({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                ...{ class: (scope.row.type === 'system' && 'not-allow') },
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            let __VLS_85;
            let __VLS_86;
            let __VLS_87;
            const __VLS_88 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.deleteHandler(scope.row);
                }
            };
            __VLS_84.slots.default;
            const __VLS_89 = {}.IconOpeDelete;
            /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({}));
            const __VLS_91 = __VLS_90({}, ...__VLS_functionalComponentArgsRest(__VLS_90));
            var __VLS_84;
            var __VLS_80;
        }
        var __VLS_60;
        {
            const { empty: __VLS_thisSlot } = __VLS_34.slots;
            if (!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
                /** @type {[typeof EmptyBackground, ]} */ ;
                // @ts-ignore
                const __VLS_93 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                    description: (__VLS_ctx.$t('embedded.no_application')),
                    imgType: "noneWhite",
                }));
                const __VLS_94 = __VLS_93({
                    description: (__VLS_ctx.$t('embedded.no_application')),
                    imgType: "noneWhite",
                }, ...__VLS_functionalComponentArgsRest(__VLS_93));
            }
            if (!!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
                /** @type {[typeof EmptyBackground, ]} */ ;
                // @ts-ignore
                const __VLS_96 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                    description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                    imgType: "tree",
                }));
                const __VLS_97 = __VLS_96({
                    description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                    imgType: "tree",
                }, ...__VLS_functionalComponentArgsRest(__VLS_96));
            }
        }
        var __VLS_34;
    }
}
if (__VLS_ctx.fieldList.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_99 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }));
    const __VLS_101 = __VLS_100({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    let __VLS_103;
    let __VLS_104;
    let __VLS_105;
    const __VLS_106 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_107 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_102;
}
if (__VLS_ctx.multipleSelectionAll.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-select" },
    });
    const __VLS_108 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }));
    const __VLS_110 = __VLS_109({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    let __VLS_112;
    let __VLS_113;
    let __VLS_114;
    const __VLS_115 = {
        onChange: (__VLS_ctx.handleCheckAllChange)
    };
    __VLS_111.slots.default;
    (__VLS_ctx.$t('datasource.select_all'));
    var __VLS_111;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.deleteBatchUser) },
        ...{ class: "danger-button" },
    });
    (__VLS_ctx.$t('dashboard.delete'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected" },
    });
    (__VLS_ctx.$t('user.selected_2_items', { msg: __VLS_ctx.multipleSelectionAll.length }));
    const __VLS_116 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_118 = __VLS_117({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    let __VLS_120;
    let __VLS_121;
    let __VLS_122;
    const __VLS_123 = {
        onClick: (__VLS_ctx.cancelDelete)
    };
    __VLS_119.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_119;
}
const __VLS_124 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    modalClass: "variables-config",
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
}));
const __VLS_126 = __VLS_125({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    modalClass: "variables-config",
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}));
const __VLS_130 = __VLS_129({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
let __VLS_132;
let __VLS_133;
let __VLS_134;
const __VLS_135 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.termFormRef} */ ;
var __VLS_136 = {};
__VLS_131.slots.default;
const __VLS_138 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    prop: "name",
    label: (__VLS_ctx.t('variables.variable_name')),
}));
const __VLS_140 = __VLS_139({
    prop: "name",
    label: (__VLS_ctx.t('variables.variable_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
__VLS_141.slots.default;
const __VLS_142 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    modelValue: (__VLS_ctx.pageForm.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('variables.variable_name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}));
const __VLS_144 = __VLS_143({
    modelValue: (__VLS_ctx.pageForm.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('variables.variable_name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
var __VLS_141;
const __VLS_146 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    label: (__VLS_ctx.t('variables.variable_type')),
}));
const __VLS_148 = __VLS_147({
    label: (__VLS_ctx.t('variables.variable_type')),
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
__VLS_149.slots.default;
const __VLS_150 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.pageForm.var_type),
    disabled: (!!__VLS_ctx.pageForm.id),
}));
const __VLS_152 = __VLS_151({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.pageForm.var_type),
    disabled: (!!__VLS_ctx.pageForm.id),
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
let __VLS_154;
let __VLS_155;
let __VLS_156;
const __VLS_157 = {
    onChange: (__VLS_ctx.varTypeChange)
};
__VLS_153.slots.default;
const __VLS_158 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    value: "text",
}));
const __VLS_160 = __VLS_159({
    value: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
(__VLS_ctx.$t('model.text'));
var __VLS_161;
const __VLS_162 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    value: "number",
}));
const __VLS_164 = __VLS_163({
    value: "number",
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_165.slots.default;
(__VLS_ctx.$t('model.number'));
var __VLS_165;
const __VLS_166 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
    value: "datetime",
}));
const __VLS_168 = __VLS_167({
    value: "datetime",
}, ...__VLS_functionalComponentArgsRest(__VLS_167));
__VLS_169.slots.default;
(__VLS_ctx.$t('variables.date'));
var __VLS_169;
var __VLS_153;
var __VLS_149;
if (__VLS_ctx.pageForm.var_type === 'text') {
    const __VLS_170 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({}));
    const __VLS_172 = __VLS_171({}, ...__VLS_functionalComponentArgsRest(__VLS_171));
    __VLS_173.slots.default;
    {
        const { label: __VLS_thisSlot } = __VLS_173.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "text" },
        });
        (__VLS_ctx.t('variables.variable_value'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.pageForm.var_type === 'text'))
                        return;
                    __VLS_ctx.pageForm.value.push('');
                } },
            ...{ class: "btn" },
        });
        const __VLS_174 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
            ...{ style: {} },
            size: "16",
        }));
        const __VLS_176 = __VLS_175({
            ...{ style: {} },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_175));
        __VLS_177.slots.default;
        const __VLS_178 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({}));
        const __VLS_180 = __VLS_179({}, ...__VLS_functionalComponentArgsRest(__VLS_179));
        var __VLS_177;
        (__VLS_ctx.$t('model.add'));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value-list" },
    });
    for (const [_, index] of __VLS_getVForSourceType((__VLS_ctx.pageForm.value))) {
        const __VLS_182 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
            key: (index),
            prop: ('value.' + index),
            rules: ({
                required: true,
                message: __VLS_ctx.$t('variables.enter_variable_value'),
                trigger: 'blur',
            }),
        }));
        const __VLS_184 = __VLS_183({
            key: (index),
            prop: ('value.' + index),
            rules: ({
                required: true,
                message: __VLS_ctx.$t('variables.enter_variable_value'),
                trigger: 'blur',
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_183));
        __VLS_185.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item" },
        });
        const __VLS_186 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
            modelValue: (__VLS_ctx.pageForm.value[index]),
            placeholder: (__VLS_ctx.$t('variables.enter_variable_value')),
            autocomplete: "off",
            maxlength: "50",
            clearable: true,
        }));
        const __VLS_188 = __VLS_187({
            modelValue: (__VLS_ctx.pageForm.value[index]),
            placeholder: (__VLS_ctx.$t('variables.enter_variable_value')),
            autocomplete: "off",
            maxlength: "50",
            clearable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_187));
        const __VLS_190 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            ...{ class: (index === 0 && __VLS_ctx.pageForm.value.length === 1 && 'not-allow') },
            size: "16",
        }));
        const __VLS_192 = __VLS_191({
            ...{ 'onClick': {} },
            ...{ class: "action-btn" },
            ...{ class: (index === 0 && __VLS_ctx.pageForm.value.length === 1 && 'not-allow') },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_191));
        let __VLS_194;
        let __VLS_195;
        let __VLS_196;
        const __VLS_197 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.pageForm.var_type === 'text'))
                    return;
                __VLS_ctx.deleteValues(index);
            }
        };
        __VLS_193.slots.default;
        const __VLS_198 = {}.IconOpeDelete;
        /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
        // @ts-ignore
        const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({}));
        const __VLS_200 = __VLS_199({}, ...__VLS_functionalComponentArgsRest(__VLS_199));
        var __VLS_193;
        var __VLS_185;
    }
    var __VLS_173;
}
else {
    const __VLS_202 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
        prop: "value",
        label: (__VLS_ctx.t('variables.variable_value')),
    }));
    const __VLS_204 = __VLS_203({
        prop: "value",
        label: (__VLS_ctx.t('variables.variable_value')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    __VLS_205.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value-number_date" },
    });
    if (__VLS_ctx.pageForm.var_type === 'number') {
        const __VLS_206 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
            modelValue: (__VLS_ctx.pageForm.value[0]),
            modelModifiers: { number: true, },
            placeholder: (__VLS_ctx.$t('variables.please_enter_value')),
            autocomplete: "off",
            maxlength: "50",
            clearable: true,
        }));
        const __VLS_208 = __VLS_207({
            modelValue: (__VLS_ctx.pageForm.value[0]),
            modelModifiers: { number: true, },
            placeholder: (__VLS_ctx.$t('variables.please_enter_value')),
            autocomplete: "off",
            maxlength: "50",
            clearable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_207));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "ed-range-separator separator" },
        });
        const __VLS_210 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
            modelValue: (__VLS_ctx.pageForm.value[1]),
            modelModifiers: { number: true, },
            placeholder: (__VLS_ctx.$t('variables.please_enter_value')),
            autocomplete: "off",
            maxlength: "50",
            clearable: true,
        }));
        const __VLS_212 = __VLS_211({
            modelValue: (__VLS_ctx.pageForm.value[1]),
            modelModifiers: { number: true, },
            placeholder: (__VLS_ctx.$t('variables.please_enter_value')),
            autocomplete: "off",
            maxlength: "50",
            clearable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_211));
    }
    else {
        const __VLS_214 = {}.ElDatePicker;
        /** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
        // @ts-ignore
        const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
            modelValue: (__VLS_ctx.pageForm.value),
            type: "daterange",
            valueFormat: "YYYY-MM-DD",
            rangeSeparator: "",
            startPlaceholder: (__VLS_ctx.$t('variables.start_date')),
            endPlaceholder: (__VLS_ctx.$t('variables.end_date')),
        }));
        const __VLS_216 = __VLS_215({
            modelValue: (__VLS_ctx.pageForm.value),
            type: "daterange",
            valueFormat: "YYYY-MM-DD",
            rangeSeparator: "",
            startPlaceholder: (__VLS_ctx.$t('variables.start_date')),
            endPlaceholder: (__VLS_ctx.$t('variables.end_date')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    }
    var __VLS_205;
}
var __VLS_131;
{
    const { footer: __VLS_thisSlot } = __VLS_127.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_218 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_220 = __VLS_219({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    let __VLS_222;
    let __VLS_223;
    let __VLS_224;
    const __VLS_225 = {
        onClick: (__VLS_ctx.onFormClose)
    };
    __VLS_221.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_221;
    const __VLS_226 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_228 = __VLS_227({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    let __VLS_230;
    let __VLS_231;
    let __VLS_232;
    const __VLS_233 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_229.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_229;
}
var __VLS_127;
/** @type {__VLS_StyleScopedClasses['variables']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-yet']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-or-schema']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['system-flag']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-button']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['text']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['value-list']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['value-number_date']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-range-separator']} */ ;
/** @type {__VLS_StyleScopedClasses['separator']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_40 = __VLS_39, __VLS_137 = __VLS_136;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_add_outlined: icon_add_outlined,
            IconOpeEdit: IconOpeEdit,
            IconOpeDelete: IconOpeDelete,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            EmptyBackground: EmptyBackground,
            t: t,
            multipleSelectionAll: multipleSelectionAll,
            keywords: keywords,
            oldKeywords: oldKeywords,
            searchLoading: searchLoading,
            selectable: selectable,
            dialogFormVisible: dialogFormVisible,
            multipleTableRef: multipleTableRef,
            isIndeterminate: isIndeterminate,
            checkAll: checkAll,
            fieldList: fieldList,
            pageInfo: pageInfo,
            var_type: var_type,
            dialogTitle: dialogTitle,
            pageForm: pageForm,
            cancelDelete: cancelDelete,
            deleteBatchUser: deleteBatchUser,
            deleteHandler: deleteHandler,
            handleSelectionChange: handleSelectionChange,
            handleCheckAllChange: handleCheckAllChange,
            search: search,
            deleteValues: deleteValues,
            termFormRef: termFormRef,
            rules: rules,
            varTypeChange: varTypeChange,
            saveHandler: saveHandler,
            editHandler: editHandler,
            onFormClose: onFormClose,
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
