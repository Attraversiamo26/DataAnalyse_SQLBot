import { ref, reactive, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { datasourceApi } from '@/api/datasource';
import icon_upload_outlined from '@/assets/svg/icon_upload_outlined.svg';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import { encrypted, decrypted } from './js/aes';
import { ElMessage } from 'element-plus-secondary';
import icon_form_outlined from '@/assets/svg/icon_form_outlined.svg';
import FixedSizeList from 'element-plus-secondary/es/components/virtual-list/src/components/fixed-size-list.mjs';
import { debounce } from 'lodash-es';
import { Plus } from '@element-plus/icons-vue';
import { haveSchema } from '@/views/ds/js/ds-type';
import { setSize } from '@/utils/utils';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import icon_fileExcel_colorful from '@/assets/datasource/icon_excel.png';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import { useCache } from '@/utils/useCache';
const props = withDefaults(defineProps(), {
    activeName: '',
    activeType: '',
    activeStep: 0,
    isDataTable: false,
});
const dsFormRef = ref();
const emit = defineEmits(['refresh', 'changeActiveStep', 'close']);
const isCreate = ref(true);
const isEditTable = ref(false);
const checkList = ref([]);
const tableList = ref([]);
const excelUploadSuccess = ref(false);
const tableListLoading = ref(false);
const tableListLoadingV1 = ref(false);
const checkLoading = ref(false);
const dialogTitle = ref('');
const getUploadURL = import.meta.env.VITE_API_BASE_URL + '/datasource/uploadExcel';
const saveLoading = ref(false);
const uploadLoading = ref(false);
const { t } = useI18n();
const schemaList = ref([]);
const rules = reactive({
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('ds.form.name'),
            trigger: 'blur',
        },
        { min: 1, max: 50, message: t('ds.form.validate.name_length'), trigger: 'blur' },
    ],
    type: [
        {
            required: true,
            message: t('datasource.Please_select') + t('common.empty') + t('ds.type'),
            trigger: 'change',
        },
    ],
    host: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('ds.form.host'),
            trigger: 'blur',
        },
    ],
    port: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('ds.form.port'),
            trigger: 'blur',
        },
    ],
    database: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('ds.form.database'),
            trigger: 'blur',
        },
    ],
    mode: [{ required: true, message: 'Please choose mode', trigger: 'change' }],
    sheets: [{ required: true, message: t('user.upload_file'), trigger: 'change' }],
    dbSchema: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + 'Schema',
            trigger: 'blur',
        },
    ],
});
const dialogVisible = ref(false);
const form = ref({
    name: '',
    description: '',
    type: props.activeType,
    configuration: '',
    driver: '',
    host: '',
    port: 0,
    username: '',
    password: '',
    database: '',
    extraJdbc: '',
    dbSchema: '',
    filename: '',
    sheets: [],
    mode: 'service_name',
    timeout: 30,
    lowVersion: false,
});
const close = () => {
    dialogVisible.value = false;
    isCreate.value = true;
    emit('changeActiveStep', 0);
    emit('close');
    isEditTable.value = false;
    checkList.value = [];
    tableList.value = [];
    excelUploadSuccess.value = false;
    saveLoading.value = false;
};
const { wsCache } = useCache();
const token = wsCache.get('user.token');
const headers = ref({ 'X-SQLBOT-TOKEN': `Bearer ${token}` });
const initForm = (item, editTable = false) => {
    isEditTable.value = false;
    keywords.value = '';
    dsFormRef.value.clearValidate();
    if (item) {
        dialogTitle.value = editTable ? t('ds.form.title.choose_tables') : t('ds.form.title.edit');
        isCreate.value = false;
        form.value.id = item.id;
        form.value.name = item.name;
        form.value.description = item.description;
        form.value.type = item.type;
        form.value.configuration = item.configuration;
        if (item.configuration) {
            const configuration = JSON.parse(decrypted(item.configuration));
            form.value.host = configuration.host;
            form.value.port = configuration.port;
            form.value.username = configuration.username;
            form.value.password = configuration.password;
            form.value.database = configuration.database;
            form.value.extraJdbc = configuration.extraJdbc;
            form.value.dbSchema = configuration.dbSchema;
            form.value.filename = configuration.filename;
            form.value.sheets = configuration.sheets;
            form.value.mode = configuration.mode;
            form.value.timeout = configuration.timeout ? configuration.timeout : 30;
            form.value.lowVersion =
                configuration.lowVersion !== null && configuration.lowVersion !== undefined
                    ? configuration.lowVersion
                    : true;
        }
        if (editTable) {
            dialogTitle.value = t('ds.form.choose_tables');
            emit('changeActiveStep', 2);
            isEditTable.value = true;
            isCreate.value = false;
            // request tables and check tables
            tableListLoadingV1.value = true;
            datasourceApi
                .tableList(item.id)
                .then((res) => {
                checkList.value = res.map((ele) => {
                    return ele.table_name;
                });
                if (item.type === 'excel') {
                    tableList.value = form.value.sheets;
                    nextTick(() => {
                        handleCheckedTablesChange([...checkList.value]);
                    });
                }
                else {
                    tableListLoading.value = true;
                    const requestObj = buildConf();
                    datasourceApi
                        .getTablesByConf(requestObj)
                        .then((table) => {
                        tableList.value = table;
                        checkList.value = checkList.value.filter((ele) => {
                            return table
                                .map((ele) => {
                                return ele.tableName;
                            })
                                .includes(ele);
                        });
                        nextTick(() => {
                            handleCheckedTablesChange([...checkList.value]);
                        });
                    })
                        .finally(() => {
                        tableListLoading.value = false;
                    });
                }
            })
                .finally(() => {
                tableListLoadingV1.value = false;
            });
        }
    }
    else {
        dialogTitle.value = t('ds.form.title.add');
        isCreate.value = true;
        isEditTable.value = false;
        checkList.value = [];
        tableList.value = [];
        form.value = {
            name: '',
            description: '',
            type: 'mysql',
            configuration: '',
            driver: '',
            host: '',
            port: 0,
            username: '',
            password: '',
            database: '',
            extraJdbc: '',
            dbSchema: '',
            filename: '',
            sheets: [],
            mode: 'service_name',
            timeout: 30,
            lowVersion: false,
        };
    }
    dialogVisible.value = true;
};
const save = async (formEl) => {
    if (!formEl)
        return;
    await formEl.validate(async (valid) => {
        if (valid) {
            const list = tableList.value
                .filter((ele) => {
                return checkTableList.value.includes(ele.tableName);
            })
                .map((ele) => {
                return { table_name: ele.tableName, table_comment: ele.tableComment };
            });
            if (checkTableList.value.length > 30) {
                const excessive = await ElMessageBox.confirm(t('common.excessive_tables_selected'), {
                    tip: t('common.to_continue_saving', { msg: checkTableList.value.length }),
                    confirmButtonText: t('common.save'),
                    cancelButtonText: t('common.cancel'),
                    confirmButtonType: 'primary',
                    type: 'warning',
                    customClass: 'confirm-with_icon',
                    autofocus: false,
                });
                if (excessive !== 'confirm')
                    return;
            }
            saveLoading.value = true;
            const requestObj = buildConf();
            if (form.value.id) {
                if (!isEditTable.value) {
                    // only update datasource config info
                    datasourceApi
                        .update(requestObj)
                        .then(() => {
                        close();
                        emit('refresh');
                    })
                        .finally(() => {
                        saveLoading.value = false;
                    });
                }
                else {
                    // save table and field
                    datasourceApi
                        .chooseTables(form.value.id, list)
                        .then(() => {
                        close();
                        emit('refresh');
                    })
                        .finally(() => {
                        saveLoading.value = false;
                    });
                }
            }
            else {
                requestObj.tables = list;
                datasourceApi
                    .add(requestObj)
                    .then(() => {
                    close();
                    emit('refresh');
                })
                    .finally(() => {
                    saveLoading.value = false;
                });
            }
        }
    });
};
const buildConf = () => {
    form.value.configuration = encrypted(JSON.stringify({
        host: form.value.host,
        port: form.value.port,
        username: form.value.username,
        password: form.value.password,
        database: form.value.database,
        extraJdbc: form.value.extraJdbc,
        dbSchema: form.value.dbSchema,
        filename: form.value.filename,
        sheets: form.value.sheets,
        mode: form.value.mode,
        timeout: form.value.timeout,
        lowVersion: form.value.lowVersion,
    }));
    const obj = JSON.parse(JSON.stringify(form.value));
    delete obj.driver;
    delete obj.host;
    delete obj.port;
    delete obj.username;
    delete obj.password;
    delete obj.database;
    delete obj.extraJdbc;
    delete obj.dbSchema;
    delete obj.filename;
    delete obj.sheets;
    delete obj.mode;
    delete obj.timeout;
    delete obj.lowVersion;
    return obj;
};
const check = () => {
    const requestObj = buildConf();
    datasourceApi.check(requestObj).then((res) => {
        if (res) {
            ElMessage({
                message: t('ds.form.connect.success'),
                type: 'success',
                showClose: true,
            });
        }
        else {
            ElMessage({
                message: t('ds.form.connect.failed'),
                type: 'error',
                showClose: true,
            });
        }
    });
};
const getSchema = debounce(() => {
    schemaList.value = [];
    const requestObj = buildConf();
    datasourceApi.getSchema(requestObj).then((res) => {
        schemaList.value = (res || []).map((item) => ({ label: item, value: item }));
    });
}, 300);
onBeforeUnmount(() => (saveLoading.value = false));
const next = debounce(async (formEl) => {
    if (!formEl)
        return;
    await formEl.validate((valid) => {
        if (valid) {
            if (form.value.type === 'excel') {
                // next, show tables
                if (excelUploadSuccess.value) {
                    emit('changeActiveStep', props.activeStep + 1);
                }
            }
            else {
                if (checkLoading.value)
                    return;
                // check status if success do next
                const requestObj = buildConf();
                checkLoading.value = true;
                datasourceApi
                    .check(requestObj)
                    .then((res) => {
                    if (res) {
                        emit('changeActiveStep', props.activeStep + 1);
                        // request tables
                        datasourceApi.getTablesByConf(requestObj).then((res) => {
                            tableList.value = res;
                        });
                    }
                    else {
                        ElMessage({
                            message: t('ds.form.connect.failed'),
                            type: 'error',
                            showClose: true,
                        });
                    }
                })
                    .finally(() => {
                    checkLoading.value = false;
                });
            }
        }
    });
}, 300);
const preview = debounce(() => {
    emit('changeActiveStep', props.activeStep - 1);
}, 200);
const beforeUpload = (rawFile) => {
    setFile(rawFile);
    if (rawFile.size / 1024 / 1024 > 50) {
        ElMessage.error(t('common.not_exceed_50mb'));
        return false;
    }
    uploadLoading.value = true;
    return true;
};
const onSuccess = (response) => {
    form.value.filename = response.data.filename;
    form.value.sheets = response.data.sheets;
    tableList.value = response.data.sheets;
    excelUploadSuccess.value = true;
    uploadLoading.value = false;
};
const onError = (e) => {
    ElMessage.error(e.toString());
    uploadLoading.value = false;
};
onMounted(() => {
    setTimeout(() => {
        dsFormRef.value.clearValidate();
    }, 100);
});
const keywords = ref('');
const tableListWithSearch = computed(() => {
    if (!keywords.value)
        return tableList.value;
    return tableList.value.filter((ele) => ele.tableName.toLowerCase().includes(keywords.value.toLowerCase()));
});
watch(keywords, () => {
    const tableNameArr = tableListWithSearch.value.map((ele) => ele.tableName);
    checkList.value = checkTableList.value.filter((ele) => tableNameArr.includes(ele));
    const checkedCount = checkList.value.length;
    checkAll.value = checkedCount === tableListWithSearch.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < tableListWithSearch.value.length;
});
watch(() => props.activeType, (val) => {
    form.value.type = val;
});
const fileSize = ref('-');
const clearFile = () => {
    fileSize.value = '';
    form.value.filename = '';
    form.value.sheets = [];
    tableList.value = [];
};
const setFile = (file) => {
    fileSize.value = setSize(file.size);
};
const checkAll = ref(false);
const isIndeterminate = ref(false);
const checkTableList = ref([]);
const handleCheckAllChange = (val) => {
    checkList.value = val
        ? [
            ...new Set([
                ...tableListWithSearch.value.map((ele) => ele.tableName),
                ...checkList.value,
            ]),
        ]
        : [];
    isIndeterminate.value = false;
    const tableNameArr = tableListWithSearch.value.map((ele) => ele.tableName);
    checkTableList.value = val
        ? [...new Set([...tableNameArr, ...checkTableList.value])]
        : checkTableList.value.filter((ele) => !tableNameArr.includes(ele));
};
const handleCheckedTablesChange = (value) => {
    const checkedCount = value.length;
    checkAll.value = checkedCount === tableListWithSearch.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < tableListWithSearch.value.length;
    const tableNameArr = tableListWithSearch.value.map((ele) => ele.tableName);
    checkTableList.value = [
        ...new Set([...checkTableList.value.filter((ele) => !tableNameArr.includes(ele)), ...value]),
    ];
};
const tableListSave = () => {
    save(dsFormRef.value);
};
const __VLS_exposed = {
    initForm,
    tableListSave,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    activeName: '',
    activeType: '',
    activeStep: 0,
    isDataTable: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['draw-foot']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "model-form" },
    ...{ class: ((!__VLS_ctx.isCreate || __VLS_ctx.activeStep === 2) && 'edit-form') },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.uploadLoading || __VLS_ctx.saveLoading || __VLS_ctx.checkLoading) }, null, null);
if (__VLS_ctx.isCreate && __VLS_ctx.activeStep !== 2) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "model-name" },
    });
    (__VLS_ctx.activeName);
    if (__VLS_ctx.form.type !== 'excel') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.t('ds.form.support_version'));
        if (__VLS_ctx.form.type === 'sqlServer') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        else if (__VLS_ctx.form.type === 'oracle') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        else if (__VLS_ctx.form.type === 'mysql') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        else if (__VLS_ctx.form.type === 'pg') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        else if (__VLS_ctx.form.type === 'es') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-content" },
});
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSubmit': {} },
    ref: "dsFormRef",
    model: (__VLS_ctx.form),
    labelPosition: "top",
    labelWidth: "auto",
    rules: (__VLS_ctx.rules),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    ref: "dsFormRef",
    model: (__VLS_ctx.form),
    labelPosition: "top",
    labelWidth: "auto",
    rules: (__VLS_ctx.rules),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: () => { }
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeStep === 1) }, null, null);
/** @type {typeof __VLS_ctx.dsFormRef} */ ;
var __VLS_8 = {};
__VLS_3.slots.default;
if (__VLS_ctx.form.type === 'excel') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_10 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        prop: "sheets",
        label: (__VLS_ctx.t('ds.form.file')),
    }));
    const __VLS_12 = __VLS_11({
        prop: "sheets",
        label: (__VLS_ctx.t('ds.form.file')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_13.slots.default;
    if (__VLS_ctx.form.filename) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pdf-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.icon_fileExcel_colorful),
            width: "40px",
            height: "40px",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-name" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "name" },
        });
        (__VLS_ctx.form.filename);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "size" },
        });
        (__VLS_ctx.form.filename.split('.')[1]);
        (__VLS_ctx.fileSize);
        if (!__VLS_ctx.form.id) {
            const __VLS_14 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                size: "16",
            }));
            const __VLS_16 = __VLS_15({
                ...{ 'onClick': {} },
                ...{ class: "action-btn" },
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            let __VLS_18;
            let __VLS_19;
            let __VLS_20;
            const __VLS_21 = {
                onClick: (__VLS_ctx.clearFile)
            };
            __VLS_17.slots.default;
            const __VLS_22 = {}.IconOpeDelete;
            /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
            // @ts-ignore
            const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({}));
            const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
            var __VLS_17;
        }
    }
    if (__VLS_ctx.form.filename && !__VLS_ctx.form.id) {
        const __VLS_26 = {}.ElUpload;
        /** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
            ...{ class: "upload-user" },
            accept: ".xlsx,.xls,.csv",
            headers: (__VLS_ctx.headers),
            action: (__VLS_ctx.getUploadURL),
            beforeUpload: (__VLS_ctx.beforeUpload),
            onError: (__VLS_ctx.onError),
            onSuccess: (__VLS_ctx.onSuccess),
            showFileList: (false),
            fileList: (__VLS_ctx.form.sheets),
        }));
        const __VLS_28 = __VLS_27({
            ...{ class: "upload-user" },
            accept: ".xlsx,.xls,.csv",
            headers: (__VLS_ctx.headers),
            action: (__VLS_ctx.getUploadURL),
            beforeUpload: (__VLS_ctx.beforeUpload),
            onError: (__VLS_ctx.onError),
            onSuccess: (__VLS_ctx.onSuccess),
            showFileList: (false),
            fileList: (__VLS_ctx.form.sheets),
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        __VLS_29.slots.default;
        const __VLS_30 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
            text: true,
            ...{ style: {} },
        }));
        const __VLS_32 = __VLS_31({
            text: true,
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        __VLS_33.slots.default;
        (__VLS_ctx.$t('common.re_upload'));
        var __VLS_33;
        var __VLS_29;
    }
    else if (!__VLS_ctx.form.id) {
        const __VLS_34 = {}.ElUpload;
        /** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
            ...{ class: "upload-user" },
            accept: ".xlsx,.xls,.csv",
            headers: (__VLS_ctx.headers),
            action: (__VLS_ctx.getUploadURL),
            beforeUpload: (__VLS_ctx.beforeUpload),
            onSuccess: (__VLS_ctx.onSuccess),
            onError: (__VLS_ctx.onError),
            showFileList: (false),
            fileList: (__VLS_ctx.form.sheets),
        }));
        const __VLS_36 = __VLS_35({
            ...{ class: "upload-user" },
            accept: ".xlsx,.xls,.csv",
            headers: (__VLS_ctx.headers),
            action: (__VLS_ctx.getUploadURL),
            beforeUpload: (__VLS_ctx.beforeUpload),
            onSuccess: (__VLS_ctx.onSuccess),
            onError: (__VLS_ctx.onError),
            showFileList: (false),
            fileList: (__VLS_ctx.form.sheets),
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        __VLS_37.slots.default;
        const __VLS_38 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
            secondary: true,
        }));
        const __VLS_40 = __VLS_39({
            secondary: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        __VLS_41.slots.default;
        const __VLS_42 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
            size: "16",
            ...{ style: {} },
        }));
        const __VLS_44 = __VLS_43({
            size: "16",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        __VLS_45.slots.default;
        const __VLS_46 = {}.icon_upload_outlined;
        /** @type {[typeof __VLS_components.Icon_upload_outlined, typeof __VLS_components.icon_upload_outlined, typeof __VLS_components.Icon_upload_outlined, typeof __VLS_components.icon_upload_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({}));
        const __VLS_48 = __VLS_47({}, ...__VLS_functionalComponentArgsRest(__VLS_47));
        var __VLS_45;
        (__VLS_ctx.t('user.upload_file'));
        var __VLS_41;
        var __VLS_37;
    }
    if (!__VLS_ctx.form.filename) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "not_exceed" },
        });
        (__VLS_ctx.$t('common.not_exceed_50mb'));
    }
    var __VLS_13;
}
const __VLS_50 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    label: (__VLS_ctx.t('ds.form.name')),
    prop: "name",
}));
const __VLS_52 = __VLS_51({
    label: (__VLS_ctx.t('ds.form.name')),
    prop: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
const __VLS_54 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    modelValue: (__VLS_ctx.form.name),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.name')),
}));
const __VLS_56 = __VLS_55({
    modelValue: (__VLS_ctx.form.name),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
var __VLS_53;
const __VLS_58 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    label: (__VLS_ctx.t('ds.form.description')),
}));
const __VLS_60 = __VLS_59({
    label: (__VLS_ctx.t('ds.form.description')),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_61.slots.default;
const __VLS_62 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    modelValue: (__VLS_ctx.form.description),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.description')),
    rows: (2),
    showWordLimit: true,
    maxlength: "200",
    clearable: true,
    type: "textarea",
}));
const __VLS_64 = __VLS_63({
    modelValue: (__VLS_ctx.form.description),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.description')),
    rows: (2),
    showWordLimit: true,
    maxlength: "200",
    clearable: true,
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
var __VLS_61;
if (__VLS_ctx.form.type !== 'excel') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_66 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        label: (__VLS_ctx.form.type !== 'es' ? __VLS_ctx.t('ds.form.host') : __VLS_ctx.t('ds.form.address')),
        prop: "host",
    }));
    const __VLS_68 = __VLS_67({
        label: (__VLS_ctx.form.type !== 'es' ? __VLS_ctx.t('ds.form.host') : __VLS_ctx.t('ds.form.address')),
        prop: "host",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_69.slots.default;
    const __VLS_70 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        modelValue: (__VLS_ctx.form.host),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') +
            __VLS_ctx.$t('common.empty') +
            (__VLS_ctx.form.type !== 'es' ? __VLS_ctx.t('ds.form.host') : __VLS_ctx.t('ds.form.address'))),
    }));
    const __VLS_72 = __VLS_71({
        modelValue: (__VLS_ctx.form.host),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') +
            __VLS_ctx.$t('common.empty') +
            (__VLS_ctx.form.type !== 'es' ? __VLS_ctx.t('ds.form.host') : __VLS_ctx.t('ds.form.address'))),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    var __VLS_69;
    if (__VLS_ctx.form.type !== 'es') {
        const __VLS_74 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
            label: (__VLS_ctx.t('ds.form.port')),
            prop: "port",
        }));
        const __VLS_76 = __VLS_75({
            label: (__VLS_ctx.t('ds.form.port')),
            prop: "port",
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        __VLS_77.slots.default;
        const __VLS_78 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
            modelValue: (__VLS_ctx.form.port),
            clearable: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.port')),
        }));
        const __VLS_80 = __VLS_79({
            modelValue: (__VLS_ctx.form.port),
            clearable: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.port')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        var __VLS_77;
    }
    const __VLS_82 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        label: (__VLS_ctx.t('ds.form.username')),
    }));
    const __VLS_84 = __VLS_83({
        label: (__VLS_ctx.t('ds.form.username')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_85.slots.default;
    const __VLS_86 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        modelValue: (__VLS_ctx.form.username),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.username')),
    }));
    const __VLS_88 = __VLS_87({
        modelValue: (__VLS_ctx.form.username),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.username')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    var __VLS_85;
    const __VLS_90 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        label: (__VLS_ctx.t('ds.form.password')),
    }));
    const __VLS_92 = __VLS_91({
        label: (__VLS_ctx.t('ds.form.password')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_93.slots.default;
    const __VLS_94 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        modelValue: (__VLS_ctx.form.password),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.password')),
        type: "password",
        showPassword: true,
    }));
    const __VLS_96 = __VLS_95({
        modelValue: (__VLS_ctx.form.password),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.password')),
        type: "password",
        showPassword: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    var __VLS_93;
    if (__VLS_ctx.form.type !== 'dm' && __VLS_ctx.form.type !== 'es') {
        const __VLS_98 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
            label: (__VLS_ctx.t('ds.form.database')),
            prop: "database",
        }));
        const __VLS_100 = __VLS_99({
            label: (__VLS_ctx.t('ds.form.database')),
            prop: "database",
        }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        __VLS_101.slots.default;
        const __VLS_102 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            modelValue: (__VLS_ctx.form.database),
            clearable: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.database')),
        }));
        const __VLS_104 = __VLS_103({
            modelValue: (__VLS_ctx.form.database),
            clearable: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.database')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        var __VLS_101;
    }
    if (__VLS_ctx.form.type === 'oracle') {
        const __VLS_106 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
            label: (__VLS_ctx.t('ds.form.connect_mode')),
            prop: "mode",
        }));
        const __VLS_108 = __VLS_107({
            label: (__VLS_ctx.t('ds.form.connect_mode')),
            prop: "mode",
        }, ...__VLS_functionalComponentArgsRest(__VLS_107));
        __VLS_109.slots.default;
        const __VLS_110 = {}.ElRadioGroup;
        /** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
            modelValue: (__VLS_ctx.form.mode),
        }));
        const __VLS_112 = __VLS_111({
            modelValue: (__VLS_ctx.form.mode),
        }, ...__VLS_functionalComponentArgsRest(__VLS_111));
        __VLS_113.slots.default;
        const __VLS_114 = {}.ElRadio;
        /** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            value: "service_name",
        }));
        const __VLS_116 = __VLS_115({
            value: "service_name",
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        __VLS_117.slots.default;
        (__VLS_ctx.t('ds.form.mode.service_name'));
        var __VLS_117;
        const __VLS_118 = {}.ElRadio;
        /** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
            value: "sid",
        }));
        const __VLS_120 = __VLS_119({
            value: "sid",
        }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        __VLS_121.slots.default;
        (__VLS_ctx.t('ds.form.mode.sid'));
        var __VLS_121;
        var __VLS_113;
        var __VLS_109;
    }
    if (__VLS_ctx.form.type === 'sqlServer') {
        const __VLS_122 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
            label: (__VLS_ctx.t('ds.form.low_version')),
            prop: "low_version",
        }));
        const __VLS_124 = __VLS_123({
            label: (__VLS_ctx.t('ds.form.low_version')),
            prop: "low_version",
        }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        __VLS_125.slots.default;
        const __VLS_126 = {}.ElCheckbox;
        /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
            modelValue: (__VLS_ctx.form.lowVersion),
            label: (__VLS_ctx.t('ds.form.low_version')),
        }));
        const __VLS_128 = __VLS_127({
            modelValue: (__VLS_ctx.form.lowVersion),
            label: (__VLS_ctx.t('ds.form.low_version')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        var __VLS_125;
    }
    if (__VLS_ctx.form.type !== 'es') {
        const __VLS_130 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
            label: (__VLS_ctx.t('ds.form.extra_jdbc')),
        }));
        const __VLS_132 = __VLS_131({
            label: (__VLS_ctx.t('ds.form.extra_jdbc')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        __VLS_133.slots.default;
        const __VLS_134 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
            modelValue: (__VLS_ctx.form.extraJdbc),
            clearable: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.extra_jdbc')),
        }));
        const __VLS_136 = __VLS_135({
            modelValue: (__VLS_ctx.form.extraJdbc),
            clearable: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.t('ds.form.extra_jdbc')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_135));
        var __VLS_133;
    }
    if (__VLS_ctx.haveSchema.includes(__VLS_ctx.form.type)) {
        const __VLS_138 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
            ...{ class: "schema-label" },
            prop: "dbSchema",
        }));
        const __VLS_140 = __VLS_139({
            ...{ class: "schema-label" },
            prop: "dbSchema",
        }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        __VLS_141.slots.default;
        {
            const { label: __VLS_thisSlot } = __VLS_141.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "name" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
                ...{ class: "required" },
            });
            const __VLS_142 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
                ...{ 'onClick': {} },
                text: true,
                size: "small",
            }));
            const __VLS_144 = __VLS_143({
                ...{ 'onClick': {} },
                text: true,
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_143));
            let __VLS_146;
            let __VLS_147;
            let __VLS_148;
            const __VLS_149 = {
                onClick: (__VLS_ctx.getSchema)
            };
            __VLS_145.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_145.slots;
                const __VLS_150 = {}.Icon;
                /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
                // @ts-ignore
                const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
                    name: "icon_add_outlined",
                }));
                const __VLS_152 = __VLS_151({
                    name: "icon_add_outlined",
                }, ...__VLS_functionalComponentArgsRest(__VLS_151));
                __VLS_153.slots.default;
                const __VLS_154 = {}.Plus;
                /** @type {[typeof __VLS_components.Plus, ]} */ ;
                // @ts-ignore
                const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
                    ...{ class: "svg-icon" },
                }));
                const __VLS_156 = __VLS_155({
                    ...{ class: "svg-icon" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_155));
                var __VLS_153;
            }
            (__VLS_ctx.t('datasource.get_schema'));
            var __VLS_145;
        }
        const __VLS_158 = {}.ElSelect;
        /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
        // @ts-ignore
        const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
            modelValue: (__VLS_ctx.form.dbSchema),
            filterable: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + 'Schema'),
        }));
        const __VLS_160 = __VLS_159({
            modelValue: (__VLS_ctx.form.dbSchema),
            filterable: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + 'Schema'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_159));
        __VLS_161.slots.default;
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.schemaList))) {
            const __VLS_162 = {}.ElOption;
            /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
            // @ts-ignore
            const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
                key: (item.value),
                label: (item.label),
                value: (item.value),
            }));
            const __VLS_164 = __VLS_163({
                key: (item.value),
                label: (item.label),
                value: (item.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_163));
        }
        var __VLS_161;
        var __VLS_141;
    }
    if (__VLS_ctx.form.type !== 'es') {
        const __VLS_166 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
            label: (__VLS_ctx.t('ds.form.timeout')),
            prop: "timeout",
        }));
        const __VLS_168 = __VLS_167({
            label: (__VLS_ctx.t('ds.form.timeout')),
            prop: "timeout",
        }, ...__VLS_functionalComponentArgsRest(__VLS_167));
        __VLS_169.slots.default;
        const __VLS_170 = {}.ElInputNumber;
        /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
            modelValue: (__VLS_ctx.form.timeout),
            clearable: true,
            min: (0),
            max: (300),
            controlsPosition: "right",
        }));
        const __VLS_172 = __VLS_171({
            modelValue: (__VLS_ctx.form.timeout),
            clearable: true,
            min: (0),
            max: (300),
            controlsPosition: "right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_171));
        var __VLS_169;
    }
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-data_table" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeStep === 2) }, null, null);
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.tableListLoading || __VLS_ctx.tableListLoadingV1) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
(__VLS_ctx.$t('ds.form.choose_tables'));
(__VLS_ctx.checkTableList.length);
(__VLS_ctx.tableList.length);
const __VLS_174 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
}));
const __VLS_176 = __VLS_175({
    modelValue: (__VLS_ctx.keywords),
    clearable: true,
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('datasource.search')),
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
__VLS_177.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_177.slots;
    const __VLS_178 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({}));
    const __VLS_180 = __VLS_179({}, ...__VLS_functionalComponentArgsRest(__VLS_179));
    __VLS_181.slots.default;
    const __VLS_182 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
        ...{ class: "svg-icon" },
    }));
    const __VLS_184 = __VLS_183({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    var __VLS_181;
}
var __VLS_177;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-all" },
});
const __VLS_186 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkAll),
    indeterminate: (__VLS_ctx.isIndeterminate),
}));
const __VLS_188 = __VLS_187({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.checkAll),
    indeterminate: (__VLS_ctx.isIndeterminate),
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
let __VLS_190;
let __VLS_191;
let __VLS_192;
const __VLS_193 = {
    onChange: (__VLS_ctx.handleCheckAllChange)
};
__VLS_189.slots.default;
(__VLS_ctx.t('datasource.select_all'));
var __VLS_189;
if (!!__VLS_ctx.keywords && !__VLS_ctx.tableListWithSearch.length) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
        ...{ style: {} },
    }));
    const __VLS_195 = __VLS_194({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_194));
}
else {
    const __VLS_197 = {}.ElCheckboxGroup;
    /** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkList),
        ...{ style: {} },
    }));
    const __VLS_199 = __VLS_198({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.checkList),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_198));
    let __VLS_201;
    let __VLS_202;
    let __VLS_203;
    const __VLS_204 = {
        onChange: (__VLS_ctx.handleCheckedTablesChange)
    };
    __VLS_200.slots.default;
    const __VLS_205 = {}.FixedSizeList;
    /** @type {[typeof __VLS_components.FixedSizeList, typeof __VLS_components.FixedSizeList, ]} */ ;
    // @ts-ignore
    const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
        itemSize: (32),
        data: (__VLS_ctx.tableListWithSearch),
        total: (__VLS_ctx.tableListWithSearch.length),
        width: (800),
        height: (460),
        scrollbarAlwaysOn: (true),
        className: "ed-select-dropdown__list",
        layout: "vertical",
    }));
    const __VLS_207 = __VLS_206({
        itemSize: (32),
        data: (__VLS_ctx.tableListWithSearch),
        total: (__VLS_ctx.tableListWithSearch.length),
        width: (800),
        height: (460),
        scrollbarAlwaysOn: (true),
        className: "ed-select-dropdown__list",
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_206));
    __VLS_208.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_208.slots;
        const [{ index, style }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "list-item_primary" },
            ...{ style: (style) },
        });
        const __VLS_209 = {}.ElCheckbox;
        /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
            label: (__VLS_ctx.tableListWithSearch[index].tableName),
        }));
        const __VLS_211 = __VLS_210({
            label: (__VLS_ctx.tableListWithSearch[index].tableName),
        }, ...__VLS_functionalComponentArgsRest(__VLS_210));
        __VLS_212.slots.default;
        const __VLS_213 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
            size: "16",
            ...{ style: {} },
        }));
        const __VLS_215 = __VLS_214({
            size: "16",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_214));
        __VLS_216.slots.default;
        const __VLS_217 = {}.icon_form_outlined;
        /** @type {[typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, typeof __VLS_components.Icon_form_outlined, typeof __VLS_components.icon_form_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({}));
        const __VLS_219 = __VLS_218({}, ...__VLS_functionalComponentArgsRest(__VLS_218));
        var __VLS_216;
        (__VLS_ctx.tableListWithSearch[index].tableName);
        var __VLS_212;
    }
    var __VLS_208;
    var __VLS_200;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "draw-foot" },
});
const __VLS_221 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_223 = __VLS_222({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
let __VLS_225;
let __VLS_226;
let __VLS_227;
const __VLS_228 = {
    onClick: (__VLS_ctx.close)
};
__VLS_224.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_224;
const __VLS_229 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_231 = __VLS_230({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
let __VLS_233;
let __VLS_234;
let __VLS_235;
const __VLS_236 = {
    onClick: (__VLS_ctx.check)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.form.type !== 'excel' && !__VLS_ctx.isDataTable) }, null, null);
__VLS_232.slots.default;
(__VLS_ctx.t('ds.check'));
var __VLS_232;
const __VLS_237 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_239 = __VLS_238({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
let __VLS_241;
let __VLS_242;
let __VLS_243;
const __VLS_244 = {
    onClick: (__VLS_ctx.preview)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeStep !== 0 && __VLS_ctx.isCreate) }, null, null);
__VLS_240.slots.default;
(__VLS_ctx.t('ds.previous'));
var __VLS_240;
const __VLS_245 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_247 = __VLS_246({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
let __VLS_249;
let __VLS_250;
let __VLS_251;
const __VLS_252 = {
    onClick: (...[$event]) => {
        __VLS_ctx.next(__VLS_ctx.dsFormRef);
    }
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeStep === 1 && __VLS_ctx.isCreate) }, null, null);
__VLS_248.slots.default;
(__VLS_ctx.t('common.next'));
var __VLS_248;
const __VLS_253 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_255 = __VLS_254({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
let __VLS_257;
let __VLS_258;
let __VLS_259;
const __VLS_260 = {
    onClick: (...[$event]) => {
        __VLS_ctx.save(__VLS_ctx.dsFormRef);
    }
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeStep === 2 || !__VLS_ctx.isCreate) }, null, null);
__VLS_256.slots.default;
(__VLS_ctx.t('common.save'));
var __VLS_256;
/** @type {__VLS_StyleScopedClasses['model-form']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content']} */ ;
/** @type {__VLS_StyleScopedClasses['pdf-card']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['size']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-user']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-user']} */ ;
/** @type {__VLS_StyleScopedClasses['not_exceed']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-label']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['required']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['select-data_table']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['select-all']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item_primary']} */ ;
/** @type {__VLS_StyleScopedClasses['draw-foot']} */ ;
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_upload_outlined: icon_upload_outlined,
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            icon_form_outlined: icon_form_outlined,
            FixedSizeList: FixedSizeList,
            Plus: Plus,
            haveSchema: haveSchema,
            EmptyBackground: EmptyBackground,
            icon_fileExcel_colorful: icon_fileExcel_colorful,
            IconOpeDelete: IconOpeDelete,
            dsFormRef: dsFormRef,
            isCreate: isCreate,
            checkList: checkList,
            tableList: tableList,
            tableListLoading: tableListLoading,
            tableListLoadingV1: tableListLoadingV1,
            checkLoading: checkLoading,
            getUploadURL: getUploadURL,
            saveLoading: saveLoading,
            uploadLoading: uploadLoading,
            t: t,
            schemaList: schemaList,
            rules: rules,
            form: form,
            close: close,
            headers: headers,
            save: save,
            check: check,
            getSchema: getSchema,
            next: next,
            preview: preview,
            beforeUpload: beforeUpload,
            onSuccess: onSuccess,
            onError: onError,
            keywords: keywords,
            tableListWithSearch: tableListWithSearch,
            fileSize: fileSize,
            clearFile: clearFile,
            checkAll: checkAll,
            isIndeterminate: isIndeterminate,
            checkTableList: checkTableList,
            handleCheckAllChange: handleCheckAllChange,
            handleCheckedTablesChange: handleCheckedTablesChange,
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
