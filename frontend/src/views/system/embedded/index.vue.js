import { ref } from 'vue';
import IframeVue from './iframe.vue';
import PageVue from './Page.vue';
const btnSelect = ref('d');
const btnSelectChange = (val) => {
    btnSelect.value = val;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.btnSelect === 'q') {
    /** @type {[typeof PageVue, typeof PageVue, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(PageVue, new PageVue({
        ...{ 'onBtnSelectChange': {} },
        btnSelect: (__VLS_ctx.btnSelect),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onBtnSelectChange': {} },
        btnSelect: (__VLS_ctx.btnSelect),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onBtnSelectChange: (__VLS_ctx.btnSelectChange)
    };
    var __VLS_2;
}
if (__VLS_ctx.btnSelect === 'd') {
    /** @type {[typeof IframeVue, typeof IframeVue, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(IframeVue, new IframeVue({
        ...{ 'onBtnSelectChange': {} },
        btnSelect: (__VLS_ctx.btnSelect),
    }));
    const __VLS_8 = __VLS_7({
        ...{ 'onBtnSelectChange': {} },
        btnSelect: (__VLS_ctx.btnSelect),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_10;
    let __VLS_11;
    let __VLS_12;
    const __VLS_13 = {
        onBtnSelectChange: (__VLS_ctx.btnSelectChange)
    };
    var __VLS_9;
}
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IframeVue: IframeVue,
            PageVue: PageVue,
            btnSelect: btnSelect,
            btnSelectChange: btnSelectChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
