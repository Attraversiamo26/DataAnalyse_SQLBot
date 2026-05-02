import icon_done_outlined from '@/assets/svg/icon_done_outlined.svg';
import { computed, ref } from 'vue';
import icon_expand_down_filled from '@/assets/svg/icon_down_outlined.svg';
const props = defineProps({
    chartTypeList: {
        type: (Array),
        default: () => [],
    },
    chartType: {
        type: String,
        default: 'table',
    },
    title: {
        type: String,
        default: '',
    },
});
const currentIcon = computed(() => {
    if (props.chartType === 'table') {
        const [ele] = props.chartTypeList || [];
        if (ele.icon) {
            return ele.icon;
        }
        return null;
    }
    return props.chartTypeList.find((ele) => ele.value === props.chartType).icon;
});
const firstItem = () => {
    if (props.chartType === 'table') {
        const [ele] = props.chartTypeList || [];
        handleDefaultChatChange(ele || {});
    }
};
const emits = defineEmits(['typeChange']);
const selectRef = ref();
const handleDefaultChatChange = (val) => {
    emits('typeChange', val.value);
    selectRef.value?.hide();
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
    ref: "selectRef",
    trigger: "click",
    popperClass: "chat-type_select",
    placement: "bottom",
}));
const __VLS_2 = __VLS_1({
    ref: "selectRef",
    trigger: "click",
    popperClass: "chat-type_select",
    placement: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.selectRef} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
{
    const { reference: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.firstItem) },
        ...{ class: "chat-select_type" },
        ...{ class: (__VLS_ctx.chartType && __VLS_ctx.chartType !== 'table' && 'active') },
    });
    const __VLS_6 = ((__VLS_ctx.currentIcon));
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const __VLS_10 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        ...{ style: {} },
        ...{ class: "expand" },
        size: "12",
    }));
    const __VLS_12 = __VLS_11({
        ...{ style: {} },
        ...{ class: "expand" },
        size: "12",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_13.slots.default;
    const __VLS_14 = {}.icon_expand_down_filled;
    /** @type {[typeof __VLS_components.Icon_expand_down_filled, typeof __VLS_components.icon_expand_down_filled, typeof __VLS_components.Icon_expand_down_filled, typeof __VLS_components.icon_expand_down_filled, ]} */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
    const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    var __VLS_13;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-content" },
});
if (!!__VLS_ctx.title) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    (__VLS_ctx.title);
}
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.chartTypeList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleDefaultChatChange(ele);
            } },
        key: (ele.name),
        ...{ class: "popover-item" },
        ...{ class: (__VLS_ctx.chartType === ele.value && 'isActive') },
    });
    const __VLS_18 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_20 = __VLS_19({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_21.slots.default;
    const __VLS_22 = ((ele.icon));
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
        ...{ class: (__VLS_ctx.chartType === ele.value && 'icon-primary') },
    }));
    const __VLS_24 = __VLS_23({
        ...{ class: (__VLS_ctx.chartType === ele.value && 'icon-primary') },
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    var __VLS_21;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "model-name" },
    });
    (ele.name);
    const __VLS_26 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
        size: "16",
        ...{ class: "done" },
    }));
    const __VLS_28 = __VLS_27({
        size: "16",
        ...{ class: "done" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_29.slots.default;
    const __VLS_30 = {}.icon_done_outlined;
    /** @type {[typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({}));
    const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
    var __VLS_29;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['chat-select_type']} */ ;
/** @type {__VLS_StyleScopedClasses['expand']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_done_outlined: icon_done_outlined,
            icon_expand_down_filled: icon_expand_down_filled,
            currentIcon: currentIcon,
            firstItem: firstItem,
            selectRef: selectRef,
            handleDefaultChatChange: handleDefaultChatChange,
        };
    },
    emits: {},
    props: {
        chartTypeList: {
            type: (Array),
            default: () => [],
        },
        chartType: {
            type: String,
            default: 'table',
        },
        title: {
            type: String,
            default: '',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        chartTypeList: {
            type: (Array),
            default: () => [],
        },
        chartType: {
            type: String,
            default: 'table',
        },
        title: {
            type: String,
            default: '',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
