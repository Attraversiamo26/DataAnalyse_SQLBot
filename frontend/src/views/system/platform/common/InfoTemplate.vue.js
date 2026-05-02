import icon_copy_outlined from '@/assets/svg/icon_copy_outlined.svg';
import icon_invisible_outlined from '@/assets/embedded/icon_invisible_outlined.svg';
import icon_visible_outlined from '@/assets/embedded/icon_visible_outlined.svg';
import dvInfo from '@/assets/svg/dashboard-info.svg';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useClipboard } from '@vueuse/core';
import { ElMessage } from 'element-plus-secondary';
const { copy } = useClipboard({ legacy: true });
const { t } = useI18n();
const props = defineProps({
    settingKey: {
        type: String,
        default: 'basic',
    },
    labelTooltips: {
        type: Array,
        default: () => [],
    },
    settingData: {
        type: Array,
        default: () => [],
    },
    settingTitle: {
        type: String,
        default: '',
    },
    hideHead: {
        type: Boolean,
        default: false,
    },
    showValidate: {
        type: Boolean,
        default: false,
    },
    testConnectText: {
        type: String,
        default: null,
    },
    copyList: {
        type: Array,
        default: () => [],
    },
});
// const executeTime = ref(t('system.and_0_seconds'))
const curTitle = computed(() => {
    return props.settingTitle || t('system.basic_settings');
});
const copyVal = async (val) => {
    try {
        await copy(val);
        ElMessage.success(t('embedded.copy_successful'));
    }
    catch (e) {
        console.error(e);
        ElMessage.warning(t('embedded.copy_failed'));
    }
};
const loadList = () => {
    settingList.value = [];
    if (props.settingData?.length) {
        props.settingData.forEach((item) => {
            /* if (item.pkey.includes('basic.dsExecuteTime')) {
              executeTime.value = getExecuteTime(item.pval)
            } else {
              settingList.value.push(item)
            } */
            settingList.value.push(item);
        });
    }
};
/* const getExecuteTime = (val: any) => {
  const options = [
    { value: 'minute', label: t('system.time_0_seconds') },
    { value: 'hour', label: t('system.and_0_seconds_de') },
  ]
  return options.filter((item) => item.value === val)[0].label
} */
const settingList = ref([]);
const init = () => {
    if (props.settingData?.length) {
        loadList();
    }
};
const pwdItem = ref({});
const formatPwd = () => {
    settingList.value.forEach((setting) => {
        if (setting.type === 'pwd') {
            pwdItem.value[setting.pkey] = { hidden: true };
        }
    });
};
const tooltipItem = ref({});
const formatLabel = () => {
    if (props.labelTooltips?.length) {
        props.labelTooltips.forEach((tooltip) => {
            tooltipItem.value[tooltip.key] = tooltip.val;
        });
    }
};
const switchPwd = (pkey) => {
    pwdItem.value[pkey]['hidden'] = !pwdItem.value[pkey]['hidden'];
};
const emits = defineEmits(['edit', 'check']);
const edit = () => {
    emits('edit');
};
const check = () => {
    emits('check');
};
const __VLS_exposed = {
    init,
};
defineExpose(__VLS_exposed);
init();
formatPwd();
formatLabel();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-template-container" },
});
if (!props.hideHead) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-template-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-template-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.curTitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.testConnectText) {
        const __VLS_0 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ 'onClick': {} },
            secondary: true,
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onClick': {} },
            secondary: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_4;
        let __VLS_5;
        let __VLS_6;
        const __VLS_7 = {
            onClick: (__VLS_ctx.check)
        };
        __VLS_3.slots.default;
        (__VLS_ctx.testConnectText);
        var __VLS_3;
    }
    if (__VLS_ctx.showValidate) {
        const __VLS_8 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            ...{ 'onClick': {} },
            secondary: true,
        }));
        const __VLS_10 = __VLS_9({
            ...{ 'onClick': {} },
            secondary: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_12;
        let __VLS_13;
        let __VLS_14;
        const __VLS_15 = {
            onClick: (__VLS_ctx.check)
        };
        __VLS_11.slots.default;
        (__VLS_ctx.t('datasource.validate'));
        var __VLS_11;
    }
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.edit)
    };
    __VLS_19.slots.default;
    (__VLS_ctx.t('commons.edit'));
    var __VLS_19;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-template-content clearfix" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.settingList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.pkey),
        ...{ class: "info-content-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.pkey);
    if (__VLS_ctx.tooltipItem[item.pkey]) {
        const __VLS_24 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            effect: "dark",
            content: (__VLS_ctx.tooltipItem[item.pkey]),
            placement: "top",
        }));
        const __VLS_26 = __VLS_25({
            effect: "dark",
            content: (__VLS_ctx.tooltipItem[item.pkey]),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        const __VLS_28 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            ...{ class: "info-tips" },
        }));
        const __VLS_30 = __VLS_29({
            ...{ class: "info-tips" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        const __VLS_32 = {}.Icon;
        /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            name: "dv-info",
        }));
        const __VLS_34 = __VLS_33({
            name: "dv-info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        const __VLS_36 = {}.dvInfo;
        /** @type {[typeof __VLS_components.DvInfo, typeof __VLS_components.dvInfo, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ class: "svg-icon" },
        }));
        const __VLS_38 = __VLS_37({
            ...{ class: "svg-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        var __VLS_35;
        var __VLS_31;
        var __VLS_27;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item-content" },
    });
    if (item.type === 'pwd') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-item-pwd" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "info-item-pwd-span" },
        });
        (__VLS_ctx.pwdItem[item.pkey]['hidden'] ? '********' : item.pval);
        if (props.copyList.includes(item.pkey)) {
            const __VLS_40 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                effect: "dark",
                content: (__VLS_ctx.t('datasource.copy')),
                placement: "top",
            }));
            const __VLS_42 = __VLS_41({
                effect: "dark",
                content: (__VLS_ctx.t('datasource.copy')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            __VLS_43.slots.default;
            const __VLS_44 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                ...{ 'onClick': {} },
                text: true,
                ...{ class: "setting-tip-btn" },
            }));
            const __VLS_46 = __VLS_45({
                ...{ 'onClick': {} },
                text: true,
                ...{ class: "setting-tip-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            let __VLS_48;
            let __VLS_49;
            let __VLS_50;
            const __VLS_51 = {
                onClick: (...[$event]) => {
                    if (!(item.type === 'pwd'))
                        return;
                    if (!(props.copyList.includes(item.pkey)))
                        return;
                    __VLS_ctx.copyVal(item.pval);
                }
            };
            __VLS_47.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_47.slots;
                const __VLS_52 = {}.Icon;
                /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                    name: "de-copy",
                }));
                const __VLS_54 = __VLS_53({
                    name: "de-copy",
                }, ...__VLS_functionalComponentArgsRest(__VLS_53));
                __VLS_55.slots.default;
                const __VLS_56 = {}.icon_copy_outlined;
                /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
                // @ts-ignore
                const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                    ...{ class: "svg-icon" },
                }));
                const __VLS_58 = __VLS_57({
                    ...{ class: "svg-icon" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_57));
                var __VLS_55;
            }
            var __VLS_47;
            var __VLS_43;
        }
        const __VLS_60 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            effect: "dark",
            content: (__VLS_ctx.pwdItem[item.pkey]['hidden']
                ? __VLS_ctx.t('embedded.click_to_show')
                : __VLS_ctx.t('embedded.click_to_hide')),
            placement: "top",
        }));
        const __VLS_62 = __VLS_61({
            effect: "dark",
            content: (__VLS_ctx.pwdItem[item.pkey]['hidden']
                ? __VLS_ctx.t('embedded.click_to_show')
                : __VLS_ctx.t('embedded.click_to_hide')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        const __VLS_64 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            ...{ 'onClick': {} },
            text: true,
            ...{ class: "setting-tip-btn" },
        }));
        const __VLS_66 = __VLS_65({
            ...{ 'onClick': {} },
            text: true,
            ...{ class: "setting-tip-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_68;
        let __VLS_69;
        let __VLS_70;
        const __VLS_71 = {
            onClick: (...[$event]) => {
                if (!(item.type === 'pwd'))
                    return;
                __VLS_ctx.switchPwd(item.pkey);
            }
        };
        __VLS_67.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_67.slots;
            const __VLS_72 = {}.Icon;
            /** @type {[typeof __VLS_components.Icon, typeof __VLS_components.Icon, ]} */ ;
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
            const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
            __VLS_75.slots.default;
            const __VLS_76 = ((__VLS_ctx.pwdItem[item.pkey]['hidden']
                ? __VLS_ctx.icon_invisible_outlined
                : __VLS_ctx.icon_visible_outlined));
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                ...{ class: "svg-icon" },
            }));
            const __VLS_78 = __VLS_77({
                ...{ class: "svg-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            var __VLS_75;
        }
        var __VLS_67;
        var __VLS_63;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-item-content-val" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (item.pval);
        if (props.copyList.includes(item.pkey)) {
            const __VLS_80 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                effect: "dark",
                content: (__VLS_ctx.t('datasource.copy')),
                placement: "top",
            }));
            const __VLS_82 = __VLS_81({
                effect: "dark",
                content: (__VLS_ctx.t('datasource.copy')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            __VLS_83.slots.default;
            const __VLS_84 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                ...{ 'onClick': {} },
                ...{ class: "info-tips hover-icon_with_bg" },
            }));
            const __VLS_86 = __VLS_85({
                ...{ 'onClick': {} },
                ...{ class: "info-tips hover-icon_with_bg" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_85));
            let __VLS_88;
            let __VLS_89;
            let __VLS_90;
            const __VLS_91 = {
                onClick: (...[$event]) => {
                    if (!!(item.type === 'pwd'))
                        return;
                    if (!(props.copyList.includes(item.pkey)))
                        return;
                    __VLS_ctx.copyVal(item.pval);
                }
            };
            __VLS_87.slots.default;
            const __VLS_92 = {}.icon_copy_outlined;
            /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
                ...{ class: "svg-icon" },
            }));
            const __VLS_94 = __VLS_93({
                ...{ class: "svg-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_93));
            var __VLS_87;
            var __VLS_83;
        }
    }
}
/** @type {__VLS_StyleScopedClasses['info-template-container']} */ ;
/** @type {__VLS_StyleScopedClasses['info-template-header']} */ ;
/** @type {__VLS_StyleScopedClasses['info-template-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-template-content']} */ ;
/** @type {__VLS_StyleScopedClasses['clearfix']} */ ;
/** @type {__VLS_StyleScopedClasses['info-content-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item-pwd']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item-pwd-span']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-tip-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-tip-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item-content-val']} */ ;
/** @type {__VLS_StyleScopedClasses['info-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_copy_outlined: icon_copy_outlined,
            icon_invisible_outlined: icon_invisible_outlined,
            icon_visible_outlined: icon_visible_outlined,
            dvInfo: dvInfo,
            t: t,
            curTitle: curTitle,
            copyVal: copyVal,
            settingList: settingList,
            pwdItem: pwdItem,
            tooltipItem: tooltipItem,
            switchPwd: switchPwd,
            edit: edit,
            check: check,
        };
    },
    emits: {},
    props: {
        settingKey: {
            type: String,
            default: 'basic',
        },
        labelTooltips: {
            type: Array,
            default: () => [],
        },
        settingData: {
            type: Array,
            default: () => [],
        },
        settingTitle: {
            type: String,
            default: '',
        },
        hideHead: {
            type: Boolean,
            default: false,
        },
        showValidate: {
            type: Boolean,
            default: false,
        },
        testConnectText: {
            type: String,
            default: null,
        },
        copyList: {
            type: Array,
            default: () => [],
        },
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
        settingKey: {
            type: String,
            default: 'basic',
        },
        labelTooltips: {
            type: Array,
            default: () => [],
        },
        settingData: {
            type: Array,
            default: () => [],
        },
        settingTitle: {
            type: String,
            default: '',
        },
        hideHead: {
            type: Boolean,
            default: false,
        },
        showValidate: {
            type: Boolean,
            default: false,
        },
        testConnectText: {
            type: String,
            default: null,
        },
        copyList: {
            type: Array,
            default: () => [],
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
