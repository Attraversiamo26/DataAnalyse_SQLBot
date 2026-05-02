import { toType, createTypes } from 'vue-types';
const ProjectTypes = createTypes({
    func: undefined,
    bool: undefined,
    string: undefined,
    number: undefined,
    object: undefined,
    integer: undefined,
});
class propTypes extends ProjectTypes {
    style() {
        return toType('style', {
            type: [String, Object],
            default: undefined,
        });
    }
}
export { propTypes };
