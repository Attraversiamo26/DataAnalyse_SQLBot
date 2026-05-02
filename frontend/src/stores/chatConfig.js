import { defineStore } from 'pinia';
import { store } from '@/stores/index.ts';
import { request } from '@/utils/request.ts';
import { formatArg } from '@/utils/utils.ts';
export const chatConfigStore = defineStore('chatConfigStore', {
    state: () => {
        return {
            expand_thinking_block: false,
            limit_rows: true,
        };
    },
    getters: {
        getExpandThinkingBlock() {
            return this.expand_thinking_block;
        },
        getLimitRows() {
            return this.limit_rows;
        },
    },
    actions: {
        fetchGlobalConfig() {
            request
                .get('/system/parameter/chat', {
                requestOptions: {
                    silent: true, // 静默错误处理，避免影响应用加载
                },
            })
                .then((res) => {
                if (res) {
                    res.forEach((item) => {
                        if (item.pkey === 'chat.expand_thinking_block') {
                            this.expand_thinking_block = formatArg(item.pval);
                        }
                        if (item.pkey === 'chat.limit_rows') {
                            this.limit_rows = formatArg(item.pval);
                        }
                    });
                }
            })
                .catch(() => {
                // 忽略错误，使用默认值
            });
        },
    },
});
export const useChatConfigStore = () => {
    return chatConfigStore(store);
};
