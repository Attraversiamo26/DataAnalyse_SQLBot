import { computed } from 'vue';
const props = defineProps({
    prefix: {
        type: String,
        default: 'icon',
    },
    name: {
        type: String,
        default: '',
    },
    className: {
        type: String,
        default: '',
    },
    staticContent: {
        type: String,
        default: '',
    },
});
const svgClass = computed(() => {
    if (props.className) {
        return `svg-icon ${props.className}`;
    }
    return 'svg-icon';
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.staticContent) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "svg-container" },
        ...{ class: (__VLS_ctx.svgClass) },
        'aria-hidden': "true",
    });
    __VLS_asFunctionalDirective(__VLS_directives.vDompurifyHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.staticContent) }, null, null);
}
else {
    var __VLS_0 = {};
}
/** @type {__VLS_StyleScopedClasses['svg-container']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            svgClass: svgClass,
        };
    },
    props: {
        prefix: {
            type: String,
            default: 'icon',
        },
        name: {
            type: String,
            default: '',
        },
        className: {
            type: String,
            default: '',
        },
        staticContent: {
            type: String,
            default: '',
        },
    },
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        prefix: {
            type: String,
            default: 'icon',
        },
        name: {
            type: String,
            default: '',
        },
        className: {
            type: String,
            default: '',
        },
        staticContent: {
            type: String,
            default: '',
        },
    },
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
