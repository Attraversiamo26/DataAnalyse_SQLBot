import { ref, onMounted, reactive, unref, nextTick } from 'vue';
import icon_copy_outlined from '@/assets/svg/icon_copy_outlined.svg';
import { embeddedApi } from '@/api/embedded';
import info_yellow from '@/assets/embedded/info-yellow.svg';
import icon_invisible_outlined from '@/assets/embedded/icon_invisible_outlined.svg';
import icon_visible_outlined from '@/assets/embedded/icon_visible_outlined.svg';
import icon_refresh_outlined from '@/assets/embedded/icon_refresh_outlined.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import IconOpeEdit from '@/assets/svg/icon_edit_outlined.svg';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash-es';
const __VLS_props = defineProps({
    btnSelect: {
        type: String,
        default: '',
    },
});
// const emits = defineEmits(['btnSelectChange'])
const { t } = useI18n();
const multipleSelectionAll = ref([]);
const keywords = ref('');
const oldKeywords = ref('');
const searchLoading = ref(false);
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
const pwd = '**********';
const dialogTitle = ref('');
const defaultForm = {
    id: null,
    name: null,
    domain: null,
    type: 4,
    configuration: null,
    description: null,
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
        embeddedApi.deleteEmbedded(multipleSelectionAll.value.map((ele) => ele.id)).then(() => {
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
    ElMessageBox.confirm(t('embedded.delete', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        embeddedApi.deleteEmbedded([row.id]).then(() => {
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
const setButtonRef = (el, row) => {
    row.buttonRef = el;
};
const onClickOutside = (row) => {
    if (row.popoverRef) {
        unref(row.popoverRef).popperRef?.delayHide?.();
    }
};
const setPopoverRef = (el, row) => {
    row.popoverRef = el;
};
const cancelRefresh = (row) => {
    if (row.popoverRef) {
        unref(row.popoverRef).hide?.();
    }
};
const refresh = (row) => {
    embeddedApi
        .secret(row.id)
        .then(() => {
        ElMessage.success(t('common.update_success'));
    })
        .finally(() => {
        cancelRefresh(row);
        search();
    });
};
const search = ($event = {}) => {
    if ($event?.isComposing) {
        return;
    }
    searchLoading.value = true;
    embeddedApi
        .getList(pageInfo.currentPage, pageInfo.pageSize, { keyword: keywords.value })
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
        oldKeywords.value = keywords.value;
        searchLoading.value = false;
    });
};
const splitString = (str) => {
    if (typeof str !== 'string') {
        return [];
    }
    return str
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter((item) => item !== '');
};
const termFormRef = ref();
const validateUrl = (_, value, callback) => {
    if (value === '') {
        callback(new Error(t('datasource.please_enter') + t('common.empty') + t('embedded.cross_domain_settings')));
    }
    else {
        // var Expression = /(https?:\/\/)?([\da-z\.-]+)\.([a-z]{2,6})(:\d{1,5})?([\/\w\.-]*)*\/?(#[\S]+)?/ // eslint-disable-line
        splitString(value).forEach((tempVal) => {
            var Expression = /^https?:\/\/[^\s/?#]+(:\d+)?/i;
            var objExp = new RegExp(Expression);
            if (objExp.test(tempVal) && !tempVal.endsWith('/')) {
                callback();
            }
            else {
                callback(t('embedded.format_is_incorrect', { msg: t('embedded.domain_format_incorrect') }));
            }
        });
    }
};
const rules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('embedded.application_name'),
        },
    ],
    domain: [
        {
            required: true,
            validator: validateUrl,
            trigger: 'blur',
        },
    ],
};
const saveHandler = () => {
    termFormRef.value.validate((res) => {
        if (res) {
            const obj = unref(pageForm);
            if (obj.id === '') {
                delete obj.id;
            }
            const req = obj.id ? embeddedApi.updateEmbedded : embeddedApi.addEmbedded;
            req(obj).then(() => {
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
        const { id, name, domain, type, configuration, description } = row;
        pageForm.value.id = id;
        pageForm.value.name = name;
        pageForm.value.domain = domain;
        pageForm.value.type = type;
        pageForm.value.configuration = configuration;
        pageForm.value.description = description;
    }
    dialogTitle.value = row?.id ? t('embedded.edit_app') : t('embedded.create_application');
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
const { copy } = useClipboard({ legacy: true });
const copyCode = (row, key = 'app_secret') => {
    copy(row[key])
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
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
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['not-allow']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "embedded-page" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.searchLoading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
(__VLS_ctx.t('embedded.embedded_management'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('dashboard.search')),
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('dashboard.search')),
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
(__VLS_ctx.$t('embedded.create_application'));
var __VLS_19;
if (!__VLS_ctx.searchLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
        ...{ class: (__VLS_ctx.multipleSelectionAll?.length > 0 && 'show-pagination_height') },
    });
    if (!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
        /** @type {[typeof EmptyBackground, ]} */ ;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
            ...{ class: "datasource-yet" },
            description: (__VLS_ctx.$t('embedded.no_application')),
            imgType: "noneWhite",
        }));
        const __VLS_29 = __VLS_28({
            ...{ class: "datasource-yet" },
            description: (__VLS_ctx.$t('embedded.no_application')),
            imgType: "noneWhite",
        }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_31 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_33 = __VLS_32({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        let __VLS_35;
        let __VLS_36;
        let __VLS_37;
        const __VLS_38 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.searchLoading))
                    return;
                if (!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                    return;
                __VLS_ctx.editHandler(null);
            }
        };
        __VLS_34.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_34.slots;
            const __VLS_39 = {}.icon_add_outlined;
            /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({}));
            const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
        }
        (__VLS_ctx.$t('embedded.create_application'));
        var __VLS_34;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-or-schema" },
        });
        const __VLS_43 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
            ...{ 'onSelectionChange': {} },
            ref: "multipleTableRef",
            data: (__VLS_ctx.fieldList),
            ...{ style: {} },
        }));
        const __VLS_45 = __VLS_44({
            ...{ 'onSelectionChange': {} },
            ref: "multipleTableRef",
            data: (__VLS_ctx.fieldList),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        let __VLS_47;
        let __VLS_48;
        let __VLS_49;
        const __VLS_50 = {
            onSelectionChange: (__VLS_ctx.handleSelectionChange)
        };
        /** @type {typeof __VLS_ctx.multipleTableRef} */ ;
        var __VLS_51 = {};
        __VLS_46.slots.default;
        const __VLS_53 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            selectable: (__VLS_ctx.selectable),
            type: "selection",
            width: "55",
        }));
        const __VLS_55 = __VLS_54({
            selectable: (__VLS_ctx.selectable),
            type: "selection",
            width: "55",
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        const __VLS_57 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
            prop: "name",
            label: (__VLS_ctx.$t('embedded.application_name')),
            width: "280",
        }));
        const __VLS_59 = __VLS_58({
            prop: "name",
            label: (__VLS_ctx.$t('embedded.application_name')),
            width: "280",
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        const __VLS_61 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            prop: "app_id",
            label: "APP ID",
            width: "240",
        }));
        const __VLS_63 = __VLS_62({
            prop: "app_id",
            label: "APP ID",
            width: "240",
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        __VLS_64.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_64.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "user-status-container" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                title: (scope.row.app_id),
                ...{ class: "ellipsis" },
                ...{ style: {} },
            });
            (scope.row.app_id);
            const __VLS_65 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
                offset: (12),
                effect: "dark",
                content: (__VLS_ctx.t('datasource.copy')),
                placement: "top",
            }));
            const __VLS_67 = __VLS_66({
                offset: (12),
                effect: "dark",
                content: (__VLS_ctx.t('datasource.copy')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_66));
            __VLS_68.slots.default;
            const __VLS_69 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
                ...{ 'onClick': {} },
                size: "16",
                ...{ class: "hover-icon_with_bg" },
            }));
            const __VLS_71 = __VLS_70({
                ...{ 'onClick': {} },
                size: "16",
                ...{ class: "hover-icon_with_bg" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_70));
            let __VLS_73;
            let __VLS_74;
            let __VLS_75;
            const __VLS_76 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.copyCode(scope.row, 'app_id');
                }
            };
            __VLS_72.slots.default;
            const __VLS_77 = {}.icon_copy_outlined;
            /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
            const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
            var __VLS_72;
            var __VLS_68;
        }
        var __VLS_64;
        const __VLS_81 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
            prop: "app_secret",
            label: "APP Secret",
            width: "240",
        }));
        const __VLS_83 = __VLS_82({
            prop: "app_secret",
            label: "APP Secret",
            width: "240",
        }, ...__VLS_functionalComponentArgsRest(__VLS_82));
        __VLS_84.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_84.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "user-status-container" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                title: (scope.row.showPwd ? scope.row.app_secret : __VLS_ctx.pwd),
                ...{ class: "ellipsis" },
                ...{ style: {} },
            });
            (scope.row.showPwd ? scope.row.app_secret : __VLS_ctx.pwd);
            const __VLS_85 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
                offset: (12),
                effect: "dark",
                content: (__VLS_ctx.t('datasource.copy')),
                placement: "top",
            }));
            const __VLS_87 = __VLS_86({
                offset: (12),
                effect: "dark",
                content: (__VLS_ctx.t('datasource.copy')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            __VLS_88.slots.default;
            const __VLS_89 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
                ...{ 'onClick': {} },
                ...{ class: "hover-icon_with_bg" },
                size: "16",
            }));
            const __VLS_91 = __VLS_90({
                ...{ 'onClick': {} },
                ...{ class: "hover-icon_with_bg" },
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_90));
            let __VLS_93;
            let __VLS_94;
            let __VLS_95;
            const __VLS_96 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.copyCode(scope.row);
                }
            };
            __VLS_92.slots.default;
            const __VLS_97 = {}.icon_copy_outlined;
            /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
            const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
            var __VLS_92;
            var __VLS_88;
            if (scope.row.showPwd) {
                const __VLS_101 = {}.ElTooltip;
                /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
                // @ts-ignore
                const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
                    offset: (12),
                    effect: "dark",
                    content: (__VLS_ctx.t('embedded.click_to_hide')),
                    placement: "top",
                }));
                const __VLS_103 = __VLS_102({
                    offset: (12),
                    effect: "dark",
                    content: (__VLS_ctx.t('embedded.click_to_hide')),
                    placement: "top",
                }, ...__VLS_functionalComponentArgsRest(__VLS_102));
                __VLS_104.slots.default;
                const __VLS_105 = {}.ElIcon;
                /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                // @ts-ignore
                const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
                    ...{ 'onClick': {} },
                    ...{ class: "hover-icon_with_bg" },
                    size: "16",
                }));
                const __VLS_107 = __VLS_106({
                    ...{ 'onClick': {} },
                    ...{ class: "hover-icon_with_bg" },
                    size: "16",
                }, ...__VLS_functionalComponentArgsRest(__VLS_106));
                let __VLS_109;
                let __VLS_110;
                let __VLS_111;
                const __VLS_112 = {
                    onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.searchLoading))
                            return;
                        if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                            return;
                        if (!(scope.row.showPwd))
                            return;
                        scope.row.showPwd = false;
                    }
                };
                __VLS_108.slots.default;
                const __VLS_113 = {}.icon_visible_outlined;
                /** @type {[typeof __VLS_components.Icon_visible_outlined, typeof __VLS_components.icon_visible_outlined, typeof __VLS_components.Icon_visible_outlined, typeof __VLS_components.icon_visible_outlined, ]} */ ;
                // @ts-ignore
                const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({}));
                const __VLS_115 = __VLS_114({}, ...__VLS_functionalComponentArgsRest(__VLS_114));
                var __VLS_108;
                var __VLS_104;
            }
            if (!scope.row.showPwd) {
                const __VLS_117 = {}.ElTooltip;
                /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
                // @ts-ignore
                const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
                    offset: (12),
                    effect: "dark",
                    content: (__VLS_ctx.t('embedded.click_to_show')),
                    placement: "top",
                }));
                const __VLS_119 = __VLS_118({
                    offset: (12),
                    effect: "dark",
                    content: (__VLS_ctx.t('embedded.click_to_show')),
                    placement: "top",
                }, ...__VLS_functionalComponentArgsRest(__VLS_118));
                __VLS_120.slots.default;
                const __VLS_121 = {}.ElIcon;
                /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                // @ts-ignore
                const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
                    ...{ 'onClick': {} },
                    ...{ class: "hover-icon_with_bg" },
                    size: "16",
                }));
                const __VLS_123 = __VLS_122({
                    ...{ 'onClick': {} },
                    ...{ class: "hover-icon_with_bg" },
                    size: "16",
                }, ...__VLS_functionalComponentArgsRest(__VLS_122));
                let __VLS_125;
                let __VLS_126;
                let __VLS_127;
                const __VLS_128 = {
                    onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.searchLoading))
                            return;
                        if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                            return;
                        if (!(!scope.row.showPwd))
                            return;
                        scope.row.showPwd = true;
                    }
                };
                __VLS_124.slots.default;
                const __VLS_129 = {}.icon_invisible_outlined;
                /** @type {[typeof __VLS_components.Icon_invisible_outlined, typeof __VLS_components.icon_invisible_outlined, typeof __VLS_components.Icon_invisible_outlined, typeof __VLS_components.icon_invisible_outlined, ]} */ ;
                // @ts-ignore
                const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({}));
                const __VLS_131 = __VLS_130({}, ...__VLS_functionalComponentArgsRest(__VLS_130));
                var __VLS_124;
                var __VLS_120;
            }
            const __VLS_133 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
                ref: ((el) => {
                    __VLS_ctx.setButtonRef(el, scope.row);
                }),
                ...{ class: "hover-icon_with_bg" },
                offset: (12),
                size: "16",
            }));
            const __VLS_135 = __VLS_134({
                ref: ((el) => {
                    __VLS_ctx.setButtonRef(el, scope.row);
                }),
                ...{ class: "hover-icon_with_bg" },
                offset: (12),
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_134));
            __VLS_asFunctionalDirective(__VLS_directives.vClickOutside)(null, { ...__VLS_directiveBindingRestFields, value: (() => __VLS_ctx.onClickOutside(scope.row)) }, null, null);
            __VLS_136.slots.default;
            const __VLS_137 = {}.icon_refresh_outlined;
            /** @type {[typeof __VLS_components.Icon_refresh_outlined, typeof __VLS_components.icon_refresh_outlined, typeof __VLS_components.Icon_refresh_outlined, typeof __VLS_components.icon_refresh_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({}));
            const __VLS_139 = __VLS_138({}, ...__VLS_functionalComponentArgsRest(__VLS_138));
            var __VLS_136;
            const __VLS_141 = {}.ElPopover;
            /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
            // @ts-ignore
            const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
                ref: ((el) => {
                    __VLS_ctx.setPopoverRef(el, scope.row);
                }),
                width: (280),
                offset: (12),
                virtualTriggering: true,
                virtualRef: (scope.row.buttonRef),
                showArrow: true,
                popperClass: "box-item_refresh",
                placement: "bottom",
            }));
            const __VLS_143 = __VLS_142({
                ref: ((el) => {
                    __VLS_ctx.setPopoverRef(el, scope.row);
                }),
                width: (280),
                offset: (12),
                virtualTriggering: true,
                virtualRef: (scope.row.buttonRef),
                showArrow: true,
                popperClass: "box-item_refresh",
                placement: "bottom",
            }, ...__VLS_functionalComponentArgsRest(__VLS_142));
            __VLS_144.slots.default;
            {
                const { reference: __VLS_thisSlot } = __VLS_144.slots;
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "title" },
            });
            const __VLS_145 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
                ...{ class: "hover-icon_with_bg" },
                size: "16",
            }));
            const __VLS_147 = __VLS_146({
                ...{ class: "hover-icon_with_bg" },
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_146));
            __VLS_148.slots.default;
            const __VLS_149 = {}.info_yellow;
            /** @type {[typeof __VLS_components.Info_yellow, typeof __VLS_components.info_yellow, typeof __VLS_components.Info_yellow, typeof __VLS_components.info_yellow, ]} */ ;
            // @ts-ignore
            const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({}));
            const __VLS_151 = __VLS_150({}, ...__VLS_functionalComponentArgsRest(__VLS_150));
            var __VLS_148;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "sure" },
            });
            (__VLS_ctx.$t('embedded.your_app_secret'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tips" },
            });
            (__VLS_ctx.$t('embedded.proceed_with_caution'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "btns" },
            });
            const __VLS_153 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
                ...{ 'onClick': {} },
                secondary: true,
            }));
            const __VLS_155 = __VLS_154({
                ...{ 'onClick': {} },
                secondary: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_154));
            let __VLS_157;
            let __VLS_158;
            let __VLS_159;
            const __VLS_160 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.cancelRefresh(scope.row);
                }
            };
            __VLS_156.slots.default;
            (__VLS_ctx.t('common.cancel'));
            var __VLS_156;
            const __VLS_161 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_163 = __VLS_162({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_162));
            let __VLS_165;
            let __VLS_166;
            let __VLS_167;
            const __VLS_168 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.refresh(scope.row);
                }
            };
            __VLS_164.slots.default;
            (__VLS_ctx.t('common.confirm2'));
            var __VLS_164;
            var __VLS_144;
        }
        var __VLS_84;
        const __VLS_169 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
            prop: "domain",
            label: (__VLS_ctx.$t('embedded.cross_domain_settings')),
            showOverflowTooltip: true,
        }));
        const __VLS_171 = __VLS_170({
            prop: "domain",
            label: (__VLS_ctx.$t('embedded.cross_domain_settings')),
            showOverflowTooltip: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_170));
        const __VLS_173 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
            fixed: "right",
            width: "80",
            label: (__VLS_ctx.t('ds.actions')),
        }));
        const __VLS_175 = __VLS_174({
            fixed: "right",
            width: "80",
            label: (__VLS_ctx.t('ds.actions')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_174));
        __VLS_176.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_176.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "field-comment" },
            });
            const __VLS_177 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
                offset: (14),
                effect: "dark",
                content: (__VLS_ctx.$t('datasource.edit')),
                placement: "top",
            }));
            const __VLS_179 = __VLS_178({
                offset: (14),
                effect: "dark",
                content: (__VLS_ctx.$t('datasource.edit')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_178));
            __VLS_180.slots.default;
            const __VLS_181 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                size: "16",
            }));
            const __VLS_183 = __VLS_182({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_182));
            let __VLS_185;
            let __VLS_186;
            let __VLS_187;
            const __VLS_188 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.editHandler(scope.row);
                }
            };
            __VLS_184.slots.default;
            const __VLS_189 = {}.IconOpeEdit;
            /** @type {[typeof __VLS_components.IconOpeEdit, typeof __VLS_components.IconOpeEdit, ]} */ ;
            // @ts-ignore
            const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({}));
            const __VLS_191 = __VLS_190({}, ...__VLS_functionalComponentArgsRest(__VLS_190));
            var __VLS_184;
            var __VLS_180;
            const __VLS_193 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
                offset: (14),
                effect: "dark",
                content: (__VLS_ctx.$t('dashboard.delete')),
                placement: "top",
            }));
            const __VLS_195 = __VLS_194({
                offset: (14),
                effect: "dark",
                content: (__VLS_ctx.$t('dashboard.delete')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_194));
            __VLS_196.slots.default;
            const __VLS_197 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                size: "16",
            }));
            const __VLS_199 = __VLS_198({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_198));
            let __VLS_201;
            let __VLS_202;
            let __VLS_203;
            const __VLS_204 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.searchLoading))
                        return;
                    if (!!(!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length))
                        return;
                    __VLS_ctx.deleteHandler(scope.row);
                }
            };
            __VLS_200.slots.default;
            const __VLS_205 = {}.IconOpeDelete;
            /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
            // @ts-ignore
            const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({}));
            const __VLS_207 = __VLS_206({}, ...__VLS_functionalComponentArgsRest(__VLS_206));
            var __VLS_200;
            var __VLS_196;
        }
        var __VLS_176;
        {
            const { empty: __VLS_thisSlot } = __VLS_46.slots;
            if (!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
                /** @type {[typeof EmptyBackground, ]} */ ;
                // @ts-ignore
                const __VLS_209 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                    description: (__VLS_ctx.$t('embedded.no_application')),
                    imgType: "noneWhite",
                }));
                const __VLS_210 = __VLS_209({
                    description: (__VLS_ctx.$t('embedded.no_application')),
                    imgType: "noneWhite",
                }, ...__VLS_functionalComponentArgsRest(__VLS_209));
            }
            if (!!__VLS_ctx.oldKeywords && !__VLS_ctx.fieldList.length) {
                /** @type {[typeof EmptyBackground, ]} */ ;
                // @ts-ignore
                const __VLS_212 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
                    description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                    imgType: "tree",
                }));
                const __VLS_213 = __VLS_212({
                    description: (__VLS_ctx.$t('datasource.relevant_content_found')),
                    imgType: "tree",
                }, ...__VLS_functionalComponentArgsRest(__VLS_212));
            }
        }
        var __VLS_46;
    }
}
if (__VLS_ctx.fieldList.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_215 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }));
    const __VLS_217 = __VLS_216({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageInfo.currentPage),
        pageSize: (__VLS_ctx.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    let __VLS_219;
    let __VLS_220;
    let __VLS_221;
    const __VLS_222 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_223 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_218;
}
if (__VLS_ctx.multipleSelectionAll.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bottom-select" },
    });
    const __VLS_224 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }));
    const __VLS_226 = __VLS_225({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkAll),
        indeterminate: (__VLS_ctx.isIndeterminate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    let __VLS_228;
    let __VLS_229;
    let __VLS_230;
    const __VLS_231 = {
        onChange: (__VLS_ctx.handleCheckAllChange)
    };
    __VLS_227.slots.default;
    (__VLS_ctx.$t('datasource.select_all'));
    var __VLS_227;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.deleteBatchUser) },
        ...{ class: "danger-button" },
    });
    (__VLS_ctx.$t('dashboard.delete'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected" },
    });
    (__VLS_ctx.$t('user.selected_2_items', { msg: __VLS_ctx.multipleSelectionAll.length }));
    const __VLS_232 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_234 = __VLS_233({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    let __VLS_236;
    let __VLS_237;
    let __VLS_238;
    const __VLS_239 = {
        onClick: (__VLS_ctx.cancelDelete)
    };
    __VLS_235.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_235;
}
const __VLS_240 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
}));
const __VLS_242 = __VLS_241({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.dialogTitle),
    destroyOnClose: true,
    size: "600px",
    beforeClose: (__VLS_ctx.onFormClose),
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
const __VLS_244 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}));
const __VLS_246 = __VLS_245({
    ...{ 'onSubmit': {} },
    ref: "termFormRef",
    model: (__VLS_ctx.pageForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
let __VLS_248;
let __VLS_249;
let __VLS_250;
const __VLS_251 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.termFormRef} */ ;
var __VLS_252 = {};
__VLS_247.slots.default;
const __VLS_254 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
    prop: "name",
    label: (__VLS_ctx.t('embedded.application_name')),
}));
const __VLS_256 = __VLS_255({
    prop: "name",
    label: (__VLS_ctx.t('embedded.application_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_255));
__VLS_257.slots.default;
const __VLS_258 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
    modelValue: (__VLS_ctx.pageForm.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('embedded.application_name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}));
const __VLS_260 = __VLS_259({
    modelValue: (__VLS_ctx.pageForm.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('embedded.application_name')),
    autocomplete: "off",
    maxlength: "50",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_259));
var __VLS_257;
const __VLS_262 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({
    prop: "domain",
    label: (__VLS_ctx.t('embedded.cross_domain_settings')),
}));
const __VLS_264 = __VLS_263({
    prop: "domain",
    label: (__VLS_ctx.t('embedded.cross_domain_settings')),
}, ...__VLS_functionalComponentArgsRest(__VLS_263));
__VLS_265.slots.default;
const __VLS_266 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
    modelValue: (__VLS_ctx.pageForm.domain),
    type: "textarea",
    autosize: ({ minRows: 2 }),
    placeholder: (__VLS_ctx.$t('embedded.third_party_address')),
    autocomplete: "off",
    clearable: true,
}));
const __VLS_268 = __VLS_267({
    modelValue: (__VLS_ctx.pageForm.domain),
    type: "textarea",
    autosize: ({ minRows: 2 }),
    placeholder: (__VLS_ctx.$t('embedded.third_party_address')),
    autocomplete: "off",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
var __VLS_265;
var __VLS_247;
{
    const { footer: __VLS_thisSlot } = __VLS_243.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_270 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_272 = __VLS_271({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_271));
    let __VLS_274;
    let __VLS_275;
    let __VLS_276;
    const __VLS_277 = {
        onClick: (__VLS_ctx.onFormClose)
    };
    __VLS_273.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_273;
    const __VLS_278 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_280 = __VLS_279({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_279));
    let __VLS_282;
    let __VLS_283;
    let __VLS_284;
    const __VLS_285 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_281.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_281;
}
var __VLS_243;
/** @type {__VLS_StyleScopedClasses['embedded-page']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-yet']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-or-schema']} */ ;
/** @type {__VLS_StyleScopedClasses['user-status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['user-status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['sure']} */ ;
/** @type {__VLS_StyleScopedClasses['tips']} */ ;
/** @type {__VLS_StyleScopedClasses['btns']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-button']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_52 = __VLS_51, __VLS_253 = __VLS_252;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_copy_outlined: icon_copy_outlined,
            info_yellow: info_yellow,
            icon_invisible_outlined: icon_invisible_outlined,
            icon_visible_outlined: icon_visible_outlined,
            icon_refresh_outlined: icon_refresh_outlined,
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
            pwd: pwd,
            dialogTitle: dialogTitle,
            pageForm: pageForm,
            cancelDelete: cancelDelete,
            deleteBatchUser: deleteBatchUser,
            deleteHandler: deleteHandler,
            handleSelectionChange: handleSelectionChange,
            handleCheckAllChange: handleCheckAllChange,
            setButtonRef: setButtonRef,
            onClickOutside: onClickOutside,
            setPopoverRef: setPopoverRef,
            cancelRefresh: cancelRefresh,
            refresh: refresh,
            search: search,
            termFormRef: termFormRef,
            rules: rules,
            saveHandler: saveHandler,
            editHandler: editHandler,
            onFormClose: onFormClose,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            copyCode: copyCode,
        };
    },
    props: {
        btnSelect: {
            type: String,
            default: '',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        btnSelect: {
            type: String,
            default: '',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
