import icon_copy_outlined from '@/assets/embedded/icon_copy_outlined.svg';
import { useI18n } from 'vue-i18n';
import { useClipboard } from '@vueuse/core';
import { computed } from 'vue';
const props = defineProps();
const { t } = useI18n();
const { copy } = useClipboard({ legacy: true });
function clickAnalysis() {
    console.info('analysis_record_id: ' + props.message?.record?.analysis_record_id);
}
function clickPredict() {
    console.info('predict_record_id: ' + props.message?.record?.predict_record_id);
}
function clickRegenerated() {
    console.info('regenerate_record_id: ' + props.message?.record?.regenerate_record_id);
}
const isRegenerated = computed(() => {
    return !!props.message?.record?.regenerate_record_id;
});
const copyCode = () => {
    const str = props.message?.content || '';
    copy(str)
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "question" },
});
if (__VLS_ctx.message?.record?.analysis_record_id) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (__VLS_ctx.clickAnalysis) },
        ...{ class: "prefix-title" },
    });
    (__VLS_ctx.t('qa.data_analysis'));
}
else if (__VLS_ctx.message?.record?.predict_record_id) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (__VLS_ctx.clickPredict) },
        ...{ class: "prefix-title" },
    });
    (__VLS_ctx.t('qa.data_predict'));
}
else if (__VLS_ctx.isRegenerated) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (__VLS_ctx.clickRegenerated) },
        ...{ class: "prefix-title" },
    });
    (__VLS_ctx.t('qa.data_regenerated'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.message?.content);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_0 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.t('datasource.copy')),
    placement: "top",
}));
const __VLS_2 = __VLS_1({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.t('datasource.copy')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    ...{ style: {} },
    size: "16",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.copyCode)
};
__VLS_7.slots.default;
const __VLS_12 = {}.icon_copy_outlined;
/** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_7;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['question']} */ ;
/** @type {__VLS_StyleScopedClasses['prefix-title']} */ ;
/** @type {__VLS_StyleScopedClasses['prefix-title']} */ ;
/** @type {__VLS_StyleScopedClasses['prefix-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_copy_outlined: icon_copy_outlined,
            t: t,
            clickAnalysis: clickAnalysis,
            clickPredict: clickPredict,
            clickRegenerated: clickRegenerated,
            isRegenerated: isRegenerated,
            copyCode: copyCode,
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
