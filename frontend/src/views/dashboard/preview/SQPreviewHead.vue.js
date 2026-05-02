import icon_pc_outlined from '@/assets/svg/icon_pc_outlined.svg';
import icon_edit_outlined from '@/assets/svg/icon_edit_outlined.svg';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const preview = () => {
    window.open(`#/dashboard-preview?resourceId=${props.dashboardInfo.id}`, '_blank');
};
const edit = () => {
    window.open(`#/canvas?resourceId=${props.dashboardInfo.id}`, '_self');
};
const props = defineProps({
    dashboardInfo: {
        type: Object,
        required: true,
    },
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-head flex-align-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "canvas-name ellipsis" },
});
(__VLS_ctx.dashboardInfo.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "canvas-opt-button" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.preview)
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.icon, typeof __VLS_components.Icon, typeof __VLS_components.icon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        name: "icon_pc_outlined",
    }));
    const __VLS_10 = __VLS_9({
        name: "icon_pc_outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.icon_pc_outlined;
    /** @type {[typeof __VLS_components.Icon_pc_outlined, typeof __VLS_components.icon_pc_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ class: "svg-icon" },
    }));
    const __VLS_14 = __VLS_13({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
}
(__VLS_ctx.t('dashboard.preview'));
var __VLS_3;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    ...{ class: "custom-button" },
    type: "primary",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    ...{ class: "custom-button" },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.edit)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        name: "icon_edit_outlined",
    }));
    const __VLS_26 = __VLS_25({
        name: "icon_edit_outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    const __VLS_28 = {}.icon_edit_outlined;
    /** @type {[typeof __VLS_components.Icon_edit_outlined, typeof __VLS_components.icon_edit_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ class: "svg-icon" },
    }));
    const __VLS_30 = __VLS_29({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    var __VLS_27;
}
(__VLS_ctx.t('dashboard.edit'));
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['preview-head']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['canvas-name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['canvas-opt-button']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-button']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_pc_outlined: icon_pc_outlined,
            icon_edit_outlined: icon_edit_outlined,
            t: t,
            preview: preview,
            edit: edit,
        };
    },
    props: {
        dashboardInfo: {
            type: Object,
            required: true,
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        dashboardInfo: {
            type: Object,
            required: true,
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
