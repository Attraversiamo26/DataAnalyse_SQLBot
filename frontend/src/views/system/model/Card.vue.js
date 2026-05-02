import delIcon from '@/assets/svg/icon_delete.svg';
import icon_admin_outlined from '@/assets/svg/icon_admin_outlined.svg';
import edit from '@/assets/svg/icon_edit_outlined.svg';
import { get_supplier } from '@/entity/supplier';
import { computed, ref } from 'vue';
const props = withDefaults(defineProps(), {
    name: '-',
    modelType: '-',
    baseModel: '-',
    id: '-',
    isDefault: false,
    supplier: 0,
});
const errorMsg = ref('');
const current_supplier = computed(() => {
    if (!props.supplier) {
        return null;
    }
    return get_supplier(props.supplier);
});
const showErrorMask = (msg) => {
    if (!msg) {
        return;
    }
    errorMsg.value = msg;
    setTimeout(() => {
        errorMsg.value = '';
    }, 3000);
};
const emits = defineEmits(['edit', 'del', 'default']);
const handleDefault = () => {
    emits('default');
};
const handleDel = () => {
    emits('del', { id: props.id, name: props.name, default_model: props.isDefault });
};
const handleEdit = () => {
    emits('edit');
};
const __VLS_exposed = { showErrorMask };
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    name: '-',
    modelType: '-',
    baseModel: '-',
    id: '-',
    isDefault: false,
    supplier: 0,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['methods']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card" },
    'element-loading-text': (__VLS_ctx.errorMsg),
    'element-loading-custom-class': "model-card-loading",
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (!!__VLS_ctx.errorMsg) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "name-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: (__VLS_ctx.current_supplier?.icon),
    width: "32px",
    height: "32px",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    title: (__VLS_ctx.name),
    ...{ class: "name ellipsis" },
});
(__VLS_ctx.name);
if (__VLS_ctx.isDefault) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "default" },
    });
    (__VLS_ctx.$t('model.default_model'));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "type-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "type" },
});
(__VLS_ctx.$t('model.model_type'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.modelType.startsWith('modelType.') ? __VLS_ctx.$t(__VLS_ctx.modelType) : __VLS_ctx.modelType);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "type-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "type" },
});
(__VLS_ctx.$t('model.basic_model'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.baseModel);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methods" },
});
if (__VLS_ctx.isDefault) {
    const __VLS_0 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        effect: "dark",
        content: (__VLS_ctx.$t('common.the_default_model')),
        placement: "top",
    }));
    const __VLS_2 = __VLS_1({
        effect: "dark",
        content: (__VLS_ctx.$t('common.the_default_model')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        secondary: true,
        disabled: true,
    }));
    const __VLS_6 = __VLS_5({
        secondary: true,
        disabled: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_10 = __VLS_9({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.icon_admin_outlined;
    /** @type {[typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
    (__VLS_ctx.$t('common.as_default_model'));
    var __VLS_7;
    var __VLS_3;
}
else {
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.handleDefault)
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
    const __VLS_28 = {}.icon_admin_outlined;
    /** @type {[typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, typeof __VLS_components.Icon_admin_outlined, typeof __VLS_components.icon_admin_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    var __VLS_27;
    (__VLS_ctx.$t('common.as_default_model'));
    var __VLS_19;
}
const __VLS_32 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.handleEdit)
};
__VLS_35.slots.default;
const __VLS_40 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ style: {} },
    size: "16",
}));
const __VLS_42 = __VLS_41({
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.edit;
/** @type {[typeof __VLS_components.Edit, typeof __VLS_components.edit, typeof __VLS_components.Edit, typeof __VLS_components.edit, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
(__VLS_ctx.$t('dashboard.edit'));
var __VLS_35;
const __VLS_48 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (__VLS_ctx.handleDel)
};
__VLS_51.slots.default;
const __VLS_56 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ style: {} },
    size: "16",
}));
const __VLS_58 = __VLS_57({
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.delIcon;
/** @type {[typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_59;
(__VLS_ctx.$t('dashboard.delete'));
var __VLS_51;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['name-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['default']} */ ;
/** @type {__VLS_StyleScopedClasses['type-value']} */ ;
/** @type {__VLS_StyleScopedClasses['type']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['type-value']} */ ;
/** @type {__VLS_StyleScopedClasses['type']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['methods']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            delIcon: delIcon,
            icon_admin_outlined: icon_admin_outlined,
            edit: edit,
            errorMsg: errorMsg,
            current_supplier: current_supplier,
            handleDefault: handleDefault,
            handleDel: handleDel,
            handleEdit: handleEdit,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
