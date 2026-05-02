import { onMounted, provide, reactive, unref } from 'vue';
import icon_info_outlined_1 from '@/assets/svg/icon_info_outlined_1.svg';
import { useI18n } from 'vue-i18n';
import PlatformParam from './xpack/PlatformParam.vue';
import { request } from '@/utils/request';
import { formatArg } from '@/utils/utils';
const { t } = useI18n();
const state = reactive({
    parameterForm: reactive({
        'chat.expand_thinking_block': false,
        'chat.limit_rows': false,
    }),
});
provide('parameterForm', state.parameterForm);
const loadData = () => {
    request.get('/system/parameter').then((res) => {
        if (res) {
            res.forEach((item) => {
                if (item.pkey?.startsWith('chat') ||
                    item.pkey?.startsWith('login') ||
                    item.pkey?.startsWith('platform')) {
                    state.parameterForm[item.pkey] = formatArg(item.pval);
                }
            });
            console.log(state.parameterForm);
        }
    });
};
const onContextRecordCountChange = (count) => {
    if (count < 0) {
        state.parameterForm['chat.context_record_count'] = 0;
    }
    state.parameterForm['chat.context_record_count'] = Math.floor(count);
};
const beforeChange = () => {
    return new Promise((resolve) => {
        if (!state.parameterForm['chat.rows_of_data']) {
            return resolve(true);
        }
        ElMessageBox.confirm(t('parameter.excessive_data_volume'), t('parameter.prompt'), {
            confirmButtonType: 'primary',
            confirmButtonText: t('common.confirm2'),
            cancelButtonText: t('common.cancel'),
            customClass: 'confirm-no_icon confirm_no_icon_parameter',
            autofocus: false,
            callback: (action) => {
                resolve(action && action === 'confirm');
            },
        });
    });
};
const buildParam = () => {
    const changedItemArray = Object.keys(state.parameterForm).map((key) => {
        return {
            pkey: key,
            pval: Object.prototype.hasOwnProperty.call(state.parameterForm, 'key')
                ? state.parameterForm[key].toString()
                : state.parameterForm[key],
        };
    });
    const formData = new FormData();
    formData.append('data', JSON.stringify(unref(changedItemArray)));
    return formData;
};
const saveHandler = () => {
    const param = buildParam();
    request
        .post('/system/parameter', param, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
        .then(() => {
        ElMessage.success(t('common.save_success'));
    });
};
onMounted(() => {
    loadData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "parameter" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
(__VLS_ctx.t('parameter.parameter_configuration'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-title" },
});
(__VLS_ctx.t('parameter.question_count_settings'));
const __VLS_0 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.t('parameter.model_thinking_process'));
const __VLS_4 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    effect: "dark",
    content: (__VLS_ctx.t('parameter.closed_by_default')),
    placement: "top",
}));
const __VLS_6 = __VLS_5({
    effect: "dark",
    content: (__VLS_ctx.t('parameter.closed_by_default')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    size: "16",
}));
const __VLS_10 = __VLS_9({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.icon_info_outlined_1;
/** @type {[typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
const __VLS_16 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.state.parameterForm['chat.expand_thinking_block']),
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.state.parameterForm['chat.expand_thinking_block']),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-item" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.t('parameter.rows_of_data'));
const __VLS_20 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    effect: "dark",
    content: (__VLS_ctx.t('parameter.excessive_data_volume')),
    placement: "top",
}));
const __VLS_22 = __VLS_21({
    effect: "dark",
    content: (__VLS_ctx.t('parameter.excessive_data_volume')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    size: "16",
}));
const __VLS_26 = __VLS_25({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.icon_info_outlined_1;
/** @type {[typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
const __VLS_32 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.state.parameterForm['chat.limit_rows']),
    beforeChange: (__VLS_ctx.beforeChange),
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.state.parameterForm['chat.limit_rows']),
    beforeChange: (__VLS_ctx.beforeChange),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
var __VLS_3;
const __VLS_36 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.t('parameter.context_record_count'));
const __VLS_40 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    effect: "dark",
    content: (__VLS_ctx.t('parameter.context_record_count_hint')),
    placement: "top",
}));
const __VLS_42 = __VLS_41({
    effect: "dark",
    content: (__VLS_ctx.t('parameter.context_record_count_hint')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    size: "16",
}));
const __VLS_46 = __VLS_45({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.icon_info_outlined_1;
/** @type {[typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_47;
var __VLS_43;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
const __VLS_52 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.state.parameterForm['chat.context_record_count']),
    modelModifiers: { number: true, },
    min: "0",
    step: "1",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.state.parameterForm['chat.context_record_count']),
    modelModifiers: { number: true, },
    min: "0",
    step: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onChange: (__VLS_ctx.onContextRecordCountChange)
};
var __VLS_55;
var __VLS_39;
/** @type {[typeof PlatformParam, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(PlatformParam, new PlatformParam({}));
const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "save" },
    ...{ style: {} },
});
const __VLS_63 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_65 = __VLS_64({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_67;
let __VLS_68;
let __VLS_69;
const __VLS_70 = {
    onClick: (__VLS_ctx.saveHandler)
};
__VLS_66.slots.default;
(__VLS_ctx.t('common.save'));
var __VLS_66;
/** @type {__VLS_StyleScopedClasses['parameter']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-container']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['save']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_info_outlined_1: icon_info_outlined_1,
            PlatformParam: PlatformParam,
            t: t,
            state: state,
            onContextRecordCountChange: onContextRecordCountChange,
            beforeChange: beforeChange,
            saveHandler: saveHandler,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
