import nothingInput from '@/assets/img/nothing-input.png';
import nothingSelect from '@/assets/img/nothing-select.png';
import nothingTable from '@/assets/img/nothing-table.png';
import nothingSelectDashboard from '@/assets/img/none-dashboard.png';
import addComponent from '@/assets/img/add_component.png';
import none from '@/assets/img/none.png';
import error from '@/assets/img/error.png';
import nothingTree from '@/assets/img/nothing-tree.png';
import nothingNone from '@/assets/img/nothing-none.png';
const __VLS_props = defineProps({
    imgType: {
        type: String,
        default: 'table',
    },
    imageSize: {
        type: Number,
        default: 125,
    },
    description: {
        type: String,
        default: '',
    },
});
const getAssetsFile = {
    input: nothingInput,
    select: nothingSelect,
    table: nothingTable,
    noneWhite: nothingNone,
    tree: nothingTree,
    selectDashboard: nothingSelectDashboard,
    error,
    none,
    addComponent,
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElEmpty;
/** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "empty-info" },
    imageSize: (__VLS_ctx.imageSize),
    description: (__VLS_ctx.description),
    image: (__VLS_ctx.getAssetsFile[__VLS_ctx.imgType]),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "empty-info" },
    imageSize: (__VLS_ctx.imageSize),
    description: (__VLS_ctx.description),
    image: (__VLS_ctx.getAssetsFile[__VLS_ctx.imgType]),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
var __VLS_5 = {};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['empty-info']} */ ;
// @ts-ignore
var __VLS_6 = __VLS_5;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getAssetsFile: getAssetsFile,
        };
    },
    props: {
        imgType: {
            type: String,
            default: 'table',
        },
        imageSize: {
            type: Number,
            default: 125,
        },
        description: {
            type: String,
            default: '',
        },
    },
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        imgType: {
            type: String,
            default: 'table',
        },
        imageSize: {
            type: Number,
            default: 125,
        },
        description: {
            type: String,
            default: '',
        },
    },
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
