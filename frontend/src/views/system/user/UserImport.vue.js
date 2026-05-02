import icon_warning_filled from '@/assets/svg/icon_info_colorful.svg';
import icon_upload_outlined from '@/assets/svg/icon_upload_outlined.svg';
import icon_fileExcel_colorful from '@/assets/datasource/icon_excel.png';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import { ref, reactive, h } from 'vue';
import { ElMessage, ElMessageBox, ElLoading, ElButton, } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
import { userImportApi } from '@/api/user';
const { t } = useI18n();
const defaultTip = t('user.xls_format_files');
const loadingInstance = ref(null);
const dialogShow = ref(false);
const form = ref({});
const file = ref(null);
const fileName = ref('');
const errorFileKey = ref(null);
const emits = defineEmits(['refresh-grid']);
const state = reactive({
    errList: [],
    filesTmp: [],
});
const showLoading = () => {
    loadingInstance.value = ElLoading.service({ target: '.user-import-class' });
};
const closeLoading = () => {
    loadingInstance.value?.close();
};
const showDialog = () => {
    file.value = null;
    fileName.value = '';
    errorFileKey.value = null;
    dialogShow.value = true;
};
const closeDialog = () => {
    dialogShow.value = false;
};
const handleExceed = () => {
    ElMessage.warning(t('userimport.exceedMsg'));
};
const handleError = () => {
    ElMessage.warning(t('user.contact_the_administrator'));
};
const uploadValidate = (file) => {
    const suffix = file.name.substring(file.name.lastIndexOf('.') + 1);
    if (suffix !== 'xlsx' && suffix !== 'xls') {
        ElMessage.warning(t('userimport.suffixMsg'));
        return false;
    }
    if (file.size / 1024 / 1024 > 10) {
        ElMessage.warning(t('userimport.limitMsg'));
        return false;
    }
    state.errList = [];
    return true;
};
const fileSize = ref('-');
const setFile = (options) => {
    file.value = options.file;
    fileName.value = options.file.name;
    fileSize.value = setSize(options.file.size);
};
const buildFormData = (file, files, param) => {
    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    }
    if (files) {
        files.forEach((f) => {
            formData.append('files', f);
        });
    }
    if (param) {
        formData.append('request', new Blob([JSON.stringify(param)], { type: 'application/json' }));
    }
    return formData;
};
const downExcel = () => {
    showLoading();
    userImportApi
        .downExcelTemplateApi()
        .then((res) => {
        const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.download = 'user.xlsx'; // 下载的文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        closeLoading();
    })
        .catch(() => {
        closeLoading();
    });
};
const setSize = (size) => {
    let data = '';
    const _size = Number.parseFloat(size);
    if (_size < 1 * 1024) {
        //如果小于0.1KB转化成B
        data = _size.toFixed(2) + 'B';
    }
    else if (_size < 1 * 1024 * 1024) {
        //如果小于0.1MB转化成KB
        data = (_size / 1024).toFixed(2) + 'KB';
    }
    else if (_size < 1 * 1024 * 1024 * 1024) {
        //如果小于0.1GB转化成MB
        data = (_size / (1024 * 1024)).toFixed(2) + 'MB';
    }
    else {
        //其他转化成GB
        data = (_size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
    const size_str = data + '';
    const len = size_str.indexOf('.');
    const dec = size_str.substr(len + 1, 2);
    if (dec == '00') {
        //当小数点后为00时 去掉小数部分
        return size_str.substring(0, len) + size_str.substr(len + 3, 2);
    }
    return size_str;
};
const toGrid = () => {
    file.value = null;
    fileName.value = '';
    dialogShow.value = false;
    emits('refresh-grid');
};
const clearFile = () => {
    file.value = null;
    fileName.value = '';
};
const sure = () => {
    const param = buildFormData(file.value, null, null);
    showLoading();
    userImportApi
        .importUserApi(param)
        .then((res) => {
        closeLoading();
        const data = res;
        errorFileKey.value = data.dataKey;
        closeDialog();
        showTips(data.successCount, data.errorCount);
    })
        .catch(() => {
        closeLoading();
    });
};
const downErrorExcel = () => {
    if (errorFileKey.value) {
        showLoading();
        userImportApi
            .downErrorRecordApi(errorFileKey.value)
            .then((res) => {
            const blob = new Blob([res], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = URL.createObjectURL(blob);
            link.download = 'error.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            closeLoading();
            // closeDialog()
        })
            .catch(() => {
            closeLoading();
        });
    }
};
const showTips = (successCount, errorCount) => {
    let title = successCount ? t('user.data_import_completed') : t('user.data_import_failed');
    const childrenDomList = [
        h('strong', null, title),
        h('br', {}, {}),
        h('span', null, t('user.imported_100_data', { msg: successCount })),
    ];
    if (errorCount) {
        const errorCountDom = h('span', null, t('user.failed_100_can', { msg: errorCount }));
        const errorDom = h('div', { class: 'error-record-tip flex-align-center' }, [
            /* h('span', null, t('user.can')), */
            h(ElButton, {
                onClick: downErrorExcel,
                type: 'primary',
                text: true,
                class: 'down-button',
            }, t('user.download_error_report')),
            h('span', null, t('user.modify_and_re_import')),
        ]);
        childrenDomList.push(errorCountDom);
        childrenDomList.push(errorDom);
    }
    ElMessageBox.confirm('', {
        confirmButtonType: 'primary',
        type: !errorCount ? 'success' : successCount ? 'warning' : 'error',
        autofocus: false,
        dangerouslyUseHTMLString: true,
        message: h('div', { class: 'import-tip-box' }, childrenDomList),
        showClose: false,
        cancelButtonText: t('user.return_to_view'),
        confirmButtonText: t('user.continue_importing'),
    })
        .then(() => {
        // clearErrorRecord()
        showDialog();
        emits('refresh-grid');
    })
        .catch(() => {
        // clearErrorRecord()
        toGrid();
    });
};
/* const clearErrorRecord = () => {
  if (errorFileKey.value) {
    userImportApi.clearErrorApi(errorFileKey.value)
  }
} */
const rules = {
    file: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('user.file'),
            trigger: 'blur',
        },
    ],
};
const __VLS_exposed = {
    showDialog,
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
    ...{ 'onBeforeClose': {} },
    modelValue: (__VLS_ctx.dialogShow),
    title: (__VLS_ctx.t('user.batch_import')),
    width: "600px",
    modalClass: "user-import-class",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBeforeClose': {} },
    modelValue: (__VLS_ctx.dialogShow),
    title: (__VLS_ctx.t('user.batch_import')),
    width: "600px",
    modalClass: "user-import-class",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBeforeClose: (__VLS_ctx.closeDialog)
};
var __VLS_8 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "down-template" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-span" },
});
const __VLS_9 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.Icon;
/** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    name: "icon_warning_filled",
}));
const __VLS_15 = __VLS_14({
    name: "icon_warning_filled",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.icon_warning_filled;
/** @type {[typeof __VLS_components.Icon_warning_filled, typeof __VLS_components.icon_warning_filled, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ class: "svg-icon" },
}));
const __VLS_19 = __VLS_18({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
var __VLS_16;
var __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "down-template-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('user.please_first'));
const __VLS_21 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onClick': {} },
    type: "primary",
    text: true,
    ...{ class: "down-button" },
}));
const __VLS_23 = __VLS_22({
    ...{ 'onClick': {} },
    type: "primary",
    text: true,
    ...{ class: "down-button" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onClick: (__VLS_ctx.downExcel)
};
__VLS_24.slots.default;
(__VLS_ctx.t('user.download_the_template'));
var __VLS_24;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('user.required_and_upload'));
const __VLS_29 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onSubmit': {} },
    ref: "form",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error import-form" },
    model: (__VLS_ctx.form),
    labelWidth: "0px",
}));
const __VLS_31 = __VLS_30({
    ...{ 'onSubmit': {} },
    ref: "form",
    labelPosition: "top",
    rules: (__VLS_ctx.rules),
    ...{ class: "form-content_error import-form" },
    model: (__VLS_ctx.form),
    labelWidth: "0px",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.form} */ ;
var __VLS_37 = {};
__VLS_32.slots.default;
const __VLS_39 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    prop: "file",
    label: (__VLS_ctx.t('user.file')),
    ...{ style: {} },
}));
const __VLS_41 = __VLS_40({
    prop: "file",
    label: (__VLS_ctx.t('user.file')),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_42.slots.default;
if (__VLS_ctx.fileName) {
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
    (__VLS_ctx.fileName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "size" },
    });
    (__VLS_ctx.fileName.split('.')[1]);
    (__VLS_ctx.fileSize);
    const __VLS_43 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_47;
    let __VLS_48;
    let __VLS_49;
    const __VLS_50 = {
        onClick: (__VLS_ctx.clearFile)
    };
    __VLS_46.slots.default;
    const __VLS_51 = {}.IconOpeDelete;
    /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({}));
    const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
    var __VLS_46;
}
if (__VLS_ctx.fileName) {
    const __VLS_55 = {}.ElUpload;
    /** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
        ...{ class: "upload-user" },
        action: "",
        accept: ".xlsx,.xls",
        onExceed: (__VLS_ctx.handleExceed),
        beforeUpload: (__VLS_ctx.uploadValidate),
        onError: (__VLS_ctx.handleError),
        showFileList: (false),
        fileList: (__VLS_ctx.state.filesTmp),
        httpRequest: (__VLS_ctx.setFile),
    }));
    const __VLS_57 = __VLS_56({
        ...{ class: "upload-user" },
        action: "",
        accept: ".xlsx,.xls",
        onExceed: (__VLS_ctx.handleExceed),
        beforeUpload: (__VLS_ctx.uploadValidate),
        onError: (__VLS_ctx.handleError),
        showFileList: (false),
        fileList: (__VLS_ctx.state.filesTmp),
        httpRequest: (__VLS_ctx.setFile),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_58.slots.default;
    const __VLS_59 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        text: true,
        ...{ style: {} },
    }));
    const __VLS_61 = __VLS_60({
        text: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    __VLS_62.slots.default;
    (__VLS_ctx.$t('user.change_file'));
    var __VLS_62;
    var __VLS_58;
}
else {
    const __VLS_63 = {}.ElUpload;
    /** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
        ...{ class: "upload-user" },
        action: "",
        accept: ".xlsx,.xls",
        onExceed: (__VLS_ctx.handleExceed),
        beforeUpload: (__VLS_ctx.uploadValidate),
        onError: (__VLS_ctx.handleError),
        showFileList: (false),
        fileList: (__VLS_ctx.state.filesTmp),
        httpRequest: (__VLS_ctx.setFile),
    }));
    const __VLS_65 = __VLS_64({
        ...{ class: "upload-user" },
        action: "",
        accept: ".xlsx,.xls",
        onExceed: (__VLS_ctx.handleExceed),
        beforeUpload: (__VLS_ctx.uploadValidate),
        onError: (__VLS_ctx.handleError),
        showFileList: (false),
        fileList: (__VLS_ctx.state.filesTmp),
        httpRequest: (__VLS_ctx.setFile),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    __VLS_66.slots.default;
    const __VLS_67 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        secondary: true,
    }));
    const __VLS_69 = __VLS_68({
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_70.slots.default;
    const __VLS_71 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
        size: "16",
        ...{ style: {} },
    }));
    const __VLS_73 = __VLS_72({
        size: "16",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    __VLS_74.slots.default;
    const __VLS_75 = {}.icon_upload_outlined;
    /** @type {[typeof __VLS_components.Icon_upload_outlined, typeof __VLS_components.icon_upload_outlined, typeof __VLS_components.Icon_upload_outlined, typeof __VLS_components.icon_upload_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({}));
    const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
    var __VLS_74;
    (__VLS_ctx.t('user.upload_file'));
    var __VLS_70;
    var __VLS_66;
}
if (!__VLS_ctx.fileName) {
    const __VLS_79 = {}.ElLink;
    /** @type {[typeof __VLS_components.ElLink, typeof __VLS_components.elLink, typeof __VLS_components.ElLink, typeof __VLS_components.elLink, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
        ...{ style: {} },
        ...{ class: "font12" },
        type: "info",
        disabled: true,
    }));
    const __VLS_81 = __VLS_80({
        ...{ style: {} },
        ...{ class: "font12" },
        type: "info",
        disabled: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    __VLS_82.slots.default;
    (__VLS_ctx.defaultTip);
    var __VLS_82;
}
var __VLS_42;
var __VLS_32;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_83 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_85 = __VLS_84({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    let __VLS_87;
    let __VLS_88;
    let __VLS_89;
    const __VLS_90 = {
        onClick: (__VLS_ctx.closeDialog)
    };
    __VLS_86.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_86;
    const __VLS_91 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.file && __VLS_ctx.fileName ? 'primary' : 'info'),
        disabled: (!__VLS_ctx.file || !__VLS_ctx.fileName),
    }));
    const __VLS_93 = __VLS_92({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.file && __VLS_ctx.fileName ? 'primary' : 'info'),
        disabled: (!__VLS_ctx.file || !__VLS_ctx.fileName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    let __VLS_95;
    let __VLS_96;
    let __VLS_97;
    const __VLS_98 = {
        onClick: (__VLS_ctx.sure)
    };
    __VLS_94.slots.default;
    (__VLS_ctx.t('user.import'));
    var __VLS_94;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['down-template']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-span']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['down-template-content']} */ ;
/** @type {__VLS_StyleScopedClasses['down-button']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['import-form']} */ ;
/** @type {__VLS_StyleScopedClasses['pdf-card']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['size']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-user']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-user']} */ ;
/** @type {__VLS_StyleScopedClasses['font12']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_38 = __VLS_37;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_warning_filled: icon_warning_filled,
            icon_upload_outlined: icon_upload_outlined,
            icon_fileExcel_colorful: icon_fileExcel_colorful,
            IconOpeDelete: IconOpeDelete,
            ElButton: ElButton,
            t: t,
            defaultTip: defaultTip,
            dialogShow: dialogShow,
            form: form,
            file: file,
            fileName: fileName,
            state: state,
            closeDialog: closeDialog,
            handleExceed: handleExceed,
            handleError: handleError,
            uploadValidate: uploadValidate,
            fileSize: fileSize,
            setFile: setFile,
            downExcel: downExcel,
            clearFile: clearFile,
            sure: sure,
            rules: rules,
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
