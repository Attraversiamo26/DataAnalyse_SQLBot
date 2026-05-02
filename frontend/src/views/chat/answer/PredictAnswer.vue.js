import BaseAnswer from './BaseAnswer.vue';
import { chatApi, ChatInfo } from '@/api/chat.ts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import MdComponent from '@/views/chat/component/MdComponent.vue';
import ChartBlock from '@/views/chat/chat-block/ChartBlock.vue';
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
    'scrollBottom',
    'stop',
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
    if (_currentChatId.value === undefined || currentRecord.predict_record_id === undefined) {
        error = true;
    }
    if (error)
        return;
    try {
        const controller = new AbortController();
        const response = await chatApi.predict(currentRecord.predict_record_id, controller);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let predict_answer = '';
        let predict_content = '';
        let tempResult = '';
        while (true) {
            if (stopFlag.value) {
                controller.abort();
                _loading.value = false;
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
                            case 'id':
                                currentRecord.id = data.id;
                                _currentChat.value.records[index.value].id = data.id;
                                break;
                            case 'info':
                                console.info(data.msg);
                                break;
                            case 'error':
                                currentRecord.error = data.content;
                                emits('error', currentRecord.id);
                                break;
                            case 'predict-result':
                                predict_answer += data.reasoning_content;
                                predict_content += data.content;
                                _currentChat.value.records[index.value].predict = predict_answer;
                                _currentChat.value.records[index.value].predict_content = predict_content;
                                break;
                            case 'predict-failed':
                                emits('error', currentRecord.id);
                                break;
                            case 'predict-success':
                                //currentChat.value.records[_index].predict_data = data.content
                                getChatPredictData(_currentChat.value.records[index.value].id);
                                emits('finish', currentRecord.id);
                                break;
                            case 'predict_finish':
                                _loading.value = false;
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
const chartBlockRef = ref();
const loadingData = ref(false);
function getChatPredictData(recordId) {
    loadingData.value = true;
    chatApi
        .get_chart_predict_data(recordId)
        .then((response) => {
        let has = false;
        if (Array.isArray(_currentChat.value.records)) {
            _currentChat.value.records.forEach((record) => {
                if (record.id === recordId) {
                    has = true;
                    record.predict_data = response ?? [];
                    if (record.predict_data.length > 1) {
                        getChatData(recordId);
                    }
                    else {
                        loadingData.value = false;
                    }
                }
            });
        }
        if (!has) {
            _loading.value = false;
        }
    })
        .catch((e) => {
        loadingData.value = false;
        console.error(e);
    });
}
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
        getChatPredictData(props.message.record.id);
    }
});
const __VLS_exposed = { sendMessage, index: () => index.value, chatList: () => _chatList, stop };
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
        reasoningName: (['predict']),
        loading: (__VLS_ctx._loading),
    }));
    const __VLS_1 = __VLS_0({
        message: (__VLS_ctx.message),
        reasoningName: (['predict']),
        loading: (__VLS_ctx._loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    var __VLS_3 = {};
    __VLS_2.slots.default;
    /** @type {[typeof MdComponent, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(MdComponent, new MdComponent({
        message: (__VLS_ctx.message.record?.predict_content),
        ...{ style: {} },
    }));
    const __VLS_5 = __VLS_4({
        message: (__VLS_ctx.message.record?.predict_content),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    if (__VLS_ctx.message.record?.predict_data?.length > 0 && __VLS_ctx.message.record?.data) {
        /** @type {[typeof ChartBlock, ]} */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(ChartBlock, new ChartBlock({
            ref: "chartBlockRef",
            ...{ style: {} },
            recordId: (__VLS_ctx.recordId),
            message: (__VLS_ctx.message),
            loadingData: (__VLS_ctx.loadingData),
            isPredict: true,
        }));
        const __VLS_8 = __VLS_7({
            ref: "chartBlockRef",
            ...{ style: {} },
            recordId: (__VLS_ctx.recordId),
            message: (__VLS_ctx.message),
            loadingData: (__VLS_ctx.loadingData),
            isPredict: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        /** @type {typeof __VLS_ctx.chartBlockRef} */ ;
        var __VLS_10 = {};
        var __VLS_9;
    }
    var __VLS_12 = {};
    {
        const { tool: __VLS_thisSlot } = __VLS_2.slots;
        var __VLS_14 = {};
    }
    {
        const { footer: __VLS_thisSlot } = __VLS_2.slots;
        var __VLS_16 = {};
    }
    var __VLS_2;
}
// @ts-ignore
var __VLS_11 = __VLS_10, __VLS_13 = __VLS_12, __VLS_15 = __VLS_14, __VLS_17 = __VLS_16;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BaseAnswer: BaseAnswer,
            MdComponent: MdComponent,
            ChartBlock: ChartBlock,
            _loading: _loading,
            chartBlockRef: chartBlockRef,
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
