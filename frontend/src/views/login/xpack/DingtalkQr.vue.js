import { loadScript } from '@/utils/RemoteJs';
import { propTypes } from '@/utils/propTypes';
import { getSQLBotAddr } from '@/utils/utils';
import { ref } from 'vue';
import { queryClientInfo } from './platformUtils';
const props = defineProps({
    isBind: propTypes.bool.def(false),
});
const origin = ref(7);
const remoteJsUrl = 'https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js';
const jsId = 'de-dingtalk-qr-id';
const init = () => {
    loadScript(remoteJsUrl, jsId).then(() => {
        queryClientInfo(origin.value).then((res) => {
            const data = formatQrResult(res);
            loadQr(data.client_id, data.state, data.redirect_uri);
        });
    });
};
const formatQrResult = (data) => {
    const result = { client_id: null, state: null, redirect_uri: null };
    result.client_id = data.client_id;
    result.state = 'fit2cloud-dingtalk-qr';
    result.redirect_uri = data.redirect_uri || getSQLBotAddr();
    if (props.isBind) {
        result.state += '_de_bind';
    }
    return result;
};
const loadQr = (client_id, STATE, REDIRECT_URI) => {
    // eslint-disable-next-line
    // @ts-ignore
    window.DTFrameLogin({
        id: 'de2-dingtalk-qr',
    }, {
        redirect_uri: encodeURIComponent(REDIRECT_URI),
        client_id: client_id,
        scope: 'openid',
        response_type: 'code',
        state: STATE,
        prompt: 'consent',
    }, (loginResult) => {
        const { redirectUrl, authCode } = loginResult;
        // 这里可以直接进行重定向
        window.location.href = redirectUrl;
        // 也可以在不跳转页面的情况下，使用code进行授权
        console.log(authCode);
    }, (errorMsg) => {
        // 这里一般需要展示登录失败的具体原因,可以使用toast等轻提示
        console.error(`errorMsg of errorCbk: ${errorMsg}`);
    });
};
init();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dingtalk-qr-div" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    id: "de2-dingtalk-qr",
    ...{ class: ({ 'de2-dingtalk-qr': !__VLS_ctx.isBind }) },
});
/** @type {__VLS_StyleScopedClasses['dingtalk-qr-div']} */ ;
/** @type {__VLS_StyleScopedClasses['de2-dingtalk-qr']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
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
