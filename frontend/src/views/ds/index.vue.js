import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import IconOpeAdd from '@/assets/svg/operate/ope-add.svg';
import IconOpeEdit from '@/assets/svg/operate/ope-edit.svg';
import IconOpeDelete from '@/assets/svg/operate/ope-delete.svg';
import { Search, List } from '@element-plus/icons-vue';
import DsForm from './form.vue';
import { datasourceApi } from '@/api/datasource';
import { ElMessageBox } from 'element-plus-secondary';
import { useRouter } from 'vue-router';
import DatasourceItemCard from '@/views/ds/DatasourceItemCard.vue';
const { t } = useI18n();
const searchValue = ref('');
const dsForm = ref();
const dsList = ref([]); // show ds list
const allDsList = ref([]); // all ds list
const router = useRouter();
const loading = ref(false);
function searchHandle() {
    if (searchValue.value) {
        dsList.value = JSON.parse(JSON.stringify(allDsList.value)).filter((item) => {
            return item.name.toLowerCase().includes(searchValue.value.toLowerCase());
        });
    }
    else {
        dsList.value = JSON.parse(JSON.stringify(allDsList.value));
    }
}
const refresh = () => {
    list();
};
const list = () => {
    loading.value = true;
    datasourceApi.list().then((res) => {
        allDsList.value = res;
        dsList.value = JSON.parse(JSON.stringify(allDsList.value));
        loading.value = false;
    });
};
const editDs = (item) => {
    dsForm.value.open(item);
};
const deleteDs = (item) => {
    ElMessageBox.confirm(t('ds.delete'), t('common.confirm'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
    })
        .then(() => {
        datasourceApi.delete(item.id, item.name).then(() => {
            refresh();
        });
    })
        .catch(() => { });
};
const getTables = (id, name) => {
    router.push(`/dsTable/${id}/${encodeURIComponent(name)}`);
};
onMounted(() => {
    list();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-4" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchValue),
    ...{ style: {} },
    placeholder: (__VLS_ctx.t('ds.Search Datasource')),
    ...{ class: "input-with-select" },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchValue),
    ...{ style: {} },
    placeholder: (__VLS_ctx.t('ds.Search Datasource')),
    ...{ class: "input-with-select" },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.searchHandle)
};
__VLS_3.slots.default;
{
    const { prepend: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.Search;
    /** @type {[typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
}
var __VLS_3;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    ...{ class: "border-radius_8" },
    type: "primary",
    icon: (__VLS_ctx.IconOpeAdd),
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    ...{ class: "border-radius_8" },
    type: "primary",
    icon: (__VLS_ctx.IconOpeAdd),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.editDs(undefined);
    }
};
__VLS_19.slots.default;
(__VLS_ctx.t('ds.add'));
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "connections-container" },
});
for (const [ds] of __VLS_getVForSourceType((__VLS_ctx.dsList))) {
    /** @type {[typeof DatasourceItemCard, typeof DatasourceItemCard, ]} */ ;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(DatasourceItemCard, new DatasourceItemCard({
        ds: (ds),
    }));
    const __VLS_25 = __VLS_24({
        ds: (ds),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    __VLS_26.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "connection-actions" },
    });
    const __VLS_27 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        circle: true,
        icon: (__VLS_ctx.List),
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        circle: true,
        icon: (__VLS_ctx.List),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_31;
    let __VLS_32;
    let __VLS_33;
    const __VLS_34 = {
        onClick: (...[$event]) => {
            __VLS_ctx.getTables(ds.id, ds.name);
        }
    };
    var __VLS_30;
    const __VLS_35 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "action-btn" },
        circle: true,
        icon: (__VLS_ctx.IconOpeEdit),
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "action-btn" },
        circle: true,
        icon: (__VLS_ctx.IconOpeEdit),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editDs(ds);
        }
    };
    var __VLS_38;
    const __VLS_43 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ 'onClick': {} },
        type: "danger",
        ...{ class: "action-btn" },
        circle: true,
        icon: (__VLS_ctx.IconOpeDelete),
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onClick': {} },
        type: "danger",
        ...{ class: "action-btn" },
        circle: true,
        icon: (__VLS_ctx.IconOpeDelete),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_47;
    let __VLS_48;
    let __VLS_49;
    const __VLS_50 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteDs(ds);
        }
    };
    var __VLS_46;
    var __VLS_26;
}
/** @type {[typeof DsForm, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(DsForm, new DsForm({
    ...{ 'onRefresh': {} },
    ref: "dsForm",
}));
const __VLS_52 = __VLS_51({
    ...{ 'onRefresh': {} },
    ref: "dsForm",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_54;
let __VLS_55;
let __VLS_56;
const __VLS_57 = {
    onRefresh: (__VLS_ctx.refresh)
};
/** @type {typeof __VLS_ctx.dsForm} */ ;
var __VLS_58 = {};
var __VLS_53;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['input-with-select']} */ ;
/** @type {__VLS_StyleScopedClasses['border-radius_8']} */ ;
/** @type {__VLS_StyleScopedClasses['connections-container']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
// @ts-ignore
var __VLS_59 = __VLS_58;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconOpeAdd: IconOpeAdd,
            IconOpeEdit: IconOpeEdit,
            IconOpeDelete: IconOpeDelete,
            Search: Search,
            List: List,
            DsForm: DsForm,
            DatasourceItemCard: DatasourceItemCard,
            t: t,
            searchValue: searchValue,
            dsForm: dsForm,
            dsList: dsList,
            loading: loading,
            searchHandle: searchHandle,
            refresh: refresh,
            editDs: editDs,
            deleteDs: deleteDs,
            getTables: getTables,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
