import icon_left_outlined from '@/assets/svg/common-back.svg';
import icon_close_outlined from '@/assets/svg/icon_close_outlined.svg';
import icon_deleteTrash_outlined from '@/assets/svg/icon_delete.svg';
import icon_right_outlined from '@/assets/svg/icon_right_outlined.svg';
import { nextTick, ref, watch } from 'vue';
import { Icon } from '@/components/icon-custom';
import { ElButton, ElDivider, ElIcon } from 'element-plus-secondary';
import { propTypes } from '@/utils/propTypes';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps({
    filterTexts: {
        type: (Array),
        default: () => [],
    },
    total: propTypes.number.def(0),
});
const emits = defineEmits(['clearFilter']);
const container = ref(null);
const showScroll = ref(false);
const scrollPre = () => {
    container.value.scrollLeft -= 10;
    if (container.value.scrollLeft <= 0) {
        container.value.scrollLeft = 0;
    }
};
const scrollNext = () => {
    container.value.scrollLeft += 10;
    const width = container.value.scrollWidth - container.value.offsetWidth;
    if (container.value.scrollLeft > width) {
        container.value.scrollLeft = width;
    }
};
const clearFilter = (index) => {
    emits('clearFilter', index);
};
const clearFilterAll = () => {
    emits('clearFilter', 'empty');
};
watch(() => props.filterTexts, () => {
    nextTick(() => {
        showScroll.value = container.value?.scrollWidth > container.value?.offsetWidth;
    });
}, { deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-texts-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.filterTexts.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-texts" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sum" },
    });
    (__VLS_ctx.total);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "title" },
    });
    (__VLS_ctx.t('common.result_count'));
    const __VLS_0 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        direction: "vertical",
    }));
    const __VLS_2 = __VLS_1({
        direction: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    if (__VLS_ctx.showScroll) {
        const __VLS_4 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            ...{ 'onClick': {} },
            ...{ class: "arrow-left arrow-filter" },
        }));
        const __VLS_6 = __VLS_5({
            ...{ 'onClick': {} },
            ...{ class: "arrow-left arrow-filter" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        let __VLS_8;
        let __VLS_9;
        let __VLS_10;
        const __VLS_11 = {
            onClick: (__VLS_ctx.scrollPre)
        };
        __VLS_7.slots.default;
        const __VLS_12 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            name: "icon_left_outlined",
        }));
        const __VLS_14 = __VLS_13({
            name: "icon_left_outlined",
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        const __VLS_16 = {}.icon_left_outlined;
        /** @type {[typeof __VLS_components.Icon_left_outlined, typeof __VLS_components.icon_left_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            ...{ class: "svg-icon" },
        }));
        const __VLS_18 = __VLS_17({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        var __VLS_15;
        var __VLS_7;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "container",
        ...{ class: "filter-texts-container" },
    });
    /** @type {typeof __VLS_ctx.container} */ ;
    for (const [ele, index] of __VLS_getVForSourceType((__VLS_ctx.filterTexts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            key: (ele),
            ...{ class: "text" },
        });
        const __VLS_20 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            effect: "dark",
            content: (ele),
            placement: "top-start",
        }));
        const __VLS_22 = __VLS_21({
            effect: "dark",
            content: (ele),
            placement: "top-start",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        (ele);
        var __VLS_23;
        const __VLS_24 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onClick': {} },
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_28;
        let __VLS_29;
        let __VLS_30;
        const __VLS_31 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.filterTexts.length))
                    return;
                __VLS_ctx.clearFilter(index);
            }
        };
        __VLS_27.slots.default;
        const __VLS_32 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            name: "icon_close_outlined",
        }));
        const __VLS_34 = __VLS_33({
            name: "icon_close_outlined",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        const __VLS_36 = {}.icon_close_outlined;
        /** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ class: "svg-icon" },
        }));
        const __VLS_38 = __VLS_37({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        var __VLS_35;
        var __VLS_27;
    }
    if (!__VLS_ctx.showScroll) {
        const __VLS_40 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
            type: "text",
            ...{ class: "clear-btn clear-btn-inner" },
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
            type: "text",
            ...{ class: "clear-btn clear-btn-inner" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClick: (__VLS_ctx.clearFilterAll)
        };
        __VLS_43.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_43.slots;
            const __VLS_48 = {}.Icon;
            /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                name: "icon_delete-trash_outlined",
            }));
            const __VLS_50 = __VLS_49({
                name: "icon_delete-trash_outlined",
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
            __VLS_51.slots.default;
            const __VLS_52 = {}.icon_deleteTrash_outlined;
            /** @type {[typeof __VLS_components.Icon_deleteTrash_outlined, typeof __VLS_components.icon_deleteTrash_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                ...{ class: "svg-icon" },
            }));
            const __VLS_54 = __VLS_53({
                ...{ class: "svg-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            var __VLS_51;
        }
        (__VLS_ctx.t('common.clear_filter'));
        var __VLS_43;
    }
    if (__VLS_ctx.showScroll) {
        const __VLS_56 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            ...{ 'onClick': {} },
            ...{ class: "arrow-right arrow-filter" },
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
            ...{ class: "arrow-right arrow-filter" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_60;
        let __VLS_61;
        let __VLS_62;
        const __VLS_63 = {
            onClick: (__VLS_ctx.scrollNext)
        };
        __VLS_59.slots.default;
        const __VLS_64 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            name: "icon_right_outlined",
        }));
        const __VLS_66 = __VLS_65({
            name: "icon_right_outlined",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        const __VLS_68 = {}.icon_right_outlined;
        /** @type {[typeof __VLS_components.Icon_right_outlined, typeof __VLS_components.icon_right_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            ...{ class: "svg-icon" },
        }));
        const __VLS_70 = __VLS_69({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        var __VLS_67;
        var __VLS_59;
    }
    if (__VLS_ctx.showScroll) {
        const __VLS_72 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            ...{ 'onClick': {} },
            type: "text",
            ...{ class: "clear-btn" },
            ...{ style: {} },
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onClick': {} },
            type: "text",
            ...{ class: "clear-btn" },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_76;
        let __VLS_77;
        let __VLS_78;
        const __VLS_79 = {
            onClick: (__VLS_ctx.clearFilterAll)
        };
        __VLS_75.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_75.slots;
            const __VLS_80 = {}.Icon;
            /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                name: "icon_delete-trash_outlined",
            }));
            const __VLS_82 = __VLS_81({
                name: "icon_delete-trash_outlined",
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            __VLS_83.slots.default;
            const __VLS_84 = {}.icon_deleteTrash_outlined;
            /** @type {[typeof __VLS_components.Icon_deleteTrash_outlined, typeof __VLS_components.icon_deleteTrash_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                ...{ class: "svg-icon" },
            }));
            const __VLS_86 = __VLS_85({
                ...{ class: "svg-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_85));
            var __VLS_83;
        }
        (__VLS_ctx.t('common.clear_filter'));
        var __VLS_75;
    }
}
/** @type {__VLS_StyleScopedClasses['filter-texts']} */ ;
/** @type {__VLS_StyleScopedClasses['sum']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow-left']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-texts-container']} */ ;
/** @type {__VLS_StyleScopedClasses['text']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow-right']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_left_outlined: icon_left_outlined,
            icon_close_outlined: icon_close_outlined,
            icon_deleteTrash_outlined: icon_deleteTrash_outlined,
            icon_right_outlined: icon_right_outlined,
            Icon: Icon,
            ElButton: ElButton,
            ElDivider: ElDivider,
            ElIcon: ElIcon,
            t: t,
            container: container,
            showScroll: showScroll,
            scrollPre: scrollPre,
            scrollNext: scrollNext,
            clearFilter: clearFilter,
            clearFilterAll: clearFilterAll,
        };
    },
    emits: {},
    props: {
        filterTexts: {
            type: (Array),
            default: () => [],
        },
        total: propTypes.number.def(0),
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        filterTexts: {
            type: (Array),
            default: () => [],
        },
        total: propTypes.number.def(0),
    },
});
; /* PartiallyEnd: #4569/main.vue */
