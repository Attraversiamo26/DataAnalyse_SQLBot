import { ref, computed, shallowRef, h } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus-secondary';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import arrow_down from '@/assets/svg/arrow-down.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import { useRouter } from 'vue-router';
import DataTable from './DataTable.vue';
import icon_done_outlined from '@/assets/svg/icon_done_outlined.svg';
import { datasourceApi } from '@/api/datasource';
import AddDrawer from '@/views/ds/AddDrawer.vue';
import Card from './Card.vue';
import { useEmitt } from '@/utils/useEmitt';
import DelMessageBox from './DelMessageBox.vue';
import { dsTypeWithImg } from './js/ds-type';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { chatApi } from '@/api/chat';
import RecommendedProblemConfigDialog from '@/views/ds/RecommendedProblemConfigDialog.vue';
import { highlightKeyword } from '@/utils/xss';
const userStore = useUserStore();
const recommendedProblemConfigRef = ref();
const router = useRouter();
const { t } = useI18n();
const keywords = ref('');
const defaultDatasourceKeywords = ref('');
const addDrawerRef = ref();
const searchLoading = ref(false);
const datasourceList = shallowRef([]);
const defaultDatasourceList = shallowRef(dsTypeWithImg);
const currentDefaultDatasource = ref('');
const datasourceListWithSearch = computed(() => {
    if (!keywords.value && !currentDatasourceType.value)
        return datasourceList.value;
    return datasourceList.value.filter((ele) => ele.name.toLowerCase().includes(keywords.value.toLowerCase()) &&
        (ele.type === currentDatasourceType.value || !currentDatasourceType.value));
});
const defaultDatasourceListWithSearch = computed(() => {
    if (!defaultDatasourceKeywords.value)
        return defaultDatasourceList.value;
    return defaultDatasourceList.value.filter((ele) => ele.name.toLowerCase().includes(defaultDatasourceKeywords.value.toLowerCase()));
});
const currentDatasourceType = ref('');
const handleDefaultDatasourceChange = (item) => {
    if (currentDatasourceType.value === item.type) {
        currentDefaultDatasource.value = '';
        currentDatasourceType.value = '';
    }
    else {
        currentDefaultDatasource.value = item.name;
        currentDatasourceType.value = item.type;
    }
};
const formatKeywords = (item) => {
    // Use XSS-safe highlight function
    return highlightKeyword(item, defaultDatasourceKeywords.value, 'isSearch');
};
const handleEditDatasource = (res) => {
    addDrawerRef.value.handleEditDatasource(res);
};
const handleRecommendation = (res) => {
    recommendedProblemConfigRef.value?.init(res);
};
const handleQuestion = async (id) => {
    try {
        await chatApi.checkLLMModel();
    }
    catch (error) {
        console.error(error);
        let errorMsg = t('model.default_miss');
        let confirm_text = t('datasource.got_it');
        if (userStore.isAdmin) {
            errorMsg = t('model.default_miss_admin');
            confirm_text = t('model.to_config');
        }
        ElMessageBox.confirm(t('qa.ask_failed'), {
            confirmButtonType: 'primary',
            tip: errorMsg,
            showCancelButton: userStore.isAdmin,
            confirmButtonText: confirm_text,
            cancelButtonText: t('common.cancel'),
            customClass: 'confirm-no_icon',
            autofocus: false,
            showClose: false,
            callback: (val) => {
                if (userStore.isAdmin && val === 'confirm') {
                    router.push('/system/model');
                }
            },
        });
        return;
    }
    router.push({
        path: '/chat/index',
        query: {
            start_chat: id,
        },
    });
};
const handleAddDatasource = () => {
    addDrawerRef.value.handleAddDatasource();
};
const refreshData = () => {
    search();
};
const panelClick = () => {
    console.info('panelClick');
};
const smartClick = () => {
    console.info('smartClick');
};
const deleteHandler = (item) => {
    ElMessageBox.confirm('', {
        confirmButtonType: 'danger',
        tip: t('datasource.operate_with_caution'),
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
        dangerouslyUseHTMLString: true,
        message: h(DelMessageBox, {
            name: item.name,
            panelNum: 1,
            smartNum: 4,
            onPanelClick: panelClick,
            onSmartClick: smartClick,
            t,
        }, ''),
    }).then(() => {
        datasourceApi.delete(item.id, item.name).then(() => {
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
            });
            search();
        });
    });
    // .catch(() => {
    //   ElMessageBox.confirm(t('datasource.data_source_de', { msg: item.name }), {
    //     tip: t('datasource.cannot_be_deleted'),
    //     cancelButtonText: t('datasource.got_it'),
    //     showConfirmButton: false,
    //     customClass: 'confirm-no_icon',
    //     autofocus: false,
    //   })
    // })
};
const search = () => {
    searchLoading.value = true;
    datasourceApi
        .list()
        .then((res) => {
        datasourceList.value = res;
    })
        .finally(() => {
        searchLoading.value = false;
    });
};
search();
const currentDataTable = ref();
const dataTableDetail = (ele) => {
    currentDataTable.value = ele;
};
const back = () => {
    currentDataTable.value = null;
};
useEmitt({
    name: 'ds-index-click',
    callback: back,
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-config no-padding" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.currentDataTable) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-methods" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "title" },
});
(__VLS_ctx.$t('ds.title'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "button-input" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
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
    const __VLS_8 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ class: "svg-icon" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
}
var __VLS_3;
const __VLS_12 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    popperClass: "system-default_datasource",
    placement: "bottom-end",
}));
const __VLS_14 = __VLS_13({
    popperClass: "system-default_datasource",
    placement: "bottom-end",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
{
    const { reference: __VLS_thisSlot } = __VLS_15.slots;
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        secondary: true,
    }));
    const __VLS_18 = __VLS_17({
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    (__VLS_ctx.currentDefaultDatasource || __VLS_ctx.$t('datasource.all_types'));
    const __VLS_20 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ style: {} },
    }));
    const __VLS_22 = __VLS_21({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.arrow_down;
    /** @type {[typeof __VLS_components.Arrow_down, typeof __VLS_components.arrow_down, typeof __VLS_components.Arrow_down, typeof __VLS_components.arrow_down, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_23;
    var __VLS_19;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover" },
});
const __VLS_28 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.defaultDatasourceKeywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search_by_name')),
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.defaultDatasourceKeywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search_by_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_31.slots;
    const __VLS_32 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ class: "svg-icon" },
    }));
    const __VLS_38 = __VLS_37({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    var __VLS_35;
}
var __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-content" },
});
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.defaultDatasourceListWithSearch))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleDefaultDatasourceChange(ele);
            } },
        key: (ele.name),
        ...{ class: "popover-item" },
        ...{ class: (__VLS_ctx.currentDefaultDatasource === ele.name && 'isActive') },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (ele.img),
        width: "24px",
        height: "24px",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-name" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.formatKeywords(ele.name)) }, null, null);
    const __VLS_40 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        size: "16",
        ...{ class: "done" },
    }));
    const __VLS_42 = __VLS_41({
        size: "16",
        ...{ class: "done" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.icon_done_outlined;
    /** @type {[typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, typeof __VLS_components.Icon_done_outlined, typeof __VLS_components.icon_done_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    var __VLS_43;
}
if (!__VLS_ctx.defaultDatasourceListWithSearch.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover-item empty" },
    });
    (__VLS_ctx.t('model.relevant_results_found'));
}
var __VLS_15;
const __VLS_48 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (__VLS_ctx.handleAddDatasource)
};
__VLS_51.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_51.slots;
    const __VLS_56 = {}.icon_add_outlined;
    /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
}
(__VLS_ctx.$t('datasource.new_data_source'));
var __VLS_51;
if (!!__VLS_ctx.keywords && !__VLS_ctx.datasourceListWithSearch.length) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        ...{ class: "datasource-yet" },
        imgType: "tree",
    }));
    const __VLS_61 = __VLS_60({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        ...{ class: "datasource-yet" },
        imgType: "tree",
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    const __VLS_63 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
        gutter: (16),
        ...{ class: "w-full" },
    }));
    const __VLS_65 = __VLS_64({
        gutter: (16),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    __VLS_66.slots.default;
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.datasourceListWithSearch))) {
        const __VLS_67 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }));
        const __VLS_69 = __VLS_68({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_68));
        __VLS_70.slots.default;
        /** @type {[typeof Card, typeof Card, ]} */ ;
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent(Card, new Card({
            ...{ 'onQuestion': {} },
            ...{ 'onEdit': {} },
            ...{ 'onRecommendation': {} },
            ...{ 'onDel': {} },
            ...{ 'onDataTableDetail': {} },
            id: (ele.id),
            key: (ele.id),
            name: (ele.name),
            type: (ele.type),
            typeName: (ele.type_name),
            num: (ele.num),
            description: (ele.description),
        }));
        const __VLS_72 = __VLS_71({
            ...{ 'onQuestion': {} },
            ...{ 'onEdit': {} },
            ...{ 'onRecommendation': {} },
            ...{ 'onDel': {} },
            ...{ 'onDataTableDetail': {} },
            id: (ele.id),
            key: (ele.id),
            name: (ele.name),
            type: (ele.type),
            typeName: (ele.type_name),
            num: (ele.num),
            description: (ele.description),
        }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        let __VLS_74;
        let __VLS_75;
        let __VLS_76;
        const __VLS_77 = {
            onQuestion: (__VLS_ctx.handleQuestion)
        };
        const __VLS_78 = {
            onEdit: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.datasourceListWithSearch.length))
                    return;
                __VLS_ctx.handleEditDatasource(ele);
            }
        };
        const __VLS_79 = {
            onRecommendation: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.datasourceListWithSearch.length))
                    return;
                __VLS_ctx.handleRecommendation(ele);
            }
        };
        const __VLS_80 = {
            onDel: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.datasourceListWithSearch.length))
                    return;
                __VLS_ctx.deleteHandler(ele);
            }
        };
        const __VLS_81 = {
            onDataTableDetail: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.datasourceListWithSearch.length))
                    return;
                __VLS_ctx.dataTableDetail(ele);
            }
        };
        var __VLS_73;
        var __VLS_70;
    }
    var __VLS_66;
}
if (!__VLS_ctx.keywords && !__VLS_ctx.datasourceListWithSearch.length && !__VLS_ctx.searchLoading) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        ...{ class: "datasource-yet" },
        description: (__VLS_ctx.$t('datasource.data_source_yet')),
        imgType: "noneWhite",
    }));
    const __VLS_83 = __VLS_82({
        ...{ class: "datasource-yet" },
        description: (__VLS_ctx.$t('datasource.data_source_yet')),
        imgType: "noneWhite",
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_85 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_87 = __VLS_86({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    let __VLS_89;
    let __VLS_90;
    let __VLS_91;
    const __VLS_92 = {
        onClick: (__VLS_ctx.handleAddDatasource)
    };
    __VLS_88.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_88.slots;
        const __VLS_93 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
        const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
    }
    (__VLS_ctx.$t('datasource.new_data_source'));
    var __VLS_88;
}
/** @type {[typeof RecommendedProblemConfigDialog, typeof RecommendedProblemConfigDialog, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(RecommendedProblemConfigDialog, new RecommendedProblemConfigDialog({
    ...{ 'onRecommendedProblemChange': {} },
    ref: "recommendedProblemConfigRef",
}));
const __VLS_98 = __VLS_97({
    ...{ 'onRecommendedProblemChange': {} },
    ref: "recommendedProblemConfigRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
let __VLS_100;
let __VLS_101;
let __VLS_102;
const __VLS_103 = {
    onRecommendedProblemChange: (__VLS_ctx.search)
};
/** @type {typeof __VLS_ctx.recommendedProblemConfigRef} */ ;
var __VLS_104 = {};
var __VLS_99;
/** @type {[typeof AddDrawer, typeof AddDrawer, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(AddDrawer, new AddDrawer({
    ...{ 'onSearch': {} },
    ref: "addDrawerRef",
}));
const __VLS_107 = __VLS_106({
    ...{ 'onSearch': {} },
    ref: "addDrawerRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
let __VLS_109;
let __VLS_110;
let __VLS_111;
const __VLS_112 = {
    onSearch: (__VLS_ctx.search)
};
/** @type {typeof __VLS_ctx.addDrawerRef} */ ;
var __VLS_113 = {};
var __VLS_108;
if (__VLS_ctx.currentDataTable) {
    /** @type {[typeof DataTable, typeof DataTable, ]} */ ;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(DataTable, new DataTable({
        ...{ 'onRefresh': {} },
        ...{ 'onBack': {} },
        info: (__VLS_ctx.currentDataTable),
    }));
    const __VLS_116 = __VLS_115({
        ...{ 'onRefresh': {} },
        ...{ 'onBack': {} },
        info: (__VLS_ctx.currentDataTable),
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    let __VLS_118;
    let __VLS_119;
    let __VLS_120;
    const __VLS_121 = {
        onRefresh: (__VLS_ctx.refreshData)
    };
    const __VLS_122 = {
        onBack: (__VLS_ctx.back)
    };
    var __VLS_117;
}
/** @type {__VLS_StyleScopedClasses['datasource-config']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-methods']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['button-input']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-name']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-yet']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-16']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-yet']} */ ;
// @ts-ignore
var __VLS_105 = __VLS_104, __VLS_114 = __VLS_113;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            arrow_down: arrow_down,
            icon_add_outlined: icon_add_outlined,
            EmptyBackground: EmptyBackground,
            DataTable: DataTable,
            icon_done_outlined: icon_done_outlined,
            AddDrawer: AddDrawer,
            Card: Card,
            RecommendedProblemConfigDialog: RecommendedProblemConfigDialog,
            recommendedProblemConfigRef: recommendedProblemConfigRef,
            t: t,
            keywords: keywords,
            defaultDatasourceKeywords: defaultDatasourceKeywords,
            addDrawerRef: addDrawerRef,
            searchLoading: searchLoading,
            currentDefaultDatasource: currentDefaultDatasource,
            datasourceListWithSearch: datasourceListWithSearch,
            defaultDatasourceListWithSearch: defaultDatasourceListWithSearch,
            handleDefaultDatasourceChange: handleDefaultDatasourceChange,
            formatKeywords: formatKeywords,
            handleEditDatasource: handleEditDatasource,
            handleRecommendation: handleRecommendation,
            handleQuestion: handleQuestion,
            handleAddDatasource: handleAddDatasource,
            refreshData: refreshData,
            deleteHandler: deleteHandler,
            search: search,
            currentDataTable: currentDataTable,
            dataTableDetail: dataTableDetail,
            back: back,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
