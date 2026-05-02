import { ref, computed, onMounted, reactive } from 'vue';
import { datasourceApi } from '@/api/datasource';
import icon_right_outlined from '@/assets/svg/icon_right_outlined.svg';
import icon_form_outlined from '@/assets/svg/icon_form_outlined.svg';
import icon_import_outlined from '@/assets/svg/icon_import_outlined.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import edit from '@/assets/svg/icon_edit_outlined.svg';
import { useI18n } from 'vue-i18n';
import ParamsForm from './ParamsForm.vue';
import UploaderRemark from '@/views/system/excel-upload/UploaderRemark.vue';
import TableRelationship from '@/views/ds/TableRelationship.vue';
import icon_mindnote_outlined from '@/assets/svg/icon_mindnote_outlined.svg';
import { Refresh } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es';
const props = withDefaults(defineProps(), {
    info: () => ({
        name: '-',
        host: '-',
        port: '-',
        username: '-',
        password: '-',
        database: '-',
        extraJdbc: '-',
        dbSchema: '-',
        filename: '-',
        sheets: '-',
        mode: '-',
        timeout: '-',
        configuration: '-',
        id: 0,
    }),
});
const { t } = useI18n();
const paramsFormRef = ref();
const tableList = ref([]);
const loading = ref(false);
const initLoading = ref(false);
const activeRelationship = ref(false);
const keywords = ref('');
const tableListWithSearch = computed(() => {
    if (!keywords.value)
        return tableList.value;
    return tableList.value.filter((ele) => ele.table_name.toLowerCase().includes(keywords.value.toLowerCase()));
});
const total = ref(1000);
const showNum = ref(100);
const currentTable = ref({});
const ds = ref({});
const btnSelect = ref('d');
const isDrag = ref(false);
const tableName = ref([]);
const pageInfo = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
});
const handleRelationship = () => {
    activeRelationship.value = !activeRelationship.value;
    tableName.value = [];
    currentTable.value = {};
};
const singleDragStartD = (e, ele) => {
    isDrag.value = true;
    e.dataTransfer.setData('table', JSON.stringify(ele));
};
const getTableName = (val) => {
    tableName.value = val;
};
const singleDragEnd = () => {
    isDrag.value = false;
};
const handleSizeChange = (val) => {
    pageInfo.currentPage = 1;
    pageInfo.pageSize = val;
};
const handleCurrentChange = (val) => {
    pageInfo.currentPage = val;
};
const fieldListComputed = computed(() => {
    const { currentPage, pageSize } = pageInfo;
    return fieldListTotalComputed.value.slice((currentPage - 1) * pageSize, currentPage * pageSize);
});
const fieldListTotalComputed = computed(() => {
    return fieldList.value.filter((ele) => ele.field_name.toLowerCase().includes(fieldName.value.toLowerCase()));
});
const init = (reset = false) => {
    initLoading.value = true;
    datasourceApi.getDs(props.info.id).then((res) => {
        ds.value = res;
        fieldList.value = [];
        pageInfo.total = 0;
        pageInfo.currentPage = 1;
        datasourceApi
            .tableList(props.info.id)
            .then((res) => {
            tableList.value = res;
            if (currentTable.value?.id && reset) {
                tableList.value.forEach((ele) => {
                    if (ele.id === currentTable.value?.id) {
                        clickTable(ele);
                    }
                });
            }
        })
            .finally(() => {
            initLoading.value = false;
        });
    });
};
onMounted(() => {
    init();
});
const tableComment = ref('');
const fieldDialog = ref(false);
const tableDialog = ref(false);
const fieldComment = ref('');
const currentField = ref({});
const previewData = ref({});
const fieldList = ref([]);
const buildData = () => {
    return { table: currentTable.value, fields: fieldList.value };
};
const handleSelectTableList = () => {
    paramsFormRef.value.open(props.info);
};
const clickTable = (table) => {
    if (activeRelationship.value)
        return;
    loading.value = true;
    currentTable.value = table;
    fieldList.value = [];
    pageInfo.total = 0;
    previewData.value = [];
    datasourceApi
        .fieldList(table.id)
        .then((res) => {
        fieldList.value = res;
        pageInfo.total = res.length;
        pageInfo.currentPage = 1;
        fieldName.value = '';
        datasourceApi.previewData(props.info.id, buildData()).then((res) => {
            previewData.value = res;
        });
    })
        .finally(() => {
        loading.value = false;
    });
};
const closeTable = () => {
    tableDialog.value = false;
};
const editTable = () => {
    tableComment.value = currentTable.value.custom_comment;
    tableDialog.value = true;
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
const closeField = () => {
    fieldDialog.value = false;
};
const refresh = () => {
    emits('refresh');
    datasourceApi.tableList(props.info.id).then((res) => {
        tableList.value = res;
        if (!currentTable.value.table_name)
            return;
        const nameArr = tableList.value.map((ele) => ele.table_name);
        if (!nameArr.includes(currentTable.value.table_name)) {
            currentTable.value = {};
        }
    });
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
const editField = (row) => {
    currentField.value = row;
    fieldComment.value = currentField.value.custom_comment;
    fieldDialog.value = true;
};
const changeStatus = (row) => {
    currentField.value = row;
    datasourceApi.saveField(currentField.value).then(() => {
        closeField();
        ElMessage({
            message: t('common.save_success'),
            type: 'success',
            showClose: true,
        });
    });
};
const syncFields = () => {
    loading.value = true;
    datasourceApi
        .syncFields(currentTable.value.id)
        .then(() => {
        btnSelectClick('d');
        loading.value = false;
    })
        .catch(() => {
        loading.value = false;
    });
};
function downloadTemplate() {
    datasourceApi
        .exportDsSchema(props.info.id)
        .then((res) => {
        const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = props.info.name + '.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
        .catch(async (error) => {
        if (error.response) {
            try {
                let text = await error.response.data.text();
                try {
                    text = JSON.parse(text);
                }
                finally {
                    ElMessage({
                        message: text,
                        type: 'error',
                        showClose: true,
                    });
                }
            }
            catch (e) {
                console.error('Error processing error response:', e);
            }
        }
        else {
            console.error('Other error:', error);
            ElMessage({
                message: error,
                type: 'error',
                showClose: true,
            });
        }
    });
}
const emits = defineEmits(['back', 'refresh']);
const back = () => {
    emits('back');
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
const fieldNameSearch = debounce(() => {
    pageInfo.currentPage = 1;
    pageInfo.total = fieldListTotalComputed.value.length;
}, 100);
const fieldName = ref('');
const btnSelectClick = (val) => {
    btnSelect.value = val;
    loading.value = true;
    if (val === 'd') {
        datasourceApi
            .fieldList(currentTable.value.id, { fieldName: '' })
            .then((res) => {
            fieldList.value = res;
            pageInfo.total = res.length;
            pageInfo.currentPage = 1;
            fieldName.value = '';
        })
            .finally(() => {
            loading.value = false;
        });
    }
    else {
        datasourceApi
            .previewData(props.info.id, buildData())
            .then((res) => {
            previewData.value = res;
        })
            .finally(() => {
            loading.value = false;
        });
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    info: () => ({
        name: '-',
        host: '-',
        port: '-',
        username: '-',
        password: '-',
        database: '-',
        extraJdbc: '-',
        dbSchema: '-',
        filename: '-',
        sheets: '-',
        mode: '-',
        timeout: '-',
        configuration: '-',
        id: 0,
    }),
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-text']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-table no-padding" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info" },
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
    onClick: (__VLS_ctx.back)
};
__VLS_3.slots.default;
(__VLS_ctx.$t('ds.title'));
var __VLS_3;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    size: "12",
}));
const __VLS_10 = __VLS_9({
    size: "12",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.icon_right_outlined;
/** @type {[typeof __VLS_components.Icon_right_outlined, typeof __VLS_components.icon_right_outlined, typeof __VLS_components.Icon_right_outlined, typeof __VLS_components.icon_right_outlined, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "name" },
});
(__VLS_ctx.info.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "export-remark" },
});
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    ...{ style: {} },
    secondary: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    ...{ style: {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.downloadTemplate)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.icon_import_outlined;
    /** @type {[typeof __VLS_components.Icon_import_outlined, typeof __VLS_components.icon_import_outlined, typeof __VLS_components.Icon_import_outlined, typeof __VLS_components.icon_import_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
(__VLS_ctx.$t('parameter.export_notes'));
var __VLS_19;
/** @type {[typeof UploaderRemark, typeof UploaderRemark, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(UploaderRemark, new UploaderRemark({
    ...{ 'onUploadFinished': {} },
    uploadPath: (`/datasource/uploadDsSchema/${__VLS_ctx.info.id}`),
}));
const __VLS_29 = __VLS_28({
    ...{ 'onUploadFinished': {} },
    uploadPath: (`/datasource/uploadDsSchema/${__VLS_ctx.info.id}`),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
let __VLS_31;
let __VLS_32;
let __VLS_33;
const __VLS_34 = {
    onUploadFinished: (__VLS_ctx.init)
};
var __VLS_30;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-table_top" },
});
(__VLS_ctx.$t('ds.tables'));
const __VLS_35 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    effect: "dark",
    offset: "10",
    content: (__VLS_ctx.$t('ds.form.choose_tables')),
    placement: "top",
}));
const __VLS_37 = __VLS_36({
    effect: "dark",
    offset: "10",
    content: (__VLS_ctx.$t('ds.form.choose_tables')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_38.slots.default;
const __VLS_39 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    ...{ 'onClick': {} },
    ...{ style: {} },
    text: true,
}));
const __VLS_41 = __VLS_40({
    ...{ 'onClick': {} },
    ...{ style: {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_43;
let __VLS_44;
let __VLS_45;
const __VLS_46 = {
    onClick: (__VLS_ctx.handleSelectTableList)
};
__VLS_42.slots.default;
const __VLS_47 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    size: "18",
}));
const __VLS_49 = __VLS_48({
    size: "18",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
__VLS_50.slots.default;
const __VLS_51 = {}.icon_form_outlined;
/** @type {[typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({}));
const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
var __VLS_50;
var __VLS_42;
var __VLS_38;
const __VLS_55 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
}));
const __VLS_57 = __VLS_56({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
__VLS_58.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_58.slots;
    const __VLS_59 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({}));
    const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
    __VLS_62.slots.default;
    const __VLS_63 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
        ...{ class: "svg-icon" },
    }));
    const __VLS_65 = __VLS_64({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    var __VLS_62;
}
var __VLS_58;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "list-content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.initLoading) }, null, null);
if (__VLS_ctx.tableListWithSearch.length) {
    const __VLS_67 = {}.ElScrollbar;
    /** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({}));
    const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_70.slots.default;
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.tableListWithSearch))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onDragstart: (($event) => __VLS_ctx.singleDragStartD($event, ele)) },
            ...{ onDragend: (__VLS_ctx.singleDragEnd) },
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.tableListWithSearch.length))
                        return;
                    __VLS_ctx.clickTable(ele);
                } },
            key: (ele.table_name),
            draggable: (__VLS_ctx.activeRelationship && !__VLS_ctx.tableName.includes(ele.id)),
            ...{ class: "model" },
            ...{ class: ([
                    __VLS_ctx.currentTable.table_name === ele.table_name && 'isActive',
                    __VLS_ctx.tableName.includes(ele.id) && __VLS_ctx.activeRelationship && 'disabled-table',
                ]) },
            title: (ele.table_name),
        });
        const __VLS_71 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
            size: "16",
        }));
        const __VLS_73 = __VLS_72({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        __VLS_74.slots.default;
        const __VLS_75 = {}.icon_form_outlined;
        /** @type {[typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({}));
        const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
        var __VLS_74;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "name" },
        });
        (ele.table_name);
    }
    var __VLS_70;
}
if (!!__VLS_ctx.keywords && !__VLS_ctx.tableListWithSearch.length) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
        ...{ style: {} },
    }));
    const __VLS_80 = __VLS_79({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
}
else if (!__VLS_ctx.initLoading && !__VLS_ctx.tableListWithSearch.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-data" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-data-msg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.$t('datasource.no_table'));
    const __VLS_82 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
    }));
    const __VLS_84 = __VLS_83({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    let __VLS_86;
    let __VLS_87;
    let __VLS_88;
    const __VLS_89 = {
        onClick: (__VLS_ctx.handleSelectTableList)
    };
    __VLS_85.slots.default;
    (__VLS_ctx.$t('datasource.go_add'));
    var __VLS_85;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-relationship" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleRelationship) },
    ...{ class: (__VLS_ctx.activeRelationship && 'active') },
    ...{ class: "btn" },
});
const __VLS_90 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    size: "16",
}));
const __VLS_92 = __VLS_91({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
__VLS_93.slots.default;
const __VLS_94 = {}.icon_mindnote_outlined;
/** @type {[typeof __VLS_components.Icon_mindnote_outlined, typeof __VLS_components.icon_mindnote_outlined, typeof __VLS_components.Icon_mindnote_outlined, typeof __VLS_components.icon_mindnote_outlined, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({}));
const __VLS_96 = __VLS_95({}, ...__VLS_functionalComponentArgsRest(__VLS_95));
var __VLS_93;
(__VLS_ctx.t('training.table_relationship_management'));
if (__VLS_ctx.activeRelationship) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "relationship-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    (__VLS_ctx.t('training.table_relationship_management'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content" },
    });
    /** @type {[typeof TableRelationship, typeof TableRelationship, ]} */ ;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(TableRelationship, new TableRelationship({
        ...{ 'onGetTableName': {} },
        id: (__VLS_ctx.info.id),
        dragging: (__VLS_ctx.isDrag),
    }));
    const __VLS_99 = __VLS_98({
        ...{ 'onGetTableName': {} },
        id: (__VLS_ctx.info.id),
        dragging: (__VLS_ctx.isDrag),
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    let __VLS_101;
    let __VLS_102;
    let __VLS_103;
    const __VLS_104 = {
        onGetTableName: (__VLS_ctx.getTableName)
    };
    var __VLS_100;
}
if (__VLS_ctx.currentTable.table_name && !__VLS_ctx.activeRelationship) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-table" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-name" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name" },
    });
    (__VLS_ctx.currentTable.table_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notes" },
    });
    (__VLS_ctx.$t('about.remark'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        title: (__VLS_ctx.currentTable.custom_comment),
        ...{ class: "field-notes" },
    });
    (__VLS_ctx.currentTable.custom_comment || '-');
    const __VLS_105 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('datasource.edit')),
        placement: "top",
    }));
    const __VLS_107 = __VLS_106({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('datasource.edit')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    __VLS_108.slots.default;
    const __VLS_109 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        ...{ 'onClick': {} },
        ...{ style: {} },
        size: "16",
    }));
    const __VLS_111 = __VLS_110({
        ...{ 'onClick': {} },
        ...{ style: {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    let __VLS_113;
    let __VLS_114;
    let __VLS_115;
    const __VLS_116 = {
        onClick: (__VLS_ctx.editTable)
    };
    __VLS_112.slots.default;
    const __VLS_117 = {}.edit;
    /** @type {[typeof __VLS_components.Edit, typeof __VLS_components.edit, typeof __VLS_components.Edit, typeof __VLS_components.edit, ]} */ ;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({}));
    const __VLS_119 = __VLS_118({}, ...__VLS_functionalComponentArgsRest(__VLS_118));
    var __VLS_112;
    var __VLS_108;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "btn-select" },
    });
    const __VLS_121 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        ...{ 'onClick': {} },
        ...{ class: ([__VLS_ctx.btnSelect === 'd' && 'is-active']) },
        text: true,
    }));
    const __VLS_123 = __VLS_122({
        ...{ 'onClick': {} },
        ...{ class: ([__VLS_ctx.btnSelect === 'd' && 'is-active']) },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    let __VLS_125;
    let __VLS_126;
    let __VLS_127;
    const __VLS_128 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.currentTable.table_name && !__VLS_ctx.activeRelationship))
                return;
            __VLS_ctx.btnSelectClick('d');
        }
    };
    __VLS_124.slots.default;
    (__VLS_ctx.t('ds.table_schema'));
    var __VLS_124;
    const __VLS_129 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        ...{ 'onClick': {} },
        ...{ class: ([__VLS_ctx.btnSelect === 'q' && 'is-active']) },
        text: true,
    }));
    const __VLS_131 = __VLS_130({
        ...{ 'onClick': {} },
        ...{ class: ([__VLS_ctx.btnSelect === 'q' && 'is-active']) },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    let __VLS_133;
    let __VLS_134;
    let __VLS_135;
    const __VLS_136 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.currentTable.table_name && !__VLS_ctx.activeRelationship))
                return;
            __VLS_ctx.btnSelectClick('q');
        }
    };
    __VLS_132.slots.default;
    (__VLS_ctx.t('ds.preview'));
    var __VLS_132;
    if (__VLS_ctx.btnSelect === 'd') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-name" },
        });
        const __VLS_137 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
            ...{ 'onInput': {} },
            modelValue: (__VLS_ctx.fieldName),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('dashboard.search')),
            autocomplete: "off",
            clearable: true,
        }));
        const __VLS_139 = __VLS_138({
            ...{ 'onInput': {} },
            modelValue: (__VLS_ctx.fieldName),
            ...{ style: {} },
            placeholder: (__VLS_ctx.t('dashboard.search')),
            autocomplete: "off",
            clearable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        let __VLS_141;
        let __VLS_142;
        let __VLS_143;
        const __VLS_144 = {
            onInput: (__VLS_ctx.fieldNameSearch)
        };
        var __VLS_140;
        if (__VLS_ctx.ds.type !== 'excel') {
            const __VLS_145 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
                ...{ 'onClick': {} },
                icon: (__VLS_ctx.Refresh),
                ...{ style: {} },
            }));
            const __VLS_147 = __VLS_146({
                ...{ 'onClick': {} },
                icon: (__VLS_ctx.Refresh),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_146));
            let __VLS_149;
            let __VLS_150;
            let __VLS_151;
            const __VLS_152 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentTable.table_name && !__VLS_ctx.activeRelationship))
                        return;
                    if (!(__VLS_ctx.btnSelect === 'd'))
                        return;
                    if (!(__VLS_ctx.ds.type !== 'excel'))
                        return;
                    __VLS_ctx.syncFields();
                }
            };
            __VLS_148.slots.default;
            (__VLS_ctx.t('ds.sync_fields'));
            var __VLS_148;
        }
    }
    if (!__VLS_ctx.loading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-or-schema" },
            ...{ class: (__VLS_ctx.btnSelect === 'q' && 'overflow-preview') },
        });
        if (__VLS_ctx.btnSelect === 'd') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "table-content_preview" },
            });
            const __VLS_153 = {}.ElTable;
            /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
            // @ts-ignore
            const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
                rowClassName: "hover-icon_edit",
                data: (__VLS_ctx.fieldListComputed),
                ...{ style: {} },
            }));
            const __VLS_155 = __VLS_154({
                rowClassName: "hover-icon_edit",
                data: (__VLS_ctx.fieldListComputed),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_154));
            __VLS_156.slots.default;
            const __VLS_157 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
                prop: "field_name",
                label: (__VLS_ctx.t('datasource.field_name')),
                width: "180",
            }));
            const __VLS_159 = __VLS_158({
                prop: "field_name",
                label: (__VLS_ctx.t('datasource.field_name')),
                width: "180",
            }, ...__VLS_functionalComponentArgsRest(__VLS_158));
            const __VLS_161 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
                prop: "field_type",
                label: (__VLS_ctx.t('datasource.field_type')),
                width: "180",
            }));
            const __VLS_163 = __VLS_162({
                prop: "field_type",
                label: (__VLS_ctx.t('datasource.field_type')),
                width: "180",
            }, ...__VLS_functionalComponentArgsRest(__VLS_162));
            const __VLS_165 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
                prop: "field_comment",
                label: (__VLS_ctx.t('datasource.field_original_notes')),
            }));
            const __VLS_167 = __VLS_166({
                prop: "field_comment",
                label: (__VLS_ctx.t('datasource.field_original_notes')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_166));
            const __VLS_169 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
                label: (__VLS_ctx.t('datasource.field_notes_1')),
            }));
            const __VLS_171 = __VLS_170({
                label: (__VLS_ctx.t('datasource.field_notes_1')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_170));
            __VLS_172.slots.default;
            {
                const { default: __VLS_thisSlot } = __VLS_172.slots;
                const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "field-comment" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    title: (scope.row.custom_comment),
                    ...{ class: "notes-in_table" },
                });
                (scope.row.custom_comment);
                const __VLS_173 = {}.ElTooltip;
                /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
                // @ts-ignore
                const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
                    offset: (14),
                    effect: "dark",
                    content: (__VLS_ctx.$t('datasource.edit')),
                    placement: "top",
                }));
                const __VLS_175 = __VLS_174({
                    offset: (14),
                    effect: "dark",
                    content: (__VLS_ctx.$t('datasource.edit')),
                    placement: "top",
                }, ...__VLS_functionalComponentArgsRest(__VLS_174));
                __VLS_176.slots.default;
                const __VLS_177 = {}.ElIcon;
                /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                // @ts-ignore
                const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
                    ...{ 'onClick': {} },
                    ...{ class: "action-btn" },
                    size: "16",
                }));
                const __VLS_179 = __VLS_178({
                    ...{ 'onClick': {} },
                    ...{ class: "action-btn" },
                    size: "16",
                }, ...__VLS_functionalComponentArgsRest(__VLS_178));
                let __VLS_181;
                let __VLS_182;
                let __VLS_183;
                const __VLS_184 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.currentTable.table_name && !__VLS_ctx.activeRelationship))
                            return;
                        if (!(!__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.btnSelect === 'd'))
                            return;
                        __VLS_ctx.editField(scope.row);
                    }
                };
                __VLS_180.slots.default;
                const __VLS_185 = {}.edit;
                /** @type {[typeof __VLS_components.Edit, typeof __VLS_components.edit, typeof __VLS_components.Edit, typeof __VLS_components.edit, ]} */ ;
                // @ts-ignore
                const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({}));
                const __VLS_187 = __VLS_186({}, ...__VLS_functionalComponentArgsRest(__VLS_186));
                var __VLS_180;
                var __VLS_176;
            }
            var __VLS_172;
            const __VLS_189 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
                label: (__VLS_ctx.t('datasource.enabled_status')),
                width: "180",
            }));
            const __VLS_191 = __VLS_190({
                label: (__VLS_ctx.t('datasource.enabled_status')),
                width: "180",
            }, ...__VLS_functionalComponentArgsRest(__VLS_190));
            __VLS_192.slots.default;
            {
                const { default: __VLS_thisSlot } = __VLS_192.slots;
                const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ style: {} },
                });
                const __VLS_193 = {}.ElSwitch;
                /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
                // @ts-ignore
                const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
                    ...{ 'onChange': {} },
                    modelValue: (scope.row.checked),
                    size: "small",
                }));
                const __VLS_195 = __VLS_194({
                    ...{ 'onChange': {} },
                    modelValue: (scope.row.checked),
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_194));
                let __VLS_197;
                let __VLS_198;
                let __VLS_199;
                const __VLS_200 = {
                    onChange: (...[$event]) => {
                        if (!(__VLS_ctx.currentTable.table_name && !__VLS_ctx.activeRelationship))
                            return;
                        if (!(!__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.btnSelect === 'd'))
                            return;
                        __VLS_ctx.changeStatus(scope.row);
                    }
                };
                var __VLS_196;
            }
            var __VLS_192;
            var __VLS_156;
        }
        if (__VLS_ctx.pageInfo.total && __VLS_ctx.btnSelect === 'd') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "pagination-container" },
            });
            const __VLS_201 = {}.ElPagination;
            /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
            // @ts-ignore
            const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
                ...{ 'onSizeChange': {} },
                ...{ 'onCurrentChange': {} },
                currentPage: (__VLS_ctx.pageInfo.currentPage),
                pageSize: (__VLS_ctx.pageInfo.pageSize),
                pageSizes: ([10, 20, 30]),
                background: (true),
                layout: "total, sizes, prev, pager, next, jumper",
                total: (__VLS_ctx.pageInfo.total),
            }));
            const __VLS_203 = __VLS_202({
                ...{ 'onSizeChange': {} },
                ...{ 'onCurrentChange': {} },
                currentPage: (__VLS_ctx.pageInfo.currentPage),
                pageSize: (__VLS_ctx.pageInfo.pageSize),
                pageSizes: ([10, 20, 30]),
                background: (true),
                layout: "total, sizes, prev, pager, next, jumper",
                total: (__VLS_ctx.pageInfo.total),
            }, ...__VLS_functionalComponentArgsRest(__VLS_202));
            let __VLS_205;
            let __VLS_206;
            let __VLS_207;
            const __VLS_208 = {
                onSizeChange: (__VLS_ctx.handleSizeChange)
            };
            const __VLS_209 = {
                onCurrentChange: (__VLS_ctx.handleCurrentChange)
            };
            var __VLS_204;
        }
        if (__VLS_ctx.btnSelect === 'q') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "preview-num" },
            });
            (__VLS_ctx.t('ds.pieces_in_total', { msg: __VLS_ctx.total, ms: __VLS_ctx.showNum }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "table-container" },
            });
            const __VLS_210 = {}.ElTable;
            /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
                data: (__VLS_ctx.previewData.data),
                ...{ style: {} },
            }));
            const __VLS_212 = __VLS_211({
                data: (__VLS_ctx.previewData.data),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_211));
            __VLS_213.slots.default;
            for (const [c, index] of __VLS_getVForSourceType((__VLS_ctx.previewData.fields))) {
                const __VLS_214 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
                    key: (index),
                    prop: (c),
                    label: (c),
                    minWidth: "150",
                    renderHeader: (__VLS_ctx.renderHeader),
                }));
                const __VLS_216 = __VLS_215({
                    key: (index),
                    prop: (c),
                    label: (c),
                    minWidth: "150",
                    renderHeader: (__VLS_ctx.renderHeader),
                }, ...__VLS_functionalComponentArgsRest(__VLS_215));
            }
            var __VLS_213;
        }
    }
}
const __VLS_218 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.tableDialog),
    title: (__VLS_ctx.t('datasource.table_notes')),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
    modalClass: "notes-dialog",
}));
const __VLS_220 = __VLS_219({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.tableDialog),
    title: (__VLS_ctx.t('datasource.table_notes')),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
    modalClass: "notes-dialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
let __VLS_222;
let __VLS_223;
let __VLS_224;
const __VLS_225 = {
    onClosed: (__VLS_ctx.closeTable)
};
__VLS_221.slots.default;
const __VLS_226 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
    modelValue: (__VLS_ctx.tableComment),
    placeholder: (__VLS_ctx.$t('datasource.please_enter')),
    autosize: ({ minRows: 3.64, maxRows: 11.095 }),
    type: "textarea",
    clearable: true,
}));
const __VLS_228 = __VLS_227({
    modelValue: (__VLS_ctx.tableComment),
    placeholder: (__VLS_ctx.$t('datasource.please_enter')),
    autosize: ({ minRows: 3.64, maxRows: 11.095 }),
    type: "textarea",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_227));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_230 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_232 = __VLS_231({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_231));
let __VLS_234;
let __VLS_235;
let __VLS_236;
const __VLS_237 = {
    onClick: (__VLS_ctx.closeTable)
};
__VLS_233.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_233;
const __VLS_238 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_240 = __VLS_239({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_239));
let __VLS_242;
let __VLS_243;
let __VLS_244;
const __VLS_245 = {
    onClick: (__VLS_ctx.saveTable)
};
__VLS_241.slots.default;
(__VLS_ctx.t('common.save'));
var __VLS_241;
var __VLS_221;
const __VLS_246 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.fieldDialog),
    title: (__VLS_ctx.t('datasource.field_notes')),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
    modalClass: "notes-dialog",
}));
const __VLS_248 = __VLS_247({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.fieldDialog),
    title: (__VLS_ctx.t('datasource.field_notes')),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
    modalClass: "notes-dialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_247));
let __VLS_250;
let __VLS_251;
let __VLS_252;
const __VLS_253 = {
    onClosed: (__VLS_ctx.closeField)
};
__VLS_249.slots.default;
const __VLS_254 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
    modelValue: (__VLS_ctx.fieldComment),
    placeholder: (__VLS_ctx.$t('datasource.please_enter')),
    autosize: ({ minRows: 3.64, maxRows: 11.095 }),
    clearable: true,
    type: "textarea",
}));
const __VLS_256 = __VLS_255({
    modelValue: (__VLS_ctx.fieldComment),
    placeholder: (__VLS_ctx.$t('datasource.please_enter')),
    autosize: ({ minRows: 3.64, maxRows: 11.095 }),
    clearable: true,
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_255));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_258 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_260 = __VLS_259({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_259));
let __VLS_262;
let __VLS_263;
let __VLS_264;
const __VLS_265 = {
    onClick: (__VLS_ctx.closeField)
};
__VLS_261.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_261;
const __VLS_266 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_268 = __VLS_267({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
let __VLS_270;
let __VLS_271;
let __VLS_272;
const __VLS_273 = {
    onClick: (__VLS_ctx.saveField)
};
__VLS_269.slots.default;
(__VLS_ctx.t('common.save'));
var __VLS_269;
var __VLS_249;
/** @type {[typeof ParamsForm, typeof ParamsForm, ]} */ ;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent(ParamsForm, new ParamsForm({
    ...{ 'onRefresh': {} },
    ref: "paramsFormRef",
}));
const __VLS_275 = __VLS_274({
    ...{ 'onRefresh': {} },
    ref: "paramsFormRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
let __VLS_277;
let __VLS_278;
let __VLS_279;
const __VLS_280 = {
    onRefresh: (__VLS_ctx.refresh)
};
/** @type {typeof __VLS_ctx.paramsFormRef} */ ;
var __VLS_281 = {};
var __VLS_276;
/** @type {__VLS_StyleScopedClasses['data-table']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['export-remark']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['side-list']} */ ;
/** @type {__VLS_StyleScopedClasses['select-table_top']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['list-content']} */ ;
/** @type {__VLS_StyleScopedClasses['model']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['no-data']} */ ;
/** @type {__VLS_StyleScopedClasses['no-data-msg']} */ ;
/** @type {__VLS_StyleScopedClasses['table-relationship']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-name']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['notes']} */ ;
/** @type {__VLS_StyleScopedClasses['field-notes']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-select']} */ ;
/** @type {__VLS_StyleScopedClasses['field-name']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-or-schema']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content_preview']} */ ;
/** @type {__VLS_StyleScopedClasses['field-comment']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-in_table']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-num']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
// @ts-ignore
var __VLS_282 = __VLS_281;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_right_outlined: icon_right_outlined,
            icon_form_outlined: icon_form_outlined,
            icon_import_outlined: icon_import_outlined,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            EmptyBackground: EmptyBackground,
            edit: edit,
            ParamsForm: ParamsForm,
            UploaderRemark: UploaderRemark,
            TableRelationship: TableRelationship,
            icon_mindnote_outlined: icon_mindnote_outlined,
            Refresh: Refresh,
            t: t,
            paramsFormRef: paramsFormRef,
            loading: loading,
            initLoading: initLoading,
            activeRelationship: activeRelationship,
            keywords: keywords,
            tableListWithSearch: tableListWithSearch,
            total: total,
            showNum: showNum,
            currentTable: currentTable,
            ds: ds,
            btnSelect: btnSelect,
            isDrag: isDrag,
            tableName: tableName,
            pageInfo: pageInfo,
            handleRelationship: handleRelationship,
            singleDragStartD: singleDragStartD,
            getTableName: getTableName,
            singleDragEnd: singleDragEnd,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            fieldListComputed: fieldListComputed,
            init: init,
            tableComment: tableComment,
            fieldDialog: fieldDialog,
            tableDialog: tableDialog,
            fieldComment: fieldComment,
            previewData: previewData,
            handleSelectTableList: handleSelectTableList,
            clickTable: clickTable,
            closeTable: closeTable,
            editTable: editTable,
            saveTable: saveTable,
            closeField: closeField,
            refresh: refresh,
            saveField: saveField,
            editField: editField,
            changeStatus: changeStatus,
            syncFields: syncFields,
            downloadTemplate: downloadTemplate,
            back: back,
            renderHeader: renderHeader,
            fieldNameSearch: fieldNameSearch,
            fieldName: fieldName,
            btnSelectClick: btnSelectClick,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
