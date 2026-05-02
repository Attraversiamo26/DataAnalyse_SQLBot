import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import icon_close_outlined from '@/assets/svg/operate/ope-close.svg';
import DatasourceList from './DatasourceList.vue';
import DatasourceListSide from './DatasourceListSide.vue';
import DatasourceForm from './DatasourceForm.vue';
const { t } = useI18n();
const datasourceConfigVisible = ref(false);
const activeStep = ref(0);
const currentType = ref('');
const editDatasource = ref(false);
const activeName = ref('');
const activeType = ref('');
const datasourceFormRef = ref();
const beforeClose = () => {
    datasourceConfigVisible.value = false;
    activeStep.value = 0;
};
const clickDatasource = (ele) => {
    activeStep.value = 1;
    activeName.value = ele.name;
    activeType.value = ele.type;
};
const clickDatasourceSide = (ele) => {
    activeName.value = ele.name;
    activeType.value = ele.type;
};
const emits = defineEmits(['search']);
const refresh = () => {
    activeName.value = '';
    activeStep.value = 0;
    activeType.value = '';
    datasourceConfigVisible.value = false;
    emits('search');
};
const handleEditDatasource = (res) => {
    activeStep.value = 1;
    datasourceConfigVisible.value = true;
    editDatasource.value = true;
    currentType.value = res.type_name;
    nextTick(() => {
        datasourceFormRef.value.initForm(res);
    });
};
const handleAddDatasource = () => {
    editDatasource.value = false;
    datasourceConfigVisible.value = true;
};
const changeActiveStep = (val) => {
    activeStep.value = val > 2 ? 2 : val;
};
const __VLS_exposed = {
    handleEditDatasource,
    handleAddDatasource,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.datasourceConfigVisible),
    closeOnClickModal: (false),
    destroyOnClose: true,
    size: "calc(100% - 100px)",
    modalClass: "datasource-drawer-fullscreen",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.datasourceConfigVisible),
    closeOnClickModal: (false),
    destroyOnClose: true,
    size: "calc(100% - 100px)",
    modalClass: "datasource-drawer-fullscreen",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    const [{ close }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.editDatasource
        ? __VLS_ctx.t('datasource.mysql_data_source', { msg: __VLS_ctx.currentType })
        : __VLS_ctx.$t('datasource.new_data_source'));
    if (!__VLS_ctx.editDatasource) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flex-center" },
            ...{ style: {} },
        });
        const __VLS_5 = {}.ElSteps;
        /** @type {[typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, ]} */ ;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
            custom: true,
            ...{ style: {} },
            active: (__VLS_ctx.activeStep),
            alignCenter: true,
        }));
        const __VLS_7 = __VLS_6({
            custom: true,
            ...{ style: {} },
            active: (__VLS_ctx.activeStep),
            alignCenter: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        __VLS_8.slots.default;
        const __VLS_9 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
        const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
        __VLS_12.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_12.slots;
            (__VLS_ctx.$t('qa.select_datasource'));
        }
        var __VLS_12;
        const __VLS_13 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
        const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
        __VLS_16.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_16.slots;
            (__VLS_ctx.$t('datasource.configuration_information'));
        }
        var __VLS_16;
        const __VLS_17 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
        const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
        __VLS_20.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_20.slots;
            (__VLS_ctx.$t('ds.form.choose_tables'));
        }
        var __VLS_20;
        var __VLS_8;
    }
    const __VLS_21 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        ...{ 'onClick': {} },
        ...{ class: "ed-dialog__headerbtn mrt" },
        ...{ style: {} },
    }));
    const __VLS_23 = __VLS_22({
        ...{ 'onClick': {} },
        ...{ class: "ed-dialog__headerbtn mrt" },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    let __VLS_25;
    let __VLS_26;
    let __VLS_27;
    const __VLS_28 = {
        onClick: (close)
    };
    __VLS_24.slots.default;
    const __VLS_29 = {}.icon_close_outlined;
    /** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({}));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    var __VLS_24;
}
if (__VLS_ctx.activeStep === 0) {
    /** @type {[typeof DatasourceList, typeof DatasourceList, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(DatasourceList, new DatasourceList({
        ...{ 'onClickDatasource': {} },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClickDatasource': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClickDatasource: (__VLS_ctx.clickDatasource)
    };
    var __VLS_35;
}
if (__VLS_ctx.activeStep === 1 && !__VLS_ctx.editDatasource) {
    /** @type {[typeof DatasourceListSide, typeof DatasourceListSide, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(DatasourceListSide, new DatasourceListSide({
        ...{ 'onClickDatasource': {} },
        activeName: (__VLS_ctx.activeName),
    }));
    const __VLS_41 = __VLS_40({
        ...{ 'onClickDatasource': {} },
        activeName: (__VLS_ctx.activeName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    let __VLS_43;
    let __VLS_44;
    let __VLS_45;
    const __VLS_46 = {
        onClickDatasource: (__VLS_ctx.clickDatasourceSide)
    };
    var __VLS_42;
}
if ([1, 2].includes(__VLS_ctx.activeStep)) {
    /** @type {[typeof DatasourceForm, typeof DatasourceForm, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(DatasourceForm, new DatasourceForm({
        ...{ 'onRefresh': {} },
        ...{ 'onClose': {} },
        ...{ 'onChangeActiveStep': {} },
        ref: "datasourceFormRef",
        isDataTable: (false),
        activeStep: (__VLS_ctx.activeStep),
        activeName: (__VLS_ctx.activeName),
        activeType: (__VLS_ctx.activeType),
    }));
    const __VLS_48 = __VLS_47({
        ...{ 'onRefresh': {} },
        ...{ 'onClose': {} },
        ...{ 'onChangeActiveStep': {} },
        ref: "datasourceFormRef",
        isDataTable: (false),
        activeStep: (__VLS_ctx.activeStep),
        activeName: (__VLS_ctx.activeName),
        activeType: (__VLS_ctx.activeType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    let __VLS_50;
    let __VLS_51;
    let __VLS_52;
    const __VLS_53 = {
        onRefresh: (__VLS_ctx.refresh)
    };
    const __VLS_54 = {
        onClose: (__VLS_ctx.beforeClose)
    };
    const __VLS_55 = {
        onChangeActiveStep: (__VLS_ctx.changeActiveStep)
    };
    /** @type {typeof __VLS_ctx.datasourceFormRef} */ ;
    var __VLS_56 = {};
    var __VLS_49;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['flex-center']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-dialog__headerbtn']} */ ;
/** @type {__VLS_StyleScopedClasses['mrt']} */ ;
// @ts-ignore
var __VLS_57 = __VLS_56;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_close_outlined: icon_close_outlined,
            DatasourceList: DatasourceList,
            DatasourceListSide: DatasourceListSide,
            DatasourceForm: DatasourceForm,
            t: t,
            datasourceConfigVisible: datasourceConfigVisible,
            activeStep: activeStep,
            currentType: currentType,
            editDatasource: editDatasource,
            activeName: activeName,
            activeType: activeType,
            datasourceFormRef: datasourceFormRef,
            beforeClose: beforeClose,
            clickDatasource: clickDatasource,
            clickDatasourceSide: clickDatasourceSide,
            refresh: refresh,
            changeActiveStep: changeActiveStep,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
