import { computed, nextTick, onMounted, ref } from 'vue';
import { chatApi, ChatInfo, ChatRecord } from '@/api/chat';
import ChatRow from './ChatRow.vue';
import ChartAnswer from './answer/ChartAnswer.vue';
import AnalysisAnswer from './answer/AnalysisAnswer.vue';
import PredictAnswer from './answer/PredictAnswer.vue';
import UserChat from './chat-block/UserChat.vue';
import RecommendQuestion from './RecommendQuestion.vue';
import ChatListContainer from './ChatListContainer.vue';
import ChatCreator from '@/views/chat/ChatCreator.vue';
import ChatTokenTime from '@/views/chat/ChatTokenTime.vue';
import ErrorInfo from './ErrorInfo.vue';
import ChatToolBar from './ChatToolBar.vue';
import { dsTypeWithImg } from '@/views/ds/js/ds-type';
import { useI18n } from 'vue-i18n';
import { find, forEach } from 'lodash-es';
import custom_small from '@/assets/svg/logo-custom_small.svg';
import LOGO_fold from '@/assets/LOGO-fold.svg';
import icon_new_chat_outlined from '@/assets/svg/icon_new_chat_outlined.svg';
import icon_sidebar_outlined from '@/assets/svg/icon_sidebar_outlined.svg';
import icon_replace_outlined from '@/assets/svg/icon_replace_outlined.svg';
import icon_screen_outlined from '@/assets/svg/icon_screen_outlined.svg';
import icon_start_outlined from '@/assets/svg/icon_start_outlined.svg';
import logo_fold from '@/assets/svg/logo-custom_small.svg';
import icon_send_filled from '@/assets/svg/icon_send_filled.svg';
import { useAssistantStore } from '@/stores/assistant';
import { onClickOutside } from '@vueuse/core';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
import { useUserStore } from '@/stores/user';
import { debounce } from 'lodash-es';
import { isMobile } from '@/utils/utils';
import router from '@/router';
import QuickQuestion from '@/views/chat/QuickQuestion.vue';
import { useChatConfigStore } from '@/stores/chatConfig.ts';
const userStore = useUserStore();
const props = defineProps();
const floatPopoverRef = ref();
const floatPopoverVisible = ref(false);
const assistantStore = useAssistantStore();
const defaultFloatPopoverStyle = ref({
    padding: '0',
    height: '654px',
    border: '1px solid rgba(222, 224, 227, 1)',
    borderRadius: '6px',
});
const isCompletePage = computed(() => !assistantStore.getAssistant || assistantStore.getEmbedded);
const embeddedHistoryHidden = computed(() => assistantStore.getAssistant && !assistantStore.getHistory);
// const autoDs = computed(() => assistantStore.getAssistant && assistantStore.getAutoDs)
const selectAssistantDs = computed(() => {
    return assistantStore.getAssistant && !assistantStore.getAutoDs;
});
const customName = computed(() => {
    if (!isCompletePage.value && props.pageEmbedded)
        return props.appName;
    return '';
});
const { t } = useI18n();
const chatConfig = useChatConfigStore();
const isPhone = computed(() => {
    return isMobile();
});
const inputMessage = ref('');
const chatListRef = ref();
const innerRef = ref();
const chatCreatorRef = ref();
const scrollToBottom = debounce(() => {
    if (scrolling)
        return;
    nextTick(() => {
        chatListRef.value?.scrollTo({
            top: chatListRef.value.wrapRef.scrollHeight,
            behavior: 'smooth',
        });
    });
}, 300);
const loading = ref(false);
const chatList = ref([]);
const appearanceStore = useAppearanceStoreWithOut();
const currentChatId = ref();
const currentChat = ref(new ChatInfo());
const isTyping = ref(false);
const loginBg = computed(() => {
    return appearanceStore.getLogin;
});
const computedMessages = computed(() => {
    const messages = [];
    if (currentChatId.value === undefined) {
        return messages;
    }
    for (let i = 0; i < currentChat.value.records.length; i++) {
        const record = currentChat.value.records[i];
        if (record.question !== undefined && !record.first_chat) {
            messages.push({
                role: 'user',
                create_time: record.create_time,
                record: record,
                content: record.question,
                index: i,
            });
        }
        messages.push({
            role: 'assistant',
            create_time: record.create_time,
            record: record,
            isTyping: i === currentChat.value.records.length - 1 && isTyping.value,
            first_chat: record.first_chat,
            recommended_question: record.recommended_question,
            index: i,
        });
    }
    return messages;
});
const goEmpty = (func, ...param) => {
    inputMessage.value = '';
    stop(func, ...param);
};
let scrollTime;
let scrollingTime;
let scrollTopVal = 0;
let scrolling = false;
let userScrolledAway = false; // 用户是否主动滚动离开底部
const scrollBottom = () => {
    if (scrolling)
        return;
    if (!isTyping.value && !getRecommendQuestionsLoading.value) {
        clearInterval(scrollTime);
    }
    if (!chatListRef.value) {
        clearInterval(scrollTime);
        return;
    }
    chatListRef.value.setScrollTop(innerRef.value.clientHeight);
};
const handleScroll = (val) => {
    scrollTopVal = val.scrollTop;
    scrolling = true;
    clearTimeout(scrollingTime);
    scrollingTime = setTimeout(() => {
        scrolling = false;
    }, 400);
    const threshold = innerRef.value.clientHeight - (document.querySelector('.chat-record-list').clientHeight - 20);
    const isNearBottom = scrollTopVal + 50 >= threshold;
    // 用户滚动离开底部时，标记并停止自动滚动
    if (!isNearBottom) {
        userScrolledAway = true;
        clearInterval(scrollTime);
        scrollTime = null;
        return;
    }
    // 用户滚回底部时，重置标记
    userScrolledAway = false;
    // 只有用户在底部、没有主动滚走、且正在输入时才启动自动滚动
    if (!scrollTime && isTyping.value && !userScrolledAway) {
        scrollTime = setInterval(() => {
            scrollBottom();
        }, 300);
    }
};
const createNewChatSimple = async () => {
    currentChat.value = new ChatInfo();
    currentChatId.value = undefined;
    await createNewChat();
};
const createNewChat = async () => {
    try {
        await chatApi.checkLLMModel();
    }
    catch (error) {
        console.error(error);
        let errorMsg = t('model.default_miss');
        let confirm_text = t('datasource.got_it');
        if (userStore.isAdmin) {
            errorMsg = t('model.default_miss_admin');
            confirm_text = t('model.to_config');
        }
        ElMessageBox.confirm(t('qa.ask_failed'), {
            confirmButtonType: 'primary',
            tip: errorMsg,
            showCancelButton: userStore.isAdmin,
            confirmButtonText: confirm_text,
            cancelButtonText: t('common.cancel'),
            customClass: 'confirm-no_icon',
            autofocus: false,
            showClose: false,
            callback: (val) => {
                if (userStore.isAdmin && val === 'confirm') {
                    router.push('/system/model');
                }
            },
        });
        return;
    }
    goEmpty();
    if (!isCompletePage.value && !selectAssistantDs.value) {
        currentChat.value = new ChatInfo();
        currentChatId.value = undefined;
        return;
    }
    chatCreatorRef.value?.showDs();
};
function getChatList(callback) {
    loading.value = true;
    chatApi
        .list()
        .then((res) => {
        chatList.value = chatApi.toChatInfoList(res);
    })
        .finally(() => {
        loading.value = false;
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}
function onClickHistory(chat) {
    scrollToBottom();
    if (Array.isArray(chat?.records)) {
        forEach(chat.records, (record) => {
            // getChatData(record.id)
            if (record.predict_record_id) {
                // getChatPredictData(record.id)
            }
        });
    }
}
const currentChatEngineType = computed(() => {
    return (dsTypeWithImg.find((ele) => currentChat.value.ds_type === ele.type) || {}).img;
});
function onChatDeleted(id) {
    console.info('deleted', id);
}
function onChatRenamed(chat) {
    console.info('renamed', chat);
}
const chatListSideBarShow = ref(true);
function hideSideBar() {
    if ((!isCompletePage.value && !props.pageEmbedded) || isPhone.value) {
        floatPopoverVisible.value = false;
        return;
    }
    chatListSideBarShow.value = false;
}
function showSideBar() {
    if (isPhone.value) {
        showFloatPopover();
        return;
    }
    chatListSideBarShow.value = true;
}
function onChatCreatedQuick(chat) {
    chatList.value.unshift(chat);
    currentChatId.value = chat.id;
    currentChat.value = chat;
    onChatCreated(chat);
}
const recommendQuestionRef = ref();
const quickQuestionRef = ref();
function onChatCreated(chat) {
    if (chat.records.length === 1 && !chat.records[0].recommended_question) {
        // do nothing
    }
}
function getRecommendQuestions(id) {
    nextTick(() => {
        if (recommendQuestionRef.value) {
            if (recommendQuestionRef.value instanceof Array) {
                for (let i = 0; i < recommendQuestionRef.value.length; i++) {
                    const _id = recommendQuestionRef.value[i].id();
                    if (_id === id) {
                        recommendQuestionRef.value[i].getRecommendQuestions();
                        break;
                    }
                }
            }
            else {
                recommendQuestionRef.value.getRecommendQuestions();
            }
        }
    });
}
function quickAsk(question) {
    inputMessage.value = question;
    nextTick(() => {
        sendMessage();
    });
}
const chartAnswerRef = ref();
const getRecommendQuestionsLoading = ref(false);
async function onChartAnswerFinish(id) {
    getRecommendQuestionsLoading.value = true;
    loading.value = false;
    isTyping.value = false;
    getRecordUsage(id);
    getRecommendQuestions(id);
}
const loadingOver = () => {
    getRecommendQuestionsLoading.value = false;
};
function onChartAnswerError(id) {
    loading.value = false;
    isTyping.value = false;
    getRecordUsage(id);
}
function onChatStop() {
    loading.value = false;
    isTyping.value = false;
    console.debug('onChatStop');
}
const assistantPrepareSend = async () => {
    if (!isCompletePage.value &&
        !selectAssistantDs.value &&
        (currentChatId.value == null || typeof currentChatId.value == 'undefined')) {
        const assistantChat = await assistantStore.setChat();
        if (assistantChat) {
            onChatCreatedQuick(assistantChat);
        }
    }
};
const sendMessage = async (regenerate_record_id = undefined, $event = {}) => {
    if ($event?.isComposing) {
        return;
    }
    if (!inputMessage.value.trim())
        return;
    loading.value = true;
    isTyping.value = true;
    if (isCompletePage.value && innerRef.value) {
        scrollTopVal = innerRef.value.clientHeight;
        scrollTime = setInterval(() => {
            scrollBottom();
        }, 300);
    }
    await assistantPrepareSend();
    const currentRecord = new ChatRecord();
    currentRecord.create_time = new Date();
    currentRecord.chat_id = currentChatId.value;
    currentRecord.question = inputMessage.value;
    currentRecord.regenerate_record_id = regenerate_record_id;
    currentRecord.sql_answer = '';
    currentRecord.sql = '';
    currentRecord.chart_answer = '';
    currentRecord.chart = '';
    currentChat.value.records.push(currentRecord);
    inputMessage.value = '';
    nextTick(async () => {
        if (!isCompletePage.value && innerRef.value) {
            scrollTopVal = innerRef.value.clientHeight;
            scrollTime = setInterval(() => {
                scrollBottom();
            }, 300);
        }
        const index = currentChat.value.records.length - 1;
        if (chartAnswerRef.value) {
            if (chartAnswerRef.value instanceof Array) {
                for (let i = 0; i < chartAnswerRef.value.length; i++) {
                    const _index = chartAnswerRef.value[i].index();
                    if (index === _index) {
                        await chartAnswerRef.value[i].sendMessage();
                        break;
                    }
                }
            }
            else {
                await chartAnswerRef.value.sendMessage();
            }
        }
    });
};
const analysisAnswerRef = ref();
async function onAnalysisAnswerFinish(id) {
    loading.value = false;
    isTyping.value = false;
    getRecordUsage(id);
    //await getRecommendQuestions(id)
}
function onAnalysisAnswerError(id) {
    loading.value = false;
    isTyping.value = false;
    getRecordUsage(id);
}
function askAgain(message) {
    if (message.record?.question?.trim() === '') {
        return;
    }
    // regenerate
    inputMessage.value = '/regenerate';
    let regenerate_record_id = message.record?.id;
    if (message.record?.id == undefined && message.record?.regenerate_record_id) {
        //只有当前对话内，上一次执行失败的重试会进这里
        regenerate_record_id = message.record?.regenerate_record_id;
    }
    if (regenerate_record_id) {
        inputMessage.value = inputMessage.value + ' ' + regenerate_record_id;
    }
    nextTick(() => {
        sendMessage(regenerate_record_id);
    });
}
async function clickAnalysis(id) {
    const baseRecord = find(currentChat.value.records, (value) => id === value.id);
    if (baseRecord == undefined) {
        return;
    }
    loading.value = true;
    isTyping.value = true;
    const currentRecord = new ChatRecord();
    currentRecord.create_time = new Date();
    currentRecord.chat_id = baseRecord.chat_id;
    currentRecord.question = baseRecord.question;
    currentRecord.chart = baseRecord.chart;
    currentRecord.data = baseRecord.data;
    currentRecord.analysis_record_id = id;
    currentRecord.analysis = '';
    currentChat.value.records.push(currentRecord);
    nextTick(async () => {
        const index = currentChat.value.records.length - 1;
        if (analysisAnswerRef.value) {
            if (analysisAnswerRef.value instanceof Array) {
                for (let i = 0; i < analysisAnswerRef.value.length; i++) {
                    const _index = analysisAnswerRef.value[i].index();
                    if (index === _index) {
                        await analysisAnswerRef.value[i].sendMessage();
                        break;
                    }
                }
            }
            else {
                await analysisAnswerRef.value.sendMessage();
            }
        }
    });
    return;
}
function getRecordUsage(recordId) {
    console.debug('getRecordUsage id: ', recordId);
    nextTick(() => {
        chatApi
            .get_chart_usage(recordId)
            .then((res) => {
            const logHistory = chatApi.toChatLogHistory(res);
            if (logHistory && Array.isArray(currentChat.value.records)) {
                currentChat.value.records.forEach((record) => {
                    if (record.id === recordId) {
                        record.duration = logHistory.duration;
                        record.finish_time = logHistory.finish_time;
                        record.total_tokens = logHistory.total_tokens;
                    }
                });
            }
        })
            .catch((e) => {
            console.error(e);
        });
    });
}
const predictAnswerRef = ref();
async function onPredictAnswerFinish(id) {
    loading.value = false;
    isTyping.value = false;
    // console.debug('onPredictAnswerFinish: ', id)
    getRecordUsage(id);
    //await getRecommendQuestions(id)
}
function onPredictAnswerError(id) {
    loading.value = false;
    isTyping.value = false;
    getRecordUsage(id);
}
async function clickPredict(id) {
    const baseRecord = find(currentChat.value.records, (value) => id === value.id);
    if (baseRecord == undefined) {
        return;
    }
    loading.value = true;
    isTyping.value = true;
    const currentRecord = new ChatRecord();
    currentRecord.create_time = new Date();
    currentRecord.chat_id = baseRecord.chat_id;
    currentRecord.question = baseRecord.question;
    currentRecord.chart = baseRecord.chart;
    currentRecord.data = baseRecord.data;
    currentRecord.predict_record_id = id;
    currentRecord.predict = '';
    currentRecord.predict_data = '';
    currentChat.value.records.push(currentRecord);
    nextTick(async () => {
        const index = currentChat.value.records.length - 1;
        if (predictAnswerRef.value) {
            if (predictAnswerRef.value instanceof Array) {
                for (let i = 0; i < predictAnswerRef.value.length; i++) {
                    const _index = predictAnswerRef.value[i].index();
                    if (index === _index) {
                        await predictAnswerRef.value[i].sendMessage();
                        break;
                    }
                }
            }
            else {
                await predictAnswerRef.value.sendMessage();
            }
        }
    });
    return;
}
const handleCtrlEnter = (e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    inputMessage.value = value.substring(0, start) + '\n' + value.substring(end);
    nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    });
};
const inputRef = ref();
function clickInput() {
    inputRef.value?.focus();
}
function stop(func, ...param) {
    if (recommendQuestionRef.value) {
        if (recommendQuestionRef.value instanceof Array) {
            for (let i = 0; i < recommendQuestionRef.value.length; i++) {
                recommendQuestionRef.value[i].stop();
            }
        }
        else {
            recommendQuestionRef.value.stop();
        }
    }
    if (chartAnswerRef.value) {
        if (chartAnswerRef.value instanceof Array) {
            for (let i = 0; i < chartAnswerRef.value.length; i++) {
                chartAnswerRef.value[i].stop();
            }
        }
        else {
            chartAnswerRef.value.stop();
        }
    }
    if (analysisAnswerRef.value) {
        if (analysisAnswerRef.value instanceof Array) {
            for (let i = 0; i < analysisAnswerRef.value.length; i++) {
                analysisAnswerRef.value[i].stop();
            }
        }
        else {
            analysisAnswerRef.value.stop();
        }
    }
    if (predictAnswerRef.value) {
        if (predictAnswerRef.value instanceof Array) {
            for (let i = 0; i < predictAnswerRef.value.length; i++) {
                predictAnswerRef.value[i].stop();
            }
        }
        else {
            predictAnswerRef.value.stop();
        }
    }
    if (func && typeof func === 'function') {
        func(...param);
    }
}
const showFloatPopover = () => {
    if ((!isCompletePage.value || isPhone.value) && !floatPopoverVisible.value) {
        floatPopoverVisible.value = true;
    }
};
const registerClickOutside = () => {
    onClickOutside(floatPopoverRef, (event) => {
        if (floatPopoverVisible.value) {
            let parentElement = event.target;
            let isEdOverlay = false;
            while (parentElement) {
                if (parentElement.className.includes('ed-overlay')) {
                    isEdOverlay = true;
                    break;
                }
                else {
                    parentElement = parentElement.parentElement;
                }
            }
            if (isEdOverlay)
                return;
            floatPopoverVisible.value = false;
        }
    });
};
const assistantPrepareInit = () => {
    if (isCompletePage.value || props.pageEmbedded) {
        return;
    }
    Object.assign(defaultFloatPopoverStyle.value, {
        height: '100% !important',
        inset: '0px auto auto 0px',
    });
    goEmpty();
    registerClickOutside();
};
const __VLS_exposed = {
    createNewChat,
    showFloatPopover,
};
defineExpose(__VLS_exposed);
const hiddenChatCreatorRef = ref();
function jumpCreatChat() {
    if (props.startChatDsId) {
        const _id = props.startChatDsId;
        nextTick(() => {
            hiddenChatCreatorRef.value?.createChat(_id);
        });
        const newUrl = window.location.hash.replace(/\?.*$/, '');
        history.replaceState({}, '', newUrl);
    }
}
async function loadChatFromParams() {
    if (props.chat_id) {
        try {
            const chatId = parseInt(props.chat_id);
            if (!isNaN(chatId)) {
                // 加载指定的聊天会话
                const chatInfo = await chatApi.get(chatId);
                if (chatInfo) {
                    currentChatId.value = chatInfo.id;
                    currentChat.value = chatInfo;
                    // 如果有record_id，加载对应的记录
                    if (props.record_id) {
                        const recordId = parseInt(props.record_id);
                        if (!isNaN(recordId)) {
                            // 找到对应的记录
                            const record = chatInfo.records.find((r) => r.id === recordId);
                            if (record) {
                                // 滚动到对应记录的逻辑可以在这里添加
                                console.log('Loaded record:', record);
                                // 可以在这里触发相关的显示逻辑
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to load chat from params:', error);
        }
    }
}
onMounted(() => {
    chatConfig.fetchGlobalConfig();
    if (isPhone.value) {
        chatListSideBarShow.value = false;
        if (props.pageEmbedded) {
            registerClickOutside();
        }
    }
    getChatList(() => {
        jumpCreatChat();
        loadChatFromParams();
    });
    assistantPrepareInit();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-textarea__inner']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.assistantStore.assistant && !__VLS_ctx.assistantStore.pageEmbedded && __VLS_ctx.assistantStore.type != 4) {
    const __VLS_0 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        ...{ class: "show-history_icon" },
        ...{ class: ({ 'embedded-history-hidden': __VLS_ctx.embeddedHistoryHidden }) },
        size: "20",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        ...{ class: "show-history_icon" },
        ...{ class: ({ 'embedded-history-hidden': __VLS_ctx.embeddedHistoryHidden }) },
        size: "20",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.showFloatPopover)
    };
    __VLS_3.slots.default;
    const __VLS_8 = {}.icon_sidebar_outlined;
    /** @type {[typeof __VLS_components.Icon_sidebar_outlined, typeof __VLS_components.icon_sidebar_outlined, typeof __VLS_components.Icon_sidebar_outlined, typeof __VLS_components.icon_sidebar_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_3;
}
const __VLS_12 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ class: "chat-container no-padding" },
}));
const __VLS_14 = __VLS_13({
    ...{ class: "chat-container no-padding" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
if ((__VLS_ctx.isCompletePage || __VLS_ctx.pageEmbedded) && __VLS_ctx.chatListSideBarShow) {
    const __VLS_16 = {}.ElAside;
    /** @type {[typeof __VLS_components.ElAside, typeof __VLS_components.elAside, typeof __VLS_components.ElAside, typeof __VLS_components.elAside, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ class: "chat-container-left" },
        ...{ class: ({ 'embedded-history-hidden': __VLS_ctx.embeddedHistoryHidden }) },
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "chat-container-left" },
        ...{ class: ({ 'embedded-history-hidden': __VLS_ctx.embeddedHistoryHidden }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    /** @type {[typeof ChatListContainer, ]} */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(ChatListContainer, new ChatListContainer({
        ...{ 'onGoEmpty': {} },
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnChatDeleted': {} },
        ...{ 'onOnChatRenamed': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        chatList: (__VLS_ctx.chatList),
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.loading),
        inPopover: (!__VLS_ctx.chatListSideBarShow),
        appName: (__VLS_ctx.customName),
    }));
    const __VLS_21 = __VLS_20({
        ...{ 'onGoEmpty': {} },
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnChatDeleted': {} },
        ...{ 'onOnChatRenamed': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        chatList: (__VLS_ctx.chatList),
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.loading),
        inPopover: (!__VLS_ctx.chatListSideBarShow),
        appName: (__VLS_ctx.customName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    let __VLS_23;
    let __VLS_24;
    let __VLS_25;
    const __VLS_26 = {
        onGoEmpty: (__VLS_ctx.goEmpty)
    };
    const __VLS_27 = {
        onOnChatCreated: (__VLS_ctx.onChatCreated)
    };
    const __VLS_28 = {
        onOnClickHistory: (__VLS_ctx.onClickHistory)
    };
    const __VLS_29 = {
        onOnChatDeleted: (__VLS_ctx.onChatDeleted)
    };
    const __VLS_30 = {
        onOnChatRenamed: (__VLS_ctx.onChatRenamed)
    };
    const __VLS_31 = {
        onOnClickSideBarBtn: (__VLS_ctx.hideSideBar)
    };
    var __VLS_22;
    var __VLS_19;
}
if ((!__VLS_ctx.isCompletePage && !__VLS_ctx.pageEmbedded) || !__VLS_ctx.chatListSideBarShow) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hidden-sidebar-btn" },
        ...{ class: ({
                'assistant-popover-sidebar': !__VLS_ctx.isCompletePage && !__VLS_ctx.pageEmbedded,
                'embedded-history-hidden': __VLS_ctx.embeddedHistoryHidden,
            }) },
    });
    const __VLS_32 = {}.ElPopover;
    /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        width: (280),
        placement: "bottom-start",
        popperClass: "popover-chat_history",
        popperStyle: ({ ...__VLS_ctx.defaultFloatPopoverStyle }),
        disabled: (__VLS_ctx.isPhone),
    }));
    const __VLS_34 = __VLS_33({
        width: (280),
        placement: "bottom-start",
        popperClass: "popover-chat_history",
        popperStyle: ({ ...__VLS_ctx.defaultFloatPopoverStyle }),
        disabled: (__VLS_ctx.isPhone),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { reference: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_36 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            ...{ class: "icon-btn" },
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            ...{ class: "icon-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_40;
        let __VLS_41;
        let __VLS_42;
        const __VLS_43 = {
            onClick: (__VLS_ctx.showSideBar)
        };
        __VLS_39.slots.default;
        const __VLS_44 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        const __VLS_48 = {}.icon_sidebar_outlined;
        /** @type {[typeof __VLS_components.Icon_sidebar_outlined, typeof __VLS_components.icon_sidebar_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
        const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
        var __VLS_47;
        var __VLS_39;
    }
    /** @type {[typeof ChatListContainer, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(ChatListContainer, new ChatListContainer({
        ...{ 'onGoEmpty': {} },
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnChatDeleted': {} },
        ...{ 'onOnChatRenamed': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        ref: "floatPopoverRef",
        chatList: (__VLS_ctx.chatList),
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.loading),
        inPopover: (!__VLS_ctx.chatListSideBarShow),
        appName: (__VLS_ctx.customName),
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onGoEmpty': {} },
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnChatDeleted': {} },
        ...{ 'onOnChatRenamed': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        ref: "floatPopoverRef",
        chatList: (__VLS_ctx.chatList),
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.loading),
        inPopover: (!__VLS_ctx.chatListSideBarShow),
        appName: (__VLS_ctx.customName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onGoEmpty: (__VLS_ctx.goEmpty)
    };
    const __VLS_59 = {
        onOnChatCreated: (__VLS_ctx.onChatCreated)
    };
    const __VLS_60 = {
        onOnClickHistory: (__VLS_ctx.onClickHistory)
    };
    const __VLS_61 = {
        onOnChatDeleted: (__VLS_ctx.onChatDeleted)
    };
    const __VLS_62 = {
        onOnChatRenamed: (__VLS_ctx.onChatRenamed)
    };
    const __VLS_63 = {
        onOnClickSideBarBtn: (__VLS_ctx.hideSideBar)
    };
    /** @type {typeof __VLS_ctx.floatPopoverRef} */ ;
    var __VLS_64 = {};
    var __VLS_54;
    var __VLS_35;
    const __VLS_66 = {}.ElDrawer;
    /** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        modelValue: (__VLS_ctx.floatPopoverVisible),
        withHeader: (false),
        modal: (false),
        direction: "ltr",
        size: "278",
        modalClass: "assistant-popover_sidebar",
        beforeClose: (__VLS_ctx.hideSideBar),
    }));
    const __VLS_68 = __VLS_67({
        modelValue: (__VLS_ctx.floatPopoverVisible),
        withHeader: (false),
        modal: (false),
        direction: "ltr",
        size: "278",
        modalClass: "assistant-popover_sidebar",
        beforeClose: (__VLS_ctx.hideSideBar),
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_69.slots.default;
    /** @type {[typeof ChatListContainer, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(ChatListContainer, new ChatListContainer({
        ...{ 'onGoEmpty': {} },
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnChatDeleted': {} },
        ...{ 'onOnChatRenamed': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        ref: "floatPopoverRef",
        chatList: (__VLS_ctx.chatList),
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.loading),
        appName: (__VLS_ctx.customName),
        inPopover: (false),
    }));
    const __VLS_71 = __VLS_70({
        ...{ 'onGoEmpty': {} },
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnChatDeleted': {} },
        ...{ 'onOnChatRenamed': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        ref: "floatPopoverRef",
        chatList: (__VLS_ctx.chatList),
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.loading),
        appName: (__VLS_ctx.customName),
        inPopover: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_73;
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = {
        onGoEmpty: (__VLS_ctx.goEmpty)
    };
    const __VLS_77 = {
        onOnChatCreated: (__VLS_ctx.onChatCreated)
    };
    const __VLS_78 = {
        onOnClickHistory: (__VLS_ctx.onClickHistory)
    };
    const __VLS_79 = {
        onOnChatDeleted: (__VLS_ctx.onChatDeleted)
    };
    const __VLS_80 = {
        onOnChatRenamed: (__VLS_ctx.onChatRenamed)
    };
    const __VLS_81 = {
        onOnClickSideBarBtn: (__VLS_ctx.hideSideBar)
    };
    /** @type {typeof __VLS_ctx.floatPopoverRef} */ ;
    var __VLS_82 = {};
    var __VLS_72;
    var __VLS_69;
    const __VLS_84 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        effect: "dark",
        offset: (8),
        content: (__VLS_ctx.t('qa.new_chat')),
        placement: "bottom",
    }));
    const __VLS_86 = __VLS_85({
        effect: "dark",
        offset: (8),
        content: (__VLS_ctx.t('qa.new_chat')),
        placement: "bottom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    const __VLS_88 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        ...{ class: "icon-btn" },
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        ...{ class: "icon-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (__VLS_ctx.createNewChatSimple)
    };
    __VLS_91.slots.default;
    const __VLS_96 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
    const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    const __VLS_100 = {}.icon_new_chat_outlined;
    /** @type {[typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({}));
    const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
    var __VLS_99;
    var __VLS_91;
    var __VLS_87;
}
const __VLS_104 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    loading: (__VLS_ctx.loading),
}));
const __VLS_106 = __VLS_105({
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ElMain;
/** @type {[typeof __VLS_components.ElMain, typeof __VLS_components.elMain, typeof __VLS_components.ElMain, typeof __VLS_components.elMain, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    ...{ class: "chat-record-list" },
    ...{ class: ({
            'hide-sidebar': (__VLS_ctx.isCompletePage || __VLS_ctx.pageEmbedded) && !__VLS_ctx.chatListSideBarShow,
            'assistant-chat-main': !__VLS_ctx.isCompletePage && !__VLS_ctx.pageEmbedded,
        }) },
}));
const __VLS_110 = __VLS_109({
    ...{ class: "chat-record-list" },
    ...{ class: ({
            'hide-sidebar': (__VLS_ctx.isCompletePage || __VLS_ctx.pageEmbedded) && !__VLS_ctx.chatListSideBarShow,
            'assistant-chat-main': !__VLS_ctx.isCompletePage && !__VLS_ctx.pageEmbedded,
        }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
if (__VLS_ctx.computedMessages.length == 0 && !__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "welcome-content-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "welcome-content" },
    });
    if (__VLS_ctx.isCompletePage) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "greeting" },
        });
        if (__VLS_ctx.loginBg) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                height: "32",
                width: "32",
                src: (__VLS_ctx.loginBg),
                alt: "",
            });
        }
        else {
            const __VLS_112 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                size: "32",
            }));
            const __VLS_114 = __VLS_113({
                size: "32",
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
            __VLS_115.slots.default;
            if (__VLS_ctx.appearanceStore.themeColor !== 'default') {
                const __VLS_116 = {}.custom_small;
                /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
                // @ts-ignore
                const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
                const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
            }
            else {
                const __VLS_120 = {}.LOGO_fold;
                /** @type {[typeof __VLS_components.LOGO_fold, typeof __VLS_components.LOGO_fold, ]} */ ;
                // @ts-ignore
                const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
                const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
            }
            var __VLS_115;
        }
        (__VLS_ctx.appearanceStore.pc_welcome ?? '你好，我是邮政数据分析智能体');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sub" },
        });
        (__VLS_ctx.appearanceStore.pc_welcome_desc ??
            '我可以查询数据、生成图表、检测数据异常、预测数据等赶快开启智能问数吧～');
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "assistant-desc" },
        });
        if (__VLS_ctx.logoAssistant) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (__VLS_ctx.logoAssistant),
                ...{ class: "logo" },
                width: "30px",
                height: "30px",
                alt: "",
            });
        }
        else {
            const __VLS_124 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                size: "32",
            }));
            const __VLS_126 = __VLS_125({
                size: "32",
            }, ...__VLS_functionalComponentArgsRest(__VLS_125));
            __VLS_127.slots.default;
            const __VLS_128 = {}.logo_fold;
            /** @type {[typeof __VLS_components.Logo_fold, typeof __VLS_components.logo_fold, ]} */ ;
            // @ts-ignore
            const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
            const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
            var __VLS_127;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "i-am" },
        });
        (__VLS_ctx.welcome);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "i-can" },
        });
        (__VLS_ctx.welcomeDesc);
    }
    if ((__VLS_ctx.isCompletePage || __VLS_ctx.selectAssistantDs) && __VLS_ctx.currentChatId === undefined) {
        const __VLS_132 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            ...{ 'onClick': {} },
            size: "large",
            type: "primary",
            ...{ class: "greeting-btn" },
        }));
        const __VLS_134 = __VLS_133({
            ...{ 'onClick': {} },
            size: "large",
            type: "primary",
            ...{ class: "greeting-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        let __VLS_136;
        let __VLS_137;
        let __VLS_138;
        const __VLS_139 = {
            onClick: (__VLS_ctx.createNewChatSimple)
        };
        __VLS_135.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "inner-icon" },
        });
        const __VLS_140 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
        const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_143.slots.default;
        const __VLS_144 = {}.icon_new_chat_outlined;
        /** @type {[typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
        const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
        var __VLS_143;
        (__VLS_ctx.t('qa.start_sqlbot'));
        var __VLS_135;
    }
}
else if (__VLS_ctx.computedMessages.length == 0 && __VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "welcome-content-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    if (__VLS_ctx.logoAssistant || __VLS_ctx.loginBg) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            height: "30",
            width: "30",
            src: (__VLS_ctx.logoAssistant ? __VLS_ctx.logoAssistant : __VLS_ctx.loginBg),
            alt: "",
        });
    }
    else {
        const __VLS_148 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
            size: "30",
        }));
        const __VLS_150 = __VLS_149({
            size: "30",
        }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        __VLS_151.slots.default;
        if (__VLS_ctx.appearanceStore.themeColor !== 'default') {
            const __VLS_152 = {}.custom_small;
            /** @type {[typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, typeof __VLS_components.Custom_small, typeof __VLS_components.custom_small, ]} */ ;
            // @ts-ignore
            const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({}));
            const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
        }
        else {
            const __VLS_156 = {}.LOGO_fold;
            /** @type {[typeof __VLS_components.LOGO_fold, typeof __VLS_components.LOGO_fold, ]} */ ;
            // @ts-ignore
            const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({}));
            const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
        }
        var __VLS_151;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.appearanceStore.name);
}
if (__VLS_ctx.computedMessages.length > 0) {
    const __VLS_160 = {}.ElScrollbar;
    /** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        ...{ 'onScroll': {} },
        ref: "chatListRef",
        ...{ class: "no-horizontal" },
    }));
    const __VLS_162 = __VLS_161({
        ...{ 'onScroll': {} },
        ref: "chatListRef",
        ...{ class: "no-horizontal" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    let __VLS_164;
    let __VLS_165;
    let __VLS_166;
    const __VLS_167 = {
        onScroll: (__VLS_ctx.handleScroll)
    };
    /** @type {typeof __VLS_ctx.chatListRef} */ ;
    var __VLS_168 = {};
    __VLS_163.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "innerRef",
        ...{ class: "chat-scroll" },
        ...{ class: ({
                'no-sidebar': __VLS_ctx.isCompletePage && !__VLS_ctx.chatListSideBarShow,
                pad16: !__VLS_ctx.isCompletePage,
            }) },
    });
    /** @type {typeof __VLS_ctx.innerRef} */ ;
    for (const [message, _index] of __VLS_getVForSourceType((__VLS_ctx.computedMessages))) {
        /** @type {[typeof ChatRow, typeof ChatRow, ]} */ ;
        // @ts-ignore
        const __VLS_170 = __VLS_asFunctionalComponent(ChatRow, new ChatRow({
            logoAssistant: (__VLS_ctx.logoAssistant),
            currentChat: (__VLS_ctx.currentChat),
            msg: (message),
            hideAvatar: (message.first_chat),
        }));
        const __VLS_171 = __VLS_170({
            logoAssistant: (__VLS_ctx.logoAssistant),
            currentChat: (__VLS_ctx.currentChat),
            msg: (message),
            hideAvatar: (message.first_chat),
        }, ...__VLS_functionalComponentArgsRest(__VLS_170));
        __VLS_172.slots.default;
        if (message.role === 'user') {
            /** @type {[typeof UserChat, ]} */ ;
            // @ts-ignore
            const __VLS_173 = __VLS_asFunctionalComponent(UserChat, new UserChat({
                message: (message),
                allMessages: (__VLS_ctx.computedMessages),
            }));
            const __VLS_174 = __VLS_173({
                message: (message),
                allMessages: (__VLS_ctx.computedMessages),
            }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        }
        if (message.role === 'assistant' && !message.first_chat) {
            if ((message?.record?.analysis_record_id === undefined ||
                message?.record?.analysis_record_id === null) &&
                (message?.record?.predict_record_id === undefined ||
                    message?.record?.predict_record_id === null)) {
                /** @type {[typeof ChartAnswer, typeof ChartAnswer, ]} */ ;
                // @ts-ignore
                const __VLS_176 = __VLS_asFunctionalComponent(ChartAnswer, new ChartAnswer({
                    ...{ 'onScrollBottom': {} },
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ref: "chartAnswerRef",
                    chatList: (__VLS_ctx.chatList),
                    currentChat: (__VLS_ctx.currentChat),
                    currentChatId: (__VLS_ctx.currentChatId),
                    recordId: (message.record?.id),
                    loading: (__VLS_ctx.isTyping),
                    message: (message),
                    reasoningName: (['sql_answer', 'chart_answer']),
                }));
                const __VLS_177 = __VLS_176({
                    ...{ 'onScrollBottom': {} },
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ref: "chartAnswerRef",
                    chatList: (__VLS_ctx.chatList),
                    currentChat: (__VLS_ctx.currentChat),
                    currentChatId: (__VLS_ctx.currentChatId),
                    recordId: (message.record?.id),
                    loading: (__VLS_ctx.isTyping),
                    message: (message),
                    reasoningName: (['sql_answer', 'chart_answer']),
                }, ...__VLS_functionalComponentArgsRest(__VLS_176));
                let __VLS_179;
                let __VLS_180;
                let __VLS_181;
                const __VLS_182 = {
                    onScrollBottom: (__VLS_ctx.scrollToBottom)
                };
                const __VLS_183 = {
                    onFinish: (__VLS_ctx.onChartAnswerFinish)
                };
                const __VLS_184 = {
                    onError: (__VLS_ctx.onChartAnswerError)
                };
                const __VLS_185 = {
                    onStop: (__VLS_ctx.onChatStop)
                };
                /** @type {typeof __VLS_ctx.chartAnswerRef} */ ;
                var __VLS_186 = {};
                __VLS_178.slots.default;
                /** @type {[typeof ErrorInfo, ]} */ ;
                // @ts-ignore
                const __VLS_188 = __VLS_asFunctionalComponent(ErrorInfo, new ErrorInfo({
                    error: (message.record?.error),
                    ...{ class: "error-container" },
                }));
                const __VLS_189 = __VLS_188({
                    error: (message.record?.error),
                    ...{ class: "error-container" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_188));
                {
                    const { tool: __VLS_thisSlot } = __VLS_178.slots;
                    /** @type {[typeof ChatTokenTime, ]} */ ;
                    // @ts-ignore
                    const __VLS_191 = __VLS_asFunctionalComponent(ChatTokenTime, new ChatTokenTime({
                        recordId: (message.record?.id),
                        duration: (message.record?.duration),
                        totalTokens: (message.record?.total_tokens),
                    }));
                    const __VLS_192 = __VLS_191({
                        recordId: (message.record?.id),
                        duration: (message.record?.duration),
                        totalTokens: (message.record?.total_tokens),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
                    if (!message.isTyping) {
                        /** @type {[typeof ChatToolBar, typeof ChatToolBar, ]} */ ;
                        // @ts-ignore
                        const __VLS_194 = __VLS_asFunctionalComponent(ChatToolBar, new ChatToolBar({
                            message: (message),
                        }));
                        const __VLS_195 = __VLS_194({
                            message: (message),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_194));
                        __VLS_196.slots.default;
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "tool-btns" },
                        });
                        const __VLS_197 = {}.ElTooltip;
                        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
                        // @ts-ignore
                        const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
                            effect: "dark",
                            offset: (8),
                            content: (__VLS_ctx.t('qa.ask_again')),
                            placement: "top",
                        }));
                        const __VLS_199 = __VLS_198({
                            effect: "dark",
                            offset: (8),
                            content: (__VLS_ctx.t('qa.ask_again')),
                            placement: "top",
                        }, ...__VLS_functionalComponentArgsRest(__VLS_198));
                        __VLS_200.slots.default;
                        const __VLS_201 = {}.ElButton;
                        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                        // @ts-ignore
                        const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
                            ...{ 'onClick': {} },
                            ...{ class: "tool-btn" },
                            text: true,
                            disabled: (__VLS_ctx.isTyping),
                        }));
                        const __VLS_203 = __VLS_202({
                            ...{ 'onClick': {} },
                            ...{ class: "tool-btn" },
                            text: true,
                            disabled: (__VLS_ctx.isTyping),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_202));
                        let __VLS_205;
                        let __VLS_206;
                        let __VLS_207;
                        const __VLS_208 = {
                            onClick: (...[$event]) => {
                                if (!(__VLS_ctx.computedMessages.length > 0))
                                    return;
                                if (!(message.role === 'assistant' && !message.first_chat))
                                    return;
                                if (!((message?.record?.analysis_record_id === undefined ||
                                    message?.record?.analysis_record_id === null) &&
                                    (message?.record?.predict_record_id === undefined ||
                                        message?.record?.predict_record_id === null)))
                                    return;
                                if (!(!message.isTyping))
                                    return;
                                __VLS_ctx.askAgain(message);
                            }
                        };
                        __VLS_204.slots.default;
                        const __VLS_209 = {}.ElIcon;
                        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                        // @ts-ignore
                        const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
                            size: "18",
                        }));
                        const __VLS_211 = __VLS_210({
                            size: "18",
                        }, ...__VLS_functionalComponentArgsRest(__VLS_210));
                        __VLS_212.slots.default;
                        const __VLS_213 = {}.icon_replace_outlined;
                        /** @type {[typeof __VLS_components.Icon_replace_outlined, typeof __VLS_components.icon_replace_outlined, ]} */ ;
                        // @ts-ignore
                        const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({}));
                        const __VLS_215 = __VLS_214({}, ...__VLS_functionalComponentArgsRest(__VLS_214));
                        var __VLS_212;
                        var __VLS_204;
                        var __VLS_200;
                        if (message.record?.chart) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "divider" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                            const __VLS_217 = {}.ElButton;
                            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                            // @ts-ignore
                            const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
                                ...{ 'onClick': {} },
                                ...{ class: "tool-btn" },
                                text: true,
                                disabled: (__VLS_ctx.isTyping),
                            }));
                            const __VLS_219 = __VLS_218({
                                ...{ 'onClick': {} },
                                ...{ class: "tool-btn" },
                                text: true,
                                disabled: (__VLS_ctx.isTyping),
                            }, ...__VLS_functionalComponentArgsRest(__VLS_218));
                            let __VLS_221;
                            let __VLS_222;
                            let __VLS_223;
                            const __VLS_224 = {
                                onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.computedMessages.length > 0))
                                        return;
                                    if (!(message.role === 'assistant' && !message.first_chat))
                                        return;
                                    if (!((message?.record?.analysis_record_id === undefined ||
                                        message?.record?.analysis_record_id === null) &&
                                        (message?.record?.predict_record_id === undefined ||
                                            message?.record?.predict_record_id === null)))
                                        return;
                                    if (!(!message.isTyping))
                                        return;
                                    if (!(message.record?.chart))
                                        return;
                                    __VLS_ctx.clickAnalysis(message.record?.id);
                                }
                            };
                            __VLS_220.slots.default;
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "tool-btn-inner" },
                            });
                            const __VLS_225 = {}.ElIcon;
                            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                            // @ts-ignore
                            const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
                                size: "18",
                            }));
                            const __VLS_227 = __VLS_226({
                                size: "18",
                            }, ...__VLS_functionalComponentArgsRest(__VLS_226));
                            __VLS_228.slots.default;
                            const __VLS_229 = {}.icon_screen_outlined;
                            /** @type {[typeof __VLS_components.Icon_screen_outlined, typeof __VLS_components.icon_screen_outlined, ]} */ ;
                            // @ts-ignore
                            const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({}));
                            const __VLS_231 = __VLS_230({}, ...__VLS_functionalComponentArgsRest(__VLS_230));
                            var __VLS_228;
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "btn-text" },
                            });
                            (__VLS_ctx.t('chat.data_analysis'));
                            var __VLS_220;
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                            const __VLS_233 = {}.ElButton;
                            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                            // @ts-ignore
                            const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
                                ...{ 'onClick': {} },
                                ...{ class: "tool-btn" },
                                text: true,
                                disabled: (__VLS_ctx.isTyping),
                            }));
                            const __VLS_235 = __VLS_234({
                                ...{ 'onClick': {} },
                                ...{ class: "tool-btn" },
                                text: true,
                                disabled: (__VLS_ctx.isTyping),
                            }, ...__VLS_functionalComponentArgsRest(__VLS_234));
                            let __VLS_237;
                            let __VLS_238;
                            let __VLS_239;
                            const __VLS_240 = {
                                onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.computedMessages.length > 0))
                                        return;
                                    if (!(message.role === 'assistant' && !message.first_chat))
                                        return;
                                    if (!((message?.record?.analysis_record_id === undefined ||
                                        message?.record?.analysis_record_id === null) &&
                                        (message?.record?.predict_record_id === undefined ||
                                            message?.record?.predict_record_id === null)))
                                        return;
                                    if (!(!message.isTyping))
                                        return;
                                    if (!(message.record?.chart))
                                        return;
                                    __VLS_ctx.clickPredict(message.record?.id);
                                }
                            };
                            __VLS_236.slots.default;
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "tool-btn-inner" },
                            });
                            const __VLS_241 = {}.ElIcon;
                            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                            // @ts-ignore
                            const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
                                size: "18",
                            }));
                            const __VLS_243 = __VLS_242({
                                size: "18",
                            }, ...__VLS_functionalComponentArgsRest(__VLS_242));
                            __VLS_244.slots.default;
                            const __VLS_245 = {}.icon_start_outlined;
                            /** @type {[typeof __VLS_components.Icon_start_outlined, typeof __VLS_components.icon_start_outlined, ]} */ ;
                            // @ts-ignore
                            const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({}));
                            const __VLS_247 = __VLS_246({}, ...__VLS_functionalComponentArgsRest(__VLS_246));
                            var __VLS_244;
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "btn-text" },
                            });
                            (__VLS_ctx.t('chat.data_predict'));
                            var __VLS_236;
                        }
                        var __VLS_196;
                    }
                }
                {
                    const { footer: __VLS_thisSlot } = __VLS_178.slots;
                    /** @type {[typeof RecommendQuestion, ]} */ ;
                    // @ts-ignore
                    const __VLS_249 = __VLS_asFunctionalComponent(RecommendQuestion, new RecommendQuestion({
                        ...{ 'onClickQuestion': {} },
                        ...{ 'onLoadingOver': {} },
                        ...{ 'onStop': {} },
                        ref: "recommendQuestionRef",
                        currentChat: (__VLS_ctx.currentChat),
                        recordId: (message.record?.id),
                        questions: (message.recommended_question),
                        firstChat: (message.first_chat),
                        disabled: (__VLS_ctx.isTyping),
                    }));
                    const __VLS_250 = __VLS_249({
                        ...{ 'onClickQuestion': {} },
                        ...{ 'onLoadingOver': {} },
                        ...{ 'onStop': {} },
                        ref: "recommendQuestionRef",
                        currentChat: (__VLS_ctx.currentChat),
                        recordId: (message.record?.id),
                        questions: (message.recommended_question),
                        firstChat: (message.first_chat),
                        disabled: (__VLS_ctx.isTyping),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
                    let __VLS_252;
                    let __VLS_253;
                    let __VLS_254;
                    const __VLS_255 = {
                        onClickQuestion: (__VLS_ctx.quickAsk)
                    };
                    const __VLS_256 = {
                        onLoadingOver: (__VLS_ctx.loadingOver)
                    };
                    const __VLS_257 = {
                        onStop: (__VLS_ctx.onChatStop)
                    };
                    /** @type {typeof __VLS_ctx.recommendQuestionRef} */ ;
                    var __VLS_258 = {};
                    var __VLS_251;
                }
                var __VLS_178;
            }
            if (message?.record?.analysis_record_id !== undefined &&
                message?.record?.analysis_record_id !== null) {
                /** @type {[typeof AnalysisAnswer, typeof AnalysisAnswer, ]} */ ;
                // @ts-ignore
                const __VLS_260 = __VLS_asFunctionalComponent(AnalysisAnswer, new AnalysisAnswer({
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ref: "analysisAnswerRef",
                    chatList: (__VLS_ctx.chatList),
                    currentChat: (__VLS_ctx.currentChat),
                    currentChatId: (__VLS_ctx.currentChatId),
                    loading: (__VLS_ctx.isTyping),
                    message: (message),
                }));
                const __VLS_261 = __VLS_260({
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ref: "analysisAnswerRef",
                    chatList: (__VLS_ctx.chatList),
                    currentChat: (__VLS_ctx.currentChat),
                    currentChatId: (__VLS_ctx.currentChatId),
                    loading: (__VLS_ctx.isTyping),
                    message: (message),
                }, ...__VLS_functionalComponentArgsRest(__VLS_260));
                let __VLS_263;
                let __VLS_264;
                let __VLS_265;
                const __VLS_266 = {
                    onFinish: (__VLS_ctx.onAnalysisAnswerFinish)
                };
                const __VLS_267 = {
                    onError: (__VLS_ctx.onAnalysisAnswerError)
                };
                const __VLS_268 = {
                    onStop: (__VLS_ctx.onChatStop)
                };
                /** @type {typeof __VLS_ctx.analysisAnswerRef} */ ;
                var __VLS_269 = {};
                __VLS_262.slots.default;
                /** @type {[typeof ErrorInfo, ]} */ ;
                // @ts-ignore
                const __VLS_271 = __VLS_asFunctionalComponent(ErrorInfo, new ErrorInfo({
                    error: (message.record?.error),
                    ...{ class: "error-container" },
                }));
                const __VLS_272 = __VLS_271({
                    error: (message.record?.error),
                    ...{ class: "error-container" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_271));
                {
                    const { tool: __VLS_thisSlot } = __VLS_262.slots;
                    /** @type {[typeof ChatTokenTime, ]} */ ;
                    // @ts-ignore
                    const __VLS_274 = __VLS_asFunctionalComponent(ChatTokenTime, new ChatTokenTime({
                        recordId: (message.record?.id),
                        duration: (message.record?.duration),
                        totalTokens: (message.record?.total_tokens),
                    }));
                    const __VLS_275 = __VLS_274({
                        recordId: (message.record?.id),
                        duration: (message.record?.duration),
                        totalTokens: (message.record?.total_tokens),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_274));
                    if (!message.isTyping) {
                        /** @type {[typeof ChatToolBar, ]} */ ;
                        // @ts-ignore
                        const __VLS_277 = __VLS_asFunctionalComponent(ChatToolBar, new ChatToolBar({
                            message: (message),
                        }));
                        const __VLS_278 = __VLS_277({
                            message: (message),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_277));
                    }
                }
                var __VLS_262;
            }
            if (message?.record?.predict_record_id !== undefined &&
                message?.record?.predict_record_id !== null) {
                /** @type {[typeof PredictAnswer, typeof PredictAnswer, ]} */ ;
                // @ts-ignore
                const __VLS_280 = __VLS_asFunctionalComponent(PredictAnswer, new PredictAnswer({
                    ...{ 'onScrollBottom': {} },
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ref: "predictAnswerRef",
                    chatList: (__VLS_ctx.chatList),
                    currentChat: (__VLS_ctx.currentChat),
                    currentChatId: (__VLS_ctx.currentChatId),
                    recordId: (message.record?.id),
                    loading: (__VLS_ctx.isTyping),
                    message: (message),
                }));
                const __VLS_281 = __VLS_280({
                    ...{ 'onScrollBottom': {} },
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ref: "predictAnswerRef",
                    chatList: (__VLS_ctx.chatList),
                    currentChat: (__VLS_ctx.currentChat),
                    currentChatId: (__VLS_ctx.currentChatId),
                    recordId: (message.record?.id),
                    loading: (__VLS_ctx.isTyping),
                    message: (message),
                }, ...__VLS_functionalComponentArgsRest(__VLS_280));
                let __VLS_283;
                let __VLS_284;
                let __VLS_285;
                const __VLS_286 = {
                    onScrollBottom: (__VLS_ctx.scrollToBottom)
                };
                const __VLS_287 = {
                    onFinish: (__VLS_ctx.onPredictAnswerFinish)
                };
                const __VLS_288 = {
                    onError: (__VLS_ctx.onPredictAnswerError)
                };
                const __VLS_289 = {
                    onStop: (__VLS_ctx.onChatStop)
                };
                /** @type {typeof __VLS_ctx.predictAnswerRef} */ ;
                var __VLS_290 = {};
                __VLS_282.slots.default;
                /** @type {[typeof ErrorInfo, ]} */ ;
                // @ts-ignore
                const __VLS_292 = __VLS_asFunctionalComponent(ErrorInfo, new ErrorInfo({
                    error: (message.record?.error),
                    ...{ class: "error-container" },
                }));
                const __VLS_293 = __VLS_292({
                    error: (message.record?.error),
                    ...{ class: "error-container" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_292));
                {
                    const { tool: __VLS_thisSlot } = __VLS_282.slots;
                    /** @type {[typeof ChatTokenTime, ]} */ ;
                    // @ts-ignore
                    const __VLS_295 = __VLS_asFunctionalComponent(ChatTokenTime, new ChatTokenTime({
                        recordId: (message.record?.id),
                        duration: (message.record?.duration),
                        totalTokens: (message.record?.total_tokens),
                    }));
                    const __VLS_296 = __VLS_295({
                        recordId: (message.record?.id),
                        duration: (message.record?.duration),
                        totalTokens: (message.record?.total_tokens),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_295));
                    if (!message.isTyping) {
                        /** @type {[typeof ChatToolBar, ]} */ ;
                        // @ts-ignore
                        const __VLS_298 = __VLS_asFunctionalComponent(ChatToolBar, new ChatToolBar({
                            message: (message),
                        }));
                        const __VLS_299 = __VLS_298({
                            message: (message),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_298));
                    }
                }
                var __VLS_282;
            }
        }
        var __VLS_172;
    }
    var __VLS_163;
}
var __VLS_111;
if (__VLS_ctx.computedMessages.length > 0 || (!__VLS_ctx.isCompletePage && !__VLS_ctx.selectAssistantDs)) {
    const __VLS_301 = {}.ElFooter;
    /** @type {[typeof __VLS_components.ElFooter, typeof __VLS_components.elFooter, typeof __VLS_components.ElFooter, typeof __VLS_components.elFooter, ]} */ ;
    // @ts-ignore
    const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({
        ...{ class: "chat-footer" },
    }));
    const __VLS_303 = __VLS_302({
        ...{ class: "chat-footer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_302));
    __VLS_304.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.clickInput) },
        ...{ class: "input-wrapper" },
    });
    if (__VLS_ctx.isCompletePage || __VLS_ctx.selectAssistantDs) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "datasource" },
        });
        if (__VLS_ctx.currentChat.datasource && __VLS_ctx.currentChat.datasource_name) {
            (__VLS_ctx.t('qa.selected_datasource'));
            if (__VLS_ctx.currentChatEngineType) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    ...{ style: {} },
                    src: (__VLS_ctx.currentChatEngineType),
                    width: "16px",
                    height: "16px",
                    alt: "",
                });
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "name" },
            });
            (__VLS_ctx.currentChat.datasource_name);
        }
    }
    if (__VLS_ctx.computedMessages.length > 0 && __VLS_ctx.currentChat.datasource) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "quick_question" },
        });
        /** @type {[typeof QuickQuestion, typeof QuickQuestion, ]} */ ;
        // @ts-ignore
        const __VLS_305 = __VLS_asFunctionalComponent(QuickQuestion, new QuickQuestion({
            ...{ 'onQuickAsk': {} },
            ...{ 'onStop': {} },
            ...{ 'onLoadingOver': {} },
            ref: "quickQuestionRef",
            datasourceId: (__VLS_ctx.currentChat.datasource),
            currentChat: (__VLS_ctx.currentChat),
            recordId: (__VLS_ctx.computedMessages[0].record?.id),
            disabled: (__VLS_ctx.isTyping),
            firstChat: (true),
        }));
        const __VLS_306 = __VLS_305({
            ...{ 'onQuickAsk': {} },
            ...{ 'onStop': {} },
            ...{ 'onLoadingOver': {} },
            ref: "quickQuestionRef",
            datasourceId: (__VLS_ctx.currentChat.datasource),
            currentChat: (__VLS_ctx.currentChat),
            recordId: (__VLS_ctx.computedMessages[0].record?.id),
            disabled: (__VLS_ctx.isTyping),
            firstChat: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_305));
        let __VLS_308;
        let __VLS_309;
        let __VLS_310;
        const __VLS_311 = {
            onQuickAsk: (__VLS_ctx.quickAsk)
        };
        const __VLS_312 = {
            onStop: (__VLS_ctx.onChatStop)
        };
        const __VLS_313 = {
            onLoadingOver: (__VLS_ctx.loadingOver)
        };
        /** @type {typeof __VLS_ctx.quickQuestionRef} */ ;
        var __VLS_314 = {};
        var __VLS_307;
    }
    const __VLS_316 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
        ...{ 'onKeydown': {} },
        ...{ 'onKeydown': {} },
        ref: "inputRef",
        modelValue: (__VLS_ctx.inputMessage),
        disabled: (__VLS_ctx.isTyping),
        clearable: true,
        ...{ class: "input-area" },
        ...{ class: (!__VLS_ctx.isCompletePage && !__VLS_ctx.selectAssistantDs && 'is-assistant') },
        type: "textarea",
        autosize: ({ minRows: 1, maxRows: 8.583 }),
        placeholder: (__VLS_ctx.t('qa.question_placeholder')),
    }));
    const __VLS_318 = __VLS_317({
        ...{ 'onKeydown': {} },
        ...{ 'onKeydown': {} },
        ref: "inputRef",
        modelValue: (__VLS_ctx.inputMessage),
        disabled: (__VLS_ctx.isTyping),
        clearable: true,
        ...{ class: "input-area" },
        ...{ class: (!__VLS_ctx.isCompletePage && !__VLS_ctx.selectAssistantDs && 'is-assistant') },
        type: "textarea",
        autosize: ({ minRows: 1, maxRows: 8.583 }),
        placeholder: (__VLS_ctx.t('qa.question_placeholder')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_317));
    let __VLS_320;
    let __VLS_321;
    let __VLS_322;
    const __VLS_323 = {
        onKeydown: (($event) => __VLS_ctx.sendMessage(undefined, $event))
    };
    const __VLS_324 = {
        onKeydown: (__VLS_ctx.handleCtrlEnter)
    };
    /** @type {typeof __VLS_ctx.inputRef} */ ;
    var __VLS_325 = {};
    var __VLS_319;
    const __VLS_327 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_328 = __VLS_asFunctionalComponent(__VLS_327, new __VLS_327({
        ...{ 'onClick': {} },
        circle: true,
        type: "primary",
        ...{ class: "input-icon" },
        disabled: (__VLS_ctx.isTyping),
    }));
    const __VLS_329 = __VLS_328({
        ...{ 'onClick': {} },
        circle: true,
        type: "primary",
        ...{ class: "input-icon" },
        disabled: (__VLS_ctx.isTyping),
    }, ...__VLS_functionalComponentArgsRest(__VLS_328));
    let __VLS_331;
    let __VLS_332;
    let __VLS_333;
    const __VLS_334 = {
        onClick: (($event) => __VLS_ctx.sendMessage(undefined, $event))
    };
    __VLS_330.slots.default;
    const __VLS_335 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_336 = __VLS_asFunctionalComponent(__VLS_335, new __VLS_335({
        size: "16",
    }));
    const __VLS_337 = __VLS_336({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_336));
    __VLS_338.slots.default;
    const __VLS_339 = {}.icon_send_filled;
    /** @type {[typeof __VLS_components.Icon_send_filled, typeof __VLS_components.icon_send_filled, ]} */ ;
    // @ts-ignore
    const __VLS_340 = __VLS_asFunctionalComponent(__VLS_339, new __VLS_339({}));
    const __VLS_341 = __VLS_340({}, ...__VLS_functionalComponentArgsRest(__VLS_340));
    var __VLS_338;
    var __VLS_330;
    var __VLS_304;
}
var __VLS_107;
if (__VLS_ctx.isCompletePage || __VLS_ctx.selectAssistantDs) {
    /** @type {[typeof ChatCreator, ]} */ ;
    // @ts-ignore
    const __VLS_343 = __VLS_asFunctionalComponent(ChatCreator, new ChatCreator({
        ...{ 'onOnChatCreated': {} },
        ref: "chatCreatorRef",
    }));
    const __VLS_344 = __VLS_343({
        ...{ 'onOnChatCreated': {} },
        ref: "chatCreatorRef",
    }, ...__VLS_functionalComponentArgsRest(__VLS_343));
    let __VLS_346;
    let __VLS_347;
    let __VLS_348;
    const __VLS_349 = {
        onOnChatCreated: (__VLS_ctx.onChatCreatedQuick)
    };
    /** @type {typeof __VLS_ctx.chatCreatorRef} */ ;
    var __VLS_350 = {};
    var __VLS_345;
}
/** @type {[typeof ChatCreator, ]} */ ;
// @ts-ignore
const __VLS_352 = __VLS_asFunctionalComponent(ChatCreator, new ChatCreator({
    ...{ 'onOnChatCreated': {} },
    ref: "hiddenChatCreatorRef",
    hidden: true,
}));
const __VLS_353 = __VLS_352({
    ...{ 'onOnChatCreated': {} },
    ref: "hiddenChatCreatorRef",
    hidden: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_352));
let __VLS_355;
let __VLS_356;
let __VLS_357;
const __VLS_358 = {
    onOnChatCreated: (__VLS_ctx.onChatCreatedQuick)
};
/** @type {typeof __VLS_ctx.hiddenChatCreatorRef} */ ;
var __VLS_359 = {};
var __VLS_354;
var __VLS_15;
/** @type {__VLS_StyleScopedClasses['show-history_icon']} */ ;
/** @type {__VLS_StyleScopedClasses['embedded-history-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-container-left']} */ ;
/** @type {__VLS_StyleScopedClasses['embedded-history-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden-sidebar-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant-popover-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['embedded-history-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-record-list']} */ ;
/** @type {__VLS_StyleScopedClasses['hide-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant-chat-main']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-content-block']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-content']} */ ;
/** @type {__VLS_StyleScopedClasses['greeting']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['i-am']} */ ;
/** @type {__VLS_StyleScopedClasses['i-can']} */ ;
/** @type {__VLS_StyleScopedClasses['greeting-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-content-block']} */ ;
/** @type {__VLS_StyleScopedClasses['no-horizontal']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['pad16']} */ ;
/** @type {__VLS_StyleScopedClasses['no-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['error-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btns']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
/** @type {__VLS_StyleScopedClasses['error-container']} */ ;
/** @type {__VLS_StyleScopedClasses['error-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['quick_question']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon']} */ ;
// @ts-ignore
var __VLS_65 = __VLS_64, __VLS_83 = __VLS_82, __VLS_169 = __VLS_168, __VLS_187 = __VLS_186, __VLS_259 = __VLS_258, __VLS_270 = __VLS_269, __VLS_291 = __VLS_290, __VLS_315 = __VLS_314, __VLS_326 = __VLS_325, __VLS_351 = __VLS_350, __VLS_360 = __VLS_359;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChatRow: ChatRow,
            ChartAnswer: ChartAnswer,
            AnalysisAnswer: AnalysisAnswer,
            PredictAnswer: PredictAnswer,
            UserChat: UserChat,
            RecommendQuestion: RecommendQuestion,
            ChatListContainer: ChatListContainer,
            ChatCreator: ChatCreator,
            ChatTokenTime: ChatTokenTime,
            ErrorInfo: ErrorInfo,
            ChatToolBar: ChatToolBar,
            custom_small: custom_small,
            LOGO_fold: LOGO_fold,
            icon_new_chat_outlined: icon_new_chat_outlined,
            icon_sidebar_outlined: icon_sidebar_outlined,
            icon_replace_outlined: icon_replace_outlined,
            icon_screen_outlined: icon_screen_outlined,
            icon_start_outlined: icon_start_outlined,
            logo_fold: logo_fold,
            icon_send_filled: icon_send_filled,
            QuickQuestion: QuickQuestion,
            floatPopoverRef: floatPopoverRef,
            floatPopoverVisible: floatPopoverVisible,
            assistantStore: assistantStore,
            defaultFloatPopoverStyle: defaultFloatPopoverStyle,
            isCompletePage: isCompletePage,
            embeddedHistoryHidden: embeddedHistoryHidden,
            selectAssistantDs: selectAssistantDs,
            customName: customName,
            t: t,
            isPhone: isPhone,
            inputMessage: inputMessage,
            chatListRef: chatListRef,
            innerRef: innerRef,
            chatCreatorRef: chatCreatorRef,
            scrollToBottom: scrollToBottom,
            loading: loading,
            chatList: chatList,
            appearanceStore: appearanceStore,
            currentChatId: currentChatId,
            currentChat: currentChat,
            isTyping: isTyping,
            loginBg: loginBg,
            computedMessages: computedMessages,
            goEmpty: goEmpty,
            handleScroll: handleScroll,
            createNewChatSimple: createNewChatSimple,
            onClickHistory: onClickHistory,
            currentChatEngineType: currentChatEngineType,
            onChatDeleted: onChatDeleted,
            onChatRenamed: onChatRenamed,
            chatListSideBarShow: chatListSideBarShow,
            hideSideBar: hideSideBar,
            showSideBar: showSideBar,
            onChatCreatedQuick: onChatCreatedQuick,
            recommendQuestionRef: recommendQuestionRef,
            quickQuestionRef: quickQuestionRef,
            onChatCreated: onChatCreated,
            quickAsk: quickAsk,
            chartAnswerRef: chartAnswerRef,
            onChartAnswerFinish: onChartAnswerFinish,
            loadingOver: loadingOver,
            onChartAnswerError: onChartAnswerError,
            onChatStop: onChatStop,
            sendMessage: sendMessage,
            analysisAnswerRef: analysisAnswerRef,
            onAnalysisAnswerFinish: onAnalysisAnswerFinish,
            onAnalysisAnswerError: onAnalysisAnswerError,
            askAgain: askAgain,
            clickAnalysis: clickAnalysis,
            predictAnswerRef: predictAnswerRef,
            onPredictAnswerFinish: onPredictAnswerFinish,
            onPredictAnswerError: onPredictAnswerError,
            clickPredict: clickPredict,
            handleCtrlEnter: handleCtrlEnter,
            inputRef: inputRef,
            clickInput: clickInput,
            showFloatPopover: showFloatPopover,
            hiddenChatCreatorRef: hiddenChatCreatorRef,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
