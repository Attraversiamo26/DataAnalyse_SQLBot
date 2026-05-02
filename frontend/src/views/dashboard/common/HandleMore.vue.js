import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg';
const __VLS_props = withDefaults(defineProps(), {
    placement: 'bottom-end',
    iconSize: '16px',
    inTable: false,
});
const handleCommand = (command) => {
    emit('handleCommand', command);
};
const emit = defineEmits(['handleCommand']);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    placement: 'bottom-end',
    iconSize: '16px',
    inTable: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDropdown;
/** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onCommand': {} },
    popperClass: "menu-more_popper",
    placement: (__VLS_ctx.placement),
    persistent: (false),
    trigger: "click",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onCommand': {} },
    popperClass: "menu-more_popper",
    placement: (__VLS_ctx.placement),
    persistent: (false),
    trigger: "click",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onCommand: (__VLS_ctx.handleCommand)
};
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_9 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onClick': {} },
    ...{ class: "hover-icon" },
    ...{ class: (__VLS_ctx.inTable && 'hover-icon-in-table') },
}));
const __VLS_11 = __VLS_10({
    ...{ 'onClick': {} },
    ...{ class: "hover-icon" },
    ...{ class: (__VLS_ctx.inTable && 'hover-icon-in-table') },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onClick: () => { }
};
__VLS_12.slots.default;
const __VLS_17 = ((__VLS_ctx.iconName || __VLS_ctx.icon_more_outlined));
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ class: "svg-icon" },
}));
const __VLS_19 = __VLS_18({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
var __VLS_12;
{
    const { dropdown: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_21 = {}.ElDropdownMenu;
    /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        persistent: (false),
    }));
    const __VLS_23 = __VLS_22({
        persistent: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.menuList))) {
        const __VLS_25 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
            divided: (ele.divided),
            command: (ele.command),
            disabled: (ele.disabled),
        }));
        const __VLS_27 = __VLS_26({
            divided: (ele.divided),
            command: (ele.command),
            disabled: (ele.disabled),
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_28.slots.default;
        if (ele.svgName) {
            const __VLS_29 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
                ...{ class: "handle-icon" },
                ...{ style: ({ fontSize: __VLS_ctx.iconSize }) },
            }));
            const __VLS_31 = __VLS_30({
                ...{ class: "handle-icon" },
                ...{ style: ({ fontSize: __VLS_ctx.iconSize }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            __VLS_32.slots.default;
            const __VLS_33 = ((ele.svgName));
            // @ts-ignore
            const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
            const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
            var __VLS_32;
        }
        (ele.label);
        var __VLS_28;
    }
    var __VLS_24;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['hover-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['handle-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_more_outlined: icon_more_outlined,
            handleCommand: handleCommand,
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
