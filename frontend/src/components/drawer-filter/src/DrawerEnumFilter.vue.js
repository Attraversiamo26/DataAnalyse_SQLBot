import { propTypes } from '@/utils/propTypes';
import { reactive } from 'vue';
import { useEmitt } from '@/utils/useEmitt';
const props = defineProps({
    optionList: propTypes.arrayOf(propTypes.shape({
        id: propTypes.string,
        name: propTypes.string,
    })),
    index: propTypes.number,
    title: propTypes.string,
});
const state = reactive({
    activeStatus: [],
    optionList: [],
});
const nodeChange = (id) => {
    const len = state.activeStatus.indexOf(id);
    if (len >= 0) {
        state.activeStatus.splice(len, 1);
    }
    else {
        state.activeStatus.push(id);
    }
    emits('filter-change', state.activeStatus);
};
const emits = defineEmits(['filter-change']);
const clear = (index) => {
    if (index !== props.index)
        return;
    state.activeStatus = [];
};
useEmitt({
    name: 'clear-drawer_main',
    callback: clear,
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "draw-filter_enum" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-item" },
});
for (const [ele] of __VLS_getVForSourceType((props.optionList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.nodeChange(ele.id);
            } },
        key: (ele.id),
        ...{ class: "item" },
        ...{ class: ([__VLS_ctx.state.activeStatus.includes(ele.id) ? 'active' : '']) },
    });
    (ele.name);
}
/** @type {__VLS_StyleScopedClasses['draw-filter_enum']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            state: state,
            nodeChange: nodeChange,
        };
    },
    emits: {},
    props: {
        optionList: propTypes.arrayOf(propTypes.shape({
            id: propTypes.string,
            name: propTypes.string,
        })),
        index: propTypes.number,
        title: propTypes.string,
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        optionList: propTypes.arrayOf(propTypes.shape({
            id: propTypes.string,
            name: propTypes.string,
        })),
        index: propTypes.number,
        title: propTypes.string,
    },
});
; /* PartiallyEnd: #4569/main.vue */
