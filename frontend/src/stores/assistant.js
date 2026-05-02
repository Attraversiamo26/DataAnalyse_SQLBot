import { defineStore } from 'pinia';
import { store } from './index';
import { chatApi } from '@/api/chat';
import { useCache } from '@/utils/useCache';
const { wsCache } = useCache();
const flagKey = 'sqlbit-assistant-flag';
export const AssistantStore = defineStore('assistant', {
    state: () => {
        return {
            id: '',
            token: '',
            assistant: false,
            flag: 0,
            type: 0,
            certificate: '',
            online: false,
            pageEmbedded: false,
            history: true,
            hostOrigin: '',
            autoDs: false,
            requestPromiseMap: new Map(),
            peddingStatus: 0,
            certificateTime: 0,
        };
    },
    getters: {
        getCertificate() {
            return this.certificate;
        },
        getId() {
            return this.id;
        },
        getToken() {
            return this.token;
        },
        getAssistant() {
            return this.assistant;
        },
        getFlag() {
            return this.flag;
        },
        getType() {
            return this.type;
        },
        getOnline() {
            return this.online;
        },
        getHistory() {
            return this.history;
        },
        getPageEmbedded() {
            return this.pageEmbedded || false;
        },
        getEmbedded() {
            return this.assistant && this.type === 4;
        },
        getHostOrigin() {
            return this.hostOrigin;
        },
        getAutoDs() {
            return !!this.autoDs;
        },
    },
    actions: {
        refreshCertificate(requestUrl) {
            /* if (+new Date() < this.certificateTime + 5000) {
              return
            } */
            const timeout = 30000;
            let peddingList = this.requestPromiseMap.get(this.id);
            if (!peddingList) {
                this.requestPromiseMap.set(this.id, []);
                peddingList = this.requestPromiseMap.get(this.id);
            }
            if (this.peddingStatus === 2) {
                if (peddingList?.length) {
                    return;
                }
                else {
                    this.peddingStatus = 0;
                }
            }
            return new Promise((resolve, reject) => {
                const currentRequestId = `${this.id}|${requestUrl}|${+new Date()}`;
                const timeoutId = setTimeout(() => {
                    console.error(`Request ${currentRequestId}[${requestUrl}] timed out after ${timeout}ms`);
                    resolve(null);
                    removeRequest(currentRequestId, peddingList);
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    // reject(new Error(`Request ${this.id} timed out after ${timeout}ms`))
                }, timeout);
                const cleanupAndResolve = (value) => {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    resolve(value);
                    removeRequest(currentRequestId, peddingList);
                };
                const cleanupAndReject = (reason) => {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    removeRequest(currentRequestId, peddingList);
                    reject(reason);
                };
                addRequest(currentRequestId, cleanupAndResolve, cleanupAndReject, peddingList);
                if (this.peddingStatus !== 1) {
                    this.peddingStatus = 1;
                    const readyData = {
                        eventName: this.pageEmbedded ? 'sqlbot_embedded_event' : 'sqlbot_assistant_event',
                        busi: 'ready',
                        ready: true,
                        messageId: this.id,
                    };
                    window.parent.postMessage(readyData, '*');
                }
            });
        },
        resolveCertificate(data) {
            const peddingRequestList = this.requestPromiseMap.get(this.id);
            if (peddingRequestList?.length) {
                let len = peddingRequestList?.length;
                while (len--) {
                    const peddingRequest = peddingRequestList[len];
                    peddingRequest.resolve(data);
                }
            }
            this.peddingStatus = 2;
        },
        setId(id) {
            this.id = id;
        },
        setCertificate(certificate) {
            this.certificate = certificate;
            this.certificateTime = +new Date();
        },
        setType(type) {
            this.type = type;
        },
        setToken(token) {
            this.token = token;
        },
        setAssistant(assistant) {
            this.assistant = assistant;
        },
        setFlag(flag) {
            if (wsCache.get(flagKey)) {
                this.flag = wsCache.get(flagKey);
            }
            else {
                this.flag = flag;
                wsCache.set(flagKey, flag);
            }
        },
        setPageEmbedded(embedded) {
            this.pageEmbedded = !!embedded;
        },
        setOnline(online) {
            this.online = !!online;
        },
        setHistory(history) {
            this.history = history ?? true;
        },
        setHostOrigin(origin) {
            this.hostOrigin = origin;
        },
        setAutoDs(autoDs) {
            this.autoDs = !!autoDs;
        },
        async setChat() {
            if (!this.assistant) {
                return null;
            }
            const res = await chatApi.startAssistantChat();
            const chat = chatApi.toChatInfo(res);
            return chat;
        },
        clear() {
            wsCache.delete(flagKey);
            this.$reset();
        },
    },
});
const removeRequest = (requestId, peddingList) => {
    if (!peddingList)
        return;
    let len = peddingList.length;
    while (len--) {
        const peddingRequest = peddingList[len];
        if (peddingRequest?.requestId === requestId) {
            peddingList.splice(len, 1);
        }
    }
};
const addRequest = (requestId, resolve, reject, peddingList) => {
    const currentPeddingRequest = {
        requestId,
        resolve: (value) => {
            resolve(value);
        },
        reject: (reason) => {
            reject(reason);
        },
    };
    peddingList?.push(currentPeddingRequest);
};
export const useAssistantStore = () => {
    return AssistantStore(store);
};
