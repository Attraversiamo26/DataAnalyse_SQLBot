<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { PropType } from 'vue'
import { Chart } from '@antv/g2'

const props = defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  chartType: {
    type: String as PropType<'bar' | 'line' | 'scatter' | 'pie' | 'heatmap'>,
    default: 'bar',
  },
  xField: {
    type: String,
    default: 'x',
  },
  yField: {
    type: String,
    default: 'y',
  },
  title: {
    type: String,
    default: '',
  },
})

const chartRef = ref<HTMLElement | null>(null)
let chart: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  // 销毁旧图表
  if (chart) {
    chart.destroy()
  }

  // 创建新图表
  chart = new Chart({
    container: chartRef.value,
    width: chartRef.value.clientWidth,
    height: 400,
  })

  // 设置数据
  chart.data(props.data)

  // 设置标题
  if (props.title) {
    chart.title(props.title)
  }

  // 根据图表类型设置配置
  switch (props.chartType) {
    case 'bar':
      chart
        .interval()
        .encode('x', props.xField)
        .encode('y', props.yField)
        .encode('color', props.xField)
      break
    case 'line':
      chart.line().encode('x', props.xField).encode('y', props.yField).encode('color', props.xField)
      break
    case 'scatter':
      chart
        .point()
        .encode('x', props.xField)
        .encode('y', props.yField)
        .encode('color', props.xField)
      break
    case 'pie':
      chart
        .interval()
        .encode('x', props.xField)
        .encode('y', props.yField)
        .encode('color', props.xField)
        .label({ text: (datum: any) => datum[props.xField] })
      // 饼图使用默认配置
      break
    case 'heatmap':
      chart.rect().encode('x', props.xField).encode('y', props.yField).encode('color', props.yField)
      break
  }

  // 渲染图表
  chart.render()
}

onMounted(() => {
  createChart()
})

watch(
  () => props.data,
  () => {
    createChart()
  },
  { deep: true }
)

watch(
  () => props.chartType,
  () => {
    createChart()
  }
)

watch(
  () => props.xField,
  () => {
    createChart()
  }
)

watch(
  () => props.yField,
  () => {
    createChart()
  }
)

watch(
  () => props.title,
  () => {
    createChart()
  }
)
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  margin: 20px 0;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
