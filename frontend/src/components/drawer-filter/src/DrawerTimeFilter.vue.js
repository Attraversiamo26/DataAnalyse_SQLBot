import { propTypes } from '@/utils/propTypes';
import { computed, reactive, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEmitt } from '@/utils/useEmitt.ts';
const { t } = useI18n();
const props = defineProps({
    property: {
        type: Object,
        default: () => ({}),
    },
    index: propTypes.number,
    title: propTypes.string,
});
const { property } = toRefs(props);
const timeConfig = computed(() => {
    let obj = Object.assign({
        showType: 'datetime',
        rangeSeparator: '-',
        startPlaceholder: t('common.start_time'),
        endPlaceholder: t('common.end_time'),
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        size: 'default',
        placement: 'bottom-end',
    }, property.value);
    return obj;
});
const state = reactive({
    modelValue: [],
});
const emits = defineEmits(['filter-change']);
const onChange = () => {
    emits('filter-change', state.modelValue);
};
const clear = (index) => {
    if (index !== props.index)
        return;
    state.modelValue = [];
};
useEmitt({
    name: 'clear-drawer_main',
    callback: clear,
});
const __VLS_exposed = {
    clear,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "draw-filter_time" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-item" },
});
const __VLS_0 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    key: "drawer-time-filt",
    modelValue: (__VLS_ctx.state.modelValue),
    type: (__VLS_ctx.timeConfig.showType),
    rangeSeparator: (__VLS_ctx.timeConfig.rangeSeparator),
    startPlaceholder: (__VLS_ctx.timeConfig.startPlaceholder),
    endPlaceholder: (__VLS_ctx.timeConfig.endPlaceholder),
    format: (__VLS_ctx.timeConfig.format),
    valueFormat: (__VLS_ctx.timeConfig.valueFormat),
    size: (__VLS_ctx.timeConfig.size),
    placement: (__VLS_ctx.timeConfig.placement),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    key: "drawer-time-filt",
    modelValue: (__VLS_ctx.state.modelValue),
    type: (__VLS_ctx.timeConfig.showType),
    rangeSeparator: (__VLS_ctx.timeConfig.rangeSeparator),
    startPlaceholder: (__VLS_ctx.timeConfig.startPlaceholder),
    endPlaceholder: (__VLS_ctx.timeConfig.endPlaceholder),
    format: (__VLS_ctx.timeConfig.format),
    valueFormat: (__VLS_ctx.timeConfig.valueFormat),
    size: (__VLS_ctx.timeConfig.size),
    placement: (__VLS_ctx.timeConfig.placement),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.onChange)
};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['draw-filter_time']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            timeConfig: timeConfig,
            state: state,
            onChange: onChange,
        };
    },
    emits: {},
    props: {
        property: {
            type: Object,
            default: () => ({}),
        },
        index: propTypes.number,
        title: propTypes.string,
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    props: {
        property: {
            type: Object,
            default: () => ({}),
        },
        index: propTypes.number,
        title: propTypes.string,
    },
});
; /* PartiallyEnd: #4569/main.vue */
