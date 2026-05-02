import { computed, onMounted, ref } from 'vue';
import icon_expand_down_filled from '@/assets/svg/icon_expand-down_filled.svg';
import icon_moments_categories_outlined from '@/assets/svg/icon_moments-categories_outlined.svg';
import icon_done_outlined from '@/assets/svg/icon_done_outlined.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import { userApi } from '@/api/auth';
import { ElMessage } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { highlightKeyword } from '@/utils/xss';
const userStore = useUserStore();
const { t } = useI18n();
const __VLS_props = defineProps({
    collapse: { type: [Boolean], required: true },
});
const router = useRouter();
const currentWorkspace = ref({
    id: '',
    name: '',
});
const defaultDatasourceList = ref([]);
const workspaceKeywords = ref('');
const defaultWorkspaceListWithSearch = computed(() => {
    if (!workspaceKeywords.value)
        return defaultDatasourceList.value;
    return defaultDatasourceList.value.filter((ele) => ele.name.toLowerCase().includes(workspaceKeywords.value.toLowerCase()));
});
const formatKeywords = (item) => {
    // Use XSS-safe highlight function
    return highlightKeyword(item, workspaceKeywords.value, 'isSearch');
};
const emit = defineEmits(['selectWorkspace']);
const handleDefaultWorkspaceChange = (item) => {
    if (currentWorkspace.value?.id && item.id.toString() === currentWorkspace.value.id.toString()) {
        return;
    }
    currentWorkspace.value = { id: item.id, name: item.name };
    userApi.ws_change(item.id).then(() => {
        ElMessage.success(t('common.switch_success'));
        router.push('/chat/index');
        setTimeout(() => {
            location.reload();
        }, 300);
    });
    emit('selectWorkspace', item);
};
const init_ws_data = async () => {
    defaultDatasourceList.value = await userApi.ws_options();
};
const init_current_ws = () => {
    const oid = userStore.getOid;
    currentWorkspace.value = defaultDatasourceList.value.find((item) => item.id.toString() === oid.toString());
};
onMounted(async () => {
    await init_ws_data();
    init_current_ws();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    trigger: "click",
    popperClass: "system-workspace",
    placement: (__VLS_ctx.collapse ? 'right' : 'bottom'),
}));
const __VLS_2 = __VLS_1({
    trigger: "click",
    popperClass: "system-workspace",
    placement: (__VLS_ctx.collapse ? 'right' : 'bottom'),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
{
    const { reference: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ class: "workspace" },
        ...{ class: (__VLS_ctx.collapse && 'collapse') },
    });
    const __VLS_5 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        size: "18",
    }));
    const __VLS_7 = __VLS_6({
        size: "18",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_8.slots.default;
    const __VLS_9 = {}.icon_moments_categories_outlined;
    /** @type {[typeof __VLS_components.Icon_moments_categories_outlined, typeof __VLS_components.icon_moments_categories_outlined, typeof __VLS_components.Icon_moments_categories_outlined, typeof __VLS_components.icon_moments_categories_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
    const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
    var __VLS_8;
    if (!__VLS_ctx.collapse) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            title: (__VLS_ctx.currentWorkspace?.name || ''),
            ...{ class: "name ellipsis" },
        });
        (__VLS_ctx.currentWorkspace?.name || '');
    }
    if (!__VLS_ctx.collapse) {
        const __VLS_13 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
            ...{ style: {} },
            ...{ class: "expand" },
            size: "24",
        }));
        const __VLS_15 = __VLS_14({
            ...{ style: {} },
            ...{ class: "expand" },
            size: "24",
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        __VLS_16.slots.default;
        const __VLS_17 = {}.icon_expand_down_filled;
        /** @type {[typeof __VLS_components.Icon_expand_down_filled, typeof __VLS_components.icon_expand_down_filled, typeof __VLS_components.Icon_expand_down_filled, typeof __VLS_components.icon_expand_down_filled, ]} */ ;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
        const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
        var __VLS_16;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover" },
});
const __VLS_21 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    modelValue: (__VLS_ctx.workspaceKeywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search_by_name')),
}));
const __VLS_23 = __VLS_22({
    modelValue: (__VLS_ctx.workspaceKeywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search_by_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_24.slots;
    const __VLS_25 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
    const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    const __VLS_29 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        ...{ class: "svg-icon" },
    }));
    const __VLS_31 = __VLS_30({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    var __VLS_28;
}
var __VLS_24;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-content" },
});
const __VLS_33 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    maxHeight: "400px",
}));
const __VLS_35 = __VLS_34({
    maxHeight: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.defaultWorkspaceListWithSearch))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleDefaultWorkspaceChange(ele);
            } },
        key: (ele.name),
        ...{ class: "popover-item" },
        ...{ class: (__VLS_ctx.currentWorkspace?.id === ele.id && 'isActive') },
    });
    const __VLS_37 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        size: "16",
    }));
    const __VLS_39 = __VLS_38({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    const __VLS_41 = {}.icon_moments_categories_outlined;
    /** @type {[typeof __VLS_components.Icon_moments_categories_outlined, typeof __VLS_components.icon_moments_categories_outlined, typeof __VLS_components.Icon_moments_categories_outlined, typeof __VLS_components.icon_moments_categories_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({}));
    const __VLS_43 = __VLS_42({}, ...__VLS_functionalComponentArgsRest(__VLS_42));
    var __VLS_40;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        title: (ele.name),
        ...{ class: "datasource-name ellipsis" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.formatKeywords(ele.name)) }, null, null);
    const __VLS_45 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        size: "16",
        ...{ class: "done" },
    }));
    const __VLS_47 = __VLS_46({
        size: "16",
        ...{ class: "done" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    const __VLS_49 = {}.icon_done_outlined;
    /** @type {[typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({}));
    const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
    var __VLS_48;
}
var __VLS_36;
if (!__VLS_ctx.defaultWorkspaceListWithSearch.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover-item empty" },
    });
    (__VLS_ctx.$t('model.relevant_results_found'));
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['expand']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_expand_down_filled: icon_expand_down_filled,
            icon_moments_categories_outlined: icon_moments_categories_outlined,
            icon_done_outlined: icon_done_outlined,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            currentWorkspace: currentWorkspace,
            workspaceKeywords: workspaceKeywords,
            defaultWorkspaceListWithSearch: defaultWorkspaceListWithSearch,
            formatKeywords: formatKeywords,
            handleDefaultWorkspaceChange: handleDefaultWorkspaceChange,
        };
    },
    emits: {},
    props: {
        collapse: { type: [Boolean], required: true },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        collapse: { type: [Boolean], required: true },
    },
});
; /* PartiallyEnd: #4569/main.vue */
