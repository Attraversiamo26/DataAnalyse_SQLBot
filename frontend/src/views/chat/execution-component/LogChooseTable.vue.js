import BaseContent from './BaseContent.vue';
import { computed } from 'vue';
const props = withDefaults(defineProps(), {
    item: undefined,
    error: '',
});
const schema = computed(() => {
    return props.item?.message ?? '';
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
    __VLS_asFunctionalDirective(__VLS_directives.vDompurifyHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.schema) }, null, null);
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['base-container']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BaseContent: BaseContent,
            schema: schema,
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
