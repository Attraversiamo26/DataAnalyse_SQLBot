import { computed } from 'vue';
import icon_sidebar_outlined from '@/assets/embedded/icon_sidebar_outlined_nofill.svg';
import icon_new_chat_outlined from '@/assets/svg/icon_new_chat_outlined.svg';
import LOGO from '@/assets/svg/logo-custom_small.svg';
import icon_close_outlined from '@/assets/svg/icon_close_outlined.svg';
import icon_magnify_outlined from '@/assets/svg/icon_magnify_outlined.svg';
import { propTypes } from '@/utils/propTypes';
const props = defineProps({
    welcomeDesc: propTypes.string.def(''),
    logo: propTypes.string.def(''),
    welcome: propTypes.string.def(''),
    name: propTypes.string.def(''),
});
const basePath = import.meta.env.VITE_API_BASE_URL;
const baseUrl = basePath + '/system/assistant/picture/';
const pageLogo = computed(() => {
    return props.logo.startsWith('blob') ? props.logo : baseUrl + props.logo;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "assistant-window" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header" },
});
const __VLS_0 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    size: "20",
}));
const __VLS_2 = __VLS_1({
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.icon_sidebar_outlined;
/** @type {[typeof __VLS_components.Icon_sidebar_outlined, typeof __VLS_components.icon_sidebar_outlined, typeof __VLS_components.Icon_sidebar_outlined, typeof __VLS_components.icon_sidebar_outlined, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
if (!props.logo) {
    const __VLS_8 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ class: "logo" },
        size: "30",
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "logo" },
        size: "30",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.LOGO;
    /** @type {[typeof __VLS_components.LOGO, typeof __VLS_components.LOGO, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.pageLogo),
        ...{ class: "logo" },
        width: "30px",
        height: "30px",
        alt: "",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    title: (__VLS_ctx.name),
    ...{ class: "title ellipsis" },
});
(__VLS_ctx.name);
const __VLS_16 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    effect: "dark",
    content: (__VLS_ctx.$t('embedded.new_conversation')),
    placement: "top",
}));
const __VLS_18 = __VLS_17({
    effect: "dark",
    content: (__VLS_ctx.$t('embedded.new_conversation')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ class: "new-chat" },
    size: "20",
}));
const __VLS_22 = __VLS_21({
    ...{ class: "new-chat" },
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.icon_new_chat_outlined;
/** @type {[typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_23;
var __VLS_19;
const __VLS_28 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ class: "new-chat" },
    ...{ style: {} },
    size: "20",
}));
const __VLS_30 = __VLS_29({
    ...{ class: "new-chat" },
    ...{ style: {} },
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.icon_magnify_outlined;
/** @type {[typeof __VLS_components.Icon_magnify_outlined, typeof __VLS_components.icon_magnify_outlined, typeof __VLS_components.Icon_magnify_outlined, typeof __VLS_components.icon_magnify_outlined, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
var __VLS_31;
const __VLS_36 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ class: "new-chat" },
    ...{ style: {} },
    size: "20",
}));
const __VLS_38 = __VLS_37({
    ...{ class: "new-chat" },
    ...{ style: {} },
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.icon_close_outlined;
/** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "center" },
});
if (!props.logo) {
    const __VLS_44 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ class: "logo" },
        size: "30",
    }));
    const __VLS_46 = __VLS_45({
        ...{ class: "logo" },
        size: "30",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    const __VLS_48 = {}.LOGO;
    /** @type {[typeof __VLS_components.LOGO, typeof __VLS_components.LOGO, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
    const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
    var __VLS_47;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.pageLogo),
        ...{ class: "logo" },
        width: "30px",
        height: "30px",
        alt: "",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "i-am" },
});
(__VLS_ctx.welcome);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "i-can" },
});
(__VLS_ctx.welcomeDesc);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
const __VLS_52 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    size: "large",
    type: "primary",
    ...{ class: "greeting-btn" },
}));
const __VLS_54 = __VLS_53({
    size: "large",
    type: "primary",
    ...{ class: "greeting-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "inner-icon" },
});
const __VLS_56 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.icon_new_chat_outlined;
/** @type {[typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_59;
(__VLS_ctx.$t('qa.start_sqlbot'));
var __VLS_55;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-assistant" },
});
/** @type {__VLS_StyleScopedClasses['assistant-window']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['new-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['new-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['new-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['i-am']} */ ;
/** @type {__VLS_StyleScopedClasses['i-can']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['greeting-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-assistant']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_sidebar_outlined: icon_sidebar_outlined,
            icon_new_chat_outlined: icon_new_chat_outlined,
            LOGO: LOGO,
            icon_close_outlined: icon_close_outlined,
            icon_magnify_outlined: icon_magnify_outlined,
            pageLogo: pageLogo,
        };
    },
    props: {
        welcomeDesc: propTypes.string.def(''),
        logo: propTypes.string.def(''),
        welcome: propTypes.string.def(''),
        name: propTypes.string.def(''),
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        welcomeDesc: propTypes.string.def(''),
        logo: propTypes.string.def(''),
        welcome: propTypes.string.def(''),
        name: propTypes.string.def(''),
    },
});
; /* PartiallyEnd: #4569/main.vue */
