import { computed, onWatcherCleanup, unref, watch, ref } from 'vue';
function isString(str) {
    return typeof str === 'string';
}
function useState(defaultStateValue) {
    const initValue = typeof defaultStateValue === 'function' ? defaultStateValue() : defaultStateValue;
    const innerValue = ref(initValue);
    function triggerChange(newValue) {
        innerValue.value = newValue;
    }
    return [innerValue, triggerChange];
}
/**
 * Return typed content and typing status when typing is enabled.
 * Or return content directly.
 */
const useTypedEffect = (content, typingEnabled, typingStep, typingInterval) => {
    const [prevContent, setPrevContent] = useState('');
    const [typingIndex, setTypingIndex] = useState(1);
    const mergedTypingEnabled = computed(() => typingEnabled.value && isString(content.value));
    // Reset typing index when content changed
    watch(content, () => {
        const prevContentValue = unref(prevContent);
        setPrevContent(content.value);
        if (!mergedTypingEnabled.value && isString(content.value)) {
            setTypingIndex(content.value.length);
        }
        else if (isString(content.value) &&
            isString(prevContentValue) &&
            content.value.indexOf(prevContentValue) !== 0) {
            setTypingIndex(1);
        }
    });
    // Start typing
    watch([typingIndex, typingEnabled, content], () => {
        if (mergedTypingEnabled.value &&
            isString(content.value) &&
            unref(typingIndex) < content.value.length) {
            const id = setTimeout(() => {
                setTypingIndex(unref(typingIndex) + typingStep.value);
            }, typingInterval.value);
            onWatcherCleanup(() => {
                clearTimeout(id);
            });
        }
    }, { immediate: true });
    const mergedTypingContent = computed(() => mergedTypingEnabled.value && isString(content.value)
        ? content.value.slice(0, unref(typingIndex))
        : content.value);
    return [
        mergedTypingContent,
        computed(() => mergedTypingEnabled.value &&
            isString(content.value) &&
            unref(typingIndex) < content.value.length),
    ];
};
export default useTypedEffect;
