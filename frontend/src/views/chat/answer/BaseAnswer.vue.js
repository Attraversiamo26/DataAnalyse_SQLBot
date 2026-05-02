import { computed, onMounted, ref } from 'vue';
import MdComponent from '@/views/chat/component/MdComponent.vue';
import icon_up_outlined from '@/assets/svg/icon_up_outlined.svg';
import icon_down_outlined from '@/assets/svg/icon_down_outlined.svg';
import { useI18n } from 'vue-i18n';
import { useChatConfigStore } from '@/stores/chatConfig.ts';
const props = withDefaults(defineProps(), {
    loading: false,
});
const { t } = useI18n();
const chatConfig = useChatConfigStore();
const show = ref(false);
const reasoningContent = computed(() => {
    const names = [];
    if (typeof props.reasoningName === 'string') {
        names.push(props.reasoningName);
    }
    else if (Array.isArray(props.reasoningName)) {
        props.reasoningName.forEach((item) => {
            names.push(item);
        });
    }
    const result = [];
    names.forEach((item) => {
        if (props.message?.record) {
            if (props.message?.record[item]) {
                result.push(props.message?.record[item] ?? '');
            }
        }
    });
    return result;
});
const hasReasoning = computed(() => {
    if (reasoningContent.value.length > 0) {
        for (let i = 0; i < reasoningContent.value.length; i++) {
            if (reasoningContent.value[i] && reasoningContent.value[i].trim() !== '') {
                return true;
            }
        }
    }
    return false;
});
function clickShow() {
    show.value = !show.value;
}
onMounted(() => {
    if (props.message.isTyping) {
        // 根据配置项是否默认展开
        show.value = chatConfig.getExpandThinkingBlock;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    loading: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "base-answer-block" },
});
if (__VLS_ctx.message.isTyping || __VLS_ctx.hasReasoning) {
    const __VLS_0 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        ...{ class: "thinking-btn" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        ...{ class: "thinking-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.clickShow)
    };
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "thinking-btn-inner" },
    });
    if (__VLS_ctx.message.isTyping) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.t('qa.thinking'));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.t('qa.thinking_step'));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "btn-icon" },
    });
    if (__VLS_ctx.show) {
        const __VLS_8 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
        const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_11.slots.default;
        const __VLS_12 = {}.icon_up_outlined;
        /** @type {[typeof __VLS_components.Icon_up_outlined, typeof __VLS_components.icon_up_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        var __VLS_11;
    }
    else {
        const __VLS_16 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
        const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        const __VLS_20 = {}.icon_down_outlined;
        /** @type {[typeof __VLS_components.Icon_down_outlined, typeof __VLS_components.icon_down_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        var __VLS_19;
    }
    var __VLS_3;
}
if (__VLS_ctx.hasReasoning && __VLS_ctx.show) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "reasoning-content" },
    });
    for (const [reason, _index] of __VLS_getVForSourceType((__VLS_ctx.reasoningContent))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (_index),
            ...{ class: "reasoning" },
        });
        /** @type {[typeof MdComponent, ]} */ ;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent(MdComponent, new MdComponent({
            message: (reason),
        }));
        const __VLS_25 = __VLS_24({
            message: (reason),
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "answer-container" },
});
var __VLS_27 = {};
if (__VLS_ctx.message.isTyping) {
    const __VLS_29 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        ...{ style: {} },
        type: "primary",
        link: true,
        loading: true,
    }));
    const __VLS_31 = __VLS_30({
        ...{ style: {} },
        type: "primary",
        link: true,
        loading: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
}
var __VLS_33 = {};
var __VLS_35 = {};
/** @type {__VLS_StyleScopedClasses['base-answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['thinking-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['thinking-btn-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['reasoning-content']} */ ;
/** @type {__VLS_StyleScopedClasses['reasoning']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-container']} */ ;
// @ts-ignore
var __VLS_28 = __VLS_27, __VLS_34 = __VLS_33, __VLS_36 = __VLS_35;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MdComponent: MdComponent,
            icon_up_outlined: icon_up_outlined,
            icon_down_outlined: icon_down_outlined,
            t: t,
            show: show,
            reasoningContent: reasoningContent,
            hasReasoning: hasReasoning,
            clickShow: clickShow,
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
