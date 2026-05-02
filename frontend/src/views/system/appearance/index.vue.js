import logo from '@/assets/LOGO-fold.svg';
import LOGO_fold from '@/assets/LOGO-fold.svg';
import custom_small from '@/assets/svg/logo-custom_small.svg';
import { ref, unref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { ElMessage, } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
import { request } from '@/utils/request';
import icon_side_fold_outlined from '@/assets/svg/icon_side-fold_outlined.svg';
import icon_new_chat_outlined from '@/assets/svg/icon_new_chat_outlined.svg';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
import LoginPreview from './LoginPreview.vue';
import Person from './Person.vue';
import { setCurrentColor } from '@/utils/utils';
// import TinymceEditor from '@/components/rich-text/TinymceEditor.vue'
import { cloneDeep } from 'lodash-es';
const appearanceStore = useAppearanceStoreWithOut();
const { t } = useI18n();
const COLOR_PANEL = [
    '#FF4500',
    '#FF8C00',
    '#FFD700',
    '#71AE46',
    '#00CED1',
    '#1E90FF',
    '#C71585',
    '#999999',
    '#000000',
    '#FFFFFF',
];
const basePath = import.meta.env.VITE_API_BASE_URL;
const baseUrl = basePath + '/system/appearance/picture/';
const fileList = ref([]);
const navigateBg = ref('dark');
const themeColor = ref('default');
const customColor = ref('#1CBA90');
const web = ref('');
const bg = ref('');
const login = ref('');
const navigate = ref('');
const mobileLogin = ref('');
const mobileLoginBg = ref('');
const navigateHeight = ref(400);
const changedItemArray = ref([]);
const loginFormRef = ref();
const defaultLoginForm = reactive({
    name: '邮政数据分析智能体',
    slogan: t('common.intelligent_questioning_platform'),
    foot: 'false',
    showSlogan: '0',
    footContent: '',
});
const loginForm = reactive(cloneDeep(defaultLoginForm));
const pageLogin = computed(() => !login.value ? null : login.value.startsWith('blob') ? login.value : baseUrl + login.value);
const rules = reactive({
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('system.website_name'),
            trigger: 'blur',
        },
    ],
    foot: [
        {
            required: true,
            message: '',
            trigger: 'change',
        },
    ],
});
const defaultTopForm = {
    help: 'https://dataease.cn/sqlbot/v1/',
    showDoc: '0',
    showAbout: '0',
    pc_welcome: '你好，我是 SQLBot ',
    pc_welcome_desc: `我可以查询数据、生成图表、检测数据异常、预测数据等赶快开启智能问数吧～`,
};
const topForm = reactive(cloneDeep(defaultTopForm));
const isBlue = computed(() => {
    return themeColor.value === 'blue';
});
const configList = [
    {
        logo: t('system.website_logo'),
        type: 'web',
        tips: t('system.larger_than_200kb'),
        size: 200 * 1024,
    },
    {
        logo: t('system.login_logo'),
        type: 'login',
        tips: t('system.larger_than_200kb_de'),
        size: 200 * 1024,
    },
    {
        logo: t('system.login_background_image'),
        type: 'bg',
        tips: t('system.larger_than_5mb'),
        size: 1024 * 1024 * 5,
    },
];
const giveUp = () => {
    resetLoginForm(false);
    resetTopForm(false);
    resetMobileForm(false);
    init();
};
const showSaveButton = ref(true);
const saveHandler = () => {
    loginFormRef.value?.validate((valLogin) => {
        if (valLogin) {
            const param = buildParam();
            const url = '/system/appearance';
            request
                .post(url, param, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then((res) => {
                if (!res) {
                    ElMessage.success(t('system.setting_successfully'));
                    appearanceStore.setLoaded(false);
                    appearanceStore.setAppearance();
                    showSaveButton.value = false;
                    nextTick(() => {
                        showSaveButton.value = true;
                    });
                }
            });
        }
    });
};
const buildParam = () => {
    for (const key in loginForm) {
        const item = loginForm[key];
        if (key === 'footContent') {
            addChangeArray(key, item, 'file');
        }
        else {
            addChangeArray(key, item);
        }
    }
    for (const key in topForm) {
        const item = topForm[key];
        addChangeArray(key, item);
    }
    const formData = new FormData();
    if (fileList.value.length) {
        fileList.value.forEach((file) => {
            const name = file.name + ',' + file['flag'];
            const fileArray = [file];
            const newfile = new File(fileArray, name, { type: file['type'] });
            formData.append('files', newfile);
        });
    }
    formData.append('data', JSON.stringify(unref(changedItemArray)));
    return formData;
};
const init = () => {
    const url = '/system/appearance/ui';
    changedItemArray.value = [];
    fileList.value = [];
    request
        .get(url)
        .then((res) => {
        const list = res || [];
        if (!list.length) {
            return;
        }
        list.forEach((item) => {
            const pkey = item.pkey;
            const pval = item.pval;
            if (pkey === 'navigateBg') {
                navigateBg.value = pval;
            }
            else if (pkey === 'themeColor') {
                themeColor.value = pval;
            }
            else if (pkey === 'customColor') {
                customColor.value = pval;
            }
            else if (pkey === 'web') {
                web.value = pval;
            }
            else if (pkey === 'login') {
                login.value = pval;
            }
            else if (pkey === 'bg') {
                bg.value = pval;
            }
            else if (pkey === 'navigate') {
                navigate.value = pval;
            }
            else if (Object.prototype.hasOwnProperty.call(loginForm, pkey)) {
                loginForm[pkey] = pval;
            }
            else if (Object.prototype.hasOwnProperty.call(topForm, pkey)) {
                topForm[pkey] = pval;
            }
            else if (pkey === 'mobileLogin') {
                mobileLogin.value = pval;
            }
            else if (pkey === 'mobileLoginBg') {
                mobileLoginBg.value = pval;
            }
        });
    })
        .finally(() => {
        nextTick(() => {
            if (themeColor.value === 'custom') {
                setPageCustomColor(customColor.value);
            }
            else {
                setPageCustomColor(isBlue.value ? '#3370FF' : '#1CBA90');
            }
        });
    });
};
const addChangeArray = (key, val, type) => {
    let len = changedItemArray.value.length;
    let match = false;
    while (len--) {
        const item = changedItemArray.value[len];
        if (item['pkey'] === key) {
            changedItemArray.value[len] = {
                pkey: key,
                pval: val,
                ptype: type || 'str',
                sort: 1,
            };
            match = true;
        }
    }
    if (!match) {
        changedItemArray.value.push({
            pkey: key,
            pval: val,
            ptype: type || 'str',
            sort: 1,
        });
    }
};
const themeColorChange = (val) => {
    themeColor.value = val;
    addChangeArray('themeColor', val);
    if (themeColor.value === 'custom') {
        setPageCustomColor(customColor.value);
    }
    else {
        setPageCustomColor(isBlue.value ? '#3370FF' : '#1CBA90');
    }
};
const customColorChange = (val) => {
    addChangeArray('customColor', val);
    setPageCustomColor(val);
};
const setPageCustomColor = (val) => {
    const ele = document.getElementsByClassName('appearance-table__content')[0];
    setCurrentColor(val, ele);
};
const resetLoginForm = (reset2Default) => {
    for (const key in loginForm) {
        loginForm[key] =
            defaultLoginForm[key];
    }
    clearFiles(['web', 'login', 'bg']);
    if (reset2Default) {
        addChangeArray('web', '', 'file');
        addChangeArray('login', '', 'file');
        addChangeArray('bg', '', 'file');
        web.value = '';
        login.value = '';
        bg.value = '';
    }
};
const resetTopForm = (reset2Default) => {
    for (const key in topForm) {
        topForm[key] = defaultTopForm[key];
    }
    clearFiles(['navigate']);
    if (reset2Default) {
        addChangeArray('navigate', '', 'file');
        navigate.value = '';
    }
};
const resetMobileForm = (reset2Default) => {
    clearFiles(['mobileLogin', 'mobileLoginBg']);
    if (reset2Default) {
        addChangeArray('mobileLogin', '', 'file');
        addChangeArray('mobileLoginBg', '', 'file');
        mobileLogin.value = '';
        mobileLoginBg.value = '';
    }
};
const uploadImg = (options) => {
    const file = options.file;
    if (file['flag'] === 'web') {
        web.value = URL.createObjectURL(file);
    }
    else if (file['flag'] === 'bg') {
        bg.value = URL.createObjectURL(file);
    }
    else if (file['flag'] === 'login') {
        login.value = URL.createObjectURL(file);
    }
    else if (file['flag'] === 'navigate') {
        navigate.value = URL.createObjectURL(file);
    }
    else if (file['flag'] === 'mobileLogin') {
        mobileLogin.value = URL.createObjectURL(file);
    }
    else if (file['flag'] === 'mobileLoginBg') {
        mobileLoginBg.value = URL.createObjectURL(file);
    }
};
const beforeUpload = (file, { type, size, tips }) => {
    if (file.size > size) {
        ElMessage.error(tips);
        return false;
    }
    addChangeArray(type, file.uid, 'file');
    let len = fileList.value?.length;
    let match = false;
    file.flag = type;
    while (len--) {
        const tfile = fileList.value[len];
        if (type == tfile['flag']) {
            fileList.value[len] = file;
            match = true;
        }
    }
    if (!match) {
        fileList.value?.push(file);
    }
    return true;
};
const clearFiles = (array) => {
    if (!array?.length || !fileList.value?.length) {
        fileList.value = [];
        return;
    }
    let len = fileList.value.length;
    while (len--) {
        const file = fileList.value[len];
        if (array.includes(file['flag'])) {
            fileList.value.splice(len, 1);
        }
    }
};
const getHeight = () => {
    const dom = document.getElementsByClassName('navigate-preview');
    const width = dom[0].clientWidth;
    navigateHeight.value = parseInt((width * 0.625).toString());
};
onMounted(() => {
    init();
    nextTick(() => {
        getHeight();
    });
    window.addEventListener('resize', getHeight);
});
onUnmounted(() => {
    window.removeEventListener('resize', getHeight);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-color-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-color-picker__trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['color-item-label']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['setting']} */ ;
/** @type {__VLS_StyleScopedClasses['login']} */ ;
/** @type {__VLS_StyleScopedClasses['login']} */ ;
/** @type {__VLS_StyleScopedClasses['login']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "appearance no-padding" },
});
const __VLS_0 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scroll-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "router-title" },
});
(__VLS_ctx.t('system.appearance_settings'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "appearance-table__content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "theme" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "show-theme" },
});
(__VLS_ctx.$t('system.platform_display_theme'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "theme-color" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "btn-select" },
});
const __VLS_4 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.themeColor === 'default' && 'is-active']) },
    text: true,
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.themeColor === 'default' && 'is-active']) },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.themeColorChange('default');
    }
};
__VLS_7.slots.default;
(__VLS_ctx.$t('system.default_turquoise'));
var __VLS_7;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.themeColor === 'blue' && 'is-active']) },
    text: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.themeColor === 'blue' && 'is-active']) },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (...[$event]) => {
        __VLS_ctx.themeColorChange('blue');
    }
};
__VLS_15.slots.default;
(__VLS_ctx.$t('system.tech_blue'));
var __VLS_15;
const __VLS_20 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.themeColor === 'custom' && 'is-active']) },
    text: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.themeColor === 'custom' && 'is-active']) },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (...[$event]) => {
        __VLS_ctx.themeColorChange('custom');
    }
};
__VLS_23.slots.default;
(__VLS_ctx.$t('system.custom'));
var __VLS_23;
if (__VLS_ctx.themeColor === 'custom') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "theme-bg" },
    });
    (__VLS_ctx.t('system.customize_theme_color'));
    const __VLS_28 = {}.ElColorPicker;
    /** @type {[typeof __VLS_components.ElColorPicker, typeof __VLS_components.elColorPicker, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.customColor),
        triggerWidth: (28),
        predefine: (__VLS_ctx.COLOR_PANEL),
        isCustom: true,
        effect: "light",
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.customColor),
        triggerWidth: (28),
        predefine: (__VLS_ctx.COLOR_PANEL),
        isCustom: true,
        effect: "light",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onChange: (__VLS_ctx.customColorChange)
    };
    var __VLS_31;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login" },
    ...{ class: (__VLS_ctx.themeColor) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "platform-login" },
});
(__VLS_ctx.t('system.platform_login_settings'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-preview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "left" },
});
(__VLS_ctx.t('system.page_preview'));
const __VLS_36 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_38 = __VLS_37({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onClick: (...[$event]) => {
        __VLS_ctx.resetLoginForm(true);
    }
};
__VLS_39.slots.default;
(__VLS_ctx.t('system.restore_default'));
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-setting" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-content" },
});
/** @type {[typeof LoginPreview, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(LoginPreview, new LoginPreview({
    navigateBg: (__VLS_ctx.navigateBg),
    themeColor: (__VLS_ctx.themeColor),
    customColor: (__VLS_ctx.customColor),
    name: (__VLS_ctx.loginForm.name),
    slogan: (__VLS_ctx.loginForm.slogan),
    web: (__VLS_ctx.web),
    showSlogan: (__VLS_ctx.loginForm.showSlogan),
    bg: (__VLS_ctx.bg),
    login: (__VLS_ctx.login),
    isBlue: (__VLS_ctx.isBlue),
    height: (__VLS_ctx.navigateHeight),
    foot: (__VLS_ctx.loginForm.foot),
    footContent: (__VLS_ctx.loginForm.footContent),
}));
const __VLS_45 = __VLS_44({
    navigateBg: (__VLS_ctx.navigateBg),
    themeColor: (__VLS_ctx.themeColor),
    customColor: (__VLS_ctx.customColor),
    name: (__VLS_ctx.loginForm.name),
    slogan: (__VLS_ctx.loginForm.slogan),
    web: (__VLS_ctx.web),
    showSlogan: (__VLS_ctx.loginForm.showSlogan),
    bg: (__VLS_ctx.bg),
    login: (__VLS_ctx.login),
    isBlue: (__VLS_ctx.isBlue),
    height: (__VLS_ctx.navigateHeight),
    foot: (__VLS_ctx.loginForm.foot),
    footContent: (__VLS_ctx.loginForm.footContent),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tips-page" },
});
(__VLS_ctx.t('system.screen_customization_supported', {
    msg: __VLS_ctx.loginForm.name || 'SQLBot',
}));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-list" },
});
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.configList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (ele.type),
        ...{ class: "config-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-logo" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "logo" },
    });
    (ele.logo);
    const __VLS_47 = {}.ElUpload;
    /** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        name: (ele.type),
        showFileList: (false),
        ...{ class: "upload-demo" },
        accept: ".jpeg,.jpg,.png,.gif,.svg",
        beforeUpload: ((e) => __VLS_ctx.beforeUpload(e, ele)),
        httpRequest: (__VLS_ctx.uploadImg),
    }));
    const __VLS_49 = __VLS_48({
        name: (ele.type),
        showFileList: (false),
        ...{ class: "upload-demo" },
        accept: ".jpeg,.jpg,.png,.gif,.svg",
        beforeUpload: ((e) => __VLS_ctx.beforeUpload(e, ele)),
        httpRequest: (__VLS_ctx.uploadImg),
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    __VLS_50.slots.default;
    const __VLS_51 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        secondary: true,
    }));
    const __VLS_53 = __VLS_52({
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    __VLS_54.slots.default;
    (__VLS_ctx.t('system.replace_image'));
    var __VLS_54;
    var __VLS_50;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tips" },
    });
    (ele.tips);
}
const __VLS_55 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    ref: "loginFormRef",
    model: (__VLS_ctx.loginForm),
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    requireAsteriskPosition: "right",
    labelWidth: "120px",
    ...{ class: "page-Form form-content_error_a" },
}));
const __VLS_57 = __VLS_56({
    ref: "loginFormRef",
    model: (__VLS_ctx.loginForm),
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    requireAsteriskPosition: "right",
    labelWidth: "120px",
    ...{ class: "page-Form form-content_error_a" },
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
/** @type {typeof __VLS_ctx.loginFormRef} */ ;
var __VLS_59 = {};
__VLS_58.slots.default;
const __VLS_61 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    label: (__VLS_ctx.t('system.website_name')),
    prop: "name",
}));
const __VLS_63 = __VLS_62({
    label: (__VLS_ctx.t('system.website_name')),
    prop: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
const __VLS_65 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    modelValue: (__VLS_ctx.loginForm.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('system.website_name')),
    maxlength: "20",
}));
const __VLS_67 = __VLS_66({
    modelValue: (__VLS_ctx.loginForm.name),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('system.website_name')),
    maxlength: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-tips" },
});
(__VLS_ctx.t('system.on_webpage_tabs'));
var __VLS_64;
const __VLS_69 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({}));
const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_72.slots;
    const __VLS_73 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        modelValue: (__VLS_ctx.loginForm.showSlogan),
        trueValue: "0",
        falseValue: "1",
        label: (__VLS_ctx.$t('system.welcome_message')),
    }));
    const __VLS_75 = __VLS_74({
        modelValue: (__VLS_ctx.loginForm.showSlogan),
        trueValue: "0",
        falseValue: "1",
        label: (__VLS_ctx.$t('system.welcome_message')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
}
const __VLS_77 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    modelValue: (__VLS_ctx.loginForm.slogan),
    maxlength: "50",
}));
const __VLS_79 = __VLS_78({
    modelValue: (__VLS_ctx.loginForm.slogan),
    maxlength: "50",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
var __VLS_72;
var __VLS_58;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "platform-login" },
});
(__VLS_ctx.t('system.platform_settings'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-preview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "left" },
});
(__VLS_ctx.t('system.page_preview'));
const __VLS_81 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_83 = __VLS_82({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
let __VLS_85;
let __VLS_86;
let __VLS_87;
const __VLS_88 = {
    onClick: (...[$event]) => {
        __VLS_ctx.resetTopForm(true);
    }
};
__VLS_84.slots.default;
(__VLS_ctx.t('system.restore_default'));
var __VLS_84;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-setting" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "navigate-preview" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "navigate-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-sql" },
});
if (__VLS_ctx.pageLogin) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        height: "30",
        width: "30",
        src: (__VLS_ctx.pageLogin),
        alt: "",
    });
}
else if (__VLS_ctx.themeColor !== 'default') {
    const __VLS_89 = {}.custom_small;
    /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        ...{ class: "logo" },
    }));
    const __VLS_91 = __VLS_90({
        ...{ class: "logo" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
}
else {
    const __VLS_93 = {}.logo;
    /** @type {[typeof __VLS_components.Logo, typeof __VLS_components.logo, typeof __VLS_components.Logo, typeof __VLS_components.logo, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
    const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.loginForm.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-sql" },
});
/** @type {[typeof Person, typeof Person, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(Person, new Person({
    isBlue: (__VLS_ctx.isBlue),
    showAbout: (__VLS_ctx.topForm.showAbout === '0'),
    showDoc: (__VLS_ctx.topForm.showDoc === '0'),
}));
const __VLS_98 = __VLS_97({
    isBlue: (__VLS_ctx.isBlue),
    showAbout: (__VLS_ctx.topForm.showAbout === '0'),
    showDoc: (__VLS_ctx.topForm.showDoc === '0'),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const __VLS_100 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    size: "20",
    ...{ class: "fold" },
}));
const __VLS_102 = __VLS_101({
    size: "20",
    ...{ class: "fold" },
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.icon_side_fold_outlined;
/** @type {[typeof __VLS_components.Icon_side_fold_outlined, typeof __VLS_components.icon_side_fold_outlined, typeof __VLS_components.Icon_side_fold_outlined, typeof __VLS_components.icon_side_fold_outlined, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
var __VLS_103;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "welcome-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "greeting" },
});
if (__VLS_ctx.pageLogin) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        height: "32",
        width: "32",
        src: (__VLS_ctx.pageLogin),
        alt: "",
    });
}
else {
    const __VLS_108 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        size: "32",
    }));
    const __VLS_110 = __VLS_109({
        size: "32",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    if (__VLS_ctx.themeColor !== 'default') {
        const __VLS_112 = {}.custom_small;
        /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
        const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
    }
    else {
        const __VLS_116 = {}.LOGO_fold;
        /** @type {[typeof __VLS_components.LOGO_fold, typeof __VLS_components.LOGO_fold, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
        const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
    }
    var __VLS_111;
}
(__VLS_ctx.topForm.pc_welcome);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sub" },
});
(__VLS_ctx.topForm.pc_welcome_desc);
const __VLS_120 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    size: "large",
    type: "primary",
    ...{ class: "greeting-btn" },
}));
const __VLS_122 = __VLS_121({
    size: "large",
    type: "primary",
    ...{ class: "greeting-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "inner-icon" },
});
const __VLS_124 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({}));
const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.icon_new_chat_outlined;
/** @type {[typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
var __VLS_127;
(__VLS_ctx.t('qa.start_sqlbot'));
var __VLS_123;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tips-page" },
});
(__VLS_ctx.t('system.screen_customization_settings', {
    msg: __VLS_ctx.loginForm.name || 'SQLBot',
}));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-list" },
});
const __VLS_132 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    modelValue: (__VLS_ctx.topForm.showDoc),
    trueValue: "0",
    falseValue: "1",
    label: (__VLS_ctx.$t('system.help_documentation')),
}));
const __VLS_134 = __VLS_133({
    modelValue: (__VLS_ctx.topForm.showDoc),
    trueValue: "0",
    falseValue: "1",
    label: (__VLS_ctx.$t('system.help_documentation')),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "doc-input" },
});
const __VLS_136 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    modelValue: (__VLS_ctx.topForm.help),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('system.help_documentation')),
}));
const __VLS_138 = __VLS_137({
    modelValue: (__VLS_ctx.topForm.help),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('system.help_documentation')),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
const __VLS_140 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.topForm.showAbout),
    trueValue: "0",
    falseValue: "1",
    label: (__VLS_ctx.$t('system.show_about')),
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.topForm.showAbout),
    trueValue: "0",
    falseValue: "1",
    label: (__VLS_ctx.$t('system.show_about')),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
    ...{ class: "label" },
});
(__VLS_ctx.$t('system.welcome_message'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_144 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    modelValue: (__VLS_ctx.topForm.pc_welcome),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('system.welcome_message')),
    maxlength: "50",
}));
const __VLS_146 = __VLS_145({
    modelValue: (__VLS_ctx.topForm.pc_welcome),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('system.welcome_message')),
    maxlength: "50",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('embedded.welcome_description'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_148 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.topForm.pc_welcome_desc),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.welcome_description')),
    type: "textarea",
    showWordLimit: true,
    maxlength: "50",
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.topForm.pc_welcome_desc),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.welcome_description')),
    type: "textarea",
    showWordLimit: true,
    maxlength: "50",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "appearance-foot" },
});
const __VLS_152 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_154 = __VLS_153({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
let __VLS_156;
let __VLS_157;
let __VLS_158;
const __VLS_159 = {
    onClick: (__VLS_ctx.giveUp)
};
__VLS_155.slots.default;
(__VLS_ctx.$t('system.abort_update'));
var __VLS_155;
if (__VLS_ctx.showSaveButton) {
    const __VLS_160 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_162 = __VLS_161({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    let __VLS_164;
    let __VLS_165;
    let __VLS_166;
    const __VLS_167 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_163.slots.default;
    (__VLS_ctx.$t('system.save_and_apply'));
    var __VLS_163;
}
/** @type {__VLS_StyleScopedClasses['appearance']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-content']} */ ;
/** @type {__VLS_StyleScopedClasses['router-title']} */ ;
/** @type {__VLS_StyleScopedClasses['appearance-table__content']} */ ;
/** @type {__VLS_StyleScopedClasses['theme']} */ ;
/** @type {__VLS_StyleScopedClasses['show-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-color']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-select']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['login']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-login']} */ ;
/** @type {__VLS_StyleScopedClasses['page-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-setting']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tips-page']} */ ;
/** @type {__VLS_StyleScopedClasses['config-list']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['config-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-demo']} */ ;
/** @type {__VLS_StyleScopedClasses['tips']} */ ;
/** @type {__VLS_StyleScopedClasses['page-Form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error_a']} */ ;
/** @type {__VLS_StyleScopedClasses['form-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['login']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-login']} */ ;
/** @type {__VLS_StyleScopedClasses['page-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-setting']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['navigate-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['navigate-head']} */ ;
/** @type {__VLS_StyleScopedClasses['header-sql']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-sql']} */ ;
/** @type {__VLS_StyleScopedClasses['fold']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-content']} */ ;
/** @type {__VLS_StyleScopedClasses['greeting']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['greeting-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tips-page']} */ ;
/** @type {__VLS_StyleScopedClasses['config-list']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-input']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['appearance-foot']} */ ;
// @ts-ignore
var __VLS_60 = __VLS_59;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            logo: logo,
            LOGO_fold: LOGO_fold,
            custom_small: custom_small,
            icon_side_fold_outlined: icon_side_fold_outlined,
            icon_new_chat_outlined: icon_new_chat_outlined,
            LoginPreview: LoginPreview,
            Person: Person,
            t: t,
            COLOR_PANEL: COLOR_PANEL,
            navigateBg: navigateBg,
            themeColor: themeColor,
            customColor: customColor,
            web: web,
            bg: bg,
            login: login,
            navigateHeight: navigateHeight,
            loginFormRef: loginFormRef,
            loginForm: loginForm,
            pageLogin: pageLogin,
            rules: rules,
            topForm: topForm,
            isBlue: isBlue,
            configList: configList,
            giveUp: giveUp,
            showSaveButton: showSaveButton,
            saveHandler: saveHandler,
            themeColorChange: themeColorChange,
            customColorChange: customColorChange,
            resetLoginForm: resetLoginForm,
            resetTopForm: resetTopForm,
            uploadImg: uploadImg,
            beforeUpload: beforeUpload,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
