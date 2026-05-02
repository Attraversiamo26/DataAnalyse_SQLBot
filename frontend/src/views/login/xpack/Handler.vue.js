import { ref, onMounted, nextTick, computed } from 'vue';
import QrcodeLdap from './QrcodeLdap.vue';
import LdapLoginForm from './LdapLoginForm.vue';
import Oidc from './Oidc.vue';
import Cas from './Cas.vue';
import Oauth2 from './Oauth2.vue';
import QrTab from './QrTab.vue';
import { request } from '@/utils/request';
import { useCache } from '@/utils/useCache';
import router from '@/router';
import { useUserStore } from '@/stores/user.ts';
import { getQueryString, getSQLBotAddr, getUrlParams, isPlatformClient } from '@/utils/utils';
import { loadClient, origin_mapping } from './PlatformClient';
import { useI18n } from 'vue-i18n';
const isLdap = ref(false);
const __VLS_props = defineProps();
const emits = defineEmits(['switchTab', 'autoCallback', 'update:loading']);
const updateLoading = (show, time = 1000) => {
    setTimeout(() => {
        emits('update:loading', show);
    }, time);
};
const { t } = useI18n();
const adminLogin = computed(() => router.currentRoute?.value?.name === 'admin-login');
const loginDialogVisible = ref(false);
const dialogTitle = ref('');
const dialogInterval = ref(null);
const currentCancelHandler = ref(null);
const currentSureHandler = ref(null);
const platformLoginMsg = ref('');
const { wsCache } = useCache();
const userStore = useUserStore();
const qrStatus = ref(false);
const loginCategory = ref({});
const anyEnable = ref(false);
const qrcodeLdapHandler = ref();
const saml2Handler = ref();
const openDialog = (origin_text) => {
    const platforms = {
        cas: 'CAS',
        oidc: 'OIDC',
        ldap: 'LDAP',
        oauth2: 'OAuth2',
        saml2: 'Saml2',
    };
    let timer = 3;
    const platFormName = platforms[origin_text] || 'SSO';
    dialogTitle.value = t('login.redirect_2_auth', [platFormName, timer]);
    let rejectPromise = null;
    let resolvePromise = null;
    loginDialogVisible.value = true;
    const promise = new Promise((resolve, reject) => {
        rejectPromise = reject;
        resolvePromise = resolve;
        dialogInterval.value = setInterval(() => {
            if (timer-- <= 0) {
                clearInterval(dialogInterval.value);
                closeDialog();
                resolve(true);
                return;
            }
            dialogTitle.value = t('login.redirect_2_auth', [platFormName, timer]);
        }, 1000);
    });
    const sure = () => {
        if (dialogInterval.value) {
            clearInterval(dialogInterval.value);
            dialogInterval.value = null;
        }
        closeDialog();
        if (resolvePromise) {
            resolvePromise(true);
            resolvePromise = null;
        }
    };
    const cancel = (reason = '用户取消跳转') => {
        if (dialogInterval.value) {
            clearInterval(dialogInterval.value);
            dialogInterval.value = null;
        }
        closeDialog();
        if (rejectPromise) {
            rejectPromise(new Error(reason));
            rejectPromise = null;
        }
    };
    return {
        promise,
        sure,
        cancel,
    };
};
const closeHandler = () => {
    if (currentCancelHandler.value) {
        currentCancelHandler.value('手动取消');
    }
};
const closeDialog = () => {
    loginDialogVisible.value = false;
};
const redirectImmediately = () => {
    if (currentSureHandler.value) {
        currentSureHandler.value();
    }
};
const init = (cb) => {
    queryCategoryStatus()
        .then((res) => {
        if (res) {
            const list = res;
            list.forEach((item) => {
                loginCategory.value[item.name] = item.enable;
                if (item.enable) {
                    anyEnable.value = true;
                }
            });
        }
        wsCache.delete('oidc-error');
        if (!loadClient(loginCategory.value)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            cb && cb();
        }
    })
        .catch(() => {
        if (!wsCache.get('oidc-error')) {
            wsCache.set('oidc-error', 1);
            window.location.reload();
        }
    });
};
const qrStatusChange = (activeComponent) => {
    qrStatus.value = activeComponent === 'qrcode';
    isLdap.value = false;
    if (activeComponent === 'account') {
        emits('switchTab', 'simple');
    }
    else if (activeComponent === 'ldap') {
        isLdap.value = true;
        switcherCategory({ category: 'ldap', proxy: '' });
    }
};
const ssoLogin = (category) => {
    const array = [
        { category: 'cas', proxy: '/casbi/#' },
        { category: 'oidc', proxy: '/oidcbi/#' },
        { category: 'ldap', proxy: '' },
        { category: 'oauth2', proxy: '/#' },
        { category: 'saml2', proxy: '/#' },
    ];
    if (category) {
        if (category === 3) {
            qrcodeLdapHandler.value?.setActive('ldap');
        }
        switcherCategory(array[category - 1]);
    }
};
const switcherCategory = async (param) => {
    const { category, proxy } = param;
    const curOrigin = window.location.origin;
    const curLocation = getCurLocation();
    if (!category || category === 'simple' || category === 'ldap') {
        qrStatus.value = false;
        emits('switchTab', category || 'simple');
        return;
    }
    const { promise, sure, cancel } = openDialog(category);
    currentCancelHandler.value = cancel;
    currentSureHandler.value = sure;
    let shouldRedirect = false;
    try {
        shouldRedirect = await promise;
    }
    finally {
        currentCancelHandler.value = null;
        currentSureHandler.value = null;
    }
    if (!shouldRedirect) {
        return;
    }
    let pathname = window.location.pathname;
    if (pathname) {
        pathname = pathname.substring(0, pathname.length - 1);
    }
    const nextPage = curOrigin + pathname + proxy + curLocation;
    if (category === 'oauth2') {
        request.get('/system/authentication/login/4').then((res) => {
            window.location.href = res;
            window.open(res, '_self');
        });
        return;
    }
    if (category === 'oidc') {
        request.get('/system/authentication/login/2').then((res) => {
            window.location.href = res;
            window.open(res, '_self');
        });
        return;
    }
    if (category === 'saml2') {
        saml2Handler?.value?.toLoginPage();
        return;
    }
    if (category === 'cas') {
        request.get('/system/authentication/login/1').then((res) => {
            window.location.href = res;
            window.open(res, '_self');
        });
        return;
    }
    window.location.href = nextPage;
};
const getCurLocation = () => {
    let queryRedirectPath = '/';
    if (router.currentRoute.value.query.redirect) {
        queryRedirectPath = router.currentRoute.value.query.redirect;
    }
    return queryRedirectPath;
};
const third_party_authentication = (state) => {
    if (!state) {
        return null;
    }
    const findKey = Object.keys(origin_mapping)
        .reverse()
        .find((key) => state.includes(origin_mapping[key]));
    if (!findKey) {
        return null;
    }
    const originName = origin_mapping[findKey];
    if (originName === 'saml2' || originName === 'ldap') {
        return null;
    }
    const urlParams = getUrlParams();
    const urlFlag = findKey && findKey > 5 ? 'platform' : 'authentication';
    const ssoUrl = `/system/${urlFlag}/sso/${findKey}`;
    if (!urlParams?.redirect_uri) {
        urlParams['redirect_uri'] = encodeURIComponent(getSQLBotAddr());
    }
    request
        .post(ssoUrl, urlParams)
        .then((res) => {
        const token = res.access_token;
        const platform_info = res.platform_info;
        if (token && isPlatformClient()) {
            wsCache.set('sqlbot-platform-client', true);
        }
        userStore.setToken(token);
        userStore.setExp(res.exp);
        userStore.setTime(Date.now());
        const platform_info_param = {
            flag: originName,
            origin: findKey,
        };
        if (platform_info) {
            platform_info_param['data'] = JSON.stringify(platform_info);
        }
        if (originName === 'cas') {
            const ticket = getQueryString('ticket');
            platform_info_param['data'] = ticket;
        }
        userStore.setPlatformInfo(platform_info_param);
        const queryRedirectPath = getCurLocation();
        router.push({ path: queryRedirectPath });
    })
        .catch((e) => {
        userStore.setToken('');
        setTimeout(() => {
            platformLoginMsg.value = e?.message || e;
            setTimeout(() => {
                window.location.href = getSQLBotAddr() + window.location.hash;
            }, 2000);
        }, 1500);
    });
    return findKey;
};
const queryCategoryStatus = () => {
    const url = `/system/authentication/platform/status`;
    return request.get(url);
};
const callBackType = () => {
    return getQueryString('state');
};
const loginTypeParam = () => {
    let login_type = getQueryString('login_type');
    if (!login_type) {
        return null;
    }
    const mappingArray = ['default', 'cas', 'oidc', 'ldap', 'oauth2', 'saml2'];
    const index = mappingArray.indexOf(login_type.toLocaleLowerCase());
    if (index === -1) {
        if (/^[0-5]$/.test(login_type)) {
            return parseInt(login_type);
        }
        return null;
    }
    return index;
};
const auto2Platform = async () => {
    if (adminLogin.value) {
        updateLoading(false, 100);
        return;
    }
    let res = loginTypeParam();
    if (res === null) {
        const resData = await request.get('/system/parameter/login');
        const resObj = {};
        resData.forEach((item) => {
            resObj[item.pkey] = item.pval;
        });
        res = parseInt(resObj['login.default_login'] || 0);
    }
    const originArray = ['default', 'cas', 'oidc', 'ldap', 'oauth2', 'saml2'];
    if (res && !adminLogin.value && loginCategory.value[originArray[res]]) {
        if (res === 3) {
            qrStatusChange('ldap');
            updateLoading(false);
        }
        nextTick(() => {
            ssoLogin(res);
        });
    }
    else {
        updateLoading(false);
    }
};
onMounted(() => {
    if (adminLogin.value) {
        updateLoading(false, 100);
        return;
    }
    // 暂时注释掉LicenseGenerator相关代码，因为它不存在
    // const obj = LicenseGenerator.getLicense()
    // if (obj?.status !== 'valid') {
    //   updateLoading(false, 100)
    //   return
    // }
    wsCache.delete('sqlbot-platform-client');
    init(async () => {
        const state = callBackType();
        const originName = third_party_authentication(state);
        if (!originName) {
            auto2Platform();
            return;
        }
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.loginCategory.qrcode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ({ 'de-qr-hidden': !__VLS_ctx.qrStatus }) },
    });
    if (__VLS_ctx.qrStatus) {
        /** @type {[typeof QrTab, ]} */ ;
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(QrTab, new QrTab({
            wecom: (__VLS_ctx.loginCategory.wecom),
            dingtalk: (__VLS_ctx.loginCategory.dingtalk),
            lark: (__VLS_ctx.loginCategory.lark),
            larksuite: (__VLS_ctx.loginCategory.larksuite),
        }));
        const __VLS_1 = __VLS_0({
            wecom: (__VLS_ctx.loginCategory.wecom),
            dingtalk: (__VLS_ctx.loginCategory.dingtalk),
            lark: (__VLS_ctx.loginCategory.lark),
            larksuite: (__VLS_ctx.loginCategory.larksuite),
        }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    }
}
if (__VLS_ctx.isLdap) {
    /** @type {[typeof LdapLoginForm, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(LdapLoginForm, new LdapLoginForm({}));
    const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-other-login" },
});
if (__VLS_ctx.anyEnable) {
    const __VLS_6 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        ...{ class: "de-other-login-divider" },
    }));
    const __VLS_8 = __VLS_7({
        ...{ class: "de-other-login-divider" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_9.slots.default;
    (__VLS_ctx.t('login.other_login'));
    var __VLS_9;
}
if (__VLS_ctx.anyEnable) {
    const __VLS_10 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        ...{ class: "other-login-item" },
    }));
    const __VLS_12 = __VLS_11({
        ...{ class: "other-login-item" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_13.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-list" },
    });
    if (__VLS_ctx.loginCategory.qrcode || __VLS_ctx.loginCategory.ldap) {
        /** @type {[typeof QrcodeLdap, ]} */ ;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(QrcodeLdap, new QrcodeLdap({
            ...{ 'onStatusChange': {} },
            ref: "qrcodeLdapHandler",
            qrcode: (__VLS_ctx.loginCategory.qrcode),
            ldap: (__VLS_ctx.loginCategory.ldap),
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onStatusChange': {} },
            ref: "qrcodeLdapHandler",
            qrcode: (__VLS_ctx.loginCategory.qrcode),
            ldap: (__VLS_ctx.loginCategory.ldap),
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_17;
        let __VLS_18;
        let __VLS_19;
        const __VLS_20 = {
            onStatusChange: (__VLS_ctx.qrStatusChange)
        };
        /** @type {typeof __VLS_ctx.qrcodeLdapHandler} */ ;
        var __VLS_21 = {};
        var __VLS_16;
    }
    if (__VLS_ctx.loginCategory.oidc) {
        /** @type {[typeof Oidc, ]} */ ;
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(Oidc, new Oidc({
            ...{ 'onSwitchCategory': {} },
        }));
        const __VLS_24 = __VLS_23({
            ...{ 'onSwitchCategory': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        let __VLS_26;
        let __VLS_27;
        let __VLS_28;
        const __VLS_29 = {
            onSwitchCategory: (__VLS_ctx.switcherCategory)
        };
        var __VLS_25;
    }
    if (__VLS_ctx.loginCategory.oauth2) {
        /** @type {[typeof Oauth2, ]} */ ;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent(Oauth2, new Oauth2({
            ...{ 'onSwitchCategory': {} },
        }));
        const __VLS_31 = __VLS_30({
            ...{ 'onSwitchCategory': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        let __VLS_33;
        let __VLS_34;
        let __VLS_35;
        const __VLS_36 = {
            onSwitchCategory: (__VLS_ctx.switcherCategory)
        };
        var __VLS_32;
    }
    if (__VLS_ctx.loginCategory.cas) {
        /** @type {[typeof Cas, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(Cas, new Cas({
            ...{ 'onSwitchCategory': {} },
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onSwitchCategory': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_40;
        let __VLS_41;
        let __VLS_42;
        const __VLS_43 = {
            onSwitchCategory: (__VLS_ctx.switcherCategory)
        };
        var __VLS_39;
    }
    var __VLS_13;
}
const __VLS_44 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.loginDialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "420",
    destroyOnClose: (true),
    closeOnClickModal: (false),
    modalClass: "login-platform-dialog",
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.loginDialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "420",
    destroyOnClose: (true),
    closeOnClickModal: (false),
    modalClass: "login-platform-dialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClosed: (__VLS_ctx.closeHandler)
};
__VLS_47.slots.default;
{
    const { footer: __VLS_thisSlot } = __VLS_47.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_52 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (__VLS_ctx.closeHandler)
    };
    __VLS_55.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_55;
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (__VLS_ctx.redirectImmediately)
    };
    __VLS_63.slots.default;
    (__VLS_ctx.t('login.redirect_immediately'));
    var __VLS_63;
}
var __VLS_47;
/** @type {__VLS_StyleScopedClasses['de-qr-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sqlbot-other-login']} */ ;
/** @type {__VLS_StyleScopedClasses['de-other-login-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['other-login-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-list']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_22 = __VLS_21;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            QrcodeLdap: QrcodeLdap,
            LdapLoginForm: LdapLoginForm,
            Oidc: Oidc,
            Cas: Cas,
            Oauth2: Oauth2,
            QrTab: QrTab,
            isLdap: isLdap,
            t: t,
            loginDialogVisible: loginDialogVisible,
            dialogTitle: dialogTitle,
            qrStatus: qrStatus,
            loginCategory: loginCategory,
            anyEnable: anyEnable,
            qrcodeLdapHandler: qrcodeLdapHandler,
            closeHandler: closeHandler,
            redirectImmediately: redirectImmediately,
            qrStatusChange: qrStatusChange,
            switcherCategory: switcherCategory,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
