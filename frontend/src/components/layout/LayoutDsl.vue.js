import { ref, computed, onUnmounted } from 'vue';
import Menu from './Menu.vue';
import custom_small from '@/assets/svg/logo-custom_small.svg';
import Workspace from './Workspace.vue';
import Person from './Person.vue';
import LOGO_fold from '@/assets/LOGO-fold.svg';
import icon_moments_categories_outlined from '@/assets/svg/icon_moments-categories_outlined.svg';
import icon_side_fold_outlined from '@/assets/svg/icon_side-fold_outlined.svg';
import icon_side_expand_outlined from '@/assets/svg/icon_side-expand_outlined.svg';
import { useRoute, useRouter } from 'vue-router';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
import { useEmitt } from '@/utils/useEmitt';
import { isMobile } from '@/utils/utils';
import { onBeforeMount } from 'vue';
const isPhone = computed(() => {
    return isMobile();
});
const router = useRouter();
const collapse = ref(false);
const collapseCopy = ref(false);
const appearanceStore = useAppearanceStoreWithOut();
let time;
onUnmounted(() => {
    clearTimeout(time);
});
const loginBg = computed(() => {
    return appearanceStore.getLogin;
});
const handleCollapseChange = (val = true) => {
    collapseCopy.value = val;
    clearTimeout(time);
    time = setTimeout(() => {
        collapse.value = val;
    }, 100);
};
useEmitt({
    name: 'collapse-change',
    callback: handleCollapseChange,
});
const handleFoldExpand = () => {
    handleCollapseChange(!collapse.value);
};
const toWorkspace = () => {
    router.push('/');
};
const toChatIndex = () => {
    router.push('/chat/index');
};
const toUserIndex = () => {
    router.push('/system/user');
};
const route = useRoute();
const showSysmenu = computed(() => {
    return route.path.includes('/system');
});
onBeforeMount(() => {
    if (isPhone.value) {
        collapse.value = true;
        collapseCopy.value = true;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['collapse-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['personal-info']} */ ;
/** @type {__VLS_StyleScopedClasses['fold']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "left-side" },
    ...{ class: (__VLS_ctx.collapse && 'left-side-collapse') },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "left-content" },
});
if (__VLS_ctx.showSysmenu) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.toUserIndex) },
        ...{ class: "sys-management" },
    });
    if (__VLS_ctx.loginBg) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onClick: (__VLS_ctx.toChatIndex) },
            ...{ style: ({ marginLeft: __VLS_ctx.collapse ? '5px' : 0 }) },
            height: "30",
            width: "30",
            src: (__VLS_ctx.loginBg),
            ...{ class: (!__VLS_ctx.collapse && 'collapse-icon') },
            alt: "",
        });
    }
    else if (__VLS_ctx.appearanceStore.themeColor !== 'default') {
        const __VLS_0 = {}.custom_small;
        /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ style: ({ marginLeft: __VLS_ctx.collapse ? '5px' : 0 }) },
            ...{ class: (!__VLS_ctx.collapse && 'collapse-icon') },
        }));
        const __VLS_2 = __VLS_1({
            ...{ style: ({ marginLeft: __VLS_ctx.collapse ? '5px' : 0 }) },
            ...{ class: (!__VLS_ctx.collapse && 'collapse-icon') },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    else {
        const __VLS_4 = {}.LOGO_fold;
        /** @type {[typeof __VLS_components.LOGO_fold, typeof __VLS_components.LOGO_fold, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            ...{ style: ({ marginLeft: __VLS_ctx.collapse ? '5px' : 0 }) },
            ...{ class: (!__VLS_ctx.collapse && 'collapse-icon') },
        }));
        const __VLS_6 = __VLS_5({
            ...{ style: ({ marginLeft: __VLS_ctx.collapse ? '5px' : 0 }) },
            ...{ class: (!__VLS_ctx.collapse && 'collapse-icon') },
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    }
    if (!__VLS_ctx.collapse) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('training.system_management'));
    }
}
else {
    if (__VLS_ctx.appearanceStore.isBlue) {
        if (__VLS_ctx.loginBg && __VLS_ctx.collapse) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onClick: (__VLS_ctx.toChatIndex) },
                ...{ style: {} },
                height: "30",
                width: "30",
                src: (__VLS_ctx.loginBg),
                alt: "",
            });
        }
        else if (__VLS_ctx.loginBg && !__VLS_ctx.collapse) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "default-sqlbot" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onClick: (__VLS_ctx.toChatIndex) },
                height: "30",
                width: "30",
                src: (__VLS_ctx.loginBg),
                alt: "",
                ...{ class: "collapse-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
                title: (__VLS_ctx.appearanceStore.name),
                ...{ class: "ellipsis" },
            });
            (__VLS_ctx.appearanceStore.name);
        }
        else if (__VLS_ctx.collapse) {
            const __VLS_8 = {}.custom_small;
            /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
                ...{ style: ({ marginLeft: __VLS_ctx.collapse ? '5px' : 0 }) },
                ...{ class: (!__VLS_ctx.collapse && 'collapse-icon') },
            }));
            const __VLS_10 = __VLS_9({
                ...{ style: ({ marginLeft: __VLS_ctx.collapse ? '5px' : 0 }) },
                ...{ class: (!__VLS_ctx.collapse && 'collapse-icon') },
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "default-sqlbot" },
            });
            const __VLS_12 = {}.custom_small;
            /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
                ...{ class: "collapse-icon" },
            }));
            const __VLS_14 = __VLS_13({
                ...{ class: "collapse-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
                title: (__VLS_ctx.appearanceStore.name),
                ...{ class: "ellipsis" },
            });
            (__VLS_ctx.appearanceStore.name);
        }
    }
    else if (__VLS_ctx.appearanceStore.themeColor === 'custom') {
        if (__VLS_ctx.loginBg && __VLS_ctx.collapse) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onClick: (__VLS_ctx.toChatIndex) },
                ...{ style: {} },
                height: "30",
                width: "30",
                src: (__VLS_ctx.loginBg),
                alt: "",
            });
        }
        else if (__VLS_ctx.loginBg && !__VLS_ctx.collapse) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "default-sqlbot" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onClick: (__VLS_ctx.toChatIndex) },
                height: "30",
                width: "30",
                src: (__VLS_ctx.loginBg),
                alt: "",
                ...{ class: "collapse-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
                title: (__VLS_ctx.appearanceStore.name),
                ...{ class: "ellipsis" },
            });
            (__VLS_ctx.appearanceStore.name);
        }
        else if (__VLS_ctx.collapse) {
            const __VLS_16 = {}.custom_small;
            /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                ...{ 'onClick': {} },
                ...{ style: {} },
            }));
            const __VLS_18 = __VLS_17({
                ...{ 'onClick': {} },
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            let __VLS_20;
            let __VLS_21;
            let __VLS_22;
            const __VLS_23 = {
                onClick: (__VLS_ctx.toChatIndex)
            };
            var __VLS_19;
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "default-sqlbot" },
            });
            const __VLS_24 = {}.custom_small;
            /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                ...{ class: "collapse-icon" },
            }));
            const __VLS_26 = __VLS_25({
                ...{ class: "collapse-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
                title: (__VLS_ctx.appearanceStore.name),
                ...{ class: "ellipsis" },
            });
            (__VLS_ctx.appearanceStore.name);
        }
    }
    else {
        if (__VLS_ctx.loginBg && __VLS_ctx.collapse) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onClick: (__VLS_ctx.toChatIndex) },
                ...{ style: {} },
                height: "30",
                width: "30",
                src: (__VLS_ctx.loginBg),
                alt: "",
            });
        }
        else if (__VLS_ctx.loginBg && !__VLS_ctx.collapse) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "default-sqlbot" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onClick: (__VLS_ctx.toChatIndex) },
                height: "30",
                width: "30",
                src: (__VLS_ctx.loginBg),
                alt: "",
                ...{ class: "collapse-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
                title: (__VLS_ctx.appearanceStore.name),
                ...{ class: "ellipsis" },
            });
            (__VLS_ctx.appearanceStore.name);
        }
        else if (__VLS_ctx.collapse) {
            const __VLS_28 = {}.LOGO_fold;
            /** @type {[typeof __VLS_components.LOGO_fold, typeof __VLS_components.LOGO_fold, ]} */ ;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                ...{ 'onClick': {} },
                ...{ style: {} },
            }));
            const __VLS_30 = __VLS_29({
                ...{ 'onClick': {} },
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            let __VLS_32;
            let __VLS_33;
            let __VLS_34;
            const __VLS_35 = {
                onClick: (__VLS_ctx.toChatIndex)
            };
            var __VLS_31;
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "default-sqlbot" },
            });
            const __VLS_36 = {}.LOGO_fold;
            /** @type {[typeof __VLS_components.LOGO_fold, typeof __VLS_components.LOGO_fold, ]} */ ;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
                ...{ 'onClick': {} },
                ...{ class: "collapse-icon" },
            }));
            const __VLS_38 = __VLS_37({
                ...{ 'onClick': {} },
                ...{ class: "collapse-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            let __VLS_40;
            let __VLS_41;
            let __VLS_42;
            const __VLS_43 = {
                onClick: (__VLS_ctx.toChatIndex)
            };
            var __VLS_39;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
                title: (__VLS_ctx.appearanceStore.name),
                ...{ class: "ellipsis" },
            });
            (__VLS_ctx.appearanceStore.name);
        }
    }
}
if (!__VLS_ctx.showSysmenu) {
    /** @type {[typeof Workspace, typeof Workspace, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(Workspace, new Workspace({
        collapse: (__VLS_ctx.collapse),
    }));
    const __VLS_45 = __VLS_44({
        collapse: (__VLS_ctx.collapse),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
}
/** @type {[typeof Menu, typeof Menu, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(Menu, new Menu({
    collapse: (__VLS_ctx.collapseCopy),
}));
const __VLS_48 = __VLS_47({
    collapse: (__VLS_ctx.collapseCopy),
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom" },
});
if (__VLS_ctx.showSysmenu) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.toWorkspace) },
        ...{ class: "back-to_workspace" },
        ...{ class: (__VLS_ctx.collapse && 'collapse') },
    });
    const __VLS_50 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        size: "18",
    }));
    const __VLS_52 = __VLS_51({
        size: "18",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_53.slots.default;
    const __VLS_54 = {}.icon_moments_categories_outlined;
    /** @type {[typeof __VLS_components.Icon_moments_categories_outlined, typeof __VLS_components.icon_moments_categories_outlined, typeof __VLS_components.Icon_moments_categories_outlined, typeof __VLS_components.icon_moments_categories_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    var __VLS_53;
    (__VLS_ctx.collapse ? '' : __VLS_ctx.$t('workspace.return_to_workspace'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "personal-info" },
});
/** @type {[typeof Person, typeof Person, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(Person, new Person({
    collapse: (__VLS_ctx.collapse),
    inSysmenu: (__VLS_ctx.showSysmenu),
}));
const __VLS_59 = __VLS_58({
    collapse: (__VLS_ctx.collapse),
    inSysmenu: (__VLS_ctx.showSysmenu),
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
const __VLS_61 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    ...{ 'onClick': {} },
    size: "20",
    ...{ class: "fold" },
}));
const __VLS_63 = __VLS_62({
    ...{ 'onClick': {} },
    size: "20",
    ...{ class: "fold" },
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
let __VLS_65;
let __VLS_66;
let __VLS_67;
const __VLS_68 = {
    onClick: (__VLS_ctx.handleFoldExpand)
};
__VLS_64.slots.default;
if (__VLS_ctx.collapse) {
    const __VLS_69 = {}.icon_side_expand_outlined;
    /** @type {[typeof __VLS_components.Icon_side_expand_outlined, typeof __VLS_components.icon_side_expand_outlined, typeof __VLS_components.Icon_side_expand_outlined, typeof __VLS_components.icon_side_expand_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({}));
    const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
}
else {
    const __VLS_73 = {}.icon_side_fold_outlined;
    /** @type {[typeof __VLS_components.Icon_side_fold_outlined, typeof __VLS_components.icon_side_fold_outlined, typeof __VLS_components.Icon_side_fold_outlined, typeof __VLS_components.icon_side_fold_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({}));
    const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
}
var __VLS_64;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "right-main" },
    ...{ class: (__VLS_ctx.collapse && 'right-side-collapse') },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
const __VLS_77 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
/** @type {__VLS_StyleScopedClasses['system-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['left-side']} */ ;
/** @type {__VLS_StyleScopedClasses['left-content']} */ ;
/** @type {__VLS_StyleScopedClasses['sys-management']} */ ;
/** @type {__VLS_StyleScopedClasses['default-sqlbot']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['default-sqlbot']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['default-sqlbot']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['default-sqlbot']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['default-sqlbot']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['default-sqlbot']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['back-to_workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['personal-info']} */ ;
/** @type {__VLS_StyleScopedClasses['fold']} */ ;
/** @type {__VLS_StyleScopedClasses['right-main']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Menu: Menu,
            custom_small: custom_small,
            Workspace: Workspace,
            Person: Person,
            LOGO_fold: LOGO_fold,
            icon_moments_categories_outlined: icon_moments_categories_outlined,
            icon_side_fold_outlined: icon_side_fold_outlined,
            icon_side_expand_outlined: icon_side_expand_outlined,
            collapse: collapse,
            collapseCopy: collapseCopy,
            appearanceStore: appearanceStore,
            loginBg: loginBg,
            handleFoldExpand: handleFoldExpand,
            toWorkspace: toWorkspace,
            toChatIndex: toChatIndex,
            toUserIndex: toUserIndex,
            showSysmenu: showSysmenu,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
