import PlatformInfo from './PlatformInfo.vue';
import { useI18n } from 'vue-i18n';
import { request } from '@/utils/request';
import { onMounted, reactive } from 'vue';
const { t } = useI18n();
const state = reactive({
    cardList: [],
});
const loadData = () => {
    const url = '/system/platform';
    request.get(url).then((res) => {
        state.cardList = res
            .map((item) => {
            item.config = JSON.parse(item.config);
            return item;
        })
            .filter((card) => card.type < 9);
    });
};
onMounted(() => {
    loadData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "router-title" },
});
(__VLS_ctx.t('platform.title'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sys-setting-p" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.state.cardList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (card.type),
        ...{ class: "container-sys-platform" },
    });
    /** @type {[typeof PlatformInfo, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(PlatformInfo, new PlatformInfo({
        ...{ 'onSaved': {} },
        cardInfo: (card),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onSaved': {} },
        cardInfo: (card),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onSaved: (__VLS_ctx.loadData)
    };
    var __VLS_2;
}
/** @type {__VLS_StyleScopedClasses['router-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sys-setting-p']} */ ;
/** @type {__VLS_StyleScopedClasses['container-sys-platform']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PlatformInfo: PlatformInfo,
            t: t,
            state: state,
            loadData: loadData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
