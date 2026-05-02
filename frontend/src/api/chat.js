import { request } from '@/utils/request';
import { getDate } from '@/utils/utils.ts';
import { i18n } from '@/i18n';
const { t } = i18n.global;
export const questionApi = {
    pager: (pageNumber, pageSize) => request.get(`/chat/question/pager/${pageNumber}/${pageSize}`),
    /* add: (data: any) => new Promise((resolve, reject) => {
        request.post('/chat/question', data, { responseType: 'stream', timeout: 0, onDownloadProgress: p => {
          resolve(p)
        }}).catch(e => reject(e))
      }), */
    // add: (data: any) => request.post('/chat/question', data),
    add: (data, controller) => request.fetchStream('/chat/question', data, controller),
    edit: (data) => request.put('/chat/question', data),
    delete: (id) => request.delete(`/chat/question/${id}`),
    query: (id) => request.get(`/chat/question/${id}`),
};
export class ChatRecord {
    constructor(id, chat_id, create_time, finish_time, question, sql_answer, sql, datasource, data, chart_answer, chart, analysis, analysis_thinking, predict, predict_content, predict_data, finish, error, run_time, first_chat, recommended_question, analysis_record_id, predict_record_id, regenerate_record_id, duration, total_tokens) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "chat_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "create_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "finish_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "question", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sql_answer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sql", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "datasource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "chart_answer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "chart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "analysis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "analysis_thinking", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "predict", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "predict_content", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "predict_data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "finish", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "run_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "first_chat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "recommended_question", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "analysis_record_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "predict_record_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "regenerate_record_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "duration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "total_tokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = id;
        this.chat_id = chat_id;
        this.create_time = getDate(create_time);
        this.finish_time = getDate(finish_time);
        this.question = question;
        this.sql_answer = sql_answer;
        this.sql = sql;
        this.datasource = datasource;
        this.data = data;
        this.chart_answer = chart_answer;
        this.chart = chart;
        this.analysis = analysis;
        this.analysis_thinking = analysis_thinking;
        this.predict = predict;
        this.predict_content = predict_content;
        this.predict_data = predict_data;
        this.finish = !!finish;
        this.error = error;
        this.run_time = run_time ?? 0;
        this.first_chat = !!first_chat;
        this.recommended_question = recommended_question;
        this.analysis_record_id = analysis_record_id;
        this.predict_record_id = predict_record_id;
        this.regenerate_record_id = regenerate_record_id;
        this.duration = duration;
        this.total_tokens = total_tokens;
    }
}
export class Chat {
    constructor(id, create_time, create_by, brief, chat_type, datasource, engine_type) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "create_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "create_by", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "brief", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "chat_type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "datasource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "engine_type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ds_type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "recommended_question", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "recommended_generate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = id;
        this.create_time = getDate(create_time);
        this.create_by = create_by;
        this.brief = brief;
        this.chat_type = chat_type;
        this.datasource = datasource;
        this.engine_type = engine_type;
    }
}
export class ChatInfo extends Chat {
    constructor(param1, create_time, create_by, brief, chat_type, datasource, engine_type, ds_type, datasource_name, datasource_exists = true, records = [], recommended_question, recommended_generate) {
        super();
        Object.defineProperty(this, "datasource_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "datasource_exists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "records", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        if (param1 !== undefined) {
            if (param1 instanceof Chat) {
                this.id = param1.id;
                this.create_time = getDate(param1.create_time);
                this.create_by = param1.create_by;
                this.brief = param1.brief;
                this.chat_type = param1.chat_type;
                this.datasource = param1.datasource;
                this.engine_type = param1.engine_type;
                this.ds_type = param1.ds_type;
                this.recommended_question = recommended_question;
                this.recommended_generate = recommended_generate;
            }
            else {
                this.id = param1;
                this.create_time = getDate(create_time);
                this.create_by = create_by;
                this.brief = brief;
                this.chat_type = chat_type;
                this.datasource = datasource;
                this.engine_type = engine_type;
                this.ds_type = ds_type;
                this.recommended_question = recommended_question;
                this.recommended_generate = recommended_generate;
            }
        }
        this.datasource_name = datasource_name;
        this.datasource_exists = datasource_exists;
        this.records = Array.isArray(records) ? records : [];
    }
}
const toChatRecord = (data) => {
    if (!data) {
        return undefined;
    }
    return new ChatRecord(data.id, data.chat_id, data.create_time, data.finish_time, data.question, data.sql_answer, data.sql, data.datasource, data.data, data.chart_answer, data.chart, data.analysis, data.analysis_thinking, data.predict, data.predict_content, data.predict_data, data.finish, data.error, data.run_time, data.first_chat, data.recommended_question, data.analysis_record_id, data.predict_record_id, data.regenerate_record_id, data.duration, data.total_tokens);
};
const toChatRecordList = (list = []) => {
    const records = [];
    for (let i = 0; i < list.length; i++) {
        const record = toChatRecord(list[i]);
        if (record) {
            records.push(record);
        }
    }
    return records;
};
export class ChatLogHistoryItem {
    constructor(start_time, finish_time, duration, total_tokens, operate, local_operation, error, message) {
        Object.defineProperty(this, "start_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "finish_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "duration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "total_tokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "operate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "operate_key", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "local_operation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.start_time = getDate(start_time);
        this.finish_time = getDate(finish_time);
        this.duration = duration;
        this.total_tokens = total_tokens;
        this.operate_key = operate;
        this.operate = t('chat.log.' + operate);
        this.local_operation = !!local_operation;
        this.error = !!error;
        this.message = message;
    }
}
export class ChatLogHistory {
    constructor(start_time, finish_time, duration, total_tokens, steps) {
        Object.defineProperty(this, "start_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "finish_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "duration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "total_tokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "steps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.start_time = getDate(start_time);
        this.finish_time = getDate(finish_time);
        this.duration = duration;
        this.total_tokens = total_tokens;
        this.steps = steps ? steps : [];
    }
}
const toChatLogHistoryItem = (data) => {
    if (!data) {
        return undefined;
    }
    return new ChatLogHistoryItem(data.start_time, data.finish_time, data.duration, data.total_tokens, data.operate, data.local_operation, data.error, data.message);
};
const toChatLogHistoryItemList = (list = []) => {
    const records = [];
    for (let i = 0; i < list.length; i++) {
        const record = toChatLogHistoryItem(list[i]);
        if (record) {
            records.push(record);
        }
    }
    return records;
};
export const chatApi = {
    toChatInfo: (data) => {
        if (!data) {
            return undefined;
        }
        return new ChatInfo(data.id, data.create_time, data.create_by, data.brief, data.chat_type, data.datasource, data.engine_type, data.ds_type, data.datasource_name, data.datasource_exists, toChatRecordList(data.records), data.recommended_question, data.recommended_generate);
    },
    toChatInfoList: (list = []) => {
        const infos = [];
        for (let i = 0; i < list.length; i++) {
            const chatInfo = chatApi.toChatInfo(list[i]);
            if (chatInfo) {
                infos.push(chatInfo);
            }
        }
        return infos;
    },
    toChatLogHistory: (data) => {
        if (!data) {
            return undefined;
        }
        return new ChatLogHistory(data.start_time, data.finish_time, data.duration, data.total_tokens, toChatLogHistoryItemList(data.steps));
    },
    list: () => {
        return request.get('/chat/list');
    },
    get: (id) => {
        return request.get(`/chat/${id}`);
    },
    get_with_Data: (id) => {
        return request.get(`/chat/${id}/with_data`);
    },
    get_chart_data: (record_id) => {
        return request.get(`/chat/record/${record_id}/data`);
    },
    get_chart_predict_data: (record_id) => {
        return request.get(`/chat/record/${record_id}/predict_data`);
    },
    get_chart_log_history: (record_id) => {
        return request.get(`/chat/record/${record_id}/log`);
    },
    get_chart_usage: (record_id) => {
        return request.get(`/chat/record/${record_id}/usage`);
    },
    startChat: (data) => {
        return request.post('/chat/start', data);
    },
    startAssistantChat: (data) => {
        return request.post('/chat/assistant/start', Object.assign({ origin: 2 }, data));
    },
    renameChat: (chat_id, brief) => {
        return request.post('/chat/rename', { id: chat_id, brief: brief });
    },
    deleteChat: (id, brief) => {
        return request.delete(`/chat/${id}/${brief}`);
    },
    analysis: (record_id, controller) => {
        return request.fetchStream(`/chat/record/${record_id}/analysis`, {}, controller);
    },
    predict: (record_id, controller) => {
        return request.fetchStream(`/chat/record/${record_id}/predict`, {}, controller);
    },
    recommendQuestions: (record_id, controller, params) => {
        return request.fetchStream(`/chat/recommend_questions/${record_id}${params}`, {}, controller);
    },
    recentQuestions: (datasource_id) => {
        return request.get(`/chat/recent_questions/${datasource_id}`);
    },
    checkLLMModel: () => request.get('/system/aimodel/default', { requestOptions: { silent: true } }),
    export2Excel: (record_id, chat_id) => request.get(`/chat/record/${record_id}/excel/export/${chat_id}`, {
        responseType: 'blob',
        requestOptions: { customError: true },
    }),
};
