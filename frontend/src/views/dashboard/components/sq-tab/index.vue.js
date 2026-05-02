import { computed, reactive, ref, toRefs, nextTick, getCurrentInstance, onMounted, } from 'vue';
import CustomTab from '@/views/dashboard/components/sq-tab/CustomTab.vue';
import { guid } from '@/utils/canvas.ts';
import DragHandle from '@/views/dashboard/canvas/DragHandle.vue';
import { ArrowDown } from '@element-plus/icons-vue';
import DashboardEditor from '@/views/dashboard/editor/DashboardEditor.vue';
const showTabTitleFlag = ref(true);
// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
let currentInstance;
import _ from 'lodash';
import SQPreview from '@/views/dashboard/preview/SQPreview.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const emits = defineEmits(['parentAddItemBox']);
const tabBaseMatrixCount = {
    x: 36,
    y: 12,
};
const props = defineProps({
    configItem: {
        type: Object,
        required: true,
    },
    canvasViewInfo: {
        type: Object,
        required: true,
    },
    showPosition: {
        required: false,
        type: String,
        default: 'preview',
    },
    canvasId: {
        type: String,
        default: 'canvas-main',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});
const { configItem } = toRefs(props);
const state = reactive({
    curItem: { title: '' },
    textarea: '',
    dialogVisible: false,
    tabShow: true,
    hoverFlag: false,
    headFontColor: '#OOOOOO',
    headFontActiveColor: '#OOOOOO',
    headBorderColor: '#OOOOOO',
    headBorderActiveColor: '#OOOOOO',
});
function addTab() {
    const newTab = {
        name: guid('tab'),
        title: t('dashboard.new_tab'),
        componentData: [],
        closable: true,
    };
    configItem.value.propValue.push(newTab);
    configItem.value.activeSubTabIndex = configItem.value.propValue.length - 1;
    configItem.value.activeTabName = newTab.name;
}
function deleteCur(param) {
    state.curItem = param;
    let len = configItem.value.propValue.length;
    while (len--) {
        if (configItem.value.propValue[len].name === param.name) {
            configItem.value.propValue.splice(len, 1);
            const activeIndex = (len - 1 + configItem.value.propValue.length) % configItem.value.propValue.length;
            configItem.value.activeTabName = configItem.value.propValue[activeIndex].name;
            configItem.value.activeSubTabIndex = configItem.value.propValue.length - 1;
            state.tabShow = false;
            nextTick(() => {
                state.tabShow = true;
            });
        }
    }
}
function editCurTitle(param) {
    configItem.value.activeTabName = param.name;
    state.curItem = param;
    state.textarea = param.title;
    state.dialogVisible = true;
}
function handleCommand(command) {
    switch (command.command) {
        case 'editTitle':
            editCurTitle(command.param);
            break;
        case 'deleteCur':
            deleteCur(command.param);
            break;
    }
}
const beforeHandleCommand = (item, param) => {
    return {
        command: item,
        param: param,
    };
};
const isEditMode = computed(() => props.showPosition === 'canvas' && !props.disabled);
const outResizeEnd = () => {
    state.tabShow = false;
    nextTick(() => {
        state.tabShow = true;
    });
};
const addTabItem = (item) => {
    // do addTabItem
    const index = configItem.value.propValue.findIndex(
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    (tabItem) => configItem.value.activeTabName === tabItem.name);
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const refInstance = currentInstance.refs['tabEditorRef_' + index][0];
    const newTabItem = _.cloneDeep(item);
    newTabItem.sizeX = 10;
    newTabItem.sizeY = 10;
    newTabItem.x = 1;
    newTabItem.y = 1;
    refInstance.addItemToBox(newTabItem);
};
function sureCurTitle() {
    state.curItem.title = state.textarea;
    state.dialogVisible = false;
}
const titleValid = computed(() => {
    return !!state.textarea && !!state.textarea.trim();
});
const titleStyle = (itemName) => {
    let style = {};
    if (configItem.value.activeTabName === itemName) {
        style = {
            fontSize: '16px',
        };
    }
    else {
        style = {
            fontSize: '14px',
        };
    }
    return style;
};
onMounted(() => {
    currentInstance = getCurrentInstance();
    if (configItem.value.propValue.length > 0 && !configItem.value.activeTabName) {
        configItem.value.activeTabName = configItem.value.propValue[0].name;
    }
});
const __VLS_exposed = {
    addTabItem,
    outResizeEnd,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: ({ 'tab-moveout': __VLS_ctx.configItem.moveOutActive }) },
});
/** @type {[typeof DragHandle, typeof DragHandle, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(DragHandle, new DragHandle({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {[typeof CustomTab, typeof CustomTab, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(CustomTab, new CustomTab({
    ...{ 'onTabAdd': {} },
    modelValue: (__VLS_ctx.configItem.activeTabName),
    addable: (__VLS_ctx.isEditMode),
    fontColor: (__VLS_ctx.state.headFontColor),
    activeColor: (__VLS_ctx.state.headFontActiveColor),
    borderColor: (__VLS_ctx.state.headBorderColor),
    borderActiveColor: (__VLS_ctx.state.headBorderActiveColor),
    hideTitle: (!__VLS_ctx.showTabTitleFlag),
}));
const __VLS_4 = __VLS_3({
    ...{ 'onTabAdd': {} },
    modelValue: (__VLS_ctx.configItem.activeTabName),
    addable: (__VLS_ctx.isEditMode),
    fontColor: (__VLS_ctx.state.headFontColor),
    activeColor: (__VLS_ctx.state.headFontActiveColor),
    borderColor: (__VLS_ctx.state.headBorderColor),
    borderActiveColor: (__VLS_ctx.state.headBorderActiveColor),
    hideTitle: (!__VLS_ctx.showTabTitleFlag),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
let __VLS_6;
let __VLS_7;
let __VLS_8;
const __VLS_9 = {
    onTabAdd: (__VLS_ctx.addTab)
};
__VLS_5.slots.default;
for (const [tabItem] of __VLS_getVForSourceType((__VLS_ctx.configItem.propValue))) {
    const __VLS_10 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        ...{ class: "el-tab-pane-custom" },
        lazy: (__VLS_ctx.isEditMode),
        label: (tabItem.title),
        name: (tabItem.name),
    }));
    const __VLS_12 = __VLS_11({
        ...{ class: "el-tab-pane-custom" },
        lazy: (__VLS_ctx.isEditMode),
        label: (tabItem.title),
        name: (tabItem.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_13.slots.default;
    {
        const { label: __VLS_thisSlot } = __VLS_13.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMousedown: () => { } },
            ...{ class: "custom-tab-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "title-inner" },
            ...{ style: (__VLS_ctx.titleStyle(tabItem.name)) },
        });
        (tabItem.title);
        if (__VLS_ctx.isEditMode) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            const __VLS_14 = {}.ElDropdown;
            /** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
            // @ts-ignore
            const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
                ...{ 'onCommand': {} },
                popperClass: "custom-de-tab-dropdown",
                trigger: "click",
            }));
            const __VLS_16 = __VLS_15({
                ...{ 'onCommand': {} },
                popperClass: "custom-de-tab-dropdown",
                trigger: "click",
            }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            let __VLS_18;
            let __VLS_19;
            let __VLS_20;
            const __VLS_21 = {
                onCommand: (__VLS_ctx.handleCommand)
            };
            __VLS_17.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "el-dropdown-link" },
            });
            if (__VLS_ctx.isEditMode) {
                const __VLS_22 = {}.ElIcon;
                /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                // @ts-ignore
                const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
                    ...{ style: {} },
                }));
                const __VLS_24 = __VLS_23({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_23));
                __VLS_25.slots.default;
                const __VLS_26 = {}.ArrowDown;
                /** @type {[typeof __VLS_components.ArrowDown, ]} */ ;
                // @ts-ignore
                const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({}));
                const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
                var __VLS_25;
            }
            {
                const { dropdown: __VLS_thisSlot } = __VLS_17.slots;
                const __VLS_30 = {}.ElDropdownMenu;
                /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
                // @ts-ignore
                const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({}));
                const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
                __VLS_33.slots.default;
                const __VLS_34 = {}.ElDropdownItem;
                /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
                // @ts-ignore
                const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
                    command: (__VLS_ctx.beforeHandleCommand('editTitle', tabItem)),
                }));
                const __VLS_36 = __VLS_35({
                    command: (__VLS_ctx.beforeHandleCommand('editTitle', tabItem)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_35));
                __VLS_37.slots.default;
                (__VLS_ctx.t('dashboard.edit'));
                var __VLS_37;
                if (__VLS_ctx.configItem.propValue.length > 1) {
                    const __VLS_38 = {}.ElDropdownItem;
                    /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
                        command: (__VLS_ctx.beforeHandleCommand('deleteCur', tabItem)),
                    }));
                    const __VLS_40 = __VLS_39({
                        command: (__VLS_ctx.beforeHandleCommand('deleteCur', tabItem)),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
                    __VLS_41.slots.default;
                    (__VLS_ctx.t('dashboard.delete'));
                    var __VLS_41;
                }
                var __VLS_33;
            }
            var __VLS_17;
        }
    }
    var __VLS_13;
}
if (__VLS_ctx.state.tabShow) {
    for (const [tabItem, index] of __VLS_getVForSourceType((__VLS_ctx.configItem.propValue))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (tabItem.name + '-content'),
            ...{ class: "tab-content-custom" },
            ...{ class: ({ 'switch-hidden': __VLS_ctx.configItem.activeTabName !== tabItem.name }) },
        });
        if (__VLS_ctx.showPosition === 'preview') {
            /** @type {[typeof SQPreview, typeof SQPreview, ]} */ ;
            // @ts-ignore
            const __VLS_42 = __VLS_asFunctionalComponent(SQPreview, new SQPreview({
                ref: ('tabPreviewRef_' + index),
                ...{ class: "tab-dashboard-preview" },
                componentData: (tabItem.componentData),
                canvasViewInfo: (__VLS_ctx.canvasViewInfo),
                baseMatrixCount: (__VLS_ctx.tabBaseMatrixCount),
                canvasId: (tabItem.name),
            }));
            const __VLS_43 = __VLS_42({
                ref: ('tabPreviewRef_' + index),
                ...{ class: "tab-dashboard-preview" },
                componentData: (tabItem.componentData),
                canvasViewInfo: (__VLS_ctx.canvasViewInfo),
                baseMatrixCount: (__VLS_ctx.tabBaseMatrixCount),
                canvasId: (tabItem.name),
            }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        }
        else {
            /** @type {[typeof DashboardEditor, typeof DashboardEditor, ]} */ ;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(DashboardEditor, new DashboardEditor({
                ...{ 'onParentAddItemBox': {} },
                ref: ('tabEditorRef_' + index),
                ...{ class: "tab-dashboard-editor-main" },
                canvasComponentData: (tabItem.componentData),
                canvasViewInfo: (__VLS_ctx.canvasViewInfo),
                moveInActive: (__VLS_ctx.configItem.moveInActive),
                baseMatrixCount: (__VLS_ctx.tabBaseMatrixCount),
                canvasId: (tabItem.name),
                parentConfigItem: (__VLS_ctx.configItem),
            }));
            const __VLS_46 = __VLS_45({
                ...{ 'onParentAddItemBox': {} },
                ref: ('tabEditorRef_' + index),
                ...{ class: "tab-dashboard-editor-main" },
                canvasComponentData: (tabItem.componentData),
                canvasViewInfo: (__VLS_ctx.canvasViewInfo),
                moveInActive: (__VLS_ctx.configItem.moveInActive),
                baseMatrixCount: (__VLS_ctx.tabBaseMatrixCount),
                canvasId: (tabItem.name),
                parentConfigItem: (__VLS_ctx.configItem),
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            let __VLS_48;
            let __VLS_49;
            let __VLS_50;
            const __VLS_51 = {
                onParentAddItemBox: ((item) => __VLS_ctx.emits('parentAddItemBox', item))
            };
            var __VLS_47;
        }
    }
}
var __VLS_5;
const __VLS_52 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.state.dialogVisible),
    title: (__VLS_ctx.t('dashboard.edit_title')),
    appendToBody: (true),
    width: "30%",
    showClose: (false),
    closeOnClickModal: (false),
    center: true,
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.state.dialogVisible),
    title: (__VLS_ctx.t('dashboard.edit_title')),
    appendToBody: (true),
    width: "30%",
    showClose: (false),
    closeOnClickModal: (false),
    center: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.state.textarea),
    maxlength: "50",
    clearable: true,
    placeholder: (__VLS_ctx.t('common.input_content')),
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.state.textarea),
    maxlength: "50",
    clearable: true,
    placeholder: (__VLS_ctx.t('common.input_content')),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
{
    const { footer: __VLS_thisSlot } = __VLS_55.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            __VLS_ctx.state.dialogVisible = false;
        }
    };
    __VLS_63.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_63;
    const __VLS_68 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        disabled: (!__VLS_ctx.titleValid),
        type: "primary",
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        disabled: (!__VLS_ctx.titleValid),
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (__VLS_ctx.sureCurTitle)
    };
    __VLS_71.slots.default;
    (__VLS_ctx.t('common.confirm'));
    var __VLS_71;
}
var __VLS_55;
/** @type {__VLS_StyleScopedClasses['tab-moveout']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tab-pane-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-tab-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dropdown-link']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-dashboard-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-dashboard-editor-main']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CustomTab: CustomTab,
            DragHandle: DragHandle,
            ArrowDown: ArrowDown,
            DashboardEditor: DashboardEditor,
            showTabTitleFlag: showTabTitleFlag,
            SQPreview: SQPreview,
            t: t,
            emits: emits,
            tabBaseMatrixCount: tabBaseMatrixCount,
            configItem: configItem,
            state: state,
            addTab: addTab,
            handleCommand: handleCommand,
            beforeHandleCommand: beforeHandleCommand,
            isEditMode: isEditMode,
            sureCurTitle: sureCurTitle,
            titleValid: titleValid,
            titleStyle: titleStyle,
        };
    },
    emits: {},
    props: {
        configItem: {
            type: Object,
            required: true,
        },
        canvasViewInfo: {
            type: Object,
            required: true,
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
        disabled: {
            type: Boolean,
            default: false,
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
        configItem: {
            type: Object,
            required: true,
        },
        canvasViewInfo: {
            type: Object,
            required: true,
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
        canvasId: {
            type: String,
            default: 'canvas-main',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
