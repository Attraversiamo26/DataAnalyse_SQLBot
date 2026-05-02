import { nextTick, ref } from 'vue';
import DatasourceForm from './DatasourceForm.vue';
import icon_close_outlined from '@/assets/svg/operate/ope-close.svg';
const datasourceFormRef = ref();
const datasourceConfigVisible = ref(false);
const beforeClose = () => {
    datasourceConfigVisible.value = false;
};
const emit = defineEmits(['refresh']);
const refresh = () => {
    emit('refresh');
};
const changeActiveStep = (val) => {
    if (val === 0) {
        datasourceConfigVisible.value = false;
    }
};
const save = () => {
    datasourceFormRef.value.tableListSave();
};
const open = (item) => {
    datasourceConfigVisible.value = true;
    nextTick(() => {
        datasourceFormRef.value.initForm(item, true);
    });
};
const __VLS_exposed = {
    open,
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
    size: "calc(100% - 100px)",
    modalClass: "datasource-drawer-fullscreen",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.datasourceConfigVisible),
    closeOnClickModal: (false),
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
    (__VLS_ctx.$t('ds.form.choose_tables'));
    const __VLS_5 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_9;
    let __VLS_10;
    let __VLS_11;
    const __VLS_12 = {
        onClick: (close)
    };
    __VLS_8.slots.default;
    const __VLS_13 = {}.icon_close_outlined;
    /** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
    const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
    var __VLS_8;
}
/** @type {[typeof DatasourceForm, typeof DatasourceForm, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(DatasourceForm, new DatasourceForm({
    ...{ 'onChangeActiveStep': {} },
    ...{ 'onRefresh': {} },
    ref: "datasourceFormRef",
    activeStep: (2),
    activeName: "",
    activeType: "",
    isDataTable: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onChangeActiveStep': {} },
    ...{ 'onRefresh': {} },
    ref: "datasourceFormRef",
    activeStep: (2),
    activeName: "",
    activeType: "",
    isDataTable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onChangeActiveStep: (__VLS_ctx.changeActiveStep)
};
const __VLS_24 = {
    onRefresh: (__VLS_ctx.refresh)
};
/** @type {typeof __VLS_ctx.datasourceFormRef} */ ;
var __VLS_25 = {};
var __VLS_19;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_27 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_31;
    let __VLS_32;
    let __VLS_33;
    const __VLS_34 = {
        onClick: (__VLS_ctx.beforeClose)
    };
    __VLS_30.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_30;
    const __VLS_35 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onClick: (__VLS_ctx.save)
    };
    __VLS_38.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_38;
}
var __VLS_3;
// @ts-ignore
var __VLS_26 = __VLS_25;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DatasourceForm: DatasourceForm,
            icon_close_outlined: icon_close_outlined,
            datasourceFormRef: datasourceFormRef,
            datasourceConfigVisible: datasourceConfigVisible,
            beforeClose: beforeClose,
            refresh: refresh,
            changeActiveStep: changeActiveStep,
            save: save,
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
