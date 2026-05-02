import delIcon from '@/assets/svg/icon_delete.svg';
import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg';
import icon_form_outlined from '@/assets/svg/icon_form_outlined.svg';
import icon_chat_outlined from '@/assets/svg/icon_new-chat_outlined.svg';
import { computed, ref, unref } from 'vue';
import { ClickOutside as vClickOutside } from 'element-plus-secondary';
import { dsTypeWithImg } from './js/ds-type';
import edit from '@/assets/svg/icon_edit_outlined.svg';
import icon_recommended_problem from '@/assets/svg/icon_recommended_problem.svg';
import { datasourceApi } from '@/api/datasource.ts';
const props = withDefaults(defineProps(), {
    name: '-',
    type: '-',
    description: '-',
    id: '-',
    typeName: '-',
});
const emits = defineEmits([
    'edit',
    'del',
    'question',
    'dataTableDetail',
    'showTable',
    'recommendation',
]);
const icon = computed(() => {
    return (dsTypeWithImg.find((ele) => props.type === ele.type) || {}).img;
});
const handleEdit = () => {
    emits('edit');
};
const handleRecommendation = () => {
    emits('recommendation');
};
const handleDel = () => {
    emits('del');
};
const handleQuestion = () => {
    //check first
    datasourceApi.check_by_id(props.id).then((res) => {
        if (res) {
            emits('question', props.id);
        }
    });
};
function runSQL() {
    datasourceApi.execSql(props.id, 'SELECT TO_CHAR(FLOOR("c"."CREDIT_LIMIT" / 10000) * 10000) || \' - \' || TO_CHAR((FLOOR("c"."CREDIT_LIMIT" / 10000) + 1) * 10000) AS "credit_range",\n' +
        '       COUNT(*) AS "customer_count"\n' +
        'FROM "WEI"."CUSTOMERS" "c"\n' +
        'WHERE "c"."CREDIT_LIMIT" IS NOT NULL\n' +
        'GROUP BY FLOOR("c"."CREDIT_LIMIT" / 10000)\n' +
        'ORDER BY FLOOR("c"."CREDIT_LIMIT" / 10000)');
}
const dataTableDetail = () => {
    emits('dataTableDetail');
};
const buttonRef = ref();
const popoverRef = ref();
const onClickOutside = () => {
    unref(popoverRef).popperRef?.delayHide?.();
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    name: '-',
    type: '-',
    description: '-',
    id: '-',
    typeName: '-',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['methods']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.dataTableDetail) },
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "name-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: (__VLS_ctx.icon),
    width: "32px",
    height: "32px",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    title: (__VLS_ctx.name),
    ...{ class: "name ellipsis" },
});
(__VLS_ctx.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "type" },
});
(__VLS_ctx.typeName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    title: (__VLS_ctx.description),
    ...{ class: "type-value" },
});
(__VLS_ctx.description);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-rate" },
});
const __VLS_0 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "form-icon" },
    size: "16",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "form-icon" },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.icon_form_outlined;
/** @type {[typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
(__VLS_ctx.num);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    'click.stop': true,
    ...{ class: "methods" },
});
if (false) {
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.runSQL)
    };
    __VLS_11.slots.default;
    var __VLS_11;
}
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.handleQuestion)
};
__VLS_19.slots.default;
const __VLS_24 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ style: {} },
    size: "16",
}));
const __VLS_26 = __VLS_25({
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.icon_chat_outlined;
/** @type {[typeof __VLS_components.Icon_chat_outlined, typeof __VLS_components.icon_chat_outlined, typeof __VLS_components.Icon_chat_outlined, typeof __VLS_components.icon_chat_outlined, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
(__VLS_ctx.$t('datasource.open_query'));
var __VLS_19;
const __VLS_32 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    ref: "buttonRef",
    ...{ class: "more" },
    size: "16",
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    ref: "buttonRef",
    ...{ class: "more" },
    size: "16",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: () => { }
};
__VLS_asFunctionalDirective(__VLS_directives.vClickOutside)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.onClickOutside) }, null, null);
/** @type {typeof __VLS_ctx.buttonRef} */ ;
var __VLS_40 = {};
__VLS_35.slots.default;
const __VLS_42 = {}.icon_more_outlined;
/** @type {[typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({}));
const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
var __VLS_35;
const __VLS_46 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    ref: "popoverRef",
    virtualRef: (__VLS_ctx.buttonRef),
    virtualTriggering: true,
    trigger: "click",
    teleported: (false),
    popperClass: "popover-card_ds",
    placement: "bottom-end",
}));
const __VLS_48 = __VLS_47({
    ref: "popoverRef",
    virtualRef: (__VLS_ctx.buttonRef),
    virtualTriggering: true,
    trigger: "click",
    teleported: (false),
    popperClass: "popover-card_ds",
    placement: "bottom-end",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
/** @type {typeof __VLS_ctx.popoverRef} */ ;
var __VLS_50 = {};
__VLS_49.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleEdit) },
    ...{ class: "item" },
});
const __VLS_52 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    size: "16",
}));
const __VLS_54 = __VLS_53({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.edit;
/** @type {[typeof __VLS_components.Edit, typeof __VLS_components.edit, typeof __VLS_components.Edit, typeof __VLS_components.edit, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
var __VLS_55;
(__VLS_ctx.$t('datasource.edit'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleRecommendation) },
    ...{ class: "item" },
});
const __VLS_60 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    size: "16",
}));
const __VLS_62 = __VLS_61({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.icon_recommended_problem;
/** @type {[typeof __VLS_components.Icon_recommended_problem, typeof __VLS_components.icon_recommended_problem, typeof __VLS_components.Icon_recommended_problem, typeof __VLS_components.icon_recommended_problem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
(__VLS_ctx.$t('datasource.recommended_problem_configuration'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleDel) },
    ...{ class: "item" },
});
const __VLS_68 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    size: "16",
}));
const __VLS_70 = __VLS_69({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.delIcon;
/** @type {[typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
var __VLS_71;
(__VLS_ctx.$t('dashboard.delete'));
var __VLS_49;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['name-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['type']} */ ;
/** @type {__VLS_StyleScopedClasses['type-value']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-info']} */ ;
/** @type {__VLS_StyleScopedClasses['form-rate']} */ ;
/** @type {__VLS_StyleScopedClasses['form-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['methods']} */ ;
/** @type {__VLS_StyleScopedClasses['more']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
// @ts-ignore
var __VLS_41 = __VLS_40, __VLS_51 = __VLS_50;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            delIcon: delIcon,
            icon_more_outlined: icon_more_outlined,
            icon_form_outlined: icon_form_outlined,
            icon_chat_outlined: icon_chat_outlined,
            vClickOutside: vClickOutside,
            edit: edit,
            icon_recommended_problem: icon_recommended_problem,
            icon: icon,
            handleEdit: handleEdit,
            handleRecommendation: handleRecommendation,
            handleDel: handleDel,
            handleQuestion: handleQuestion,
            runSQL: runSQL,
            dataTableDetail: dataTableDetail,
            buttonRef: buttonRef,
            popoverRef: popoverRef,
            onClickOutside: onClickOutside,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
