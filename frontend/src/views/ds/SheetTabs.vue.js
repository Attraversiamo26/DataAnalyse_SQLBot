import icon_expandLeft_filled from '@/assets/svg/icon_expand-left_filled.svg';
import icon_expandRight_filled from '@/assets/svg/icon_expand-right_filled.svg';
import { toRefs, ref, watch, nextTick } from 'vue';
import { propTypes } from '@/utils/propTypes';
const props = defineProps({
    tabList: propTypes.arrayOf(propTypes.shape({
        label: String,
        value: String,
    })),
    activeTab: propTypes.string.def(''),
});
const activeTabIndex = ref(0);
const emits = defineEmits(['TabClick']);
const { activeTab } = toRefs(props);
const handleTabClick = (tab) => {
    let tabDom = document.getElementById(`tab-${tab.value}`);
    if (tabDom.offsetLeft + tabDom.offsetWidth > tabWrapper.value.offsetWidth) {
        tabWrapper.value.scrollLeft =
            tabDom.offsetLeft + tabDom.offsetWidth - tabWrapper.value.offsetWidth;
    }
    else {
        tabWrapper.value.scrollLeft = 0;
    }
    emits('TabClick', tab);
};
const tabWrapper = ref();
const showBtn = ref(false);
watch(() => activeTab.value, (val) => {
    activeTabIndex.value = props.tabList.findIndex((ele) => ele.value === val);
}, { immediate: true });
watch(() => props.tabList, () => {
    nextTick(() => {
        showBtn.value = tabWrapper.value.scrollWidth > tabWrapper.value.offsetWidth;
    });
}, { immediate: true });
const prevClick = () => {
    let domWrapper = tabWrapper.value;
    if (!domWrapper.scrollLeft)
        return;
    domWrapper.scrollLeft -= 30;
};
const nextClick = () => {
    let domWrapper = tabWrapper.value;
    domWrapper.scrollLeft += 30;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-tab']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet-tabs" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "tabWrapper",
    ...{ class: "tab-wrapper" },
});
/** @type {typeof __VLS_ctx.tabWrapper} */ ;
for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.tabList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleTabClick(tab);
            } },
        id: (`tab-${tab.value}`),
        key: (tab.label),
        title: (tab.label),
        ...{ class: ([{ active: __VLS_ctx.activeTab === tab.value }, 'sheet-tab']) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "ellipsis" },
    });
    (tab.label);
}
if (__VLS_ctx.showBtn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-btn" },
    });
    const __VLS_0 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        size: "12px",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        size: "12px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.prevClick)
    };
    __VLS_3.slots.default;
    const __VLS_8 = {}.icon_expandLeft_filled;
    /** @type {[typeof __VLS_components.Icon_expandLeft_filled, typeof __VLS_components.icon_expandLeft_filled, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_3;
    const __VLS_12 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        size: "12px",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        size: "12px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.nextClick)
    };
    __VLS_15.slots.default;
    const __VLS_20 = {}.icon_expandRight_filled;
    /** @type {[typeof __VLS_components.Icon_expandRight_filled, typeof __VLS_components.icon_expandRight_filled, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    var __VLS_15;
}
/** @type {__VLS_StyleScopedClasses['sheet-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_expandLeft_filled: icon_expandLeft_filled,
            icon_expandRight_filled: icon_expandRight_filled,
            activeTab: activeTab,
            handleTabClick: handleTabClick,
            tabWrapper: tabWrapper,
            showBtn: showBtn,
            prevClick: prevClick,
            nextClick: nextClick,
        };
    },
    emits: {},
    props: {
        tabList: propTypes.arrayOf(propTypes.shape({
            label: String,
            value: String,
        })),
        activeTab: propTypes.string.def(''),
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        tabList: propTypes.arrayOf(propTypes.shape({
            label: String,
            value: String,
        })),
        activeTab: propTypes.string.def(''),
    },
});
; /* PartiallyEnd: #4569/main.vue */
