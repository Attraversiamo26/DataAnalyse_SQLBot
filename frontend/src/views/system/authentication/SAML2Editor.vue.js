import { ref, reactive } from 'vue';
import { ElMessage, ElLoading } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
import { request } from '@/utils/request';
import { getSQLBotAddr } from '@/utils/utils';
const { t } = useI18n();
const dialogVisible = ref(false);
const loadingInstance = ref(null);
const samlForm = ref();
const state = reactive({
    form: reactive({
        idpMetaUrl: '',
        privateKey: '',
        certificate: '',
        wantAuthnRequestsSigned: false,
        wantAssertionsSigned: false,
        mapping: '',
    }),
});
/* const spMetaDataUrl = ref('')
spMetaDataUrl.value = getSQLBotAddr() + 'saml/metadata' */
const rule = reactive({
/* idpUri: [
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
], */
});
const edit = () => {
    showLoading();
    request
        .get('/setting/authentication/info/saml')
        .then((res) => {
        const resData = res;
        Object.keys(resData).forEach((key) => {
            const value = resData[key];
            if (value !== undefined) {
                ;
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
            param['spEntityId'] = getSQLBotAddr() + 'saml/metadata';
            param['spAcs'] = getSQLBotAddr() + 'saml/sso';
            const method = request.post('/setting/authentication/save/saml', param);
            showLoading();
            method
                .then((res) => {
                if (!res.msg) {
                    ElMessage.success(t('common.save_success'));
                    emits('saved');
                    reset();
                }
                closeLoading();
            })
                .catch(() => {
                closeLoading();
            });
        }
    });
};
const resetForm = (formEl) => {
    if (!formEl)
        return;
    formEl.resetFields();
    dialogVisible.value = false;
};
const reset = () => {
    resetForm(samlForm.value);
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
    const url = '/setting/authentication/validate/saml2';
    const data = { ...state.form };
    data['spEntityId'] = getSQLBotAddr() + 'saml/metadata';
    data['spAcs'] = getSQLBotAddr() + 'saml/sso';
    showLoading();
    request
        .post(url, data)
        .then((res) => {
        if (res?.data === 'true') {
            ElMessage.success(t('commons.test_connect') + t('report.last_status_success'));
        }
        else {
            ElMessage.error(t('commons.test_connect') + t('report.last_status_fail'));
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
    title: (__VLS_ctx.t('system.saml.title')),
    modalClass: "platform-info-drawer",
    size: "600px",
    direction: "rtl",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.t('system.saml.title')),
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
    ref: "samlForm",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rule),
    labelWidth: "80px",
    labelPosition: "top",
}));
const __VLS_7 = __VLS_6({
    ref: "samlForm",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rule),
    labelWidth: "80px",
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {typeof __VLS_ctx.samlForm} */ ;
var __VLS_9 = {};
__VLS_8.slots.default;
const __VLS_11 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    label: "Idp MetaData Url",
    prop: "idpMetaUrl",
}));
const __VLS_13 = __VLS_12({
    label: "Idp MetaData Url",
    prop: "idpMetaUrl",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
const __VLS_15 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.state.form.idpMetaUrl),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.state.form.idpMetaUrl),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
var __VLS_14;
const __VLS_19 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    label: "开启请求签名",
    prop: "wantAuthnRequestsSigned",
}));
const __VLS_21 = __VLS_20({
    label: "开启请求签名",
    prop: "wantAuthnRequestsSigned",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
const __VLS_23 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.state.form.wantAuthnRequestsSigned),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.state.form.wantAuthnRequestsSigned),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
var __VLS_22;
const __VLS_27 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    label: "开启断言签名",
    prop: "wantAssertionsSigned",
}));
const __VLS_29 = __VLS_28({
    label: "开启断言签名",
    prop: "wantAssertionsSigned",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
const __VLS_31 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    modelValue: (__VLS_ctx.state.form.wantAssertionsSigned),
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.state.form.wantAssertionsSigned),
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
var __VLS_30;
if (__VLS_ctx.state.form.wantAuthnRequestsSigned || __VLS_ctx.state.form.wantAssertionsSigned) {
    const __VLS_35 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        label: "SP PrivateKey",
        prop: "privateKey",
    }));
    const __VLS_37 = __VLS_36({
        label: "SP PrivateKey",
        prop: "privateKey",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_38.slots.default;
    const __VLS_39 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
        modelValue: (__VLS_ctx.state.form.privateKey),
        type: "password",
        showPassword: true,
        placeholder: (__VLS_ctx.t('common.please_input')),
    }));
    const __VLS_41 = __VLS_40({
        modelValue: (__VLS_ctx.state.form.privateKey),
        type: "password",
        showPassword: true,
        placeholder: (__VLS_ctx.t('common.please_input')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    var __VLS_38;
}
if (__VLS_ctx.state.form.wantAuthnRequestsSigned || __VLS_ctx.state.form.wantAssertionsSigned) {
    const __VLS_43 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        label: "SP Certificate",
        prop: "certificate",
    }));
    const __VLS_45 = __VLS_44({
        label: "SP Certificate",
        prop: "certificate",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_46.slots.default;
    const __VLS_47 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        modelValue: (__VLS_ctx.state.form.certificate),
        type: "password",
        showPassword: true,
        placeholder: (__VLS_ctx.t('common.please_input')),
    }));
    const __VLS_49 = __VLS_48({
        modelValue: (__VLS_ctx.state.form.certificate),
        type: "password",
        showPassword: true,
        placeholder: (__VLS_ctx.t('common.please_input')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    var __VLS_46;
}
const __VLS_51 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
    label: (__VLS_ctx.t('system.field_mapping')),
    prop: "mapping",
}));
const __VLS_53 = __VLS_52({
    label: (__VLS_ctx.t('system.field_mapping')),
    prop: "mapping",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
__VLS_54.slots.default;
const __VLS_55 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    modelValue: (__VLS_ctx.state.form.mapping),
    placeholder: (__VLS_ctx.t('system.saml2name')),
}));
const __VLS_57 = __VLS_56({
    modelValue: (__VLS_ctx.state.form.mapping),
    placeholder: (__VLS_ctx.t('system.saml2name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
var __VLS_54;
var __VLS_8;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_59 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_61 = __VLS_60({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    let __VLS_63;
    let __VLS_64;
    let __VLS_65;
    const __VLS_66 = {
        onClick: (...[$event]) => {
            __VLS_ctx.resetForm(__VLS_ctx.samlForm);
        }
    };
    __VLS_62.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_62;
    const __VLS_67 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (!__VLS_ctx.state.form.idpMetaUrl),
    }));
    const __VLS_69 = __VLS_68({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (!__VLS_ctx.state.form.idpMetaUrl),
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_71;
    let __VLS_72;
    let __VLS_73;
    const __VLS_74 = {
        onClick: (__VLS_ctx.validate)
    };
    __VLS_70.slots.default;
    (__VLS_ctx.t('commons.test_connect'));
    var __VLS_70;
    const __VLS_75 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_77 = __VLS_76({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    let __VLS_79;
    let __VLS_80;
    let __VLS_81;
    const __VLS_82 = {
        onClick: (...[$event]) => {
            __VLS_ctx.submitForm(__VLS_ctx.samlForm);
        }
    };
    __VLS_78.slots.default;
    (__VLS_ctx.t('commons.save'));
    var __VLS_78;
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
            samlForm: samlForm,
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
