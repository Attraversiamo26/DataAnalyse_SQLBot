import 'highlight.js/styles/github.min.css';
import 'github-markdown-css/github-markdown-light.css';
import hljs from 'highlight.js';
const __VLS_props = defineProps();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
    ...{ class: "hljs" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vDompurifyHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.hljs.highlight(__VLS_ctx.sql, { language: 'sql', ignoreIllegals: true }).value) }, null, null);
/** @type {__VLS_StyleScopedClasses['hljs']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            hljs: hljs,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
