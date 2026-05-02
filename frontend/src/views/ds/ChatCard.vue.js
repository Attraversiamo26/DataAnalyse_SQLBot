import icon_form_outlined from '@/assets/svg/icon_form_outlined.svg';
import { computed } from 'vue';
import { dsTypeWithImg } from './js/ds-type';
const props = withDefaults(defineProps(), {
    name: '-',
    type: '-',
    description: '-',
    id: '-',
    typeName: '-',
    isSelected: false,
});
const emits = defineEmits(['selectDs']);
const icon = computed(() => {
    return (dsTypeWithImg.find((ele) => props.type === ele.type) || {}).img;
});
const SelectDs = () => {
    emits('selectDs');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    name: '-',
    type: '-',
    description: '-',
    id: '-',
    typeName: '-',
    isSelected: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.SelectDs) },
    ...{ class: "card" },
    ...{ class: (__VLS_ctx.isSelected && 'is-selected') },
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
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_form_outlined: icon_form_outlined,
            icon: icon,
            SelectDs: SelectDs,
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
