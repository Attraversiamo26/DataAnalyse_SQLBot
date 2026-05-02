import BaseContent from './BaseContent.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const props = withDefaults(defineProps(), {
    item: undefined,
    error: '',
});
const { t } = useI18n();
const list = computed(() => {
    return props.item?.message ?? [];
});
const title = computed(() => {
    return t('chat.find_custom_prompt_title', [list.value.length]);
});
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
        ...{ class: "inner-title" },
    });
    (__VLS_ctx.title);
    if (__VLS_ctx.list.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
            ...{ class: "item-list" },
        });
        for (const [ele, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (index),
                ...{ class: "inner-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "inner-item-description" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vDompurifyHtml)(null, { ...__VLS_directiveBindingRestFields, value: (ele) }, null, null);
        }
    }
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['base-container']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['item-list']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-item-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BaseContent: BaseContent,
            list: list,
            title: title,
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
