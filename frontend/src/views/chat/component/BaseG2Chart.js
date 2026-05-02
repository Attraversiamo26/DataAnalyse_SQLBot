import { BaseChart } from '@/views/chat/component/BaseChart.ts';
import { Chart } from '@antv/g2';
export class BaseG2Chart extends BaseChart {
    constructor(id, name) {
        super(id, name);
        Object.defineProperty(this, "chart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.chart = new Chart({
            container: id,
            autoFit: true,
            padding: 'auto',
        });
        this.chart.theme({
            view: {
                viewFill: '#FFFFFF',
            },
        });
    }
    render() {
        this.chart?.render();
    }
    destroy() {
        this.chart?.destroy();
    }
}
