import { computed, ref } from 'vue';
import { endsWith, startsWith } from 'lodash-es';
import { useI18n } from 'vue-i18n';
import icon_warning_filled from '@/assets/svg/icon_warning_filled.svg';
import icon_upload_outlined from '@/assets/svg/icon_upload_outlined.svg';
import icon_fileExcel_colorful from '@/assets/datasource/icon_excel.png';
import { genFileId } from 'element-plus';
import { useCache } from '@/utils/useCache.ts';
import { settingsApi } from '@/api/setting.ts';
import ccmUpload from '@/assets/svg/icon_ccm-upload_outlined.svg';
import { getLocale } from '@/utils/utils.ts';
const { t } = useI18n();
const { wsCache } = useCache();
const emits = defineEmits(['upload-finished']);
const props = defineProps();
const uploadRef = ref();
const uploadLoading = ref(false);
const token = wsCache.get('user.token');
const locale = getLocale();
const headers = ref({ 'X-SQLBOT-TOKEN': `Bearer ${token}`, 'Accept-Language': locale });
const getUploadURL = () => {
    return import.meta.env.VITE_API_BASE_URL + props.uploadPath;
};
function downloadTemplate() {
    settingsApi
        .downloadTemplate(props.templatePath)
        .then((res) => {
        const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = props.templateName;
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
const handleExceed = (files) => {
    uploadRef.value.clearFiles();
    const file = files[0];
    file.uid = genFileId();
    uploadRef.value.handleStart(file);
};
const fileList = ref([]);
const fileName = computed(() => {
    if (fileList.value.length > 0) {
        return fileList.value[0].name;
    }
    return undefined;
});
const beforeUpload = (rawFile) => {
    if (rawFile.size / 1024 / 1024 > 50) {
        ElMessage.error(t('common.not_exceed_50mb'));
        return false;
    }
    uploadLoading.value = true;
    return true;
};
const errorFileName = ref('');
function downloadErrorFile() {
    settingsApi
        .downloadError(errorFileName.value)
        .then((res) => {
        const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = errorFileName.value;
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
const infoMessage = ref('');
const hasError = ref(false);
const onSuccess = (response) => {
    uploadRef.value.clearFiles();
    fileList.value = [];
    hasError.value = false;
    infoMessage.value = '';
    emits('upload-finished');
    if (response?.data?.failed_count > 0 && response?.data?.error_excel_filename) {
        infoMessage.value = t('training.upload_failed', {
            success: response.data.success_count,
            fail: response.data.failed_count,
            fail_info: '',
        });
        errorFileName.value = response.data.error_excel_filename;
        hasError.value = true;
    }
    else {
        infoMessage.value = t('training.upload_success');
        hasError.value = false;
    }
    uploadLoading.value = false;
    close();
    showResult();
};
const onError = (err) => {
    uploadLoading.value = false;
    uploadRef.value.clearFiles();
    fileList.value = [];
    let msg = err.message;
    if (startsWith(msg, '"') && endsWith(msg, '"')) {
        msg = msg.slice(1, msg.length - 1);
    }
    errorFileName.value = '';
    infoMessage.value = msg;
    hasError.value = true;
    close();
    showResult();
};
const dialogShow = ref(false);
const resultShow = ref(false);
function showResult() {
    resultShow.value = true;
}
function closeResult() {
    resultShow.value = false;
}
function backToUpload() {
    closeResult();
    open();
}
function open() {
    dialogShow.value = true;
    errorFileName.value = '';
    fileList.value = [];
    hasError.value = false;
    infoMessage.value = '';
}
function close() {
    uploadRef.value.clearFiles();
    fileList.value = [];
    dialogShow.value = false;
}
const submitUpload = () => {
    uploadRef.value.submit();
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    secondary: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "no-margin" },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.open)
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.ccmUpload;
    /** @type {[typeof __VLS_components.CcmUpload, typeof __VLS_components.ccmUpload, typeof __VLS_components.CcmUpload, typeof __VLS_components.ccmUpload, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
(__VLS_ctx.$t('user.batch_import'));
var __VLS_3;
if (__VLS_ctx.dialogShow) {
    const __VLS_12 = {}.ElDialog;
    /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClose': {} },
        modelValue: (__VLS_ctx.dialogShow),
        title: (__VLS_ctx.t('user.batch_import')),
        width: "600px",
        modalClass: "user-import-class",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClose': {} },
        modelValue: (__VLS_ctx.dialogShow),
        title: (__VLS_ctx.t('user.batch_import')),
        width: "600px",
        modalClass: "user-import-class",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClose: (__VLS_ctx.close)
    };
    __VLS_15.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "import-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "down-template" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon-span" },
    });
    const __VLS_20 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        name: "icon_warning_filled",
    }));
    const __VLS_26 = __VLS_25({
        name: "icon_warning_filled",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    const __VLS_28 = {}.icon_warning_filled;
    /** @type {[typeof __VLS_components.Icon_warning_filled, typeof __VLS_components.icon_warning_filled, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ class: "svg-icon" },
    }));
    const __VLS_30 = __VLS_29({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    var __VLS_27;
    var __VLS_23;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "down-template-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('common.upload_hint_first'));
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
        ...{ class: "down-button" },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
        ...{ class: "down-button" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.downloadTemplate)
    };
    __VLS_35.slots.default;
    (__VLS_ctx.t('common.upload_hint_download_template'));
    var __VLS_35;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('common.upload_hint_end'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_40 = {}.ElUpload;
    /** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ref: "uploadRef",
        fileList: (__VLS_ctx.fileList),
        ...{ style: {} },
        multiple: (false),
        accept: ".xlsx,.xls",
        action: (__VLS_ctx.getUploadURL()),
        beforeUpload: (__VLS_ctx.beforeUpload),
        headers: (__VLS_ctx.headers),
        onSuccess: (__VLS_ctx.onSuccess),
        onError: (__VLS_ctx.onError),
        showFileList: (false),
        autoUpload: (false),
        limit: (1),
        onExceed: (__VLS_ctx.handleExceed),
    }));
    const __VLS_42 = __VLS_41({
        ref: "uploadRef",
        fileList: (__VLS_ctx.fileList),
        ...{ style: {} },
        multiple: (false),
        accept: ".xlsx,.xls",
        action: (__VLS_ctx.getUploadURL()),
        beforeUpload: (__VLS_ctx.beforeUpload),
        headers: (__VLS_ctx.headers),
        onSuccess: (__VLS_ctx.onSuccess),
        onError: (__VLS_ctx.onError),
        showFileList: (false),
        autoUpload: (false),
        limit: (1),
        onExceed: (__VLS_ctx.handleExceed),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    /** @type {typeof __VLS_ctx.uploadRef} */ ;
    var __VLS_44 = {};
    __VLS_43.slots.default;
    const __VLS_46 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
        modelValue: (__VLS_ctx.fileName),
        ...{ style: {} },
        placeholder: (__VLS_ctx.t('common.click_to_select_file')),
        readonly: true,
    }));
    const __VLS_48 = __VLS_47({
        modelValue: (__VLS_ctx.fileName),
        ...{ style: {} },
        placeholder: (__VLS_ctx.t('common.click_to_select_file')),
        readonly: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_49.slots.default;
    {
        const { suffix: __VLS_thisSlot } = __VLS_49.slots;
        const __VLS_50 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({}));
        const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
        __VLS_53.slots.default;
        const __VLS_54 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
            name: "icon_upload_outlined",
        }));
        const __VLS_56 = __VLS_55({
            name: "icon_upload_outlined",
        }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        __VLS_57.slots.default;
        const __VLS_58 = {}.icon_upload_outlined;
        /** @type {[typeof __VLS_components.Icon_upload_outlined, typeof __VLS_components.icon_upload_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
            ...{ class: "svg-icon" },
        }));
        const __VLS_60 = __VLS_59({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        var __VLS_57;
        var __VLS_53;
    }
    {
        const { prefix: __VLS_thisSlot } = __VLS_49.slots;
        if (!!__VLS_ctx.fileName) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (__VLS_ctx.icon_fileExcel_colorful),
                width: "16px",
                height: "16px",
            });
        }
    }
    var __VLS_49;
    var __VLS_43;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_62 = {}.ElLink;
    /** @type {[typeof __VLS_components.ElLink, typeof __VLS_components.elLink, typeof __VLS_components.ElLink, typeof __VLS_components.elLink, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        ...{ class: "font12" },
        type: "info",
        disabled: true,
    }));
    const __VLS_64 = __VLS_63({
        ...{ class: "font12" },
        type: "info",
        disabled: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_65.slots.default;
    (__VLS_ctx.t('common.excel_file_type_limit'));
    var __VLS_65;
    {
        const { footer: __VLS_thisSlot } = __VLS_15.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "dialog-footer" },
        });
        const __VLS_66 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
            ...{ 'onClick': {} },
        }));
        const __VLS_68 = __VLS_67({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        let __VLS_70;
        let __VLS_71;
        let __VLS_72;
        const __VLS_73 = {
            onClick: (__VLS_ctx.close)
        };
        __VLS_69.slots.default;
        (__VLS_ctx.t('common.cancel'));
        var __VLS_69;
        const __VLS_74 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
            ...{ 'onClick': {} },
            type: (__VLS_ctx.fileName ? 'primary' : 'info'),
            disabled: (!__VLS_ctx.fileName),
        }));
        const __VLS_76 = __VLS_75({
            ...{ 'onClick': {} },
            type: (__VLS_ctx.fileName ? 'primary' : 'info'),
            disabled: (!__VLS_ctx.fileName),
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        let __VLS_78;
        let __VLS_79;
        let __VLS_80;
        const __VLS_81 = {
            onClick: (__VLS_ctx.submitUpload)
        };
        __VLS_77.slots.default;
        (__VLS_ctx.t('user.import'));
        var __VLS_77;
    }
    var __VLS_15;
}
if (__VLS_ctx.resultShow) {
    const __VLS_82 = {}.ElDialog;
    /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        ...{ 'onClose': {} },
        modelValue: (__VLS_ctx.resultShow),
        title: (__VLS_ctx.hasError ? __VLS_ctx.t('user.data_import_failed') : __VLS_ctx.t('user.data_import_completed')),
        width: "600px",
        ...{ class: "user-import-class" },
    }));
    const __VLS_84 = __VLS_83({
        ...{ 'onClose': {} },
        modelValue: (__VLS_ctx.resultShow),
        title: (__VLS_ctx.hasError ? __VLS_ctx.t('user.data_import_failed') : __VLS_ctx.t('user.data_import_completed')),
        width: "600px",
        ...{ class: "user-import-class" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    let __VLS_86;
    let __VLS_87;
    let __VLS_88;
    const __VLS_89 = {
        onClose: (__VLS_ctx.closeResult)
    };
    __VLS_85.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "down-template-content" },
    });
    (__VLS_ctx.infoMessage);
    if (__VLS_ctx.hasError && __VLS_ctx.errorFileName.length > 0) {
        const __VLS_90 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
            ...{ 'onClick': {} },
            type: "primary",
            link: true,
            ...{ class: "down-button" },
        }));
        const __VLS_92 = __VLS_91({
            ...{ 'onClick': {} },
            type: "primary",
            link: true,
            ...{ class: "down-button" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        let __VLS_94;
        let __VLS_95;
        let __VLS_96;
        const __VLS_97 = {
            onClick: (__VLS_ctx.downloadErrorFile)
        };
        __VLS_93.slots.default;
        (__VLS_ctx.errorFileName);
        var __VLS_93;
    }
    {
        const { footer: __VLS_thisSlot } = __VLS_85.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "dialog-footer" },
        });
        const __VLS_98 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
            ...{ 'onClick': {} },
        }));
        const __VLS_100 = __VLS_99({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        let __VLS_102;
        let __VLS_103;
        let __VLS_104;
        const __VLS_105 = {
            onClick: (__VLS_ctx.closeResult)
        };
        __VLS_101.slots.default;
        (__VLS_ctx.t('common.cancel'));
        var __VLS_101;
        const __VLS_106 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_108 = __VLS_107({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_107));
        let __VLS_110;
        let __VLS_111;
        let __VLS_112;
        const __VLS_113 = {
            onClick: (__VLS_ctx.backToUpload)
        };
        __VLS_109.slots.default;
        (__VLS_ctx.t('common.continue_to_upload'));
        var __VLS_109;
    }
    var __VLS_85;
}
/** @type {__VLS_StyleScopedClasses['no-margin']} */ ;
/** @type {__VLS_StyleScopedClasses['import-container']} */ ;
/** @type {__VLS_StyleScopedClasses['down-template']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-span']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['down-template-content']} */ ;
/** @type {__VLS_StyleScopedClasses['down-button']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['font12']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['user-import-class']} */ ;
/** @type {__VLS_StyleScopedClasses['down-template-content']} */ ;
/** @type {__VLS_StyleScopedClasses['down-button']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_45 = __VLS_44;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_warning_filled: icon_warning_filled,
            icon_upload_outlined: icon_upload_outlined,
            icon_fileExcel_colorful: icon_fileExcel_colorful,
            ccmUpload: ccmUpload,
            t: t,
            uploadRef: uploadRef,
            headers: headers,
            getUploadURL: getUploadURL,
            downloadTemplate: downloadTemplate,
            handleExceed: handleExceed,
            fileList: fileList,
            fileName: fileName,
            beforeUpload: beforeUpload,
            errorFileName: errorFileName,
            downloadErrorFile: downloadErrorFile,
            infoMessage: infoMessage,
            hasError: hasError,
            onSuccess: onSuccess,
            onError: onError,
            dialogShow: dialogShow,
            resultShow: resultShow,
            closeResult: closeResult,
            backToUpload: backToUpload,
            open: open,
            close: close,
            submitUpload: submitUpload,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
