import icon_close_outlined from '@/assets/svg/icon_close_outlined.svg';
import LOGO_fold from '@/assets/LOGO-fold.svg';
import login_image from '@/assets/embedded/login_image.png';
import logoHeader from '@/assets/blue/LOGO-head_blue.png';
import custom_small from '@/assets/svg/logo-custom_small.svg';
import loginImage from '@/assets/blue/login-image_blue.png';
import { propTypes } from '@/utils/propTypes';
import { sanitizeHtml } from '@/utils/xss';
import { isBtnShow } from '@/utils/utils';
import { useI18n } from 'vue-i18n';
import { computed, ref, onMounted, nextTick } from 'vue';
import elementResizeDetectorMaker from 'element-resize-detector';
const basePath = import.meta.env.VITE_API_BASE_URL;
const baseUrl = basePath + '/system/appearance/picture/';
const { t } = useI18n();
const props = defineProps({
    web: propTypes.string.def(''),
    name: propTypes.string.def(''),
    slogan: propTypes.string.def(''),
    themeColor: propTypes.string.def(''),
    customColor: propTypes.string.def(''),
    login: propTypes.string.def(''),
    showSlogan: propTypes.string.def('0'),
    bg: propTypes.string.def(''),
    height: propTypes.number.def(425),
    foot: propTypes.string.def(''),
    footContent: propTypes.string.def(''),
    isBlue: propTypes.bool.def(false),
});
const appLoginView = ref();
const loginContainerWidth = ref(0);
const pageWeb = computed(() => {
    return !props.web
        ? props.isBlue
            ? logoHeader
            : '/LOGO-fold.svg'
        : props.web.startsWith('blob')
            ? props.web
            : baseUrl + props.web;
});
const pageLogin = computed(() => !props.login ? null : props.login.startsWith('blob') ? props.login : baseUrl + props.login);
const pageBg = computed(() => !props.bg
    ? props.isBlue
        ? loginImage
        : null
    : props.bg.startsWith('blob')
        ? props.bg
        : baseUrl + props.bg);
const pageName = computed(() => props.name);
const pageSlogan = computed(() => props.slogan);
const showFoot = computed(() => props.foot && props.foot === 'true');
const pageFootContent = computed(() => {
    // Sanitize HTML content to prevent XSS attacks
    const content = props.foot && props.foot === 'true' ? props.footContent : null;
    return content ? sanitizeHtml(content) : null;
});
const customStyle = computed(() => {
    const result = { height: `${props.height + 23}px` };
    return result;
});
const showLoginImage = computed(() => {
    return !(loginContainerWidth.value < 555);
});
onMounted(() => {
    const erd = elementResizeDetectorMaker();
    erd.listenTo(appLoginView.value, () => {
        nextTick(() => {
            loginContainerWidth.value = appLoginView.value?.offsetWidth;
        });
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tab-card']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "appLoginView",
    ...{ class: "appearance-login-view" },
    ...{ style: (__VLS_ctx.customStyle) },
});
/** @type {typeof __VLS_ctx.appLoginView} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-tab-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex-top-tabs" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tab-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('system.tab'));
const __VLS_0 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    size: "10",
}));
const __VLS_2 = __VLS_1({
    size: "10",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.icon_close_outlined;
/** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tab-card active" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    title: (__VLS_ctx.pageName || 'SQLBot'),
    ...{ class: "active-span" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: (__VLS_ctx.pageWeb),
    alt: "",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.pageName || 'SQLBot');
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    size: "10",
}));
const __VLS_10 = __VLS_9({
    size: "10",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.icon_close_outlined;
/** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tab-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('system.tab'));
const __VLS_16 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    size: "10",
}));
const __VLS_18 = __VLS_17({
    size: "10",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.icon_close_outlined;
/** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tab-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('system.tab'));
const __VLS_24 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    size: "10",
}));
const __VLS_26 = __VLS_25({
    size: "10",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.icon_close_outlined;
/** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-container" },
});
if (__VLS_ctx.showLoginImage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "left-img" },
    });
    const __VLS_32 = {}.ElImage;
    /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ class: "login-image" },
        src: (__VLS_ctx.pageBg || __VLS_ctx.login_image),
    }));
    const __VLS_34 = __VLS_33({
        ...{ class: "login-image" },
        src: (__VLS_ctx.pageBg || __VLS_ctx.login_image),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "right-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-form-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-logo-icon" },
});
if (__VLS_ctx.pageLogin) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        height: "52",
        src: (__VLS_ctx.pageLogin),
        alt: "",
    });
}
else {
    const __VLS_36 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        size: "52",
    }));
    const __VLS_38 = __VLS_37({
        size: "52",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    if (__VLS_ctx.themeColor !== 'default') {
        const __VLS_40 = {}.custom_small;
        /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
    else {
        const __VLS_44 = {}.LOGO_fold;
        /** @type {[typeof __VLS_components.LOGO_fold, typeof __VLS_components.LOGO_fold, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    }
    var __VLS_39;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.name);
if (__VLS_ctx.isBtnShow(__VLS_ctx.showSlogan)) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-welcome" },
    });
    (__VLS_ctx.pageSlogan ?? __VLS_ctx.t('common.intelligent_questioning_platform'));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-welcome" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "default-login-tabs" },
});
const __VLS_48 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    size: "small",
}));
const __VLS_50 = __VLS_49({
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ class: "login-form-item" },
    prop: "username",
}));
const __VLS_54 = __VLS_53({
    ...{ class: "login-form-item" },
    prop: "username",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    readonly: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('common.your_account_email_address')),
    autofocus: true,
}));
const __VLS_58 = __VLS_57({
    readonly: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('common.your_account_email_address')),
    autofocus: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
var __VLS_55;
const __VLS_60 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    prop: "password",
}));
const __VLS_62 = __VLS_61({
    prop: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    readonly: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('common.enter_your_password')),
    showPassword: true,
    maxlength: "30",
    showWordLimit: true,
    type: "password",
    autocomplete: "new-password",
}));
const __VLS_66 = __VLS_65({
    readonly: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('common.enter_your_password')),
    showPassword: true,
    maxlength: "30",
    showWordLimit: true,
    type: "password",
    autocomplete: "new-password",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-btn" },
});
const __VLS_68 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    type: "primary",
    ...{ class: "submit" },
    size: "small",
    disabled: (true),
}));
const __VLS_70 = __VLS_69({
    type: "primary",
    ...{ class: "submit" },
    size: "small",
    disabled: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
(__VLS_ctx.t('common.login_'));
var __VLS_71;
var __VLS_51;
if (__VLS_ctx.showFoot) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "dynamic-login-foot" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.pageFootContent) }, null, null);
}
/** @type {__VLS_StyleScopedClasses['appearance-login-view']} */ ;
/** @type {__VLS_StyleScopedClasses['top-tab-container']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-top-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-card']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active-span']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-card']} */ ;
/** @type {__VLS_StyleScopedClasses['login-container']} */ ;
/** @type {__VLS_StyleScopedClasses['left-img']} */ ;
/** @type {__VLS_StyleScopedClasses['login-image']} */ ;
/** @type {__VLS_StyleScopedClasses['right-container']} */ ;
/** @type {__VLS_StyleScopedClasses['login-form-center']} */ ;
/** @type {__VLS_StyleScopedClasses['config-area']} */ ;
/** @type {__VLS_StyleScopedClasses['login-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['login-logo-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['login-welcome']} */ ;
/** @type {__VLS_StyleScopedClasses['login-welcome']} */ ;
/** @type {__VLS_StyleScopedClasses['form-area']} */ ;
/** @type {__VLS_StyleScopedClasses['default-login-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['login-form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['submit']} */ ;
/** @type {__VLS_StyleScopedClasses['dynamic-login-foot']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_close_outlined: icon_close_outlined,
            LOGO_fold: LOGO_fold,
            login_image: login_image,
            custom_small: custom_small,
            isBtnShow: isBtnShow,
            t: t,
            appLoginView: appLoginView,
            pageWeb: pageWeb,
            pageLogin: pageLogin,
            pageBg: pageBg,
            pageName: pageName,
            pageSlogan: pageSlogan,
            showFoot: showFoot,
            pageFootContent: pageFootContent,
            customStyle: customStyle,
            showLoginImage: showLoginImage,
        };
    },
    props: {
        web: propTypes.string.def(''),
        name: propTypes.string.def(''),
        slogan: propTypes.string.def(''),
        themeColor: propTypes.string.def(''),
        customColor: propTypes.string.def(''),
        login: propTypes.string.def(''),
        showSlogan: propTypes.string.def('0'),
        bg: propTypes.string.def(''),
        height: propTypes.number.def(425),
        foot: propTypes.string.def(''),
        footContent: propTypes.string.def(''),
        isBlue: propTypes.bool.def(false),
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        web: propTypes.string.def(''),
        name: propTypes.string.def(''),
        slogan: propTypes.string.def(''),
        themeColor: propTypes.string.def(''),
        customColor: propTypes.string.def(''),
        login: propTypes.string.def(''),
        showSlogan: propTypes.string.def('0'),
        bg: propTypes.string.def(''),
        height: propTypes.number.def(425),
        foot: propTypes.string.def(''),
        footContent: propTypes.string.def(''),
        isBlue: propTypes.bool.def(false),
    },
});
; /* PartiallyEnd: #4569/main.vue */
