import Four from '@/assets/svg/401.svg';
import { Icon } from '@/components/icon-custom';
import { propTypes } from '@/utils/propTypes';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toLoginPage } from '@/utils/utils';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const __VLS_props = defineProps({
    title: propTypes.string,
});
const routerTitle = computed(() => route.query?.title || '');
const target = computed(() => route.query?.target || '');
const showTimer = computed(() => routerTitle.value && routerTitle.value === 'unauthorized');
const target_full_path = ref('');
const unauthorizedTitle = ref(t('login.no_auth_error', [3]));
onMounted(() => {
    if (target.value) {
        target_full_path.value = target.value;
        if (!target_full_path.value.startsWith('/')) {
            target_full_path.value = '/' + target_full_path.value;
        }
        /* setTimeout(() => {
          router.push(toLoginPage(target_full_path))
        }, 2000) */
    }
    if (showTimer.value) {
        let timer = 3;
        const timerHandler = setInterval(() => {
            if (timer-- <= 0) {
                clearInterval(timerHandler);
                router.push(toLoginPage(target_full_path.value));
                return;
            }
            unauthorizedTitle.value = t('login.no_auth_error', [timer]);
        }, 1000);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-not-found" },
});
const __VLS_0 = {}.Icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "401",
}));
const __VLS_2 = __VLS_1({
    name: "401",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.Four;
/** @type {[typeof __VLS_components.Four, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "svg-icon login-logo-icon" },
}));
const __VLS_6 = __VLS_5({
    ...{ class: "svg-icon login-logo-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
if (__VLS_ctx.showTimer) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "span-403" },
    });
    (__VLS_ctx.unauthorizedTitle);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "span-403" },
    });
    (__VLS_ctx.title || __VLS_ctx.routerTitle || '');
}
/** @type {__VLS_StyleScopedClasses['page-not-found']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['login-logo-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['span-403']} */ ;
/** @type {__VLS_StyleScopedClasses['span-403']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Four: Four,
            Icon: Icon,
            routerTitle: routerTitle,
            showTimer: showTimer,
            unauthorizedTitle: unauthorizedTitle,
        };
    },
    props: {
        title: propTypes.string,
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        title: propTypes.string,
    },
});
; /* PartiallyEnd: #4569/main.vue */
