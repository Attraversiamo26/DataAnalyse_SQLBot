import { ref, computed, shallowRef, reactive, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus-secondary';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import icon_admin_outlined from '@/assets/svg/icon_admin_outlined.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import icon_done_outlined from '@/assets/svg/icon_done_outlined.svg';
import icon_close_outlined from '@/assets/svg/operate/ope-close.svg';
import ModelList from './ModelList.vue';
import ModelListSide from './ModelListSide.vue';
import ModelForm from './ModelForm.vue';
import { modelApi } from '@/api/system';
import Card from './Card.vue';
import { getModelTypeName } from '@/entity/CommonEntity.ts';
import { useI18n } from 'vue-i18n';
import { get_supplier } from '@/entity/supplier';
import { highlightKeyword } from '@/utils/xss';
const { t } = useI18n();
const keywords = ref('');
const defaultModelKeywords = ref('');
const modelConfigvVisible = ref(false);
const searchLoading = ref(false);
const editModel = ref(false);
const activeStep = ref(0);
const activeName = ref('');
const activeNameI18nKey = ref('');
const activeType = ref('');
const modelFormRef = ref();
const cardRefs = ref([]);
const showCardError = ref(false); // if you don`t want card mask error, just change this to false
reactive({
    form: {
        id: '',
        name: '',
        model_type: 0,
        api_key: '',
        api_domain: '',
    },
    selectedIds: [],
});
const modelList = shallowRef([]);
const modelListWithSearch = computed(() => {
    if (!keywords.value)
        return modelList.value;
    return modelList.value.filter((ele) => ele.name.toLowerCase().includes(keywords.value.toLowerCase()));
});
const beforeClose = () => {
    modelConfigvVisible.value = false;
};
const defaultModelListWithSearch = computed(() => {
    let tempModelList = modelList.value;
    if (defaultModelKeywords.value) {
        tempModelList = tempModelList.filter((ele) => ele.name.toLowerCase().includes(defaultModelKeywords.value.toLowerCase()));
    }
    return tempModelList.map((item) => {
        item['supplier_item'] = get_supplier(item.supplier);
        return item;
    });
});
const modelCheckHandler = async (item) => {
    const response = await modelApi.check(item);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let checkTimeout = false;
    setTimeout(() => {
        checkTimeout = true;
    }, 9000);
    let checkMsg = '';
    while (true) {
        if (checkTimeout) {
            break;
        }
        const { done, value } = await reader.read();
        if (done)
            break;
        const lines = decoder.decode(value).trim().split('\n');
        for (const line of lines) {
            const data = JSON.parse(line);
            if (data.error) {
                checkMsg += data.error;
            }
            else if (data.content) {
                console.debug(data.content);
            }
        }
    }
    if (!checkMsg) {
        return;
    }
    console.error(checkMsg);
    if (!showCardError.value) {
        ElMessage.error(checkMsg);
        return;
    }
    nextTick(() => {
        const index = modelListWithSearch.value.findIndex((el) => el.id === item.id);
        if (index > -1) {
            const currentRef = cardRefs.value[index];
            currentRef?.showErrorMask(checkMsg);
        }
    });
};
const duplicateName = async (item) => {
    const res = await modelApi.queryAll();
    const names = res.filter((ele) => ele.id !== item.id).map((ele) => ele.name);
    if (names.includes(item.name)) {
        ElMessage.error(t('embedded.duplicate_name'));
        return;
    }
    const param = {
        ...item,
    };
    if (!item.id) {
        modelApi.add(param).then(() => {
            beforeClose();
            search();
            ElMessage({
                type: 'success',
                message: t('workspace.add_successfully'),
            });
            modelCheckHandler(item);
        });
        return;
    }
    modelApi.edit(param).then(() => {
        beforeClose();
        search();
        ElMessage({
            type: 'success',
            message: t('common.save_success'),
        });
        modelCheckHandler(item);
    });
};
const handleDefaultModelChange = (item) => {
    const current_default_node = modelList.value.find((ele) => ele.default_model);
    if (current_default_node?.id === item.id) {
        return;
    }
    ElMessageBox.confirm(t('model.system_default_model', { msg: item.name }), {
        confirmButtonType: 'primary',
        tip: t('model.operate_with_caution'),
        confirmButtonText: t('datasource.confirm'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
        callback: (val) => {
            if (val === 'confirm') {
                modelApi.setDefault(item.id).then(() => {
                    ElMessage.success(t('model.set_successfully'));
                    search();
                });
            }
        },
    });
};
const formatKeywords = (item) => {
    // Use XSS-safe highlight function
    return highlightKeyword(item, defaultModelKeywords.value, 'isSearch');
};
const handleAddModel = () => {
    activeStep.value = 0;
    editModel.value = false;
    modelConfigvVisible.value = true;
};
const handleEditModel = (row) => {
    activeStep.value = 1;
    editModel.value = true;
    activeType.value = row.supplier;
    activeName.value = row.supplier_item.name;
    activeNameI18nKey.value = row.supplier_item.i18nKey;
    modelApi.query(row.id).then((res) => {
        modelConfigvVisible.value = true;
        nextTick(() => {
            modelFormRef.value.initForm({ ...res });
        });
    });
};
const handleDefault = (row) => {
    if (row.default_model)
        return;
    ElMessageBox.confirm(t('model.system_default_model', { msg: row.name }), {
        confirmButtonType: 'primary',
        tip: t('model.operate_with_caution'),
        confirmButtonText: t('datasource.confirm'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
        callback: (val) => {
            if (val === 'confirm') {
                modelApi.setDefault(row.id).then(() => {
                    ElMessage.success(t('model.set_successfully'));
                    search();
                });
            }
        },
    });
};
const deleteHandler = (item) => {
    if (item.default_model) {
        ElMessageBox.confirm(t('model.del_default_tip', { msg: item.name }), {
            confirmButtonType: 'primary',
            tip: t('model.del_default_warn'),
            showConfirmButton: false,
            confirmButtonText: t('datasource.confirm'),
            cancelButtonText: t('datasource.got_it'),
            customClass: 'confirm-no_icon',
            autofocus: false,
            callback: (val) => {
                console.info(val);
            },
        });
        return;
    }
    ElMessageBox.confirm(t('model.del_warn_tip', { msg: item.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
        callback: (value) => {
            if (value === 'confirm') {
                modelApi.delete(item.id).then(() => {
                    ElMessage({
                        type: 'success',
                        message: t('dashboard.delete_success'),
                    });
                    search();
                });
            }
        },
    });
};
const clickModel = (ele) => {
    activeStep.value = 1;
    supplierChang(ele);
};
const supplierChang = (ele) => {
    activeName.value = ele.name;
    activeNameI18nKey.value = ele.i18nKey;
    nextTick(() => {
        modelFormRef.value.supplierChang({ ...ele });
    });
};
const cancel = () => {
    beforeClose();
};
const preStep = () => {
    activeStep.value = 0;
};
const saveModel = () => {
    modelFormRef.value.submitModel();
};
const setCardRef = (el, index) => {
    if (el) {
        cardRefs.value[index] = el;
    }
};
const search = () => {
    searchLoading.value = true;
    modelApi
        .queryAll()
        .then((res) => {
        modelList.value = res;
    })
        .finally(() => {
        searchLoading.value = false;
    });
};
search();
const submit = (item) => {
    duplicateName(item);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "model-config no-padding" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "model-methods" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "title" },
});
(__VLS_ctx.t('model.ai_model_configuration'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "button-input" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
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
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ class: "svg-icon" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
}
var __VLS_3;
const __VLS_12 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    popperClass: "system-default_model",
    placement: "bottom-end",
}));
const __VLS_14 = __VLS_13({
    popperClass: "system-default_model",
    placement: "bottom-end",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
{
    const { reference: __VLS_thisSlot } = __VLS_15.slots;
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        secondary: true,
    }));
    const __VLS_18 = __VLS_17({
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_19.slots;
        const __VLS_20 = {}.icon_admin_outlined;
        /** @type {[typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    }
    (__VLS_ctx.t('model.system_default_model_de'));
    var __VLS_19;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover" },
});
const __VLS_24 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.defaultModelKeywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.t('datasource.search_by_name')),
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.defaultModelKeywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.t('datasource.search_by_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_28 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ class: "svg-icon" },
    }));
    const __VLS_34 = __VLS_33({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    var __VLS_31;
}
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-content" },
});
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.defaultModelListWithSearch))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleDefaultModelChange(ele);
            } },
        key: (ele.name),
        ...{ class: "popover-item" },
        ...{ class: (ele.default_model && 'isActive') },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (ele.supplier_item.icon),
        width: "24px",
        height: "24px",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "model-name ellipsis" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.formatKeywords(ele.name)) }, null, null);
    const __VLS_36 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        size: "16",
        ...{ class: "done" },
    }));
    const __VLS_38 = __VLS_37({
        size: "16",
        ...{ class: "done" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.icon_done_outlined;
    /** @type {[typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    var __VLS_39;
}
if (!__VLS_ctx.defaultModelListWithSearch.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover-item empty" },
    });
    (__VLS_ctx.t('model.relevant_results_found'));
}
var __VLS_15;
const __VLS_44 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (__VLS_ctx.handleAddModel)
};
__VLS_47.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_47.slots;
    const __VLS_52 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
    const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
}
(__VLS_ctx.t('model.add_model'));
var __VLS_47;
if (!!__VLS_ctx.keywords && !__VLS_ctx.modelListWithSearch.length) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
    }));
    const __VLS_57 = __VLS_56({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    const __VLS_59 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        gutter: (16),
        ...{ class: "w-full" },
    }));
    const __VLS_61 = __VLS_60({
        gutter: (16),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    __VLS_62.slots.default;
    for (const [ele, index] of __VLS_getVForSourceType((__VLS_ctx.modelListWithSearch))) {
        const __VLS_63 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }));
        const __VLS_65 = __VLS_64({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        __VLS_66.slots.default;
        /** @type {[typeof Card, typeof Card, ]} */ ;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent(Card, new Card({
            ...{ 'onEdit': {} },
            ...{ 'onDel': {} },
            ...{ 'onDefault': {} },
            id: (ele.id),
            ref: ((el) => __VLS_ctx.setCardRef(el, index)),
            key: (ele.id),
            name: (ele.name),
            supplier: (ele.supplier),
            modelType: (__VLS_ctx.getModelTypeName(ele['model_type'])),
            baseModel: (ele['base_model']),
            isDefault: (ele['default_model']),
        }));
        const __VLS_68 = __VLS_67({
            ...{ 'onEdit': {} },
            ...{ 'onDel': {} },
            ...{ 'onDefault': {} },
            id: (ele.id),
            ref: ((el) => __VLS_ctx.setCardRef(el, index)),
            key: (ele.id),
            name: (ele.name),
            supplier: (ele.supplier),
            modelType: (__VLS_ctx.getModelTypeName(ele['model_type'])),
            baseModel: (ele['base_model']),
            isDefault: (ele['default_model']),
        }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        let __VLS_70;
        let __VLS_71;
        let __VLS_72;
        const __VLS_73 = {
            onEdit: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.modelListWithSearch.length))
                    return;
                __VLS_ctx.handleEditModel(ele);
            }
        };
        const __VLS_74 = {
            onDel: (__VLS_ctx.deleteHandler)
        };
        const __VLS_75 = {
            onDefault: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.modelListWithSearch.length))
                    return;
                __VLS_ctx.handleDefault(ele);
            }
        };
        var __VLS_69;
        var __VLS_66;
    }
    var __VLS_62;
}
if (!__VLS_ctx.keywords && !__VLS_ctx.modelListWithSearch.length && !__VLS_ctx.searchLoading) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        ...{ class: "datasource-yet" },
        description: (__VLS_ctx.$t('common.no_model_yet')),
        imgType: "noneWhite",
    }));
    const __VLS_77 = __VLS_76({
        ...{ class: "datasource-yet" },
        description: (__VLS_ctx.$t('common.no_model_yet')),
        imgType: "noneWhite",
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_79 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_81 = __VLS_80({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    let __VLS_83;
    let __VLS_84;
    let __VLS_85;
    const __VLS_86 = {
        onClick: (__VLS_ctx.handleAddModel)
    };
    __VLS_82.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_82.slots;
        const __VLS_87 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({}));
        const __VLS_89 = __VLS_88({}, ...__VLS_functionalComponentArgsRest(__VLS_88));
    }
    (__VLS_ctx.t('model.add_model'));
    var __VLS_82;
}
const __VLS_91 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    modelValue: (__VLS_ctx.modelConfigvVisible),
    closeOnClickModal: (false),
    size: "calc(100% - 100px)",
    modalClass: "model-drawer-fullscreen",
    direction: "btt",
    destroyOnClose: true,
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}));
const __VLS_93 = __VLS_92({
    modelValue: (__VLS_ctx.modelConfigvVisible),
    closeOnClickModal: (false),
    size: "calc(100% - 100px)",
    modalClass: "model-drawer-fullscreen",
    direction: "btt",
    destroyOnClose: true,
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
__VLS_94.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_94.slots;
    const [{ close }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.editModel
        ? __VLS_ctx.$t('dashboard.edit') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t(__VLS_ctx.activeNameI18nKey)
        : __VLS_ctx.t('model.add_model'));
    if (!__VLS_ctx.editModel) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flex-center" },
            ...{ style: {} },
        });
        const __VLS_95 = {}.ElSteps;
        /** @type {[typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, ]} */ ;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
            custom: true,
            ...{ style: {} },
            active: (__VLS_ctx.activeStep),
            alignCenter: true,
        }));
        const __VLS_97 = __VLS_96({
            custom: true,
            ...{ style: {} },
            active: (__VLS_ctx.activeStep),
            alignCenter: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        __VLS_98.slots.default;
        const __VLS_99 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({}));
        const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
        __VLS_102.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_102.slots;
            (__VLS_ctx.t('model.select_supplier'));
        }
        var __VLS_102;
        const __VLS_103 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({}));
        const __VLS_105 = __VLS_104({}, ...__VLS_functionalComponentArgsRest(__VLS_104));
        __VLS_106.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_106.slots;
            (__VLS_ctx.t('model.add_model'));
        }
        var __VLS_106;
        var __VLS_98;
    }
    const __VLS_107 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
        ...{ 'onClick': {} },
        ...{ class: "ed-dialog__headerbtn mrt" },
        ...{ style: {} },
    }));
    const __VLS_109 = __VLS_108({
        ...{ 'onClick': {} },
        ...{ class: "ed-dialog__headerbtn mrt" },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    let __VLS_111;
    let __VLS_112;
    let __VLS_113;
    const __VLS_114 = {
        onClick: (close)
    };
    __VLS_110.slots.default;
    const __VLS_115 = {}.icon_close_outlined;
    /** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({}));
    const __VLS_117 = __VLS_116({}, ...__VLS_functionalComponentArgsRest(__VLS_116));
    var __VLS_110;
}
if (__VLS_ctx.activeStep === 0) {
    /** @type {[typeof ModelList, typeof ModelList, ]} */ ;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(ModelList, new ModelList({
        ...{ 'onClickModel': {} },
    }));
    const __VLS_120 = __VLS_119({
        ...{ 'onClickModel': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    let __VLS_122;
    let __VLS_123;
    let __VLS_124;
    const __VLS_125 = {
        onClickModel: (__VLS_ctx.clickModel)
    };
    var __VLS_121;
}
if (__VLS_ctx.activeStep === 1 && !__VLS_ctx.editModel) {
    /** @type {[typeof ModelListSide, typeof ModelListSide, ]} */ ;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent(ModelListSide, new ModelListSide({
        ...{ 'onClickModel': {} },
        activeName: (__VLS_ctx.activeName),
        activeType: (__VLS_ctx.activeType),
    }));
    const __VLS_127 = __VLS_126({
        ...{ 'onClickModel': {} },
        activeName: (__VLS_ctx.activeName),
        activeType: (__VLS_ctx.activeType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    let __VLS_129;
    let __VLS_130;
    let __VLS_131;
    const __VLS_132 = {
        onClickModel: (__VLS_ctx.supplierChang)
    };
    var __VLS_128;
}
if (__VLS_ctx.activeStep === 1 && __VLS_ctx.modelConfigvVisible) {
    /** @type {[typeof ModelForm, typeof ModelForm, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(ModelForm, new ModelForm({
        ...{ 'onSubmit': {} },
        ref: "modelFormRef",
        activeName: (__VLS_ctx.activeName),
        activeType: (__VLS_ctx.activeType),
        editModel: (__VLS_ctx.editModel),
    }));
    const __VLS_134 = __VLS_133({
        ...{ 'onSubmit': {} },
        ref: "modelFormRef",
        activeName: (__VLS_ctx.activeName),
        activeType: (__VLS_ctx.activeType),
        editModel: (__VLS_ctx.editModel),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    let __VLS_136;
    let __VLS_137;
    let __VLS_138;
    const __VLS_139 = {
        onSubmit: (__VLS_ctx.submit)
    };
    /** @type {typeof __VLS_ctx.modelFormRef} */ ;
    var __VLS_140 = {};
    var __VLS_135;
}
if (__VLS_ctx.activeStep !== 0) {
    {
        const { footer: __VLS_thisSlot } = __VLS_94.slots;
        const __VLS_142 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
            ...{ 'onClick': {} },
            secondary: true,
        }));
        const __VLS_144 = __VLS_143({
            ...{ 'onClick': {} },
            secondary: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_143));
        let __VLS_146;
        let __VLS_147;
        let __VLS_148;
        const __VLS_149 = {
            onClick: (__VLS_ctx.cancel)
        };
        __VLS_145.slots.default;
        (__VLS_ctx.$t('common.cancel'));
        var __VLS_145;
        if (!__VLS_ctx.editModel) {
            const __VLS_150 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
                ...{ 'onClick': {} },
                secondary: true,
            }));
            const __VLS_152 = __VLS_151({
                ...{ 'onClick': {} },
                secondary: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_151));
            let __VLS_154;
            let __VLS_155;
            let __VLS_156;
            const __VLS_157 = {
                onClick: (__VLS_ctx.preStep)
            };
            __VLS_153.slots.default;
            (__VLS_ctx.$t('ds.previous'));
            var __VLS_153;
        }
        const __VLS_158 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_160 = __VLS_159({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_159));
        let __VLS_162;
        let __VLS_163;
        let __VLS_164;
        const __VLS_165 = {
            onClick: (__VLS_ctx.saveModel)
        };
        __VLS_161.slots.default;
        (__VLS_ctx.$t('common.save'));
        var __VLS_161;
    }
}
var __VLS_94;
/** @type {__VLS_StyleScopedClasses['model-config']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['model-methods']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['button-input']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-16']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-yet']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-center']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-dialog__headerbtn']} */ ;
/** @type {__VLS_StyleScopedClasses['mrt']} */ ;
// @ts-ignore
var __VLS_141 = __VLS_140;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            icon_admin_outlined: icon_admin_outlined,
            icon_add_outlined: icon_add_outlined,
            EmptyBackground: EmptyBackground,
            icon_done_outlined: icon_done_outlined,
            icon_close_outlined: icon_close_outlined,
            ModelList: ModelList,
            ModelListSide: ModelListSide,
            ModelForm: ModelForm,
            Card: Card,
            getModelTypeName: getModelTypeName,
            t: t,
            keywords: keywords,
            defaultModelKeywords: defaultModelKeywords,
            modelConfigvVisible: modelConfigvVisible,
            searchLoading: searchLoading,
            editModel: editModel,
            activeStep: activeStep,
            activeName: activeName,
            activeNameI18nKey: activeNameI18nKey,
            activeType: activeType,
            modelFormRef: modelFormRef,
            modelListWithSearch: modelListWithSearch,
            beforeClose: beforeClose,
            defaultModelListWithSearch: defaultModelListWithSearch,
            handleDefaultModelChange: handleDefaultModelChange,
            formatKeywords: formatKeywords,
            handleAddModel: handleAddModel,
            handleEditModel: handleEditModel,
            handleDefault: handleDefault,
            deleteHandler: deleteHandler,
            clickModel: clickModel,
            supplierChang: supplierChang,
            cancel: cancel,
            preStep: preStep,
            saveModel: saveModel,
            setCardRef: setCardRef,
            submit: submit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
