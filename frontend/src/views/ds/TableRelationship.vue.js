import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue';
import { datasourceApi } from '@/api/datasource';
import { useI18n } from 'vue-i18n';
import { Graph, Shape } from '@antv/x6';
import { debounce } from 'lodash-es';
const LINE_HEIGHT = 36;
const NODE_WIDTH = 180;
const props = withDefaults(defineProps(), {
    id: 0,
    dragging: false,
});
const emits = defineEmits(['getTableName']);
const { t } = useI18n();
const loading = ref(false);
const tooltipY = ref('-999px');
const tooltipX = ref('-999px');
const tooltipContent = ref('');
const nodeIds = ref([]);
const cells = ref([]);
const edgeOPtion = {
    tools: [
        {
            name: 'button-remove', // 工具名称
            args: { x: 20, y: 20 }, // 工具对应的参数
        },
    ],
    attrs: {
        line: {
            stroke: '#DEE0E3',
            strokeWidth: 2,
        },
    },
};
let graph;
const resetTooltip = () => {
    tooltipY.value = '-1000px';
    tooltipX.value = '-1000px';
    tooltipContent.value = '';
};
const initGraph = () => {
    Graph.registerPortLayout('erPortPosition', (portsPositionArgs) => {
        return portsPositionArgs.map((_, index) => {
            return {
                position: {
                    x: 0,
                    y: (index + 1) * LINE_HEIGHT + 15,
                },
                angle: 0,
            };
        });
    }, true);
    Graph.registerNode('er-rect', {
        inherit: 'rect',
        markup: [
            {
                tagName: 'path',
                selector: 'top',
            },
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'label',
            },
            {
                tagName: 'path',
                selector: 'div',
            },
        ],
        attrs: {
            top: {
                fill: '#BBBFC4',
                refX: 0,
                refY: 0,
                d: 'M0 5C0 2.23858 2.23858 0 5 0H175C177.761 0 180 2.23858 180 5H0Z',
            },
            rect: {
                strokeWidth: 0.5,
                stroke: '#DEE0E3',
                fill: '#F5F6F7',
                refY: 5,
            },
            div: {
                fillRule: 'evenodd',
                clipRule: 'evenodd',
                fill: '#646A73',
                refX: 12,
                refY: 21,
                fontSize: 14,
                d: 'M1.4773 1.47724C1.67618 1.27836 1.94592 1.16663 2.22719 1.16663H11.7729C12.0541 1.16663 12.3239 1.27836 12.5227 1.47724C12.7216 1.67612 12.8334 1.94586 12.8334 2.22713V11.7728C12.8334 12.0541 12.7216 12.3238 12.5227 12.5227C12.3239 12.7216 12.0541 12.8333 11.7729 12.8333H2.22719C1.64152 12.8333 1.16669 12.3585 1.16669 11.7728V2.22713C1.16669 1.94586 1.27842 1.67612 1.4773 1.47724ZM2.33335 5.83329V8.16662H4.66669V5.83329H2.33335ZM2.33335 9.33329V11.6666H4.66669V9.33329H2.33335ZM5.83335 11.6666H8.16669V9.33329H5.83335V11.6666ZM9.33335 11.6666H11.6667V9.33329H9.33335V11.6666ZM11.6667 8.16662V5.83329H9.33335V8.16662H11.6667ZM8.16669 5.83329H5.83335V8.16662H8.16669V5.83329ZM11.6667 2.33329H2.33335V4.66663H11.6667V2.33329Z',
            },
            label: {
                fill: '#1F2329',
                fontSize: 14,
            },
        },
        ports: {
            groups: {
                list: {
                    markup: [
                        {
                            tagName: 'rect',
                            selector: 'portBody',
                        },
                        {
                            tagName: 'text',
                            selector: 'portNameLabel',
                        },
                    ],
                    attrs: {
                        portBody: {
                            width: NODE_WIDTH,
                            height: LINE_HEIGHT,
                            stroke: '#DEE0E3',
                            strokeWidth: 0.5,
                            fill: '#ffffff',
                            magnet: true,
                        },
                        portNameLabel: {
                            ref: 'portBody',
                            refX: 12,
                            refY: 9.5,
                            fontSize: 14,
                            textAnchor: 'left',
                            textWrap: {
                                width: 150,
                                height: 24,
                                ellipsis: true,
                            },
                        },
                    },
                    position: 'erPortPosition',
                },
            },
        },
    }, true);
    graph = new Graph({
        mousewheel: {
            enabled: true,
            modifiers: ['ctrl', 'meta'],
            factor: 1.05,
        },
        container: document.getElementById('container'),
        autoResize: true,
        panning: true,
        connecting: {
            allowBlank: false,
            router: {
                name: 'er',
                args: {
                    offset: 25,
                    direction: 'H',
                },
            },
            validateEdge({ edge }) {
                const obj = edge.store.data;
                if (!obj.target.port || obj.target.cell === obj.source.cell)
                    return false;
                return true;
            },
            createEdge() {
                return new Shape.Edge(edgeOPtion);
            },
        },
    });
    graph.on('edge:mouseenter', ({ e }) => {
        Array.from(document.querySelectorAll('.x6-edge-tool')).forEach((ele) => {
            if (ele.dataset.cellId === e.target.parentNode.dataset.cellId) {
                ele.style.display = 'block';
            }
        });
    });
    graph.on('edge:mouseleave', ({ e }) => {
        Array.from(document.querySelectorAll('.x6-edge-tool')).forEach((ele) => {
            if (ele.dataset.cellId === e.target.parentNode.dataset.cellId) {
                ele.style.display = 'none';
            }
        });
    });
    graph.on('node:port:mouseenter', debounce(({ e, node, port }) => {
        tooltipY.value = e.offsetY + 'px';
        tooltipX.value = e.offsetX + 'px';
        tooltipContent.value = node.port.ports.find((ele) => +port === ele.id).attrs.portNameLabel.text;
    }, 100));
    graph.on('cell:mouseover', debounce(({ e, cell }) => {
        if (cell.store.data.shape === 'edge')
            return;
        tooltipY.value = e.offsetY + 'px';
        tooltipX.value = e.offsetX + 'px';
        tooltipContent.value = cell.store.data.attrs?.label?.text;
    }, 100));
    graph.on('node:mouseleave', debounce(() => {
        resetTooltip();
    }, 100));
    graph.on('node:mouseenter', ({ node }) => {
        node.addTools({
            name: 'button',
            args: {
                markup: [
                    {
                        tagName: 'circle',
                        selector: 'button',
                        attrs: {
                            r: 7,
                            cursor: 'pointer',
                        },
                    },
                    {
                        tagName: 'path',
                        selector: 'icon',
                        attrs: {
                            d: 'M -3 -3 3 3 M -3 3 3 -3',
                            stroke: 'white',
                            'stroke-width': 2,
                            cursor: 'pointer',
                        },
                    },
                ],
                x: 0,
                y: 0,
                offset: { x: 165, y: 28 },
                onClick({ view }) {
                    node.removeTools();
                    graph.removeNode(view.cell.id);
                    nodeIds.value = nodeIds.value.filter((ele) => ele !== view.cell.id);
                    resetTooltip();
                    if (!nodeIds.value.length) {
                        graph.dispose();
                        graph = null;
                    }
                    emits('getTableName', [...nodeIds.value]);
                },
            },
        });
    });
    // 鼠标移开时删除按钮
    graph.on('node:mouseleave', ({ node }) => {
        node.removeTools(); // 删除所有的工具
    });
};
const getTableData = () => {
    loading.value = true;
    datasourceApi
        .relationGet(props.id)
        .then((data) => {
        if (!data.length)
            return;
        nodeIds.value = data.filter((ele) => ele.shape === 'er-rect').map((ele) => ele.id);
        nextTick(() => {
            if (!graph) {
                initGraph();
            }
            data.forEach((item) => {
                if (item.shape === 'edge') {
                    cells.value.push(graph.createEdge({ ...item, ...edgeOPtion }));
                }
                else {
                    cells.value.push(graph.createNode({
                        ...item,
                        position: {
                            x: Number.parseInt(item.position.x),
                            y: Number.parseInt(item.position.y),
                        },
                        height: LINE_HEIGHT + 15,
                        width: NODE_WIDTH,
                    }));
                }
            });
            graph.resetCells(cells.value);
            graph.zoomToFit({ padding: 100 });
            emits('getTableName', [...nodeIds.value]);
        });
    })
        .finally(() => {
        loading.value = false;
    });
};
onMounted(() => {
    getTableData();
});
onBeforeUnmount(() => {
    graph = null;
});
const dragover = () => {
    // do
};
const addNode = (node, tableX, tableY) => {
    if (!graph) {
        initGraph();
    }
    const { x, y } = graph.pageToLocal(tableX, tableY);
    graph.addNode(graph.createNode({
        ...node,
        position: {
            x,
            y,
        },
        attrs: {
            label: {
                text: node.label,
                textAnchor: 'left',
                refX: 34,
                refY: 28,
                textWrap: {
                    width: 120,
                    height: 24,
                    ellipsis: true,
                },
            },
        },
        height: LINE_HEIGHT + 15,
        width: NODE_WIDTH,
    }));
};
const clickTable = (table) => {
    loading.value = true;
    datasourceApi
        .fieldList(table.id)
        .then((res) => {
        const node = {
            id: table.id,
            shape: 'er-rect',
            label: table.table_name,
            width: 150,
            height: 24,
            ports: res.map((ele) => {
                return {
                    id: ele.id,
                    group: 'list',
                    attrs: {
                        portNameLabel: {
                            text: ele.field_name,
                        },
                        portTypeLabel: {
                            text: ele.field_type,
                        },
                    },
                };
            }),
        };
        nodeIds.value = [...nodeIds.value, table.id];
        nextTick(() => {
            addNode(node, table.x, table.y);
        });
        emits('getTableName', [...nodeIds.value]);
    })
        .finally(() => {
        loading.value = false;
    });
};
const drop = (e) => {
    const obj = JSON.parse(e.dataTransfer.getData('table') || '{}');
    if (!obj.id)
        return;
    clickTable({
        ...obj,
        x: e.pageX,
        y: e.pageY,
    });
};
const save = () => {
    datasourceApi.relationSave(props.id, graph.toJSON().cells).then(() => {
        ElMessage({
            type: 'success',
            message: t('common.save_success'),
        });
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    id: 0,
    dragging: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    ...{ style: {} },
    'xmlns:xlink': "http://www.w3.org/1999/xlink",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.defs, __VLS_intrinsicElements.defs)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.filter, __VLS_intrinsicElements.filter)({
    id: "filter-dropShadow-v0-3329848037",
    x: "-1",
    y: "-1",
    width: "3",
    height: "3",
    filterUnits: "objectBoundingBox",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.feDropShadow, __VLS_intrinsicElements.feDropShadow)({
    stdDeviation: "4",
    dx: "1",
    dy: "2",
    'flood-color': "#1F23291F",
    'flood-opacity': "0.65",
});
if (!__VLS_ctx.nodeIds.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "relationship-empty" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    (__VLS_ctx.t('training.add_it_here'));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: "container",
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onDragover: (__VLS_ctx.dragover) },
    ...{ onDrop: (__VLS_ctx.drop) },
    ...{ class: "drag-mask" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.dragging) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "save-btn" },
});
if (__VLS_ctx.nodeIds.length) {
    const __VLS_0 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.save)
    };
    __VLS_3.slots.default;
    (__VLS_ctx.t('common.save'));
    var __VLS_3;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tooltip-content" },
    ...{ style: ({ top: __VLS_ctx.tooltipY, left: __VLS_ctx.tooltipX, position: 'absolute' }) },
});
(__VLS_ctx.tooltipContent);
/** @type {__VLS_StyleScopedClasses['relationship-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['drag-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            t: t,
            loading: loading,
            tooltipY: tooltipY,
            tooltipX: tooltipX,
            tooltipContent: tooltipContent,
            nodeIds: nodeIds,
            dragover: dragover,
            drop: drop,
            save: save,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
