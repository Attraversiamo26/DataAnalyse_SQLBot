import { ref, toRefs, watch } from 'vue';
import { formatDataEaseBi } from '@/utils/url';
import tinymce from 'tinymce/tinymce'; // tinymce默认hidden，不引入不显示
import Editor from '@tinymce/tinymce-vue'; // 编辑器引入
import 'tinymce/themes/silver/theme'; // 编辑器主题
import 'tinymce/icons/default'; // 引入编辑器图标icon，不引入则不显示对应图标
// 引入编辑器插件（基本免费插件都在这儿了）
import 'tinymce/plugins/advlist'; // 高级列表
import 'tinymce/plugins/autolink'; // 自动链接
import 'tinymce/plugins/link'; // 超链接
import 'tinymce/plugins/image'; // 插入编辑图片
import 'tinymce/plugins/lists'; // 列表插件
import 'tinymce/plugins/charmap'; // 特殊字符
import 'tinymce/plugins/media'; // 插入编辑媒体
import 'tinymce/plugins/wordcount'; // 字数统计
import 'tinymce/plugins/table'; // 表格
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/pagebreak';
import { propTypes } from '@/utils/propTypes';
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    inline: propTypes.bool.def(true),
});
const myValue = ref();
const { modelValue, inline } = toRefs(props);
myValue.value = modelValue;
watch(() => props.modelValue, (newValue) => {
    myValue.value = newValue;
});
const emits = defineEmits(['update:modelValue', 'change']);
watch(() => myValue.value, (newValue) => {
    emits('update:modelValue', newValue);
    emits('change', newValue);
});
const tinymceId = 'tinymce-view-pf';
const init = ref({
    selector: '#' + tinymceId,
    toolbar_items_size: 'small',
    language_url: formatDataEaseBi('./tinymce-dataease-private/langs/zh_CN.js'), // 汉化路径是自定义的，一般放在public或static里面
    language: 'zh_CN',
    skin_url: formatDataEaseBi('./tinymce-dataease-private/skins/ui/oxide'), // 皮肤
    content_css: formatDataEaseBi('./tinymce-dataease-private/skins/content/default/content.css'),
    plugins: 'advlist autolink link image lists charmap  media wordcount table contextmenu directionality pagebreak', // 插件
    // 工具栏
    toolbar: 'undo redo |fontselect fontsizeselect |forecolor backcolor bold italic |underline strikethrough link lineheight| formatselect |' +
        'alignleft aligncenter alignright | bullist numlist |' +
        ' blockquote subscript superscript removeformat | table image media ',
    toolbar_location: '/',
    font_formats: '微软雅黑=Microsoft YaHei;宋体=SimSun;黑体=SimHei;仿宋=FangSong;华文黑体=STHeiti;华文楷体=STKaiti;华文宋体=STSong;华文仿宋=STFangsong;Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings',
    fontsize_formats: '12px 14px 16px 18px 20px 22px 24px 28px 32px 36px 48px 56px 72px', // 字体大小
    menubar: false,
    placeholder: '',
    outer_placeholder: '双击输入文字',
    inline: inline.value,
    branding: true,
});
tinymce.init({});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "de-tinymce-container ed-textarea__inner" },
});
const __VLS_0 = {}.editor;
/** @type {[typeof __VLS_components.Editor, typeof __VLS_components.editor, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    id: (__VLS_ctx.tinymceId),
    modelValue: (__VLS_ctx.myValue),
    ...{ class: "de-tinymce-content" },
    init: (__VLS_ctx.init),
}));
const __VLS_2 = __VLS_1({
    id: (__VLS_ctx.tinymceId),
    modelValue: (__VLS_ctx.myValue),
    ...{ class: "de-tinymce-content" },
    init: (__VLS_ctx.init),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['de-tinymce-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-textarea__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['de-tinymce-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Editor: Editor,
            myValue: myValue,
            tinymceId: tinymceId,
            init: init,
        };
    },
    emits: {},
    props: {
        modelValue: {
            type: String,
            default: '',
        },
        inline: propTypes.bool.def(true),
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        modelValue: {
            type: String,
            default: '',
        },
        inline: propTypes.bool.def(true),
    },
});
; /* PartiallyEnd: #4569/main.vue */
