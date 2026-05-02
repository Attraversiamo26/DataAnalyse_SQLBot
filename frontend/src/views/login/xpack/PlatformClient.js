import { loadScript } from '@/utils/RemoteJs';
import { getCurrentRouter, getQueryString } from '@/utils/utils';
import { ElMessage, ElMessageBox } from 'element-plus-secondary';
// import { useI18n } from 'vue-i18n'
import { i18n } from '@/i18n';
import { queryClientInfo } from './platformUtils';
const t = i18n.global.t;
const flagArray = ['dingtalk', 'lark', 'larksuite'];
const urlArray = [
    'https://g.alicdn.com/dingding/dingtalk-jsapi/3.1.0/dingtalk.open.js',
    'https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.26.js',
    'https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.16.js',
];
export const loadClient = (category) => {
    const type = getQueryString('client');
    const corpid = getQueryString('corpid');
    if (type && !category[type]) {
        ElMessageBox.confirm(t('login.platform_disable', [t(`user.${type}`)]), {
            confirmButtonType: 'danger',
            type: 'warning',
            showCancelButton: false,
            confirmButtonText: t('common.refresh'),
            cancelButtonText: t('dataset.cancel'),
            autofocus: false,
            showClose: false,
        })
            .then(() => {
            window.location.reload();
        })
            .catch(() => { });
        return false;
    }
    if (!type || !flagArray.includes(type) || !category[type]) {
        return false;
    }
    const index = flagArray.indexOf(type);
    const jsId = `fit2cloud-dataease-v2-platform-client-${type}`;
    const awaitMethod = loadScript(urlArray[index], jsId);
    awaitMethod
        .then(() => {
        if (index === 0) {
            dingtalkClientRequest(corpid);
        }
        if (index === 1) {
            larkClientRequest();
        }
        if (index === 2) {
            larksuiteClientRequest();
        }
    })
        .catch(() => {
        ElMessage.error('加载失败');
    });
    return true;
};
const dingtalkClientRequest = async (id) => {
    if (!id) {
        const clientInfoRes = await queryClientInfo(7);
        id = clientInfoRes['corpid'];
    }
    const dd = window['dd'];
    dd.ready(function () {
        dd.runtime.permission.requestAuthCode({
            corpId: id,
            onSuccess: function (info) {
                const code = info.code;
                const state = `fit2cloud-dingtalk-client`;
                toUrl(`?code=${code}&state=${state}`);
            },
            onFail: function (err) {
                ElMessage.error(err);
            },
        });
    });
};
const larkClientRequest = async () => {
    if (!window['tt']) {
        ElMessage.error('load remote lark js error');
        return;
    }
    const res = await queryClientInfo(8);
    if (!res?.client_id) {
        ElMessage.error('get client_id error');
        return;
    }
    const clientId = res.client_id;
    const callRequestAuthCode = () => {
        window['tt'].requestAuthCode({
            appId: clientId,
            success: (res) => {
                const { code } = res;
                const state = `fit2cloud-lark-client`;
                toUrl(`?code=${code}&state=${state}`);
            },
            fail: (error) => {
                const { errno, errString } = error;
                ElMessage.error(`error code: ${errno}, error msg: ${errString}`);
            },
        });
    };
    if (window['tt'].requestAccess) {
        window['tt'].requestAccess({
            appID: clientId,
            scopeList: [],
            success: (res) => {
                const { code } = res;
                const state = `fit2cloud-lark-client`;
                toUrl(`?code=${code}&state=${state}`);
            },
            fail: (error) => {
                const { errno, errString } = error;
                if (errno === 103) {
                    callRequestAuthCode();
                }
                else {
                    ElMessage.error(`error code: ${errno}, error msg: ${errString}`);
                }
            },
        });
    }
    else {
        callRequestAuthCode();
    }
};
const larksuiteClientRequest = async () => {
    if (!window['tt'] || !window['h5sdk']) {
        ElMessage.error('load remote lark js error');
        return;
    }
    const res = await queryClientInfo(9);
    if (!res?.client_id) {
        ElMessage.error('get client_id error');
        return;
    }
    const clientId = res.client_id;
    window['h5sdk'].ready(() => {
        window['tt'].requestAuthCode({
            appId: clientId,
            success(res) {
                const code = res?.code || res;
                const state = `fit2cloud-larksuite-client`;
                toUrl(`?code=${code}&state=${state}`);
            },
            fail(error) {
                const { errno, errString } = error;
                ElMessage.error(`error code: ${errno}, error msg: ${errString}`);
            },
        });
    });
};
const toUrl = (url) => {
    const { origin, pathname } = window.location;
    const redirect = getCurrentRouter();
    window.location.href =
        origin + pathname + url + (redirect?.includes('chatPreview') ? `#${redirect}` : '');
};
export const origin_mapping = {
    1: 'cas',
    2: 'oidc',
    3: 'ldap',
    4: 'oauth2',
    5: 'saml2',
    6: 'wecom',
    7: 'dingtalk',
    8: 'lark',
    9: 'larksuite',
};
