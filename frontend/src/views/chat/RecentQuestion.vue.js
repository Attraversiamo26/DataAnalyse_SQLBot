import { onMounted, ref } from 'vue';
import { chatApi } from '@/api/chat.ts';
const props = withDefaults(defineProps(), {
    datasourceId: undefined,
    disabled: false,
});
const emits = defineEmits(['clickQuestion']);
const loading = ref(false);
const computedQuestions = ref([]);
function clickQuestion(question) {
    emits('clickQuestion', question);
}
onMounted(() => {
    getRecentQuestions();
});
async function getRecentQuestions() {
    chatApi.recentQuestions(props.datasourceId).then((res) => {
        computedQuestions.value = res;
    });
}
const __VLS_exposed = {
    getRecentQuestions,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    datasourceId: undefined,
    disabled: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
if (__VLS_ctx.computedQuestions.length > 0 || __VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "recent-questions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "question-grid-input" },
    });
    for (const [question, index] of __VLS_getVForSourceType((__VLS_ctx.computedQuestions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.computedQuestions.length > 0 || __VLS_ctx.loading))
                        return;
                    __VLS_ctx.clickQuestion(question);
                } },
            key: (index),
            ...{ class: "question" },
            ...{ class: ({ disabled: __VLS_ctx.disabled }) },
            title: (question),
        });
        (question);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "recommend-questions-error" },
    });
    (__VLS_ctx.$t('qa.retrieve_error'));
}
/** @type {__VLS_StyleScopedClasses['recent-questions']} */ ;
/** @type {__VLS_StyleScopedClasses['question-grid-input']} */ ;
/** @type {__VLS_StyleScopedClasses['question']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-questions-error']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            computedQuestions: computedQuestions,
            clickQuestion: clickQuestion,
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
