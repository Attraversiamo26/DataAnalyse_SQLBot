import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { ArrowDown } from '@element-plus/icons-vue';
import { userApi } from '@/api/auth';
const { t, locale } = useI18n();
const userStore = useUserStore();
const languageOptions = computed(() => [
    { value: 'en', label: t('common.english') },
    { value: 'zh-CN', label: t('common.simplified_chinese') },
    { value: 'ko-KR', label: t('common.korean') },
]);
const selectedLanguage = computed(() => {
    return userStore.language;
});
const displayLanguageName = computed(() => {
    const current = languageOptions.value.find((item) => item.value === selectedLanguage.value);
    return current?.label ?? t('common.language');
});
const changeLanguage = (lang) => {
    locale.value = lang;
    userStore.setLanguage(lang);
    const param = {
        language: lang,
    };
    userApi.language(param);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDropdown;
/** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onCommand': {} },
    trigger: "hover",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onCommand': {} },
    trigger: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onCommand: (__VLS_ctx.changeLanguage)
};
var __VLS_8 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lang-switch" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.displayLanguageName);
const __VLS_9 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ class: "el-icon--right" },
}));
const __VLS_11 = __VLS_10({
    ...{ class: "el-icon--right" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ArrowDown;
/** @type {[typeof __VLS_components.ArrowDown, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
var __VLS_12;
{
    const { dropdown: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_17 = {}.ElDropdownMenu;
    /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
    const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    for (const [option] of __VLS_getVForSourceType((__VLS_ctx.languageOptions))) {
        const __VLS_21 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
            key: (option.value),
            command: (option.value),
            ...{ class: ({ 'selected-lang': __VLS_ctx.selectedLanguage === option.value }) },
        }));
        const __VLS_23 = __VLS_22({
            key: (option.value),
            command: (option.value),
            ...{ class: ({ 'selected-lang': __VLS_ctx.selectedLanguage === option.value }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        __VLS_24.slots.default;
        (option.label);
        var __VLS_24;
    }
    var __VLS_20;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['lang-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon--right']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-lang']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowDown: ArrowDown,
            languageOptions: languageOptions,
            selectedLanguage: selectedLanguage,
            displayLanguageName: displayLanguageName,
            changeLanguage: changeLanguage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
