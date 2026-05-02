import { ref, reactive } from 'vue';
import { ElMessage, ElLoading } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
import { request } from '@/utils/request';
import { getSQLBotAddr } from '@/utils/utils';
const { t } = useI18n();
const dialogVisible = ref(false);
const loadingInstance = ref(null);
const casForm = ref();
const id = ref(null);
const state = reactive({
    form: reactive({
        idpUri: '',
        casCallbackDomain: getSQLBotAddr(),
        mapping: '',
    }),
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const validateUrl = (rule, value, callback) => {
    const reg = new RegExp(/(http|https):\/\/([\w.]+\/?)\S*/);
    if (!reg.test(value)) {
        callback(new Error(t('authentication.incorrect_please_re_enter')));
    }
    else {
        callback();
    }
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const validateCbUrl = (rule, value, callback) => {
    const addr = getSQLBotAddr();
    if (value === addr || `${value}/` === addr) {
        callback();
    }
    callback(new Error(t('authentication.callback_domain_name_error')));
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const validateMapping = (rule, value, callback) => {
    if (!value) {
        callback();
    }
    if (value.startsWith('{') === false || value.endsWith('}') === false) {
        callback(new Error(t('authentication.in_json_format')));
        return;
    }
    try {
        JSON.parse(value);
    }
    catch {
        callback(new Error(t('authentication.in_json_format')));
        return;
    }
    callback();
};
const rule = reactive({
    idpUri: [
        {
            required: true,
            message: t('common.require'),
            trigger: 'blur',
        },
        {
            min: 10,
            max: 255,
            message: t('common.input_limit', [10, 255]),
            trigger: 'blur',
        },
        { required: true, validator: validateUrl, trigger: 'blur' },
    ],
    casCallbackDomain: [
        {
            required: true,
            message: t('common.require'),
            trigger: 'blur',
        },
        {
            min: 10,
            max: 255,
            message: t('common.input_limit', [10, 255]),
            trigger: 'blur',
        },
        { required: true, validator: validateCbUrl, trigger: 'blur' },
    ],
    mapping: [{ required: false, validator: validateMapping, trigger: 'blur' }],
});
const edit = () => {
    showLoading();
    request
        .get('/system/authentication/1')
        .then((res) => {
        if (!res?.config) {
            return;
        }
        id.value = res.id;
        const data = JSON.parse(res.config);
        const resData = data;
        Object.keys(resData).forEach((key) => {
            const value = resData[key];
            if (value !== undefined) {
                state.form[key] = value;
            }
        });
    })
        .finally(() => {
        closeLoading();
    });
    dialogVisible.value = true;
};
const emits = defineEmits(['saved']);
const submitForm = async (formEl) => {
    if (!formEl)
        return;
    await formEl.validate((valid) => {
        if (valid) {
            const param = { ...state.form };
            const data = {
                id: 1,
                type: 1,
                config: JSON.stringify(param),
                name: 'cas',
            };
            const method = id.value
                ? request.put('/system/authentication', data, { requestOptions: { silent: true } })
                : request.post('/system/authentication', data, { requestOptions: { silent: true } });
            showLoading();
            method
                .then((res) => {
                if (!res.msg) {
                    ElMessage.success(t('common.save_success'));
                    emits('saved');
                    reset();
                }
            })
                .catch((e) => {
                if (e.message?.startsWith('sqlbot_authentication_connect_error') ||
                    e.response?.data?.startsWith('sqlbot_authentication_connect_error')) {
                    ElMessage.error(t('ds.connection_failed'));
                }
            })
                .finally(() => {
                closeLoading();
            });
        }
    });
};
const resetForm = (formEl) => {
    if (!formEl)
        return;
    formEl.resetFields();
    id.value = null;
    dialogVisible.value = false;
};
const reset = () => {
    resetForm(casForm.value);
};
const showLoading = () => {
    loadingInstance.value = ElLoading.service({
        target: '.platform-info-drawer',
    });
};
const closeLoading = () => {
    loadingInstance.value?.close();
};
const validate = () => {
    const url = '/system/authentication/status';
    const config_data = state.form;
    const data = {
        type: 1,
        name: 'cas',
        config: JSON.stringify(config_data),
    };
    showLoading();
    request
        .patch(url, data)
        .then((res) => {
        if (res) {
            ElMessage.success(t('ds.connection_success'));
        }
        else {
            ElMessage.error(t('ds.connection_failed'));
        }
    })
        .finally(() => {
        closeLoading();
        emits('saved');
    });
};
const __VLS_exposed = {
    edit,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.t('authentication.cas_settings')),
    modalClass: "platform-info-drawer",
    size: "600px",
    direction: "rtl",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.t('authentication.cas_settings')),
    modalClass: "platform-info-drawer",
    size: "600px",
    direction: "rtl",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ref: "casForm",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rule),
    labelWidth: "80px",
    labelPosition: "top",
}));
const __VLS_7 = __VLS_6({
    ref: "casForm",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rule),
    labelWidth: "80px",
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {typeof __VLS_ctx.casForm} */ ;
var __VLS_9 = {};
__VLS_8.slots.default;
const __VLS_11 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    label: "IdpUri",
    prop: "idpUri",
}));
const __VLS_13 = __VLS_12({
    label: "IdpUri",
    prop: "idpUri",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
const __VLS_15 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.state.form.idpUri),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.state.form.idpUri),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
var __VLS_14;
const __VLS_19 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    label: (__VLS_ctx.t('authentication.callback_domain_name')),
    prop: "casCallbackDomain",
}));
const __VLS_21 = __VLS_20({
    label: (__VLS_ctx.t('authentication.callback_domain_name')),
    prop: "casCallbackDomain",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
const __VLS_23 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.state.form.casCallbackDomain),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.state.form.casCallbackDomain),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
var __VLS_22;
const __VLS_27 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    label: (__VLS_ctx.t('authentication.field_mapping')),
    prop: "mapping",
}));
const __VLS_29 = __VLS_28({
    label: (__VLS_ctx.t('authentication.field_mapping')),
    prop: "mapping",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
const __VLS_31 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    modelValue: (__VLS_ctx.state.form.mapping),
    placeholder: (__VLS_ctx.t('authentication.field_mapping_placeholder')),
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.state.form.mapping),
    placeholder: (__VLS_ctx.t('authentication.field_mapping_placeholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
var __VLS_30;
var __VLS_8;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_35 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onClick: (...[$event]) => {
            __VLS_ctx.resetForm(__VLS_ctx.casForm);
        }
    };
    __VLS_38.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_38;
    const __VLS_43 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (!__VLS_ctx.state.form.idpUri),
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (!__VLS_ctx.state.form.idpUri),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_47;
    let __VLS_48;
    let __VLS_49;
    const __VLS_50 = {
        onClick: (__VLS_ctx.validate)
    };
    __VLS_46.slots.default;
    (__VLS_ctx.t('ds.test_connection'));
    var __VLS_46;
    const __VLS_51 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onClick: (...[$event]) => {
            __VLS_ctx.submitForm(__VLS_ctx.casForm);
        }
    };
    __VLS_54.slots.default;
    (__VLS_ctx.t('common.save'));
    var __VLS_54;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_10 = __VLS_9;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            t: t,
            dialogVisible: dialogVisible,
            casForm: casForm,
            state: state,
            rule: rule,
            submitForm: submitForm,
            resetForm: resetForm,
            validate: validate,
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
