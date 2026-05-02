import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { datasourceApi } from '@/api/datasource';
import { encrypted, decrypted } from './js/aes';
import { ElMessage } from 'element-plus-secondary';
import FixedSizeList from 'element-plus-secondary/es/components/virtual-list/src/components/fixed-size-list.mjs';
import { Plus } from '@element-plus/icons-vue';
import { useCache } from '@/utils/useCache';
import { dsType, haveSchema } from '@/views/ds/js/ds-type';
const { wsCache } = useCache();
const dsFormRef = ref();
const emit = defineEmits(['refresh']);
const active = ref(0);
const isCreate = ref(true);
const isEditTable = ref(false);
const checkList = ref([]);
const tableList = ref([]);
const excelUploadSuccess = ref(false);
const tableListLoading = ref(false);
const token = wsCache.get('user.token');
const headers = ref({ 'X-SQLBOT-TOKEN': `Bearer ${token}` });
const dialogTitle = ref('');
const getUploadURL = import.meta.env.VITE_API_BASE_URL + '/datasource/uploadExcel';
const saveLoading = ref(false);
const { t } = useI18n();
const rules = reactive({
    name: [
        { required: true, message: t('ds.form.validate.name_required'), trigger: 'blur' },
        { min: 1, max: 50, message: t('ds.form.validate.name_length'), trigger: 'blur' },
    ],
    type: [{ required: true, message: t('ds.form.validate.type_required'), trigger: 'change' }],
    host: [{ required: true, message: 'Please input host', trigger: 'blur' }],
    port: [{ required: true, message: 'Please input port', trigger: 'blur' }],
    database: [{ required: true, message: 'Please input database', trigger: 'blur' }],
    mode: [{ required: true, message: 'Please choose mode', trigger: 'change' }],
    dbSchema: [{ required: true, message: 'Please input schema', trigger: 'blur' }],
});
const dialogVisible = ref(false);
const form = ref({
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
});
const close = () => {
    dialogVisible.value = false;
    isCreate.value = true;
    active.value = 0;
    isEditTable.value = false;
    checkList.value = [];
    tableList.value = [];
    excelUploadSuccess.value = false;
    saveLoading.value = false;
};
const open = (item, editTable = false) => {
    isEditTable.value = false;
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
        }
        if (editTable) {
            dialogTitle.value = t('ds.form.choose_tables');
            active.value = 1;
            isEditTable.value = true;
            isCreate.value = false;
            // request tables and check tables
            datasourceApi.tableList(item.id).then((res) => {
                checkList.value = res.map((ele) => {
                    return ele.table_name;
                });
                if (item.type === 'excel') {
                    tableList.value = form.value.sheets;
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
                    })
                        .finally(() => {
                        tableListLoading.value = false;
                    });
                }
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
        };
    }
    dialogVisible.value = true;
};
const save = async (formEl) => {
    if (!formEl)
        return;
    await formEl.validate((valid) => {
        if (valid) {
            saveLoading.value = true;
            const list = tableList.value
                .filter((ele) => {
                return checkList.value.includes(ele.tableName);
            })
                .map((ele) => {
                return { table_name: ele.tableName, table_comment: ele.tableComment };
            });
            const requestObj = buildConf();
            if (form.value.id) {
                if (!isEditTable.value) {
                    // only update datasource config info
                    datasourceApi.update(requestObj).then(() => {
                        close();
                        emit('refresh');
                    });
                }
                else {
                    // save table and field
                    datasourceApi.chooseTables(form.value.id, list).then(() => {
                        close();
                        emit('refresh');
                    });
                }
            }
            else {
                requestObj.tables = list;
                datasourceApi.add(requestObj).then(() => {
                    close();
                    emit('refresh');
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
const next = async (formEl) => {
    if (!formEl)
        return;
    await formEl.validate((valid) => {
        if (valid) {
            if (form.value.type === 'excel') {
                // next, show tables
                if (excelUploadSuccess.value) {
                    active.value++;
                }
            }
            else {
                // check status if success do next
                const requestObj = buildConf();
                datasourceApi.check(requestObj).then((res) => {
                    if (res) {
                        active.value++;
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
                });
            }
        }
    });
};
const preview = () => {
    active.value--;
};
const beforeUpload = (rawFile) => {
    if (rawFile.size / 1024 / 1024 > 50) {
        ElMessage.error('File size can not exceed 50MB!');
        return false;
    }
    return true;
};
const onSuccess = (response) => {
    form.value.filename = response.data.filename;
    form.value.sheets = response.data.sheets;
    tableList.value = response.data.sheets;
    excelUploadSuccess.value = true;
};
const __VLS_exposed = { open };
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
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
    modalClass: "add-datasource_dialog",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "600",
    destroyOnClose: (true),
    closeOnClickModal: (false),
    modalClass: "add-datasource_dialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClosed: (__VLS_ctx.close)
};
var __VLS_8 = {};
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    (__VLS_ctx.dialogTitle);
    const __VLS_9 = {}.ElSteps;
    /** @type {[typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        active: (__VLS_ctx.active),
        alignCenter: true,
        custom: true,
        ...{ style: {} },
    }));
    const __VLS_11 = __VLS_10({
        active: (__VLS_ctx.active),
        alignCenter: true,
        custom: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.isCreate) }, null, null);
    __VLS_12.slots.default;
    const __VLS_13 = {}.ElStep;
    /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        title: (__VLS_ctx.t('ds.form.base_info')),
    }));
    const __VLS_15 = __VLS_14({
        title: (__VLS_ctx.t('ds.form.base_info')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    const __VLS_17 = {}.ElStep;
    /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        title: (__VLS_ctx.t('ds.form.choose_tables')),
    }));
    const __VLS_19 = __VLS_18({
        title: (__VLS_ctx.t('ds.form.choose_tables')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    var __VLS_12;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.active === 0) }, null, null);
const __VLS_21 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onSubmit': {} },
    ref: "dsFormRef",
    model: (__VLS_ctx.form),
    labelPosition: "top",
    labelWidth: "auto",
    rules: (__VLS_ctx.rules),
}));
const __VLS_23 = __VLS_22({
    ...{ 'onSubmit': {} },
    ref: "dsFormRef",
    model: (__VLS_ctx.form),
    labelPosition: "top",
    labelWidth: "auto",
    rules: (__VLS_ctx.rules),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.dsFormRef} */ ;
var __VLS_29 = {};
__VLS_24.slots.default;
const __VLS_31 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    label: (__VLS_ctx.t('ds.form.name')),
    prop: "name",
}));
const __VLS_33 = __VLS_32({
    label: (__VLS_ctx.t('ds.form.name')),
    prop: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
__VLS_34.slots.default;
const __VLS_35 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    modelValue: (__VLS_ctx.form.name),
    clearable: true,
}));
const __VLS_37 = __VLS_36({
    modelValue: (__VLS_ctx.form.name),
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
var __VLS_34;
const __VLS_39 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    label: (__VLS_ctx.t('ds.form.description')),
}));
const __VLS_41 = __VLS_40({
    label: (__VLS_ctx.t('ds.form.description')),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_42.slots.default;
const __VLS_43 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.form.description),
    clearable: true,
    rows: (2),
    type: "textarea",
}));
const __VLS_45 = __VLS_44({
    modelValue: (__VLS_ctx.form.description),
    clearable: true,
    rows: (2),
    type: "textarea",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
var __VLS_42;
const __VLS_47 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    label: (__VLS_ctx.t('ds.type')),
    prop: "type",
}));
const __VLS_49 = __VLS_48({
    label: (__VLS_ctx.t('ds.type')),
    prop: "type",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
__VLS_50.slots.default;
const __VLS_51 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
    modelValue: (__VLS_ctx.form.type),
    placeholder: "Select Type",
    disabled: (!__VLS_ctx.isCreate),
}));
const __VLS_53 = __VLS_52({
    modelValue: (__VLS_ctx.form.type),
    placeholder: "Select Type",
    disabled: (!__VLS_ctx.isCreate),
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
__VLS_54.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.dsType))) {
    const __VLS_55 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }));
    const __VLS_57 = __VLS_56({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
}
var __VLS_54;
var __VLS_50;
if (__VLS_ctx.form.type === 'excel') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_59 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        label: "File",
    }));
    const __VLS_61 = __VLS_60({
        label: "File",
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    __VLS_62.slots.default;
    const __VLS_63 = {}.ElUpload;
    /** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
        disabled: (!__VLS_ctx.isCreate),
        accept: ".xls, .xlsx, .csv",
        headers: (__VLS_ctx.headers),
        action: (__VLS_ctx.getUploadURL),
        beforeUpload: (__VLS_ctx.beforeUpload),
        onSuccess: (__VLS_ctx.onSuccess),
    }));
    const __VLS_65 = __VLS_64({
        disabled: (!__VLS_ctx.isCreate),
        accept: ".xls, .xlsx, .csv",
        headers: (__VLS_ctx.headers),
        action: (__VLS_ctx.getUploadURL),
        beforeUpload: (__VLS_ctx.beforeUpload),
        onSuccess: (__VLS_ctx.onSuccess),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    __VLS_66.slots.default;
    const __VLS_67 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        disabled: (!__VLS_ctx.isCreate),
    }));
    const __VLS_69 = __VLS_68({
        disabled: (!__VLS_ctx.isCreate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_70.slots.default;
    (__VLS_ctx.t('ds.form.upload.button'));
    var __VLS_70;
    {
        const { tip: __VLS_thisSlot } = __VLS_66.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "el-upload__tip" },
        });
        (__VLS_ctx.t('ds.form.upload.tip'));
    }
    var __VLS_66;
    var __VLS_62;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_71 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
        label: (__VLS_ctx.t('ds.form.host')),
        prop: "host",
    }));
    const __VLS_73 = __VLS_72({
        label: (__VLS_ctx.t('ds.form.host')),
        prop: "host",
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    __VLS_74.slots.default;
    const __VLS_75 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        modelValue: (__VLS_ctx.form.host),
        clearable: true,
    }));
    const __VLS_77 = __VLS_76({
        modelValue: (__VLS_ctx.form.host),
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    var __VLS_74;
    const __VLS_79 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
        label: (__VLS_ctx.t('ds.form.port')),
        prop: "port",
    }));
    const __VLS_81 = __VLS_80({
        label: (__VLS_ctx.t('ds.form.port')),
        prop: "port",
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    __VLS_82.slots.default;
    const __VLS_83 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        modelValue: (__VLS_ctx.form.port),
        clearable: true,
    }));
    const __VLS_85 = __VLS_84({
        modelValue: (__VLS_ctx.form.port),
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    var __VLS_82;
    const __VLS_87 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
        label: (__VLS_ctx.t('ds.form.username')),
    }));
    const __VLS_89 = __VLS_88({
        label: (__VLS_ctx.t('ds.form.username')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    __VLS_90.slots.default;
    const __VLS_91 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        modelValue: (__VLS_ctx.form.username),
        clearable: true,
    }));
    const __VLS_93 = __VLS_92({
        modelValue: (__VLS_ctx.form.username),
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    var __VLS_90;
    const __VLS_95 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
        label: (__VLS_ctx.t('ds.form.password')),
    }));
    const __VLS_97 = __VLS_96({
        label: (__VLS_ctx.t('ds.form.password')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    __VLS_98.slots.default;
    const __VLS_99 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
        modelValue: (__VLS_ctx.form.password),
        clearable: true,
        type: "password",
        showPassword: true,
    }));
    const __VLS_101 = __VLS_100({
        modelValue: (__VLS_ctx.form.password),
        clearable: true,
        type: "password",
        showPassword: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    var __VLS_98;
    const __VLS_103 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
        label: (__VLS_ctx.t('ds.form.database')),
        prop: "database",
    }));
    const __VLS_105 = __VLS_104({
        label: (__VLS_ctx.t('ds.form.database')),
        prop: "database",
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    __VLS_106.slots.default;
    const __VLS_107 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
        modelValue: (__VLS_ctx.form.database),
        clearable: true,
    }));
    const __VLS_109 = __VLS_108({
        modelValue: (__VLS_ctx.form.database),
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    var __VLS_106;
    if (__VLS_ctx.form.type === 'oracle') {
        const __VLS_111 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
            label: (__VLS_ctx.t('ds.form.connect_mode')),
            prop: "mode",
        }));
        const __VLS_113 = __VLS_112({
            label: (__VLS_ctx.t('ds.form.connect_mode')),
            prop: "mode",
        }, ...__VLS_functionalComponentArgsRest(__VLS_112));
        __VLS_114.slots.default;
        const __VLS_115 = {}.ElRadioGroup;
        /** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
        // @ts-ignore
        const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
            modelValue: (__VLS_ctx.form.mode),
        }));
        const __VLS_117 = __VLS_116({
            modelValue: (__VLS_ctx.form.mode),
        }, ...__VLS_functionalComponentArgsRest(__VLS_116));
        __VLS_118.slots.default;
        const __VLS_119 = {}.ElRadio;
        /** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
        // @ts-ignore
        const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
            value: "service_name",
        }));
        const __VLS_121 = __VLS_120({
            value: "service_name",
        }, ...__VLS_functionalComponentArgsRest(__VLS_120));
        __VLS_122.slots.default;
        (__VLS_ctx.t('ds.form.mode.service_name'));
        var __VLS_122;
        const __VLS_123 = {}.ElRadio;
        /** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
        // @ts-ignore
        const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
            value: "sid",
        }));
        const __VLS_125 = __VLS_124({
            value: "sid",
        }, ...__VLS_functionalComponentArgsRest(__VLS_124));
        __VLS_126.slots.default;
        (__VLS_ctx.t('ds.form.mode.sid'));
        var __VLS_126;
        var __VLS_118;
        var __VLS_114;
    }
    const __VLS_127 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
        label: (__VLS_ctx.t('ds.form.extra_jdbc')),
    }));
    const __VLS_129 = __VLS_128({
        label: (__VLS_ctx.t('ds.form.extra_jdbc')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    __VLS_130.slots.default;
    const __VLS_131 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
        modelValue: (__VLS_ctx.form.extraJdbc),
        clearable: true,
    }));
    const __VLS_133 = __VLS_132({
        modelValue: (__VLS_ctx.form.extraJdbc),
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    var __VLS_130;
    if (__VLS_ctx.haveSchema.includes(__VLS_ctx.form.type)) {
        const __VLS_135 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({
            label: (__VLS_ctx.t('ds.form.schema')),
            prop: "dbSchema",
        }));
        const __VLS_137 = __VLS_136({
            label: (__VLS_ctx.t('ds.form.schema')),
            prop: "dbSchema",
        }, ...__VLS_functionalComponentArgsRest(__VLS_136));
        __VLS_138.slots.default;
        const __VLS_139 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
            modelValue: (__VLS_ctx.form.dbSchema),
            clearable: true,
        }));
        const __VLS_141 = __VLS_140({
            modelValue: (__VLS_ctx.form.dbSchema),
            clearable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_140));
        if (false) {
            const __VLS_143 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
                link: true,
                type: "primary",
                icon: (__VLS_ctx.Plus),
            }));
            const __VLS_145 = __VLS_144({
                link: true,
                type: "primary",
                icon: (__VLS_ctx.Plus),
            }, ...__VLS_functionalComponentArgsRest(__VLS_144));
            __VLS_146.slots.default;
            var __VLS_146;
        }
        var __VLS_138;
    }
    const __VLS_147 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
        label: (__VLS_ctx.t('ds.form.timeout')),
        prop: "timeout",
    }));
    const __VLS_149 = __VLS_148({
        label: (__VLS_ctx.t('ds.form.timeout')),
        prop: "timeout",
    }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    __VLS_150.slots.default;
    const __VLS_151 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
        modelValue: (__VLS_ctx.form.timeout),
        clearable: true,
        min: (0),
        max: (300),
        controlsPosition: "right",
    }));
    const __VLS_153 = __VLS_152({
        modelValue: (__VLS_ctx.form.timeout),
        clearable: true,
        min: (0),
        max: (300),
        controlsPosition: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    var __VLS_150;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
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
}
var __VLS_24;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.active === 1) }, null, null);
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.tableListLoading) }, null, null);
const __VLS_155 = {}.ElCheckboxGroup;
/** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
// @ts-ignore
const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
    modelValue: (__VLS_ctx.checkList),
    ...{ style: {} },
}));
const __VLS_157 = __VLS_156({
    modelValue: (__VLS_ctx.checkList),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_156));
__VLS_158.slots.default;
const __VLS_159 = {}.FixedSizeList;
/** @type {[typeof __VLS_components.FixedSizeList, typeof __VLS_components.FixedSizeList, ]} */ ;
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
    itemSize: (40),
    data: (__VLS_ctx.tableList),
    total: (__VLS_ctx.tableList.length),
    width: (560),
    height: (400),
    scrollbarAlwaysOn: (true),
    className: "ed-select-dropdown__list",
    layout: "vertical",
}));
const __VLS_161 = __VLS_160({
    itemSize: (40),
    data: (__VLS_ctx.tableList),
    total: (__VLS_ctx.tableList.length),
    width: (560),
    height: (400),
    scrollbarAlwaysOn: (true),
    className: "ed-select-dropdown__list",
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
__VLS_162.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_162.slots;
    const [{ index, style }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "list-item_primary" },
        ...{ style: (style) },
    });
    const __VLS_163 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({
        label: (__VLS_ctx.tableList[index].tableName),
    }));
    const __VLS_165 = __VLS_164({
        label: (__VLS_ctx.tableList[index].tableName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    __VLS_166.slots.default;
    (__VLS_ctx.tableList[index].tableName);
    var __VLS_166;
}
var __VLS_162;
var __VLS_158;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('ds.form.selected', [__VLS_ctx.checkList.length, __VLS_ctx.tableList.length]));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_167 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_169 = __VLS_168({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_168));
let __VLS_171;
let __VLS_172;
let __VLS_173;
const __VLS_174 = {
    onClick: (__VLS_ctx.close)
};
__VLS_170.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_170;
const __VLS_175 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
    ...{ 'onClick': {} },
}));
const __VLS_177 = __VLS_176({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_176));
let __VLS_179;
let __VLS_180;
let __VLS_181;
const __VLS_182 = {
    onClick: (__VLS_ctx.check)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.isCreate && !__VLS_ctx.isEditTable && __VLS_ctx.form.type !== 'excel') }, null, null);
__VLS_178.slots.default;
(__VLS_ctx.t('ds.check'));
var __VLS_178;
const __VLS_183 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_185 = __VLS_184({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_184));
let __VLS_187;
let __VLS_188;
let __VLS_189;
const __VLS_190 = {
    onClick: (...[$event]) => {
        __VLS_ctx.next(__VLS_ctx.dsFormRef);
    }
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.active === 0 && __VLS_ctx.isCreate) }, null, null);
__VLS_186.slots.default;
(__VLS_ctx.t('common.next'));
var __VLS_186;
const __VLS_191 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
    ...{ 'onClick': {} },
}));
const __VLS_193 = __VLS_192({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_192));
let __VLS_195;
let __VLS_196;
let __VLS_197;
const __VLS_198 = {
    onClick: (__VLS_ctx.preview)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.active === 1 && __VLS_ctx.isCreate) }, null, null);
__VLS_194.slots.default;
(__VLS_ctx.t('ds.previous'));
var __VLS_194;
const __VLS_199 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.saveLoading),
    type: "primary",
}));
const __VLS_201 = __VLS_200({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.saveLoading),
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_200));
let __VLS_203;
let __VLS_204;
let __VLS_205;
const __VLS_206 = {
    onClick: (...[$event]) => {
        __VLS_ctx.save(__VLS_ctx.dsFormRef);
    }
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.active === 1 || !__VLS_ctx.isCreate) }, null, null);
__VLS_202.slots.default;
(__VLS_ctx.t('common.save'));
var __VLS_202;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-upload__tip']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item_primary']} */ ;
// @ts-ignore
var __VLS_30 = __VLS_29;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            FixedSizeList: FixedSizeList,
            Plus: Plus,
            dsType: dsType,
            haveSchema: haveSchema,
            dsFormRef: dsFormRef,
            active: active,
            isCreate: isCreate,
            isEditTable: isEditTable,
            checkList: checkList,
            tableList: tableList,
            tableListLoading: tableListLoading,
            headers: headers,
            dialogTitle: dialogTitle,
            getUploadURL: getUploadURL,
            saveLoading: saveLoading,
            t: t,
            rules: rules,
            dialogVisible: dialogVisible,
            form: form,
            close: close,
            save: save,
            check: check,
            next: next,
            preview: preview,
            beforeUpload: beforeUpload,
            onSuccess: onSuccess,
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
