import logo_fold from '@/assets/LOGO-fold.svg';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
import custom_small from '@/assets/svg/logo-custom_small.svg';
const __VLS_props = withDefaults(defineProps(), {
    hideAvatar: false,
});
const appearanceStore = useAppearanceStoreWithOut();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    hideAvatar: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-row-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-row" },
    ...{ class: ({ 'right-to-left': __VLS_ctx.msg.role === 'user' }) },
});
if (__VLS_ctx.msg.role === 'assistant') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-avatar" },
    });
    if (!__VLS_ctx.hideAvatar && __VLS_ctx.appearanceStore.getLogin) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.logoAssistant ? __VLS_ctx.logoAssistant : __VLS_ctx.appearanceStore.getLogin),
            alt: "",
            width: "28",
            height: "28",
        });
    }
    else if (!__VLS_ctx.hideAvatar) {
        const __VLS_0 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
        const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_3.slots.default;
        if (__VLS_ctx.appearanceStore.themeColor === 'default') {
            const __VLS_4 = {}.logo_fold;
            /** @type {[typeof __VLS_components.Logo_fold, typeof __VLS_components.logo_fold, ]} */ ;
            // @ts-ignore
            const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
            const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
        }
        else {
            const __VLS_8 = {}.custom_small;
            /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
            const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
        }
        var __VLS_3;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: ({ 'row-full': __VLS_ctx.msg.role === 'assistant', 'width-auto': __VLS_ctx.msg.role === 'user' }) },
});
var __VLS_12 = {};
var __VLS_14 = {};
/** @type {__VLS_StyleScopedClasses['chat-row-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-row']} */ ;
/** @type {__VLS_StyleScopedClasses['right-to-left']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['row-full']} */ ;
/** @type {__VLS_StyleScopedClasses['width-auto']} */ ;
// @ts-ignore
var __VLS_13 = __VLS_12, __VLS_15 = __VLS_14;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            logo_fold: logo_fold,
            custom_small: custom_small,
            appearanceStore: appearanceStore,
        };
    },
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
