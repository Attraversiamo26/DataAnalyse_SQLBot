import BaseContent from './BaseContent.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SQLComponent from '@/views/chat/component/SQLComponent.vue';
import { find, findLastIndex } from 'lodash-es';
const props = withDefaults(defineProps(), {
    item: undefined,
    error: '',
});
const { t } = useI18n();
const data = computed(() => {
    return props.item?.message ?? [];
});
// 1. 获取 role 为 system 的一条记录
const systemRecord = computed(() => find(data.value, { type: 'system' }));
// 2. 获取最后一个 role 为 human 的记录
const lastHumanIndex = computed(() => findLastIndex(data.value, { type: 'human' }));
const lastHumanRecord = computed(() => data.value[lastHumanIndex.value]);
// 3. 获取最后一个 role 为 ai 且在当前对话提问后出现的记录
// 使用原生 filter 和 pop
const aiRecordsAfterHuman = computed(() => data.value.slice(lastHumanIndex.value + 1).filter((item) => item.type === 'ai'));
const lastAiAfterHuman = computed(() => aiRecordsAfterHuman.value.length > 0
    ? aiRecordsAfterHuman.value[aiRecordsAfterHuman.value.length - 1]
    : undefined);
// 4. 获取除 system 以外，当前对话提问前的所有记录
const recordsBeforeCurrentQuestion = computed(() => data.value.slice(0, lastHumanIndex.value).filter((item) => item.type !== 'system'));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    item: undefined,
    error: '',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof BaseContent, typeof BaseContent, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(BaseContent, new BaseContent({
    ...{ class: "base-container" },
}));
const __VLS_1 = __VLS_0({
    ...{ class: "base-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
if (__VLS_ctx.item.error) {
    (__VLS_ctx.error);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-title" },
    });
    (__VLS_ctx.t('chat.log_system'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-item-title" },
    });
    (__VLS_ctx.systemRecord.type);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-item-description" },
    });
    /** @type {[typeof SQLComponent, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(SQLComponent, new SQLComponent({
        sql: (__VLS_ctx.systemRecord.content),
    }));
    const __VLS_5 = __VLS_4({
        sql: (__VLS_ctx.systemRecord.content),
    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    if (__VLS_ctx.recordsBeforeCurrentQuestion.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "inner-title" },
        });
        (__VLS_ctx.t('chat.log_history'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "inner-item" },
        });
        for (const [ele, index] of __VLS_getVForSourceType((__VLS_ctx.recordsBeforeCurrentQuestion))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (index),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "inner-item-title" },
            });
            (ele.type);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "inner-item-description" },
            });
            /** @type {[typeof SQLComponent, ]} */ ;
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(SQLComponent, new SQLComponent({
                sql: (ele.content),
            }));
            const __VLS_8 = __VLS_7({
                sql: (ele.content),
            }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-title" },
    });
    (__VLS_ctx.t('chat.log_question'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-item-description" },
    });
    /** @type {[typeof SQLComponent, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(SQLComponent, new SQLComponent({
        sql: (__VLS_ctx.lastHumanRecord.content),
    }));
    const __VLS_11 = __VLS_10({
        sql: (__VLS_ctx.lastHumanRecord.content),
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    if (__VLS_ctx.lastAiAfterHuman) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "inner-title" },
        });
        (__VLS_ctx.t('chat.log_answer'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "inner-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "inner-item-description" },
        });
        /** @type {[typeof SQLComponent, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(SQLComponent, new SQLComponent({
            sql: (__VLS_ctx.lastAiAfterHuman.content),
        }));
        const __VLS_14 = __VLS_13({
            sql: (__VLS_ctx.lastAiAfterHuman.content),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['base-container']} */ ;
/** @type {__VLS_StyleScopedClasses['item-list']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BaseContent: BaseContent,
            SQLComponent: SQLComponent,
            t: t,
            systemRecord: systemRecord,
            lastHumanRecord: lastHumanRecord,
            lastAiAfterHuman: lastAiAfterHuman,
            recordsBeforeCurrentQuestion: recordsBeforeCurrentQuestion,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
