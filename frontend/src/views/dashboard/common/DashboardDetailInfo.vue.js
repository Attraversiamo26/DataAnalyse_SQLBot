import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const __VLS_props = defineProps({
    dashboardInfo: {
        type: Object,
        required: true,
    },
});
const timestampFormatDate = (value) => {
    if (!value) {
        return '-';
    }
    return new Date(value * 1000).toLocaleString();
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-title" },
});
(__VLS_ctx.t('dashboard.dashboard_id'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-content" },
});
(__VLS_ctx.dashboardInfo.id);
if (__VLS_ctx.dashboardInfo.createName) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-title" },
    });
    (__VLS_ctx.t('dashboard.creator'));
}
if (__VLS_ctx.dashboardInfo.createName) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-content" },
    });
    (__VLS_ctx.dashboardInfo.createName);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-title" },
});
(__VLS_ctx.t('dashboard.create_time'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-content" },
});
(__VLS_ctx.timestampFormatDate(__VLS_ctx.dashboardInfo.createTime));
if (__VLS_ctx.dashboardInfo.updateName) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-title" },
    });
    (__VLS_ctx.t('dashboard.updater'));
}
if (__VLS_ctx.dashboardInfo.updateName) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-content" },
    });
    (__VLS_ctx.dashboardInfo.updateName);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-title" },
});
(__VLS_ctx.t('dashboard.update_time'));
if (__VLS_ctx.dashboardInfo.updateTime) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-content" },
    });
    (__VLS_ctx.timestampFormatDate(__VLS_ctx.dashboardInfo.updateTime));
}
if (!__VLS_ctx.dashboardInfo.updateTime) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-content" },
    });
}
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            t: t,
            timestampFormatDate: timestampFormatDate,
        };
    },
    props: {
        dashboardInfo: {
            type: Object,
            required: true,
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        dashboardInfo: {
            type: Object,
            required: true,
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
