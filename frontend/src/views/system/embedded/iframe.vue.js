import { ref, computed, reactive, nextTick } from 'vue';
import icon_searchOutline_outlined from '@/assets/svg/icon_search-outline_outlined.svg';
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg';
import icon_close_outlined from '@/assets/svg/operate/ope-close.svg';
import EmptyBackground from '@/views/dashboard/common/EmptyBackground.vue';
import icon_database_colorful from '@/assets/embedded/icon_database_colorful.png';
import icon_web_site_colorful from '@/assets/embedded/icon_web-site_colorful.png';
import floating_window from '@/assets/embedded/window.png';
import full_window from '@/assets/embedded/Card.png';
import icon_edit_outlined from '@/assets/svg/icon_edit_outlined.svg';
import icon_delete from '@/assets/svg/icon_delete.svg';
import icon_copy_outlined from '@/assets/embedded/icon_copy_outlined.svg';
import { useClipboard } from '@vueuse/core';
import SetUi from './SetUi.vue';
import Card from './Card.vue';
// import { workspaceList } from '@/api/workspace'
import DsCard from './DsCard.vue';
import { getList, updateAssistant, saveAssistant, delOne, dsApi } from '@/api/embedded';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash-es';
import { useUserStore } from '@/stores/user.ts';
const userStore = useUserStore();
const __VLS_props = defineProps({
    btnSelect: {
        type: String,
        default: '',
    },
});
// const emits = defineEmits(['btnSelectChange'])
const { t } = useI18n();
const { copy } = useClipboard({ legacy: true });
const keywords = ref('');
const activeStep = ref(0);
const ruleConfigvVisible = ref(false);
const drawerConfigvVisible = ref(false);
const advancedApplication = ref(false);
const editRule = ref(0);
const embeddedFormRef = ref();
const dsFormRef = ref();
const urlFormRef = ref();
const certificateFormRef = ref();
const dialogTitle = ref('');
const drawerTitle = ref('');
const activeMode = ref('full');
const embeddedList = ref([]);
const systemCredentials = ['localStorage', 'custom', 'cookie', 'sessionStorage'];
const credentials = ['header', 'cookie', 'param'];
const defaultEmbedded = {
    id: '',
    name: '',
    type: 0,
    description: '',
    configuration: '',
    domain: '',
};
const currentEmbedded = reactive(cloneDeep(defaultEmbedded));
const isCreate = ref(false);
const defaultForm = {
    oid: 1,
    public_list: [],
    private_list: [],
    auto_ds: false,
};
const dsForm = reactive(cloneDeep(defaultForm));
const defaultCertificateForm = {
    id: '',
    type: '',
    source: '',
    target: '',
    target_key: '',
    target_val: '',
};
const certificateForm = reactive(cloneDeep(defaultCertificateForm));
const defaultUrlForm = {
    endpoint: '',
    timeout: 10,
    encrypt: false,
    aes_key: '',
    aes_iv: '',
    certificate: [],
    auto_ds: false,
};
const urlForm = reactive(cloneDeep(defaultUrlForm));
const dsListOptions = ref([]);
const embeddedListWithSearch = computed(() => {
    if (!keywords.value)
        return embeddedList.value;
    return embeddedList.value.filter((ele) => ele.name.toLowerCase().includes(keywords.value.toLowerCase()));
});
const userTypeList = [
    {
        name: t('embedded.basic_application'),
        img: icon_database_colorful,
        tip: t('embedded.support_is_required'),
        value: 0,
    },
    {
        name: t('embedded.advanced_application'),
        img: icon_web_site_colorful,
        tip: t('embedded.data_permissions_etc'),
        value: 1,
    },
];
const handleAddEmbedded = (val) => {
    Object.assign(currentEmbedded, cloneDeep(defaultEmbedded));
    Object.keys(dsForm).forEach((ele) => {
        if (!['oid', 'public_list', 'private_list'].includes(ele)) {
            delete dsForm[ele];
        }
    });
    Object.assign(urlForm, cloneDeep(defaultUrlForm));
    currentEmbedded.type = val;
    if (val === 0) {
        handleBaseEmbedded(null);
    }
    else {
        handleAdvancedEmbedded(null);
    }
};
const getDsList = () => {
    dsApi(dsForm.oid).then((res) => {
        dsListOptions.value = res || [];
    });
};
const handleBaseEmbedded = (row) => {
    advancedApplication.value = false;
    if (row) {
        Object.assign(dsForm, JSON.parse(row.configuration));
    }
    else {
        Object.assign(dsForm, { oid: userStore.getOid });
    }
    getDsList();
    ruleConfigvVisible.value = true;
    dialogTitle.value = row?.id
        ? t('embedded.edit_basic_applications')
        : t('embedded.create_basic_application');
};
const handleAdvancedEmbedded = (row) => {
    advancedApplication.value = true;
    if (row) {
        const tempData = cloneDeep(JSON.parse(row.configuration));
        if (tempData?.endpoint.startsWith('http')) {
            row.domain
                .trim()
                .split(',')
                .forEach((domain) => {
                tempData.endpoint = tempData.endpoint.replace(domain, '');
            });
        }
        Object.assign(urlForm, tempData);
    }
    ruleConfigvVisible.value = true;
    dialogTitle.value = row?.id
        ? t('embedded.edit_advanced_applications')
        : t('embedded.creating_advanced_applications');
};
const beforeClose = () => {
    ruleConfigvVisible.value = false;
    activeStep.value = 0;
    isCreate.value = false;
    Object.assign(currentEmbedded, cloneDeep(defaultEmbedded));
    Object.assign(dsForm, cloneDeep(defaultForm));
    Object.assign(urlForm, cloneDeep(defaultUrlForm));
    if (embeddedFormRef.value) {
        embeddedFormRef.value.clearValidate();
    }
    if (dsFormRef.value) {
        dsFormRef.value.clearValidate();
    }
    if (urlFormRef.value) {
        urlFormRef.value.clearValidate();
    }
};
const handleActive = (row) => {
    console.info('row', row);
};
const handlePrivate = (row) => {
    dsForm.public_list = dsForm.public_list.filter((ele) => ele !== row.id);
};
const handlePublic = (row) => {
    dsForm.public_list.push(row.id);
};
const searchLoading = ref(false);
const handleSearch = () => {
    searchLoading.value = true;
    getList()
        .then((res) => {
        embeddedList.value = res || [];
    })
        .finally(() => {
        searchLoading.value = false;
    });
};
handleSearch();
const handleEditRule = (row) => {
    Object.assign(currentEmbedded, cloneDeep(row));
    delete currentEmbedded.configuration;
    if (row.type === 0) {
        handleBaseEmbedded(row);
    }
    else {
        handleAdvancedEmbedded(row);
    }
};
// const deleteRuleHandler = (row: any) => {
//   ElMessageBox.confirm(t('permission.rule_rule_1', { msg: row.name }), {
//     confirmButtonType: 'danger',
//     confirmButtonText: t('dashboard.delete'),
//     cancelButtonText: t('common.cancel'),
//     customClass: 'confirm-no_icon',
//     autofocus: false,
//   }).then(() => {
//     currentEmbedded.permissions = currentEmbedded.permissions.filter(
//       (ele: any) => ele.id !== row.id
//     )
//   })
// }
const deleteHandler = (row) => {
    ElMessageBox.confirm(t('embedded.delete', { msg: row.name }), {
        confirmButtonType: 'danger',
        confirmButtonText: t('dashboard.delete'),
        cancelButtonText: t('common.cancel'),
        customClass: 'confirm-no_icon',
        autofocus: false,
    }).then(() => {
        delOne(row.id).then(() => {
            ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
            });
            handleSearch();
        });
    });
};
const setUiRef = ref();
const handleSetUi = (row) => {
    setUiRef.value.open(row);
};
const splitString = (str) => {
    if (typeof str !== 'string') {
        return [];
    }
    return str
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter((item) => item !== '');
};
const validateUrl = (_, value, callback) => {
    if (value === '') {
        callback(new Error(t('datasource.please_enter') + t('common.empty') + t('embedded.cross_domain_settings')));
    }
    else {
        // var Expression = /(https?:\/\/)?([\da-z\.-]+)\.([a-z]{2,6})(:\d{1,5})?([\/\w\.-]*)*\/?(#[\S]+)?/ // eslint-disable-line
        splitString(value).forEach((tempVal) => {
            var Expression = /^https?:\/\/[^\s/?#]+(:\d+)?/i;
            var objExp = new RegExp(Expression);
            if (objExp.test(tempVal) && !tempVal.endsWith('/')) {
                callback();
            }
            else {
                callback(t('embedded.format_is_incorrect', { msg: t('embedded.domain_format_incorrect') }));
            }
        });
    }
};
const rules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('embedded.application_name'),
            trigger: 'blur',
        },
    ],
    domain: [
        {
            required: true,
            validator: validateUrl,
            trigger: 'blur',
        },
    ],
};
const dsRules = {
    oid: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('user.workspace'),
            trigger: 'change',
        },
    ],
};
const validatePass = (_, value, callback) => {
    if (value === '') {
        callback(new Error(t('datasource.please_enter') + t('common.empty') + t('embedded.interface_url')));
    }
    else {
        // var Expression = /(https?:\/\/)?([\da-z\.-]+)\.([a-z]{2,6})(:\d{1,5})?([\/\w\.-]*)*\/?(#[\S]+)?/ // eslint-disable-line
        // var Expression = /^https?:\/\/[^\s/?#]+(:\d+)?/i
        var Expression = /^\/([a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+(\?[a-zA-Z0-9_=&-]+)?$/;
        var objExp = new RegExp(Expression);
        if (objExp.test(value)) {
            callback();
        }
        else {
            callback(t('embedded.format_is_incorrect', { msg: t('embedded.interface_url_incorrect') }));
        }
    }
};
const validateCertificate = (_, value, callback) => {
    if (!value.length) {
        callback(new Error(t('menu.add_interface_credentials')));
    }
    else {
        callback();
    }
};
const validateTimeout = (_, value, callback) => {
    if (value === null) {
        callback(new Error(t('datasource.please_enter') + t('common.empty') + t('ds.form.timeout')));
    }
    else {
        callback();
    }
};
const urlRules = {
    endpoint: [
        {
            required: true,
            validator: validatePass,
            trigger: 'blur',
        },
    ],
    timeout: [
        {
            required: true,
            validator: validateTimeout,
            trigger: 'change',
        },
    ],
    certificate: [
        {
            required: true,
            validator: validateCertificate,
            trigger: 'change',
        },
    ],
};
const certificateRules = {
    type: [
        {
            required: true,
            message: t('datasource.Please_select') + t('common.empty') + t('embedded.system_credential_type'),
            trigger: 'change',
        },
    ],
    source: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('embedded.credential_name'),
            trigger: 'blur',
        },
    ],
    target: [
        {
            required: true,
            message: t('datasource.Please_select') +
                t('common.empty') +
                t('embedded.target_credential_location'),
            trigger: 'change',
        },
    ],
    target_key: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('embedded.target_credential_name'),
            trigger: 'blur',
        },
    ],
};
const preview = () => {
    activeStep.value = 0;
};
const next = () => {
    embeddedFormRef.value.validate((res) => {
        if (res) {
            activeStep.value = 1;
        }
    });
};
const saveEmbedded = () => {
    const req = currentEmbedded.id ? updateAssistant : saveAssistant;
    const formRef = currentEmbedded.type === 1 ? urlFormRef : dsFormRef;
    formRef.value.validate((res) => {
        if (res) {
            const obj = { ...currentEmbedded };
            if (currentEmbedded.type === 0) {
                obj.configuration = JSON.stringify(dsForm);
            }
            else {
                obj.configuration = JSON.stringify(urlForm);
            }
            if (!currentEmbedded.id) {
                delete obj.id;
            }
            req(obj).then(() => {
                ElMessage({
                    type: 'success',
                    message: t('common.save_success'),
                });
                beforeClose();
                handleSearch();
            });
        }
    });
};
const dialogVisible = ref(false);
const scriptElement = ref('');
const jsCodeElement = ref('');
const jsCodeElementFull = ref('');
const handleEmbedded = (row) => {
    dialogVisible.value = true;
    const { origin, pathname } = window.location;
    scriptElement.value = `g-#script
  async
  defer
  id="sqlbot-assistant-float-script-${row.id}"
  src="${origin + pathname}assistant.js?id=${row.id}"k-*g-#/scriptk-*`
        .replaceAll('g-#', '<')
        .replaceAll('k-*', '>');
    jsCodeElement.value = `(function(){
    const script = document.createElement('script');
    script.defer = true;
    script.async = true;
    script.src = "${origin + pathname}assistant.js?id=${row.id}";
    script.id = "sqlbot-assistant-float-script-${row.id}";
    document.head.appendChild(script);
  })()`;
    jsCodeElementFull.value = `(function(){
    const script = document.createElement('script');
    script.defer = true;
    script.async = true;
    script.src = "${origin + pathname}xpack_static/sqlbot-embedded-dynamic.umd.js";
    document.head.appendChild(script);
  })()
  let sqlbot_embedded_timer = setInterval(() => {
    if (sqlbot_embedded_handler?.mounted) {
      sqlbot_embedded_handler.mounted('.copilot', { "embeddedId": "${row.id}" })
      clearInterval(sqlbot_embedded_timer)
    }
  }, 1000)
  `;
};
const copyJsCode = () => {
    copy(jsCodeElement.value)
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
const copyJsCodeFull = () => {
    copy(jsCodeElementFull.value)
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
const copyCode = () => {
    copy(scriptElement.value)
        .then(function () {
        ElMessage.success(t('embedded.copy_successful'));
    })
        .catch(function () {
        ElMessage.error(t('embedded.copy_failed'));
    });
};
const certificateBeforeClose = () => {
    drawerConfigvVisible.value = false;
    Object.assign(certificateForm, cloneDeep(defaultCertificateForm));
    certificateFormRef.value.clearValidate();
};
const initCertificate = (row) => {
    drawerTitle.value = t('embedded.add_interface_credentials');
    if (row) {
        Object.assign(certificateForm, cloneDeep(row));
        drawerTitle.value = t('embedded.edit_interface_credentials');
    }
    else {
        Object.assign(certificateForm, cloneDeep(defaultCertificateForm));
    }
    drawerConfigvVisible.value = true;
    nextTick(() => {
        certificateFormRef.value.clearValidate();
    });
};
const handleCredentialsDel = (row) => {
    urlForm.certificate = urlForm.certificate.filter((ele) => ele.id !== row.id);
};
const saveHandler = () => {
    certificateFormRef.value.validate((res) => {
        if (res) {
            if (certificateForm.id) {
                for (const key in urlForm.certificate) {
                    if (Object.prototype.hasOwnProperty.call(urlForm.certificate, key)) {
                        if (urlForm.certificate[key].id === certificateForm.id) {
                            Object.assign(urlForm.certificate[key], cloneDeep(certificateForm));
                        }
                    }
                }
            }
            else {
                urlForm.certificate.push({ ...cloneDeep(certificateForm), id: +new Date() });
            }
            ElMessage({
                type: 'success',
                message: t('common.save_success'),
            });
            urlFormRef.value.validate('certificate');
            certificateBeforeClose();
        }
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "embedded-index no-padding" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.searchLoading) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
(__VLS_ctx.t('embedded.assistant_app'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('dashboard.search')),
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.keywords),
    ...{ style: {} },
    placeholder: (__VLS_ctx.$t('dashboard.search')),
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_4 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.icon_searchOutline_outlined;
    /** @type {[typeof __VLS_components.Icon_searchOutline_outlined, typeof __VLS_components.icon_searchOutline_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
}
var __VLS_3;
const __VLS_12 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    popperClass: "system-embedded_user",
    placement: "bottom-end",
}));
const __VLS_14 = __VLS_13({
    popperClass: "system-embedded_user",
    placement: "bottom-end",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
{
    const { reference: __VLS_thisSlot } = __VLS_15.slots;
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        type: "primary",
    }));
    const __VLS_18 = __VLS_17({
        type: "primary",
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
    (__VLS_ctx.$t('embedded.create_application'));
    var __VLS_19;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popover-content" },
});
for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.userTypeList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleAddEmbedded(ele.value);
            } },
        key: (ele.name),
        ...{ class: "popover-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (ele.img),
        ...{ style: {} },
        width: "32px",
        height: "32px",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "embedded" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name" },
    });
    (ele.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tip" },
    });
    (ele.tip);
}
var __VLS_15;
if (!!__VLS_ctx.keywords && !__VLS_ctx.embeddedListWithSearch.length) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
        ...{ class: "ed-empty_pd0" },
    }));
    const __VLS_25 = __VLS_24({
        description: (__VLS_ctx.$t('datasource.relevant_content_found')),
        imgType: "tree",
        ...{ class: "ed-empty_pd0" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    const __VLS_27 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        gutter: (16),
        ...{ class: "w-full" },
    }));
    const __VLS_29 = __VLS_28({
        gutter: (16),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_30.slots.default;
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.embeddedListWithSearch))) {
        const __VLS_31 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }));
        const __VLS_33 = __VLS_32({
            key: (ele.id),
            xs: (24),
            sm: (12),
            md: (12),
            lg: (8),
            xl: (6),
            ...{ class: "mb-16" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        __VLS_34.slots.default;
        /** @type {[typeof Card, typeof Card, ]} */ ;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(Card, new Card({
            ...{ 'onEmbedded': {} },
            ...{ 'onEdit': {} },
            ...{ 'onDel': {} },
            ...{ 'onUi': {} },
            id: (ele.id),
            key: (ele.id),
            name: (ele.name),
            isBase: (ele.type === 0),
            description: (ele.description),
            logo: (JSON.parse(ele.configuration).logo),
        }));
        const __VLS_36 = __VLS_35({
            ...{ 'onEmbedded': {} },
            ...{ 'onEdit': {} },
            ...{ 'onDel': {} },
            ...{ 'onUi': {} },
            id: (ele.id),
            key: (ele.id),
            name: (ele.name),
            isBase: (ele.type === 0),
            description: (ele.description),
            logo: (JSON.parse(ele.configuration).logo),
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        let __VLS_38;
        let __VLS_39;
        let __VLS_40;
        const __VLS_41 = {
            onEmbedded: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.embeddedListWithSearch.length))
                    return;
                __VLS_ctx.handleEmbedded(ele);
            }
        };
        const __VLS_42 = {
            onEdit: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.embeddedListWithSearch.length))
                    return;
                __VLS_ctx.handleEditRule(ele);
            }
        };
        const __VLS_43 = {
            onDel: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.embeddedListWithSearch.length))
                    return;
                __VLS_ctx.deleteHandler(ele);
            }
        };
        const __VLS_44 = {
            onUi: (...[$event]) => {
                if (!!(!!__VLS_ctx.keywords && !__VLS_ctx.embeddedListWithSearch.length))
                    return;
                __VLS_ctx.handleSetUi(ele);
            }
        };
        var __VLS_37;
        var __VLS_34;
    }
    var __VLS_30;
}
if (!__VLS_ctx.keywords && !__VLS_ctx.embeddedListWithSearch.length && !__VLS_ctx.searchLoading) {
    /** @type {[typeof EmptyBackground, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(EmptyBackground, new EmptyBackground({
        ...{ class: "ed-empty_custom" },
        description: (__VLS_ctx.$t('embedded.no_application')),
        imgType: "noneWhite",
    }));
    const __VLS_46 = __VLS_45({
        ...{ class: "ed-empty_custom" },
        description: (__VLS_ctx.$t('embedded.no_application')),
        imgType: "noneWhite",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_48 = {}.ElPopover;
    /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        popperClass: "system-embedded_user",
        placement: "bottom",
    }));
    const __VLS_50 = __VLS_49({
        popperClass: "system-embedded_user",
        placement: "bottom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    {
        const { reference: __VLS_thisSlot } = __VLS_51.slots;
        const __VLS_52 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            type: "primary",
        }));
        const __VLS_54 = __VLS_53({
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_55.slots;
            const __VLS_56 = {}.icon_add_outlined;
            /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
            const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        }
        (__VLS_ctx.$t('embedded.create_application'));
        var __VLS_55;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popover-content" },
    });
    for (const [ele] of __VLS_getVForSourceType((__VLS_ctx.userTypeList))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.keywords && !__VLS_ctx.embeddedListWithSearch.length && !__VLS_ctx.searchLoading))
                        return;
                    __VLS_ctx.handleAddEmbedded(ele.value);
                } },
            key: (ele.name),
            ...{ class: "popover-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (ele.img),
            ...{ style: {} },
            width: "32px",
            height: "32px",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "embedded" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "name" },
        });
        (ele.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tip" },
        });
        (ele.tip);
    }
    var __VLS_51;
}
const __VLS_60 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.ruleConfigvVisible),
    closeOnClickModal: (false),
    size: "calc(100% - 100px)",
    modalClass: "embedded-drawer-fullscreen",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.ruleConfigvVisible),
    closeOnClickModal: (false),
    size: "calc(100% - 100px)",
    modalClass: "embedded-drawer-fullscreen",
    direction: "btt",
    beforeClose: (__VLS_ctx.beforeClose),
    showClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_63.slots;
    const [{ close }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.dialogTitle);
    if (__VLS_ctx.editRule !== 2) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flex-center" },
            ...{ style: {} },
        });
        const __VLS_64 = {}.ElSteps;
        /** @type {[typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            custom: true,
            ...{ style: {} },
            active: (__VLS_ctx.activeStep),
            alignCenter: true,
        }));
        const __VLS_66 = __VLS_65({
            custom: true,
            ...{ style: {} },
            active: (__VLS_ctx.activeStep),
            alignCenter: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        const __VLS_68 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
        const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_71.slots;
            (__VLS_ctx.$t('embedded.basic_information'));
        }
        var __VLS_71;
        const __VLS_72 = {}.ElStep;
        /** @type {[typeof __VLS_components.ElStep, typeof __VLS_components.elStep, typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
        const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_75.slots;
            (__VLS_ctx.currentEmbedded.type === 1
                ? __VLS_ctx.$t('embedded.configure_interface')
                : __VLS_ctx.$t('embedded.set_data_source'));
        }
        var __VLS_75;
        var __VLS_67;
    }
    const __VLS_76 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (close)
    };
    __VLS_79.slots.default;
    const __VLS_84 = {}.icon_close_outlined;
    /** @type {[typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, typeof __VLS_components.Icon_close_outlined, typeof __VLS_components.icon_close_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
    const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
    var __VLS_79;
}
if (__VLS_ctx.activeStep === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-content" },
    });
    const __VLS_88 = {}.ElScrollbar;
    /** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
    const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "scroll-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    (__VLS_ctx.$t('embedded.basic_information'));
    const __VLS_92 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        ...{ 'onSubmit': {} },
        ref: "embeddedFormRef",
        model: (__VLS_ctx.currentEmbedded),
        labelWidth: "180px",
        labelPosition: "top",
        rules: (__VLS_ctx.rules),
        ...{ class: "form-content_error" },
    }));
    const __VLS_94 = __VLS_93({
        ...{ 'onSubmit': {} },
        ref: "embeddedFormRef",
        model: (__VLS_ctx.currentEmbedded),
        labelWidth: "180px",
        labelPosition: "top",
        rules: (__VLS_ctx.rules),
        ...{ class: "form-content_error" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    let __VLS_96;
    let __VLS_97;
    let __VLS_98;
    const __VLS_99 = {
        onSubmit: () => { }
    };
    /** @type {typeof __VLS_ctx.embeddedFormRef} */ ;
    var __VLS_100 = {};
    __VLS_95.slots.default;
    const __VLS_102 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
        prop: "name",
        label: (__VLS_ctx.t('embedded.application_name')),
    }));
    const __VLS_104 = __VLS_103({
        prop: "name",
        label: (__VLS_ctx.t('embedded.application_name')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    __VLS_105.slots.default;
    const __VLS_106 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
        modelValue: (__VLS_ctx.currentEmbedded.name),
        placeholder: (__VLS_ctx.$t('datasource.please_enter') +
            __VLS_ctx.$t('common.empty') +
            __VLS_ctx.$t('embedded.application_name')),
        clearable: true,
        maxlength: "50",
        autocomplete: "off",
    }));
    const __VLS_108 = __VLS_107({
        modelValue: (__VLS_ctx.currentEmbedded.name),
        placeholder: (__VLS_ctx.$t('datasource.please_enter') +
            __VLS_ctx.$t('common.empty') +
            __VLS_ctx.$t('embedded.application_name')),
        clearable: true,
        maxlength: "50",
        autocomplete: "off",
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    var __VLS_105;
    const __VLS_110 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        prop: "description",
        label: (__VLS_ctx.t('embedded.application_description')),
    }));
    const __VLS_112 = __VLS_111({
        prop: "description",
        label: (__VLS_ctx.t('embedded.application_description')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    __VLS_113.slots.default;
    const __VLS_114 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
        modelValue: (__VLS_ctx.currentEmbedded.description),
        rows: (3),
        type: "textarea",
        maxlength: "200",
        showWordLimit: true,
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter')),
        autocomplete: "off",
    }));
    const __VLS_116 = __VLS_115({
        modelValue: (__VLS_ctx.currentEmbedded.description),
        rows: (3),
        type: "textarea",
        maxlength: "200",
        showWordLimit: true,
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter')),
        autocomplete: "off",
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    var __VLS_113;
    const __VLS_118 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
        prop: "domain",
        label: (__VLS_ctx.t('embedded.cross_domain_settings')),
    }));
    const __VLS_120 = __VLS_119({
        prop: "domain",
        label: (__VLS_ctx.t('embedded.cross_domain_settings')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    __VLS_121.slots.default;
    const __VLS_122 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
        modelValue: (__VLS_ctx.currentEmbedded.domain),
        type: "textarea",
        autosize: ({ minRows: 2 }),
        clearable: true,
        placeholder: (__VLS_ctx.$t('embedded.third_party_address')),
        autocomplete: "off",
    }));
    const __VLS_124 = __VLS_123({
        modelValue: (__VLS_ctx.currentEmbedded.domain),
        type: "textarea",
        autosize: ({ minRows: 2 }),
        clearable: true,
        placeholder: (__VLS_ctx.$t('embedded.third_party_address')),
        autocomplete: "off",
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    var __VLS_121;
    var __VLS_95;
    var __VLS_91;
}
if (__VLS_ctx.activeStep === 1 && __VLS_ctx.advancedApplication) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-content" },
    });
    const __VLS_126 = {}.ElScrollbar;
    /** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({}));
    const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
    __VLS_129.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "scroll-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    (__VLS_ctx.$t('embedded.configure_interface'));
    const __VLS_130 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
        ...{ 'onSubmit': {} },
        ref: "urlFormRef",
        model: (__VLS_ctx.urlForm),
        labelWidth: "180px",
        labelPosition: "top",
        rules: (__VLS_ctx.urlRules),
        ...{ class: "form-content_error" },
    }));
    const __VLS_132 = __VLS_131({
        ...{ 'onSubmit': {} },
        ref: "urlFormRef",
        model: (__VLS_ctx.urlForm),
        labelWidth: "180px",
        labelPosition: "top",
        rules: (__VLS_ctx.urlRules),
        ...{ class: "form-content_error" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    let __VLS_134;
    let __VLS_135;
    let __VLS_136;
    const __VLS_137 = {
        onSubmit: () => { }
    };
    /** @type {typeof __VLS_ctx.urlFormRef} */ ;
    var __VLS_138 = {};
    __VLS_133.slots.default;
    const __VLS_140 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        prop: "endpoint",
        label: (__VLS_ctx.t('embedded.interface_url')),
    }));
    const __VLS_142 = __VLS_141({
        prop: "endpoint",
        label: (__VLS_ctx.t('embedded.interface_url')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    const __VLS_144 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        modelValue: (__VLS_ctx.urlForm.endpoint),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') +
            __VLS_ctx.$t('common.empty') +
            __VLS_ctx.$t('embedded.interface_url')),
        autocomplete: "off",
    }));
    const __VLS_146 = __VLS_145({
        modelValue: (__VLS_ctx.urlForm.endpoint),
        clearable: true,
        placeholder: (__VLS_ctx.$t('datasource.please_enter') +
            __VLS_ctx.$t('common.empty') +
            __VLS_ctx.$t('embedded.interface_url')),
        autocomplete: "off",
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    var __VLS_143;
    const __VLS_148 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        label: (__VLS_ctx.t('ds.form.timeout')),
        prop: "timeout",
    }));
    const __VLS_150 = __VLS_149({
        label: (__VLS_ctx.t('ds.form.timeout')),
        prop: "timeout",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_151.slots.default;
    const __VLS_152 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        modelValue: (__VLS_ctx.urlForm.timeout),
        clearable: true,
        min: (0),
        max: (300),
        controlsPosition: "right",
    }));
    const __VLS_154 = __VLS_153({
        modelValue: (__VLS_ctx.urlForm.timeout),
        clearable: true,
        min: (0),
        max: (300),
        controlsPosition: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    var __VLS_151;
    const __VLS_156 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        prop: "AES",
        ...{ class: "custom-require" },
    }));
    const __VLS_158 = __VLS_157({
        prop: "AES",
        ...{ class: "custom-require" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    {
        const { label: __VLS_thisSlot } = __VLS_159.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "custom-require_danger" },
        });
        (__VLS_ctx.t('embedded.aes_enable'));
    }
    const __VLS_160 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        modelValue: (__VLS_ctx.urlForm.encrypt),
    }));
    const __VLS_162 = __VLS_161({
        modelValue: (__VLS_ctx.urlForm.encrypt),
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "aes-encrypt-tips" },
    });
    (__VLS_ctx.t('embedded.aes_enable_tips'));
    var __VLS_159;
    if (__VLS_ctx.urlForm.encrypt) {
        const __VLS_164 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
            prop: "aes_key",
            label: "AES Key",
        }));
        const __VLS_166 = __VLS_165({
            prop: "aes_key",
            label: "AES Key",
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
        __VLS_167.slots.default;
        const __VLS_168 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
            modelValue: (__VLS_ctx.urlForm.aes_key),
            clearable: true,
            type: "password",
            showPassword: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') +
                __VLS_ctx.$t('common.empty') +
                ' 32 ' +
                __VLS_ctx.$t('embedded.bit') +
                ' AES Key'),
            autocomplete: "off",
        }));
        const __VLS_170 = __VLS_169({
            modelValue: (__VLS_ctx.urlForm.aes_key),
            clearable: true,
            type: "password",
            showPassword: true,
            placeholder: (__VLS_ctx.$t('datasource.please_enter') +
                __VLS_ctx.$t('common.empty') +
                ' 32 ' +
                __VLS_ctx.$t('embedded.bit') +
                ' AES Key'),
            autocomplete: "off",
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
        var __VLS_167;
    }
    const __VLS_172 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        ...{ class: "certificate-table_form" },
        prop: "certificate",
    }));
    const __VLS_174 = __VLS_173({
        ...{ class: "certificate-table_form" },
        prop: "certificate",
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    {
        const { label: __VLS_thisSlot } = __VLS_175.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "title-form" },
        });
        (__VLS_ctx.t('embedded.interface_credentials'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeStep === 1 && __VLS_ctx.advancedApplication))
                        return;
                    __VLS_ctx.initCertificate(null);
                } },
            ...{ class: "add btn" },
        });
        const __VLS_176 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
            size: "16",
        }));
        const __VLS_178 = __VLS_177({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        __VLS_179.slots.default;
        const __VLS_180 = {}.icon_add_outlined;
        /** @type {[typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, typeof __VLS_components.Icon_add_outlined, typeof __VLS_components.icon_add_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({}));
        const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
        var __VLS_179;
        (__VLS_ctx.t('model.add'));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-content" },
        ...{ class: (!!__VLS_ctx.urlForm.certificate.length && 'no-credentials_yet') },
    });
    const __VLS_184 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        emptyText: (__VLS_ctx.$t('embedded.no_credentials_yet')),
        data: (__VLS_ctx.urlForm.certificate),
        ...{ style: {} },
    }));
    const __VLS_186 = __VLS_185({
        emptyText: (__VLS_ctx.$t('embedded.no_credentials_yet')),
        data: (__VLS_ctx.urlForm.certificate),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    const __VLS_188 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        prop: "source",
        label: (__VLS_ctx.t('embedded.credential_name')),
        width: "180",
    }));
    const __VLS_190 = __VLS_189({
        prop: "source",
        label: (__VLS_ctx.t('embedded.credential_name')),
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    const __VLS_192 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        prop: "type",
        label: (__VLS_ctx.t('embedded.system_credential_type')),
        width: "180",
    }));
    const __VLS_194 = __VLS_193({
        prop: "type",
        label: (__VLS_ctx.t('embedded.system_credential_type')),
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    const __VLS_196 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        prop: "target_key",
        label: (__VLS_ctx.t('embedded.target_credential_name')),
        width: "180",
    }));
    const __VLS_198 = __VLS_197({
        prop: "target_key",
        label: (__VLS_ctx.t('embedded.target_credential_name')),
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    const __VLS_200 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        prop: "target",
        label: (__VLS_ctx.t('embedded.target_credential_location')),
    }));
    const __VLS_202 = __VLS_201({
        prop: "target",
        label: (__VLS_ctx.t('embedded.target_credential_location')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    const __VLS_204 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        fixed: "right",
        width: "80",
        className: "operation-column_text",
        label: (__VLS_ctx.$t('ds.actions')),
    }));
    const __VLS_206 = __VLS_205({
        fixed: "right",
        width: "80",
        className: "operation-column_text",
        label: (__VLS_ctx.$t('ds.actions')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_207.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_208 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }));
        const __VLS_210 = __VLS_209({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_209));
        let __VLS_212;
        let __VLS_213;
        let __VLS_214;
        const __VLS_215 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeStep === 1 && __VLS_ctx.advancedApplication))
                    return;
                __VLS_ctx.initCertificate(scope.row);
            }
        };
        __VLS_211.slots.default;
        const __VLS_216 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
            size: "16",
        }));
        const __VLS_218 = __VLS_217({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_217));
        __VLS_219.slots.default;
        const __VLS_220 = {}.icon_edit_outlined;
        /** @type {[typeof __VLS_components.Icon_edit_outlined, typeof __VLS_components.icon_edit_outlined, typeof __VLS_components.Icon_edit_outlined, typeof __VLS_components.icon_edit_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({}));
        const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
        var __VLS_219;
        var __VLS_211;
        const __VLS_224 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }));
        const __VLS_226 = __VLS_225({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_225));
        let __VLS_228;
        let __VLS_229;
        let __VLS_230;
        const __VLS_231 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeStep === 1 && __VLS_ctx.advancedApplication))
                    return;
                __VLS_ctx.handleCredentialsDel(scope.row);
            }
        };
        __VLS_227.slots.default;
        const __VLS_232 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
            size: "16",
        }));
        const __VLS_234 = __VLS_233({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_233));
        __VLS_235.slots.default;
        const __VLS_236 = {}.icon_delete;
        /** @type {[typeof __VLS_components.Icon_delete, typeof __VLS_components.icon_delete, typeof __VLS_components.Icon_delete, typeof __VLS_components.icon_delete, ]} */ ;
        // @ts-ignore
        const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({}));
        const __VLS_238 = __VLS_237({}, ...__VLS_functionalComponentArgsRest(__VLS_237));
        var __VLS_235;
        var __VLS_227;
    }
    var __VLS_207;
    var __VLS_187;
    var __VLS_175;
    var __VLS_133;
    var __VLS_129;
}
if (__VLS_ctx.activeStep === 1 && !__VLS_ctx.advancedApplication) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-content" },
    });
    const __VLS_240 = {}.ElScrollbar;
    /** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({}));
    const __VLS_242 = __VLS_241({}, ...__VLS_functionalComponentArgsRest(__VLS_241));
    __VLS_243.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "scroll-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    (__VLS_ctx.$t('embedded.set_data_source'));
    const __VLS_244 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
        ...{ 'onSubmit': {} },
        ref: "dsFormRef",
        model: (__VLS_ctx.dsForm),
        labelWidth: "180px",
        labelPosition: "top",
        rules: (__VLS_ctx.dsRules),
        ...{ class: "form-content_error" },
    }));
    const __VLS_246 = __VLS_245({
        ...{ 'onSubmit': {} },
        ref: "dsFormRef",
        model: (__VLS_ctx.dsForm),
        labelWidth: "180px",
        labelPosition: "top",
        rules: (__VLS_ctx.dsRules),
        ...{ class: "form-content_error" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    let __VLS_248;
    let __VLS_249;
    let __VLS_250;
    const __VLS_251 = {
        onSubmit: () => { }
    };
    /** @type {typeof __VLS_ctx.dsFormRef} */ ;
    var __VLS_252 = {};
    __VLS_247.slots.default;
    const __VLS_254 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
        ...{ class: "private-list_form" },
    }));
    const __VLS_256 = __VLS_255({
        ...{ class: "private-list_form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_255));
    __VLS_257.slots.default;
    {
        const { label: __VLS_thisSlot } = __VLS_257.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "private-list" },
        });
        (__VLS_ctx.t('embedded.set_data_source'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            title: (__VLS_ctx.$t('embedded.open_the_query')),
            ...{ class: "open-the_query ellipsis" },
        });
        (__VLS_ctx.$t('embedded.open_the_query'));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-ds_content" },
    });
    for (const [ele, index] of __VLS_getVForSourceType((__VLS_ctx.dsListOptions))) {
        /** @type {[typeof DsCard, typeof DsCard, ]} */ ;
        // @ts-ignore
        const __VLS_258 = __VLS_asFunctionalComponent(DsCard, new DsCard({
            ...{ 'onActive': {} },
            ...{ 'onPrivate': {} },
            ...{ 'onPublic': {} },
            id: (ele.id),
            key: (ele.id),
            ...{ class: ([0, 1].includes(index) && 'no-margin_top') },
            name: (ele.name),
            type: (ele.type),
            typeName: (ele.type_name),
            description: (ele.description),
            isPrivate: (!__VLS_ctx.dsForm.public_list.includes(ele.id)),
            num: (ele.num),
        }));
        const __VLS_259 = __VLS_258({
            ...{ 'onActive': {} },
            ...{ 'onPrivate': {} },
            ...{ 'onPublic': {} },
            id: (ele.id),
            key: (ele.id),
            ...{ class: ([0, 1].includes(index) && 'no-margin_top') },
            name: (ele.name),
            type: (ele.type),
            typeName: (ele.type_name),
            description: (ele.description),
            isPrivate: (!__VLS_ctx.dsForm.public_list.includes(ele.id)),
            num: (ele.num),
        }, ...__VLS_functionalComponentArgsRest(__VLS_258));
        let __VLS_261;
        let __VLS_262;
        let __VLS_263;
        const __VLS_264 = {
            onActive: (...[$event]) => {
                if (!(__VLS_ctx.activeStep === 1 && !__VLS_ctx.advancedApplication))
                    return;
                __VLS_ctx.handleActive(ele);
            }
        };
        const __VLS_265 = {
            onPrivate: (...[$event]) => {
                if (!(__VLS_ctx.activeStep === 1 && !__VLS_ctx.advancedApplication))
                    return;
                __VLS_ctx.handlePrivate(ele);
            }
        };
        const __VLS_266 = {
            onPublic: (...[$event]) => {
                if (!(__VLS_ctx.activeStep === 1 && !__VLS_ctx.advancedApplication))
                    return;
                __VLS_ctx.handlePublic(ele);
            }
        };
        var __VLS_260;
    }
    var __VLS_257;
    var __VLS_247;
    var __VLS_243;
}
{
    const { footer: __VLS_thisSlot } = __VLS_63.slots;
    const __VLS_267 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_269 = __VLS_268({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_268));
    let __VLS_271;
    let __VLS_272;
    let __VLS_273;
    const __VLS_274 = {
        onClick: (__VLS_ctx.beforeClose)
    };
    __VLS_270.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_270;
    if (__VLS_ctx.activeStep === 1 && __VLS_ctx.editRule !== 2) {
        const __VLS_275 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({
            ...{ 'onClick': {} },
            secondary: true,
        }));
        const __VLS_277 = __VLS_276({
            ...{ 'onClick': {} },
            secondary: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_276));
        let __VLS_279;
        let __VLS_280;
        let __VLS_281;
        const __VLS_282 = {
            onClick: (__VLS_ctx.preview)
        };
        __VLS_278.slots.default;
        (__VLS_ctx.t('ds.previous'));
        var __VLS_278;
    }
    if (__VLS_ctx.activeStep === 0 && __VLS_ctx.editRule !== 2) {
        const __VLS_283 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_285 = __VLS_284({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_284));
        let __VLS_287;
        let __VLS_288;
        let __VLS_289;
        const __VLS_290 = {
            onClick: (__VLS_ctx.next)
        };
        __VLS_286.slots.default;
        (__VLS_ctx.t('common.next'));
        var __VLS_286;
    }
    if (__VLS_ctx.activeStep === 1) {
        const __VLS_291 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_293 = __VLS_292({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_292));
        let __VLS_295;
        let __VLS_296;
        let __VLS_297;
        const __VLS_298 = {
            onClick: (__VLS_ctx.saveEmbedded)
        };
        __VLS_294.slots.default;
        (__VLS_ctx.$t('common.save'));
        var __VLS_294;
    }
}
var __VLS_63;
const __VLS_299 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.$t('embedded.embed_third_party')),
    width: "600",
    modalClass: "embed-third_party",
}));
const __VLS_301 = __VLS_300({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.$t('embedded.embed_third_party')),
    width: "600",
    modalClass: "embed-third_party",
}, ...__VLS_functionalComponentArgsRest(__VLS_300));
__VLS_302.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "floating-window" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mode" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeMode = 'full';
        } },
    ...{ class: "floating" },
    ...{ class: (__VLS_ctx.activeMode === 'full' && 'active') },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
(__VLS_ctx.$t('professional.full_screen_mode'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: (__VLS_ctx.full_window),
    width: "180px",
    height: "120px",
    alt: "",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeMode = 'floating';
        } },
    ...{ class: "floating" },
    ...{ class: (__VLS_ctx.activeMode === 'floating' && 'active') },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
(__VLS_ctx.$t('embedded.floating_window_mode'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: (__VLS_ctx.floating_window),
    width: "180px",
    height: "120px",
    alt: "",
});
if (__VLS_ctx.activeMode === 'floating') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code-bg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "copy" },
    });
    (__VLS_ctx.$t('embedded.code_to_embed'));
    const __VLS_303 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }));
    const __VLS_305 = __VLS_304({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_304));
    __VLS_306.slots.default;
    const __VLS_307 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({
        ...{ 'onClick': {} },
        size: "16",
    }));
    const __VLS_309 = __VLS_308({
        ...{ 'onClick': {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_308));
    let __VLS_311;
    let __VLS_312;
    let __VLS_313;
    const __VLS_314 = {
        onClick: (__VLS_ctx.copyCode)
    };
    __VLS_310.slots.default;
    const __VLS_315 = {}.icon_copy_outlined;
    /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({}));
    const __VLS_317 = __VLS_316({}, ...__VLS_functionalComponentArgsRest(__VLS_316));
    var __VLS_310;
    var __VLS_306;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "script" },
    });
    (__VLS_ctx.scriptElement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "line" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "copy" },
    });
    (__VLS_ctx.$t('professional.code_for_debugging'));
    const __VLS_319 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }));
    const __VLS_321 = __VLS_320({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_320));
    __VLS_322.slots.default;
    const __VLS_323 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_324 = __VLS_asFunctionalComponent(__VLS_323, new __VLS_323({
        ...{ 'onClick': {} },
        size: "16",
    }));
    const __VLS_325 = __VLS_324({
        ...{ 'onClick': {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_324));
    let __VLS_327;
    let __VLS_328;
    let __VLS_329;
    const __VLS_330 = {
        onClick: (__VLS_ctx.copyJsCode)
    };
    __VLS_326.slots.default;
    const __VLS_331 = {}.icon_copy_outlined;
    /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_332 = __VLS_asFunctionalComponent(__VLS_331, new __VLS_331({}));
    const __VLS_333 = __VLS_332({}, ...__VLS_functionalComponentArgsRest(__VLS_332));
    var __VLS_326;
    var __VLS_322;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "script" },
    });
    (__VLS_ctx.jsCodeElement);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code-bg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "copy" },
    });
    (__VLS_ctx.$t('embedded.code_to_embed'));
    const __VLS_335 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_336 = __VLS_asFunctionalComponent(__VLS_335, new __VLS_335({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }));
    const __VLS_337 = __VLS_336({
        offset: (12),
        effect: "dark",
        content: (__VLS_ctx.t('datasource.copy')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_336));
    __VLS_338.slots.default;
    const __VLS_339 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_340 = __VLS_asFunctionalComponent(__VLS_339, new __VLS_339({
        ...{ 'onClick': {} },
        size: "16",
    }));
    const __VLS_341 = __VLS_340({
        ...{ 'onClick': {} },
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_340));
    let __VLS_343;
    let __VLS_344;
    let __VLS_345;
    const __VLS_346 = {
        onClick: (__VLS_ctx.copyJsCodeFull)
    };
    __VLS_342.slots.default;
    const __VLS_347 = {}.icon_copy_outlined;
    /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_348 = __VLS_asFunctionalComponent(__VLS_347, new __VLS_347({}));
    const __VLS_349 = __VLS_348({}, ...__VLS_functionalComponentArgsRest(__VLS_348));
    var __VLS_342;
    var __VLS_338;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "script" },
    });
    (__VLS_ctx.jsCodeElementFull);
}
var __VLS_302;
const __VLS_351 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_352 = __VLS_asFunctionalComponent(__VLS_351, new __VLS_351({
    modelValue: (__VLS_ctx.drawerConfigvVisible),
    title: (__VLS_ctx.drawerTitle),
    modalClass: "certificate-form_drawer",
    direction: "rtl",
    size: "600px",
    beforeClose: (__VLS_ctx.certificateBeforeClose),
}));
const __VLS_353 = __VLS_352({
    modelValue: (__VLS_ctx.drawerConfigvVisible),
    title: (__VLS_ctx.drawerTitle),
    modalClass: "certificate-form_drawer",
    direction: "rtl",
    size: "600px",
    beforeClose: (__VLS_ctx.certificateBeforeClose),
}, ...__VLS_functionalComponentArgsRest(__VLS_352));
__VLS_354.slots.default;
const __VLS_355 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_356 = __VLS_asFunctionalComponent(__VLS_355, new __VLS_355({
    ...{ 'onSubmit': {} },
    ref: "certificateFormRef",
    model: (__VLS_ctx.certificateForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.certificateRules),
    ...{ class: "form-content_error" },
}));
const __VLS_357 = __VLS_356({
    ...{ 'onSubmit': {} },
    ref: "certificateFormRef",
    model: (__VLS_ctx.certificateForm),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.certificateRules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_356));
let __VLS_359;
let __VLS_360;
let __VLS_361;
const __VLS_362 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.certificateFormRef} */ ;
var __VLS_363 = {};
__VLS_358.slots.default;
const __VLS_365 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({
    prop: "source",
    label: (__VLS_ctx.t('embedded.credential_name')),
}));
const __VLS_367 = __VLS_366({
    prop: "source",
    label: (__VLS_ctx.t('embedded.credential_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_366));
__VLS_368.slots.default;
const __VLS_369 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({
    modelValue: (__VLS_ctx.certificateForm.source),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('embedded.credential_name')),
    autocomplete: "off",
}));
const __VLS_371 = __VLS_370({
    modelValue: (__VLS_ctx.certificateForm.source),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('embedded.credential_name')),
    autocomplete: "off",
}, ...__VLS_functionalComponentArgsRest(__VLS_370));
var __VLS_368;
const __VLS_373 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({
    prop: "type",
    label: (__VLS_ctx.t('embedded.system_credential_type')),
}));
const __VLS_375 = __VLS_374({
    prop: "type",
    label: (__VLS_ctx.t('embedded.system_credential_type')),
}, ...__VLS_functionalComponentArgsRest(__VLS_374));
__VLS_376.slots.default;
const __VLS_377 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({
    modelValue: (__VLS_ctx.certificateForm.type),
    placeholder: (__VLS_ctx.$t('datasource.Please_select') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.system_credential_type')),
}));
const __VLS_379 = __VLS_378({
    modelValue: (__VLS_ctx.certificateForm.type),
    placeholder: (__VLS_ctx.$t('datasource.Please_select') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.system_credential_type')),
}, ...__VLS_functionalComponentArgsRest(__VLS_378));
__VLS_380.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.systemCredentials))) {
    const __VLS_381 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_382 = __VLS_asFunctionalComponent(__VLS_381, new __VLS_381({
        key: (item),
        label: (item),
        value: (item),
    }));
    const __VLS_383 = __VLS_382({
        key: (item),
        label: (item),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_382));
}
var __VLS_380;
var __VLS_376;
const __VLS_385 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({
    prop: "target_key",
    label: (__VLS_ctx.t('embedded.target_credential_name')),
}));
const __VLS_387 = __VLS_386({
    prop: "target_key",
    label: (__VLS_ctx.t('embedded.target_credential_name')),
}, ...__VLS_functionalComponentArgsRest(__VLS_386));
__VLS_388.slots.default;
const __VLS_389 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_390 = __VLS_asFunctionalComponent(__VLS_389, new __VLS_389({
    modelValue: (__VLS_ctx.certificateForm.target_key),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.target_credential_name')),
    autocomplete: "off",
}));
const __VLS_391 = __VLS_390({
    modelValue: (__VLS_ctx.certificateForm.target_key),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.target_credential_name')),
    autocomplete: "off",
}, ...__VLS_functionalComponentArgsRest(__VLS_390));
var __VLS_388;
const __VLS_393 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_394 = __VLS_asFunctionalComponent(__VLS_393, new __VLS_393({
    prop: "target",
    label: (__VLS_ctx.t('embedded.target_credential_location')),
}));
const __VLS_395 = __VLS_394({
    prop: "target",
    label: (__VLS_ctx.t('embedded.target_credential_location')),
}, ...__VLS_functionalComponentArgsRest(__VLS_394));
__VLS_396.slots.default;
const __VLS_397 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({
    modelValue: (__VLS_ctx.certificateForm.target),
    placeholder: (__VLS_ctx.$t('datasource.Please_select') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.target_credential_location')),
}));
const __VLS_399 = __VLS_398({
    modelValue: (__VLS_ctx.certificateForm.target),
    placeholder: (__VLS_ctx.$t('datasource.Please_select') +
        __VLS_ctx.$t('common.empty') +
        __VLS_ctx.$t('embedded.target_credential_location')),
}, ...__VLS_functionalComponentArgsRest(__VLS_398));
__VLS_400.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.credentials))) {
    const __VLS_401 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({
        key: (item),
        label: (item),
        value: (item),
    }));
    const __VLS_403 = __VLS_402({
        key: (item),
        label: (item),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_402));
}
var __VLS_400;
var __VLS_396;
const __VLS_405 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_406 = __VLS_asFunctionalComponent(__VLS_405, new __VLS_405({
    prop: "target_val",
    label: (__VLS_ctx.t('embedded.target_credential')),
}));
const __VLS_407 = __VLS_406({
    prop: "target_val",
    label: (__VLS_ctx.t('embedded.target_credential')),
}, ...__VLS_functionalComponentArgsRest(__VLS_406));
__VLS_408.slots.default;
const __VLS_409 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_410 = __VLS_asFunctionalComponent(__VLS_409, new __VLS_409({
    modelValue: (__VLS_ctx.certificateForm.target_val),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('embedded.target_credential')),
    autocomplete: "off",
}));
const __VLS_411 = __VLS_410({
    modelValue: (__VLS_ctx.certificateForm.target_val),
    clearable: true,
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('embedded.target_credential')),
    autocomplete: "off",
}, ...__VLS_functionalComponentArgsRest(__VLS_410));
var __VLS_408;
var __VLS_358;
{
    const { footer: __VLS_thisSlot } = __VLS_354.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_413 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_414 = __VLS_asFunctionalComponent(__VLS_413, new __VLS_413({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_415 = __VLS_414({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_414));
    let __VLS_417;
    let __VLS_418;
    let __VLS_419;
    const __VLS_420 = {
        onClick: (__VLS_ctx.certificateBeforeClose)
    };
    __VLS_416.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_416;
    const __VLS_421 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_422 = __VLS_asFunctionalComponent(__VLS_421, new __VLS_421({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_423 = __VLS_422({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_422));
    let __VLS_425;
    let __VLS_426;
    let __VLS_427;
    const __VLS_428 = {
        onClick: (__VLS_ctx.saveHandler)
    };
    __VLS_424.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_424;
}
var __VLS_354;
/** @type {[typeof SetUi, typeof SetUi, ]} */ ;
// @ts-ignore
const __VLS_429 = __VLS_asFunctionalComponent(SetUi, new SetUi({
    ...{ 'onRefresh': {} },
    ref: "setUiRef",
}));
const __VLS_430 = __VLS_429({
    ...{ 'onRefresh': {} },
    ref: "setUiRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_429));
let __VLS_432;
let __VLS_433;
let __VLS_434;
const __VLS_435 = {
    onRefresh: (__VLS_ctx.handleSearch)
};
/** @type {typeof __VLS_ctx.setUiRef} */ ;
var __VLS_436 = {};
var __VLS_431;
/** @type {__VLS_StyleScopedClasses['embedded-index']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['embedded']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['tip']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-empty_pd0']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-16']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-empty_custom']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['embedded']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['tip']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-center']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-require']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-require_danger']} */ ;
/** @type {__VLS_StyleScopedClasses['aes-encrypt-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['certificate-table_form']} */ ;
/** @type {__VLS_StyleScopedClasses['title-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title-form']} */ ;
/** @type {__VLS_StyleScopedClasses['add']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['table-content']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['private-list_form']} */ ;
/** @type {__VLS_StyleScopedClasses['private-list']} */ ;
/** @type {__VLS_StyleScopedClasses['open-the_query']} */ ;
/** @type {__VLS_StyleScopedClasses['ellipsis']} */ ;
/** @type {__VLS_StyleScopedClasses['card-ds_content']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-window']} */ ;
/** @type {__VLS_StyleScopedClasses['mode']} */ ;
/** @type {__VLS_StyleScopedClasses['floating']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['floating']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['code-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['code']} */ ;
/** @type {__VLS_StyleScopedClasses['copy']} */ ;
/** @type {__VLS_StyleScopedClasses['script']} */ ;
/** @type {__VLS_StyleScopedClasses['line']} */ ;
/** @type {__VLS_StyleScopedClasses['code']} */ ;
/** @type {__VLS_StyleScopedClasses['copy']} */ ;
/** @type {__VLS_StyleScopedClasses['script']} */ ;
/** @type {__VLS_StyleScopedClasses['code-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['code']} */ ;
/** @type {__VLS_StyleScopedClasses['copy']} */ ;
/** @type {__VLS_StyleScopedClasses['script']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_101 = __VLS_100, __VLS_139 = __VLS_138, __VLS_253 = __VLS_252, __VLS_364 = __VLS_363, __VLS_437 = __VLS_436;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_searchOutline_outlined: icon_searchOutline_outlined,
            icon_add_outlined: icon_add_outlined,
            icon_close_outlined: icon_close_outlined,
            EmptyBackground: EmptyBackground,
            floating_window: floating_window,
            full_window: full_window,
            icon_edit_outlined: icon_edit_outlined,
            icon_delete: icon_delete,
            icon_copy_outlined: icon_copy_outlined,
            SetUi: SetUi,
            Card: Card,
            DsCard: DsCard,
            t: t,
            keywords: keywords,
            activeStep: activeStep,
            ruleConfigvVisible: ruleConfigvVisible,
            drawerConfigvVisible: drawerConfigvVisible,
            advancedApplication: advancedApplication,
            editRule: editRule,
            embeddedFormRef: embeddedFormRef,
            dsFormRef: dsFormRef,
            urlFormRef: urlFormRef,
            certificateFormRef: certificateFormRef,
            dialogTitle: dialogTitle,
            drawerTitle: drawerTitle,
            activeMode: activeMode,
            systemCredentials: systemCredentials,
            credentials: credentials,
            currentEmbedded: currentEmbedded,
            dsForm: dsForm,
            certificateForm: certificateForm,
            urlForm: urlForm,
            dsListOptions: dsListOptions,
            embeddedListWithSearch: embeddedListWithSearch,
            userTypeList: userTypeList,
            handleAddEmbedded: handleAddEmbedded,
            beforeClose: beforeClose,
            handleActive: handleActive,
            handlePrivate: handlePrivate,
            handlePublic: handlePublic,
            searchLoading: searchLoading,
            handleSearch: handleSearch,
            handleEditRule: handleEditRule,
            deleteHandler: deleteHandler,
            setUiRef: setUiRef,
            handleSetUi: handleSetUi,
            rules: rules,
            dsRules: dsRules,
            urlRules: urlRules,
            certificateRules: certificateRules,
            preview: preview,
            next: next,
            saveEmbedded: saveEmbedded,
            dialogVisible: dialogVisible,
            scriptElement: scriptElement,
            jsCodeElement: jsCodeElement,
            jsCodeElementFull: jsCodeElementFull,
            handleEmbedded: handleEmbedded,
            copyJsCode: copyJsCode,
            copyJsCodeFull: copyJsCodeFull,
            copyCode: copyCode,
            certificateBeforeClose: certificateBeforeClose,
            initCertificate: initCertificate,
            handleCredentialsDel: handleCredentialsDel,
            saveHandler: saveHandler,
        };
    },
    props: {
        btnSelect: {
            type: String,
            default: '',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        btnSelect: {
            type: String,
            default: '',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
