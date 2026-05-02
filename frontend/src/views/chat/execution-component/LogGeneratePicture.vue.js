import BaseContent from './BaseContent.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const props = withDefaults(defineProps(), {
    item: undefined,
    error: '',
});
const { t } = useI18n();
const message = computed(() => {
    return props.item?.message ?? '';
});
const title = computed(() => {
    return t('chat.generate_picture_success');
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
    if (__VLS_ctx.message.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "inner-title" },
        });
        (__VLS_ctx.message);
    }
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['base-container']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BaseContent: BaseContent,
            message: message,
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
