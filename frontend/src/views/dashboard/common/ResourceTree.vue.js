import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import { treeDraggableChart } from '@/views/dashboard/utils/treeDraggableChart';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import icon_folder from '@/assets/svg/icon_folder.svg';
import ope_add from '@/assets/svg/operate/ope-add.svg';
import icon_dashboard from '@/assets/permission/icon_dashboard.svg';
import icon_edit_outlined from '@/assets/svg/icon_edit_outlined.svg';
import icon_rename from '@/assets/svg/icon_rename.svg';
import icon_delete from '@/assets/svg/icon_delete.svg';
import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg';
import dv_sort_asc from '@/assets/svg/dv-sort-asc.svg';
import dv_sort_desc from '@/assets/svg/dv-sort-desc.svg';
import { onMounted, reactive, ref, watch, nextTick, computed } from 'vue';
import { ElIcon, ElScrollbar } from 'element-plus-secondary';
import { Icon } from '@/components/icon-custom';
import _ from 'lodash';
import router from '@/router';
import { dashboardStoreWithOut } from '@/stores/dashboard/dashboard.ts';
import ResourceGroupOpt from '@/views/dashboard/common/ResourceGroupOpt.vue';
import { dashboardApi } from '@/api/dashboard.ts';
import HandleMore from '@/views/dashboard/common/HandleMore.vue';
import { useI18n } from 'vue-i18n';
import treeSort from '@/views/dashboard/utils/treeSortUtils.ts';
import { useCache } from '@/utils/useCache.ts';
const { wsCache } = useCache();
const { t } = useI18n();
const dashboardStore = dashboardStoreWithOut();
const resourceGroupOptRef = ref(null);
const __VLS_props = defineProps({
    curCanvasType: {
        type: String,
        required: true,
    },
    showPosition: {
        required: false,
        type: String,
        default: 'preview',
    },
    resourceTable: {
        required: false,
        type: String,
        default: 'core',
    },
});
const defaultProps = {
    children: 'children',
    label: 'name',
};
const mounted = ref(false);
const selectedNodeKey = ref(null);
const filterText = ref(null);
const expandedArray = ref([]);
const resourceListTree = ref();
const returnMounted = ref(false);
const state = reactive({
    curSortType: 'name_asc',
    curSortTypePrefix: 'name',
    curSortTypeSuffix: '_asc',
    resourceTree: [],
    originResourceTree: [],
    sortType: [],
    templateCreatePid: 0,
    menuList: [
        {
            label: t('dashboard.edit'),
            command: 'edit',
            svgName: icon_edit_outlined,
        },
        {
            label: t('dashboard.rename'),
            command: 'rename',
            svgName: icon_rename,
        },
        {
            label: t('dashboard.delete'),
            command: 'delete',
            svgName: icon_delete,
            divided: true,
        },
    ],
});
const { handleDrop, handleDragStart } = treeDraggableChart(state, 'resourceTree', 'dashboard');
const routerDashboardId = router.currentRoute.value.query.dashboardId;
if (routerDashboardId) {
    selectedNodeKey.value = routerDashboardId;
    returnMounted.value = true;
}
const nodeExpand = (data) => {
    if (data.id) {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        expandedArray.value.push(data.id);
    }
};
const nodeCollapse = (data) => {
    if (data.id) {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        expandedArray.value.splice(expandedArray.value.indexOf(data.id), 1);
    }
};
const filterNode = (value, data) => {
    if (!value)
        return true;
    return data.name?.toLocaleLowerCase().includes(value.toLocaleLowerCase());
};
const nodeClick = (data, node) => {
    dashboardStore.setCurComponent({ component: null, index: null });
    if (node.disabled) {
        nextTick(() => {
            const currentNode = resourceListTree.value.$el.querySelector('.is-current');
            if (currentNode) {
                currentNode.classList.remove('is-current');
            }
            return;
        });
    }
    else {
        selectedNodeKey.value = data.id;
        if (data.node_type === 'leaf') {
            emit('nodeClick', data);
        }
        else {
            resourceListTree.value.setCurrentKey(null);
        }
    }
};
const getTree = async () => {
    state.originResourceTree = [];
    const params = {};
    dashboardApi.list_resource(params).then((res) => {
        state.originResourceTree = res || [];
        state.resourceTree = _.cloneDeep(state.originResourceTree);
        handleSortTypeChange('name_asc');
        afterTreeInit();
    });
};
const hasData = computed(() => state.resourceTree.length > 0);
const afterTreeInit = () => {
    mounted.value = true;
    if (selectedNodeKey.value && returnMounted.value) {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        expandedArray.value = getDefaultExpandedKeys();
        returnMounted.value = false;
    }
    nextTick(() => {
        resourceListTree.value.setCurrentKey(selectedNodeKey.value);
        resourceListTree.value.filter(filterText.value);
        nextTick(() => {
            // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
            document.querySelector('.is-current')?.firstChild?.click();
        });
    });
};
const copyLoading = ref(false);
const emit = defineEmits(['nodeClick', 'deleteCurResource']);
function createNewObject() {
    addOperation({ opt: 'newLeaf' });
}
// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
const resourceEdit = (resourceId) => {
    window.open(`#/canvas?resourceId=${resourceId}`, '_self');
};
// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
const getParentKeys = (tree, targetKey, parentKeys = []) => {
    for (const node of tree) {
        if (node.id === targetKey) {
            return parentKeys;
        }
        if (node.children) {
            const newParentKeys = [...parentKeys, node.id];
            // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
            const result = getParentKeys(node.children, targetKey, newParentKeys);
            if (result) {
                return result;
            }
        }
    }
    return null;
};
const getDefaultExpandedKeys = () => {
    const parentKeys = getParentKeys(state.resourceTree, selectedNodeKey.value);
    if (parentKeys) {
        return [selectedNodeKey.value, ...parentKeys];
    }
    else {
        return [];
    }
};
watch(filterText, (val) => {
    resourceListTree.value.filter(val);
});
const loadInit = () => { };
onMounted(() => {
    loadInit();
    getTree();
});
const addOperation = (params) => {
    if (params.opt === 'newLeaf') {
        const newCanvasUrl = '#/canvas?opt=create' + (params?.id ? `&pid=${params?.id}` : '');
        window.open(newCanvasUrl, '_self');
        dashboardStore.canvasDataInit();
    }
    else {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        resourceGroupOptRef.value?.optInit(params);
    }
};
const operation = (opt, data) => {
    if (opt === 'delete') {
        const msg = data.node_type === 'leaf' ? '' : t('dashboard.delete_tips');
        ElMessageBox.confirm(t('dashboard.delete_dashboard_warn', [data.name]), {
            confirmButtonType: 'danger',
            type: 'warning',
            tip: msg,
            autofocus: false,
            showClose: false,
        }).then(() => {
            dashboardApi.delete_resource({ id: data.id, name: data.name }).then(() => {
                ElMessage.success(t('dashboard.delete_success'));
                getTree();
                dashboardStore.canvasDataInit();
                emit('deleteCurResource');
            });
        });
    }
    else if (opt === 'rename') {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        resourceGroupOptRef.value?.optInit({ opt: 'rename', id: data.id, name: data.name });
    }
    else if (opt === 'edit') {
        resourceEdit(data.id);
    }
};
const baseInfoChangeFinish = () => {
    getTree();
};
const handleSortTypeChange = (menuSortType) => {
    state.curSortTypePrefix = ['name', 'time'].includes(menuSortType)
        ? menuSortType
        : state.curSortTypePrefix;
    state.curSortTypeSuffix = ['_asc', '_desc'].includes(menuSortType)
        ? menuSortType
        : state.curSortTypeSuffix;
    const curMenuSortType = state.curSortTypePrefix + state.curSortTypeSuffix;
    state.resourceTree = treeSort(state.originResourceTree, curMenuSortType);
    state.curSortType = curMenuSortType;
    wsCache.set('TreeSort-dashboard', state.curSortType);
};
const sortColumnList = [
    {
        name: t('dashboard.time'),
        value: 'time',
    },
    {
        name: t('dashboard.name'),
        value: 'name',
        divided: true,
    },
];
const sortTypeList = [
    {
        name: t('dashboard.sort_asc'),
        value: '_asc',
    },
    {
        name: t('dashboard.sort_desc'),
        value: '_desc',
    },
];
const sortList = [
    {
        name: t('dashboard.time_asc'),
        value: 'time_asc',
    },
    {
        name: t('dashboard.time_desc'),
        value: 'time_desc',
        divided: true,
    },
    {
        name: t('dashboard.name_asc'),
        value: 'name_asc',
    },
    {
        name: t('dashboard.name_desc'),
        value: 'name_desc',
    },
];
const sortTypeTip = computed(() => {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    return sortList.find((ele) => ele.value === state.curSortType).name;
});
const __VLS_exposed = {
    hasData,
    createNewObject,
    mounted,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['father']} */ ;
/** @type {__VLS_StyleScopedClasses['child']} */ ;
/** @type {__VLS_StyleScopedClasses['label-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-more']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resource-tree" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tree-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "icon-methods" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "title" },
});
(__VLS_ctx.t('dashboard.dashboard'));
const __VLS_0 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    offset: (12),
    content: (__VLS_ctx.t('dashboard.new_dashboard')),
    placement: "top",
    effect: "dark",
}));
const __VLS_2 = __VLS_1({
    offset: (12),
    content: (__VLS_ctx.t('dashboard.new_dashboard')),
    placement: "top",
    effect: "dark",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    ...{ class: "custom-icon btn hover-icon_with_bg primary-icon" },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    ...{ class: "custom-icon btn hover-icon_with_bg primary-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.addOperation({ opt: 'newLeaf', type: 'dashboard' });
    }
};
__VLS_7.slots.default;
const __VLS_12 = {}.Icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    name: "dv-new-folder",
}));
const __VLS_14 = __VLS_13({
    name: "dv-new-folder",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ope_add;
/** @type {[typeof __VLS_components.Ope_add, typeof __VLS_components.ope_add, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "svg-icon" },
}));
const __VLS_18 = __VLS_17({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
var __VLS_15;
var __VLS_7;
var __VLS_3;
const __VLS_20 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.filterText),
    placeholder: (__VLS_ctx.t('dashboard.search')),
    clearable: true,
    ...{ class: "search-bar" },
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.filterText),
    placeholder: (__VLS_ctx.t('dashboard.search')),
    clearable: true,
    ...{ class: "search-bar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_23.slots;
    const __VLS_24 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    const __VLS_28 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        name: "icon_search-outline_outlined",
    }));
    const __VLS_30 = __VLS_29({
        name: "icon_search-outline_outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ class: "svg-icon" },
    }));
    const __VLS_34 = __VLS_33({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    var __VLS_31;
    var __VLS_27;
}
var __VLS_23;
const __VLS_36 = {}.ElDropdown;
/** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onCommand': {} },
    popperClass: "tree-sort-menu-custom",
    trigger: "click",
    placement: "bottom-end",
}));
const __VLS_38 = __VLS_37({
    ...{ 'onCommand': {} },
    popperClass: "tree-sort-menu-custom",
    trigger: "click",
    placement: "bottom-end",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onCommand: (__VLS_ctx.handleSortTypeChange)
};
__VLS_39.slots.default;
const __VLS_44 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ class: "filter-icon-span" },
    ...{ class: (__VLS_ctx.state.curSortType !== 'name_asc' && 'active') },
}));
const __VLS_46 = __VLS_45({
    ...{ class: "filter-icon-span" },
    ...{ class: (__VLS_ctx.state.curSortType !== 'name_asc' && 'active') },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    offset: (16),
    effect: "dark",
    content: (__VLS_ctx.sortTypeTip),
    placement: "top",
}));
const __VLS_50 = __VLS_49({
    offset: (16),
    effect: "dark",
    content: (__VLS_ctx.sortTypeTip),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
if (__VLS_ctx.state.curSortType.includes('asc')) {
    const __VLS_52 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        name: "dv-sort-asc",
        ...{ class: "opt-icon" },
    }));
    const __VLS_54 = __VLS_53({
        name: "dv-sort-asc",
        ...{ class: "opt-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    const __VLS_56 = {}.dv_sort_asc;
    /** @type {[typeof __VLS_components.Dv_sort_asc, typeof __VLS_components.dv_sort_asc, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ class: "svg-icon opt-icon" },
    }));
    const __VLS_58 = __VLS_57({
        ...{ class: "svg-icon opt-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    var __VLS_55;
}
var __VLS_51;
const __VLS_60 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    offset: (16),
    effect: "dark",
    content: (__VLS_ctx.sortTypeTip),
    placement: "top",
}));
const __VLS_62 = __VLS_61({
    offset: (16),
    effect: "dark",
    content: (__VLS_ctx.sortTypeTip),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
if (__VLS_ctx.state.curSortType.includes('desc')) {
    const __VLS_64 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        name: "dv-sort-desc",
        ...{ class: "opt-icon" },
    }));
    const __VLS_66 = __VLS_65({
        name: "dv-sort-desc",
        ...{ class: "opt-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    const __VLS_68 = {}.dv_sort_desc;
    /** @type {[typeof __VLS_components.Dv_sort_desc, typeof __VLS_components.dv_sort_desc, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ class: "svg-icon opt-icon" },
    }));
    const __VLS_70 = __VLS_69({
        ...{ class: "svg-icon opt-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    var __VLS_67;
}
var __VLS_63;
var __VLS_47;
{
    const { dropdown: __VLS_thisSlot } = __VLS_39.slots;
    const __VLS_72 = {}.ElDropdownMenu;
    /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ style: {} },
    }));
    const __VLS_74 = __VLS_73({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sort_menu" },
    });
    (__VLS_ctx.t('dashboard.sort_column'));
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.sortColumnList))) {
        (ele.value);
        const __VLS_76 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            ...{ class: "ed-select-dropdown__item" },
            ...{ class: (__VLS_ctx.state.curSortType.includes(ele.value) && 'selected') },
            command: (ele.value),
        }));
        const __VLS_78 = __VLS_77({
            ...{ class: "ed-select-dropdown__item" },
            ...{ class: (__VLS_ctx.state.curSortType.includes(ele.value) && 'selected') },
            command: (ele.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        __VLS_79.slots.default;
        (ele.name);
        var __VLS_79;
        if (ele.divided) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                ...{ class: "ed-dropdown-menu__item--divided" },
            });
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sort_menu" },
    });
    (__VLS_ctx.t('dashboard.sort_type'));
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.sortTypeList))) {
        const __VLS_80 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            ...{ class: "ed-select-dropdown__item" },
            ...{ class: (__VLS_ctx.state.curSortType.includes(ele.value) && 'selected') },
            command: (ele.value),
        }));
        const __VLS_82 = __VLS_81({
            ...{ class: "ed-select-dropdown__item" },
            ...{ class: (__VLS_ctx.state.curSortType.includes(ele.value) && 'selected') },
            command: (ele.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_83.slots.default;
        (ele.name);
        var __VLS_83;
    }
    var __VLS_75;
}
var __VLS_39;
const __VLS_84 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ class: "custom-tree" },
}));
const __VLS_86 = __VLS_85({
    ...{ class: "custom-tree" },
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.copyLoading) }, null, null);
__VLS_87.slots.default;
const __VLS_88 = {}.ElTree;
/** @type {[typeof __VLS_components.ElTree, typeof __VLS_components.elTree, typeof __VLS_components.ElTree, typeof __VLS_components.elTree, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ 'onNodeExpand': {} },
    ...{ 'onNodeCollapse': {} },
    ...{ 'onNodeClick': {} },
    ...{ 'onNodeDragStart': {} },
    ...{ 'onNodeDrop': {} },
    ref: "resourceListTree",
    ...{ style: {} },
    menu: true,
    emptyText: (__VLS_ctx.t('dashboard.no_dashboard')),
    defaultExpandedKeys: (__VLS_ctx.expandedArray),
    data: (__VLS_ctx.state.resourceTree),
    props: (__VLS_ctx.defaultProps),
    nodeKey: "id",
    highlightCurrent: true,
    expandOnClickNode: (true),
    filterNodeMethod: (__VLS_ctx.filterNode),
    draggable: true,
}));
const __VLS_90 = __VLS_89({
    ...{ 'onNodeExpand': {} },
    ...{ 'onNodeCollapse': {} },
    ...{ 'onNodeClick': {} },
    ...{ 'onNodeDragStart': {} },
    ...{ 'onNodeDrop': {} },
    ref: "resourceListTree",
    ...{ style: {} },
    menu: true,
    emptyText: (__VLS_ctx.t('dashboard.no_dashboard')),
    defaultExpandedKeys: (__VLS_ctx.expandedArray),
    data: (__VLS_ctx.state.resourceTree),
    props: (__VLS_ctx.defaultProps),
    nodeKey: "id",
    highlightCurrent: true,
    expandOnClickNode: (true),
    filterNodeMethod: (__VLS_ctx.filterNode),
    draggable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
let __VLS_92;
let __VLS_93;
let __VLS_94;
const __VLS_95 = {
    onNodeExpand: (__VLS_ctx.nodeExpand)
};
const __VLS_96 = {
    onNodeCollapse: (__VLS_ctx.nodeCollapse)
};
const __VLS_97 = {
    onNodeClick: (__VLS_ctx.nodeClick)
};
const __VLS_98 = {
    onNodeDragStart: (__VLS_ctx.handleDragStart)
};
const __VLS_99 = {
    onNodeDrop: (__VLS_ctx.handleDrop)
};
/** @type {typeof __VLS_ctx.resourceListTree} */ ;
var __VLS_100 = {};
__VLS_91.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_91.slots;
    const [{ node, data }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "custom-tree-node" },
    });
    if (data.node_type !== 'leaf') {
        const __VLS_102 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            ...{ style: {} },
        }));
        const __VLS_104 = __VLS_103({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        __VLS_105.slots.default;
        const __VLS_106 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
            name: "icon_folder",
        }));
        const __VLS_108 = __VLS_107({
            name: "icon_folder",
        }, ...__VLS_functionalComponentArgsRest(__VLS_107));
        __VLS_109.slots.default;
        const __VLS_110 = {}.icon_folder;
        /** @type {[typeof __VLS_components.Icon_folder, typeof __VLS_components.icon_folder, ]} */ ;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
            ...{ class: "svg-icon" },
        }));
        const __VLS_112 = __VLS_111({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_111));
        var __VLS_109;
        var __VLS_105;
    }
    else {
        const __VLS_114 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            ...{ class: "icon-primary" },
            ...{ style: {} },
        }));
        const __VLS_116 = __VLS_115({
            ...{ class: "icon-primary" },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        __VLS_117.slots.default;
        const __VLS_118 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
            name: "icon_dashboard",
        }));
        const __VLS_120 = __VLS_119({
            name: "icon_dashboard",
        }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        __VLS_121.slots.default;
        const __VLS_122 = {}.icon_dashboard;
        /** @type {[typeof __VLS_components.Icon_dashboard, typeof __VLS_components.icon_dashboard, ]} */ ;
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
            ...{ class: "svg-icon" },
        }));
        const __VLS_124 = __VLS_123({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        var __VLS_121;
        var __VLS_117;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        title: (node.label),
        ...{ class: "label-tooltip" },
    });
    (node.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "icon-more" },
    });
    if (data.node_type !== 'leaf') {
        const __VLS_126 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
            ...{ 'onClick': {} },
            ...{ 'onClick': {} },
            ...{ class: "hover-icon" },
        }));
        const __VLS_128 = __VLS_127({
            ...{ 'onClick': {} },
            ...{ 'onClick': {} },
            ...{ class: "hover-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        let __VLS_130;
        let __VLS_131;
        let __VLS_132;
        const __VLS_133 = {
            onClick: () => { }
        };
        const __VLS_134 = {
            onClick: (...[$event]) => {
                if (!(data.node_type !== 'leaf'))
                    return;
                __VLS_ctx.addOperation({ opt: 'newLeaf', type: 'dashboard', id: data.id });
            }
        };
        __VLS_129.slots.default;
        const __VLS_135 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({}));
        const __VLS_137 = __VLS_136({}, ...__VLS_functionalComponentArgsRest(__VLS_136));
        __VLS_138.slots.default;
        const __VLS_139 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
            ...{ class: "svg-icon" },
        }));
        const __VLS_141 = __VLS_140({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_140));
        var __VLS_138;
        var __VLS_129;
    }
    /** @type {[typeof HandleMore, typeof HandleMore, ]} */ ;
    // @ts-ignore
    const __VLS_143 = __VLS_asFunctionalComponent(HandleMore, new HandleMore({
        ...{ 'onHandleCommand': {} },
        menuList: (__VLS_ctx.state.menuList),
        iconName: (__VLS_ctx.icon_more_outlined),
        placement: "bottom-end",
    }));
    const __VLS_144 = __VLS_143({
        ...{ 'onHandleCommand': {} },
        menuList: (__VLS_ctx.state.menuList),
        iconName: (__VLS_ctx.icon_more_outlined),
        placement: "bottom-end",
    }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    let __VLS_146;
    let __VLS_147;
    let __VLS_148;
    const __VLS_149 = {
        onHandleCommand: ((opt) => __VLS_ctx.operation(opt, data))
    };
    var __VLS_145;
}
var __VLS_91;
var __VLS_87;
/** @type {[typeof ResourceGroupOpt, typeof ResourceGroupOpt, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(ResourceGroupOpt, new ResourceGroupOpt({
    ...{ 'onFinish': {} },
    ref: "resourceGroupOptRef",
}));
const __VLS_151 = __VLS_150({
    ...{ 'onFinish': {} },
    ref: "resourceGroupOptRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
let __VLS_153;
let __VLS_154;
let __VLS_155;
const __VLS_156 = {
    onFinish: (__VLS_ctx.baseInfoChangeFinish)
};
/** @type {typeof __VLS_ctx.resourceGroupOptRef} */ ;
var __VLS_157 = {};
var __VLS_152;
/** @type {__VLS_StyleScopedClasses['resource-tree']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-header']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-methods']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['primary-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-icon-span']} */ ;
/** @type {__VLS_StyleScopedClasses['opt-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['opt-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['opt-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['opt-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sort_menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-select-dropdown__item']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-dropdown-menu__item--divided']} */ ;
/** @type {__VLS_StyleScopedClasses['sort_menu']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-select-dropdown__item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-tree']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-tree-node']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['label-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-more']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
// @ts-ignore
var __VLS_101 = __VLS_100, __VLS_158 = __VLS_157;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_add_outlined: icon_add_outlined,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            icon_folder: icon_folder,
            ope_add: ope_add,
            icon_dashboard: icon_dashboard,
            icon_more_outlined: icon_more_outlined,
            dv_sort_asc: dv_sort_asc,
            dv_sort_desc: dv_sort_desc,
            ElIcon: ElIcon,
            ElScrollbar: ElScrollbar,
            Icon: Icon,
            ResourceGroupOpt: ResourceGroupOpt,
            HandleMore: HandleMore,
            t: t,
            resourceGroupOptRef: resourceGroupOptRef,
            defaultProps: defaultProps,
            filterText: filterText,
            expandedArray: expandedArray,
            resourceListTree: resourceListTree,
            state: state,
            handleDrop: handleDrop,
            handleDragStart: handleDragStart,
            nodeExpand: nodeExpand,
            nodeCollapse: nodeCollapse,
            filterNode: filterNode,
            nodeClick: nodeClick,
            copyLoading: copyLoading,
            addOperation: addOperation,
            operation: operation,
            baseInfoChangeFinish: baseInfoChangeFinish,
            handleSortTypeChange: handleSortTypeChange,
            sortColumnList: sortColumnList,
            sortTypeList: sortTypeList,
            sortTypeTip: sortTypeTip,
        };
    },
    emits: {},
    props: {
        curCanvasType: {
            type: String,
            required: true,
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        resourceTable: {
            required: false,
            type: String,
            default: 'core',
        },
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
        curCanvasType: {
            type: String,
            required: true,
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        resourceTable: {
            required: false,
            type: String,
            default: 'core',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
