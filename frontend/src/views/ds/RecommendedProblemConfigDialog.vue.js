import { reactive, ref } from 'vue';
import { recommendedApi } from '@/api/recommendedApi.ts';
import { Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus-secondary';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const emits = defineEmits(['recommendedProblemChange']);
const dialogShow = ref(false);
const state = reactive({
    datasource_id: null,
    recommended: {
        recommended_config: 1,
        recommendedProblemList: [],
    },
});
const init = (params) => {
    dialogShow.value = true;
    state.recommended.recommended_config = params.recommended_config || 1;
    state.datasource_id = params.id;
    recommendedApi.get_recommended_problem(state.datasource_id).then((res) => {
        state.recommended.recommendedProblemList = res;
    });
};
const addRecommendedProblem = () => {
    state.recommended.recommendedProblemList.push({
        question: '',
        datasource_id: state.datasource_id,
    });
};
const closeDialog = () => {
    dialogShow.value = false;
    state.recommended = {
        recommended_config: 1,
        recommendedProblemList: [],
    };
};
const save = () => {
    if (state.recommended.recommended_config == 2) {
        let checkProblem = false;
        let repetitiveQuestion = false;
        if (state.recommended.recommendedProblemList.length === 0) {
            checkProblem = true;
        }
        const questions = new Set();
        state.recommended.recommendedProblemList.forEach((problem) => {
            if (problem.question.length > 200 || problem.question.length < 2) {
                checkProblem = true;
            }
            if (questions.has(problem.question)) {
                repetitiveQuestion = true;
            }
            questions.add(problem.question);
        });
        if (checkProblem) {
            ElMessage.error(t('datasource.recommended_problem_tips'));
            return;
        }
        if (repetitiveQuestion) {
            ElMessage.error(t('datasource.recommended_repetitive_tips'));
            return;
        }
    }
    recommendedApi
        .save_recommended_problem({
        recommended_config: state.recommended.recommended_config,
        datasource_id: state.datasource_id,
        problemInfo: state.recommended.recommendedProblemList,
    })
        .then(() => {
        emits('recommendedProblemChange');
        closeDialog();
    });
};
const deleteRecommendedProblem = (index) => {
    state.recommended.recommendedProblemList.splice(index, 1);
};
const __VLS_exposed = {
    init,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-input-group__append']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBeforeClosed': {} },
    modelValue: (__VLS_ctx.dialogShow),
    title: (__VLS_ctx.$t('datasource.recommended_problem_configuration')),
    width: "600",
    modalClass: "add-question_dialog",
    destroyOnClose: true,
    closeOnClickModal: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBeforeClosed': {} },
    modelValue: (__VLS_ctx.dialogShow),
    title: (__VLS_ctx.$t('datasource.recommended_problem_configuration')),
    width: "600",
    modalClass: "add-question_dialog",
    destroyOnClose: true,
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBeforeClosed: (__VLS_ctx.closeDialog)
};
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_9 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    label: (__VLS_ctx.$t('datasource.problem_generation_method')),
    prop: "mode",
}));
const __VLS_11 = __VLS_10({
    label: (__VLS_ctx.$t('datasource.problem_generation_method')),
    prop: "mode",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    modelValue: (__VLS_ctx.state.recommended.recommended_config),
}));
const __VLS_15 = __VLS_14({
    modelValue: (__VLS_ctx.state.recommended.recommended_config),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    value: (1),
}));
const __VLS_19 = __VLS_18({
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
(__VLS_ctx.$t('datasource.ai_automatic_generation'));
var __VLS_20;
const __VLS_21 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    value: (2),
}));
const __VLS_23 = __VLS_22({
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
(__VLS_ctx.$t('datasource.user_defined'));
var __VLS_24;
var __VLS_16;
var __VLS_12;
if (__VLS_ctx.state.recommended.recommended_config === 2) {
    for (const [recommendedItem, index] of __VLS_getVForSourceType((__VLS_ctx.state.recommended.recommendedProblemList))) {
        const __VLS_25 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
            key: (index),
            prop: "mode",
        }));
        const __VLS_27 = __VLS_26({
            key: (index),
            prop: "mode",
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_28.slots.default;
        const __VLS_29 = {}.ElRow;
        /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
            ...{ class: "question-item" },
        }));
        const __VLS_31 = __VLS_30({
            ...{ class: "question-item" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        __VLS_32.slots.default;
        const __VLS_33 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
            modelValue: (recommendedItem.question),
            max: "200",
            min: "2",
            ...{ class: "input-item" },
            clearable: true,
            placeholder: (__VLS_ctx.$t('datasource.question_tips')),
        }));
        const __VLS_35 = __VLS_34({
            modelValue: (recommendedItem.question),
            max: "200",
            min: "2",
            ...{ class: "input-item" },
            clearable: true,
            placeholder: (__VLS_ctx.$t('datasource.question_tips')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        const __VLS_37 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
            ...{ class: "delete-item" },
        }));
        const __VLS_39 = __VLS_38({
            ...{ class: "delete-item" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        __VLS_40.slots.default;
        const __VLS_41 = {}.Delete;
        /** @type {[typeof __VLS_components.Delete, ]} */ ;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
            ...{ 'onClick': {} },
        }));
        const __VLS_43 = __VLS_42({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        let __VLS_45;
        let __VLS_46;
        let __VLS_47;
        const __VLS_48 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.state.recommended.recommended_config === 2))
                    return;
                __VLS_ctx.deleteRecommendedProblem(index);
            }
        };
        var __VLS_44;
        var __VLS_40;
        var __VLS_32;
        var __VLS_28;
    }
    if (__VLS_ctx.state.recommended.recommendedProblemList.length < 10) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_49 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
            ...{ 'onClick': {} },
            text: true,
        }));
        const __VLS_51 = __VLS_50({
            ...{ 'onClick': {} },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        let __VLS_53;
        let __VLS_54;
        let __VLS_55;
        const __VLS_56 = {
            onClick: (__VLS_ctx.addRecommendedProblem)
        };
        __VLS_52.slots.default;
        (__VLS_ctx.$t('datasource.add_question'));
        var __VLS_52;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_57 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_59 = __VLS_58({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
let __VLS_61;
let __VLS_62;
let __VLS_63;
const __VLS_64 = {
    onClick: (__VLS_ctx.closeDialog)
};
__VLS_60.slots.default;
(__VLS_ctx.$t('common.cancel'));
var __VLS_60;
const __VLS_65 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_67 = __VLS_66({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_69;
let __VLS_70;
let __VLS_71;
const __VLS_72 = {
    onClick: (__VLS_ctx.save)
};
__VLS_68.slots.default;
(__VLS_ctx.$t('common.save'));
var __VLS_68;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['question-item']} */ ;
/** @type {__VLS_StyleScopedClasses['input-item']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Delete: Delete,
            dialogShow: dialogShow,
            state: state,
            addRecommendedProblem: addRecommendedProblem,
            closeDialog: closeDialog,
            save: save,
            deleteRecommendedProblem: deleteRecommendedProblem,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
