const __VLS_props = defineProps({
    startResize: {
        type: Function,
        default: () => {
            return {};
        },
    },
});
const cursors = {
    lt: 'nw',
    t: 'n',
    rt: 'ne',
    r: 'e',
    rb: 'se',
    b: 's',
    lb: 'sw',
    l: 'w',
};
function getPointStyle(point) {
    const hasT = /t/.test(point);
    const hasB = /b/.test(point);
    const hasL = /l/.test(point);
    const hasR = /r/.test(point);
    let newLeft = '0px';
    let newTop = '0px';
    // Points at the four corners
    if (point.length === 2) {
        newLeft = hasL ? '3px' : 'calc(100% - 3px)';
        newTop = hasT ? '3px' : 'calc(100% - 3px)';
    }
    else {
        // The point between the upper and lower points, with a width centered
        if (hasT || hasB) {
            newLeft = '50%';
            newTop = hasT ? '0px' : '100%';
        }
        // The points on both sides are centered in height
        if (hasL || hasR) {
            newLeft = hasL ? '0px' : '100%';
            newTop = '50%';
        }
    }
    return {
        marginLeft: '-4px',
        marginTop: '-4px',
        left: `${newLeft}`,
        top: `${newTop}`,
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        cursor: `${cursors[point]}-resize`,
    };
}
const pointList = ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'];
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
for (const [point] of __VLS_getVForSourceType((__VLS_ctx.pointList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (...[$event]) => {
                __VLS_ctx.startResize($event, point);
            } },
        key: (point),
        ...{ class: "resizeHandle" },
        ...{ style: (__VLS_ctx.getPointStyle(point)) },
    });
}
/** @type {__VLS_StyleScopedClasses['resizeHandle']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getPointStyle: getPointStyle,
            pointList: pointList,
        };
    },
    props: {
        startResize: {
            type: Function,
            default: () => {
                return {};
            },
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        startResize: {
            type: Function,
            default: () => {
                return {};
            },
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
