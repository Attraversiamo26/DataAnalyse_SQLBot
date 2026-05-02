import { loadScript } from '@/utils/RemoteJs';
import { propTypes } from '@/utils/propTypes';
import { queryClientInfo } from './platformUtils';
import { getSQLBotAddr } from '@/utils/utils';
import { ref } from 'vue';
const origin = ref(9);
const props = defineProps({
    isBind: propTypes.bool.def(false),
});
const remoteJsUrl = 'https://lf-package-us.larksuitecdn.com/obj/lark-static-us/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.3.js';
const jsId = 'de-larksuite-qr-id';
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
    result.state = 'fit2cloud-larksuite-qr';
    result.redirect_uri = data.redirect_uri || getSQLBotAddr();
    if (props.isBind) {
        result.state += '_de_bind';
    }
    return result;
};
const loadQr = (CLIENT_ID, STATE, REDIRECT_URI) => {
    let url = `https://passport.larksuite.com/suite/passport/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&state=${STATE}&redirect_uri=${REDIRECT_URI}`;
    // eslint-disable-next-line
    // @ts-ignore
    const QRLoginObj = window['QRLogin']({
        id: 'de2-larksuite-qr',
        goto: url,
        style: 'border:none;background-color:#FFFFFF;width: 266px;height: 266px;',
    });
    const handleMessage = function (event) {
        const origin = event.origin;
        if (QRLoginObj.matchOrigin(origin) && QRLoginObj.matchData(event.data)) {
            const loginTmpCode = event.data.tmp_code;
            url += '&tmp_code=' + loginTmpCode;
            window.location.href = url;
        }
    };
    if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', handleMessage, false);
        // eslint-disable-next-line
        // @ts-ignore
    }
    else if (typeof window['attachEvent'] != 'undefined') {
        // eslint-disable-next-line
        // @ts-ignore
        window['attachEvent']('onmessage', handleMessage);
    }
};
init();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    id: "de2-larksuite-qr",
    ...{ class: ({ 'de2-larksuite-qr': !__VLS_ctx.isBind }) },
});
/** @type {__VLS_StyleScopedClasses['de2-larksuite-qr']} */ ;
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
