import icon_form_outlined from '@/assets/svg/icon_form_outlined.svg';
import icon_personal_privacy_outlined from '@/assets/embedded/icon_personal-privacy_outlined.svg';
import icon_community_tab_outlined from '@/assets/embedded/icon_community-tab_outlined.svg';
import { computed } from 'vue';
import { dsTypeWithImg } from '@/views/ds/js/ds-type';
const props = withDefaults(defineProps(), {
    name: '-',
    type: '-',
    description: '-',
    isPrivate: false,
    typeName: '-',
    num: '-',
});
const emits = defineEmits(['active', 'private', 'public']);
const icon = computed(() => {
    return (dsTypeWithImg.find((ele) => props.type === ele.type) || {}).img;
});
const handleActive = () => {
    emits('active');
};
const handlePrivate = () => {
    emits('private');
};
const handlePublic = () => {
    emits('public');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    name: '-',
    type: '-',
    description: '-',
    isPrivate: false,
    typeName: '-',
    num: '-',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['methods']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleActive) },
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
    ...{ class: "name ellipsis" },
    title: (__VLS_ctx.name),
});
(__VLS_ctx.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "type" },
});
(__VLS_ctx.typeName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "default" },
    ...{ class: (__VLS_ctx.isPrivate && 'is-private') },
});
(__VLS_ctx.isPrivate ? __VLS_ctx.$t('embedded.private') : __VLS_ctx.$t('embedded.public'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
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
if (__VLS_ctx.isPrivate) {
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.handlePublic)
    };
    __VLS_11.slots.default;
    const __VLS_16 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_18 = __VLS_17({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.icon_community_tab_outlined;
    /** @type {[typeof __VLS_components.Icon_community_tab_outlined, typeof __VLS_components.icon_community_tab_outlined, typeof __VLS_components.Icon_community_tab_outlined, typeof __VLS_components.icon_community_tab_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    var __VLS_19;
    (__VLS_ctx.$t('embedded.set_to_public'));
    var __VLS_11;
}
else {
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.handlePrivate)
    };
    __VLS_27.slots.default;
    const __VLS_32 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_34 = __VLS_33({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.icon_personal_privacy_outlined;
    /** @type {[typeof __VLS_components.Icon_personal_privacy_outlined, typeof __VLS_components.icon_personal_privacy_outlined, typeof __VLS_components.Icon_personal_privacy_outlined, typeof __VLS_components.icon_personal_privacy_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    var __VLS_35;
    (__VLS_ctx.$t('embedded.set_to_private'));
    var __VLS_27;
}
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['name-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['type']} */ ;
/** @type {__VLS_StyleScopedClasses['default']} */ ;
/** @type {__VLS_StyleScopedClasses['type-value']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-info']} */ ;
/** @type {__VLS_StyleScopedClasses['form-rate']} */ ;
/** @type {__VLS_StyleScopedClasses['form-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['methods']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_form_outlined: icon_form_outlined,
            icon_personal_privacy_outlined: icon_personal_privacy_outlined,
            icon_community_tab_outlined: icon_community_tab_outlined,
            icon: icon,
            handleActive: handleActive,
            handlePrivate: handlePrivate,
            handlePublic: handlePublic,
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
