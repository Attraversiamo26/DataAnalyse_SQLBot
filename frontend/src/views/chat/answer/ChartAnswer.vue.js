import BaseAnswer from './BaseAnswer.vue';
import { chatApi, ChatInfo, questionApi } from '@/api/chat.ts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import ChartBlock from '@/views/chat/chat-block/ChartBlock.vue';
import JSONBig from 'json-bigint';
const props = withDefaults(defineProps(), {
    recordId: undefined,
    chatList: () => [],
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    message: undefined,
    loading: false,
});
const emits = defineEmits([
    'finish',
    'error',
    'stop',
    'scrollBottom',
    'update:loading',
    'update:chatList',
    'update:currentChat',
    'update:currentChatId',
]);
const index = computed(() => {
    if (props.message?.index) {
        return props.message.index;
    }
    if (props.message?.index === 0) {
        return 0;
    }
    return -1;
});
const _currentChatId = computed({
    get() {
        return props.currentChatId;
    },
    set(v) {
        emits('update:currentChatId', v);
    },
});
const _currentChat = computed({
    get() {
        return props.currentChat;
    },
    set(v) {
        emits('update:currentChat', v);
    },
});
const _chatList = computed({
    get() {
        return props.chatList;
    },
    set(v) {
        emits('update:chatList', v);
    },
});
const _loading = computed({
    get() {
        return props.loading;
    },
    set(v) {
        emits('update:loading', v);
    },
});
const stopFlag = ref(false);
const sendMessage = async () => {
    stopFlag.value = false;
    _loading.value = true;
    if (index.value < 0) {
        _loading.value = false;
        return;
    }
    const currentRecord = _currentChat.value.records[index.value];
    let error = false;
    if (_currentChatId.value === undefined && !currentRecord.chat_id) {
        error = true;
    }
    if (error)
        return;
    try {
        const controller = new AbortController();
        const param = {
            question: currentRecord.question,
            chat_id: _currentChatId.value,
        };
        const response = await questionApi.add(param, controller);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let sql_answer = '';
        let chart_answer = '';
        let tempResult = '';
        while (true) {
            if (stopFlag.value) {
                controller.abort();
                break;
            }
            const { done, value } = await reader.read();
            if (done) {
                _loading.value = false;
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
                            data = JSONBig.parse(str.replace('data:{', '{'));
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
                            _loading.value = false;
                            return;
                        }
                        switch (data.type) {
                            case 'id':
                                currentRecord.id = data.id;
                                _currentChat.value.records[index.value].id = data.id;
                                break;
                            case 'regenerate_record_id':
                                currentRecord.regenerate_record_id = data.regenerate_record_id;
                                _currentChat.value.records[index.value].regenerate_record_id =
                                    data.regenerate_record_id;
                                break;
                            case 'question':
                                currentRecord.question = data.question;
                                _currentChat.value.records[index.value].question = data.question;
                                break;
                            case 'info':
                                console.info(data.msg);
                                break;
                            case 'brief':
                                _currentChat.value.brief = data.brief;
                                if (Array.isArray(_chatList.value)) {
                                    _chatList.value.forEach((c) => {
                                        if (c.id === _currentChat.value.id) {
                                            c.brief = _currentChat.value.brief;
                                        }
                                    });
                                }
                                break;
                            case 'error':
                                currentRecord.error = data.content;
                                emits('error', currentRecord.id);
                                break;
                            case 'sql-result':
                                sql_answer += data.reasoning_content;
                                _currentChat.value.records[index.value].sql_answer = sql_answer;
                                break;
                            case 'sql':
                                _currentChat.value.records[index.value].sql = data.content;
                                break;
                            case 'sql-data':
                                getChatData(_currentChat.value.records[index.value].id);
                                break;
                            case 'chart-result':
                                chart_answer += data.reasoning_content;
                                _currentChat.value.records[index.value].chart_answer = chart_answer;
                                break;
                            case 'chart':
                                _currentChat.value.records[index.value].chart = data.content;
                                break;
                            case 'datasource':
                                if (!_currentChat.value.datasource) {
                                    _currentChat.value.datasource = data.id;
                                }
                                break;
                            case 'finish':
                                emits('finish', currentRecord.id);
                                break;
                        }
                        await nextTick();
                    }
                }
            }
        }
    }
    catch (error) {
        if (!currentRecord.error) {
            currentRecord.error = '';
        }
        if (currentRecord.error.trim().length !== 0) {
            currentRecord.error = currentRecord.error + '\n';
        }
        currentRecord.error = currentRecord.error + 'Error:' + error;
        console.error('Error:', error);
        emits('error');
    }
    finally {
        _loading.value = false;
    }
};
const loadingData = ref(false);
function getChatData(recordId) {
    loadingData.value = true;
    chatApi
        .get_chart_data(recordId)
        .then((response) => {
        if (Array.isArray(_currentChat.value.records)) {
            _currentChat.value.records.forEach((record) => {
                if (record.id === recordId) {
                    record.data = response;
                }
            });
        }
    })
        .finally(() => {
        loadingData.value = false;
        emits('scrollBottom');
    });
}
function stop() {
    stopFlag.value = true;
    _loading.value = false;
    emits('stop');
}
onBeforeUnmount(() => {
    stop();
});
onMounted(() => {
    if (props.message?.record?.id && props.message?.record?.finish) {
        getChatData(props.message.record.id);
    }
});
const __VLS_exposed = { sendMessage, index: () => index.value, stop };
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    recordId: undefined,
    chatList: () => [],
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    message: undefined,
    loading: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.message) {
    /** @type {[typeof BaseAnswer, typeof BaseAnswer, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(BaseAnswer, new BaseAnswer({
        message: (__VLS_ctx.message),
        reasoningName: (__VLS_ctx.reasoningName),
        loading: (__VLS_ctx._loading),
    }));
    const __VLS_1 = __VLS_0({
        message: (__VLS_ctx.message),
        reasoningName: (__VLS_ctx.reasoningName),
        loading: (__VLS_ctx._loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    var __VLS_3 = {};
    __VLS_2.slots.default;
    /** @type {[typeof ChartBlock, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(ChartBlock, new ChartBlock({
        ...{ style: {} },
        message: (__VLS_ctx.message),
        recordId: (__VLS_ctx.recordId),
        loadingData: (__VLS_ctx.loadingData),
    }));
    const __VLS_5 = __VLS_4({
        ...{ style: {} },
        message: (__VLS_ctx.message),
        recordId: (__VLS_ctx.recordId),
        loadingData: (__VLS_ctx.loadingData),
    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    var __VLS_7 = {};
    {
        const { tool: __VLS_thisSlot } = __VLS_2.slots;
        var __VLS_9 = {};
    }
    {
        const { footer: __VLS_thisSlot } = __VLS_2.slots;
        var __VLS_11 = {};
    }
    var __VLS_2;
}
// @ts-ignore
var __VLS_8 = __VLS_7, __VLS_10 = __VLS_9, __VLS_12 = __VLS_11;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BaseAnswer: BaseAnswer,
            ChartBlock: ChartBlock,
            _loading: _loading,
            loadingData: loadingData,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
