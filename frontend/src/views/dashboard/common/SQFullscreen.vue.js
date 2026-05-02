import { dashboardStoreWithOut } from '@/stores/dashboard/dashboard.ts';
const dashboardStore = dashboardStoreWithOut();
import { onBeforeUnmount, onMounted } from 'vue';
import { useEmitt } from '@/utils/useEmitt.ts';
const __VLS_props = defineProps({
    themes: {
        type: String,
        default: 'light',
    },
    componentType: {
        type: String,
        default: 'button',
    },
    showPosition: {
        required: false,
        type: String,
        default: 'preview',
    },
});
const fullscreenChange = () => {
    const isFullscreen = !!document.fullscreenElement;
    dashboardStore.setFullscreenFlag(isFullscreen);
    setTimeout(() => {
        useEmitt().emitter.emit('custom-canvas-resize');
    }, 100);
};
const toggleFullscreen = () => {
    const bodyNode = document.querySelector('body');
    if (!document.fullscreenElement) {
        bodyNode?.requestFullscreen();
    }
    else {
        document.exitFullscreen();
    }
};
const handleKeydown = (event) => {
    if (event.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
    }
};
onMounted(() => {
    document.addEventListener('fullscreenchange', fullscreenChange);
    document.addEventListener('keydown', handleKeydown);
});
onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', fullscreenChange);
    document.removeEventListener('keydown', handleKeydown);
});
const __VLS_exposed = {
    toggleFullscreen,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        themes: {
            type: String,
            default: 'light',
        },
        componentType: {
            type: String,
            default: 'button',
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    props: {
        themes: {
            type: String,
            default: 'light',
        },
        componentType: {
            type: String,
            default: 'button',
        },
        showPosition: {
            required: false,
            type: String,
            default: 'preview',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
