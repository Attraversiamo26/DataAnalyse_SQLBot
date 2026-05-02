import logo_wechatWork from '@/assets/svg/logo_wechat-work.svg';
import logo_dingtalk from '@/assets/svg/logo_dingtalk.svg';
import logo_lark from '@/assets/svg/logo_lark.svg';
import { ref } from 'vue';
import LarkQr from './LarkQr.vue';
import LarksuiteQr from './LarksuiteQr.vue';
import DingtalkQr from './DingtalkQr.vue';
import WecomQr from './WecomQr.vue';
import { propTypes } from '@/utils/propTypes';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const activeName = ref('');
const props = defineProps({
    wecom: propTypes.bool.def(false),
    lark: propTypes.bool.def(false),
    dingtalk: propTypes.bool.def(false),
    larksuite: propTypes.bool.def(false),
});
const initActive = () => {
    const qrArray = ['wecom', 'dingtalk', 'lark', 'larksuite'];
    for (let i = 0; i < qrArray.length; i++) {
        const key = qrArray[i];
        if (props[key]) {
            activeName.value = key;
            break;
        }
    }
};
const handleClick = () => { };
initActive();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onTabClick': {} },
    modelValue: (__VLS_ctx.activeName),
    ...{ class: "qr-tab" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onTabClick': {} },
    modelValue: (__VLS_ctx.activeName),
    ...{ class: "qr-tab" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onTabClick: (__VLS_ctx.handleClick)
};
__VLS_3.slots.default;
if (props.wecom) {
    const __VLS_8 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        label: (__VLS_ctx.t('user.wecom')),
        name: "wecom",
    }));
    const __VLS_10 = __VLS_9({
        label: (__VLS_ctx.t('user.wecom')),
        name: "wecom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
if (props.dingtalk) {
    const __VLS_12 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        label: (__VLS_ctx.t('user.dingtalk')),
        name: "dingtalk",
    }));
    const __VLS_14 = __VLS_13({
        label: (__VLS_ctx.t('user.dingtalk')),
        name: "dingtalk",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
if (props.lark) {
    const __VLS_16 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        label: (__VLS_ctx.t('user.lark')),
        name: "lark",
    }));
    const __VLS_18 = __VLS_17({
        label: (__VLS_ctx.t('user.lark')),
        name: "lark",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
if (props.larksuite) {
    const __VLS_20 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        label: (__VLS_ctx.t('user.larksuite')),
        name: "larksuite",
    }));
    const __VLS_22 = __VLS_21({
        label: (__VLS_ctx.t('user.larksuite')),
        name: "larksuite",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
var __VLS_3;
if (__VLS_ctx.activeName === 'wecom') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-qrcode" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    const __VLS_24 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    const __VLS_28 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        name: "logo_wechat-work",
    }));
    const __VLS_30 = __VLS_29({
        name: "logo_wechat-work",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.logo_wechatWork;
    /** @type {[typeof __VLS_components.Logo_wechatWork, typeof __VLS_components.logo_wechatWork, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ class: "svg-icon" },
    }));
    const __VLS_34 = __VLS_33({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    var __VLS_31;
    var __VLS_27;
    (__VLS_ctx.t('user.wecom') + __VLS_ctx.t('login.scan_qr_login'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "qrcode" },
    });
    if (__VLS_ctx.activeName === 'wecom') {
        /** @type {[typeof WecomQr, ]} */ ;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(WecomQr, new WecomQr({}));
        const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
    }
}
if (__VLS_ctx.activeName === 'dingtalk') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-qrcode" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    const __VLS_39 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({}));
    const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
    __VLS_42.slots.default;
    const __VLS_43 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        name: "logo_dingtalk",
    }));
    const __VLS_45 = __VLS_44({
        name: "logo_dingtalk",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_46.slots.default;
    const __VLS_47 = {}.logo_dingtalk;
    /** @type {[typeof __VLS_components.Logo_dingtalk, typeof __VLS_components.logo_dingtalk, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        ...{ class: "svg-icon" },
    }));
    const __VLS_49 = __VLS_48({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    var __VLS_46;
    var __VLS_42;
    (__VLS_ctx.t('user.dingtalk') + __VLS_ctx.t('login.scan_qr_login'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "qrcode" },
    });
    if (__VLS_ctx.activeName === 'dingtalk') {
        /** @type {[typeof DingtalkQr, ]} */ ;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(DingtalkQr, new DingtalkQr({}));
        const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
    }
}
if (__VLS_ctx.activeName === 'lark') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-qrcode" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    const __VLS_54 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_57.slots.default;
    const __VLS_58 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        name: "logo_lark",
    }));
    const __VLS_60 = __VLS_59({
        name: "logo_lark",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_61.slots.default;
    const __VLS_62 = {}.logo_lark;
    /** @type {[typeof __VLS_components.Logo_lark, typeof __VLS_components.logo_lark, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        ...{ class: "svg-icon" },
    }));
    const __VLS_64 = __VLS_63({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    var __VLS_61;
    var __VLS_57;
    (__VLS_ctx.t('user.lark') + __VLS_ctx.t('login.scan_qr_login'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "qrcode" },
    });
    if (__VLS_ctx.activeName === 'lark') {
        /** @type {[typeof LarkQr, ]} */ ;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(LarkQr, new LarkQr({}));
        const __VLS_67 = __VLS_66({}, ...__VLS_functionalComponentArgsRest(__VLS_66));
    }
}
if (__VLS_ctx.activeName === 'larksuite') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-qrcode" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    const __VLS_69 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({}));
    const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    const __VLS_73 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        name: "logo_lark",
    }));
    const __VLS_75 = __VLS_74({
        name: "logo_lark",
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_76.slots.default;
    const __VLS_77 = {}.logo_lark;
    /** @type {[typeof __VLS_components.Logo_lark, typeof __VLS_components.logo_lark, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        ...{ class: "svg-icon" },
    }));
    const __VLS_79 = __VLS_78({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    var __VLS_76;
    var __VLS_72;
    (__VLS_ctx.t('user.larksuite') + __VLS_ctx.t('login.scan_qr_login'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "qrcode" },
    });
    if (__VLS_ctx.activeName === 'larksuite') {
        /** @type {[typeof LarksuiteQr, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(LarksuiteQr, new LarksuiteQr({}));
        const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
    }
}
/** @type {__VLS_StyleScopedClasses['qr-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['login-qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['login-qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['login-qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['login-qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['qrcode']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            logo_wechatWork: logo_wechatWork,
            logo_dingtalk: logo_dingtalk,
            logo_lark: logo_lark,
            LarkQr: LarkQr,
            LarksuiteQr: LarksuiteQr,
            DingtalkQr: DingtalkQr,
            WecomQr: WecomQr,
            t: t,
            activeName: activeName,
            handleClick: handleClick,
        };
    },
    props: {
        wecom: propTypes.bool.def(false),
        lark: propTypes.bool.def(false),
        dingtalk: propTypes.bool.def(false),
        larksuite: propTypes.bool.def(false),
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        wecom: propTypes.bool.def(false),
        lark: propTypes.bool.def(false),
        dingtalk: propTypes.bool.def(false),
        larksuite: propTypes.bool.def(false),
    },
});
; /* PartiallyEnd: #4569/main.vue */
