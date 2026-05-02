import { ref, watch, reactive } from 'vue';
import InfoTemplate from './common/InfoTemplate.vue';
import PlatformForm from './PlatformForm.vue';
import { request } from '@/utils/request';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus-secondary';
import { getPlatformCardConfig } from './common/SettingTemplate';
const { t } = useI18n();
const props = defineProps({
    cardInfo: {
        type: Object,
        required: true,
        default: () => ({
            type: 6,
            name: 'wecom',
            config: {},
            enable: false,
            valid: false,
        }),
    },
});
const info = ref({});
const state = reactive({
    settingList: [],
    copyList: [],
    cardIcon: null,
});
const existInfo = ref(false);
const editor = ref();
const origin = ref(6);
const cardTitle = ref('');
const formValid = ref(false);
watch(() => props.cardInfo, () => {
    const configData = props.cardInfo.config;
    configData['id'] = props.cardInfo.id;
    configData['enable'] = !!props.cardInfo.enable;
    configData['valid'] = !!props.cardInfo.valid;
    info.value = configData;
    origin.value = props.cardInfo.type;
    const platformConfig = getPlatformCardConfig(props.cardInfo.type);
    const list = [...platformConfig.settingList];
    list.forEach((item) => {
        item['pval'] = info.value[item.realKey] || '-';
        // delete item.realKey
    });
    state.settingList = list;
    existInfo.value = !!props.cardInfo.id;
    cardTitle.value = t(platformConfig.title);
    state.copyList = platformConfig.copyField;
    state.cardIcon = platformConfig.icon;
    formValid.value = list.every((item) => !!info.value[item.realKey]);
}, { immediate: true });
const emits = defineEmits(['saved']);
const search = () => {
    emits('saved');
};
const switchEnableApi = (enable) => {
    const url = '/system/authentication/enable';
    const data = { id: origin.value, enable };
    request.patch(url, data).catch(() => {
        info.value.enable = false;
    });
};
const edit = () => {
    const data = { ...{ type: origin.value, title: cardTitle.value }, ...info.value };
    editor?.value.edit(data);
};
const validate = () => {
    if (info.value) {
        validateHandler();
    }
};
const validateHandler = () => {
    request
        .patch('/system/authentication/status', { type: origin.value, name: '', config: '' })
        .then((res) => {
        if (res) {
            info.value.valid = true;
            ElMessage.success(t('ds.connection_success'));
        }
        else {
            ElMessage.error(t('ds.connection_failed'));
            info.value.enable = false;
            info.value.valid = false;
        }
    })
        .catch(() => {
        info.value.enable = false;
        info.value.valid = false;
    });
};
// search()
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "platform-head-container" },
    ...{ class: ({ 'just-head': !__VLS_ctx.existInfo }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "platform-setting-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "platform-setting-head-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lead-left-icon" },
});
const __VLS_0 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ style: {} },
    size: "24px",
}));
const __VLS_2 = __VLS_1({
    ...{ style: {} },
    size: "24px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = ((__VLS_ctx.state.cardIcon));
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "svg-icon" },
}));
const __VLS_6 = __VLS_5({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.cardTitle);
if (__VLS_ctx.existInfo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lead-left-status" },
        ...{ class: ({ invalid: !__VLS_ctx.info.valid }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.info.valid ? __VLS_ctx.t('authentication.valid') : __VLS_ctx.t('authentication.invalid'));
}
if (__VLS_ctx.existInfo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "platform-setting-head-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.info.enable ? __VLS_ctx.t('platform.status_open') : __VLS_ctx.t('platform.status_close'));
    if (__VLS_ctx.info.valid) {
        const __VLS_8 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.info.enable),
            ...{ class: "status-switch" },
        }));
        const __VLS_10 = __VLS_9({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.info.enable),
            ...{ class: "status-switch" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_12;
        let __VLS_13;
        let __VLS_14;
        const __VLS_15 = {
            onChange: (__VLS_ctx.switchEnableApi)
        };
        var __VLS_11;
    }
    else {
        const __VLS_16 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            ...{ class: "box-item" },
            effect: "dark",
            content: (__VLS_ctx.t('platform.can_enable_it')),
            placement: "top",
        }));
        const __VLS_18 = __VLS_17({
            ...{ class: "box-item" },
            effect: "dark",
            content: (__VLS_ctx.t('platform.can_enable_it')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        const __VLS_20 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.info.enable),
            disabled: "",
            ...{ class: "status-switch" },
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.info.enable),
            disabled: "",
            ...{ class: "status-switch" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_24;
        let __VLS_25;
        let __VLS_26;
        const __VLS_27 = {
            onChange: (__VLS_ctx.switchEnableApi)
        };
        var __VLS_23;
        var __VLS_19;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "platform-setting-head-right-btn" },
    });
    const __VLS_28 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (__VLS_ctx.edit)
    };
    __VLS_31.slots.default;
    (__VLS_ctx.t('platform.access_in'));
    var __VLS_31;
}
if (__VLS_ctx.existInfo) {
    /** @type {[typeof InfoTemplate, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(InfoTemplate, new InfoTemplate({
        ...{ 'onEdit': {} },
        ...{ class: "platform-setting-main" },
        copyList: (__VLS_ctx.state.copyList),
        hideHead: (true),
        settingData: (__VLS_ctx.state.settingList),
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onEdit': {} },
        ...{ class: "platform-setting-main" },
        copyList: (__VLS_ctx.state.copyList),
        hideHead: (true),
        settingData: (__VLS_ctx.state.settingList),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onEdit: (__VLS_ctx.edit)
    };
    var __VLS_38;
}
if (__VLS_ctx.existInfo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "platform-foot-container" },
    });
    const __VLS_43 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_47;
    let __VLS_48;
    let __VLS_49;
    const __VLS_50 = {
        onClick: (__VLS_ctx.edit)
    };
    __VLS_46.slots.default;
    (__VLS_ctx.t('datasource.edit'));
    var __VLS_46;
    const __VLS_51 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (!__VLS_ctx.formValid),
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onClick': {} },
        secondary: true,
        disabled: (!__VLS_ctx.formValid),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onClick: (__VLS_ctx.validate)
    };
    __VLS_54.slots.default;
    (__VLS_ctx.t('ds.check'));
    var __VLS_54;
}
/** @type {[typeof PlatformForm, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(PlatformForm, new PlatformForm({
    ...{ 'onSaved': {} },
    ref: "editor",
}));
const __VLS_60 = __VLS_59({
    ...{ 'onSaved': {} },
    ref: "editor",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
let __VLS_62;
let __VLS_63;
let __VLS_64;
const __VLS_65 = {
    onSaved: (__VLS_ctx.search)
};
/** @type {typeof __VLS_ctx.editor} */ ;
var __VLS_66 = {};
var __VLS_61;
/** @type {__VLS_StyleScopedClasses['platform-head-container']} */ ;
/** @type {__VLS_StyleScopedClasses['just-head']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-setting-head']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-setting-head-left']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-left-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-left-status']} */ ;
/** @type {__VLS_StyleScopedClasses['invalid']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-setting-head-right']} */ ;
/** @type {__VLS_StyleScopedClasses['status-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['box-item']} */ ;
/** @type {__VLS_StyleScopedClasses['status-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-setting-head-right-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-setting-main']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-foot-container']} */ ;
// @ts-ignore
var __VLS_67 = __VLS_66;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            InfoTemplate: InfoTemplate,
            PlatformForm: PlatformForm,
            t: t,
            info: info,
            state: state,
            existInfo: existInfo,
            editor: editor,
            cardTitle: cardTitle,
            formValid: formValid,
            search: search,
            switchEnableApi: switchEnableApi,
            edit: edit,
            validate: validate,
        };
    },
    emits: {},
    props: {
        cardInfo: {
            type: Object,
            required: true,
            default: () => ({
                type: 6,
                name: 'wecom',
                config: {},
                enable: false,
                valid: false,
            }),
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        cardInfo: {
            type: Object,
            required: true,
            default: () => ({
                type: 6,
                name: 'wecom',
                config: {},
                enable: false,
                valid: false,
            }),
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
