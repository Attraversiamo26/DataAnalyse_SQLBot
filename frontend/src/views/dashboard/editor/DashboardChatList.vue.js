import { ElIcon } from 'element-plus-secondary';
import { Icon } from '@/components/icon-custom';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
const props = withDefaults(defineProps(), {
    currentChatId: undefined,
    chatList: () => [],
});
const { t } = useI18n();
const emits = defineEmits(['chatSelected']);
const filterText = ref('');
function onClickHistory(chat) {
    emits('chatSelected', chat);
}
const now = new Date();
const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // 设置为本周一
startOfWeek.setHours(0, 0, 0, 0);
const filteredAndGroupedData = computed(() => {
    const today = [];
    const thisWeek = [];
    const earlier = [];
    const filteredList = props.chatList.filter((chat) => !filterText.value ||
        (chat.brief && chat.brief.toLowerCase().includes(filterText.value.toLowerCase())));
    filteredList.forEach((item) => {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        const itemDate = new Date(item.create_time);
        if (itemDate.getDate() === now.getDate() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear()) {
            today.push(item);
        }
        else if (itemDate >= startOfWeek && itemDate < now) {
            thisWeek.push(item);
        }
        else {
            earlier.push(item);
        }
    });
    return { today, thisWeek, earlier };
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    currentChatId: undefined,
    chatList: () => [],
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['icon-more']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.filterText),
    placeholder: (__VLS_ctx.t('dashboard.search')),
    clearable: true,
    ...{ class: "search-bar" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.filterText),
    placeholder: (__VLS_ctx.t('dashboard.search')),
    clearable: true,
    ...{ class: "search-bar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_4 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        name: "icon_search-outline_outlined",
    }));
    const __VLS_10 = __VLS_9({
        name: "icon_search-outline_outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ class: "svg-icon" },
    }));
    const __VLS_14 = __VLS_13({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
    var __VLS_7;
}
var __VLS_3;
const __VLS_16 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ref: "chatListRef",
    ...{ class: "custom-chart-list" },
}));
const __VLS_18 = __VLS_17({
    ref: "chatListRef",
    ...{ class: "custom-chart-list" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
/** @type {typeof __VLS_ctx.chatListRef} */ ;
var __VLS_20 = {};
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-list-inner" },
});
if (__VLS_ctx.filteredAndGroupedData.today.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "time-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "time-group-title" },
    });
    (__VLS_ctx.t('dashboard.today'));
    for (const [chat] of __VLS_getVForSourceType((__VLS_ctx.filteredAndGroupedData.today))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.filteredAndGroupedData.today.length > 0))
                        return;
                    __VLS_ctx.onClickHistory(chat);
                } },
            key: (chat.id),
            ...{ class: "chat-list-item" },
            ...{ class: ({ active: __VLS_ctx.currentChatId === chat.id }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "title" },
        });
        (chat.brief ?? 'Untitled');
    }
}
if (__VLS_ctx.filteredAndGroupedData.thisWeek.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "time-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "time-group-title" },
    });
    (__VLS_ctx.t('dashboard.this_week'));
    for (const [chat] of __VLS_getVForSourceType((__VLS_ctx.filteredAndGroupedData.thisWeek))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.filteredAndGroupedData.thisWeek.length > 0))
                        return;
                    __VLS_ctx.onClickHistory(chat);
                } },
            key: (chat.id),
            ...{ class: "chat-list-item" },
            ...{ class: ({ active: __VLS_ctx.currentChatId === chat.id }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "title" },
        });
        (chat.brief ?? 'Untitled');
    }
}
if (__VLS_ctx.filteredAndGroupedData.earlier.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "time-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "time-group-title" },
    });
    (__VLS_ctx.t('dashboard.earlier'));
    for (const [chat] of __VLS_getVForSourceType((__VLS_ctx.filteredAndGroupedData.earlier))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.filteredAndGroupedData.earlier.length > 0))
                        return;
                    __VLS_ctx.onClickHistory(chat);
                } },
            key: (chat.id),
            ...{ class: "chat-list-item" },
            ...{ class: ({ active: __VLS_ctx.currentChatId === chat.id }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "title" },
        });
        (chat.brief ?? 'Untitled');
    }
}
if (__VLS_ctx.filteredAndGroupedData.today.length === 0 &&
    __VLS_ctx.filteredAndGroupedData.thisWeek.length === 0 &&
    __VLS_ctx.filteredAndGroupedData.earlier.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-data" },
    });
    (__VLS_ctx.t('dashboard.no_data'));
}
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-chart-list']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['time-group']} */ ;
/** @type {__VLS_StyleScopedClasses['time-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['time-group']} */ ;
/** @type {__VLS_StyleScopedClasses['time-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['time-group']} */ ;
/** @type {__VLS_StyleScopedClasses['time-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['no-data']} */ ;
// @ts-ignore
var __VLS_21 = __VLS_20;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElIcon: ElIcon,
            Icon: Icon,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            t: t,
            filterText: filterText,
            onClickHistory: onClickHistory,
            filteredAndGroupedData: filteredAndGroupedData,
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
