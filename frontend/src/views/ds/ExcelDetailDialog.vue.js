import { ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import SheetTabs from './SheetTabs.vue';
import field_text from '@/assets/svg/field_text.svg';
import field_time from '@/assets/svg/field_time.svg';
import field_value from '@/assets/svg/field_value.svg';
import { datasourceApi } from '@/api/datasource';
const { t } = useI18n();
const emits = defineEmits(['finish']);
const tabList = shallowRef([]);
const fieldList = shallowRef([]);
const iconMap = {
    string: field_text,
    int: field_value,
    float: field_value,
    datetime: field_time,
};
const dialogShow = ref(false);
const loading = ref(false);
const previewData = ref({});
const variables = [
    {
        name: t('model.text'),
        var_type: 'string',
    },
    {
        name: t('model.int'),
        var_type: 'int',
    },
    {
        name: t('model.float'),
        var_type: 'float',
    },
    {
        name: t('dashboard.time'),
        var_type: 'datetime',
    },
];
let arr = [];
let filePath = '';
const init = (response) => {
    arr = response.data || [];
    filePath = response.filePath;
    previewData.value = response.data[0];
    activeTab.value = previewData.value.sheetName;
    fieldList.value = previewData.value.fields;
    tabList.value = response.data.map((item) => {
        return {
            label: item.sheetName,
            value: item.sheetName,
        };
    });
    dialogShow.value = true;
};
const closeDialog = () => {
    arr = [];
    previewData.value = {
        sheetName: '',
        fields: [],
        data: [],
        rows: 0,
    };
    tabList.value = [];
    fieldList.value = [];
    activeTab.value = '';
    btnSelect.value = 'd';
    dialogShow.value = false;
};
const save = () => {
    loading.value = true;
    datasourceApi
        .importToDb({
        sheets: arr.map((item) => {
            return { fields: item.fields, sheetName: item.sheetName };
        }),
        filePath,
    })
        .then((res) => {
        closeDialog();
        emits('finish', res);
    })
        .finally(() => {
        loading.value = false;
    });
};
const btnSelect = ref('d');
const btnSelectClick = (val) => {
    btnSelect.value = val;
};
const activeTab = ref('');
const handleTabClick = (tab) => {
    btnSelectClick('d');
    activeTab.value = tab.value;
    arr.forEach((item) => {
        if (item.sheetName === activeTab.value) {
            previewData.value = item;
        }
    });
    fieldList.value = previewData.value.fields;
};
const renderHeader = ({ column }) => {
    //创建一个元素用于存放表头信息
    const span = document.createElement('span');
    // 将表头信息渲染到元素上
    span.innerText = column.label;
    // 在界面中添加该元素
    document.body.appendChild(span);
    //获取该元素的宽度（包含内外边距等信息）
    const spanWidth = span.getBoundingClientRect().width + 20; //渲染后的 div 内左右 padding 都是 10，所以 +20
    //判断是否小于element的最小宽度，两者取最大值
    column.minWidth = column.minWidth > spanWidth ? column.minWidth : spanWidth;
    // 计算完成后，删除该元素
    document.body.removeChild(span);
    return column.label;
};
const __VLS_exposed = {
    init,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBeforeClosed': {} },
    modelValue: (__VLS_ctx.dialogShow),
    title: (__VLS_ctx.$t('ds.preview')),
    width: "1200",
    modalClass: "excel-detail-dialog",
    destroyOnClose: true,
    closeOnClickModal: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBeforeClosed': {} },
    modelValue: (__VLS_ctx.dialogShow),
    title: (__VLS_ctx.$t('ds.preview')),
    width: "1200",
    modalClass: "excel-detail-dialog",
    destroyOnClose: true,
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBeforeClosed: (__VLS_ctx.closeDialog)
};
var __VLS_8 = {};
__VLS_3.slots.default;
/** @type {[typeof SheetTabs, typeof SheetTabs, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(SheetTabs, new SheetTabs({
    ...{ 'onTabClick': {} },
    activeTab: (__VLS_ctx.activeTab),
    tabList: (__VLS_ctx.tabList),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onTabClick': {} },
    activeTab: (__VLS_ctx.activeTab),
    tabList: (__VLS_ctx.tabList),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onTabClick: (__VLS_ctx.handleTabClick)
};
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "btn-select" },
    ...{ style: {} },
});
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.btnSelect === 'd' && 'is-active']) },
    text: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.btnSelect === 'd' && 'is-active']) },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.btnSelectClick('d');
    }
};
__VLS_19.slots.default;
(__VLS_ctx.t('ds.preview'));
var __VLS_19;
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.btnSelect === 'q' && 'is-active']) },
    text: true,
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    ...{ class: ([__VLS_ctx.btnSelect === 'q' && 'is-active']) },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (...[$event]) => {
        __VLS_ctx.btnSelectClick('q');
    }
};
__VLS_27.slots.default;
(__VLS_ctx.t('sync.field_details'));
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-num" },
});
(__VLS_ctx.t('sync.records', { num: __VLS_ctx.previewData.data.length, total: __VLS_ctx.previewData.rows }));
if (__VLS_ctx.btnSelect === 'q') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "field-details" },
    });
    const __VLS_32 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        rowClassName: "hover-icon_edit",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }));
    const __VLS_34 = __VLS_33({
        rowClassName: "hover-icon_edit",
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        prop: "fieldName",
        label: (__VLS_ctx.t('datasource.field_name')),
    }));
    const __VLS_38 = __VLS_37({
        prop: "fieldName",
        label: (__VLS_ctx.t('datasource.field_name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    const __VLS_40 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        prop: "fieldType",
        label: (__VLS_ctx.t('datasource.field_type')),
        width: "240",
    }));
    const __VLS_42 = __VLS_41({
        prop: "fieldType",
        label: (__VLS_ctx.t('datasource.field_type')),
        width: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_43.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_44 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            ...{ class: (`${scope.row.fieldType}-variables`) },
            size: "16",
            ...{ style: {} },
        }));
        const __VLS_46 = __VLS_45({
            ...{ class: (`${scope.row.fieldType}-variables`) },
            size: "16",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        const __VLS_48 = ((__VLS_ctx.iconMap[scope.row.fieldType]));
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
        const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
        var __VLS_47;
        const __VLS_52 = {}.ElSelect;
        /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            modelValue: (scope.row.fieldType),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('datasource.Please_select')),
        }));
        const __VLS_54 = __VLS_53({
            modelValue: (scope.row.fieldType),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('datasource.Please_select')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.variables))) {
            const __VLS_56 = {}.ElOption;
            /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                key: (ele.var_type),
                label: (ele.name),
                value: (ele.var_type),
            }));
            const __VLS_58 = __VLS_57({
                key: (ele.var_type),
                label: (ele.name),
                value: (ele.var_type),
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            __VLS_59.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            const __VLS_60 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                ...{ class: (`${ele.var_type}-variables`) },
                size: "16",
                ...{ style: {} },
            }));
            const __VLS_62 = __VLS_61({
                ...{ class: (`${ele.var_type}-variables`) },
                size: "16",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            __VLS_63.slots.default;
            const __VLS_64 = ((__VLS_ctx.iconMap[ele.var_type]));
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
            const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
            var __VLS_63;
            (ele.name);
            var __VLS_59;
        }
        var __VLS_55;
    }
    var __VLS_43;
    var __VLS_35;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-container" },
    });
    const __VLS_68 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        data: (__VLS_ctx.previewData.data),
        ...{ style: {} },
    }));
    const __VLS_70 = __VLS_69({
        data: (__VLS_ctx.previewData.data),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    for (const [c, index] of __VLS_getVForSourceType((__VLS_ctx.previewData.fields))) {
        const __VLS_72 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            key: (index),
            prop: (c.fieldName),
            label: (c.fieldName),
            minWidth: "150",
            renderHeader: (__VLS_ctx.renderHeader),
        }));
        const __VLS_74 = __VLS_73({
            key: (index),
            prop: (c.fieldName),
            label: (c.fieldName),
            minWidth: "150",
            renderHeader: (__VLS_ctx.renderHeader),
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    }
    var __VLS_71;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_76 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_78 = __VLS_77({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onClick: (__VLS_ctx.closeDialog)
};
__VLS_79.slots.default;
(__VLS_ctx.$t('common.cancel'));
var __VLS_79;
const __VLS_84 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_86 = __VLS_85({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onClick: (__VLS_ctx.save)
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_87.slots.default;
(__VLS_ctx.$t('sync.confirm_upload'));
var __VLS_87;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-select']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-num']} */ ;
/** @type {__VLS_StyleScopedClasses['field-details']} */ ;
/** @type {__VLS_StyleScopedClasses['preview']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SheetTabs: SheetTabs,
            t: t,
            tabList: tabList,
            fieldList: fieldList,
            iconMap: iconMap,
            dialogShow: dialogShow,
            loading: loading,
            previewData: previewData,
            variables: variables,
            closeDialog: closeDialog,
            save: save,
            btnSelect: btnSelect,
            btnSelectClick: btnSelectClick,
            activeTab: activeTab,
            handleTabClick: handleTabClick,
            renderHeader: renderHeader,
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
