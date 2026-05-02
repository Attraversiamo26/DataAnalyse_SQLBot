import { ref, computed } from 'vue';
import Menu from './ToolMenu.vue';
import Person from './Person.vue';
import icon_side_fold_outlined from '@/assets/svg/icon_side-fold_outlined.svg';
import icon_side_expand_outlined from '@/assets/svg/icon_side-expand_outlined.svg';
import { useRouter } from 'vue-router';
import { isMobile } from '@/utils/utils';
import { onBeforeMount } from 'vue';
const isPhone = computed(() => {
    return isMobile();
});
const router = useRouter();
const collapse = ref(false);
const collapseCopy = ref(false);
const handleCollapseChange = (val = true) => {
    collapseCopy.value = val;
    setTimeout(() => {
        collapse.value = val;
    }, 100);
};
const handleFoldExpand = () => {
    handleCollapseChange(!collapse.value);
};
onBeforeMount(() => {
    if (isPhone.value) {
        collapse.value = true;
        collapseCopy.value = true;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['bottom']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-dispatch-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-nav" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.push('/');
        } },
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=China%20Post%20logo%20with%20green%20logo%20and%20black%20text%20on%20white%20background%20CHINA%20POST&image_size=square",
    height: "32",
    width: "32",
    alt: "中国邮政",
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "nav-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-right" },
});
/** @type {[typeof Person, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Person, new Person({
    collapse: (false),
    inSysmenu: (false),
}));
const __VLS_1 = __VLS_0({
    collapse: (false),
    inSysmenu: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "left-side" },
    ...{ class: (__VLS_ctx.collapse && 'left-side-collapse') },
});
/** @type {[typeof Menu, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(Menu, new Menu({
    collapse: (__VLS_ctx.collapseCopy),
}));
const __VLS_4 = __VLS_3({
    collapse: (__VLS_ctx.collapseCopy),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleFoldExpand) },
    ...{ class: "fold-btn" },
});
const __VLS_6 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
    size: "20",
}));
const __VLS_8 = __VLS_7({
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_9.slots.default;
if (__VLS_ctx.collapse) {
    const __VLS_10 = {}.icon_side_expand_outlined;
    /** @type {[typeof __VLS_components.Icon_side_expand_outlined, typeof __VLS_components.icon_side_expand_outlined, typeof __VLS_components.Icon_side_expand_outlined, typeof __VLS_components.icon_side_expand_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({}));
    const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
}
else {
    const __VLS_14 = {}.icon_side_fold_outlined;
    /** @type {[typeof __VLS_components.Icon_side_fold_outlined, typeof __VLS_components.icon_side_fold_outlined, typeof __VLS_components.Icon_side_fold_outlined, typeof __VLS_components.icon_side_fold_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
    const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
}
var __VLS_9;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "right-main" },
    ...{ class: (__VLS_ctx.collapse && 'right-side-collapse') },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
const __VLS_18 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({}));
const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
/** @type {__VLS_StyleScopedClasses['tool-dispatch-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['top-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-left']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-right']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['left-side']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['fold-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['right-main']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Menu: Menu,
            Person: Person,
            icon_side_fold_outlined: icon_side_fold_outlined,
            icon_side_expand_outlined: icon_side_expand_outlined,
            router: router,
            collapse: collapse,
            collapseCopy: collapseCopy,
            handleFoldExpand: handleFoldExpand,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
