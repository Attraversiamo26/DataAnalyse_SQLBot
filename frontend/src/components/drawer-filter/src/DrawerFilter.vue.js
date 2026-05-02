import { propTypes } from '@/utils/propTypes';
import { ElSelect, ElOption } from 'element-plus-secondary';
import { computed, reactive } from 'vue';
import { useEmitt } from '@/utils/useEmitt';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps({
    optionList: propTypes.arrayOf(propTypes.shape({
        id: propTypes.string,
        name: propTypes.string,
    })),
    index: propTypes.number,
    title: propTypes.string,
    property: {
        type: Object,
        default: () => ({}),
    },
});
const state = reactive({
    activeStatus: [],
});
const emits = defineEmits(['filter-change']);
const selectStatus = (ids) => {
    emits('filter-change', ids.map((item) => item.id || item.value));
};
const optionListNotSelect = computed(() => {
    return [...props.optionList];
});
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
    ...{ class: "draw-filter_base" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-item" },
});
const __VLS_0 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.state.activeStatus),
    teleported: (false),
    ...{ style: {} },
    valueKey: "id",
    filterable: true,
    placeholder: (__VLS_ctx.t('datasource.Please_select') + props.property.placeholder),
    multiple: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.state.activeStatus),
    teleported: (false),
    ...{ style: {} },
    valueKey: "id",
    filterable: true,
    placeholder: (__VLS_ctx.t('datasource.Please_select') + props.property.placeholder),
    multiple: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.selectStatus)
};
__VLS_3.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.optionListNotSelect))) {
    const __VLS_8 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (item.name),
        label: (item.name),
        value: (item),
    }));
    const __VLS_10 = __VLS_9({
        key: (item.name),
        label: (item.name),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['draw-filter_base']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElSelect: ElSelect,
            ElOption: ElOption,
            t: t,
            state: state,
            selectStatus: selectStatus,
            optionListNotSelect: optionListNotSelect,
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
        property: {
            type: Object,
            default: () => ({}),
        },
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
        property: {
            type: Object,
            default: () => ({}),
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
