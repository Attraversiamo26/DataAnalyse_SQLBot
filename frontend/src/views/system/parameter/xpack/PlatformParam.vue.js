import { inject, onMounted, reactive, ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { workspaceList } from '@/api/workspace';
import { request } from '@/utils/request';
import icon_info_outlined_1 from '@/assets/svg/icon_info_outlined_1.svg';
const { t } = useI18n();
const anyPlatformEnable = ref(false);
const defaultForm = reactive({
    'platform.auto_create': false,
    'platform.oid': 1,
    'platform.rid': 1,
    'login.default_login': 0,
});
const loginTypeOptions = shallowRef([{ value: 0, label: t('login.account_login') }]);
const formData = inject('parameterForm', {});
const xpackValid = ref(false);
const organizations = shallowRef([]);
const roles = [
    {
        name: t('workspace.administrator'),
        value: 1,
    },
    {
        name: t('workspace.ordinary_member'),
        value: 0,
    },
];
const platformMapping = {
    cas: { value: 1, label: 'CAS' },
    oidc: { value: 2, label: 'OIDC' },
    ldap: { value: 3, label: 'LDAP' },
    oauth2: { value: 4, label: 'Oauth2' },
    saml2: { value: 5, label: 'Saml2' },
};
const setDefaultForm = () => {
    for (const key in defaultForm) {
        if (formData[key] === undefined) {
            formData[key] = defaultForm[key];
        }
    }
};
const queryCategoryStatus = () => {
    const url = `/system/authentication/platform/status`;
    return request.get(url);
};
onMounted(async () => {
    // 暂时注释掉LicenseGenerator相关代码，因为它不存在
    // const obj = LicenseGenerator.getLicense()
    // if (obj?.status !== 'valid') {
    //   xpackValid.value = false
    //   return
    // }
    // 暂时设置xpackValid为true
    xpackValid.value = true;
    const wsRes = await workspaceList();
    organizations.value = wsRes;
    const platformStatusRes = await queryCategoryStatus();
    platformStatusRes.forEach((item) => {
        if (item.enable && platformMapping[item.name]) {
            loginTypeOptions.value.push(platformMapping[item.name]);
            anyPlatformEnable.value = true;
        }
    });
    if (!formData['login.default_login'] ||
        !loginTypeOptions.value.some((option) => parseInt(formData['login.default_login']) === option.value)) {
        formData['login.default_login'] = 0;
    }
    formData['login.default_login'] = parseInt(formData['login.default_login']);
    setDefaultForm();
    xpackValid.value = true;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.xpackValid) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    (__VLS_ctx.t('parameter.third_party_platform_settings'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-item" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    (__VLS_ctx.t('parameter.by_third_party_platform'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value" },
    });
    const __VLS_0 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.formData['platform.auto_create']),
    }));
    const __VLS_2 = __VLS_1({
        modelValue: (__VLS_ctx.formData['platform.auto_create']),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    (__VLS_ctx.t('parameter.platform_user_organization'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "require" },
    });
    const __VLS_4 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        effect: "dark",
        content: (__VLS_ctx.t('parameter.and_platform_integration')),
        placement: "top",
    }));
    const __VLS_6 = __VLS_5({
        effect: "dark",
        content: (__VLS_ctx.t('parameter.and_platform_integration')),
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
    const __VLS_16 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        modelValue: (__VLS_ctx.formData['platform.oid']),
        filterable: true,
    }));
    const __VLS_18 = __VLS_17({
        modelValue: (__VLS_ctx.formData['platform.oid']),
        filterable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.organizations))) {
        const __VLS_20 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            key: (item.id),
            label: (item.name),
            value: (item.id),
        }));
        const __VLS_22 = __VLS_21({
            key: (item.id),
            label: (item.name),
            value: (item.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    }
    var __VLS_19;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-item" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    (__VLS_ctx.t('workspace.member_type'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "require" },
    });
    const __VLS_24 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        effect: "dark",
        content: (__VLS_ctx.t('parameter.and_platform_integration')),
        placement: "top",
    }));
    const __VLS_26 = __VLS_25({
        effect: "dark",
        content: (__VLS_ctx.t('parameter.and_platform_integration')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    const __VLS_28 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        size: "16",
    }));
    const __VLS_30 = __VLS_29({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.icon_info_outlined_1;
    /** @type {[typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, typeof __VLS_components.Icon_info_outlined_1, typeof __VLS_components.icon_info_outlined_1, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    var __VLS_31;
    var __VLS_27;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value" },
    });
    const __VLS_36 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        modelValue: (__VLS_ctx.formData['platform.rid']),
        filterable: true,
    }));
    const __VLS_38 = __VLS_37({
        modelValue: (__VLS_ctx.formData['platform.rid']),
        filterable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.roles))) {
        const __VLS_40 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            key: (item.value),
            label: (item.name),
            value: (item.value),
        }));
        const __VLS_42 = __VLS_41({
            key: (item.value),
            label: (item.name),
            value: (item.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
    var __VLS_39;
}
if (__VLS_ctx.anyPlatformEnable) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    (__VLS_ctx.t('parameter.login_settings'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-item" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    (__VLS_ctx.t('parameter.default_login'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value" },
    });
    const __VLS_44 = {}.ElRadioGroup;
    /** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        modelValue: (__VLS_ctx.formData['login.default_login']),
    }));
    const __VLS_46 = __VLS_45({
        modelValue: (__VLS_ctx.formData['login.default_login']),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.loginTypeOptions))) {
        const __VLS_48 = {}.ElRadio;
        /** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            key: (item.value),
            value: (item.value),
        }));
        const __VLS_50 = __VLS_49({
            key: (item.value),
            value: (item.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        (item.label);
        var __VLS_51;
    }
    var __VLS_47;
}
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['require']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['require']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_info_outlined_1: icon_info_outlined_1,
            t: t,
            anyPlatformEnable: anyPlatformEnable,
            loginTypeOptions: loginTypeOptions,
            formData: formData,
            xpackValid: xpackValid,
            organizations: organizations,
            roles: roles,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
