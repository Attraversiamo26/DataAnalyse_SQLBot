import { onMounted, ref } from 'vue';
import icon_quick_question from '@/assets/svg/icon_quick_question.svg';
import icon_replace_outlined from '@/assets/svg/icon_replace_outlined.svg';
import { ChatInfo } from '@/api/chat.ts';
import RecentQuestion from '@/views/chat/RecentQuestion.vue';
import RecommendQuestionQuick from '@/views/chat/RecommendQuestionQuick.vue';
const activeName = ref('recommend');
const recommendQuestionRef = ref();
const recentQuestionRef = ref();
const popoverRef = ref();
const getRecommendQuestions = () => {
    recommendQuestionRef.value.getRecommendQuestions(10);
};
const questions = '[]';
const retrieveQuestions = () => {
    recommendQuestionRef.value.getRecommendQuestions(10, true);
    recentQuestionRef.value.getRecentQuestions();
};
const quickAsk = (question) => {
    if (props.disabled) {
        return;
    }
    emits('quickAsk', question);
    hiddenProps();
};
const hiddenProps = () => {
    popoverRef.value.hide();
};
const onChatStop = () => {
    emits('stop');
};
const loadingOver = () => {
    emits('loadingOver');
};
const onTitleChange = (title) => {
    activeName.value = title;
};
onMounted(() => {
    getRecommendQuestions();
});
const emits = defineEmits(['quickAsk', 'loadingOver', 'stop']);
const __VLS_exposed = { getRecommendQuestions, id: () => props.recordId, stop };
defineExpose(__VLS_exposed);
const props = withDefaults(defineProps(), {
    recordId: undefined,
    datasourceId: undefined,
    currentChat: () => new ChatInfo(),
    firstChat: false,
    disabled: false,
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    recordId: undefined,
    datasourceId: undefined,
    currentChat: () => new ChatInfo(),
    firstChat: false,
    disabled: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "popoverRef",
    title: (__VLS_ctx.$t('qa.quick_question')),
    popperClass: "quick_question_popover",
    placement: "top-start",
    trigger: "click",
    width: (240),
}));
const __VLS_2 = __VLS_1({
    ref: "popoverRef",
    title: (__VLS_ctx.$t('qa.quick_question')),
    popperClass: "quick_question_popover",
    placement: "top-start",
    trigger: "click",
    width: (240),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.popoverRef} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_6 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
    effect: "dark",
    offset: (8),
    content: (__VLS_ctx.$t('qa.retrieve_again')),
    placement: "top",
}));
const __VLS_8 = __VLS_7({
    effect: "dark",
    offset: (8),
    content: (__VLS_ctx.$t('qa.retrieve_again')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_9.slots.default;
const __VLS_10 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    ...{ 'onClick': {} },
    ...{ class: "tool-btn refresh_icon" },
    text: true,
    disabled: (__VLS_ctx.disabled),
}));
const __VLS_12 = __VLS_11({
    ...{ 'onClick': {} },
    ...{ class: "tool-btn refresh_icon" },
    text: true,
    disabled: (__VLS_ctx.disabled),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
let __VLS_14;
let __VLS_15;
let __VLS_16;
const __VLS_17 = {
    onClick: (__VLS_ctx.retrieveQuestions)
};
__VLS_13.slots.default;
const __VLS_18 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    size: "18",
}));
const __VLS_20 = __VLS_19({
    size: "18",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.icon_replace_outlined;
/** @type {[typeof __VLS_components.Icon_replace_outlined, typeof __VLS_components.icon_replace_outlined, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({}));
const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
var __VLS_21;
var __VLS_13;
var __VLS_9;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.onTitleChange('recommend');
        } },
    ...{ class: "quick_question_title" },
    ...{ class: ({ 'title-active': __VLS_ctx.activeName == 'recommend' }) },
});
(__VLS_ctx.$t('qa.recommend'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.onTitleChange('recently');
        } },
    ...{ class: "quick_question_title" },
    ...{ class: ({ 'title-active': __VLS_ctx.activeName == 'recently' }) },
});
(__VLS_ctx.$t('qa.recently'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick_question_content" },
});
/** @type {[typeof RecommendQuestionQuick, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(RecommendQuestionQuick, new RecommendQuestionQuick({
    ...{ 'onClickQuestion': {} },
    ...{ 'onStop': {} },
    ...{ 'onLoadingOver': {} },
    ref: "recommendQuestionRef",
    currentChat: (__VLS_ctx.currentChat),
    recordId: (__VLS_ctx.recordId),
    questions: (__VLS_ctx.questions),
    datasource: (__VLS_ctx.datasourceId),
    disabled: (__VLS_ctx.disabled),
    firstChat: (__VLS_ctx.firstChat),
    position: "input",
}));
const __VLS_27 = __VLS_26({
    ...{ 'onClickQuestion': {} },
    ...{ 'onStop': {} },
    ...{ 'onLoadingOver': {} },
    ref: "recommendQuestionRef",
    currentChat: (__VLS_ctx.currentChat),
    recordId: (__VLS_ctx.recordId),
    questions: (__VLS_ctx.questions),
    datasource: (__VLS_ctx.datasourceId),
    disabled: (__VLS_ctx.disabled),
    firstChat: (__VLS_ctx.firstChat),
    position: "input",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_29;
let __VLS_30;
let __VLS_31;
const __VLS_32 = {
    onClickQuestion: (__VLS_ctx.quickAsk)
};
const __VLS_33 = {
    onStop: (__VLS_ctx.onChatStop)
};
const __VLS_34 = {
    onLoadingOver: (__VLS_ctx.loadingOver)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeName === 'recommend') }, null, null);
/** @type {typeof __VLS_ctx.recommendQuestionRef} */ ;
var __VLS_35 = {};
var __VLS_28;
/** @type {[typeof RecentQuestion, typeof RecentQuestion, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(RecentQuestion, new RecentQuestion({
    ...{ 'onClickQuestion': {} },
    ref: "recentQuestionRef",
    disabled: (__VLS_ctx.disabled),
    datasourceId: (__VLS_ctx.datasourceId),
}));
const __VLS_38 = __VLS_37({
    ...{ 'onClickQuestion': {} },
    ref: "recentQuestionRef",
    disabled: (__VLS_ctx.disabled),
    datasourceId: (__VLS_ctx.datasourceId),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onClickQuestion: (__VLS_ctx.quickAsk)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeName == 'recently') }, null, null);
/** @type {typeof __VLS_ctx.recentQuestionRef} */ ;
var __VLS_44 = {};
var __VLS_39;
{
    const { reference: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_46 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
        plain: true,
        size: "small",
    }));
    const __VLS_48 = __VLS_47({
        plain: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_49.slots.default;
    const __VLS_50 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        size: "16",
        ...{ style: {} },
    }));
    const __VLS_52 = __VLS_51({
        size: "16",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_53.slots.default;
    const __VLS_54 = {}.icon_quick_question;
    /** @type {[typeof __VLS_components.Icon_quick_question, typeof __VLS_components.icon_quick_question, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    var __VLS_53;
    (__VLS_ctx.$t('qa.quick_question'));
    var __VLS_49;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh_icon']} */ ;
/** @type {__VLS_StyleScopedClasses['quick_question_title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-active']} */ ;
/** @type {__VLS_StyleScopedClasses['quick_question_title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-active']} */ ;
/** @type {__VLS_StyleScopedClasses['quick_question_content']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4, __VLS_36 = __VLS_35, __VLS_45 = __VLS_44;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_quick_question: icon_quick_question,
            icon_replace_outlined: icon_replace_outlined,
            RecentQuestion: RecentQuestion,
            RecommendQuestionQuick: RecommendQuestionQuick,
            activeName: activeName,
            recommendQuestionRef: recommendQuestionRef,
            recentQuestionRef: recentQuestionRef,
            popoverRef: popoverRef,
            questions: questions,
            retrieveQuestions: retrieveQuestions,
            quickAsk: quickAsk,
            onChatStop: onChatStop,
            loadingOver: loadingOver,
            onTitleChange: onTitleChange,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
