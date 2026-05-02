import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SuccessFilled from '@/assets/svg/gou_icon.svg';
import CircleCloseFilled from '@/assets/svg/icon_ban_filled.svg';
import icon_warning_filled from '@/assets/svg/icon_info_colorful.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import icon_visible_outlined_blod from '@/assets/embedded/icon_visible_outlined_blod.svg';
import icon_copy_outlined from '@/assets/svg/icon_copy_outlined.svg';
import IconOpeDelete from '@/assets/svg/icon_delete.svg';
import icon_invisible_outlined from '@/assets/embedded/icon_invisible_outlined.svg';
import icon_visible_outlined from '@/assets/embedded/icon_visible_outlined.svg';
import { formatTimestamp } from '@/utils/date';
import { useClipboard } from '@vueuse/core';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import { request } from '@/utils/request';
const { t } = useI18n();
const limitCount = ref(5);
const limitValid = ref(true);
const triggerLimit = computed(() => {
    return limitValid.value && state.tableData.length >= limitCount.value;
});
const state = reactive({
    tableData: [],
});
const handleAdd = () => {
    if (triggerLimit.value) {
        return;
    }
    request.post('/system/apikey', {}).then(() => {
        loadGridData();
    });
};
const pwd = ref('**********');
const toApiDoc = () => {
    console.log('Add API Key');
    const url = '/docs';
    window.open(url, '_blank');
};
const statusHandler = (row) => {
    const param = {
        id: row.id,
        status: row.status,
    };
    request.put('/system/apikey/status', param).then(() => {
        loadGridData();
    });
};
const { copy } = useClipboard({ legacy: true });
const copyCode = (row, key = 'secret_key') => {
    copy(row[key])
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
const deleteHandler = (row) => {
    ElMessageBox.confirm(t('user.del_key', { msg: row.access_key }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
        callback: (action) => {
            if (action === 'confirm') {
                request.delete(`/system/apikey/${row.id}`).then(() => {
                    loadGridData();
                    ElMessage({
                        type: 'success',
                        message: t('dashboard.delete_success'),
                    });
                });
            }
        },
    });
};
const sortChange = (param) => {
    if (param?.order === 'ascending') {
        state.tableData.sort((a, b) => a.create_time - b.create_time);
    }
    else {
        state.tableData.sort((a, b) => b.create_time - a.create_time);
    }
};
const loadGridData = () => {
    request.get('/system/apikey').then((res) => {
        state.tableData = res || [];
    });
};
onMounted(() => {
    loadGridData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-apikey-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "warn-template" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-span" },
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
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    name: "icon_warning_filled",
}));
const __VLS_6 = __VLS_5({
    name: "icon_warning_filled",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.icon_warning_filled;
/** @type {[typeof __VLS_components.Icon_warning_filled, typeof __VLS_components.icon_warning_filled, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "svg-icon" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "svg-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
var __VLS_7;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "warn-template-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.t('api_key.info_tips'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "api-key-btn" },
});
if (__VLS_ctx.triggerLimit) {
    const __VLS_12 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.t('api_key.trigger_limit', [__VLS_ctx.limitCount])),
        placement: "top",
    }));
    const __VLS_14 = __VLS_13({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.t('api_key.trigger_limit', [__VLS_ctx.limitCount])),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    if (__VLS_ctx.triggerLimit) {
        const __VLS_16 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            type: "info",
            disabled: true,
        }));
        const __VLS_18 = __VLS_17({
            type: "info",
            disabled: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_19.slots;
            const __VLS_20 = {}.icon_add_outlined;
            /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
            const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        }
        (__VLS_ctx.$t('api_key.create'));
        var __VLS_19;
    }
    var __VLS_15;
}
else {
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.handleAdd)
    };
    __VLS_27.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_27.slots;
        const __VLS_32 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    (__VLS_ctx.$t('api_key.create'));
    var __VLS_27;
}
const __VLS_36 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_38 = __VLS_37({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onClick: (__VLS_ctx.toApiDoc)
};
__VLS_39.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_39.slots;
    const __VLS_44 = {}.icon_visible_outlined_blod;
    /** @type {[typeof __VLS_components.Icon_visible_outlined_blod, typeof __VLS_components.icon_visible_outlined_blod, typeof __VLS_components.Icon_visible_outlined_blod, typeof __VLS_components.icon_visible_outlined_blod, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
}
(__VLS_ctx.$t('api_key.to_doc'));
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "api-key-grid" },
});
const __VLS_48 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onSortChange': {} },
    ref: "multipleTableRef",
    data: (__VLS_ctx.state.tableData),
    ...{ style: {} },
}));
const __VLS_50 = __VLS_49({
    ...{ 'onSortChange': {} },
    ref: "multipleTableRef",
    data: (__VLS_ctx.state.tableData),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onSortChange: (__VLS_ctx.sortChange)
};
/** @type {typeof __VLS_ctx.multipleTableRef} */ ;
var __VLS_56 = {};
__VLS_51.slots.default;
const __VLS_58 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    prop: "access_key",
    label: "Access Key",
    width: "206",
}));
const __VLS_60 = __VLS_59({
    prop: "access_key",
    label: "Access Key",
    width: "206",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_61.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_61.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "user-status-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        title: (scope.row.access_key),
        ...{ class: "ellipsis" },
        ...{ style: {} },
    });
    (scope.row.access_key);
    const __VLS_62 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }));
    const __VLS_64 = __VLS_63({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_65.slots.default;
    const __VLS_66 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        ...{ 'onClick': {} },
        size: "16",
        ...{ class: "hover-icon_with_bg" },
    }));
    const __VLS_68 = __VLS_67({
        ...{ 'onClick': {} },
        size: "16",
        ...{ class: "hover-icon_with_bg" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    let __VLS_70;
    let __VLS_71;
    let __VLS_72;
    const __VLS_73 = {
        onClick: (...[$event]) => {
            __VLS_ctx.copyCode(scope.row, 'access_key');
        }
    };
    __VLS_69.slots.default;
    const __VLS_74 = {}.icon_copy_outlined;
    /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({}));
    const __VLS_76 = __VLS_75({}, ...__VLS_functionalComponentArgsRest(__VLS_75));
    var __VLS_69;
    var __VLS_65;
}
var __VLS_61;
const __VLS_78 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
    prop: "secret_key",
    label: "Secret Key",
    width: "206",
}));
const __VLS_80 = __VLS_79({
    prop: "secret_key",
    label: "Secret Key",
    width: "206",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
__VLS_81.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_81.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "user-status-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        title: (scope.row.showPwd ? scope.row.secret_key : __VLS_ctx.pwd),
        ...{ class: "ellipsis" },
        ...{ style: {} },
    });
    (scope.row.showPwd ? scope.row.secret_key : __VLS_ctx.pwd);
    const __VLS_82 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }));
    const __VLS_84 = __VLS_83({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_85.slots.default;
    const __VLS_86 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        ...{ 'onClick': {} },
        ...{ class: "hover-icon_with_bg" },
        size: "16",
    }));
    const __VLS_88 = __VLS_87({
        ...{ 'onClick': {} },
        ...{ class: "hover-icon_with_bg" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    let __VLS_90;
    let __VLS_91;
    let __VLS_92;
    const __VLS_93 = {
        onClick: (...[$event]) => {
            __VLS_ctx.copyCode(scope.row);
        }
    };
    __VLS_89.slots.default;
    const __VLS_94 = {}.icon_copy_outlined;
    /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({}));
    const __VLS_96 = __VLS_95({}, ...__VLS_functionalComponentArgsRest(__VLS_95));
    var __VLS_89;
    var __VLS_85;
    if (scope.row.showPwd) {
        const __VLS_98 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
            offset: (12),
            effect: "dark",
            content: (__VLS_ctx.t('embedded.click_to_hide')),
            placement: "top",
        }));
        const __VLS_100 = __VLS_99({
            offset: (12),
            effect: "dark",
            content: (__VLS_ctx.t('embedded.click_to_hide')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        __VLS_101.slots.default;
        const __VLS_102 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            ...{ 'onClick': {} },
            ...{ class: "hover-icon_with_bg" },
            size: "16",
        }));
        const __VLS_104 = __VLS_103({
            ...{ 'onClick': {} },
            ...{ class: "hover-icon_with_bg" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        let __VLS_106;
        let __VLS_107;
        let __VLS_108;
        const __VLS_109 = {
            onClick: (...[$event]) => {
                if (!(scope.row.showPwd))
                    return;
                scope.row.showPwd = false;
            }
        };
        __VLS_105.slots.default;
        const __VLS_110 = {}.icon_visible_outlined;
        /** @type {[typeof __VLS_components.Icon_visible_outlined, typeof __VLS_components.icon_visible_outlined, typeof __VLS_components.Icon_visible_outlined, typeof __VLS_components.icon_visible_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({}));
        const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
        var __VLS_105;
        var __VLS_101;
    }
    if (!scope.row.showPwd) {
        const __VLS_114 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            offset: (12),
            effect: "dark",
            content: (__VLS_ctx.t('embedded.click_to_show')),
            placement: "top",
        }));
        const __VLS_116 = __VLS_115({
            offset: (12),
            effect: "dark",
            content: (__VLS_ctx.t('embedded.click_to_show')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        __VLS_117.slots.default;
        const __VLS_118 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
            ...{ 'onClick': {} },
            ...{ class: "hover-icon_with_bg" },
            size: "16",
        }));
        const __VLS_120 = __VLS_119({
            ...{ 'onClick': {} },
            ...{ class: "hover-icon_with_bg" },
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        let __VLS_122;
        let __VLS_123;
        let __VLS_124;
        const __VLS_125 = {
            onClick: (...[$event]) => {
                if (!(!scope.row.showPwd))
                    return;
                scope.row.showPwd = true;
            }
        };
        __VLS_121.slots.default;
        const __VLS_126 = {}.icon_invisible_outlined;
        /** @type {[typeof __VLS_components.Icon_invisible_outlined, typeof __VLS_components.icon_invisible_outlined, typeof __VLS_components.Icon_invisible_outlined, typeof __VLS_components.icon_invisible_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({}));
        const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
        var __VLS_121;
        var __VLS_117;
    }
}
var __VLS_81;
const __VLS_130 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
    prop: "status",
    width: "100",
    label: (__VLS_ctx.t('datasource.enabled_status')),
}));
const __VLS_132 = __VLS_131({
    prop: "status",
    width: "100",
    label: (__VLS_ctx.t('datasource.enabled_status')),
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
__VLS_133.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_133.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "api-status-container" },
        ...{ class: ([scope.row.status ? 'active' : 'disabled']) },
    });
    const __VLS_134 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
        size: "16",
    }));
    const __VLS_136 = __VLS_135({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    __VLS_137.slots.default;
    if (scope.row.status) {
        const __VLS_138 = {}.SuccessFilled;
        /** @type {[typeof __VLS_components.SuccessFilled, ]} */ ;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({}));
        const __VLS_140 = __VLS_139({}, ...__VLS_functionalComponentArgsRest(__VLS_139));
    }
    else {
        const __VLS_142 = {}.CircleCloseFilled;
        /** @type {[typeof __VLS_components.CircleCloseFilled, ]} */ ;
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({}));
        const __VLS_144 = __VLS_143({}, ...__VLS_functionalComponentArgsRest(__VLS_143));
    }
    var __VLS_137;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t(`user.${scope.row.status ? 'enabled' : 'disabled'}`));
}
var __VLS_133;
const __VLS_146 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    prop: "create_time",
    width: "180",
    sortable: true,
    label: (__VLS_ctx.t('user.creation_time')),
}));
const __VLS_148 = __VLS_147({
    prop: "create_time",
    width: "180",
    sortable: true,
    label: (__VLS_ctx.t('user.creation_time')),
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
__VLS_149.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_149.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatTimestamp(scope.row.create_time, 'YYYY-MM-DD HH:mm:ss'));
}
var __VLS_149;
const __VLS_150 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    fixed: "right",
    width: "100",
    label: (__VLS_ctx.$t('ds.actions')),
}));
const __VLS_152 = __VLS_151({
    fixed: "right",
    width: "100",
    label: (__VLS_ctx.$t('ds.actions')),
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_153.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-operate" },
    });
    const __VLS_154 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
        ...{ 'onChange': {} },
        modelValue: (scope.row.status),
        activeValue: (true),
        inactiveValue: (false),
        size: "small",
    }));
    const __VLS_156 = __VLS_155({
        ...{ 'onChange': {} },
        modelValue: (scope.row.status),
        activeValue: (true),
        inactiveValue: (false),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    let __VLS_158;
    let __VLS_159;
    let __VLS_160;
    const __VLS_161 = {
        onChange: (...[$event]) => {
            __VLS_ctx.statusHandler(scope.row);
        }
    };
    var __VLS_157;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "line" },
    });
    const __VLS_162 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('dashboard.delete')),
        placement: "top",
    }));
    const __VLS_164 = __VLS_163({
        offset: (14),
        effect: "dark",
        content: (__VLS_ctx.$t('dashboard.delete')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_163));
    __VLS_165.slots.default;
    const __VLS_166 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }));
    const __VLS_168 = __VLS_167({
        ...{ 'onClick': {} },
        ...{ class: "action-btn" },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    let __VLS_170;
    let __VLS_171;
    let __VLS_172;
    const __VLS_173 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteHandler(scope.row);
        }
    };
    __VLS_169.slots.default;
    const __VLS_174 = {}.IconOpeDelete;
    /** @type {[typeof __VLS_components.IconOpeDelete, typeof __VLS_components.IconOpeDelete, ]} */ ;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({}));
    const __VLS_176 = __VLS_175({}, ...__VLS_functionalComponentArgsRest(__VLS_175));
    var __VLS_169;
    var __VLS_165;
}
var __VLS_153;
{
    const { empty: __VLS_thisSlot } = __VLS_51.slots;
    if (!__VLS_ctx.state.tableData.length) {
        /** @type {[typeof EmptyBackground, ]} */ ;
        // @ts-ignore
        const __VLS_178 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
            description: (__VLS_ctx.$t('datasource.relevant_content_found')),
            imgType: "none",
        }));
        const __VLS_179 = __VLS_178({
            description: (__VLS_ctx.$t('datasource.relevant_content_found')),
            imgType: "none",
        }, ...__VLS_functionalComponentArgsRest(__VLS_178));
    }
}
var __VLS_51;
/** @type {__VLS_StyleScopedClasses['sqlbot-apikey-container']} */ ;
/** @type {__VLS_StyleScopedClasses['warn-template']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-span']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['warn-template-content']} */ ;
/** @type {__VLS_StyleScopedClasses['api-key-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['api-key-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['user-status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['user-status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-icon_with_bg']} */ ;
/** @type {__VLS_StyleScopedClasses['api-status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-operate']} */ ;
/** @type {__VLS_StyleScopedClasses['line']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
// @ts-ignore
var __VLS_57 = __VLS_56;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SuccessFilled: SuccessFilled,
            CircleCloseFilled: CircleCloseFilled,
            icon_warning_filled: icon_warning_filled,
            icon_add_outlined: icon_add_outlined,
            icon_visible_outlined_blod: icon_visible_outlined_blod,
            icon_copy_outlined: icon_copy_outlined,
            IconOpeDelete: IconOpeDelete,
            icon_invisible_outlined: icon_invisible_outlined,
            icon_visible_outlined: icon_visible_outlined,
            formatTimestamp: formatTimestamp,
            EmptyBackground: EmptyBackground,
            t: t,
            limitCount: limitCount,
            triggerLimit: triggerLimit,
            state: state,
            handleAdd: handleAdd,
            pwd: pwd,
            toApiDoc: toApiDoc,
            statusHandler: statusHandler,
            copyCode: copyCode,
            deleteHandler: deleteHandler,
            sortChange: sortChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
