import { ref } from 'vue';
import SQView from '@/views/dashboard/components/sq-view/index.vue';
const isSelected = ref(false);
const props = defineProps({
    viewInfo: {
        type: Object,
        required: true,
    },
    selectChange: {
        type: Function,
        default: () => {
            return {};
        },
    },
});
const curSelectChange = (value) => {
    props.selectChange(value);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-selection-container" },
});
const __VLS_0 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    ...{ class: "select-area" },
    value: (__VLS_ctx.isSelected),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    ...{ class: "select-area" },
    value: (__VLS_ctx.isSelected),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.curSelectChange)
};
var __VLS_3;
/** @type {[typeof SQView, typeof SQView, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(SQView, new SQView({
    viewInfo: (__VLS_ctx.viewInfo),
    showPosition: "multiplexing",
}));
const __VLS_9 = __VLS_8({
    viewInfo: (__VLS_ctx.viewInfo),
    showPosition: "multiplexing",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
/** @type {__VLS_StyleScopedClasses['chart-selection-container']} */ ;
/** @type {__VLS_StyleScopedClasses['select-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SQView: SQView,
            isSelected: isSelected,
            curSelectChange: curSelectChange,
        };
    },
    props: {
        viewInfo: {
            type: Object,
            required: true,
        },
        selectChange: {
            type: Function,
            default: () => {
                return {};
            },
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        viewInfo: {
            type: Object,
            required: true,
        },
        selectChange: {
            type: Function,
            default: () => {
                return {};
            },
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
