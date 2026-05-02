import { onBeforeMount, nextTick, onBeforeUnmount, ref, onMounted, reactive, computed } from 'vue';
import ChatComponent from '@/views/chat/index.vue';
import { request } from '@/utils/request';
import LOGO from '@/assets/svg/logo-custom_small.svg';
import icon_new_chat_outlined from '@/assets/svg/icon_new_chat_outlined.svg';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
import { useRoute } from 'vue-router';
import { assistantApi } from '@/api/assistant';
import { useAssistantStore } from '@/stores/assistant';
import { setCurrentColor } from '@/utils/utils';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const assistantStore = useAssistantStore();
const appearanceStore = useAppearanceStoreWithOut();
const route = useRoute();
const chatRef = ref();
const embeddedHistoryHidden = computed(() => assistantStore.getAssistant && !assistantStore.getHistory);
const createChat = () => {
    chatRef.value?.createNewChat();
};
const openHistory = () => {
    chatRef.value?.showFloatPopover();
};
const validator = ref({
    id: '',
    valid: false,
    id_match: false,
    token: '',
});
const appName = ref('');
const loading = ref(true);
const eventName = 'sqlbot_assistant_event';
const communicationCb = async (event) => {
    if (event.data?.eventName === eventName) {
        if (event.data?.messageId !== route.query.id) {
            return;
        }
        if (event.data?.busi == 'certificate') {
            const certificate = event.data['certificate'];
            assistantStore.setType(1);
            assistantStore.setCertificate(certificate);
            assistantStore.resolveCertificate(certificate);
        }
        if (event.data?.hostOrigin) {
            assistantStore.setHostOrigin(event.data?.hostOrigin);
        }
        if (event.data?.busi == 'setOnline') {
            setFormatOnline(event.data.online);
        }
        if (event.data?.busi == 'setHistory') {
            assistantStore.setHistory(event.data.show ?? true);
        }
        if (event.data?.busi == 'createConversation') {
            createChat();
        }
    }
};
const setFormatOnline = (text) => {
    if (text === null || typeof text === 'undefined') {
        assistantStore.setOnline(false);
        return;
    }
    if (typeof text === 'boolean') {
        assistantStore.setOnline(text);
        return;
    }
    if (typeof text === 'string') {
        assistantStore.setOnline(text.toLowerCase() === 'true');
        return;
    }
    assistantStore.setOnline(false);
};
onMounted(() => {
    const style = document.createElement('style');
    style.innerHTML = `.ed-overlay-dialog {
        margin-top: 50px;
      }
      .ed-drawer {
        margin-top: 50px;
        height: calc(100vh - 50px) !important;
      }`;
    document.querySelector('head')?.appendChild(style);
});
const customSet = reactive({
    name: '',
    welcome: t('embedded.i_am_sqlbot'),
    welcome_desc: t('embedded.data_analysis_now'),
    theme: '#1CBA90',
    header_font_color: '#1F2329',
});
const logo = ref();
const basePath = import.meta.env.VITE_API_BASE_URL;
const baseUrl = basePath + '/system/assistant/picture/';
const setPageCustomColor = (val) => {
    const ele = document.querySelector('body');
    setCurrentColor(val, ele);
};
const setPageHeaderFontColor = (val) => {
    const ele = document.querySelector('body');
    ele.style.setProperty('--ed-text-color-primary', val);
};
onBeforeMount(async () => {
    const assistantId = route.query.id;
    if (!assistantId) {
        ElMessage.error('Miss assistant id, please check assistant url');
        return;
    }
    const online = route.query.online;
    setFormatOnline(online);
    let userFlag = route.query.userFlag;
    if (userFlag && userFlag === '1') {
        userFlag = '100001';
    }
    const history = route.query.history !== 'false';
    assistantStore.setHistory(history);
    const now = Date.now();
    assistantStore.setFlag(now);
    assistantStore.setId(assistantId?.toString() || '');
    const param = {
        id: assistantId,
        virtual: userFlag || assistantStore.getFlag,
        online,
    };
    validator.value = await assistantApi.validate(param);
    assistantStore.setToken(validator.value.token);
    assistantStore.setAssistant(true);
    loading.value = false;
    window.addEventListener('message', communicationCb);
    const readyData = {
        eventName: 'sqlbot_assistant_event',
        busi: 'ready',
        ready: true,
        messageId: assistantId,
    };
    window.parent.postMessage(readyData, '*');
    request.get(`/system/assistant/${assistantId}`).then((res) => {
        if (res.name) {
            appName.value = res.name;
        }
        if (res?.configuration) {
            const rawData = JSON.parse(res?.configuration);
            assistantStore.setAutoDs(rawData?.auto_ds);
            if (rawData.logo) {
                logo.value = baseUrl + rawData.logo;
            }
            for (const key in customSet) {
                if (Object.prototype.hasOwnProperty.call(customSet, key) &&
                    ![null, undefined].includes(rawData[key])) {
                    customSet[key] = rawData[key];
                }
            }
            if (!rawData.theme) {
                const { customColor, themeColor } = appearanceStore;
                const currentColor = themeColor === 'custom' && customColor
                    ? customColor
                    : themeColor === 'blue'
                        ? '#3370ff'
                        : '#1CBA90';
                customSet.theme = currentColor || customSet.theme;
            }
            nextTick(() => {
                setPageCustomColor(customSet.theme);
                setPageHeaderFontColor(customSet.header_font_color);
            });
        }
    });
});
onBeforeUnmount(() => {
    window.removeEventListener('message', communicationCb);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-assistant-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header" },
    ...{ style: ({ color: __VLS_ctx.customSet.header_font_color }) },
});
if (!__VLS_ctx.embeddedHistoryHidden) {
    const __VLS_0 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        size: "20",
    }));
    const __VLS_2 = __VLS_1({
        size: "20",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
if (!__VLS_ctx.logo) {
    const __VLS_4 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ class: "logo" },
        size: "30",
    }));
    const __VLS_6 = __VLS_5({
        ...{ class: "logo" },
        size: "30",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.LOGO;
    /** @type {[typeof __VLS_components.LOGO, typeof __VLS_components.LOGO, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.logo),
        ...{ class: "logo" },
        width: "30px",
        height: "30px",
        alt: "",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    title: (__VLS_ctx.appName || __VLS_ctx.$t('embedded.intelligent_customer_service')),
    ...{ class: "title ellipsis" },
});
(__VLS_ctx.appName || __VLS_ctx.$t('embedded.intelligent_customer_service'));
const __VLS_12 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    effect: "dark",
    content: (__VLS_ctx.$t('embedded.new_conversation')),
    placement: "top",
}));
const __VLS_14 = __VLS_13({
    effect: "dark",
    content: (__VLS_ctx.$t('embedded.new_conversation')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    ...{ class: "new-chat" },
    size: "20",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    ...{ class: "new-chat" },
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.createChat)
};
__VLS_19.slots.default;
const __VLS_24 = {}.icon_new_chat_outlined;
/** @type {[typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_19;
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-chat-container" },
});
if (!__VLS_ctx.loading) {
    /** @type {[typeof ChatComponent, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(ChatComponent, new ChatComponent({
        ref: "chatRef",
        welcome: (__VLS_ctx.customSet.welcome),
        welcomeDesc: (__VLS_ctx.customSet.welcome_desc),
        logoAssistant: (__VLS_ctx.logo),
    }));
    const __VLS_29 = __VLS_28({
        ref: "chatRef",
        welcome: (__VLS_ctx.customSet.welcome),
        welcomeDesc: (__VLS_ctx.customSet.welcome_desc),
        logoAssistant: (__VLS_ctx.logo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    /** @type {typeof __VLS_ctx.chatRef} */ ;
    var __VLS_31 = {};
    var __VLS_30;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.openHistory) },
    ...{ class: "drawer-assistant" },
});
/** @type {__VLS_StyleScopedClasses['sqlbot-assistant-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['new-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['sqlbot-chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-assistant']} */ ;
// @ts-ignore
var __VLS_32 = __VLS_31;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChatComponent: ChatComponent,
            LOGO: LOGO,
            icon_new_chat_outlined: icon_new_chat_outlined,
            chatRef: chatRef,
            embeddedHistoryHidden: embeddedHistoryHidden,
            createChat: createChat,
            openHistory: openHistory,
            appName: appName,
            loading: loading,
            customSet: customSet,
            logo: logo,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
