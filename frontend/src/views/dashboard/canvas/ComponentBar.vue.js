import { toRefs } from 'vue';
import icon_delete from '@/assets/svg/icon_delete.svg';
import { Icon } from '@/components/icon-custom';
import { useEmitt } from '@/utils/useEmitt.ts';
import { useI18n } from 'vue-i18n';
import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg';
import icon_chart_preview from '@/assets/svg/icon_chart_preview.svg';
const { t } = useI18n();
const emits = defineEmits(['enlargeView']);
const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
    configItem: {
        type: Object,
        required: true,
    },
    showPosition: {
        required: false,
        type: String,
        default: 'preview',
    },
    canvasId: {
        type: String,
        default: 'canvas-main',
    },
});
const { configItem } = toRefs(props);
const doPreview = () => {
    // do preview
    emits('enlargeView');
};
const doDeleteComponent = (e) => {
    e.stopPropagation();
    e.preventDefault();
    useEmitt().emitter.emit(`editor-delete-${props.canvasId}`, configItem.value.id);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "component-bar-main" },
    ...{ class: ({ 'bar-hidden': !__VLS_ctx.active }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.ElDropdown;
/** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "curDropdown",
    popperClass: "bar-main_popper",
    trigger: "click",
    placement: "bottom-end",
}));
const __VLS_2 = __VLS_1({
    ref: "curDropdown",
    popperClass: "bar-main_popper",
    trigger: "click",
    placement: "bottom-end",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.curDropdown} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_6 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
    ...{ 'onMousedown': {} },
    ...{ class: "bar-more" },
}));
const __VLS_8 = __VLS_7({
    ...{ 'onMousedown': {} },
    ...{ class: "bar-more" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_10;
let __VLS_11;
let __VLS_12;
const __VLS_13 = {
    onMousedown: () => { }
};
__VLS_9.slots.default;
const __VLS_14 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    content: (__VLS_ctx.t('dashboard.more')),
    placement: "bottom",
}));
const __VLS_16 = __VLS_15({
    content: (__VLS_ctx.t('dashboard.more')),
    placement: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
const __VLS_18 = {}.icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.icon, typeof __VLS_components.Icon, typeof __VLS_components.icon, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    name: "icon_more_outlined",
}));
const __VLS_20 = __VLS_19({
    name: "icon_more_outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.icon_more_outlined;
/** @type {[typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    ...{ class: "svg-icon" },
}));
const __VLS_24 = __VLS_23({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
var __VLS_21;
var __VLS_17;
var __VLS_9;
{
    const { dropdown: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_26 = {}.ElDropdownMenu;
    /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({}));
    const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_29.slots.default;
    if (__VLS_ctx.configItem.component === 'SQView') {
        const __VLS_30 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
            ...{ 'onClick': {} },
            icon: (__VLS_ctx.icon_chart_preview),
        }));
        const __VLS_32 = __VLS_31({
            ...{ 'onClick': {} },
            icon: (__VLS_ctx.icon_chart_preview),
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        let __VLS_34;
        let __VLS_35;
        let __VLS_36;
        const __VLS_37 = {
            onClick: (__VLS_ctx.doPreview)
        };
        __VLS_33.slots.default;
        (__VLS_ctx.t('dashboard.preview'));
        var __VLS_33;
    }
    const __VLS_38 = {}.ElDropdownItem;
    /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
        ...{ 'onClick': {} },
        divided: (__VLS_ctx.configItem.component === 'SQView'),
        icon: (__VLS_ctx.icon_delete),
    }));
    const __VLS_40 = __VLS_39({
        ...{ 'onClick': {} },
        divided: (__VLS_ctx.configItem.component === 'SQView'),
        icon: (__VLS_ctx.icon_delete),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    let __VLS_42;
    let __VLS_43;
    let __VLS_44;
    const __VLS_45 = {
        onClick: (__VLS_ctx.doDeleteComponent)
    };
    __VLS_41.slots.default;
    (__VLS_ctx.t('dashboard.delete'));
    var __VLS_41;
    var __VLS_29;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['component-bar-main']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-more']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_delete: icon_delete,
            Icon: Icon,
            icon_more_outlined: icon_more_outlined,
            icon_chart_preview: icon_chart_preview,
            t: t,
            configItem: configItem,
            doPreview: doPreview,
            doDeleteComponent: doDeleteComponent,
        };
    },
    emits: {},
    props: {
        active: {
            type: Boolean,
            default: false,
        },
        configItem: {
            type: Object,
            required: true,
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        active: {
            type: Boolean,
            default: false,
        },
        configItem: {
            type: Object,
            required: true,
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
