import { propTypes } from '@/utils/propTypes';
import { ElTreeSelect } from 'element-plus-secondary';
import { computed, reactive, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEmitt } from '@/utils/useEmitt.ts';
const { t } = useI18n();
const props = defineProps({
    optionList: propTypes.arrayOf(propTypes.shape({
        value: propTypes.string,
        label: propTypes.string,
        children: Array,
        disabled: Boolean,
    })),
    index: propTypes.number,
    title: propTypes.string,
    property: {
        type: Object,
        default: () => ({}),
    },
});
const { property } = toRefs(props);
const treeConfig = computed(() => {
    let obj = Object.assign({
        checkStrictly: false,
        showCheckbox: true,
        checkOnClickNode: true,
        placeholder: t('user.role'),
    }, property.value);
    return obj;
});
const state = reactive({
    currentStatus: [],
    activeStatus: [],
});
const emits = defineEmits(['filter-change']);
const filterTree = ref();
const treeChange = () => {
    const nodes = state.currentStatus.map((id) => {
        return filterTree.value?.getNode(id).data;
    });
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    state.activeStatus = [...nodes];
    emits('filter-change', 
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    state.activeStatus.map((item) => item.value));
};
const optionListNotSelect = computed(() => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    return [...props.optionList];
});
const clear = (index) => {
    if (index !== props.index)
        return;
    state.currentStatus = [];
};
useEmitt({
    name: 'clear-drawer_main',
    callback: clear,
});
watch(() => state.currentStatus, () => {
    treeChange();
}, {
    immediate: true,
});
const __VLS_exposed = {
    clear,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "draw-filter_tree" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-item" },
});
const __VLS_0 = {}.ElTreeSelect;
/** @type {[typeof __VLS_components.ElTreeSelect, typeof __VLS_components.elTreeSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "filterTree",
    modelValue: (__VLS_ctx.state.currentStatus),
    nodeKey: "value",
    teleported: (false),
    ...{ style: {} },
    data: (__VLS_ctx.optionListNotSelect),
    highlightCurrent: (true),
    multiple: true,
    renderAfterExpand: (false),
    placeholder: (__VLS_ctx.t('datasource.Please_select') + __VLS_ctx.treeConfig.placeholder),
    showCheckbox: (__VLS_ctx.treeConfig.showCheckbox),
    checkStrictly: (__VLS_ctx.treeConfig.checkStrictly),
    checkOnClickNode: (__VLS_ctx.treeConfig.checkOnClickNode),
}));
const __VLS_2 = __VLS_1({
    ref: "filterTree",
    modelValue: (__VLS_ctx.state.currentStatus),
    nodeKey: "value",
    teleported: (false),
    ...{ style: {} },
    data: (__VLS_ctx.optionListNotSelect),
    highlightCurrent: (true),
    multiple: true,
    renderAfterExpand: (false),
    placeholder: (__VLS_ctx.t('datasource.Please_select') + __VLS_ctx.treeConfig.placeholder),
    showCheckbox: (__VLS_ctx.treeConfig.showCheckbox),
    checkStrictly: (__VLS_ctx.treeConfig.checkStrictly),
    checkOnClickNode: (__VLS_ctx.treeConfig.checkOnClickNode),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.filterTree} */ ;
var __VLS_4 = {};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['draw-filter_tree']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElTreeSelect: ElTreeSelect,
            t: t,
            treeConfig: treeConfig,
            state: state,
            filterTree: filterTree,
            optionListNotSelect: optionListNotSelect,
        };
    },
    emits: {},
    props: {
        optionList: propTypes.arrayOf(propTypes.shape({
            value: propTypes.string,
            label: propTypes.string,
            children: Array,
            disabled: Boolean,
        })),
        index: propTypes.number,
        title: propTypes.string,
        property: {
            type: Object,
            default: () => ({}),
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    props: {
        optionList: propTypes.arrayOf(propTypes.shape({
            value: propTypes.string,
            label: propTypes.string,
            children: Array,
            disabled: Boolean,
        })),
        index: propTypes.number,
        title: propTypes.string,
        property: {
            type: Object,
            default: () => ({}),
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
