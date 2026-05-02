import { datetimeFormat } from '@/utils/utils.ts';
import SQLServerDs from '@/assets/svg/ds/sqlServer-ds.svg';
import ExcelDs from '@/assets/svg/ds/Excel-ds.svg';
import PgDs from '@/assets/svg/ds/pg-ds.svg';
import MysqlDs from '@/assets/svg/ds/mysql-ds.svg';
import OracleDs from '@/assets/svg/ds/oracle-ds.svg';
const __VLS_props = defineProps();
// const getStatus = (status: string) => {
//   if (status === 'Success') {
//     return 'connected'
//   }
//   if (status === 'Fail') {
//     return 'failed'
//   }
//   if (status === 'Checking') {
//     return 'needs-verification'
//   }
// }
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['connection-status']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-status']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-status']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "connection-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "connection-icon" },
});
const __VLS_0 = {}.Icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.ds.type === 'mysql') {
    const __VLS_4 = {}.MysqlDs;
    /** @type {[typeof __VLS_components.MysqlDs, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
else if (__VLS_ctx.ds.type === 'sqlServer') {
    const __VLS_8 = {}.SQLServerDs;
    /** @type {[typeof __VLS_components.SQLServerDs, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
else if (__VLS_ctx.ds.type === 'pg') {
    const __VLS_12 = {}.PgDs;
    /** @type {[typeof __VLS_components.PgDs, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
else if (__VLS_ctx.ds.type === 'excel') {
    const __VLS_16 = {}.ExcelDs;
    /** @type {[typeof __VLS_components.ExcelDs, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
else if (__VLS_ctx.ds.type === 'oracle') {
    const __VLS_20 = {}.OracleDs;
    /** @type {[typeof __VLS_components.OracleDs, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "connection-details" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "connection-name" },
});
(__VLS_ctx.ds.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "connection-type" },
});
(__VLS_ctx.ds.type_name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "connection-host" },
});
(__VLS_ctx.ds.description);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "connection-last" },
});
(__VLS_ctx.datetimeFormat(__VLS_ctx.ds.create_time));
var __VLS_24 = {};
/** @type {__VLS_StyleScopedClasses['connection-card']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-details']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-name']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-type']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-host']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-last']} */ ;
// @ts-ignore
var __VLS_25 = __VLS_24;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            datetimeFormat: datetimeFormat,
            SQLServerDs: SQLServerDs,
            ExcelDs: ExcelDs,
            PgDs: PgDs,
            MysqlDs: MysqlDs,
            OracleDs: OracleDs,
        };
    },
    __typeProps: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
