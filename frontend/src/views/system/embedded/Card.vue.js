import delIcon from '@/assets/svg/icon_delete.svg';
import icon_copy_outlined from '@/assets/embedded/icon_copy_outlined.svg';
import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg';
import icon_embedded_outlined from '@/assets/embedded/icon_embedded_outlined.svg';
import IconOpeEdit from '@/assets/svg/icon_edit_outlined.svg';
import Lock from '@/assets/embedded/LOGO-sql.png';
import { useAppearanceStoreWithOut } from '@/stores/appearance';
import LOGO from '@/assets/svg/logo-custom_small.svg';
import { ref, unref, computed } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { ClickOutside as vClickOutside } from 'element-plus-secondary';
import icon_style_set_outlined from '@/assets/svg/icon_style-set_outlined.svg';
const props = withDefaults(defineProps(), {
    name: '-',
    isBase: false,
    id: '-',
    description: '-',
    logo: '',
});
const { copy } = useClipboard({ legacy: true });
const { t } = useI18n();
const emits = defineEmits(['edit', 'del', 'embedded', 'ui']);
const appearanceStore = useAppearanceStoreWithOut();
const handleEdit = () => {
    emits('edit');
};
const handleUi = () => {
    emits('ui');
};
const handleDel = () => {
    emits('del');
};
const handleEmbedded = () => {
    emits('embedded');
};
const copyCode = () => {
    copy(props.id)
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
const buttonRef = ref();
const popoverRef = ref();
const onClickOutside = () => {
    unref(popoverRef).popperRef?.delayHide?.();
};
const basePath = import.meta.env.VITE_API_BASE_URL;
const baseUrl = basePath + '/system/assistant/picture/';
const pageLogo = computed(() => {
    return props.logo.startsWith('blob') ? props.logo : baseUrl + props.logo;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    name: '-',
    isBase: false,
    id: '-',
    description: '-',
    logo: '',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['methods']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "name-icon" },
});
if (props.logo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.pageLogo),
        width: "32px",
        height: "32px",
    });
}
else if (__VLS_ctx.appearanceStore.themeColor === 'custom') {
    const __VLS_0 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        size: "32",
    }));
    const __VLS_2 = __VLS_1({
        size: "32",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.LOGO;
    /** @type {[typeof __VLS_components.LOGO, typeof __VLS_components.LOGO, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    var __VLS_3;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.Lock),
        width: "32px",
        height: "32px",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "id-name" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "name ellipsis" },
    title: (__VLS_ctx.name),
});
(__VLS_ctx.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "id-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "id ellipsis" },
    title: (__VLS_ctx.id),
});
(__VLS_ctx.id);
const __VLS_8 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.t('datasource.copy')),
    placement: "top",
}));
const __VLS_10 = __VLS_9({
    offset: (12),
    effect: "dark",
    content: (__VLS_ctx.t('datasource.copy')),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    ...{ style: {} },
    size: "16",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.copyCode)
};
__VLS_15.slots.default;
const __VLS_20 = {}.icon_copy_outlined;
/** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_15;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "default" },
    ...{ class: (__VLS_ctx.isBase && 'is-base') },
});
(__VLS_ctx.isBase ? __VLS_ctx.$t('embedded.basic_application') : __VLS_ctx.$t('embedded.advanced_application'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "description" },
    title: (__VLS_ctx.description),
});
(__VLS_ctx.description);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methods" },
});
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.handleEmbedded)
};
__VLS_27.slots.default;
const __VLS_32 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ style: {} },
    size: "16",
}));
const __VLS_34 = __VLS_33({
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.icon_embedded_outlined;
/** @type {[typeof __VLS_components.Icon_embedded_outlined, typeof __VLS_components.icon_embedded_outlined, typeof __VLS_components.Icon_embedded_outlined, typeof __VLS_components.icon_embedded_outlined, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_35;
(__VLS_ctx.$t('embedded.embed_third_party'));
var __VLS_27;
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (__VLS_ctx.handleEdit)
};
__VLS_43.slots.default;
const __VLS_48 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ style: {} },
    size: "16",
}));
const __VLS_50 = __VLS_49({
    ...{ style: {} },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.IconOpeEdit;
/** @type {[typeof __VLS_components.IconOpeEdit, typeof __VLS_components.IconOpeEdit, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
(__VLS_ctx.$t('dashboard.edit'));
var __VLS_43;
const __VLS_56 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    ref: "buttonRef",
    ...{ class: "more" },
    size: "16",
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    ref: "buttonRef",
    ...{ class: "more" },
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onClick: () => { }
};
__VLS_asFunctionalDirective(__VLS_directives.vClickOutside)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.onClickOutside) }, null, null);
/** @type {typeof __VLS_ctx.buttonRef} */ ;
var __VLS_64 = {};
__VLS_59.slots.default;
const __VLS_66 = {}.icon_more_outlined;
/** @type {[typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({}));
const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
var __VLS_59;
const __VLS_70 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    ref: "popoverRef",
    virtualRef: (__VLS_ctx.buttonRef),
    virtualTriggering: true,
    trigger: "click",
    teleported: (false),
    popperClass: "popover-card_embedded",
    placement: "bottom-start",
}));
const __VLS_72 = __VLS_71({
    ref: "popoverRef",
    virtualRef: (__VLS_ctx.buttonRef),
    virtualTriggering: true,
    trigger: "click",
    teleported: (false),
    popperClass: "popover-card_embedded",
    placement: "bottom-start",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
/** @type {typeof __VLS_ctx.popoverRef} */ ;
var __VLS_74 = {};
__VLS_73.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleUi) },
    ...{ class: "item" },
});
const __VLS_76 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    size: "16",
}));
const __VLS_78 = __VLS_77({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.icon_style_set_outlined;
/** @type {[typeof __VLS_components.Icon_style_set_outlined, typeof __VLS_components.icon_style_set_outlined, typeof __VLS_components.Icon_style_set_outlined, typeof __VLS_components.icon_style_set_outlined, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
var __VLS_79;
(__VLS_ctx.$t('embedded.display_settings'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleDel) },
    ...{ class: "item" },
});
const __VLS_84 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    size: "16",
}));
const __VLS_86 = __VLS_85({
    size: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.delIcon;
/** @type {[typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
var __VLS_87;
(__VLS_ctx.$t('dashboard.delete'));
var __VLS_73;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['name-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['id-name']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['id-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['id']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['default']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
/** @type {__VLS_StyleScopedClasses['methods']} */ ;
/** @type {__VLS_StyleScopedClasses['more']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
// @ts-ignore
var __VLS_65 = __VLS_64, __VLS_75 = __VLS_74;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            delIcon: delIcon,
            icon_copy_outlined: icon_copy_outlined,
            icon_more_outlined: icon_more_outlined,
            icon_embedded_outlined: icon_embedded_outlined,
            IconOpeEdit: IconOpeEdit,
            Lock: Lock,
            LOGO: LOGO,
            vClickOutside: vClickOutside,
            icon_style_set_outlined: icon_style_set_outlined,
            t: t,
            appearanceStore: appearanceStore,
            handleEdit: handleEdit,
            handleUi: handleUi,
            handleDel: handleDel,
            handleEmbedded: handleEmbedded,
            copyCode: copyCode,
            buttonRef: buttonRef,
            popoverRef: popoverRef,
            onClickOutside: onClickOutside,
            pageLogo: pageLogo,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
