import { ref, reactive, onBeforeMount } from 'vue';
import { ElMessage, ElLoading } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
import { ElInput, ElRadio, ElRadioGroup, ElSelect, } from 'element-plus-secondary';
import { request } from '@/utils/request';
import { getSQLBotAddr } from '@/utils/utils';
const { t } = useI18n();
const dialogVisible = ref(false);
const loadingInstance = ref(null);
const oauth2Form = ref();
const id = ref(null);
const state = reactive({
    form: reactive({
        authorize_url: '',
        token_url: '',
        userinfo_url: '',
        revoke_url: '',
        scope: '',
        client_id: '',
        client_secret: '',
        redirect_url: getSQLBotAddr(),
        token_auth_method: 'basic',
        userinfo_auth_method: 'header',
        logout_redirect_url: '',
        mapping: '',
    }),
});
const componentMap = {
    'el-input': ElInput,
    'el-select': ElSelect,
    'el-radio-group': ElRadioGroup,
    'el-radio': ElRadio,
};
const getComponent = (name) => {
    return componentMap[name];
};
const form_config_list = ref([
/* {
  label: '自定义配置',
  field: 'authMethod',
  value: '',
  // component: resolveComponent('ElInput') as typeof ElInput,
  component: 'el-input',
  attrs: {
    placeholder: t('common.please_input') + 123,
  },
  validator: [
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
    { required: true, pattern: /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/, message: '', trigger: 'blur' },
  ],
}, */
]);
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
    if (value === null || value === '') {
        callback();
    }
    try {
        JSON.parse(value);
    }
    catch (e) {
        console.error(e);
        callback(new Error(t('authentication.in_json_format')));
    }
    callback();
};
const rule = reactive({
    authorize_url: [
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
    token_url: [
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
    userinfo_url: [
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
    scope: [
        {
            min: 2,
            max: 50,
            message: t('common.input_limit', [2, 50]),
            trigger: 'blur',
        },
    ],
    client_id: [
        {
            required: true,
            message: t('common.require'),
            trigger: 'blur',
        },
        {
            min: 2,
            max: 255,
            message: t('common.input_limit', [2, 255]),
            trigger: 'blur',
        },
    ],
    client_secret: [
        {
            required: true,
            message: t('common.require'),
            trigger: 'blur',
        },
        {
            min: 5,
            max: 255,
            message: t('common.input_limit', [5, 255]),
            trigger: 'blur',
        },
    ],
    redirect_url: [
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
        .get('/system/authentication/4')
        .then((res) => {
        if (!res?.config) {
            return;
        }
        id.value = res.id;
        const data = JSON.parse(res.config);
        for (const key in data) {
            state.form[key] = data[key];
        }
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
                id: 4,
                type: 4,
                config: JSON.stringify(param),
                name: 'oauth2',
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
    resetForm(oauth2Form.value);
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
        type: 4,
        name: 'oauth2',
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
onBeforeMount(() => {
    if (form_config_list.value?.length) {
        form_config_list.value.forEach((item) => {
            rule[item.field] = item.validator;
            state.form[item.field] = item.value;
        });
    }
});
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
    title: (__VLS_ctx.t('authentication.oauth2_settings')),
    modalClass: "platform-info-drawer",
    size: "600px",
    direction: "rtl",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.t('authentication.oauth2_settings')),
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
    ref: "oauth2Form",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rule),
    labelWidth: "80px",
    labelPosition: "top",
}));
const __VLS_7 = __VLS_6({
    ref: "oauth2Form",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rule),
    labelWidth: "80px",
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {typeof __VLS_ctx.oauth2Form} */ ;
var __VLS_9 = {};
__VLS_8.slots.default;
const __VLS_11 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    label: (__VLS_ctx.t('authentication.authorize_url')),
    prop: "authorize_url",
}));
const __VLS_13 = __VLS_12({
    label: (__VLS_ctx.t('authentication.authorize_url')),
    prop: "authorize_url",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
const __VLS_15 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.state.form.authorize_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.state.form.authorize_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
var __VLS_14;
const __VLS_19 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    label: (__VLS_ctx.t('authentication.token_url')),
    prop: "token_url",
}));
const __VLS_21 = __VLS_20({
    label: (__VLS_ctx.t('authentication.token_url')),
    prop: "token_url",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
const __VLS_23 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.state.form.token_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.state.form.token_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
var __VLS_22;
const __VLS_27 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    label: (__VLS_ctx.t('authentication.userinfo_url')),
    prop: "userinfo_url",
}));
const __VLS_29 = __VLS_28({
    label: (__VLS_ctx.t('authentication.userinfo_url')),
    prop: "userinfo_url",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
const __VLS_31 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    modelValue: (__VLS_ctx.state.form.userinfo_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.state.form.userinfo_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
var __VLS_30;
const __VLS_35 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    label: (__VLS_ctx.t('authentication.revoke_url')),
    prop: "revoke_url",
}));
const __VLS_37 = __VLS_36({
    label: (__VLS_ctx.t('authentication.revoke_url')),
    prop: "revoke_url",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_38.slots.default;
const __VLS_39 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    modelValue: (__VLS_ctx.state.form.revoke_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_41 = __VLS_40({
    modelValue: (__VLS_ctx.state.form.revoke_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
var __VLS_38;
const __VLS_43 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    label: (__VLS_ctx.t('authentication.scope')),
    prop: "scope",
}));
const __VLS_45 = __VLS_44({
    label: (__VLS_ctx.t('authentication.scope')),
    prop: "scope",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
const __VLS_47 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    modelValue: (__VLS_ctx.state.form.scope),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_49 = __VLS_48({
    modelValue: (__VLS_ctx.state.form.scope),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
var __VLS_46;
const __VLS_51 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
    label: (__VLS_ctx.t('authentication.client_id')),
    prop: "client_id",
}));
const __VLS_53 = __VLS_52({
    label: (__VLS_ctx.t('authentication.client_id')),
    prop: "client_id",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
__VLS_54.slots.default;
const __VLS_55 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    modelValue: (__VLS_ctx.state.form.client_id),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_57 = __VLS_56({
    modelValue: (__VLS_ctx.state.form.client_id),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
var __VLS_54;
const __VLS_59 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    label: (__VLS_ctx.t('authentication.client_secret')),
    prop: "client_secret",
}));
const __VLS_61 = __VLS_60({
    label: (__VLS_ctx.t('authentication.client_secret')),
    prop: "client_secret",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_62.slots.default;
const __VLS_63 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    modelValue: (__VLS_ctx.state.form.client_secret),
    type: "password",
    showPassword: true,
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_65 = __VLS_64({
    modelValue: (__VLS_ctx.state.form.client_secret),
    type: "password",
    showPassword: true,
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
var __VLS_62;
const __VLS_67 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    label: (__VLS_ctx.t('authentication.redirect_url')),
    prop: "redirect_url",
}));
const __VLS_69 = __VLS_68({
    label: (__VLS_ctx.t('authentication.redirect_url')),
    prop: "redirect_url",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
__VLS_70.slots.default;
const __VLS_71 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    modelValue: (__VLS_ctx.state.form.redirect_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}));
const __VLS_73 = __VLS_72({
    modelValue: (__VLS_ctx.state.form.redirect_url),
    placeholder: (__VLS_ctx.t('common.please_input')),
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
var __VLS_70;
const __VLS_75 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
    label: (__VLS_ctx.t('authentication.logout_redirect_url')),
    prop: "logout_redirect_url",
}));
const __VLS_77 = __VLS_76({
    label: (__VLS_ctx.t('authentication.logout_redirect_url')),
    prop: "logout_redirect_url",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
__VLS_78.slots.default;
const __VLS_79 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    modelValue: (__VLS_ctx.state.form.logout_redirect_url),
    placeholder: (__VLS_ctx.t('authentication.logout_redirect_url_placeholder')),
}));
const __VLS_81 = __VLS_80({
    modelValue: (__VLS_ctx.state.form.logout_redirect_url),
    placeholder: (__VLS_ctx.t('authentication.logout_redirect_url_placeholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
var __VLS_78;
const __VLS_83 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
    label: (__VLS_ctx.t('authentication.field_mapping')),
    prop: "mapping",
}));
const __VLS_85 = __VLS_84({
    label: (__VLS_ctx.t('authentication.field_mapping')),
    prop: "mapping",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
__VLS_86.slots.default;
const __VLS_87 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    modelValue: (__VLS_ctx.state.form.mapping),
    placeholder: (__VLS_ctx.t('authentication.oauth2_field_mapping_placeholder')),
}));
const __VLS_89 = __VLS_88({
    modelValue: (__VLS_ctx.state.form.mapping),
    placeholder: (__VLS_ctx.t('authentication.oauth2_field_mapping_placeholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
var __VLS_86;
const __VLS_91 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    label: (__VLS_ctx.t('authentication.token_auth_method')),
    prop: "token_auth_method",
}));
const __VLS_93 = __VLS_92({
    label: (__VLS_ctx.t('authentication.token_auth_method')),
    prop: "token_auth_method",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
__VLS_94.slots.default;
const __VLS_95 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
    modelValue: (__VLS_ctx.state.form.token_auth_method),
}));
const __VLS_97 = __VLS_96({
    modelValue: (__VLS_ctx.state.form.token_auth_method),
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
__VLS_98.slots.default;
const __VLS_99 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
    value: "basic",
}));
const __VLS_101 = __VLS_100({
    value: "basic",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
__VLS_102.slots.default;
var __VLS_102;
const __VLS_103 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
    value: "body",
}));
const __VLS_105 = __VLS_104({
    value: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
__VLS_106.slots.default;
var __VLS_106;
var __VLS_98;
var __VLS_94;
const __VLS_107 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
    label: (__VLS_ctx.t('authentication.userinfo_auth_method')),
    prop: "userinfo_auth_method",
}));
const __VLS_109 = __VLS_108({
    label: (__VLS_ctx.t('authentication.userinfo_auth_method')),
    prop: "userinfo_auth_method",
}, ...__VLS_functionalComponentArgsRest(__VLS_108));
__VLS_110.slots.default;
const __VLS_111 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
    modelValue: (__VLS_ctx.state.form.userinfo_auth_method),
}));
const __VLS_113 = __VLS_112({
    modelValue: (__VLS_ctx.state.form.userinfo_auth_method),
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
__VLS_114.slots.default;
const __VLS_115 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
    value: "header",
}));
const __VLS_117 = __VLS_116({
    value: "header",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
__VLS_118.slots.default;
var __VLS_118;
const __VLS_119 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
    value: "query",
}));
const __VLS_121 = __VLS_120({
    value: "query",
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
__VLS_122.slots.default;
var __VLS_122;
var __VLS_114;
var __VLS_110;
for (const [form_item] of __VLS_getVForSourceType((__VLS_ctx.form_config_list))) {
    const __VLS_123 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
        key: (form_item.field),
        label: (form_item.label),
        prop: (form_item.field),
    }));
    const __VLS_125 = __VLS_124({
        key: (form_item.field),
        label: (form_item.label),
        prop: (form_item.field),
    }, ...__VLS_functionalComponentArgsRest(__VLS_124));
    __VLS_126.slots.default;
    const __VLS_127 = ((__VLS_ctx.getComponent(form_item.component)));
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
        modelValue: (__VLS_ctx.state.form[form_item.field]),
        ...(form_item.attrs),
    }));
    const __VLS_129 = __VLS_128({
        modelValue: (__VLS_ctx.state.form[form_item.field]),
        ...(form_item.attrs),
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    var __VLS_126;
}
var __VLS_8;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_131 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_133 = __VLS_132({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    let __VLS_135;
    let __VLS_136;
    let __VLS_137;
    const __VLS_138 = {
        onClick: (...[$event]) => {
            __VLS_ctx.resetForm(__VLS_ctx.oauth2Form);
        }
    };
    __VLS_134.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_134;
    const __VLS_139 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (!__VLS_ctx.state.form.client_id),
    }));
    const __VLS_141 = __VLS_140({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (!__VLS_ctx.state.form.client_id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    let __VLS_143;
    let __VLS_144;
    let __VLS_145;
    const __VLS_146 = {
        onClick: (__VLS_ctx.validate)
    };
    __VLS_142.slots.default;
    (__VLS_ctx.t('ds.test_connection'));
    var __VLS_142;
    const __VLS_147 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_149 = __VLS_148({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    let __VLS_151;
    let __VLS_152;
    let __VLS_153;
    const __VLS_154 = {
        onClick: (...[$event]) => {
            __VLS_ctx.submitForm(__VLS_ctx.oauth2Form);
        }
    };
    __VLS_150.slots.default;
    (__VLS_ctx.t('common.save'));
    var __VLS_150;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_10 = __VLS_9;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElInput: ElInput,
            ElRadio: ElRadio,
            ElRadioGroup: ElRadioGroup,
            t: t,
            dialogVisible: dialogVisible,
            oauth2Form: oauth2Form,
            state: state,
            getComponent: getComponent,
            form_config_list: form_config_list,
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
