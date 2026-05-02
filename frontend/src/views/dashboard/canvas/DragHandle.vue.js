const __VLS_props = defineProps({
    sizeList: {
        type: Array,
        required: false,
        // eslint-disable-next-line vue/require-valid-default-prop
        default: [16, 16, 16, 16],
    },
});
const shadowStyle = (size, index) => {
    if (index === 0) {
        return {
            top: 0,
            left: 0,
            width: '100%',
            height: `${size}px`,
        };
    }
    else if (index === 1) {
        return {
            top: 0,
            right: 0,
            width: `${size}px`,
            height: '100%',
        };
    }
    else if (index === 2) {
        return {
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${size}px`,
        };
    }
    else if (index === 3) {
        return {
            top: 0,
            left: 0,
            width: `${size}px`,
            height: '100%',
        };
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
for (const [size, index] of __VLS_getVForSourceType((__VLS_ctx.sizeList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "dragHandle dragArea" },
        ...{ style: (__VLS_ctx.shadowStyle(size, index)) },
    });
}
/** @type {__VLS_StyleScopedClasses['dragHandle']} */ ;
/** @type {__VLS_StyleScopedClasses['dragArea']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            shadowStyle: shadowStyle,
        };
    },
    props: {
        sizeList: {
            type: Array,
            required: false,
            // eslint-disable-next-line vue/require-valid-default-prop
            default: [16, 16, 16, 16],
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        sizeList: {
            type: Array,
            required: false,
            // eslint-disable-next-line vue/require-valid-default-prop
            default: [16, 16, 16, 16],
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
