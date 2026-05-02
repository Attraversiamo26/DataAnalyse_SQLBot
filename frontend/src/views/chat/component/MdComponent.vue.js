import md from '@/utils/markdown.ts';
import 'highlight.js/styles/github.min.css';
import 'github-markdown-css/github-markdown-light.css';
import { computed } from 'vue';
const props = defineProps();
const renderMd = computed(() => {
    return md.render(props.message ?? '');
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "markdown-body md-render-container" },
});
__VLS_asFunctionalDirective(__VLS_directives.vDompurifyHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMd) }, null, null);
/** @type {__VLS_StyleScopedClasses['markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['md-render-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            renderMd: renderMd,
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
