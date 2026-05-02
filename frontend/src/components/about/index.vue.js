import aboutBg from '@/assets/embedded/LOGO-about.png';
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user.ts';
const dialogVisible = ref(false);
const { t } = useI18n();
const userStore = useUserStore();
const license = reactive({
    status: 'valid',
    corporation: '杭州飞致云信息科技有限公司',
    expired: '2099-12-31',
    count: 999,
    version: '1.0.0',
    edition: 'Standard',
    serialNo: '',
    remark: '',
    isv: '',
});
const build = ref('1.0.0');
const isAdmin = ref(false);
const fileList = reactive([]);
const dynamicCardClass = ref('');
const initData = () => {
    isAdmin.value = userStore.getUid === '1';
    setLicense({
        status: 'valid',
        corporation: '杭州飞致云信息科技有限公司',
        expired: '2099-12-31',
        count: 999,
        version: '1.0.0',
        edition: 'Standard',
        serialNo: '',
        remark: '',
        isv: '',
    });
};
const beforeUpload = (_file) => {
    ElMessage.info('License 功能已禁用');
    return false;
};
const getLicenseInfo = () => {
    initData();
};
const setLicense = (lic) => {
    const lic_obj = {
        status: lic.status,
        corporation: lic.corporation,
        expired: lic.expired,
        count: lic.count,
        version: lic.version,
        edition: lic.edition,
        serialNo: lic.serialNo,
        remark: lic.remark,
        isv: lic.isv,
    };
    Object.assign(license, lic_obj);
    if (license?.serialNo && license?.remark) {
        dynamicCardClass.value = 'about-card-max';
    }
    else if (!license?.serialNo && !license?.remark) {
        dynamicCardClass.value = '';
    }
    else {
        dynamicCardClass.value = 'about-card-medium';
    }
};
const open = () => {
    dialogVisible.value = true;
    getLicenseInfo();
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
    title: (__VLS_ctx.t('about.title')),
    width: "840px",
    modalClass: "about-dialog",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.t('about.title')),
    width: "840px",
    modalClass: "about-dialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "color-overlay flex-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    width: "368",
    height: "84",
    src: (__VLS_ctx.aboutBg),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('about.auth_to'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.license.corporation);
if (__VLS_ctx.license.isv) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value" },
    });
    (__VLS_ctx.license.isv);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('about.expiration_time'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
    ...{ class: ({ 'expired-mark': __VLS_ctx.license.status === 'expired' }) },
});
(__VLS_ctx.license.expired);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('about.version'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(!__VLS_ctx.license?.edition
    ? __VLS_ctx.$t('about.standard')
    : __VLS_ctx.license.edition === 'Embedded'
        ? __VLS_ctx.$t('about.Embedded')
        : __VLS_ctx.license.edition === 'Professional'
            ? __VLS_ctx.$t('about.Professional')
            : __VLS_ctx.$t('about.enterprise'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('about.version_num'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.build);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('about.serial_no'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.license.serialNo || '-');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.$t('about.remark'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value ellipsis" },
});
(__VLS_ctx.license.remark || '-');
if (__VLS_ctx.isAdmin) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
        ...{ class: "lic_rooter" },
    });
    const __VLS_5 = {}.ElUpload;
    /** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        action: "",
        multiple: (false),
        showFileList: (false),
        fileList: (__VLS_ctx.fileList),
        accept: ".key",
        name: "file",
        beforeUpload: (__VLS_ctx.beforeUpload),
    }));
    const __VLS_7 = __VLS_6({
        action: "",
        multiple: (false),
        showFileList: (false),
        fileList: (__VLS_ctx.fileList),
        accept: ".key",
        name: "file",
        beforeUpload: (__VLS_ctx.beforeUpload),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_8.slots.default;
    const __VLS_9 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        plain: true,
    }));
    const __VLS_11 = __VLS_10({
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    (__VLS_ctx.$t('about.update_license'));
    var __VLS_12;
    var __VLS_8;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "name" },
});
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['color-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-center']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['expired-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['lic_rooter']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            aboutBg: aboutBg,
            dialogVisible: dialogVisible,
            t: t,
            license: license,
            build: build,
            isAdmin: isAdmin,
            fileList: fileList,
            beforeUpload: beforeUpload,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
