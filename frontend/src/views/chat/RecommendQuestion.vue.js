import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { endsWith, startsWith } from 'lodash-es';
import { useI18n } from 'vue-i18n';
import { chatApi, ChatInfo } from '@/api/chat.ts';
const props = withDefaults(defineProps(), {
    recordId: undefined,
    currentChat: () => new ChatInfo(),
    questions: '[]',
    firstChat: false,
    disabled: false,
    position: 'chat',
});
const emits = defineEmits(['clickQuestion', 'update:currentChat', 'stop', 'loadingOver']);
const loading = ref(false);
const _currentChat = computed({
    get() {
        return props.currentChat;
    },
    set(v) {
        emits('update:currentChat', v);
    },
});
const computedQuestions = computed(() => {
    if (props.questions &&
        props.questions.length > 0 &&
        startsWith(props.questions.trim(), '[') &&
        endsWith(props.questions.trim(), ']')) {
        try {
            const parsedQuestions = JSON.parse(props.questions);
            if (Array.isArray(parsedQuestions)) {
                return parsedQuestions.length > 4 ? parsedQuestions.slice(0, 4) : parsedQuestions;
            }
            return [];
        }
        catch (error) {
            console.error('Failed to parse questions:', error);
            return [];
        }
    }
    return [];
});
const { t } = useI18n();
function clickQuestion(question) {
    if (!props.disabled) {
        emits('clickQuestion', question);
    }
}
const stopFlag = ref(false);
async function getRecommendQuestions(articles_number) {
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
                                    if (_currentChat.value?.records) {
                                        for (let record of _currentChat.value.records) {
                                            if (record.id === props.recordId) {
                                                record.recommended_question = data.content;
                                                await nextTick();
                                            }
                                        }
                                    }
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
const __VLS_exposed = { getRecommendQuestions, id: () => props.recordId, stop };
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    recordId: undefined,
    currentChat: () => new ChatInfo(),
    questions: '[]',
    firstChat: false,
    disabled: false,
    position: 'chat',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.computedQuestions.length > 0 || __VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "recommend-questions" },
    });
    if (__VLS_ctx.position === 'chat') {
        if (__VLS_ctx.firstChat) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            (__VLS_ctx.t('qa.guess_u_ask'));
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "continue-ask" },
            });
            (__VLS_ctx.t('qa.continue_to_ask'));
        }
    }
    if (__VLS_ctx.loading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        if (__VLS_ctx.position === 'input') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            (__VLS_ctx.t('qa.guess_u_ask'));
        }
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
    else if (__VLS_ctx.position === 'input') {
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
                        if (!(__VLS_ctx.position === 'input'))
                            return;
                        __VLS_ctx.clickQuestion(question);
                    } },
                key: (index),
                ...{ class: "question" },
                ...{ class: ({ disabled: __VLS_ctx.disabled }) },
            });
            (question);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "question-grid" },
        });
        for (const [question, index] of __VLS_getVForSourceType((__VLS_ctx.computedQuestions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.computedQuestions.length > 0 || __VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.position === 'input'))
                            return;
                        __VLS_ctx.clickQuestion(question);
                    } },
                key: (index),
                ...{ class: "question" },
                ...{ class: ({ disabled: __VLS_ctx.disabled }) },
            });
            (question);
        }
    }
}
else if (__VLS_ctx.position === 'input') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "recommend-questions-error" },
    });
    (__VLS_ctx.$t('qa.retrieve_error'));
}
/** @type {__VLS_StyleScopedClasses['recommend-questions']} */ ;
/** @type {__VLS_StyleScopedClasses['continue-ask']} */ ;
/** @type {__VLS_StyleScopedClasses['question-grid-input']} */ ;
/** @type {__VLS_StyleScopedClasses['question']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['question-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['question']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-questions-error']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            computedQuestions: computedQuestions,
            t: t,
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
