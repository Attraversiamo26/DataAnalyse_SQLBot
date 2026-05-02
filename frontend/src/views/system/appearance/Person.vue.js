import { computed } from 'vue';
import Default_avatar_custom from '@/assets/img/Default-avatar.svg';
import icon_admin_outlined from '@/assets/svg/icon_admin_outlined.svg';
import icon_info_outlined_1 from '@/assets/svg/icon_info_outlined_1.svg';
import icon_maybe_outlined from '@/assets/svg/icon-maybe_outlined.svg';
import icon_key_outlined from '@/assets/svg/icon-key_outlined.svg';
import icon_translate_outlined from '@/assets/svg/icon_translate_outlined.svg';
import icon_logout_outlined from '@/assets/svg/icon_logout_outlined.svg';
import icon_right_outlined from '@/assets/svg/icon_right_outlined.svg';
import { useUserStore } from '@/stores/user';
const __VLS_props = defineProps({
    showDoc: { type: [Boolean], required: true },
    showAbout: { type: [Boolean], required: true },
    isBlue: { type: [Boolean], required: true },
});
const userStore = useUserStore();
const name = computed(() => userStore.getName);
const account = computed(() => userStore.getAccount);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "person" },
    title: (__VLS_ctx.name),
});
const __VLS_0 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "default-avatar" },
    size: "32",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "default-avatar" },
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.Default_avatar_custom;
/** @type {[typeof __VLS_components.Default_avatar_custom, typeof __VLS_components.Default_avatar_custom, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "name ellipsis" },
});
(__VLS_ctx.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ed-popper is-light ed-popover system-person_style" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info" },
});
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "img" },
    size: "40",
}));
const __VLS_10 = __VLS_9({
    ...{ class: "img" },
    size: "40",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.Default_avatar_custom;
/** @type {[typeof __VLS_components.Default_avatar_custom, typeof __VLS_components.Default_avatar_custom, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-item" },
});
const __VLS_16 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ style: {} },
    size: "16",
}));
const __VLS_18 = __VLS_17({
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.icon_admin_outlined;
/** @type {[typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-name" },
});
(__VLS_ctx.$t('common.system_manage'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-item" },
});
const __VLS_24 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    size: "16",
}));
const __VLS_26 = __VLS_25({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.icon_key_outlined;
/** @type {[typeof __VLS_components.Icon_key_outlined, typeof __VLS_components.icon_key_outlined, typeof __VLS_components.Icon_key_outlined, typeof __VLS_components.icon_key_outlined, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-name" },
});
(__VLS_ctx.$t('user.change_password'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-item" },
});
const __VLS_32 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    size: "16",
}));
const __VLS_34 = __VLS_33({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.icon_translate_outlined;
/** @type {[typeof __VLS_components.Icon_translate_outlined, typeof __VLS_components.icon_translate_outlined, typeof __VLS_components.Icon_translate_outlined, typeof __VLS_components.icon_translate_outlined, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-name" },
});
(__VLS_ctx.$t('common.language'));
const __VLS_40 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ class: "right" },
    size: "16",
}));
const __VLS_42 = __VLS_41({
    ...{ class: "right" },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.icon_right_outlined;
/** @type {[typeof __VLS_components.Icon_right_outlined, typeof __VLS_components.icon_right_outlined, typeof __VLS_components.Icon_right_outlined, typeof __VLS_components.icon_right_outlined, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
if (__VLS_ctx.showAbout) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover-item" },
    });
    const __VLS_48 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        size: "16",
    }));
    const __VLS_50 = __VLS_49({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.icon_info_outlined_1;
    /** @type {[typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
    const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
    var __VLS_51;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    (__VLS_ctx.$t('about.title'));
}
if (__VLS_ctx.showDoc) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover-item" },
    });
    const __VLS_56 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        size: "16",
    }));
    const __VLS_58 = __VLS_57({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    const __VLS_60 = {}.icon_maybe_outlined;
    /** @type {[typeof __VLS_components.Icon_maybe_outlined, typeof __VLS_components.icon_maybe_outlined, typeof __VLS_components.Icon_maybe_outlined, typeof __VLS_components.icon_maybe_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    var __VLS_59;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    (__VLS_ctx.$t('common.help'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-item mr4" },
});
const __VLS_64 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    size: "16",
}));
const __VLS_66 = __VLS_65({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.icon_logout_outlined;
/** @type {[typeof __VLS_components.Icon_logout_outlined, typeof __VLS_components.icon_logout_outlined, typeof __VLS_components.Icon_logout_outlined, typeof __VLS_components.icon_logout_outlined, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_67;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-name" },
});
(__VLS_ctx.$t('common.logout'));
/** @type {__VLS_StyleScopedClasses['person']} */ ;
/** @type {__VLS_StyleScopedClasses['default-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-popper']} */ ;
/** @type {__VLS_StyleScopedClasses['is-light']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-popover']} */ ;
/** @type {__VLS_StyleScopedClasses['system-person_style']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['img']} */ ;
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
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['mr4']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Default_avatar_custom: Default_avatar_custom,
            icon_admin_outlined: icon_admin_outlined,
            icon_info_outlined_1: icon_info_outlined_1,
            icon_maybe_outlined: icon_maybe_outlined,
            icon_key_outlined: icon_key_outlined,
            icon_translate_outlined: icon_translate_outlined,
            icon_logout_outlined: icon_logout_outlined,
            icon_right_outlined: icon_right_outlined,
            name: name,
            account: account,
        };
    },
    props: {
        showDoc: { type: [Boolean], required: true },
        showAbout: { type: [Boolean], required: true },
        isBlue: { type: [Boolean], required: true },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        showDoc: { type: [Boolean], required: true },
        showAbout: { type: [Boolean], required: true },
        isBlue: { type: [Boolean], required: true },
    },
});
; /* PartiallyEnd: #4569/main.vue */
