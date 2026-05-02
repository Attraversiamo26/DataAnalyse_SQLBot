export class BaseChart {
    constructor(id, name) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'base-chart'
        });
        Object.defineProperty(this, "axis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "showLabel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.id = id;
        this._name = name;
    }
    init(axis, data) {
        this.axis = axis;
        this.data = data;
    }
}
