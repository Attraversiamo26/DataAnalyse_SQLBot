import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssistantStore } from '@/stores/assistant.ts';
const props = defineProps();
const { t } = useI18n();
const assistantStore = useAssistantStore();
const isCompletePage = computed(() => !assistantStore.getAssistant || assistantStore.getEmbedded);
const showBlock = computed(() => {
    return props.error && props.error?.trim().length > 0;
});
const errorMessage = computed(() => {
    const obj = { message: props.error, showMore: false, traceback: '', type: undefined };
    if (showBlock.value && props.error?.trim().startsWith('{') && props.error?.trim().endsWith('}')) {
        try {
            const json = JSON.parse(props.error?.trim());
            obj.message = json['message'];
            obj.traceback = json['traceback'];
            obj.type = json['type'];
            if (obj.traceback?.trim().length > 0) {
                obj.showMore = true;
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    return obj;
});
const show = ref(false);
function showTraceBack() {
    show.value = true;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.showBlock) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (!__VLS_ctx.errorMessage.showMore && __VLS_ctx.errorMessage.type == undefined) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-container" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vDompurifyHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.errorMessage.message) }, null, null);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-container row" },
        });
        if (__VLS_ctx.errorMessage.type === 'db-connection-err') {
            (__VLS_ctx.t('chat.ds_is_invalid'));
        }
        else if (__VLS_ctx.errorMessage.type === 'exec-sql-err') {
            (__VLS_ctx.t('chat.exec-sql-err'));
        }
        else {
            (__VLS_ctx.t('chat.error'));
        }
        if (__VLS_ctx.errorMessage.showMore) {
            const __VLS_0 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
                ...{ 'onClick': {} },
                text: true,
            }));
            const __VLS_2 = __VLS_1({
                ...{ 'onClick': {} },
                text: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            let __VLS_4;
            let __VLS_5;
            let __VLS_6;
            const __VLS_7 = {
                onClick: (__VLS_ctx.showTraceBack)
            };
            __VLS_3.slots.default;
            (__VLS_ctx.t('chat.show_error_detail'));
            var __VLS_3;
        }
    }
    const __VLS_8 = {}.ElDrawer;
    /** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.show),
        size: (!__VLS_ctx.isCompletePage ? '100%' : '600px'),
        title: (__VLS_ctx.t('chat.error')),
        direction: "rtl",
        bodyClass: "chart-sql-error-body",
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.show),
        size: (!__VLS_ctx.isCompletePage ? '100%' : '600px'),
        title: (__VLS_ctx.t('chat.error')),
        direction: "rtl",
        bodyClass: "chart-sql-error-body",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.ElMain;
    /** @type {[typeof __VLS_components.ElMain, typeof __VLS_components.elMain, typeof __VLS_components.ElMain, typeof __VLS_components.elMain, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-container open" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vDompurifyHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.errorMessage.traceback) }, null, null);
    var __VLS_15;
    var __VLS_11;
}
/** @type {__VLS_StyleScopedClasses['error-container']} */ ;
/** @type {__VLS_StyleScopedClasses['error-container']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['error-container']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            t: t,
            isCompletePage: isCompletePage,
            showBlock: showBlock,
            errorMessage: errorMessage,
            show: show,
            showTraceBack: showTraceBack,
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
