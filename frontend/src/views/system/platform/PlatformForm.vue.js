import { ref, reactive } from 'vue';
import { ElMessage, ElLoading } from 'element-plus-secondary';
import { request } from '@/utils/request';
import { useI18n } from 'vue-i18n';
import { settingMapping } from './common/SettingTemplate';
const { t } = useI18n();
const dialogVisible = ref(false);
const loadingInstance = ref(null);
const platformForm = ref();
const state = reactive({
    form: reactive({}),
    settingList: [],
});
const origin = ref(6);
const id = ref();
const rule = reactive({});
const formTitle = ref('');
const busiMapping = {
    6: 'wecom',
    7: 'dingtalk',
    8: 'lark',
    9: 'larksuite',
};
const initForm = (row) => {
    state.settingList.forEach((item) => {
        const key = item.realKey;
        rule[key] = [
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
        ];
        state.form[key] = row[key];
    });
};
const edit = (row) => {
    state.settingList = settingMapping[row.type];
    initForm(row);
    origin.value = row.type;
    formTitle.value = row.title;
    if (row?.id) {
        id.value = row.id;
    }
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
                id: origin.value,
                type: origin.value,
                name: busiMapping[origin.value],
                config: JSON.stringify(param),
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
                    emits('saved');
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
    dialogVisible.value = false;
    id.value = null;
    origin.value = 6;
    formTitle.value = '';
    state.settingList = [];
    const keys = Object.keys(rule);
    keys.forEach((key) => delete rule[key]);
};
const reset = () => {
    resetForm(platformForm.value);
};
const showLoading = () => {
    loadingInstance.value = ElLoading.service({
        target: '.platform-info-drawer',
    });
};
const closeLoading = () => {
    loadingInstance.value?.close();
};
const validate = async (formEl) => {
    if (!formEl)
        return;
    await formEl.validate((valid) => {
        if (!valid) {
            return;
        }
        const url = '/system/authentication/status';
        const config_data = state.form;
        const data = {
            type: origin.value,
            name: busiMapping[origin.value],
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
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.formTitle),
    modalClass: "platform-info-drawer",
    size: "600px",
    direction: "rtl",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.formTitle),
    modalClass: "platform-info-drawer",
    size: "600px",
    direction: "rtl",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClose: (...[$event]) => {
        __VLS_ctx.resetForm(__VLS_ctx.platformForm);
    }
};
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_9 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ref: "platformForm",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rule),
    labelWidth: "80px",
    labelPosition: "top",
}));
const __VLS_11 = __VLS_10({
    ref: "platformForm",
    requireAsteriskPosition: "right",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rule),
    labelWidth: "80px",
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
/** @type {typeof __VLS_ctx.platformForm} */ ;
var __VLS_13 = {};
__VLS_12.slots.default;
for (const [setting] of __VLS_getVForSourceType((__VLS_ctx.state.settingList))) {
    const __VLS_15 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        key: (setting.realKey),
        label: (setting.pkey),
        prop: (setting.realKey),
    }));
    const __VLS_17 = __VLS_16({
        key: (setting.realKey),
        label: (setting.pkey),
        prop: (setting.realKey),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_18.slots.default;
    if (setting.type === 'pwd') {
        const __VLS_19 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
            modelValue: (__VLS_ctx.state.form[setting.realKey]),
            type: "password",
            showPassword: true,
            placeholder: (__VLS_ctx.t('common.please_input')),
        }));
        const __VLS_21 = __VLS_20({
            modelValue: (__VLS_ctx.state.form[setting.realKey]),
            type: "password",
            showPassword: true,
            placeholder: (__VLS_ctx.t('common.please_input')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    }
    else {
        const __VLS_23 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
            modelValue: (__VLS_ctx.state.form[setting.realKey]),
            placeholder: (__VLS_ctx.t('common.please_input')),
        }));
        const __VLS_25 = __VLS_24({
            modelValue: (__VLS_ctx.state.form[setting.realKey]),
            placeholder: (__VLS_ctx.t('common.please_input')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    }
    var __VLS_18;
}
var __VLS_12;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_27 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        ...{ 'onClick': {} },
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_31;
    let __VLS_32;
    let __VLS_33;
    const __VLS_34 = {
        onClick: (...[$event]) => {
            __VLS_ctx.resetForm(__VLS_ctx.platformForm);
        }
    };
    __VLS_30.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_30;
    const __VLS_35 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onClick: (...[$event]) => {
            __VLS_ctx.validate(__VLS_ctx.platformForm);
        }
    };
    __VLS_38.slots.default;
    (__VLS_ctx.t('ds.check'));
    var __VLS_38;
    const __VLS_43 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_47;
    let __VLS_48;
    let __VLS_49;
    const __VLS_50 = {
        onClick: (...[$event]) => {
            __VLS_ctx.submitForm(__VLS_ctx.platformForm);
        }
    };
    __VLS_46.slots.default;
    (__VLS_ctx.t('common.save'));
    var __VLS_46;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_14 = __VLS_13;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            t: t,
            dialogVisible: dialogVisible,
            platformForm: platformForm,
            state: state,
            rule: rule,
            formTitle: formTitle,
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
