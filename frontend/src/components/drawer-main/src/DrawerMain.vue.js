import { ref, reactive, computed } from 'vue';
import { ElDrawer, ElButton } from 'element-plus-secondary';
import { propTypes } from '@/utils/propTypes';
import DrawerFilter from '@/components/drawer-filter/src/DrawerFilter.vue';
import DrawerEnumFilter from '@/components/drawer-filter/src/DrawerEnumFilter.vue';
import { useEmitt } from '@/utils/useEmitt';
import { useI18n } from 'vue-i18n';
import DrawerTreeFilter from '@/components/drawer-filter/src/DrawerTreeFilter.vue';
import DrawerTimeFilter from '@/components/drawer-filter/src/DrawerTimeFilter.vue';
const { t } = useI18n();
const props = defineProps({
    filterOptions: propTypes.arrayOf(propTypes.shape({
        type: propTypes.string,
        field: propTypes.string,
        option: propTypes.array,
        title: propTypes.string,
        property: propTypes.shape({}),
    })),
    title: propTypes.string,
});
const componentList = computed(() => {
    return props.filterOptions;
});
const state = reactive({
    conditions: [],
});
const userDrawer = ref(false);
const init = () => {
    userDrawer.value = true;
};
const clear = (index) => {
    useEmitt().emitter.emit('clear-drawer_main', index);
};
const cleanrInnerValue = (index) => {
    const field = componentList.value[index]?.field;
    if (!field) {
        return;
    }
    clear(index);
    for (let i = 0; i < state.conditions.length; i++) {
        if (state.conditions[i].field === field) {
            state.conditions[i].value = [];
        }
    }
};
const clearInnerTag = (index) => {
    if (isNaN(index)) {
        for (let i = 0; i < componentList.value.length; i++) {
            clear(i);
        }
        return;
    }
    const condition = state.conditions[index];
    const field = condition?.field;
    for (let i = 0; i < componentList.value.length; i++) {
        if (componentList.value[i].field === field) {
            clear(i);
        }
    }
};
const clearFilter = (id) => {
    clearInnerTag(id);
    if (isNaN(id)) {
        const len = state.conditions.length;
        state.conditions.splice(0, len);
    }
    else {
        state.conditions.splice(id, 1);
    }
    trigger();
};
const filterChange = (value, field, operator) => {
    let exits = false;
    let len = state.conditions.length;
    while (len--) {
        const condition = state.conditions[len];
        if (condition.field === field) {
            exits = true;
            condition['value'] = value;
        }
        if (!condition?.value?.length) {
            state.conditions.splice(len, 1);
        }
    }
    if (!exits && value?.length) {
        state.conditions.push({ field, value, operator });
    }
    treeFilterChange(value, field, operator);
};
const reset = () => {
    clearFilter();
    userDrawer.value = false;
};
const close = () => {
    userDrawer.value = false;
};
const emits = defineEmits(['trigger-filter', 'tree-filter-change']);
const trigger = () => {
    emits('trigger-filter', state.conditions);
};
const treeFilterChange = (value, field, operator) => {
    emits('tree-filter-change', {
        value,
        field,
        operator,
    });
};
const __VLS_exposed = {
    init,
    clearFilter,
    close,
    cleanrInnerValue,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.userDrawer),
    title: (__VLS_ctx.t('user.filter_conditions')),
    size: "600px",
    modalClass: "drawer-main-container",
    direction: "rtl",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.userDrawer),
    title: (__VLS_ctx.t('user.filter_conditions')),
    size: "600px",
    modalClass: "drawer-main-container",
    direction: "rtl",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
for (const [component, index] of __VLS_getVForSourceType((__VLS_ctx.componentList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
    });
    if (component.type === 'tree-select') {
        /** @type {[typeof DrawerTreeFilter, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(DrawerTreeFilter, new DrawerTreeFilter({
            ...{ 'onFilterChange': {} },
            optionList: (component.option),
            title: (component.title),
            property: (component.property),
            index: (index),
        }));
        const __VLS_6 = __VLS_5({
            ...{ 'onFilterChange': {} },
            optionList: (component.option),
            title: (component.title),
            property: (component.property),
            index: (index),
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        let __VLS_8;
        let __VLS_9;
        let __VLS_10;
        const __VLS_11 = {
            onFilterChange: ((v) => __VLS_ctx.filterChange(v, component.field, 'in'))
        };
        var __VLS_7;
    }
    if (component.type === 'select') {
        /** @type {[typeof DrawerFilter, ]} */ ;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent(DrawerFilter, new DrawerFilter({
            ...{ 'onFilterChange': {} },
            optionList: (component.option),
            title: (component.title),
            index: (index),
            property: (component.property),
        }));
        const __VLS_13 = __VLS_12({
            ...{ 'onFilterChange': {} },
            optionList: (component.option),
            title: (component.title),
            index: (index),
            property: (component.property),
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        let __VLS_15;
        let __VLS_16;
        let __VLS_17;
        const __VLS_18 = {
            onFilterChange: ((v) => __VLS_ctx.filterChange(v, component.field, 'in'))
        };
        var __VLS_14;
    }
    if (component.type === 'enum') {
        /** @type {[typeof DrawerEnumFilter, ]} */ ;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(DrawerEnumFilter, new DrawerEnumFilter({
            ...{ 'onFilterChange': {} },
            optionList: (component.option),
            title: (component.title),
            index: (index),
        }));
        const __VLS_20 = __VLS_19({
            ...{ 'onFilterChange': {} },
            optionList: (component.option),
            title: (component.title),
            index: (index),
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        let __VLS_22;
        let __VLS_23;
        let __VLS_24;
        const __VLS_25 = {
            onFilterChange: ((v) => __VLS_ctx.filterChange(v, component.field, 'in'))
        };
        var __VLS_21;
    }
    if (component.type === 'time') {
        /** @type {[typeof DrawerTimeFilter, ]} */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(DrawerTimeFilter, new DrawerTimeFilter({
            ...{ 'onFilterChange': {} },
            title: (component.title),
            property: (component.property),
            index: (index),
        }));
        const __VLS_27 = __VLS_26({
            ...{ 'onFilterChange': {} },
            title: (component.title),
            property: (component.property),
            index: (index),
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        let __VLS_29;
        let __VLS_30;
        let __VLS_31;
        const __VLS_32 = {
            onFilterChange: ((v) => __VLS_ctx.filterChange(v, component.field, component.operator))
        };
        var __VLS_28;
    }
}
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_33 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_35 = __VLS_34({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    let __VLS_37;
    let __VLS_38;
    let __VLS_39;
    const __VLS_40 = {
        onClick: (__VLS_ctx.reset)
    };
    __VLS_36.slots.default;
    (__VLS_ctx.t('common.reset'));
    var __VLS_36;
    const __VLS_41 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_43 = __VLS_42({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_45;
    let __VLS_46;
    let __VLS_47;
    const __VLS_48 = {
        onClick: (__VLS_ctx.trigger)
    };
    __VLS_44.slots.default;
    (__VLS_ctx.t('common.search'));
    var __VLS_44;
}
var __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElDrawer: ElDrawer,
            ElButton: ElButton,
            DrawerFilter: DrawerFilter,
            DrawerEnumFilter: DrawerEnumFilter,
            DrawerTreeFilter: DrawerTreeFilter,
            DrawerTimeFilter: DrawerTimeFilter,
            t: t,
            componentList: componentList,
            userDrawer: userDrawer,
            filterChange: filterChange,
            reset: reset,
            trigger: trigger,
        };
    },
    emits: {},
    props: {
        filterOptions: propTypes.arrayOf(propTypes.shape({
            type: propTypes.string,
            field: propTypes.string,
            option: propTypes.array,
            title: propTypes.string,
            property: propTypes.shape({}),
        })),
        title: propTypes.string,
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
        filterOptions: propTypes.arrayOf(propTypes.shape({
            type: propTypes.string,
            field: propTypes.string,
            option: propTypes.array,
            title: propTypes.string,
            property: propTypes.shape({}),
        })),
        title: propTypes.string,
    },
});
; /* PartiallyEnd: #4569/main.vue */
