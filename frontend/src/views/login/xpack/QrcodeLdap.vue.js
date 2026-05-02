import { Icon } from '@/components/icon-custom';
import icon_qr_outlined from '@/assets/svg/icon_qr_outlined.svg';
import logo_ldap from '@/assets/svg/logo_ldap.svg';
import icon_pc_outlined from '@/assets/svg/icon_pc_outlined.svg';
import { onMounted, ref } from 'vue';
import { propTypes } from '@/utils/propTypes';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps({
    qrcode: propTypes.bool.def(false),
    ldap: propTypes.bool.def(false),
});
const componentList = ref([
    {
        key: 'qrcode',
        icon: icon_qr_outlined,
        title: t('login.qr_code'),
    },
    {
        key: 'ldap',
        icon: logo_ldap,
        title: 'LDAP',
    },
    {
        key: 'account',
        icon: icon_pc_outlined,
        title: t('user.account'),
    },
]);
const componentMap = ref({});
const validComponentList = ref([]);
const activeComponent = ref('account');
const initActiveComponent = () => {
    validComponentList.value = [];
    componentList.value.forEach((item) => {
        if (item.key !== activeComponent.value && getPropsItem(item.key)) {
            validComponentList.value.push(item);
        }
    });
};
const getPropsItem = (key) => {
    if (key === 'qrcode') {
        return props.qrcode;
    }
    if (key === 'ldap') {
        return props.ldap;
    }
    return false;
};
const formatOptionMap = () => {
    componentMap.value['qrcode'] = componentList.value[0];
    componentMap.value['ldap'] = componentList.value[1];
    componentMap.value['account'] = componentList.value[2];
};
const emits = defineEmits(['status-change']);
const execute = (item, index) => {
    validComponentList.value[index] = componentMap.value[activeComponent.value];
    activeComponent.value = item.key;
    if (activeComponent.value === 'account') {
        showDefaultTabs();
    }
    else {
        hiddenDefaultTabs();
    }
    emits('status-change', activeComponent.value);
};
const hiddenDefaultTabs = () => {
    const dom = document.getElementsByClassName('default-login-tabs');
    const len = dom?.length || 0;
    if (len) {
        dom[0]['style']['display'] = 'none';
        if (len > 1) {
            dom[1]['style']['display'] = 'none';
            if (len > 2 && dom[2]) {
                dom[2]['style']['display'] = 'none';
            }
        }
    }
};
const showDefaultTabs = () => {
    const dom = document.getElementsByClassName('default-login-tabs');
    const len = dom?.length || 0;
    if (len) {
        dom[0]['style']['display'] = '';
        if (len > 1) {
            dom[1]['style']['display'] = '';
            if (len > 2 && dom[2]) {
                dom[2]['style']['display'] = '';
            }
        }
    }
};
const setActive = (active) => {
    const curActive = active || 'account';
    let index = -1;
    let item = {
        key: 'account',
        icon: 'icon_pc_outlined',
        title: t('user.account'),
    };
    for (let i = 0; i < validComponentList.value.length; i++) {
        const element = validComponentList.value[i];
        if (element.key === curActive) {
            item = element;
            index = i;
        }
    }
    validComponentList.value[index] = componentMap.value[activeComponent.value];
    activeComponent.value = item.key;
    if (active === 'ldap') {
        hiddenDefaultTabs();
    }
};
const __VLS_exposed = {
    setActive,
};
defineExpose(__VLS_exposed);
onMounted(() => {
    formatOptionMap();
    initActiveComponent();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.validComponentList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.execute(item, index);
            } },
        key: (item.key),
        ...{ class: "item" },
        ...{ class: ({ qrcode: item.key !== 'ldap' }) },
    });
    const __VLS_0 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.Icon;
    /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = ((item.icon));
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ class: "svg-icon" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "svg-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
    var __VLS_3;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "name" },
    });
    (item.title);
}
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Icon: Icon,
            validComponentList: validComponentList,
            execute: execute,
        };
    },
    emits: {},
    props: {
        qrcode: propTypes.bool.def(false),
        ldap: propTypes.bool.def(false),
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    props: {
        qrcode: propTypes.bool.def(false),
        ldap: propTypes.bool.def(false),
    },
});
; /* PartiallyEnd: #4569/main.vue */
