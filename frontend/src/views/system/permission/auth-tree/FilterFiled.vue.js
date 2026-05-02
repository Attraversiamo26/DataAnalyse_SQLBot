import icon_deleteTrash_outlined from '@/assets/svg/icon_delete.svg';
import { ref, inject, computed, onBeforeMount, toRefs, shallowRef } from 'vue';
import { variablesApi } from '@/api/variables';
import { useI18n } from 'vue-i18n';
import { allOptions } from '../options';
const props = withDefaults(defineProps(), {
    index: 0,
    item: () => ({
        term: '',
        field_id: '',
        filter_type: '',
        enum_value: '',
        name: '',
        value: null,
        value_type: 'normal',
        variable_id: undefined,
    }),
});
const { t } = useI18n();
const showDel = ref(false);
const keywords = ref('');
const activeName = ref();
const checklist = ref([]);
const filterList = ref([]);
const variables = shallowRef([]);
const valueTypeList = [
    {
        value: 'normal',
        label: t('variables.normal_value'),
    },
    {
        value: 'variable',
        label: t('variables.system_variables'),
    },
];
const { item } = toRefs(props);
const filedList = inject('filedList');
const computedWidth = computed(() => {
    const { field_id } = item.value;
    return {
        width: !field_id ? '270px' : '770px',
    };
});
const operators = computed(() => {
    return allOptions;
});
const computedFiledList = computed(() => {
    return filedList.value || [];
});
const dimensions = computed(() => {
    if (!keywords.value)
        return computedFiledList.value;
    return computedFiledList.value.filter((ele) => ele.name.includes(keywords.value));
});
onBeforeMount(() => {
    initNameEnumName();
    filterListInit();
    getVariables();
});
const getVariables = () => {
    variablesApi.listAll().then((res) => {
        variables.value = res || [];
    });
};
const initNameEnumName = () => {
    const { name, enum_value, field_id } = item.value;
    dimensions.value.forEach((ele) => {
        if (+ele.id === +field_id) {
            activeName.value = ele;
        }
    });
    const arr = enum_value.trim() ? enum_value.split(',') : [];
    if (!name && field_id) {
        checklist.value = arr;
    }
    if (!name && !field_id)
        return;
    initEnumOptions();
    checklist.value = arr;
};
const filterTypeChange = () => {
    item.value.term = '';
    item.value.value = null;
    initEnumOptions();
};
const initEnumOptions = () => {
    console.info('initEnumOptions');
};
const selectItem = ({ field_name, id }) => {
    Object.assign(item.value, {
        field_id: id,
        name: field_name,
        filter_type: 'logic',
        value: '',
        term: '',
        variable_id: undefined,
        value_type: 'normal',
    });
    filterListInit();
    checklist.value = [];
};
const filterListInit = () => {
    filterList.value = [
        {
            value: 'logic',
            label: t('permission.conditional_filtering'),
        },
    ];
};
const emits = defineEmits(['update:item', 'del']);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    index: 0,
    item: () => ({
        term: '',
        field_id: '',
        filter_type: '',
        enum_value: '',
        name: '',
        value: null,
        value_type: 'normal',
        variable_id: undefined,
    }),
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "white-nowrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onMouseover: (...[$event]) => {
            __VLS_ctx.showDel = true;
        } },
    ...{ onMouseleave: (...[$event]) => {
            __VLS_ctx.showDel = false;
        } },
    ...{ class: "filed" },
    ...{ style: (__VLS_ctx.computedWidth) },
});
const __VLS_0 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.activeName),
    valueKey: "id",
    placeholder: (__VLS_ctx.$t('permission.conditional_filtering')),
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.activeName),
    valueKey: "id",
    placeholder: (__VLS_ctx.$t('permission.conditional_filtering')),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.selectItem)
};
__VLS_3.slots.default;
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.dimensions))) {
    const __VLS_8 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (ele.id),
        label: (ele.field_name),
        value: (ele),
    }));
    const __VLS_10 = __VLS_9({
        key: (ele.id),
        label: (ele.field_name),
        value: (ele),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
if (__VLS_ctx.item.field_id) {
    const __VLS_12 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.item.filter_type),
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('permission.conditional_filtering')),
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.item.filter_type),
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('permission.conditional_filtering')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onChange: (__VLS_ctx.filterTypeChange)
    };
    __VLS_15.slots.default;
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.filterList))) {
        const __VLS_20 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            key: (ele.value),
            label: (ele.label),
            value: (ele.value),
        }));
        const __VLS_22 = __VLS_21({
            key: (ele.value),
            label: (ele.label),
            value: (ele.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    }
    var __VLS_15;
    const __VLS_24 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.item.value_type),
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('permission.conditional_filtering')),
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.item.value_type),
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('permission.conditional_filtering')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onChange: (__VLS_ctx.filterTypeChange)
    };
    __VLS_27.slots.default;
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.valueTypeList))) {
        const __VLS_32 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            key: (ele.value),
            label: (ele.label),
            value: (ele.value),
        }));
        const __VLS_34 = __VLS_33({
            key: (ele.value),
            label: (ele.label),
            value: (ele.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    var __VLS_27;
    if (['null', 'not_null', 'empty', 'not_empty'].includes(__VLS_ctx.item.term)) {
        const __VLS_36 = {}.ElSelect;
        /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            modelValue: (__VLS_ctx.item.term),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('datasource.Please_select')),
        }));
        const __VLS_38 = __VLS_37({
            modelValue: (__VLS_ctx.item.term),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('datasource.Please_select')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.operators))) {
            const __VLS_40 = {}.ElOption;
            /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                key: (ele.value),
                label: (__VLS_ctx.t(ele.label)),
                value: (ele.value),
            }));
            const __VLS_42 = __VLS_41({
                key: (ele.value),
                label: (__VLS_ctx.t(ele.label)),
                value: (ele.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        }
        var __VLS_39;
    }
    else if (__VLS_ctx.item.value_type === 'normal') {
        const __VLS_44 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            modelValue: (__VLS_ctx.item.value),
            ...{ style: {} },
            placeholder: (__VLS_ctx.$t('datasource.please_enter')),
            ...{ class: "input-with-select" },
            clearable: true,
        }));
        const __VLS_46 = __VLS_45({
            modelValue: (__VLS_ctx.item.value),
            ...{ style: {} },
            placeholder: (__VLS_ctx.$t('datasource.please_enter')),
            ...{ class: "input-with-select" },
            clearable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        {
            const { prepend: __VLS_thisSlot } = __VLS_47.slots;
            const __VLS_48 = {}.ElSelect;
            /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                modelValue: (__VLS_ctx.item.term),
                ...{ style: {} },
                placeholder: (__VLS_ctx.t('datasource.Please_select')),
            }));
            const __VLS_50 = __VLS_49({
                modelValue: (__VLS_ctx.item.term),
                ...{ style: {} },
                placeholder: (__VLS_ctx.t('datasource.Please_select')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
            __VLS_51.slots.default;
            for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.operators))) {
                const __VLS_52 = {}.ElOption;
                /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                    key: (ele.value),
                    label: (__VLS_ctx.t(ele.label)),
                    value: (ele.value),
                }));
                const __VLS_54 = __VLS_53({
                    key: (ele.value),
                    label: (__VLS_ctx.t(ele.label)),
                    value: (ele.value),
                }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            }
            var __VLS_51;
        }
        var __VLS_47;
    }
    else {
        const __VLS_56 = {}.ElSelect;
        /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            modelValue: (__VLS_ctx.item.term),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('datasource.Please_select')),
        }));
        const __VLS_58 = __VLS_57({
            modelValue: (__VLS_ctx.item.term),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('datasource.Please_select')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.operators))) {
            const __VLS_60 = {}.ElOption;
            /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                key: (ele.value),
                label: (__VLS_ctx.t(ele.label)),
                value: (ele.value),
            }));
            const __VLS_62 = __VLS_61({
                key: (ele.value),
                label: (__VLS_ctx.t(ele.label)),
                value: (ele.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        }
        var __VLS_59;
        const __VLS_64 = {}.ElSelect;
        /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            modelValue: (__VLS_ctx.item.variable_id),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('datasource.Please_select')),
        }));
        const __VLS_66 = __VLS_65({
            modelValue: (__VLS_ctx.item.variable_id),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('datasource.Please_select')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.variables))) {
            const __VLS_68 = {}.ElOption;
            /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                key: (ele.id),
                label: (ele.name),
                value: (ele.id),
            }));
            const __VLS_70 = __VLS_69({
                key: (ele.id),
                label: (ele.name),
                value: (ele.id),
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        }
        var __VLS_67;
    }
}
if (__VLS_ctx.showDel) {
    const __VLS_72 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        ...{ class: "font16" },
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        ...{ class: "font16" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.showDel))
                return;
            __VLS_ctx.emits('del');
        }
    };
    __VLS_75.slots.default;
    const __VLS_80 = {}.icon_deleteTrash_outlined;
    /** @type {[typeof __VLS_components.Icon_deleteTrash_outlined, typeof __VLS_components.icon_deleteTrash_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
    const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
    var __VLS_75;
}
/** @type {__VLS_StyleScopedClasses['white-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['filed']} */ ;
/** @type {__VLS_StyleScopedClasses['input-with-select']} */ ;
/** @type {__VLS_StyleScopedClasses['font16']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_deleteTrash_outlined: icon_deleteTrash_outlined,
            t: t,
            showDel: showDel,
            activeName: activeName,
            filterList: filterList,
            variables: variables,
            valueTypeList: valueTypeList,
            item: item,
            computedWidth: computedWidth,
            operators: operators,
            dimensions: dimensions,
            filterTypeChange: filterTypeChange,
            selectItem: selectItem,
            emits: emits,
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
