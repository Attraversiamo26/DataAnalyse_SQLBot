import { loadScript } from '@/utils/RemoteJs';
import { propTypes } from '@/utils/propTypes';
import { onUnmounted, ref } from 'vue';
import { getLocale, getSQLBotAddr } from '@/utils/utils';
import { queryClientInfo } from './platformUtils';
const isWecomClient = ref(false);
const props = defineProps({
    isBind: propTypes.bool.def(false),
});
const origin = ref(6);
// const emit = defineEmits(['finish'])
let wwLogin = null;
const remoteJsUrl = 'https://wwcdn.weixin.qq.com/node/open/js/wecom-jssdk-2.3.3.js';
const jsId = 'sqlbot-wecom-qr-id';
const init = () => {
    loadScript(remoteJsUrl, jsId).then(() => {
        queryClientInfo(origin.value).then((res) => {
            const data = formatQrResult(res);
            loadQr(data.corp_id, data.agent_id, data.state, data.redirect_uri);
        });
    });
};
const formatQrResult = (data) => {
    const result = {
        corp_id: null,
        agent_id: null,
        state: null,
        redirect_uri: null,
    };
    result.corp_id = data.corpid;
    result.agent_id = data.agent_id;
    result.state = data.state || 'fit2cloud-wecom-qr';
    result.redirect_uri = data.redirect_uri || getSQLBotAddr();
    if (props.isBind) {
        result.state += '_sqlbot_bind';
    }
    return result;
};
const loadQr = (CORP_ID, AGENT_ID, STATE, REDIRECT_URI) => {
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line no-undef
    wwLogin = ww.createWWLoginPanel({
        el: '#sqlbot-wecom-qr',
        params: {
            login_type: 'CorpApp',
            appid: CORP_ID,
            agentid: AGENT_ID,
            redirect_uri: REDIRECT_URI,
            state: STATE,
            redirect_type: 'callback',
            panel_size: 'small',
            lang: getLocale() === 'en' ? 'en' : 'zh',
        },
        onCheckWeComLogin({ isWeComLogin }) {
            isWecomClient.value = isWeComLogin;
            console.log(isWeComLogin);
        },
        onLoginSuccess({ code }) {
            window.location.href = REDIRECT_URI + `?code=${code}&state=${STATE}`;
        },
        onLoginFail(err) {
            console.log(err);
        },
    });
};
onUnmounted(() => {
    if (wwLogin) {
        wwLogin.unmount();
    }
});
init();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-wecom-qr-div" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    id: "sqlbot-wecom-qr",
    ...{ class: (__VLS_ctx.isWecomClient ? 'sqlbot-wecom-qr-client' : 'sqlbot-wecom-qr') },
});
/** @type {__VLS_StyleScopedClasses['sqlbot-wecom-qr-div']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isWecomClient: isWecomClient,
        };
    },
    props: {
        isBind: propTypes.bool.def(false),
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        isBind: propTypes.bool.def(false),
    },
});
; /* PartiallyEnd: #4569/main.vue */
