import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import arrow_down from '@/assets/svg/arrow-down.svg';
import dashboard_info from '@/assets/svg/dashboard-info.svg';
import icon_edit_outlined from '@/assets/svg/icon_edit_outlined.svg';
import icon_delete from '@/assets/svg/icon_delete.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import ParamsForm from './ParamsForm.vue';
import { modelTypeOptions } from '@/entity/CommonEntity.ts';
import { base_model_options, get_supplier } from '@/entity/supplier';
import { useI18n } from 'vue-i18n';
const __VLS_props = withDefaults(defineProps(), {
    activeName: '',
    editModel: false,
});
const { t } = useI18n();
const modelForm = reactive({
    id: '',
    supplier: 0,
    name: '',
    model_type: 0,
    base_model: '',
    api_key: '',
    api_domain: '',
    config_list: [],
    protocol: 1,
});
const isCreate = ref(false);
const modelRef = ref();
const paramsFormRef = ref();
const advancedSetting = ref([]);
const paramsFormDrawer = ref(false);
const configExpand = ref(true);
let tempConfigMap = new Map();
const modelSelected = computed(() => {
    return !!modelForm.base_model;
});
const currentSupplier = computed(() => {
    if (!modelForm.supplier) {
        return null;
    }
    return get_supplier(modelForm.supplier);
});
const modelList = computed(() => {
    if (!modelForm.supplier) {
        return [];
    }
    return base_model_options(modelForm.supplier, modelForm.model_type);
});
const handleParamsEdite = (ele) => {
    isCreate.value = false;
    paramsFormDrawer.value = true;
    nextTick(() => {
        paramsFormRef.value.initForm(ele);
    });
};
const handleParamsCreate = () => {
    isCreate.value = true;
    paramsFormDrawer.value = true;
    nextTick(() => {
        paramsFormRef.value.initForm();
    });
};
const handleParamsDel = (item) => {
    advancedSetting.value = advancedSetting.value.filter((ele) => ele.id !== item.id);
};
const currentPage = ref(1);
const advancedSettingPagination = computed(() => {
    return advancedSetting.value.slice(currentPage.value * 5 - 5, currentPage.value * 5);
});
const handleCurrentChange = (val) => {
    currentPage.value = val;
};
const rules = computed(() => ({
    model_type: [
        {
            required: true,
            message: 'type',
            trigger: 'change',
        },
    ],
    api_domain: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('model.api_domain_name'),
            trigger: 'blur',
        },
    ],
    base_model: [{ required: true, message: t('model.the_basic_model_de'), trigger: 'change' }],
    name: [
        { required: true, message: t('model.the_basic_model'), trigger: 'blur' },
        {
            max: 100,
            message: t('model.length_max_error', { msg: t('model.model_name'), max: 100 }),
            trigger: 'blur',
        },
    ],
    api_key: [
        {
            required: !currentSupplier.value?.is_private,
            message: t('datasource.please_enter') + t('common.empty') + 'API Key',
            trigger: 'blur',
        },
    ],
}));
onMounted(() => {
    setTimeout(() => {
        modelRef.value.clearValidate();
    }, 100);
});
const addParams = () => {
    paramsFormRef.value.submit();
};
const duplicateName = async (item) => {
    const arr = advancedSetting.value.filter((ele) => ele.id !== item.id);
    const names = arr.map((ele) => ele.name);
    const keys = arr.map((ele) => ele.key);
    if (names.includes(item.name)) {
        ElMessage.error(t('embedded.duplicate_name'));
        return;
    }
    if (keys.includes(item.key)) {
        ElMessage.error(t('embedded.repeating_parameters'));
        return;
    }
    if (isCreate.value) {
        advancedSetting.value.push({ ...item, id: +new Date() });
        beforeClose();
        tempConfigMap.set(`${modelForm.supplier}-${modelForm.base_model}`, [...advancedSetting.value]);
        return;
    }
    for (const key in advancedSetting.value) {
        const element = advancedSetting.value[key];
        if (element.id === item.id) {
            Object.assign(element, { ...item });
        }
    }
    tempConfigMap.set(`${modelForm.supplier}-${modelForm.base_model}`, [...advancedSetting.value]);
    beforeClose();
};
const submit = (item) => {
    duplicateName(item);
};
const beforeClose = () => {
    paramsFormRef.value.close();
    paramsFormDrawer.value = false;
};
const supplierChang = (supplier) => {
    modelForm.supplier = supplier.id;
    modelForm.model_type = 0;
    const config = supplier.model_config[modelForm.model_type];
    modelForm.api_domain = config.api_domain;
    modelForm.base_model = '';
    modelForm.protocol = supplier.type === 'vllm' ? 2 : 1;
    advancedSetting.value = [];
};
let curId = +new Date();
const initForm = (item) => {
    modelForm.id = '';
    modelRef.value.clearValidate();
    tempConfigMap = new Map();
    if (item) {
        Object.assign(modelForm, { ...item });
        if (item?.config_list?.length) {
            advancedSetting.value = item.config_list;
            advancedSetting.value.forEach((ele) => {
                if (!ele.id) {
                    ele.id = curId;
                    curId += 1;
                }
            });
        }
        else {
            advancedSetting.value = [];
        }
        tempConfigMap.set(`${modelForm.supplier}-${modelForm.base_model}`, [...advancedSetting.value]);
    }
};
const formatAdvancedSetting = (list) => {
    const setting_list = [
        ...list.map((item) => {
            return { id: ++curId, name: item.name, key: item.key, val: item.val };
        }),
    ];
    advancedSetting.value = setting_list;
};
const baseModelChange = (val) => {
    if (!val || !modelForm.supplier) {
        return;
    }
    const current_model = modelList.value?.find((model) => model.name == val);
    if (current_model) {
        modelForm.api_domain = current_model.api_domain || getSupplierDomain() || '';
    }
    const current_config_list = tempConfigMap.get(`${modelForm.supplier}-${modelForm.base_model}`);
    if (current_config_list) {
        formatAdvancedSetting(current_config_list);
        return;
    }
    const defaultArgs = getModelDefaultArgs();
    if (defaultArgs?.size) {
        const defaultArgsList = [...defaultArgs.values()];
        formatAdvancedSetting(defaultArgsList);
        tempConfigMap.set(`${modelForm.supplier}-${modelForm.base_model}`, [...advancedSetting.value]);
    }
};
const getSupplierDomain = () => {
    return currentSupplier.value?.model_config[modelForm.model_type || 0].api_domain;
};
const getModelDefaultArgs = () => {
    if (!modelForm.supplier || !modelForm.base_model) {
        return null;
    }
    const model_config = currentSupplier.value?.model_config[modelForm.model_type || 0];
    const common_args = model_config?.common_args || [];
    const current_model = modelList.value?.find((model) => model.name == modelForm.base_model);
    if (current_model?.args?.length) {
        const modelArgs = current_model.args;
        common_args.push(...modelArgs);
    }
    const argMap = common_args.reduce((acc, item) => {
        acc.set(item.key, { ...item, name: item.key });
        return acc;
    }, new Map());
    return argMap;
};
const emits = defineEmits(['submit']);
const submitModel = () => {
    modelRef.value.validate((res) => {
        if (res) {
            emits('submit', {
                ...modelForm,
                config_list: [
                    ...advancedSetting.value.map((item) => {
                        return { key: item.key, name: item.name, val: item.val };
                    }),
                ],
            });
        }
    });
};
const __VLS_exposed = {
    initForm,
    submitModel,
    supplierChang,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    activeName: '',
    editModel: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-form-item__label']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-table']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "model-form" },
    ...{ class: (__VLS_ctx.editModel && 'is-edit_model') },
});
if (!__VLS_ctx.editModel) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "model-name" },
    });
    (__VLS_ctx.activeName);
}
const __VLS_0 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-content" },
});
const __VLS_4 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onSubmit': {} },
    ref: "modelRef",
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    model: (__VLS_ctx.modelForm),
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onSubmit': {} },
    ref: "modelRef",
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    model: (__VLS_ctx.modelForm),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.modelRef} */ ;
var __VLS_12 = {};
__VLS_7.slots.default;
const __VLS_14 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    ...{ class: "custom-require flex-inline" },
    prop: "name",
}));
const __VLS_16 = __VLS_15({
    ...{ class: "custom-require flex-inline" },
    prop: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_17.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "custom-require_danger" },
    });
    (__VLS_ctx.t('model.model_name'));
    const __VLS_18 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
        effect: "dark",
        content: (__VLS_ctx.t('model.custom_model_name')),
        placement: "right",
    }));
    const __VLS_20 = __VLS_19({
        effect: "dark",
        content: (__VLS_ctx.t('model.custom_model_name')),
        placement: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_21.slots.default;
    const __VLS_22 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_24 = __VLS_23({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_25.slots.default;
    const __VLS_26 = {}.dashboard_info;
    /** @type {[typeof __VLS_components.Dashboard_info, typeof __VLS_components.dashboard_info, typeof __VLS_components.Dashboard_info, typeof __VLS_components.dashboard_info, ]} */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({}));
    const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
    var __VLS_25;
    var __VLS_21;
}
const __VLS_30 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.modelForm.name),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.model_name')),
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.modelForm.name),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.model_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
var __VLS_17;
const __VLS_34 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    prop: "model_type",
    label: (__VLS_ctx.t('model.model_type')),
}));
const __VLS_36 = __VLS_35({
    prop: "model_type",
    label: (__VLS_ctx.t('model.model_type')),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
const __VLS_38 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    modelValue: (__VLS_ctx.modelForm.model_type),
    ...{ style: {} },
    disabled: true,
}));
const __VLS_40 = __VLS_39({
    modelValue: (__VLS_ctx.modelForm.model_type),
    ...{ style: {} },
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.modelTypeOptions))) {
    const __VLS_42 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
        key: (item.value),
        label: (item.i18nKey ? __VLS_ctx.$t(item.i18nKey) : item.label),
        value: (item.value),
    }));
    const __VLS_44 = __VLS_43({
        key: (item.value),
        label: (item.i18nKey ? __VLS_ctx.$t(item.i18nKey) : item.label),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
}
var __VLS_41;
var __VLS_37;
const __VLS_46 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    ...{ class: "custom-require" },
    prop: "base_model",
}));
const __VLS_48 = __VLS_47({
    ...{ class: "custom-require" },
    prop: "base_model",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_49.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "custom-require_danger" },
    });
    (__VLS_ctx.t('model.basic_model'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "enter" },
    });
    (__VLS_ctx.t('model.enter_to_add'));
}
const __VLS_50 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.modelForm['base_model']),
    ...{ style: {} },
    filterable: true,
    allowCreate: true,
    defaultFirstOption: true,
    reserveKeyword: (false),
}));
const __VLS_52 = __VLS_51({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.modelForm['base_model']),
    ...{ style: {} },
    filterable: true,
    allowCreate: true,
    defaultFirstOption: true,
    reserveKeyword: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_54;
let __VLS_55;
let __VLS_56;
const __VLS_57 = {
    onChange: (__VLS_ctx.baseModelChange)
};
__VLS_53.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.modelList))) {
    const __VLS_58 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        key: (item.name),
        label: (item.name),
        value: (item.name),
    }));
    const __VLS_60 = __VLS_59({
        key: (item.name),
        label: (item.name),
        value: (item.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
}
var __VLS_53;
var __VLS_49;
if (__VLS_ctx.modelSelected) {
    const __VLS_62 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        prop: "api_domain",
        label: (__VLS_ctx.t('model.api_domain_name')),
    }));
    const __VLS_64 = __VLS_63({
        prop: "api_domain",
        label: (__VLS_ctx.t('model.api_domain_name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_65.slots.default;
    const __VLS_66 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        modelValue: (__VLS_ctx.modelForm.api_domain),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.api_domain_name')),
    }));
    const __VLS_68 = __VLS_67({
        modelValue: (__VLS_ctx.modelForm.api_domain),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.api_domain_name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    var __VLS_65;
}
if (__VLS_ctx.modelSelected) {
    const __VLS_70 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        prop: "api_key",
        label: "API Key",
    }));
    const __VLS_72 = __VLS_71({
        prop: "api_key",
        label: "API Key",
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_73.slots.default;
    const __VLS_74 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        modelValue: (__VLS_ctx.modelForm.api_key),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + 'API Key'),
        type: "password",
        showPassword: true,
    }));
    const __VLS_76 = __VLS_75({
        modelValue: (__VLS_ctx.modelForm.api_key),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + 'API Key'),
        type: "password",
        showPassword: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    var __VLS_73;
}
var __VLS_7;
if (__VLS_ctx.modelSelected) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.modelSelected))
                    return;
                __VLS_ctx.configExpand = !__VLS_ctx.configExpand;
            } },
        ...{ class: "advance-setting" },
        ...{ class: (__VLS_ctx.configExpand && 'expand') },
    });
    (__VLS_ctx.t('model.advanced_settings'));
    const __VLS_78 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        size: "16",
    }));
    const __VLS_80 = __VLS_79({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    __VLS_81.slots.default;
    const __VLS_82 = {}.arrow_down;
    /** @type {[typeof __VLS_components.Arrow_down, typeof __VLS_components.arrow_down, typeof __VLS_components.Arrow_down, typeof __VLS_components.arrow_down, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({}));
    const __VLS_84 = __VLS_83({}, ...__VLS_functionalComponentArgsRest(__VLS_83));
    var __VLS_81;
}
if (__VLS_ctx.modelSelected && __VLS_ctx.configExpand) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "model-params" },
    });
    (__VLS_ctx.t('model.model_parameters'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (__VLS_ctx.handleParamsCreate) },
        ...{ class: "btn" },
    });
    const __VLS_86 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        size: "16",
    }));
    const __VLS_88 = __VLS_87({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_89.slots.default;
    const __VLS_90 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
    const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
    var __VLS_89;
    (__VLS_ctx.t('model.add'));
}
if (__VLS_ctx.modelSelected && __VLS_ctx.configExpand) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-table" },
        ...{ class: (!__VLS_ctx.advancedSettingPagination.length && 'bottom-border') },
    });
    const __VLS_94 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        data: (__VLS_ctx.advancedSettingPagination),
        ...{ style: {} },
    }));
    const __VLS_96 = __VLS_95({
        data: (__VLS_ctx.advancedSettingPagination),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_97.slots.default;
    const __VLS_98 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
        prop: "key",
        label: (__VLS_ctx.t('model.parameters')),
        width: "280",
    }));
    const __VLS_100 = __VLS_99({
        prop: "key",
        label: (__VLS_ctx.t('model.parameters')),
        width: "280",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    const __VLS_102 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
        prop: "name",
        label: (__VLS_ctx.t('model.display_name')),
        width: "280",
    }));
    const __VLS_104 = __VLS_103({
        prop: "name",
        label: (__VLS_ctx.t('model.display_name')),
        width: "280",
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    const __VLS_106 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
        prop: "val",
        showOverflowTooltip: true,
        label: (__VLS_ctx.t('model.parameter_value')),
    }));
    const __VLS_108 = __VLS_107({
        prop: "val",
        showOverflowTooltip: true,
        label: (__VLS_ctx.t('model.parameter_value')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_110 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        fixed: "right",
        width: "80",
        className: "operation-column_text",
        label: (__VLS_ctx.$t('ds.actions')),
    }));
    const __VLS_112 = __VLS_111({
        fixed: "right",
        width: "80",
        className: "operation-column_text",
        label: (__VLS_ctx.$t('ds.actions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    __VLS_113.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_113.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_114 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }));
        const __VLS_116 = __VLS_115({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        let __VLS_118;
        let __VLS_119;
        let __VLS_120;
        const __VLS_121 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.modelSelected && __VLS_ctx.configExpand))
                    return;
                __VLS_ctx.handleParamsEdite(scope.row);
            }
        };
        __VLS_117.slots.default;
        const __VLS_122 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
            size: "16",
        }));
        const __VLS_124 = __VLS_123({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        __VLS_125.slots.default;
        const __VLS_126 = {}.icon_edit_outlined;
        /** @type {[typeof __VLS_components.Icon_edit_outlined, typeof __VLS_components.icon_edit_outlined, typeof __VLS_components.Icon_edit_outlined, typeof __VLS_components.icon_edit_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({}));
        const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
        var __VLS_125;
        var __VLS_117;
        const __VLS_130 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }));
        const __VLS_132 = __VLS_131({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        let __VLS_134;
        let __VLS_135;
        let __VLS_136;
        const __VLS_137 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.modelSelected && __VLS_ctx.configExpand))
                    return;
                __VLS_ctx.handleParamsDel(scope.row);
            }
        };
        __VLS_133.slots.default;
        const __VLS_138 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
            size: "16",
        }));
        const __VLS_140 = __VLS_139({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        __VLS_141.slots.default;
        const __VLS_142 = {}.icon_delete;
        /** @type {[typeof __VLS_components.Icon_delete, typeof __VLS_components.icon_delete, typeof __VLS_components.Icon_delete, typeof __VLS_components.icon_delete, ]} */ ;
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({}));
        const __VLS_144 = __VLS_143({}, ...__VLS_functionalComponentArgsRest(__VLS_143));
        var __VLS_141;
        var __VLS_133;
    }
    var __VLS_113;
    var __VLS_97;
}
if (__VLS_ctx.modelSelected && __VLS_ctx.advancedSetting.length > 5 && __VLS_ctx.configExpand) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-table_pagination" },
    });
    const __VLS_146 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
        ...{ 'onCurrentChange': {} },
        defaultPageSize: (5),
        layout: "prev, pager, next",
        total: (__VLS_ctx.advancedSetting.length),
    }));
    const __VLS_148 = __VLS_147({
        ...{ 'onCurrentChange': {} },
        defaultPageSize: (5),
        layout: "prev, pager, next",
        total: (__VLS_ctx.advancedSetting.length),
    }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    let __VLS_150;
    let __VLS_151;
    let __VLS_152;
    const __VLS_153 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_149;
}
var __VLS_3;
const __VLS_154 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    modelValue: (__VLS_ctx.paramsFormDrawer),
    size: (600),
    beforeClose: (__VLS_ctx.beforeClose),
    title: (__VLS_ctx.isCreate
        ? __VLS_ctx.$t('model.add') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.parameters')
        : __VLS_ctx.$t('datasource.edit') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.parameters')),
}));
const __VLS_156 = __VLS_155({
    modelValue: (__VLS_ctx.paramsFormDrawer),
    size: (600),
    beforeClose: (__VLS_ctx.beforeClose),
    title: (__VLS_ctx.isCreate
        ? __VLS_ctx.$t('model.add') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.parameters')
        : __VLS_ctx.$t('datasource.edit') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.parameters')),
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
/** @type {[typeof ParamsForm, typeof ParamsForm, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(ParamsForm, new ParamsForm({
    ...{ 'onSubmit': {} },
    ref: "paramsFormRef",
}));
const __VLS_159 = __VLS_158({
    ...{ 'onSubmit': {} },
    ref: "paramsFormRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
let __VLS_161;
let __VLS_162;
let __VLS_163;
const __VLS_164 = {
    onSubmit: (__VLS_ctx.submit)
};
/** @type {typeof __VLS_ctx.paramsFormRef} */ ;
var __VLS_165 = {};
var __VLS_160;
{
    const { footer: __VLS_thisSlot } = __VLS_157.slots;
    const __VLS_167 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_169 = __VLS_168({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_168));
    let __VLS_171;
    let __VLS_172;
    let __VLS_173;
    const __VLS_174 = {
        onClick: (__VLS_ctx.beforeClose)
    };
    __VLS_170.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_170;
    const __VLS_175 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_177 = __VLS_176({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    let __VLS_179;
    let __VLS_180;
    let __VLS_181;
    const __VLS_182 = {
        onClick: (__VLS_ctx.addParams)
    };
    __VLS_178.slots.default;
    (__VLS_ctx.isCreate ? __VLS_ctx.t('model.add') : __VLS_ctx.t('common.save'));
    var __VLS_178;
}
var __VLS_157;
/** @type {__VLS_StyleScopedClasses['model-form']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-require']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-require_danger']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-require']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-require_danger']} */ ;
/** @type {__VLS_StyleScopedClasses['enter']} */ ;
/** @type {__VLS_StyleScopedClasses['advance-setting']} */ ;
/** @type {__VLS_StyleScopedClasses['model-params']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['params-table']} */ ;
/** @type {__VLS_StyleScopedClasses['params-table_pagination']} */ ;
// @ts-ignore
var __VLS_13 = __VLS_12, __VLS_166 = __VLS_165;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            arrow_down: arrow_down,
            dashboard_info: dashboard_info,
            icon_edit_outlined: icon_edit_outlined,
            icon_delete: icon_delete,
            icon_add_outlined: icon_add_outlined,
            ParamsForm: ParamsForm,
            modelTypeOptions: modelTypeOptions,
            t: t,
            modelForm: modelForm,
            isCreate: isCreate,
            modelRef: modelRef,
            paramsFormRef: paramsFormRef,
            advancedSetting: advancedSetting,
            paramsFormDrawer: paramsFormDrawer,
            configExpand: configExpand,
            modelSelected: modelSelected,
            modelList: modelList,
            handleParamsEdite: handleParamsEdite,
            handleParamsCreate: handleParamsCreate,
            handleParamsDel: handleParamsDel,
            advancedSettingPagination: advancedSettingPagination,
            handleCurrentChange: handleCurrentChange,
            rules: rules,
            addParams: addParams,
            submit: submit,
            beforeClose: beforeClose,
            baseModelChange: baseModelChange,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
