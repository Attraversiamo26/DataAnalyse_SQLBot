import { onMounted, ref, computed, shallowRef, onBeforeUnmount, onBeforeMount } from 'vue';
import icon_close_outlined from '@/assets/svg/operate/ope-close.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import { chatApi } from '@/api/chat.ts';
import { datasourceApi } from '@/api/datasource.ts';
import Card from '@/views/ds/ChatCard.vue';
import AddDrawer from '@/views/ds/AddDrawer.vue';
import { useUserStore } from '@/stores/user';
import { useAssistantStore } from '@/stores/assistant';
import { request } from '@/utils/request';
const assistantStore = useAssistantStore();
const userStore = useUserStore();
const isWsAdmin = computed(() => userStore.isAdmin || userStore.isSpaceAdmin);
const selectAssistantDs = computed(() => assistantStore.getAssistant && !assistantStore.getEmbedded && !assistantStore.getAutoDs);
const props = withDefaults(defineProps(), {
    hidden: false,
});
const addDrawerRef = ref();
const searchLoading = ref(false);
const datasourceConfigVisible = ref(false);
const keywords = ref('');
const datasourceList = shallowRef([]);
const datasourceListWithSearch = computed(() => {
    if (!keywords.value)
        return datasourceList.value;
    return datasourceList.value.filter((ele) => ele.name.toLowerCase().includes(keywords.value.toLowerCase()));
});
const beforeClose = () => {
    datasourceConfigVisible.value = false;
    keywords.value = '';
};
const emits = defineEmits(['onChatCreated']);
function listDs() {
    searchLoading.value = true;
    (selectAssistantDs.value ? request.get('/system/assistant/ds') : datasourceApi.list())
        .then((res) => {
        datasourceList.value = res;
    })
        .finally(() => {
        searchLoading.value = false;
    });
}
const innerDs = ref();
const loading = ref(false);
const statusLoading = ref(false);
function showDs() {
    listDs();
    datasourceConfigVisible.value = true;
}
function hideDs() {
    innerDs.value = undefined;
    datasourceConfigVisible.value = false;
}
function selectDsInDialog(ds) {
    innerDs.value = ds.id;
}
function confirmSelectDs() {
    if (innerDs.value) {
        if (assistantStore.getType == 1) {
            createChat(innerDs.value);
            return;
        }
        statusLoading.value = true;
        //check first
        datasourceApi
            .check_by_id(innerDs.value)
            .then((res) => {
            if (res) {
                createChat(innerDs.value);
            }
        })
            .finally(() => {
            statusLoading.value = false;
        });
    }
}
function createChat(datasource) {
    loading.value = true;
    const param = {
        datasource: datasource,
    };
    let method = chatApi.startChat;
    if (assistantStore.getAssistant) {
        param['origin'] = 2;
        method = chatApi.startAssistantChat;
    }
    method(param)
        .then((res) => {
        const chat = chatApi.toChatInfo(res);
        if (chat == undefined) {
            throw Error('chat is undefined');
        }
        emits('onChatCreated', chat);
        hideDs();
    })
        .catch((e) => {
        console.error(e);
    })
        .finally(() => {
        loading.value = false;
    });
}
const drawerHeight = ref(0);
const setHeight = () => {
    drawerHeight.value = document.body.clientHeight - 100;
    console.log(drawerHeight.value);
};
onMounted(() => {
    if (props.hidden) {
        return;
    }
});
onBeforeMount(() => {
    setHeight();
    window.addEventListener('resize', setHeight);
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', setHeight);
});
const handleAddDatasource = () => {
    addDrawerRef.value.handleAddDatasource();
};
const __VLS_exposed = {
    showDs,
    hideDs,
    createChat,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    hidden: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: { body: true, fullscreen: true, lock: true, }, value: (__VLS_ctx.loading || __VLS_ctx.statusLoading) }, null, null);
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.datasourceConfigVisible),
    closeOnClickModal: (false),
    size: (__VLS_ctx.drawerHeight),
    modalClass: "datasource-drawer-chat",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.datasourceConfigVisible),
    closeOnClickModal: (false),
    size: (__VLS_ctx.drawerHeight),
    modalClass: "datasource-drawer-chat",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    const [{ close }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.$t('qa.select_datasource'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex-center" },
        ...{ style: {} },
    });
    const __VLS_4 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        modelValue: (__VLS_ctx.keywords),
        clearable: true,
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('datasource.search')),
    }));
    const __VLS_6 = __VLS_5({
        modelValue: (__VLS_ctx.keywords),
        clearable: true,
        ...{ style: {} },
        placeholder: (__VLS_ctx.$t('datasource.search')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_7.slots;
        const __VLS_8 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
        const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_11.slots.default;
        const __VLS_12 = {}.icon_searchOutline_outlined;
        /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        var __VLS_11;
    }
    var __VLS_7;
    const __VLS_16 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        ...{ class: "ed-dialog__headerbtn mrt" },
        ...{ style: {} },
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        ...{ class: "ed-dialog__headerbtn mrt" },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (close)
    };
    __VLS_19.slots.default;
    const __VLS_24 = {}.icon_close_outlined;
    /** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_19;
}
if (__VLS_ctx.datasourceListWithSearch.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    const __VLS_28 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        gutter: (16),
        ...{ class: "w-full" },
    }));
    const __VLS_30 = __VLS_29({
        gutter: (16),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.datasourceListWithSearch))) {
        const __VLS_32 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }));
        const __VLS_34 = __VLS_33({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        /** @type {[typeof Card, typeof Card, ]} */ ;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(Card, new Card({
            ...{ 'onSelectDs': {} },
            id: (ele.id),
            key: (ele.id),
            name: (ele.name),
            type: (ele.type),
            typeName: (ele.type_name),
            num: (ele.num),
            isSelected: (ele.id === __VLS_ctx.innerDs),
            description: (ele.description),
        }));
        const __VLS_37 = __VLS_36({
            ...{ 'onSelectDs': {} },
            id: (ele.id),
            key: (ele.id),
            name: (ele.name),
            type: (ele.type),
            typeName: (ele.type_name),
            num: (ele.num),
            isSelected: (ele.id === __VLS_ctx.innerDs),
            description: (ele.description),
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        let __VLS_39;
        let __VLS_40;
        let __VLS_41;
        const __VLS_42 = {
            onSelectDs: (...[$event]) => {
                if (!(__VLS_ctx.datasourceListWithSearch.length))
                    return;
                __VLS_ctx.selectDsInDialog(ele);
            }
        };
        var __VLS_38;
        var __VLS_35;
    }
    var __VLS_31;
}
if (!__VLS_ctx.keywords && !__VLS_ctx.datasourceListWithSearch.length && !__VLS_ctx.searchLoading) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        ...{ class: "datasource-yet_btn" },
        description: (__VLS_ctx.$t('datasource.data_source_yet')),
        imgType: "noneWhite",
    }));
    const __VLS_44 = __VLS_43({
        ...{ class: "datasource-yet_btn" },
        description: (__VLS_ctx.$t('datasource.data_source_yet')),
        imgType: "noneWhite",
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    if (__VLS_ctx.isWsAdmin) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_46 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_48 = __VLS_47({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        let __VLS_50;
        let __VLS_51;
        let __VLS_52;
        const __VLS_53 = {
            onClick: (__VLS_ctx.handleAddDatasource)
        };
        __VLS_49.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_49.slots;
            const __VLS_54 = {}.icon_add_outlined;
            /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({}));
            const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
        }
        (__VLS_ctx.$t('datasource.new_data_source'));
        var __VLS_49;
    }
}
if (!!__VLS_ctx.keywords && !__VLS_ctx.datasourceListWithSearch.length) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        ...{ class: "datasource-yet" },
        imgType: "tree",
    }));
    const __VLS_59 = __VLS_58({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        ...{ class: "datasource-yet" },
        imgType: "tree",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
}
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_61 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (__VLS_ctx.loading),
    }));
    const __VLS_63 = __VLS_62({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_65;
    let __VLS_66;
    let __VLS_67;
    const __VLS_68 = {
        onClick: (__VLS_ctx.hideDs)
    };
    __VLS_64.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_64;
    const __VLS_69 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.loading || __VLS_ctx.statusLoading || __VLS_ctx.innerDs === undefined ? 'info' : 'primary'),
        disabled: (__VLS_ctx.loading || __VLS_ctx.statusLoading || __VLS_ctx.innerDs === undefined),
    }));
    const __VLS_71 = __VLS_70({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.loading || __VLS_ctx.statusLoading || __VLS_ctx.innerDs === undefined ? 'info' : 'primary'),
        disabled: (__VLS_ctx.loading || __VLS_ctx.statusLoading || __VLS_ctx.innerDs === undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_73;
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = {
        onClick: (__VLS_ctx.confirmSelectDs)
    };
    __VLS_72.slots.default;
    (__VLS_ctx.$t('datasource.confirm'));
    var __VLS_72;
}
var __VLS_3;
/** @type {[typeof AddDrawer, typeof AddDrawer, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(AddDrawer, new AddDrawer({
    ...{ 'onSearch': {} },
    ref: "addDrawerRef",
}));
const __VLS_78 = __VLS_77({
    ...{ 'onSearch': {} },
    ref: "addDrawerRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onSearch: (__VLS_ctx.listDs)
};
/** @type {typeof __VLS_ctx.addDrawerRef} */ ;
var __VLS_84 = {};
var __VLS_79;
/** @type {__VLS_StyleScopedClasses['flex-center']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-dialog__headerbtn']} */ ;
/** @type {__VLS_StyleScopedClasses['mrt']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-16']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-yet_btn']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-yet']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_85 = __VLS_84;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_close_outlined: icon_close_outlined,
            icon_add_outlined: icon_add_outlined,
            EmptyBackground: EmptyBackground,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            Card: Card,
            AddDrawer: AddDrawer,
            isWsAdmin: isWsAdmin,
            addDrawerRef: addDrawerRef,
            searchLoading: searchLoading,
            datasourceConfigVisible: datasourceConfigVisible,
            keywords: keywords,
            datasourceListWithSearch: datasourceListWithSearch,
            beforeClose: beforeClose,
            listDs: listDs,
            innerDs: innerDs,
            loading: loading,
            statusLoading: statusLoading,
            hideDs: hideDs,
            selectDsInDialog: selectDsInDialog,
            confirmSelectDs: confirmSelectDs,
            drawerHeight: drawerHeight,
            handleAddDatasource: handleAddDatasource,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
