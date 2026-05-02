import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { datasourceApi } from '@/api/datasource';
import { onMounted } from 'vue';
import { ArrowLeft, CreditCard } from '@element-plus/icons-vue';
import IconOpeEdit from '@/assets/svg/operate/ope-edit.svg';
import DsForm from './form.vue';
import { ElMessage } from 'element-plus';
const props = defineProps({
    dsId: { type: [Number], required: true },
    dsName: {
        type: [String],
        required: true,
        default: '',
    },
});
const { t } = useI18n();
// eslint-disable-next-line vue/no-dupe-keys
const dsId = ref(0);
const searchValue = ref('');
const tableList = ref([]);
const currentTable = ref({});
const currentField = ref({});
const fieldList = ref([]);
const previewData = ref({});
const activeName = ref('schema');
const tableDialog = ref(false);
const fieldDialog = ref(false);
const batchPasteDialog = ref(false);
const dsForm = ref();
const ds = ref({});
const tableComment = ref('');
const fieldComment = ref('');
const batchPasteContent = ref('');
const buildData = () => {
    return { table: currentTable.value, fields: fieldList.value };
};
const back = () => {
    history.back();
};
// const save = () => {
//   datasourceApi.edit(buildData()).then(() => {
//     ElMessage({
//       message: "Save success",
//       type: "success",
//       showClose: true,
//     });
//   });
// };
const editTable = () => {
    tableComment.value = currentTable.value.custom_comment;
    tableDialog.value = true;
};
const closeTable = () => {
    tableDialog.value = false;
};
const saveTable = () => {
    currentTable.value.custom_comment = tableComment.value;
    datasourceApi.saveTable(currentTable.value).then(() => {
        closeTable();
        ElMessage({
            message: t('common.save_success'),
            type: 'success',
            showClose: true,
        });
    });
};
const editField = (row) => {
    currentField.value = row;
    fieldComment.value = currentField.value.custom_comment;
    fieldDialog.value = true;
};
const changeStatus = (row) => {
    currentField.value = row;
    datasourceApi.saveField(currentField.value).then(() => {
        ElMessage({
            message: t('common.save_success'),
            type: 'success',
            showClose: true,
        });
    });
};
const closeField = () => {
    fieldDialog.value = false;
};
const saveField = () => {
    currentField.value.custom_comment = fieldComment.value;
    datasourceApi.saveField(currentField.value).then(() => {
        closeField();
        ElMessage({
            message: t('common.save_success'),
            type: 'success',
            showClose: true,
        });
    });
};
const openBatchPasteDialog = () => {
    batchPasteContent.value = '';
    batchPasteDialog.value = true;
};
const closeBatchPasteDialog = () => {
    batchPasteDialog.value = false;
};
const saveBatchPaste = () => {
    // 解析粘贴的内容
    const lines = batchPasteContent.value.trim().split('\n');
    const fieldComments = {};
    lines.forEach((line) => {
        const match = line.match(/^(.*?):\s*(.*)$/);
        if (match) {
            const [, comment, fieldName] = match;
            fieldComments[fieldName.trim()] = comment.trim();
        }
    });
    // 调用 API 批量更新字段注释
    datasourceApi
        .batchUpdateFieldComments({
        table_id: currentTable.value.id,
        field_comments: fieldComments,
    })
        .then((res) => {
        closeBatchPasteDialog();
        ElMessage({
            message: t('ds.batch_update_success', { count: res.updated_count }),
            type: 'success',
            showClose: true,
        });
        // 刷新字段列表
        clickTable(currentTable.value);
    })
        .catch(() => {
        ElMessage({
            message: t('ds.batch_update_failed'),
            type: 'error',
            showClose: true,
        });
    });
};
const clickTable = (table) => {
    currentTable.value = table;
    datasourceApi.fieldList(table.id).then((res) => {
        fieldList.value = res;
        datasourceApi.previewData(dsId.value, buildData()).then((res) => {
            previewData.value = res;
        });
    });
};
const handleClick = (tab) => {
    if (tab.paneName === 'preview') {
        datasourceApi.previewData(dsId.value, buildData()).then((res) => {
            previewData.value = res;
        });
    }
};
const editTables = (item) => {
    dsForm.value.open(item, true);
};
const refresh = () => {
    init();
};
const init = () => {
    dsId.value = props.dsId;
    datasourceApi.getDs(dsId.value).then((res) => {
        ds.value = res;
        fieldList.value = [];
        datasourceApi.tableList(props.dsId).then((res) => {
            tableList.value = res;
        });
    });
};
onMounted(() => {
    init();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-list_layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    text: true,
    ...{ style: {} },
    icon: (__VLS_ctx.ArrowLeft),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    text: true,
    ...{ style: {} },
    icon: (__VLS_ctx.ArrowLeft),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.back();
    }
};
var __VLS_3;
(props.dsName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "left-side" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('ds.tables'));
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    ...{ style: {} },
    text: true,
    icon: (__VLS_ctx.CreditCard),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    ...{ style: {} },
    text: true,
    icon: (__VLS_ctx.CreditCard),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.editTables(__VLS_ctx.ds);
    }
};
var __VLS_11;
const __VLS_16 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.searchValue),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.t('ds.Search Datasource')),
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.searchValue),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.t('ds.Search Datasource')),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
for (const [item, _index] of __VLS_getVForSourceType((__VLS_ctx.tableList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.clickTable(item);
            } },
        key: (_index),
        ...{ class: "list-item_primary" },
    });
    (item.table_name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "right-side" },
});
if (__VLS_ctx.fieldList.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.t('ds.no_data_tip'));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentTable.table_name);
    const __VLS_20 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        direction: "vertical",
    }));
    const __VLS_22 = __VLS_21({
        direction: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('ds.comment'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentTable.custom_comment);
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        ...{ style: {} },
        text: true,
        ...{ class: "action-btn" },
        icon: (__VLS_ctx.IconOpeEdit),
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        ...{ style: {} },
        text: true,
        ...{ class: "action-btn" },
        icon: (__VLS_ctx.IconOpeEdit),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.editTable)
    };
    var __VLS_27;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.openBatchPasteDialog)
    };
    __VLS_35.slots.default;
    (__VLS_ctx.t('ds.batch_paste_comment'));
    var __VLS_35;
    const __VLS_40 = {}.ElTabs;
    /** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onTabClick': {} },
        modelValue: (__VLS_ctx.activeName),
        ...{ class: "demo-tabs" },
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onTabClick': {} },
        modelValue: (__VLS_ctx.activeName),
        ...{ class: "demo-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onTabClick: (__VLS_ctx.handleClick)
    };
    __VLS_43.slots.default;
    const __VLS_48 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        label: (__VLS_ctx.t('ds.table_schema')),
        name: "schema",
    }));
    const __VLS_50 = __VLS_49({
        label: (__VLS_ctx.t('ds.table_schema')),
        name: "schema",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }));
    const __VLS_54 = __VLS_53({
        data: (__VLS_ctx.fieldList),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    const __VLS_56 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        prop: "field_name",
        label: (__VLS_ctx.t('ds.field.name')),
        width: "180",
    }));
    const __VLS_58 = __VLS_57({
        prop: "field_name",
        label: (__VLS_ctx.t('ds.field.name')),
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const __VLS_60 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        prop: "field_type",
        label: (__VLS_ctx.t('ds.field.type')),
        width: "180",
    }));
    const __VLS_62 = __VLS_61({
        prop: "field_type",
        label: (__VLS_ctx.t('ds.field.type')),
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    const __VLS_64 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        prop: "field_comment",
        label: (__VLS_ctx.t('ds.field.comment')),
    }));
    const __VLS_66 = __VLS_65({
        prop: "field_comment",
        label: (__VLS_ctx.t('ds.field.comment')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const __VLS_68 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        label: (__VLS_ctx.t('ds.field.custom_comment')),
    }));
    const __VLS_70 = __VLS_69({
        label: (__VLS_ctx.t('ds.field.custom_comment')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_71.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-comment" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (scope.row.custom_comment);
        const __VLS_72 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            ...{ 'onClick': {} },
            text: true,
            ...{ class: "action-btn" },
            icon: (__VLS_ctx.IconOpeEdit),
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onClick': {} },
            text: true,
            ...{ class: "action-btn" },
            icon: (__VLS_ctx.IconOpeEdit),
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_76;
        let __VLS_77;
        let __VLS_78;
        const __VLS_79 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.fieldList.length === 0))
                    return;
                __VLS_ctx.editField(scope.row);
            }
        };
        var __VLS_75;
    }
    var __VLS_71;
    const __VLS_80 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        label: (__VLS_ctx.t('ds.field.status')),
        width: "180",
    }));
    const __VLS_82 = __VLS_81({
        label: (__VLS_ctx.t('ds.field.status')),
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_83.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_84 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            ...{ 'onChange': {} },
            modelValue: (scope.row.checked),
            size: "small",
        }));
        const __VLS_86 = __VLS_85({
            ...{ 'onChange': {} },
            modelValue: (scope.row.checked),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        let __VLS_88;
        let __VLS_89;
        let __VLS_90;
        const __VLS_91 = {
            onChange: (...[$event]) => {
                if (!!(__VLS_ctx.fieldList.length === 0))
                    return;
                __VLS_ctx.changeStatus(scope.row);
            }
        };
        var __VLS_87;
    }
    var __VLS_83;
    var __VLS_55;
    var __VLS_51;
    const __VLS_92 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        label: (__VLS_ctx.t('ds.preview')),
        name: "preview",
    }));
    const __VLS_94 = __VLS_93({
        label: (__VLS_ctx.t('ds.preview')),
        name: "preview",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    (__VLS_ctx.t('ds.preview_tip'));
    const __VLS_96 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        data: (__VLS_ctx.previewData.data),
        ...{ style: {} },
    }));
    const __VLS_98 = __VLS_97({
        data: (__VLS_ctx.previewData.data),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    for (const [c, index] of __VLS_getVForSourceType((__VLS_ctx.previewData.fields))) {
        const __VLS_100 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            key: (index),
            prop: (c),
            label: (c),
        }));
        const __VLS_102 = __VLS_101({
            key: (index),
            prop: (c),
            label: (c),
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    }
    var __VLS_99;
    var __VLS_95;
    var __VLS_43;
}
const __VLS_104 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.tableDialog),
    title: (__VLS_ctx.t('ds.edit.table_comment')),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
}));
const __VLS_106 = __VLS_105({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.tableDialog),
    title: (__VLS_ctx.t('ds.edit.table_comment')),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onClosed: (__VLS_ctx.closeTable)
};
__VLS_107.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
(__VLS_ctx.t('ds.edit.table_comment_label'));
const __VLS_112 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.tableComment),
    clearable: true,
    rows: (3),
    type: "textarea",
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.tableComment),
    clearable: true,
    rows: (3),
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_116 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_118 = __VLS_117({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
let __VLS_120;
let __VLS_121;
let __VLS_122;
const __VLS_123 = {
    onClick: (__VLS_ctx.closeTable)
};
__VLS_119.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_119;
const __VLS_124 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_126 = __VLS_125({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onClick: (__VLS_ctx.saveTable)
};
__VLS_127.slots.default;
(__VLS_ctx.t('common.confirm'));
var __VLS_127;
var __VLS_107;
const __VLS_132 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.fieldDialog),
    title: (__VLS_ctx.t('ds.edit.field_comment')),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
}));
const __VLS_134 = __VLS_133({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.fieldDialog),
    title: (__VLS_ctx.t('ds.edit.field_comment')),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
let __VLS_136;
let __VLS_137;
let __VLS_138;
const __VLS_139 = {
    onClosed: (__VLS_ctx.closeField)
};
__VLS_135.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
(__VLS_ctx.t('ds.edit.field_comment_label'));
const __VLS_140 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.fieldComment),
    clearable: true,
    rows: (3),
    type: "textarea",
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.fieldComment),
    clearable: true,
    rows: (3),
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_144 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_146 = __VLS_145({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_148;
let __VLS_149;
let __VLS_150;
const __VLS_151 = {
    onClick: (__VLS_ctx.closeField)
};
__VLS_147.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_147;
const __VLS_152 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_154 = __VLS_153({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
let __VLS_156;
let __VLS_157;
let __VLS_158;
const __VLS_159 = {
    onClick: (__VLS_ctx.saveField)
};
__VLS_155.slots.default;
(__VLS_ctx.t('common.confirm'));
var __VLS_155;
var __VLS_135;
const __VLS_160 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    modelValue: (__VLS_ctx.batchPasteDialog),
    title: (__VLS_ctx.t('ds.batch_paste_comment')),
    width: "800",
    destroyOnClose: (true),
    closeOnClickModal: (false),
}));
const __VLS_162 = __VLS_161({
    modelValue: (__VLS_ctx.batchPasteDialog),
    title: (__VLS_ctx.t('ds.batch_paste_comment')),
    width: "800",
    destroyOnClose: (true),
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
(__VLS_ctx.t('ds.batch_paste_comment_tip'));
const __VLS_164 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.batchPasteContent),
    clearable: true,
    rows: (10),
    type: "textarea",
    placeholder: "{{ t('ds.batch_paste_comment_placeholder') }}",
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.batchPasteContent),
    clearable: true,
    rows: (10),
    type: "textarea",
    placeholder: "{{ t('ds.batch_paste_comment_placeholder') }}",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_168 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_170 = __VLS_169({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
let __VLS_172;
let __VLS_173;
let __VLS_174;
const __VLS_175 = {
    onClick: (__VLS_ctx.closeBatchPasteDialog)
};
__VLS_171.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_171;
const __VLS_176 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_178 = __VLS_177({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
let __VLS_180;
let __VLS_181;
let __VLS_182;
const __VLS_183 = {
    onClick: (__VLS_ctx.saveBatchPaste)
};
__VLS_179.slots.default;
(__VLS_ctx.t('common.confirm'));
var __VLS_179;
var __VLS_163;
/** @type {[typeof DsForm, ]} */ ;
// @ts-ignore
const __VLS_184 = __VLS_asFunctionalComponent(DsForm, new DsForm({
    ...{ 'onRefresh': {} },
    ref: "dsForm",
}));
const __VLS_185 = __VLS_184({
    ...{ 'onRefresh': {} },
    ref: "dsForm",
}, ...__VLS_functionalComponentArgsRest(__VLS_184));
let __VLS_187;
let __VLS_188;
let __VLS_189;
const __VLS_190 = {
    onRefresh: (__VLS_ctx.refresh)
};
/** @type {typeof __VLS_ctx.dsForm} */ ;
var __VLS_191 = {};
var __VLS_186;
/** @type {__VLS_StyleScopedClasses['table-list_layout']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['left-side']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item_primary']} */ ;
/** @type {__VLS_StyleScopedClasses['right-side']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
// @ts-ignore
var __VLS_192 = __VLS_191;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowLeft: ArrowLeft,
            CreditCard: CreditCard,
            IconOpeEdit: IconOpeEdit,
            DsForm: DsForm,
            t: t,
            searchValue: searchValue,
            tableList: tableList,
            currentTable: currentTable,
            fieldList: fieldList,
            previewData: previewData,
            activeName: activeName,
            tableDialog: tableDialog,
            fieldDialog: fieldDialog,
            batchPasteDialog: batchPasteDialog,
            dsForm: dsForm,
            ds: ds,
            tableComment: tableComment,
            fieldComment: fieldComment,
            batchPasteContent: batchPasteContent,
            back: back,
            editTable: editTable,
            closeTable: closeTable,
            saveTable: saveTable,
            editField: editField,
            changeStatus: changeStatus,
            closeField: closeField,
            saveField: saveField,
            openBatchPasteDialog: openBatchPasteDialog,
            closeBatchPasteDialog: closeBatchPasteDialog,
            saveBatchPaste: saveBatchPaste,
            clickTable: clickTable,
            handleClick: handleClick,
            editTables: editTables,
            refresh: refresh,
        };
    },
    props: {
        dsId: { type: [Number], required: true },
        dsName: {
            type: [String],
            required: true,
            default: '',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        dsId: { type: [Number], required: true },
        dsName: {
            type: [String],
            required: true,
            default: '',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
