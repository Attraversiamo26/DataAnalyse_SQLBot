import tinymce from 'tinymce/tinymce';
import Editor from '@tinymce/tinymce-vue';
import 'tinymce/icons/default';
import 'tinymce/plugins/link';
import '@npkg/tinymce-plugins/letterspacing';
import { computed, nextTick, reactive, toRefs } from 'vue';
import { onMounted } from 'vue';
import { dashboardStoreWithOut } from '@/stores/dashboard/dashboard.ts';
import { useI18n } from 'vue-i18n';
const dashboardStore = dashboardStoreWithOut();
const { t } = useI18n();
const props = defineProps({
    configItem: {
        type: Object,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});
const { configItem } = toRefs(props);
const tinymceId = 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '');
const init = reactive({
    base_url: '/tinymce', // 指向 public/tinymce 目录
    suffix: '.min',
    selector: tinymceId,
    language: 'zh_CN',
    skin: 'oxide',
    plugins: 'link letterspacing', // 插件
    // 工具栏
    toolbar: 'fontfamily fontsize | |forecolor backcolor bold italic letterspacing |underline strikethrough link lineheight| formatselect | alignleft aligncenter alignright |',
    toolbar_location: '/',
    font_family_formats: '微软雅黑=Microsoft YaHei;宋体=SimSun;黑体=SimHei;仿宋=FangSong;华文黑体=STHeiti;华文楷体=STKaiti;华文宋体=STSong;华文仿宋=STFangsong;Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings',
    font_size_formats: '12px 14px 16px 18px 20px 22px 24px 28px 32px 36px 42px 48px 56px 72px 80px 90px 100px 110px 120px 140px 150px 170px 190px 210px', // 字体大小
    menubar: false,
    placeholder: '',
    inline: true,
});
const isDisabled = computed(() => props.disabled || !configItem.value.editing);
const setEdit = () => {
    configItem.value.editing = true;
    dashboardStore.setCurComponent(configItem.value);
    nextTick(() => {
        editCursor();
    });
};
const editCursor = () => {
    setTimeout(() => {
        const myDiv = document.getElementById(tinymceId);
        // Focus the cursor on the end of the text
        const range = document.createRange();
        const sel = window.getSelection();
        if (myDiv && myDiv.childNodes) {
            range.setStart(myDiv.childNodes[myDiv.childNodes.length - 1], 1);
            range.collapse(false);
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        // For some browsers, it may be necessary to set the cursor to the end in another way
        if (myDiv && myDiv.focus) {
            myDiv.focus();
        }
    }, 100);
};
onMounted(() => {
    tinymce.init({});
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rich-main-class" },
    ...{ class: ({ 'edit-model': __VLS_ctx.configItem.editing }) },
    draggable: "false",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onKeydown: () => { } },
    ...{ onKeyup: () => { } },
    ...{ onMousedown: () => { } },
    ...{ onDblclick: (__VLS_ctx.setEdit) },
    ...{ class: ({ 'rich-text-empty': true, 'layer-hidden': !__VLS_ctx.isDisabled || __VLS_ctx.configItem.propValue }) },
});
(__VLS_ctx.t('dashboard.rich_text_tips'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onKeydown: () => { } },
    ...{ onKeyup: () => { } },
    ...{ onMousedown: () => { } },
    ...{ onDblclick: (__VLS_ctx.setEdit) },
    draggable: "false",
    ...{ class: ({ 'custom-text-content': true, 'preview-text': true, 'layer-hidden': !__VLS_ctx.isDisabled }) },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.configItem.propValue) }, null, null);
const __VLS_0 = {}.editor;
/** @type {[typeof __VLS_components.Editor, typeof __VLS_components.editor, typeof __VLS_components.Editor, typeof __VLS_components.editor, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    id: (__VLS_ctx.tinymceId),
    modelValue: (__VLS_ctx.configItem.propValue),
    draggable: "false",
    ...{ class: ({ 'custom-text-content': true, 'layer-hidden': __VLS_ctx.isDisabled }) },
    init: (__VLS_ctx.init),
}));
const __VLS_2 = __VLS_1({
    id: (__VLS_ctx.tinymceId),
    modelValue: (__VLS_ctx.configItem.propValue),
    draggable: "false",
    ...{ class: ({ 'custom-text-content': true, 'layer-hidden': __VLS_ctx.isDisabled }) },
    init: (__VLS_ctx.init),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['rich-main-class']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-model']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-text-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-text-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-text']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-text-content']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-hidden']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Editor: Editor,
            t: t,
            configItem: configItem,
            tinymceId: tinymceId,
            init: init,
            isDisabled: isDisabled,
            setEdit: setEdit,
        };
    },
    props: {
        configItem: {
            type: Object,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        configItem: {
            type: Object,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
