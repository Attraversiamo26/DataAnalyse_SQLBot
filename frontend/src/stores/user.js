import { defineStore } from 'pinia';
// import { ref } from 'vue'
import { AuthApi } from '@/api/login';
import { useCache } from '@/utils/useCache';
import { i18n } from '@/i18n';
import { store } from './index';
import { getCurrentRouter, getQueryString, getSQLBotAddr, isPlatform } from '@/utils/utils';
const { wsCache } = useCache();
export const UserStore = defineStore('user', {
    state: () => {
        return {
            token: '',
            uid: '',
            account: '',
            name: '',
            oid: '',
            language: 'zh-CN',
            exp: 0,
            time: 0,
            weight: 0,
            origin: 0,
            platformInfo: null,
        };
    },
    getters: {
        getToken() {
            return this.token;
        },
        getUid() {
            return this.uid;
        },
        getAccount() {
            return this.account;
        },
        getName() {
            return this.name;
        },
        getOid() {
            return this.oid;
        },
        getLanguage() {
            return this.language;
        },
        getExp() {
            return this.exp;
        },
        getTime() {
            return this.time;
        },
        isAdmin() {
            return this.uid === '1';
        },
        getWeight() {
            return this.weight;
        },
        getOrigin() {
            return this.origin;
        },
        isSpaceAdmin() {
            return this.uid === '1' || !!this.weight;
        },
        getPlatformInfo() {
            return this.platformInfo;
        },
    },
    actions: {
        async login(formData) {
            const res = await AuthApi.login(formData);
            this.setToken(res.access_token);
        },
        async logout() {
            let param = { token: this.token };
            if (wsCache.get('user.platformInfo')) {
                param = { ...param, ...wsCache.get('user.platformInfo') };
            }
            const res = await AuthApi.logout(param);
            this.clear();
            if (res) {
                window.location.href = res;
                window.open(res, '_self');
                return res;
            }
            if ((getQueryString('code') && getQueryString('state')?.includes('oauth2_state')) ||
                isPlatform()) {
                const currentPath = getCurrentRouter();
                let logout_url = getSQLBotAddr() + '#/login';
                if (currentPath) {
                    logout_url += `?redirect=${currentPath}`;
                }
                window.location.href = logout_url;
                window.open(res, logout_url);
                return logout_url;
            }
            return null;
        },
        async info() {
            const res = await AuthApi.info();
            const res_data = res || {};
            const keys = [
                'uid',
                'account',
                'name',
                'oid',
                'language',
                'exp',
                'time',
                'weight',
                'origin',
            ];
            keys.forEach((key) => {
                const dkey = key === 'uid' ? 'id' : key;
                const value = res_data[dkey];
                if (key === 'exp' || key === 'time' || key === 'weight' || key === 'origin') {
                    this[key] = Number(value);
                }
                else {
                    this[key] = String(value);
                }
                wsCache.set('user.' + key, value);
            });
            this.setLanguage(this.language);
            this.platformInfo = wsCache.get('user.platformInfo');
        },
        setToken(token) {
            wsCache.set('user.token', token);
            this.token = token;
        },
        setExp(exp) {
            wsCache.set('user.exp', exp);
            this.exp = exp;
        },
        setTime(time) {
            wsCache.set('user.time', time);
            this.time = time;
        },
        setUid(uid) {
            wsCache.set('user.uid', uid);
            this.uid = uid;
        },
        setAccount(account) {
            wsCache.set('user.account', account);
            this.account = account;
        },
        setName(name) {
            wsCache.set('user.name', name);
            this.name = name;
        },
        setOid(oid) {
            wsCache.set('user.oid', oid);
            this.oid = oid;
        },
        setLanguage(language) {
            if (!language) {
                language = 'zh-CN';
            }
            else if (language === 'zh_CN') {
                language = 'zh-CN';
            }
            else if (language === 'ko_KR') {
                language = 'ko-KR';
            }
            wsCache.set('user.language', language);
            this.language = language;
            i18n.global.locale.value = language;
            /* const { locale } = useI18n()
            locale.value = language */
            // locale.setLang(language)
        },
        setWeight(weight) {
            wsCache.set('user.weight', weight);
            this.weight = weight;
        },
        setOrigin(origin) {
            wsCache.set('user.origin', origin);
            this.origin = origin;
        },
        setPlatformInfo(info) {
            wsCache.set('user.platformInfo', info);
            this.platformInfo = info;
        },
        clear() {
            const keys = [
                'token',
                'uid',
                'account',
                'name',
                'oid',
                'language',
                'exp',
                'time',
                'weight',
                'origin',
                'platformInfo',
            ];
            keys.forEach((key) => wsCache.delete('user.' + key));
            this.$reset();
        },
    },
});
export const useUserStore = () => {
    return UserStore(store);
};
