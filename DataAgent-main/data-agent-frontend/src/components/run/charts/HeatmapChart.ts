/*
 * Copyright 2024-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as echarts from 'echarts';
import { BaseChart } from './BaseChart';

export class HeatmapChart extends BaseChart {
  private chartInstance: echarts.ECharts | null = null;

  constructor(id: string, name: string) {
    super(id, name);
  }

  render(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const container = document.getElementById(this.id);
    if (!container) {
      return;
    }

    // 获取x轴、y轴和值数据
    const xAxis = this.axis.find(axis => axis.type === 'x');
    const yAxis = this.axis.find(axis => axis.type === 'y');
    const valueAxis = this.axis.find(axis => axis.type !== 'x' && axis.type !== 'y') || this.axis[2];

    if (!xAxis || !yAxis || !valueAxis) {
      return;
    }

    // 准备热力图数据
    const heatmapData = this.data.map(item => {
      const xValue = item[xAxis.value];
      const yValue = item[yAxis.value];
      const value = parseFloat(item[valueAxis.value]) || 0;
      return [xValue, yValue, value];
    });

    // 获取唯一的x轴和y轴值
    const xAxisData = Array.from(new Set(this.data.map(item => item[xAxis.value])));
    const yAxisData = Array.from(new Set(this.data.map(item => item[yAxis.value])));

    if (!this.chartInstance) {
      this.chartInstance = echarts.init(container);
    }

    const option: echarts.EChartsOption = {
      title: {
        text: this._name || '热力图',
        left: 'center',
      },
      tooltip: {
        position: 'top',
        formatter: function(params: any) {
          return `${xAxis.name}: ${params.value[0]}<br/>${yAxis.name}: ${params.value[1]}<br/>${valueAxis.name}: ${params.value[2]}`;
        },
      },
      grid: {
        height: '50%',
        top: '10%',
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: Math.max(...this.data.map(item => parseFloat(item[valueAxis.value]) || 0)),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
      },
      series: [
        {
          name: valueAxis.name,
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    this.chartInstance.setOption(option);
  }

  destroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
  }

  resize(): void {
    if (this.chartInstance) {
      this.chartInstance.resize();
    }
  }
}