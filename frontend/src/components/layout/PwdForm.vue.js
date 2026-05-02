import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { userApi } from '@/api/auth';
const { t } = useI18n();
const pwdRef = ref();
const pwdForm = reactive({
    pwd: '',
    new_pwd: '',
    confirm_pwd: '',
});
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-={}|:"<>?`\[\];',./])[A-Za-z\d~!@#$%^&*()_+\-={}|:"<>?`\[\];',./]{8,20}$/;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error(t('common.please_input', { msg: t('user.upgrade_pwd.new_pwd') })));
    }
    else {
        if (!PWD_REGEX.test(value)) {
            callback(new Error(t('user.upgrade_pwd.pwd_format_error')));
            return;
        }
        if (pwdForm.confirm_pwd !== '') {
            if (!pwdRef.value)
                return;
            pwdRef.value.validateField('confirm_pwd');
        }
        callback();
    }
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error(t('common.please_input', { msg: t('user.upgrade_pwd.confirm_pwd') })));
    }
    else if (!PWD_REGEX.test(value)) {
        callback(new Error(t('user.upgrade_pwd.pwd_format_error')));
    }
    else if (value !== pwdForm.new_pwd) {
        callback(new Error(t('user.upgrade_pwd.two_pwd_not_match')));
    }
    else {
        callback();
    }
};
const rules = {
    pwd: [
        {
            required: true,
            message: t('common.please_input', { msg: t('user.upgrade_pwd.old_pwd') }),
            trigger: 'blur',
        },
    ],
    new_pwd: [{ validator: validatePass, trigger: 'blur' }],
    confirm_pwd: [{ validator: validatePass2, trigger: 'blur' }],
};
const emits = defineEmits(['pwdSaved']);
const submit = () => {
    pwdRef.value.validate((res) => {
        if (res) {
            const param = {
                pwd: pwdForm.pwd,
                new_pwd: pwdForm.new_pwd,
            };
            userApi.pwd(param).then(() => {
                ElMessage({
                    type: 'success',
                    message: t('common.save_success'),
                });
                emits('pwdSaved');
            });
        }
    });
};
const __VLS_exposed = {
    submit,
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
    ref: "pwdRef",
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    model: (__VLS_ctx.pwdForm),
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    ref: "pwdRef",
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    model: (__VLS_ctx.pwdForm),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.pwdRef} */ ;
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_10 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    prop: "pwd",
    label: (__VLS_ctx.t('user.upgrade_pwd.old_pwd')),
}));
const __VLS_12 = __VLS_11({
    prop: "pwd",
    label: (__VLS_ctx.t('user.upgrade_pwd.old_pwd')),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_13.slots.default;
const __VLS_14 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.pwdForm.pwd),
    placeholder: (__VLS_ctx.t('common.please_input', { msg: __VLS_ctx.t('user.upgrade_pwd.old_pwd') })),
    type: "password",
    clearable: true,
    showPassword: true,
}));
const __VLS_16 = __VLS_15({
    modelValue: (__VLS_ctx.pwdForm.pwd),
    placeholder: (__VLS_ctx.t('common.please_input', { msg: __VLS_ctx.t('user.upgrade_pwd.old_pwd') })),
    type: "password",
    clearable: true,
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
var __VLS_13;
const __VLS_18 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    prop: "new_pwd",
    label: (__VLS_ctx.t('user.upgrade_pwd.new_pwd')),
}));
const __VLS_20 = __VLS_19({
    prop: "new_pwd",
    label: (__VLS_ctx.t('user.upgrade_pwd.new_pwd')),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    modelValue: (__VLS_ctx.pwdForm.new_pwd),
    placeholder: (__VLS_ctx.t('common.please_input', { msg: __VLS_ctx.t('user.upgrade_pwd.new_pwd') })),
    type: "password",
    showPassword: true,
    clearable: true,
}));
const __VLS_24 = __VLS_23({
    modelValue: (__VLS_ctx.pwdForm.new_pwd),
    placeholder: (__VLS_ctx.t('common.please_input', { msg: __VLS_ctx.t('user.upgrade_pwd.new_pwd') })),
    type: "password",
    showPassword: true,
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
var __VLS_21;
const __VLS_26 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    prop: "confirm_pwd",
    label: (__VLS_ctx.t('user.upgrade_pwd.confirm_pwd')),
}));
const __VLS_28 = __VLS_27({
    prop: "confirm_pwd",
    label: (__VLS_ctx.t('user.upgrade_pwd.confirm_pwd')),
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
__VLS_29.slots.default;
const __VLS_30 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.pwdForm.confirm_pwd),
    placeholder: (__VLS_ctx.t('common.please_input', { msg: __VLS_ctx.t('user.upgrade_pwd.confirm_pwd') })),
    type: "password",
    showPassword: true,
    clearable: true,
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.pwdForm.confirm_pwd),
    placeholder: (__VLS_ctx.t('common.please_input', { msg: __VLS_ctx.t('user.upgrade_pwd.confirm_pwd') })),
    type: "password",
    showPassword: true,
    clearable: true,
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
            t: t,
            pwdRef: pwdRef,
            pwdForm: pwdForm,
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
