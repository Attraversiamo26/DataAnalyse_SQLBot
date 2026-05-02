import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import ds from '@/assets/svg/ds.svg';
import dashboard from '@/assets/svg/dashboard.svg';
import chat from '@/assets/svg/chat.svg';
import iconsetting from '@/assets/svg/setting.svg';
import iconsystem from '@/assets/svg/system.svg';
import icon_user from '@/assets/svg/icon_user.svg';
import icon_ai from '@/assets/svg/icon_ai.svg';
import { ArrowLeftBold } from '@element-plus/icons-vue';
import { useCache } from '@/utils/useCache';
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/Language-selector/index.vue';
import AboutDialog from '@/components/about/index.vue';
const aboutRef = ref();
const { t } = useI18n();
const { wsCache } = useCache();
const topLayout = ref(false);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const name = ref('admin');
const activeMenu = computed(() => route.path);
const routerList = computed(() => {
    return router.getRoutes().filter((route) => {
        return (!route.path.includes('canvas') &&
            !route.path.includes('preview') &&
            route.path !== '/login' &&
            !route.path.includes('/system') &&
            !route.redirect &&
            route.path !== '/:pathMatch(.*)*' &&
            !route.path.includes('dsTable'));
    });
});
const sysRouterList = computed(() => {
    const result = router
        .getRoutes()
        .filter((route) => route.path.includes('/system') && !route.redirect);
    return result;
});
const showSubmenu = computed(() => {
    return route.path.includes('/system');
});
// const workspace = ref('1')
/* const options = [
  {value: '1', label: 'Default workspace'},
  {value: '2', label: 'Workspace 2'},
  {value: '3', label: 'Workspace 3'}
] */
const currentPageTitle = computed(() => {
    if (route.path.includes('/system')) {
        return 'System Settings';
    }
    return route.meta.title || 'Dashboard';
});
const resolveIcon = (iconName) => {
    const icons = {
        ds: ds,
        dashboard: dashboard,
        chat: chat,
        setting: iconsetting,
        icon_user: icon_user,
        icon_ai: icon_ai,
    };
    return typeof icons[iconName] === 'function' ? icons[iconName]() : icons[iconName];
};
const menuSelect = (e) => {
    router.push(e.index);
};
const logout = async () => {
    if (!(await userStore.logout())) {
        router.push('/login');
    }
};
const toSystem = () => {
    router.push('/system');
};
const backMain = () => {
    router.push('/');
};
const switchLayout = () => {
    topLayout.value = !topLayout.value;
    wsCache.set('sqlbot-topbar-layout', topLayout.value);
};
const toAbout = () => {
    aboutRef.value?.open();
};
onMounted(() => {
    topLayout.value = wsCache.get('sqlbot-topbar-layout') || true;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-menu--vertical']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-select']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-select__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-label']} */ ;
/** @type {__VLS_StyleScopedClasses['header-icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content-with-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-menu-container']} */ ;
/** @type {__VLS_StyleScopedClasses['sys-page-content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-container" },
    ...{ class: ({ 'app-topbar-container': __VLS_ctx.topLayout }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu" },
    ...{ class: ({ 'main-menu-sidebar': !__VLS_ctx.topLayout, 'main-menu-topbar': __VLS_ctx.topLayout }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo" },
});
if (!__VLS_ctx.topLayout || !__VLS_ctx.showSubmenu) {
    const __VLS_0 = {}.ElMenu;
    /** @type {[typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        defaultActive: (__VLS_ctx.activeMenu),
        ...{ class: "menu-container" },
        mode: (__VLS_ctx.topLayout ? 'horizontal' : 'vertical'),
    }));
    const __VLS_2 = __VLS_1({
        defaultActive: (__VLS_ctx.activeMenu),
        ...{ class: "menu-container" },
        mode: (__VLS_ctx.topLayout ? 'horizontal' : 'vertical'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.routerList))) {
        const __VLS_4 = {}.ElMenuItem;
        /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            ...{ 'onClick': {} },
            key: (item.path),
            index: (item.path),
        }));
        const __VLS_6 = __VLS_5({
            ...{ 'onClick': {} },
            key: (item.path),
            index: (item.path),
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        let __VLS_8;
        let __VLS_9;
        let __VLS_10;
        const __VLS_11 = {
            onClick: (__VLS_ctx.menuSelect)
        };
        __VLS_7.slots.default;
        if (item.meta.icon) {
            const __VLS_12 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
            const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
            __VLS_15.slots.default;
            const __VLS_16 = ((__VLS_ctx.resolveIcon(item.meta.icon)));
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
            const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
            var __VLS_15;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.t(`menu.${item.meta.title}`));
        var __VLS_7;
    }
    var __VLS_3;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "top-bar-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
        ...{ class: "split" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('common.system_manage'));
}
if (__VLS_ctx.topLayout) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-topbar-right" },
    });
    if (__VLS_ctx.showSubmenu) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "top-back-area" },
        });
        const __VLS_20 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            ...{ 'onClick': {} },
            type: "primary",
            text: "primary",
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onClick': {} },
            type: "primary",
            text: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_24;
        let __VLS_25;
        let __VLS_26;
        const __VLS_27 = {
            onClick: (__VLS_ctx.backMain)
        };
        __VLS_23.slots.default;
        const __VLS_28 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            ...{ class: "el-icon--right" },
        }));
        const __VLS_30 = __VLS_29({
            ...{ class: "el-icon--right" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        const __VLS_32 = {}.ArrowLeftBold;
        /** @type {[typeof __VLS_components.ArrowLeftBold, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
        var __VLS_31;
        (__VLS_ctx.t('common.back'));
        var __VLS_23;
    }
    else {
        const __VLS_36 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            content: (__VLS_ctx.t('common.system_manage')),
            placement: "bottom",
        }));
        const __VLS_38 = __VLS_37({
            content: (__VLS_ctx.t('common.system_manage')),
            placement: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (__VLS_ctx.toSystem) },
            ...{ class: "header-icon-btn" },
        });
        const __VLS_40 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        const __VLS_44 = {}.iconsystem;
        /** @type {[typeof __VLS_components.Iconsystem, typeof __VLS_components.iconsystem, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        var __VLS_43;
        var __VLS_39;
    }
    const __VLS_48 = {}.ElDropdown;
    /** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        trigger: "click",
    }));
    const __VLS_50 = __VLS_49({
        trigger: "click",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "user-info" },
    });
    const __VLS_52 = {}.ElAvatar;
    /** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        size: "small",
    }));
    const __VLS_54 = __VLS_53({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    (__VLS_ctx.name?.charAt(0));
    var __VLS_55;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "user-name" },
    });
    (__VLS_ctx.name);
    {
        const { dropdown: __VLS_thisSlot } = __VLS_51.slots;
        const __VLS_56 = {}.ElDropdownMenu;
        /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
        const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        const __VLS_60 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            ...{ 'onClick': {} },
        }));
        const __VLS_62 = __VLS_61({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        let __VLS_64;
        let __VLS_65;
        let __VLS_66;
        const __VLS_67 = {
            onClick: (__VLS_ctx.switchLayout)
        };
        __VLS_63.slots.default;
        var __VLS_63;
        const __VLS_68 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            ...{ 'onClick': {} },
        }));
        const __VLS_70 = __VLS_69({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        let __VLS_72;
        let __VLS_73;
        let __VLS_74;
        const __VLS_75 = {
            onClick: (__VLS_ctx.logout)
        };
        __VLS_71.slots.default;
        var __VLS_71;
        const __VLS_76 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
        const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
        __VLS_79.slots.default;
        /** @type {[typeof LanguageSelector, ]} */ ;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent(LanguageSelector, new LanguageSelector({}));
        const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
        var __VLS_79;
        const __VLS_83 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
            ...{ 'onClick': {} },
        }));
        const __VLS_85 = __VLS_84({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        let __VLS_87;
        let __VLS_88;
        let __VLS_89;
        const __VLS_90 = {
            onClick: (__VLS_ctx.toAbout)
        };
        __VLS_86.slots.default;
        var __VLS_86;
        var __VLS_59;
    }
    var __VLS_51;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-content" },
    ...{ class: ({ 'main-content-with-bar': __VLS_ctx.topLayout }) },
});
if (!__VLS_ctx.topLayout) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.currentPageTitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    const __VLS_91 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        content: "System manage",
        placement: "bottom",
    }));
    const __VLS_93 = __VLS_92({
        content: "System manage",
        placement: "bottom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    __VLS_94.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.toSystem) },
        ...{ class: "header-icon-btn" },
    });
    const __VLS_95 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({}));
    const __VLS_97 = __VLS_96({}, ...__VLS_functionalComponentArgsRest(__VLS_96));
    __VLS_98.slots.default;
    const __VLS_99 = {}.iconsystem;
    /** @type {[typeof __VLS_components.Iconsystem, typeof __VLS_components.iconsystem, ]} */ ;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({}));
    const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
    var __VLS_98;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('common.system_manage'));
    var __VLS_94;
    const __VLS_103 = {}.ElDropdown;
    /** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
        trigger: "click",
    }));
    const __VLS_105 = __VLS_104({
        trigger: "click",
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    __VLS_106.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "user-info" },
    });
    const __VLS_107 = {}.ElAvatar;
    /** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
        size: "small",
    }));
    const __VLS_109 = __VLS_108({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    __VLS_110.slots.default;
    (__VLS_ctx.name?.charAt(0));
    var __VLS_110;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "user-name" },
    });
    (__VLS_ctx.name);
    {
        const { dropdown: __VLS_thisSlot } = __VLS_106.slots;
        const __VLS_111 = {}.ElDropdownMenu;
        /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
        // @ts-ignore
        const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({}));
        const __VLS_113 = __VLS_112({}, ...__VLS_functionalComponentArgsRest(__VLS_112));
        __VLS_114.slots.default;
        const __VLS_115 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
            ...{ 'onClick': {} },
        }));
        const __VLS_117 = __VLS_116({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_116));
        let __VLS_119;
        let __VLS_120;
        let __VLS_121;
        const __VLS_122 = {
            onClick: (__VLS_ctx.switchLayout)
        };
        __VLS_118.slots.default;
        var __VLS_118;
        const __VLS_123 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
            ...{ 'onClick': {} },
        }));
        const __VLS_125 = __VLS_124({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_124));
        let __VLS_127;
        let __VLS_128;
        let __VLS_129;
        const __VLS_130 = {
            onClick: (__VLS_ctx.logout)
        };
        __VLS_126.slots.default;
        var __VLS_126;
        const __VLS_131 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({}));
        const __VLS_133 = __VLS_132({}, ...__VLS_functionalComponentArgsRest(__VLS_132));
        __VLS_134.slots.default;
        /** @type {[typeof LanguageSelector, ]} */ ;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent(LanguageSelector, new LanguageSelector({}));
        const __VLS_136 = __VLS_135({}, ...__VLS_functionalComponentArgsRest(__VLS_135));
        var __VLS_134;
        const __VLS_138 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
            ...{ 'onClick': {} },
        }));
        const __VLS_140 = __VLS_139({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        let __VLS_142;
        let __VLS_143;
        let __VLS_144;
        const __VLS_145 = {
            onClick: (__VLS_ctx.toAbout)
        };
        __VLS_141.slots.default;
        var __VLS_141;
        var __VLS_114;
    }
    var __VLS_106;
}
if (__VLS_ctx.sysRouterList.length && __VLS_ctx.showSubmenu) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sub-menu-container" },
    });
    const __VLS_146 = {}.ElMenu;
    /** @type {[typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, ]} */ ;
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
        defaultActive: (__VLS_ctx.activeMenu),
        ...{ class: "el-menu-demo" },
        mode: (!__VLS_ctx.topLayout ? 'horizontal' : 'vertical'),
    }));
    const __VLS_148 = __VLS_147({
        defaultActive: (__VLS_ctx.activeMenu),
        ...{ class: "el-menu-demo" },
        mode: (!__VLS_ctx.topLayout ? 'horizontal' : 'vertical'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    __VLS_149.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.sysRouterList))) {
        const __VLS_150 = {}.ElMenuItem;
        /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
        // @ts-ignore
        const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
            ...{ 'onClick': {} },
            key: (item.path),
            index: (item.path),
        }));
        const __VLS_152 = __VLS_151({
            ...{ 'onClick': {} },
            key: (item.path),
            index: (item.path),
        }, ...__VLS_functionalComponentArgsRest(__VLS_151));
        let __VLS_154;
        let __VLS_155;
        let __VLS_156;
        const __VLS_157 = {
            onClick: (__VLS_ctx.menuSelect)
        };
        __VLS_153.slots.default;
        if (item.meta.icon) {
            const __VLS_158 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({}));
            const __VLS_160 = __VLS_159({}, ...__VLS_functionalComponentArgsRest(__VLS_159));
            __VLS_161.slots.default;
            const __VLS_162 = ((__VLS_ctx.resolveIcon(item.meta.icon)));
            // @ts-ignore
            const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({}));
            const __VLS_164 = __VLS_163({}, ...__VLS_functionalComponentArgsRest(__VLS_163));
            var __VLS_161;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.t(`menu.${item.meta.title}`));
        var __VLS_153;
    }
    var __VLS_149;
}
if (__VLS_ctx.sysRouterList.length && __VLS_ctx.showSubmenu) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sys-page-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sys-inner-container" },
    });
    const __VLS_166 = {}.RouterView;
    /** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({}));
    const __VLS_168 = __VLS_167({}, ...__VLS_functionalComponentArgsRest(__VLS_167));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-content" },
    });
    const __VLS_170 = {}.RouterView;
    /** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({}));
    const __VLS_172 = __VLS_171({}, ...__VLS_functionalComponentArgsRest(__VLS_171));
}
/** @type {[typeof AboutDialog, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(AboutDialog, new AboutDialog({
    ref: "aboutRef",
}));
const __VLS_175 = __VLS_174({
    ref: "aboutRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
/** @type {typeof __VLS_ctx.aboutRef} */ ;
var __VLS_177 = {};
var __VLS_176;
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
/** @type {__VLS_StyleScopedClasses['app-topbar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-container']} */ ;
/** @type {__VLS_StyleScopedClasses['top-bar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['split']} */ ;
/** @type {__VLS_StyleScopedClasses['main-topbar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['top-back-area']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon--right']} */ ;
/** @type {__VLS_StyleScopedClasses['header-icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content-with-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['header-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['header-icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-menu-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-demo']} */ ;
/** @type {__VLS_StyleScopedClasses['sys-page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['sys-inner-container']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
// @ts-ignore
var __VLS_178 = __VLS_177;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            iconsystem: iconsystem,
            ArrowLeftBold: ArrowLeftBold,
            LanguageSelector: LanguageSelector,
            AboutDialog: AboutDialog,
            aboutRef: aboutRef,
            t: t,
            topLayout: topLayout,
            name: name,
            activeMenu: activeMenu,
            routerList: routerList,
            sysRouterList: sysRouterList,
            showSubmenu: showSubmenu,
            currentPageTitle: currentPageTitle,
            resolveIcon: resolveIcon,
            menuSelect: menuSelect,
            logout: logout,
            toSystem: toSystem,
            backMain: backMain,
            switchLayout: switchLayout,
            toAbout: toAbout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
