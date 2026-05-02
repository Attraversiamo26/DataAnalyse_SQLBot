import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { request } from '@/utils/request';
import CasEditor from './CasEditor.vue';
import LdapEditor from './LdapEditor.vue';
import OidcEditor from './OidcEditor.vue';
import Oauth2Editor from './Oauth2Editor.vue';
import Saml2Editor from './SAML2Editor.vue';
import { ElMessage } from 'element-plus-secondary';
const { t } = useI18n();
const loading = ref(false);
const casEdit = ref();
const oidcEdit = ref();
const oauth2Edit = ref();
const saml2Edit = ref();
const ldapEdit = ref();
const infos = ref([]);
const showInfos = ref([]);
const init = (needLoading) => {
    if (needLoading) {
        loading.value = true;
    }
    const url = '/system/authentication';
    request
        .get(url)
        .then((res) => {
        if (res) {
            const templateArray = ['ldap', 'oidc', 'cas', 'oauth2'];
            const resultList = [...res].filter((item) => item.name !== 'saml2');
            let resultMap = {};
            resultList.forEach((item) => {
                resultMap[item.name] = item;
            });
            infos.value = templateArray.map((item) => resultMap[item]);
            showInfos.value = [...infos.value];
        }
        loading.value = false;
    })
        .catch((e) => {
        console.error(e);
        loading.value = false;
    });
};
const switchEnable = (item) => {
    const url = '/system/authentication/enable';
    const data = { id: item.id, enable: item.enable };
    loading.value = true;
    request
        .patch(url, data)
        .then(() => {
        init(false);
    })
        .catch((e) => {
        console.error(e);
    })
        .finally(() => {
        loading.value = false;
    });
};
const editInfo = (item) => {
    if (item.name === 'oidc') {
        oidcEdit.value?.edit();
    }
    else if (item.name === 'cas') {
        casEdit.value?.edit();
    }
    else if (item.name === 'ldap') {
        ldapEdit.value?.edit();
    }
    else if (item.name === 'oauth2') {
        oauth2Edit.value?.edit();
    }
    else if (item.name === 'saml2') {
        saml2Edit.value?.edit();
    }
};
const validate = (id) => {
    loading.value = true;
    request
        .patch('/system/authentication/status', { type: id, name: '', config: '' })
        .then((res) => {
        if (res) {
            ElMessage.success(t('ds.connection_success'));
        }
        else {
            ElMessage.error(t('ds.connection_failed'));
        }
        init(false);
    })
        .finally(() => {
        loading.value = false;
    });
};
init(true);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "authentication" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "router-title" },
});
(__VLS_ctx.t('system.authentication_settings'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "authentication-content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-card-container" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.showInfos))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.name),
        ...{ class: "authentication-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-card-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-info-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-span" },
    });
    (item.name === 'oauth2' ? 'OAuth2' : item.name.toLocaleUpperCase());
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-status" },
        ...{ class: ({
                'card-hidden-status': !item.id,
                'valid-status': item.id && item.valid,
            }) },
    });
    (item.valid ? __VLS_ctx.t('authentication.valid') : __VLS_ctx.t('authentication.invalid'));
    if (!item.valid) {
        const __VLS_0 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ class: "box-item" },
            effect: "dark",
            content: (__VLS_ctx.t('authentication.be_turned_on')),
            placement: "top",
        }));
        const __VLS_2 = __VLS_1({
            ...{ class: "box-item" },
            effect: "dark",
            content: (__VLS_ctx.t('authentication.be_turned_on')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_3.slots.default;
        const __VLS_4 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            ...{ 'onChange': {} },
            modelValue: (item.enable),
            disabled: (!item.valid),
        }));
        const __VLS_6 = __VLS_5({
            ...{ 'onChange': {} },
            modelValue: (item.enable),
            disabled: (!item.valid),
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        let __VLS_8;
        let __VLS_9;
        let __VLS_10;
        const __VLS_11 = {
            onChange: (...[$event]) => {
                if (!(!item.valid))
                    return;
                __VLS_ctx.switchEnable(item);
            }
        };
        var __VLS_7;
        var __VLS_3;
    }
    else {
        const __VLS_12 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ 'onChange': {} },
            modelValue: (item.enable),
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onChange': {} },
            modelValue: (item.enable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_16;
        let __VLS_17;
        let __VLS_18;
        const __VLS_19 = {
            onChange: (...[$event]) => {
                if (!!(!item.valid))
                    return;
                __VLS_ctx.switchEnable(item);
            }
        };
        var __VLS_15;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inner-card-btn" },
    });
    const __VLS_20 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editInfo(item);
        }
    };
    __VLS_23.slots.default;
    (__VLS_ctx.t('datasource.edit'));
    var __VLS_23;
    const __VLS_28 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
        ...{ class: "card-validate-btn" },
        secondary: true,
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
        ...{ class: "card-validate-btn" },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (...[$event]) => {
            __VLS_ctx.validate(item.id);
        }
    };
    __VLS_31.slots.default;
    (__VLS_ctx.t('ds.test_connection'));
    var __VLS_31;
}
/** @type {[typeof CasEditor, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(CasEditor, new CasEditor({
    ...{ 'onSaved': {} },
    ref: "casEdit",
}));
const __VLS_37 = __VLS_36({
    ...{ 'onSaved': {} },
    ref: "casEdit",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_39;
let __VLS_40;
let __VLS_41;
const __VLS_42 = {
    onSaved: (__VLS_ctx.init)
};
/** @type {typeof __VLS_ctx.casEdit} */ ;
var __VLS_43 = {};
var __VLS_38;
/** @type {[typeof OidcEditor, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(OidcEditor, new OidcEditor({
    ...{ 'onSaved': {} },
    ref: "oidcEdit",
}));
const __VLS_46 = __VLS_45({
    ...{ 'onSaved': {} },
    ref: "oidcEdit",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onSaved: (__VLS_ctx.init)
};
/** @type {typeof __VLS_ctx.oidcEdit} */ ;
var __VLS_52 = {};
var __VLS_47;
/** @type {[typeof LdapEditor, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(LdapEditor, new LdapEditor({
    ...{ 'onSaved': {} },
    ref: "ldapEdit",
}));
const __VLS_55 = __VLS_54({
    ...{ 'onSaved': {} },
    ref: "ldapEdit",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
let __VLS_57;
let __VLS_58;
let __VLS_59;
const __VLS_60 = {
    onSaved: (__VLS_ctx.init)
};
/** @type {typeof __VLS_ctx.ldapEdit} */ ;
var __VLS_61 = {};
var __VLS_56;
/** @type {[typeof Oauth2Editor, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(Oauth2Editor, new Oauth2Editor({
    ...{ 'onSaved': {} },
    ref: "oauth2Edit",
}));
const __VLS_64 = __VLS_63({
    ...{ 'onSaved': {} },
    ref: "oauth2Edit",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_66;
let __VLS_67;
let __VLS_68;
const __VLS_69 = {
    onSaved: (__VLS_ctx.init)
};
/** @type {typeof __VLS_ctx.oauth2Edit} */ ;
var __VLS_70 = {};
var __VLS_65;
/** @type {[typeof Saml2Editor, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(Saml2Editor, new Saml2Editor({
    ...{ 'onSaved': {} },
    ref: "saml2Edit",
}));
const __VLS_73 = __VLS_72({
    ...{ 'onSaved': {} },
    ref: "saml2Edit",
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_75;
let __VLS_76;
let __VLS_77;
const __VLS_78 = {
    onSaved: (__VLS_ctx.init)
};
/** @type {typeof __VLS_ctx.saml2Edit} */ ;
var __VLS_79 = {};
var __VLS_74;
/** @type {__VLS_StyleScopedClasses['authentication']} */ ;
/** @type {__VLS_StyleScopedClasses['router-title']} */ ;
/** @type {__VLS_StyleScopedClasses['authentication-content']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card-container']} */ ;
/** @type {__VLS_StyleScopedClasses['authentication-card']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-card']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info-left']} */ ;
/** @type {__VLS_StyleScopedClasses['card-span']} */ ;
/** @type {__VLS_StyleScopedClasses['card-status']} */ ;
/** @type {__VLS_StyleScopedClasses['card-hidden-status']} */ ;
/** @type {__VLS_StyleScopedClasses['valid-status']} */ ;
/** @type {__VLS_StyleScopedClasses['box-item']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['card-validate-btn']} */ ;
// @ts-ignore
var __VLS_44 = __VLS_43, __VLS_53 = __VLS_52, __VLS_62 = __VLS_61, __VLS_71 = __VLS_70, __VLS_80 = __VLS_79;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CasEditor: CasEditor,
            LdapEditor: LdapEditor,
            OidcEditor: OidcEditor,
            Oauth2Editor: Oauth2Editor,
            Saml2Editor: Saml2Editor,
            t: t,
            loading: loading,
            casEdit: casEdit,
            oidcEdit: oidcEdit,
            oauth2Edit: oauth2Edit,
            saml2Edit: saml2Edit,
            ldapEdit: ldapEdit,
            showInfos: showInfos,
            init: init,
            switchEnable: switchEnable,
            editInfo: editInfo,
            validate: validate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
