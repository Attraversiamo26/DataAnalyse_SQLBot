import { ref, computed } from 'vue';
import Default_avatar_custom from '@/assets/img/Default-avatar.svg';
import icon_admin_outlined from '@/assets/svg/icon_admin_outlined.svg';
import icon_info_outlined_1 from '@/assets/svg/icon_info_outlined_1.svg';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
import icon_maybe_outlined from '@/assets/svg/icon-maybe_outlined.svg';
import icon_key_outlined from '@/assets/svg/icon-key_outlined.svg';
import icon_api_key from '@/assets/svg/icon-api_key.svg';
import icon_translate_outlined from '@/assets/svg/icon_translate_outlined.svg';
import icon_logout_outlined from '@/assets/svg/icon_logout_outlined.svg';
import icon_right_outlined from '@/assets/svg/icon_right_outlined.svg';
import AboutDialog from '@/components/about/index.vue';
import icon_done_outlined from '@/assets/svg/icon_done_outlined.svg';
import { useI18n } from 'vue-i18n';
import PwdForm from './PwdForm.vue';
import Apikey from './Apikey.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { userApi } from '@/api/auth';
import { toLoginPage } from '@/utils/utils';
import { useCache } from '@/utils/useCache';
const { wsCache } = useCache();
const router = useRouter();
const appearanceStore = useAppearanceStoreWithOut();
const userStore = useUserStore();
const pwdFormRef = ref();
const { t, locale } = useI18n();
const __VLS_props = defineProps({
    collapse: { type: [Boolean], required: true },
    inSysmenu: { type: [Boolean], required: true },
});
const name = computed(() => userStore.getName);
const account = computed(() => userStore.getAccount);
const currentLanguage = computed(() => userStore.getLanguage);
const isAdmin = computed(() => userStore.isAdmin);
const isLocalUser = computed(() => !userStore.getOrigin);
const isClient = computed(() => {
    return !!wsCache.get('sqlbot-platform-client');
});
const platFlag = computed(() => {
    const platformInfo = userStore.getPlatformInfo;
    return platformInfo?.origin || 0;
});
const dialogVisible = ref(false);
const apikeyDialogVisible = ref(false);
const aboutRef = ref();
const languageList = computed(() => [
    {
        name: 'English',
        value: 'en',
    },
    {
        name: '简体中文',
        value: 'zh-CN',
    },
    {
        name: '한국인',
        value: 'ko-KR',
    },
]);
const popoverRef = ref();
const toSystem = () => {
    popoverRef.value.hide();
    router.push('/system');
};
const changeLanguage = (lang) => {
    locale.value = lang;
    userStore.setLanguage(lang);
    const param = {
        language: lang,
    };
    userApi.language(param).then(() => {
        window.location.reload();
    });
};
const openHelp = () => {
    window.open(appearanceStore.getHelp || 'https://dataease.cn/sqlbot/', '_blank');
};
const openPwd = () => {
    dialogVisible.value = true;
};
const closePwd = () => {
    dialogVisible.value = false;
};
const openApikey = () => {
    apikeyDialogVisible.value = true;
};
const toAbout = () => {
    aboutRef.value?.open();
};
const savePwdHandler = () => {
    pwdFormRef.value?.submit();
};
const logout = async () => {
    if (!(await userStore.logout())) {
        router.push(toLoginPage(router?.currentRoute?.value?.fullPath || ''));
        // router.push('/login')
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "popoverRef",
    trigger: "click",
    popperClass: "system-person",
    placement: (__VLS_ctx.collapse ? 'right' : 'top-start'),
}));
const __VLS_2 = __VLS_1({
    ref: "popoverRef",
    trigger: "click",
    popperClass: "system-person",
    placement: (__VLS_ctx.collapse ? 'right' : 'top-start'),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.popoverRef} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
{
    const { reference: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ class: "person" },
        title: (__VLS_ctx.name),
        ...{ class: (__VLS_ctx.collapse && 'collapse') },
    });
    const __VLS_6 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        size: "32",
    }));
    const __VLS_8 = __VLS_7({
        size: "32",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_9.slots.default;
    const __VLS_10 = {}.Default_avatar_custom;
    /** @type {[typeof __VLS_components.Default_avatar_custom, typeof __VLS_components.Default_avatar_custom, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({}));
    const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
    var __VLS_9;
    if (!__VLS_ctx.collapse) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "name ellipsis" },
        });
        (__VLS_ctx.name);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info" },
});
const __VLS_14 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    ...{ class: "avatar-custom" },
    size: "40",
}));
const __VLS_16 = __VLS_15({
    ...{ class: "avatar-custom" },
    size: "40",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
const __VLS_18 = {}.Default_avatar_custom;
/** @type {[typeof __VLS_components.Default_avatar_custom, typeof __VLS_components.Default_avatar_custom, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({}));
const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
var __VLS_17;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    title: (__VLS_ctx.name),
    ...{ class: "top ellipsis" },
});
(__VLS_ctx.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    title: (__VLS_ctx.account),
    ...{ class: "bottom ellipsis" },
});
(__VLS_ctx.account);
if (__VLS_ctx.isAdmin && !__VLS_ctx.inSysmenu) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.toSystem) },
        ...{ class: "popover-item" },
    });
    const __VLS_22 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_24 = __VLS_23({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_25.slots.default;
    const __VLS_26 = {}.icon_admin_outlined;
    /** @type {[typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({}));
    const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
    var __VLS_25;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    (__VLS_ctx.$t('common.system_manage'));
}
if (__VLS_ctx.isLocalUser && !__VLS_ctx.platFlag) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.openPwd) },
        ...{ class: "popover-item" },
    });
    const __VLS_30 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
        size: "16",
    }));
    const __VLS_32 = __VLS_31({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    __VLS_33.slots.default;
    const __VLS_34 = {}.icon_key_outlined;
    /** @type {[typeof __VLS_components.Icon_key_outlined, typeof __VLS_components.icon_key_outlined, typeof __VLS_components.Icon_key_outlined, typeof __VLS_components.icon_key_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({}));
    const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
    var __VLS_33;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    (__VLS_ctx.$t('user.change_password'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.openApikey) },
    ...{ class: "popover-item" },
});
const __VLS_38 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    size: "16",
}));
const __VLS_40 = __VLS_39({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
const __VLS_42 = {}.icon_api_key;
/** @type {[typeof __VLS_components.Icon_api_key, typeof __VLS_components.icon_api_key, typeof __VLS_components.Icon_api_key, typeof __VLS_components.icon_api_key, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({}));
const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
var __VLS_41;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-name" },
});
const __VLS_46 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    teleported: (false),
    popperClass: "system-language",
    placement: "right",
}));
const __VLS_48 = __VLS_47({
    teleported: (false),
    popperClass: "system-language",
    placement: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
{
    const { reference: __VLS_thisSlot } = __VLS_49.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover-item" },
    });
    const __VLS_50 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        size: "16",
    }));
    const __VLS_52 = __VLS_51({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_53.slots.default;
    const __VLS_54 = {}.icon_translate_outlined;
    /** @type {[typeof __VLS_components.Icon_translate_outlined, typeof __VLS_components.icon_translate_outlined, typeof __VLS_components.Icon_translate_outlined, typeof __VLS_components.icon_translate_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    var __VLS_53;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    (__VLS_ctx.$t('common.language'));
    const __VLS_58 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        ...{ class: "right" },
        size: "16",
    }));
    const __VLS_60 = __VLS_59({
        ...{ class: "right" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_61.slots.default;
    const __VLS_62 = {}.icon_right_outlined;
    /** @type {[typeof __VLS_components.Icon_right_outlined, typeof __VLS_components.icon_right_outlined, typeof __VLS_components.Icon_right_outlined, typeof __VLS_components.icon_right_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({}));
    const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
    var __VLS_61;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "language-popover" },
});
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.languageList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.changeLanguage(ele.value);
            } },
        key: (ele.name),
        ...{ class: "popover-item_language" },
        ...{ class: (__VLS_ctx.currentLanguage === ele.value && 'isActive') },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "language-name" },
    });
    (ele.name);
    const __VLS_66 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        size: "16",
        ...{ class: "done" },
    }));
    const __VLS_68 = __VLS_67({
        size: "16",
        ...{ class: "done" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_69.slots.default;
    const __VLS_70 = {}.icon_done_outlined;
    /** @type {[typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({}));
    const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
    var __VLS_69;
}
var __VLS_49;
if (__VLS_ctx.appearanceStore.getShowAbout) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.toAbout) },
        ...{ class: "popover-item" },
    });
    const __VLS_74 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        size: "16",
    }));
    const __VLS_76 = __VLS_75({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    __VLS_77.slots.default;
    const __VLS_78 = {}.icon_info_outlined_1;
    /** @type {[typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({}));
    const __VLS_80 = __VLS_79({}, ...__VLS_functionalComponentArgsRest(__VLS_79));
    var __VLS_77;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    (__VLS_ctx.$t('about.title'));
}
if (__VLS_ctx.appearanceStore.getShowDoc) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.openHelp) },
        ...{ class: "popover-item" },
    });
    const __VLS_82 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        size: "16",
    }));
    const __VLS_84 = __VLS_83({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_85.slots.default;
    const __VLS_86 = {}.icon_maybe_outlined;
    /** @type {[typeof __VLS_components.Icon_maybe_outlined, typeof __VLS_components.icon_maybe_outlined, typeof __VLS_components.Icon_maybe_outlined, typeof __VLS_components.icon_maybe_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({}));
    const __VLS_88 = __VLS_87({}, ...__VLS_functionalComponentArgsRest(__VLS_87));
    var __VLS_85;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    (__VLS_ctx.$t('common.help'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
if (!__VLS_ctx.isClient) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.logout) },
        ...{ class: "popover-item mr4" },
    });
    const __VLS_90 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        size: "16",
    }));
    const __VLS_92 = __VLS_91({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_93.slots.default;
    const __VLS_94 = {}.icon_logout_outlined;
    /** @type {[typeof __VLS_components.Icon_logout_outlined, typeof __VLS_components.icon_logout_outlined, typeof __VLS_components.Icon_logout_outlined, typeof __VLS_components.icon_logout_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({}));
    const __VLS_96 = __VLS_95({}, ...__VLS_functionalComponentArgsRest(__VLS_95));
    var __VLS_93;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    (__VLS_ctx.$t('common.logout'));
}
var __VLS_3;
const __VLS_98 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.t('user.upgrade_pwd.title')),
    width: "600",
}));
const __VLS_100 = __VLS_99({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.t('user.upgrade_pwd.title')),
    width: "600",
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
__VLS_101.slots.default;
if (__VLS_ctx.dialogVisible) {
    /** @type {[typeof PwdForm, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(PwdForm, new PwdForm({
        ...{ 'onPwdSaved': {} },
        ref: "pwdFormRef",
    }));
    const __VLS_103 = __VLS_102({
        ...{ 'onPwdSaved': {} },
        ref: "pwdFormRef",
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    let __VLS_105;
    let __VLS_106;
    let __VLS_107;
    const __VLS_108 = {
        onPwdSaved: (__VLS_ctx.closePwd)
    };
    /** @type {typeof __VLS_ctx.pwdFormRef} */ ;
    var __VLS_109 = {};
    var __VLS_104;
}
{
    const { footer: __VLS_thisSlot } = __VLS_101.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_111 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_113 = __VLS_112({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    let __VLS_115;
    let __VLS_116;
    let __VLS_117;
    const __VLS_118 = {
        onClick: (__VLS_ctx.closePwd)
    };
    __VLS_114.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_114;
    const __VLS_119 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_121 = __VLS_120({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    let __VLS_123;
    let __VLS_124;
    let __VLS_125;
    const __VLS_126 = {
        onClick: (__VLS_ctx.savePwdHandler)
    };
    __VLS_122.slots.default;
    (__VLS_ctx.t('common.save'));
    var __VLS_122;
}
var __VLS_101;
const __VLS_127 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
    modelValue: (__VLS_ctx.apikeyDialogVisible),
    title: "API Key",
    width: "840",
}));
const __VLS_129 = __VLS_128({
    modelValue: (__VLS_ctx.apikeyDialogVisible),
    title: "API Key",
    width: "840",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
__VLS_130.slots.default;
if (__VLS_ctx.apikeyDialogVisible) {
    /** @type {[typeof Apikey, ]} */ ;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(Apikey, new Apikey({
        ref: "apikeyRef",
    }));
    const __VLS_132 = __VLS_131({
        ref: "apikeyRef",
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    /** @type {typeof __VLS_ctx.apikeyRef} */ ;
    var __VLS_134 = {};
    var __VLS_133;
}
var __VLS_130;
/** @type {[typeof AboutDialog, ]} */ ;
// @ts-ignore
const __VLS_136 = __VLS_asFunctionalComponent(AboutDialog, new AboutDialog({
    ref: "aboutRef",
}));
const __VLS_137 = __VLS_136({
    ref: "aboutRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_136));
/** @type {typeof __VLS_ctx.aboutRef} */ ;
var __VLS_139 = {};
var __VLS_138;
/** @type {__VLS_StyleScopedClasses['person']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['top']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['language-popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item_language']} */ ;
/** @type {__VLS_StyleScopedClasses['language-name']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['mr4']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4, __VLS_110 = __VLS_109, __VLS_135 = __VLS_134, __VLS_140 = __VLS_139;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Default_avatar_custom: Default_avatar_custom,
            icon_admin_outlined: icon_admin_outlined,
            icon_info_outlined_1: icon_info_outlined_1,
            icon_maybe_outlined: icon_maybe_outlined,
            icon_key_outlined: icon_key_outlined,
            icon_api_key: icon_api_key,
            icon_translate_outlined: icon_translate_outlined,
            icon_logout_outlined: icon_logout_outlined,
            icon_right_outlined: icon_right_outlined,
            AboutDialog: AboutDialog,
            icon_done_outlined: icon_done_outlined,
            PwdForm: PwdForm,
            Apikey: Apikey,
            appearanceStore: appearanceStore,
            pwdFormRef: pwdFormRef,
            t: t,
            name: name,
            account: account,
            currentLanguage: currentLanguage,
            isAdmin: isAdmin,
            isLocalUser: isLocalUser,
            isClient: isClient,
            platFlag: platFlag,
            dialogVisible: dialogVisible,
            apikeyDialogVisible: apikeyDialogVisible,
            aboutRef: aboutRef,
            languageList: languageList,
            popoverRef: popoverRef,
            toSystem: toSystem,
            changeLanguage: changeLanguage,
            openHelp: openHelp,
            openPwd: openPwd,
            closePwd: closePwd,
            openApikey: openApikey,
            toAbout: toAbout,
            savePwdHandler: savePwdHandler,
            logout: logout,
        };
    },
    props: {
        collapse: { type: [Boolean], required: true },
        inSysmenu: { type: [Boolean], required: true },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        collapse: { type: [Boolean], required: true },
        inSysmenu: { type: [Boolean], required: true },
    },
});
; /* PartiallyEnd: #4569/main.vue */
