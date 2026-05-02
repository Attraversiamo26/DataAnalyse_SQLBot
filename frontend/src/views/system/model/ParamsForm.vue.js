import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const paramsRef = ref();
const paramsForm = reactive({
    name: '',
    key: '',
    val: '',
    id: '',
});
const rules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('model.display_name'),
            trigger: 'blur',
        },
    ],
    key: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('model.parameters'),
            trigger: 'blur',
        },
    ],
    val: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('model.parameter_value'),
            trigger: 'blur',
        },
    ],
};
const initForm = (item) => {
    if (item) {
        Object.assign(paramsForm, { ...item });
    }
    if (!paramsForm.id) {
        paramsForm.id = `${+new Date()}`;
    }
    paramsRef.value.clearValidate();
};
const emits = defineEmits(['submit']);
const submit = () => {
    paramsRef.value.validate((res) => {
        if (res) {
            emits('submit', paramsForm);
        }
    });
};
const close = () => {
    paramsForm.name = '';
    paramsForm.key = '';
    paramsForm.val = '';
    paramsForm.id = '';
};
const __VLS_exposed = {
    initForm,
    submit,
    close,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "params-form" },
});
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSubmit': {} },
    ref: "paramsRef",
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    model: (__VLS_ctx.paramsForm),
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    ref: "paramsRef",
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    model: (__VLS_ctx.paramsForm),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.paramsRef} */ ;
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_10 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    prop: "key",
    label: (__VLS_ctx.$t('model.parameters')),
}));
const __VLS_12 = __VLS_11({
    prop: "key",
    label: (__VLS_ctx.$t('model.parameters')),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_13.slots.default;
const __VLS_14 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.paramsForm.key),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.parameters')),
}));
const __VLS_16 = __VLS_15({
    modelValue: (__VLS_ctx.paramsForm.key),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.parameters')),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
var __VLS_13;
const __VLS_18 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    prop: "name",
    label: (__VLS_ctx.$t('model.display_name')),
}));
const __VLS_20 = __VLS_19({
    prop: "name",
    label: (__VLS_ctx.$t('model.display_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    modelValue: (__VLS_ctx.paramsForm.name),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.display_name')),
}));
const __VLS_24 = __VLS_23({
    modelValue: (__VLS_ctx.paramsForm.name),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.display_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
var __VLS_21;
const __VLS_26 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    prop: "val",
    label: (__VLS_ctx.$t('model.parameter_value')),
}));
const __VLS_28 = __VLS_27({
    prop: "val",
    label: (__VLS_ctx.$t('model.parameter_value')),
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
__VLS_29.slots.default;
const __VLS_30 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.paramsForm.val),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.parameter_value')),
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.paramsForm.val),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('model.parameter_value')),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
var __VLS_29;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['params-form']} */ ;
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            paramsRef: paramsRef,
            paramsForm: paramsForm,
            rules: rules,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
