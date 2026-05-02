import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { request } from '@/utils/request';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user.ts';
const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();
const loginForm = ref({
    username: '',
    password: '',
    origin: 1,
});
const loginFormRef = ref();
const submitForm = () => {
    loginFormRef.value.validate((valid) => {
        if (valid) {
            const data = { ...loginForm.value };
            request.post('/system/authentication/sso/3', data).then((res) => {
                const token = res.access_token;
                userStore.setToken(token);
                userStore.setExp(res.exp);
                userStore.setTime(Date.now());
                userStore.setPlatformInfo({
                    flag: 'ldap',
                    data: null,
                    origin: 3,
                });
                router.push('/');
            });
        }
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "default-login-tabs-ldap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "title" },
});
(__VLS_ctx.t('login.ldap_login'));
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeyup': {} },
    ref: "loginFormRef",
    ...{ class: "form-content_error" },
    model: (__VLS_ctx.loginForm),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    ref: "loginFormRef",
    ...{ class: "form-content_error" },
    model: (__VLS_ctx.loginForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onKeyup: (__VLS_ctx.submitForm)
};
/** @type {typeof __VLS_ctx.loginFormRef} */ ;
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_10 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    prop: "username",
}));
const __VLS_12 = __VLS_11({
    prop: "username",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_13.slots.default;
const __VLS_14 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.loginForm.username),
    clearable: true,
    placeholder: (__VLS_ctx.t('login.input_account')),
    size: "large",
}));
const __VLS_16 = __VLS_15({
    modelValue: (__VLS_ctx.loginForm.username),
    clearable: true,
    placeholder: (__VLS_ctx.t('login.input_account')),
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
var __VLS_13;
const __VLS_18 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    prop: "password",
}));
const __VLS_20 = __VLS_19({
    prop: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    modelValue: (__VLS_ctx.loginForm.password),
    placeholder: (__VLS_ctx.$t('common.enter_your_password')),
    type: "password",
    showPassword: true,
    clearable: true,
    size: "large",
}));
const __VLS_24 = __VLS_23({
    modelValue: (__VLS_ctx.loginForm.password),
    placeholder: (__VLS_ctx.$t('common.enter_your_password')),
    type: "password",
    showPassword: true,
    clearable: true,
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
var __VLS_21;
const __VLS_26 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({}));
const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
__VLS_29.slots.default;
const __VLS_30 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "login-btn" },
}));
const __VLS_32 = __VLS_31({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "login-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_34;
let __VLS_35;
let __VLS_36;
const __VLS_37 = {
    onClick: (__VLS_ctx.submitForm)
};
__VLS_33.slots.default;
(__VLS_ctx.$t('common.login_'));
var __VLS_33;
var __VLS_29;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['default-login-tabs-ldap']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            t: t,
            loginForm: loginForm,
            loginFormRef: loginFormRef,
            submitForm: submitForm,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
