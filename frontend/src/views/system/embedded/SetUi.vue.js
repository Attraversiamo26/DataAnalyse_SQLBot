import Assistant from '@/views/embedded/AssistantPreview.vue';
import { ref, unref, reactive, nextTick } from 'vue';
import { ElMessage } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
import { request } from '@/utils/request';
import { setCurrentColor } from '@/utils/utils';
import { cloneDeep } from 'lodash-es';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
const { t } = useI18n();
const appearanceStore = useAppearanceStoreWithOut();
const currentId = ref();
const optionsY = [
    {
        label: t('embedded.up'),
        value: 'top',
    },
    {
        label: t('embedded.down'),
        value: 'bottom',
    },
];
const optionsX = [
    {
        label: t('embedded.left'),
        value: 'left',
    },
    {
        label: t('embedded.right'),
        value: 'right',
    },
];
const COLOR_PANEL = [
    '#FF4500',
    '#FF8C00',
    '#FFD700',
    '#71AE46',
    '#00CED1',
    '#1E90FF',
    '#C71585',
    '#999999',
    '#000000',
    '#FFFFFF',
];
const fileList = ref([]);
const dialogVisible = ref(false);
const logo = ref('');
const floatIcon = ref('');
const defaultSqlBotForm = reactive({
    x_type: 'right',
    y_type: 'bottom',
    x_val: 30,
    y_val: 30,
    float_icon_drag: false,
    welcome: t('embedded.i_am_sqlbot'),
    welcome_desc: t('embedded.data_analysis_now'),
    theme: '#1CBA90',
    header_font_color: '#1F2329',
    logo: '',
    float_icon: '',
});
const sqlBotForm = reactive(cloneDeep(defaultSqlBotForm));
let rawData = {};
const init = () => {
    Object.assign(sqlBotForm, cloneDeep(defaultSqlBotForm));
    fileList.value = [];
    logo.value = rawData.logo;
    floatIcon.value = rawData.float_icon;
    for (const key in sqlBotForm) {
        if (Object.prototype.hasOwnProperty.call(sqlBotForm, key) &&
            ![null, undefined].includes(rawData[key])) {
            sqlBotForm[key] = rawData[key];
        }
    }
    if (!rawData.theme) {
        const { customColor, themeColor } = appearanceStore;
        const currentColor = themeColor === 'custom' && customColor
            ? customColor
            : themeColor === 'blue'
                ? '#3370ff'
                : '#1CBA90';
        sqlBotForm.theme = currentColor || sqlBotForm.theme;
    }
    nextTick(() => {
        setPageCustomColor(sqlBotForm.theme);
        setPageHeaderFontColor(sqlBotForm.header_font_color);
    });
};
const giveUp = () => {
    resetSqlBotForm(false);
    init();
    dialogVisible.value = false;
};
const emits = defineEmits(['refresh']);
const saveHandler = () => {
    const param = buildParam();
    const url = '/system/assistant/ui';
    request
        .patch(url, param, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
        .then(() => {
        ElMessage.success(t('system.setting_successfully'));
        dialogVisible.value = false;
        emits('refresh');
    });
};
const buildParam = () => {
    const formData = new FormData();
    if (fileList.value.length) {
        fileList.value.forEach((file) => {
            const name = file.name + ',' + file['flag'];
            const fileArray = [file];
            const newfile = new File(fileArray, name, { type: file['type'] });
            formData.append('files', newfile);
        });
    }
    formData.append('data', JSON.stringify({ ...unref(sqlBotForm), id: currentId.value }));
    return formData;
};
const headerFontColorChange = (val) => {
    setPageHeaderFontColor(val);
};
const customColorChange = (val) => {
    setPageCustomColor(val);
};
const setPageCustomColor = (val) => {
    const ele = document.querySelector('.left-preview');
    setCurrentColor(val, ele);
};
const setPageHeaderFontColor = (val) => {
    const ele = document.getElementsByClassName('left-preview')[0];
    ele.style.setProperty('--ed-text-color-primary', val);
};
const resetSqlBotForm = (reset2Default) => {
    Object.assign(sqlBotForm, cloneDeep(defaultSqlBotForm));
    clearFiles(['logo', 'float_icon']);
    if (reset2Default) {
        logo.value = '';
        floatIcon.value = '';
        sqlBotForm.restoreDefaults = true;
        nextTick(() => {
            setPageCustomColor(sqlBotForm.theme);
            setPageHeaderFontColor(sqlBotForm.header_font_color);
        });
    }
};
const uploadImg = (options) => {
    const file = options.file;
    if (file['flag'] === 'logo') {
        logo.value = URL.createObjectURL(file);
    }
    else if (file['flag'] === 'float_icon') {
        floatIcon.value = URL.createObjectURL(file);
    }
};
const beforeUpload = (file, type) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        ElMessage.error(t('common.file_size_limit_error', { limit: '10M' }));
        return false;
    }
    let len = fileList.value?.length;
    let match = false;
    file.flag = type;
    while (len--) {
        const tfile = fileList.value[len];
        if (type == tfile['flag']) {
            fileList.value[len] = file;
            match = true;
        }
    }
    if (!match) {
        fileList.value?.push(file);
    }
    return true;
};
const clearFiles = (array) => {
    if (!array?.length || !fileList.value?.length) {
        fileList.value = [];
        return;
    }
    let len = fileList.value.length;
    while (len--) {
        const file = fileList.value[len];
        if (array.includes(file['flag'])) {
            fileList.value.splice(len, 1);
        }
    }
};
const appName = ref('');
const open = (row) => {
    rawData = JSON.parse(row.configuration);
    currentId.value = row.id;
    appName.value = row.name;
    dialogVisible.value = true;
    init();
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
const __VLS_0 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.$t('embedded.display_settings')),
    width: "1000",
    modalClass: "embed-third_party_ui",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.$t('embedded.display_settings')),
    width: "1000",
    modalClass: "embed-third_party_ui",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ui-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "left-preview" },
});
/** @type {[typeof Assistant, typeof Assistant, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(Assistant, new Assistant({
    welcomeDesc: (__VLS_ctx.sqlBotForm.welcome_desc),
    welcome: (__VLS_ctx.sqlBotForm.welcome),
    name: (__VLS_ctx.appName),
    logo: (__VLS_ctx.logo),
}));
const __VLS_6 = __VLS_5({
    welcomeDesc: (__VLS_ctx.sqlBotForm.welcome_desc),
    welcome: (__VLS_ctx.sqlBotForm.welcome),
    name: (__VLS_ctx.appName),
    logo: (__VLS_ctx.logo),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "right-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "theme" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "theme-bg" },
});
(__VLS_ctx.$t('system.customize_theme_color'));
const __VLS_8 = {}.ElColorPicker;
/** @type {[typeof __VLS_components.ElColorPicker, typeof __VLS_components.elColorPicker, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sqlBotForm.theme),
    triggerWidth: (28),
    predefine: (__VLS_ctx.COLOR_PANEL),
    isCustom: true,
    effect: "light",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sqlBotForm.theme),
    triggerWidth: (28),
    predefine: (__VLS_ctx.COLOR_PANEL),
    isCustom: true,
    effect: "light",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onChange: (__VLS_ctx.customColorChange)
};
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "theme" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "theme-bg" },
});
(__VLS_ctx.$t('embedded.header_text_color'));
const __VLS_16 = {}.ElColorPicker;
/** @type {[typeof __VLS_components.ElColorPicker, typeof __VLS_components.elColorPicker, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sqlBotForm.header_font_color),
    triggerWidth: (28),
    predefine: (__VLS_ctx.COLOR_PANEL),
    isCustom: true,
    effect: "light",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sqlBotForm.header_font_color),
    triggerWidth: (28),
    predefine: (__VLS_ctx.COLOR_PANEL),
    isCustom: true,
    effect: "light",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onChange: (__VLS_ctx.headerFontColorChange)
};
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-item" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "logo" },
});
(__VLS_ctx.$t('embedded.app_logo'));
const __VLS_24 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    name: "logo",
    showFileList: (false),
    accept: ".jpg,.png,.gif,.svg",
    beforeUpload: ((e) => __VLS_ctx.beforeUpload(e, 'logo')),
    httpRequest: (__VLS_ctx.uploadImg),
}));
const __VLS_26 = __VLS_25({
    name: "logo",
    showFileList: (false),
    accept: ".jpg,.png,.gif,.svg",
    beforeUpload: ((e) => __VLS_ctx.beforeUpload(e, 'logo')),
    httpRequest: (__VLS_ctx.uploadImg),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    secondary: true,
}));
const __VLS_30 = __VLS_29({
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
(__VLS_ctx.t('embedded.replace'));
var __VLS_31;
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tips" },
});
(__VLS_ctx.$t('embedded.maximum_size_10mb'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-item float-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "logo" },
});
(__VLS_ctx.$t('embedded.window_entrance_icon'));
const __VLS_32 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    name: "float_icon",
    showFileList: (false),
    accept: ".jpg,.png,.gif,.svg",
    beforeUpload: ((e) => __VLS_ctx.beforeUpload(e, 'float_icon')),
    httpRequest: (__VLS_ctx.uploadImg),
}));
const __VLS_34 = __VLS_33({
    name: "float_icon",
    showFileList: (false),
    accept: ".jpg,.png,.gif,.svg",
    beforeUpload: ((e) => __VLS_ctx.beforeUpload(e, 'float_icon')),
    httpRequest: (__VLS_ctx.uploadImg),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    secondary: true,
}));
const __VLS_38 = __VLS_37({
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
(__VLS_ctx.t('embedded.replace'));
var __VLS_39;
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tips" },
});
(__VLS_ctx.$t('embedded.maximum_size_10mb'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "position-set" },
});
(__VLS_ctx.$t('embedded.default_icon_position'));
const __VLS_40 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.sqlBotForm.float_icon_drag),
    label: (__VLS_ctx.$t('embedded.draggable_position')),
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.sqlBotForm.float_icon_drag),
    label: (__VLS_ctx.$t('embedded.draggable_position')),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "position-set_input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "x" },
});
const __VLS_44 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.sqlBotForm.x_val),
    stepStrictly: true,
    min: (0),
    controlsPosition: "right",
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.sqlBotForm.x_val),
    stepStrictly: true,
    min: (0),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_47.slots;
    const __VLS_48 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        modelValue: (__VLS_ctx.sqlBotForm.x_type),
        ...{ style: {} },
    }));
    const __VLS_50 = __VLS_49({
        modelValue: (__VLS_ctx.sqlBotForm.x_type),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.optionsX))) {
        const __VLS_52 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            key: (item.value),
            label: (item.label),
            value: (item.value),
        }));
        const __VLS_54 = __VLS_53({
            key: (item.value),
            label: (item.label),
            value: (item.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    }
    var __VLS_51;
}
var __VLS_47;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "y" },
});
const __VLS_56 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.sqlBotForm.y_val),
    stepStrictly: true,
    min: (0),
    controlsPosition: "right",
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.sqlBotForm.y_val),
    stepStrictly: true,
    min: (0),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_59.slots;
    const __VLS_60 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        modelValue: (__VLS_ctx.sqlBotForm.y_type),
        ...{ style: {} },
    }));
    const __VLS_62 = __VLS_61({
        modelValue: (__VLS_ctx.sqlBotForm.y_type),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.optionsY))) {
        const __VLS_64 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            key: (item.value),
            label: (item.label),
            value: (item.value),
        }));
        const __VLS_66 = __VLS_65({
            key: (item.value),
            label: (item.label),
            value: (item.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    }
    var __VLS_63;
}
var __VLS_59;
const __VLS_68 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    labelPosition: "top",
    requireAsteriskPosition: "right",
    labelWidth: "120px",
    ...{ class: "page-Form" },
}));
const __VLS_70 = __VLS_69({
    labelPosition: "top",
    requireAsteriskPosition: "right",
    labelWidth: "120px",
    ...{ class: "page-Form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    label: (__VLS_ctx.$t('system.welcome_message')),
}));
const __VLS_74 = __VLS_73({
    label: (__VLS_ctx.$t('system.welcome_message')),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.sqlBotForm.welcome),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('system.welcome_message')),
    maxlength: "50",
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.sqlBotForm.welcome),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('system.welcome_message')),
    maxlength: "50",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
var __VLS_75;
const __VLS_80 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: (__VLS_ctx.$t('embedded.welcome_description')),
}));
const __VLS_82 = __VLS_81({
    label: (__VLS_ctx.$t('embedded.welcome_description')),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.sqlBotForm.welcome_desc),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.welcome_description')),
    type: "textarea",
    showWordLimit: true,
    maxlength: "200",
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.sqlBotForm.welcome_desc),
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.welcome_description')),
    type: "textarea",
    showWordLimit: true,
    maxlength: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
var __VLS_83;
var __VLS_71;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "btns" },
});
const __VLS_88 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_90 = __VLS_89({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
let __VLS_92;
let __VLS_93;
let __VLS_94;
const __VLS_95 = {
    onClick: (...[$event]) => {
        __VLS_ctx.resetSqlBotForm(true);
    }
};
__VLS_91.slots.default;
(__VLS_ctx.t('system.restore_default'));
var __VLS_91;
const __VLS_96 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    ...{ 'onClick': {} },
    ...{ style: {} },
    secondary: true,
}));
const __VLS_98 = __VLS_97({
    ...{ 'onClick': {} },
    ...{ style: {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
let __VLS_100;
let __VLS_101;
let __VLS_102;
const __VLS_103 = {
    onClick: (__VLS_ctx.giveUp)
};
__VLS_99.slots.default;
(__VLS_ctx.t('common.cancel'));
var __VLS_99;
const __VLS_104 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_106 = __VLS_105({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onClick: (__VLS_ctx.saveHandler)
};
__VLS_107.slots.default;
(__VLS_ctx.t('common.save'));
var __VLS_107;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['ui-main']} */ ;
/** @type {__VLS_StyleScopedClasses['left-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['right-form']} */ ;
/** @type {__VLS_StyleScopedClasses['theme']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['theme']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['config-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['tips']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['float-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['config-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['tips']} */ ;
/** @type {__VLS_StyleScopedClasses['position-set']} */ ;
/** @type {__VLS_StyleScopedClasses['position-set_input']} */ ;
/** @type {__VLS_StyleScopedClasses['x']} */ ;
/** @type {__VLS_StyleScopedClasses['y']} */ ;
/** @type {__VLS_StyleScopedClasses['page-Form']} */ ;
/** @type {__VLS_StyleScopedClasses['btns']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Assistant: Assistant,
            t: t,
            optionsY: optionsY,
            optionsX: optionsX,
            COLOR_PANEL: COLOR_PANEL,
            dialogVisible: dialogVisible,
            logo: logo,
            sqlBotForm: sqlBotForm,
            giveUp: giveUp,
            saveHandler: saveHandler,
            headerFontColorChange: headerFontColorChange,
            customColorChange: customColorChange,
            resetSqlBotForm: resetSqlBotForm,
            uploadImg: uploadImg,
            beforeUpload: beforeUpload,
            appName: appName,
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
