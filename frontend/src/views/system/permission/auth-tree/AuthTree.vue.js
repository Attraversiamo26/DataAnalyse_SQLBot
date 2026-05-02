import { useI18n } from 'vue-i18n';
import { computed, toRefs } from 'vue';
import FilterFiled from './FilterFiled.vue';
import icon_down_outlined from '@/assets/svg/arrow-down.svg';
import icon_close_outlined_w from '@/assets/svg/icon_close_outlined_12.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
export default await (async () => {
    const { t } = useI18n();
    const props = defineProps({
        relationList: {
            type: Array,
            default: () => [],
        },
        x: {
            type: Number,
            default: 0,
        },
        logic: {
            type: String,
            default: 'or',
        },
    });
    const marginLeft = computed(() => {
        return {
            marginLeft: props.x ? '20px' : 0,
        };
    });
    const emits = defineEmits([
        'addCondReal',
        'changeAndOrDfs',
        'update:logic',
        'removeRelationList',
        'del',
    ]);
    const { relationList } = toRefs(props);
    const handleCommand = (type) => {
        emits('update:logic', type);
        emits('changeAndOrDfs', type);
    };
    const removeRelationList = (index) => {
        relationList.value.splice(index, 1);
    };
    const addCondReal = (type) => {
        emits('addCondReal', type, props.logic === 'or' ? 'and' : 'or');
    };
    const add = (type, child, logic) => {
        child.push(type === 'condition'
            ? {
                field_id: '',
                value: '',
                enum_value: '',
                term: '',
                filter_type: 'logic',
                name: '',
                value_type: 'normal',
                variable_id: undefined,
            }
            : { child: [], logic });
    };
    const del = (index, child) => {
        child.splice(index, 1);
    };
    debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    /** @type {__VLS_StyleScopedClasses['mrg-title']} */ ;
    /** @type {__VLS_StyleScopedClasses['operate-icon']} */ ;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logic" },
        ...{ style: (__VLS_ctx.marginLeft) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logic-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "operate-title" },
    });
    if (__VLS_ctx.x) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "mrg-title" },
        });
        (__VLS_ctx.logic === 'or' ? 'OR' : 'AND');
    }
    else {
        const __VLS_0 = {}.ElDropdown;
        /** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ 'onCommand': {} },
            trigger: "click",
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onCommand': {} },
            trigger: "click",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_4;
        let __VLS_5;
        let __VLS_6;
        const __VLS_7 = {
            onCommand: (__VLS_ctx.handleCommand)
        };
        __VLS_3.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "mrg-title" },
        });
        (__VLS_ctx.logic === 'or' ? 'OR' : 'AND');
        const __VLS_8 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            size: "12",
        }));
        const __VLS_10 = __VLS_9({
            size: "12",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_11.slots.default;
        const __VLS_12 = {}.icon_down_outlined;
        /** @type {[typeof __VLS_components.Icon_down_outlined, typeof __VLS_components.icon_down_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        var __VLS_11;
        {
            const { dropdown: __VLS_thisSlot } = __VLS_3.slots;
            const __VLS_16 = {}.ElDropdownMenu;
            /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
            const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
            __VLS_19.slots.default;
            const __VLS_20 = {}.ElDropdownItem;
            /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                command: "and",
            }));
            const __VLS_22 = __VLS_21({
                command: "and",
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            __VLS_23.slots.default;
            var __VLS_23;
            const __VLS_24 = {}.ElDropdownItem;
            /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                command: "or",
            }));
            const __VLS_26 = __VLS_25({
                command: "or",
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            __VLS_27.slots.default;
            var __VLS_27;
            var __VLS_19;
        }
        var __VLS_3;
    }
    if (__VLS_ctx.x) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "operate-icon" },
        });
        const __VLS_28 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            ...{ 'onClick': {} },
            size: "12",
        }));
        const __VLS_30 = __VLS_29({
            ...{ 'onClick': {} },
            size: "12",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_32;
        let __VLS_33;
        let __VLS_34;
        const __VLS_35 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.x))
                    return;
                __VLS_ctx.emits('removeRelationList');
            }
        };
        __VLS_31.slots.default;
        const __VLS_36 = {}.icon_close_outlined_w;
        /** @type {[typeof __VLS_components.Icon_close_outlined_w, typeof __VLS_components.icon_close_outlined_w, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        var __VLS_31;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logic-right" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.relationList))) {
        (index);
        if (item.child) {
            const __VLS_40 = {}.LogicRelation;
            /** @type {[typeof __VLS_components.LogicRelation, typeof __VLS_components.logicRelation, typeof __VLS_components.LogicRelation, typeof __VLS_components.logicRelation, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                ...{ 'onDel': {} },
                ...{ 'onAddCondReal': {} },
                ...{ 'onRemoveRelationList': {} },
                x: (item.x),
                logic: (item.logic),
                relationList: (item.child),
            }));
            const __VLS_42 = __VLS_41({
                ...{ 'onDel': {} },
                ...{ 'onAddCondReal': {} },
                ...{ 'onRemoveRelationList': {} },
                x: (item.x),
                logic: (item.logic),
                relationList: (item.child),
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            let __VLS_44;
            let __VLS_45;
            let __VLS_46;
            const __VLS_47 = {
                onDel: ((idx) => __VLS_ctx.del(idx, item.child))
            };
            const __VLS_48 = {
                onAddCondReal: ((type, logic) => __VLS_ctx.add(type, item.child, logic))
            };
            const __VLS_49 = {
                onRemoveRelationList: (...[$event]) => {
                    if (!(item.child))
                        return;
                    __VLS_ctx.removeRelationList(index);
                }
            };
            var __VLS_43;
        }
        else {
            /** @type {[typeof FilterFiled, typeof FilterFiled, ]} */ ;
            // @ts-ignore
            const __VLS_50 = __VLS_asFunctionalComponent(FilterFiled, new FilterFiled({
                ...{ 'onDel': {} },
                item: (item),
                index: (index),
            }));
            const __VLS_51 = __VLS_50({
                ...{ 'onDel': {} },
                item: (item),
                index: (index),
            }, ...__VLS_functionalComponentArgsRest(__VLS_50));
            let __VLS_53;
            let __VLS_54;
            let __VLS_55;
            const __VLS_56 = {
                onDel: (...[$event]) => {
                    if (!!(item.child))
                        return;
                    __VLS_ctx.emits('del', index);
                }
            };
            var __VLS_52;
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logic-right-add" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.addCondReal('condition');
            } },
        ...{ class: "operand-btn" },
    });
    const __VLS_57 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_59 = __VLS_58({
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    const __VLS_61 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({}));
    const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
    var __VLS_60;
    (__VLS_ctx.t('permission.add_conditions'));
    if (__VLS_ctx.x < 2) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.x < 2))
                        return;
                    __VLS_ctx.addCondReal('relation');
                } },
            ...{ class: "operand-btn" },
        });
        const __VLS_65 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
            ...{ style: {} },
            size: "16",
        }));
        const __VLS_67 = __VLS_66({
            ...{ style: {} },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        __VLS_68.slots.default;
        const __VLS_69 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({}));
        const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
        var __VLS_68;
        (__VLS_ctx.t('permission.add_relationships'));
    }
    /** @type {__VLS_StyleScopedClasses['logic']} */ ;
    /** @type {__VLS_StyleScopedClasses['logic-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['operate-title']} */ ;
    /** @type {__VLS_StyleScopedClasses['mrg-title']} */ ;
    /** @type {__VLS_StyleScopedClasses['mrg-title']} */ ;
    /** @type {__VLS_StyleScopedClasses['operate-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['logic-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['logic-right-add']} */ ;
    /** @type {__VLS_StyleScopedClasses['operand-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['operand-btn']} */ ;
    var __VLS_dollars;
    const __VLS_self = (await import('vue')).defineComponent({
        setup() {
            return {
                FilterFiled: FilterFiled,
                t: t,
                marginLeft: marginLeft,
                emits: emits,
                relationList: relationList,
                handleCommand: handleCommand,
                removeRelationList: removeRelationList,
                addCondReal: addCondReal,
                add: add,
                del: del,
                icon_down_outlined: icon_down_outlined,
                icon_close_outlined_w: icon_close_outlined_w,
                icon_add_outlined: icon_add_outlined,
            };
        },
        emits: {},
        props: {
            relationList: {
                type: Array,
                default: () => [],
            },
            x: {
                type: Number,
                default: 0,
            },
            logic: {
                type: String,
                default: 'or',
            },
        },
        name: 'LogicRelation',
    });
    return (await import('vue')).defineComponent({
        setup() {
            return {};
        },
        emits: {},
        props: {
            relationList: {
                type: Array,
                default: () => [],
            },
            x: {
                type: Number,
                default: 0,
            },
            logic: {
                type: String,
                default: 'or',
            },
        },
        name: 'LogicRelation',
    });
})(); /* PartiallyEnd: #4569/main.vue */
