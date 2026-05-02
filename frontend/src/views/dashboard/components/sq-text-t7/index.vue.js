import { ref } from 'vue';
import Editor from '@tinymce/tinymce-vue';
const __VLS_props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
});
const content = ref('这个是个测试');
const editorRef = ref(null);
const initOptions = {
    base_url: '/tinymce', // 指向 public/tinymce 目录
    suffix: '.min',
    height: 500,
    menubar: false,
    language: 'zh_CN', // 中文语言
    skin: 'oxide', // 皮肤
    plugins: [
        'advlist',
        'autolink',
        'lists',
        'link',
        'image',
        'preview',
        'anchor',
        'searchreplace',
        'visualblocks',
        'code',
        'fullscreen',
        'insertdatetime',
        'media',
        'table',
    ],
    inline: true,
    font_formats: '微软雅黑=Microsoft YaHei;宋体=SimSun;黑体=SimHei;仿宋=FangSong;华文黑体=STHeiti;华文楷体=STKaiti;华文宋体=STSong;华文仿宋=STFangsong;Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings',
    fontsize_formats: '12px 14px 16px 18px 20px 22px 24px 28px 32px 36px 42px 48px 56px 72px 80px 90px 100px 110px 120px 140px 150px 170px 190px 210px',
    toolbar: 'undo redo | fontselect fontsizeselect | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
};
const handleInit = (editor) => {
    editorRef.value = editor;
    console.info('TinyMCE 初始化完成', editor);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rich-text-editor" },
});
const __VLS_0 = {}.editor;
/** @type {[typeof __VLS_components.Editor, typeof __VLS_components.editor, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onOnInit': {} },
    modelValue: (__VLS_ctx.content),
    init: (__VLS_ctx.initOptions),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onOnInit': {} },
    modelValue: (__VLS_ctx.content),
    init: (__VLS_ctx.initOptions),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onOnInit: (__VLS_ctx.handleInit)
};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['rich-text-editor']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Editor: Editor,
            content: content,
            initOptions: initOptions,
            handleInit: handleInit,
        };
    },
    props: {
        modelValue: {
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
        modelValue: {
            type: String,
            default: '',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
