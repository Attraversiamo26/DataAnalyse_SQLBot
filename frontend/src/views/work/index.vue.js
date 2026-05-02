import { ref, computed } from 'vue';
import DatasourceCard from './DatasourceCard.vue';
const props = withDefaults(defineProps(), {
    datasourceList: () => [],
});
const datasourceName = ref('');
const datasourceListComputed = computed(() => props.datasourceList.filter((val) => val.name.toLowerCase().includes(datasourceName.value.toLowerCase())));
const dialogVisible = ref(false);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    datasourceList: () => [],
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-init_tip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hello-sqlbot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "function-sqlbot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-datasource" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "title" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.dialogVisible = true;
    }
};
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-content" },
});
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.datasourceList))) {
    /** @type {[typeof DatasourceCard, typeof DatasourceCard, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(DatasourceCard, new DatasourceCard({
        key: (ele.id),
        name: (ele.name),
        description: (ele.description),
        creator: (ele.creator),
    }));
    const __VLS_9 = __VLS_8({
        key: (ele.id),
        name: (ele.name),
        description: (ele.description),
        creator: (ele.creator),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
}
const __VLS_11 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    type: "primary",
}));
const __VLS_13 = __VLS_12({
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
var __VLS_14;
const __VLS_15 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "Select data source",
    width: "800",
    modalClass: "select-datasource_dialog",
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "Select data source",
    width: "800",
    modalClass: "select-datasource_dialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_18.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-datasource" },
});
const __VLS_19 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.datasourceName),
    clearable: true,
    ...{ style: {} },
    placeholder: "Please input",
}));
const __VLS_21 = __VLS_20({
    modelValue: (__VLS_ctx.datasourceName),
    clearable: true,
    ...{ style: {} },
    placeholder: "Please input",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-content" },
});
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.datasourceListComputed))) {
    /** @type {[typeof DatasourceCard, typeof DatasourceCard, ]} */ ;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(DatasourceCard, new DatasourceCard({
        key: (ele.id),
        name: (ele.name),
        description: (ele.description),
        creator: (ele.creator),
    }));
    const __VLS_24 = __VLS_23({
        key: (ele.id),
        name: (ele.name),
        description: (ele.description),
        creator: (ele.creator),
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
}
{
    const { footer: __VLS_thisSlot } = __VLS_18.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_26 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
        ...{ 'onClick': {} },
    }));
    const __VLS_28 = __VLS_27({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_30;
    let __VLS_31;
    let __VLS_32;
    const __VLS_33 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_29.slots.default;
    var __VLS_29;
    const __VLS_34 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_36 = __VLS_35({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    let __VLS_38;
    let __VLS_39;
    let __VLS_40;
    const __VLS_41 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_37.slots.default;
    var __VLS_37;
}
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['chat-init_tip']} */ ;
/** @type {__VLS_StyleScopedClasses['hello-sqlbot']} */ ;
/** @type {__VLS_StyleScopedClasses['function-sqlbot']} */ ;
/** @type {__VLS_StyleScopedClasses['select-datasource']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-content']} */ ;
/** @type {__VLS_StyleScopedClasses['search-datasource']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DatasourceCard: DatasourceCard,
            datasourceName: datasourceName,
            datasourceListComputed: datasourceListComputed,
            dialogVisible: dialogVisible,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
