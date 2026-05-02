import { ref, toRefs, computed } from 'vue';
import ResizeHandle from '@/views/dashboard/canvas/ResizeHandle.vue';
import DragHandle from '@/views/dashboard/canvas/DragHandle.vue';
import ComponentBar from '@/views/dashboard/canvas/ComponentBar.vue';
const emits = defineEmits(['enlargeView']);
const shapeRef = ref(null);
// Props
const props = defineProps({
    configItem: {
        type: Object,
        required: true,
    },
    canEdit: {
        type: Boolean,
        default: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    itemIndex: {
        type: Number,
        required: true,
    },
    moveAnimate: {
        type: Boolean,
        required: true,
    },
    draggable: {
        type: Boolean,
        required: true,
    },
    startMove: {
        type: Function,
        default: () => {
            return {};
        },
    },
    startResize: {
        type: Function,
        default: () => {
            return {};
        },
    },
    canvasId: {
        type: String,
        default: 'canvas-main',
    },
});
const { draggable } = toRefs(props);
const shapeClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
};
const dragDandleValue = computed(() => props.canEdit && !props.configItem.editing);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.shapeClick) },
    ...{ onMousedown: (...[$event]) => {
            __VLS_ctx.startMove($event, __VLS_ctx.configItem, __VLS_ctx.itemIndex);
        } },
    ref: "shapeRef",
    ...{ class: ({
            item: true,
            itemActive: __VLS_ctx.active,
            itemCursorDefault: __VLS_ctx.configItem.component === 'SQTab',
            moveAnimation: __VLS_ctx.moveAnimate,
            movingItem: __VLS_ctx.configItem.isPlayer,
            canNotDrag: !__VLS_ctx.draggable,
        }) },
});
/** @type {typeof __VLS_ctx.shapeRef} */ ;
/** @type {[typeof ComponentBar, typeof ComponentBar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ComponentBar, new ComponentBar({
    ...{ 'onEnlargeView': {} },
    configItem: (__VLS_ctx.configItem),
    active: (__VLS_ctx.active && __VLS_ctx.canEdit),
    showPosition: ('canvas'),
    canvasId: (__VLS_ctx.canvasId),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onEnlargeView': {} },
    configItem: (__VLS_ctx.configItem),
    active: (__VLS_ctx.active && __VLS_ctx.canEdit),
    showPosition: ('canvas'),
    canvasId: (__VLS_ctx.canvasId),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onEnlargeView: (() => __VLS_ctx.emits('enlargeView'))
};
var __VLS_2;
if (__VLS_ctx.dragDandleValue) {
    /** @type {[typeof DragHandle, typeof DragHandle, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(DragHandle, new DragHandle({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
}
var __VLS_10 = {};
if (__VLS_ctx.active && __VLS_ctx.canEdit) {
    /** @type {[typeof ResizeHandle, typeof ResizeHandle, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(ResizeHandle, new ResizeHandle({
        startResize: ((event, point) => __VLS_ctx.startResize(event, point, __VLS_ctx.configItem, __VLS_ctx.itemIndex)),
    }));
    const __VLS_13 = __VLS_12({
        startResize: ((event, point) => __VLS_ctx.startResize(event, point, __VLS_ctx.configItem, __VLS_ctx.itemIndex)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
}
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['itemActive']} */ ;
/** @type {__VLS_StyleScopedClasses['itemCursorDefault']} */ ;
/** @type {__VLS_StyleScopedClasses['moveAnimation']} */ ;
/** @type {__VLS_StyleScopedClasses['movingItem']} */ ;
/** @type {__VLS_StyleScopedClasses['canNotDrag']} */ ;
// @ts-ignore
var __VLS_11 = __VLS_10;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ResizeHandle: ResizeHandle,
            DragHandle: DragHandle,
            ComponentBar: ComponentBar,
            emits: emits,
            shapeRef: shapeRef,
            draggable: draggable,
            shapeClick: shapeClick,
            dragDandleValue: dragDandleValue,
        };
    },
    emits: {},
    props: {
        configItem: {
            type: Object,
            required: true,
        },
        canEdit: {
            type: Boolean,
            default: true,
        },
        active: {
            type: Boolean,
            default: false,
        },
        itemIndex: {
            type: Number,
            required: true,
        },
        moveAnimate: {
            type: Boolean,
            required: true,
        },
        draggable: {
            type: Boolean,
            required: true,
        },
        startMove: {
            type: Function,
            default: () => {
                return {};
            },
        },
        startResize: {
            type: Function,
            default: () => {
                return {};
            },
        },
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
    },
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        configItem: {
            type: Object,
            required: true,
        },
        canEdit: {
            type: Boolean,
            default: true,
        },
        active: {
            type: Boolean,
            default: false,
        },
        itemIndex: {
            type: Number,
            required: true,
        },
        moveAnimate: {
            type: Boolean,
            required: true,
        },
        draggable: {
            type: Boolean,
            required: true,
        },
        startMove: {
            type: Function,
            default: () => {
                return {};
            },
        },
        startResize: {
            type: Function,
            default: () => {
                return {};
            },
        },
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
    },
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
