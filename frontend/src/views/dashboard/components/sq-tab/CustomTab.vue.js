import { computed } from 'vue';
const props = defineProps({
    hideTitle: Boolean,
    /*Color can be a word, such as red; It can also be a color value*/
    //Font color
    fontColor: { type: String, default: '' },
    // Activate font color
    activeColor: { type: String, default: '' },
    //If the border color is none, there will be no border.
    // If it is none, the activated slide line of the Card type will also disappear
    borderColor: { type: String, default: '' },
    //Activate border color currently only for card types
    borderActiveColor: { type: String, default: '' },
    //The style type radioGroup is only valid for Card type,
    // and it must be given as borderColor borderActiveColor
    styleType: {
        type: String,
        default: '',
        validator: (val) => ['', 'radioGroup'].includes(val),
    },
});
const tabStyle = computed(() => [
    { '--de-font-color': props.fontColor },
    { '--de-active-color': props.activeColor },
    { '--de-border-color': props.borderColor },
    { '--de-border-active-color': props.borderActiveColor },
]);
const tabClassName = computed(() => props.styleType
    ? [props.styleType, props.fontColor && 'fontColor', props.activeColor && 'activeColor']
    : [
        props.fontColor && 'fontColor',
        props.activeColor && 'activeColor',
        noBorder.value ? 'noBorder' : props.borderColor && 'borderColor',
        props.borderActiveColor && 'borderActiveColor',
        props.hideTitle && 'no-header',
    ]);
const noBorder = computed(() => props.borderColor === 'none');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: (['de-tabs', ...__VLS_ctx.tabClassName]) },
    ...{ style: (__VLS_ctx.tabStyle) },
}));
const __VLS_2 = __VLS_1({
    ...{ class: (['de-tabs', ...__VLS_ctx.tabClassName]) },
    ...{ style: (__VLS_ctx.tabStyle) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
var __VLS_5 = {};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['de-tabs']} */ ;
// @ts-ignore
var __VLS_6 = __VLS_5;
[__VLS_dollars.$attrs,];
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            tabStyle: tabStyle,
            tabClassName: tabClassName,
        };
    },
    props: {
        hideTitle: Boolean,
        /*Color can be a word, such as red; It can also be a color value*/
        //Font color
        fontColor: { type: String, default: '' },
        // Activate font color
        activeColor: { type: String, default: '' },
        //If the border color is none, there will be no border.
        // If it is none, the activated slide line of the Card type will also disappear
        borderColor: { type: String, default: '' },
        //Activate border color currently only for card types
        borderActiveColor: { type: String, default: '' },
        //The style type radioGroup is only valid for Card type,
        // and it must be given as borderColor borderActiveColor
        styleType: {
            type: String,
            default: '',
            validator: (val) => ['', 'radioGroup'].includes(val),
        },
    },
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        hideTitle: Boolean,
        /*Color can be a word, such as red; It can also be a color value*/
        //Font color
        fontColor: { type: String, default: '' },
        // Activate font color
        activeColor: { type: String, default: '' },
        //If the border color is none, there will be no border.
        // If it is none, the activated slide line of the Card type will also disappear
        borderColor: { type: String, default: '' },
        //Activate border color currently only for card types
        borderActiveColor: { type: String, default: '' },
        //The style type radioGroup is only valid for Card type,
        // and it must be given as borderColor borderActiveColor
        styleType: {
            type: String,
            default: '',
            validator: (val) => ['', 'radioGroup'].includes(val),
        },
    },
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
