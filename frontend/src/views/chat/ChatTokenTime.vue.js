import { ref } from 'vue';
import icon_logs_outlined from '@/assets/svg/icon_logs_outlined.svg';
import ExecutionDetails from './ExecutionDetails.vue';
const props = defineProps();
const executionDetailsRef = ref();
function getLogList() {
    executionDetailsRef.value.getLogList(props.recordId);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.recordId && (__VLS_ctx.duration || __VLS_ctx.totalTokens)) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tool-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('parameter.tokens_required'));
    (__VLS_ctx.totalTokens);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.$t('parameter.time_execution'));
    (__VLS_ctx.duration);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.getLogList) },
        ...{ class: "detail" },
    });
    const __VLS_0 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_2 = __VLS_1({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.icon_logs_outlined;
    /** @type {[typeof __VLS_components.Icon_logs_outlined, typeof __VLS_components.icon_logs_outlined, typeof __VLS_components.Icon_logs_outlined, typeof __VLS_components.icon_logs_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    var __VLS_3;
    (__VLS_ctx.$t('parameter.execution_details'));
}
/** @type {[typeof ExecutionDetails, typeof ExecutionDetails, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(ExecutionDetails, new ExecutionDetails({
    ref: "executionDetailsRef",
}));
const __VLS_9 = __VLS_8({
    ref: "executionDetailsRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
/** @type {typeof __VLS_ctx.executionDetailsRef} */ ;
var __VLS_11 = {};
var __VLS_10;
/** @type {__VLS_StyleScopedClasses['tool-container']} */ ;
/** @type {__VLS_StyleScopedClasses['detail']} */ ;
// @ts-ignore
var __VLS_12 = __VLS_11;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_logs_outlined: icon_logs_outlined,
            ExecutionDetails: ExecutionDetails,
            executionDetailsRef: executionDetailsRef,
            getLogList: getLogList,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
