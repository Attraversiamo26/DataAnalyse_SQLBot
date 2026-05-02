import DsComponent from '@/views/ds/Datasource.vue';
import Page401 from '@/views/error/index.vue';
import { computed, nextTick, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAssistantStore } from '@/stores/assistant';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const userStore = useUserStore();
const assistantStore = useAssistantStore();
assistantStore.setPageEmbedded(true);
const route = useRoute();
const loading = ref(true);
const divLoading = ref(true);
const eventName = 'sqlbot_embedded_event';
const busiFlag = ref('ds');
const isWsAdmin = computed(() => {
    return userStore.isAdmin || userStore.isSpaceAdmin;
});
const communicationCb = async (event) => {
    if (event.data?.eventName === eventName) {
        if (event.data?.messageId !== route.query.id) {
            return;
        }
        if (!event.data?.busiFlag) {
            busiFlag.value = '';
            return;
        }
        busiFlag.value = event.data.busiFlag;
        if (event.data?.busi == 'certificate') {
            const type = parseInt(event.data['type']);
            const certificate = event.data['certificate'];
            assistantStore.setType(type);
            assistantStore.setToken(certificate);
            assistantStore.setAssistant(true);
            await userStore.info();
            loading.value = false;
            return;
        }
        if (event.data?.hostOrigin) {
            assistantStore.setHostOrigin(event.data?.hostOrigin);
        }
    }
};
watch(() => loading.value, (val) => {
    nextTick(() => {
        setTimeout(() => {
            divLoading.value = val;
        }, 1000);
    });
});
const registerReady = (assistantId) => {
    window.addEventListener('message', communicationCb);
    const readyData = {
        eventName: 'sqlbot_embedded_event',
        busi: 'ready',
        ready: true,
        messageId: assistantId,
    };
    window.parent.postMessage(readyData, '*');
};
onBeforeMount(async () => {
    const assistantId = route.query.id;
    if (!assistantId) {
        ElMessage.error('Miss embedded id, please check embedded url');
        return;
    }
    assistantStore.setType(4);
    const now = Date.now();
    assistantStore.setFlag(now);
    assistantStore.setId(assistantId?.toString() || '');
    assistantStore.setAssistant(true);
    registerReady(assistantId);
    return;
});
onBeforeUnmount(() => {
    window.removeEventListener('message', communicationCb);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot--embedded-page" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.divLoading) }, null, null);
if (!__VLS_ctx.loading && __VLS_ctx.isWsAdmin && __VLS_ctx.busiFlag === 'ds') {
    /** @type {[typeof DsComponent, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(DsComponent, new DsComponent({
        ref: "dsRef",
        pageEmbedded: (true),
    }));
    const __VLS_1 = __VLS_0({
        ref: "dsRef",
        pageEmbedded: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    /** @type {typeof __VLS_ctx.dsRef} */ ;
    var __VLS_3 = {};
    var __VLS_2;
}
if (!__VLS_ctx.loading && !__VLS_ctx.isWsAdmin && __VLS_ctx.busiFlag === 'ds') {
    /** @type {[typeof Page401, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(Page401, new Page401({
        title: (__VLS_ctx.t('login.permission_invalid')),
    }));
    const __VLS_6 = __VLS_5({
        title: (__VLS_ctx.t('login.permission_invalid')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
/** @type {__VLS_StyleScopedClasses['sqlbot--embedded-page']} */ ;
// @ts-ignore
var __VLS_4 = __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DsComponent: DsComponent,
            t: t,
            loading: loading,
            divLoading: divLoading,
            busiFlag: busiFlag,
            isWsAdmin: isWsAdmin,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
