import ChatComponent from '@/views/chat/index.vue';
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ErrorPage from '@/views/error/index.vue';
import { isInIframe } from '@/utils/utils';
const { t } = useI18n();
//const chatRef = ref()
const customSet = reactive({
    name: '',
    welcome: t('embedded.i_am_sqlbot'),
    welcome_desc: t('embedded.data_analysis_now'),
    theme: '#1CBA90',
    header_font_color: '#1F2329',
});
const logo = ref();
const divLoading = ref(true);
const inIframe = computed(() => isInIframe());
onMounted(() => {
    nextTick(() => {
        setTimeout(() => {
            divLoading.value = false;
        }, 1500);
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-embedded-assistant-page" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.divLoading) }, null, null);
if (__VLS_ctx.inIframe) {
    /** @type {[typeof ErrorPage, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(ErrorPage, new ErrorPage({
        title: (__VLS_ctx.t('embedded.preview_error')),
    }));
    const __VLS_1 = __VLS_0({
        title: (__VLS_ctx.t('embedded.preview_error')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
}
else {
    /** @type {[typeof ChatComponent, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(ChatComponent, new ChatComponent({
        welcome: (__VLS_ctx.customSet.welcome),
        welcomeDesc: (__VLS_ctx.customSet.welcome_desc),
        logoAssistant: (__VLS_ctx.logo),
        pageEmbedded: (true),
        appName: (__VLS_ctx.customSet.name),
    }));
    const __VLS_4 = __VLS_3({
        welcome: (__VLS_ctx.customSet.welcome),
        welcomeDesc: (__VLS_ctx.customSet.welcome_desc),
        logoAssistant: (__VLS_ctx.logo),
        pageEmbedded: (true),
        appName: (__VLS_ctx.customSet.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
}
/** @type {__VLS_StyleScopedClasses['sqlbot-embedded-assistant-page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChatComponent: ChatComponent,
            ErrorPage: ErrorPage,
            t: t,
            customSet: customSet,
            logo: logo,
            divLoading: divLoading,
            inIframe: inIframe,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
