import { ref } from 'vue';
import RichTextEditor from '@/views/dashboard/components/sq-text-t7/index.vue';
const articleContent = ref('<p>这里是默认内容...</p>');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
/** @type {[typeof RichTextEditor, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(RichTextEditor, new RichTextEditor({
    modelValue: (__VLS_ctx.articleContent),
}));
const __VLS_1 = __VLS_0({
    modelValue: (__VLS_ctx.articleContent),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RichTextEditor: RichTextEditor,
            articleContent: articleContent,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
