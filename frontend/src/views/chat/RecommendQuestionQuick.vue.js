import { computed, nextTick, onBeforeUnmount, ref, toRefs } from 'vue';
import { endsWith, startsWith } from 'lodash-es';
import { chatApi, ChatInfo } from '@/api/chat.ts';
import { recommendedApi } from '@/api/recommendedApi.ts';
const props = withDefaults(defineProps(), {
    recordId: undefined,
    disabled: false,
    datasource: undefined,
    chatRecommendedQuestions: undefined,
    currentChat: () => new ChatInfo(),
});
const { currentChat } = toRefs(props);
const emits = defineEmits(['clickQuestion', 'stop', 'loadingOver']);
const loading = ref(false);
const questions = ref('[]');
const computedQuestions = computed(() => {
    if (questions.value &&
        questions.value.length > 0 &&
        startsWith(questions.value.trim(), '[') &&
        endsWith(questions.value.trim(), ']')) {
        return JSON.parse(questions.value);
    }
    return [];
});
function clickQuestion(question) {
    if (!props.disabled) {
        emits('clickQuestion', question);
    }
}
const stopFlag = ref(false);
async function getRecommendQuestions(articles_number, isRetrieve) {
    recommendedApi.get_datasource_recommended_base(props.datasource).then((res) => {
        if (res.recommended_config === 2) {
            questions.value = res.questions;
        }
        else if (currentChat.value.recommended_generate && !isRetrieve) {
            questions.value = currentChat.value.recommended_question;
        }
        else {
            getRecommendQuestionsLLM(articles_number);
        }
    });
}
async function getRecommendQuestionsLLM(articles_number) {
    stopFlag.value = false;
    loading.value = true;
    try {
        const controller = new AbortController();
        const params = articles_number ? '?articles_number=' + articles_number : '';
        const response = await chatApi.recommendQuestions(props.recordId, controller, params);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let tempResult = '';
        while (true) {
            if (stopFlag.value) {
                controller.abort();
                loading.value = false;
                break;
            }
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            let chunk = decoder.decode(value, { stream: true });
            tempResult += chunk;
            const split = tempResult.match(/data:.*}\n\n/g);
            if (split) {
                chunk = split.join('');
                tempResult = tempResult.replace(chunk, '');
            }
            else {
                continue;
            }
            if (chunk && chunk.startsWith('data:{')) {
                if (split) {
                    for (const str of split) {
                        let data;
                        try {
                            data = JSON.parse(str.replace('data:{', '{'));
                        }
                        catch (err) {
                            console.error('JSON string:', str);
                            throw err;
                        }
                        if (data.code && data.code !== 200) {
                            ElMessage({
                                message: data.msg,
                                type: 'error',
                                showClose: true,
                            });
                            return;
                        }
                        switch (data.type) {
                            case 'recommended_question':
                                if (data.content &&
                                    data.content.length > 0 &&
                                    startsWith(data.content.trim(), '[') &&
                                    endsWith(data.content.trim(), ']')) {
                                    questions.value = data.content;
                                    currentChat.value.recommended_question = data.content;
                                    currentChat.value.recommended_generate = true;
                                    await nextTick();
                                }
                        }
                    }
                }
            }
        }
    }
    finally {
        loading.value = false;
        emits('loadingOver');
    }
}
function stop() {
    stopFlag.value = true;
    loading.value = false;
    emits('stop');
}
onBeforeUnmount(() => {
    stop();
});
const __VLS_exposed = { getRecommendQuestions, id: () => props.recordId, stop, getRecommendQuestionsLLM };
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    recordId: undefined,
    disabled: false,
    datasource: undefined,
    chatRecommendedQuestions: undefined,
    currentChat: () => new ChatInfo(),
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
        ...{ class: "recommend-questions" },
    });
    if (__VLS_ctx.loading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_0 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ style: {} },
            type: "primary",
            link: true,
            loading: true,
        }));
        const __VLS_2 = __VLS_1({
            ...{ style: {} },
            type: "primary",
            link: true,
            loading: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "question-grid-input" },
        });
        for (const [question, index] of __VLS_getVForSourceType((__VLS_ctx.computedQuestions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.computedQuestions.length > 0 || __VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.loading))
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
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "recommend-questions-error" },
    });
    (__VLS_ctx.$t('qa.retrieve_error'));
}
/** @type {__VLS_StyleScopedClasses['recommend-questions']} */ ;
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
