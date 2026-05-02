<template>
  <div class="data-agent-container">
    <el-card class="data-agent-card">
      <template #header>
        <div class="card-header">
          <span>数据分析工具</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="data-agent-tabs">
        <!-- 数据基本统计标签页 -->
        <el-tab-pane label="数据基本统计" name="basic-stats">
          <div class="basic-stats-section">
            <el-form :model="dataSourceForm" label-width="80px" class="data-source-form">
              <el-form-item label="数据源">
                <el-select
                  v-model="dataSourceForm.datasource_id"
                  placeholder="请选择数据源"
                  :loading="isLoadingDatasources"
                  @change="handleDatasourceChange"
                >
                  <el-option
                    v-for="datasource in datasources"
                    :key="datasource.id"
                    :label="datasource.name"
                    :value="datasource.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="表名">
                <el-select
                  v-model="dataSourceForm.table_name"
                  placeholder="请选择表名"
                  :loading="isLoadingTables"
                >
                  <el-option
                    v-for="table in tables"
                    :key="table.id"
                    :label="table.table_name"
                    :value="table.table_name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="isLoadingBasicStats" @click="getBasicStats">
                  {{ isLoadingBasicStats ? '加载中...' : '获取数据统计' }}
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 数据基本统计结果 -->
            <div v-if="basicStatsResult" class="basic-stats-result">
              <el-divider content-position="left">数据基本信息</el-divider>
              <el-card class="stats-card">
                <div class="stats-info">
                  <el-statistic title="总行数" :value="basicStatsResult.total_rows" />
                  <el-statistic title="总列数" :value="basicStatsResult.total_columns" />
                </div>
              </el-card>

              <el-divider content-position="left">列信息</el-divider>
              <el-card class="columns-card">
                <el-table :data="basicStatsResult.columns_info" style="width: 100%">
                  <el-table-column prop="name" label="列名" width="150" />
                  <el-table-column prop="type" label="类型" width="100" />
                  <el-table-column prop="dtype" label="数据类型" width="150" />
                  <el-table-column prop="non_null_count" label="非空值" width="100" />
                  <el-table-column prop="null_count" label="空值" width="100" />
                  <el-table-column prop="null_percentage" label="空值百分比" width="120">
                    <template #default="scope"> {{ scope.row.null_percentage }}% </template>
                  </el-table-column>
                </el-table>
              </el-card>

              <el-divider content-position="left">数据质量</el-divider>
              <el-card class="quality-card">
                <div class="quality-info">
                  <el-statistic
                    title="空值总数"
                    :value="basicStatsResult.data_quality.null_values.total_null_count"
                  />
                  <el-statistic
                    title="空值百分比"
                    :value="basicStatsResult.data_quality.null_values.null_percentage"
                    suffix="%"
                  />
                  <el-statistic
                    title="重复行数"
                    :value="basicStatsResult.data_quality.duplicate_rows.total_duplicate_count"
                  />
                  <el-statistic
                    title="重复行百分比"
                    :value="basicStatsResult.data_quality.duplicate_rows.duplicate_percentage"
                    suffix="%"
                  />
                </div>
              </el-card>

              <el-divider content-position="left">前5条数据</el-divider>
              <el-card class="sample-card">
                <el-table
                  v-if="basicStatsResult.sample_data.length > 0"
                  :data="basicStatsResult.sample_data"
                  style="width: 100%"
                >
                  <el-table-column
                    v-for="(_, key) in basicStatsResult.sample_data[0]"
                    :key="key"
                    :prop="key"
                    :label="key"
                  />
                </el-table>
                <div v-else class="empty-sample">无数据</div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 数据分析标签页 -->
        <el-tab-pane label="数据分析" name="analysis">
          <div class="analysis-section">
            <!-- 智能分析建议 -->
            <el-divider content-position="left">智能分析建议</el-divider>
            <el-card class="analysis-suggestion-card">
              <el-form :model="analysisForm" label-width="100px" class="analysis-form">
                <el-form-item label="分析类型">
                  <el-select
                    v-model="analysisForm.analysis_type"
                    placeholder="请选择分析类型"
                    @change="handleAnalysisTypeChange"
                  >
                    <el-option
                      v-for="type in analysisTypes"
                      :key="type.id"
                      :label="type.name"
                      :value="type.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="选择列">
                  <el-select
                    v-model="analysisForm.selected_columns"
                    :multiple="currentAnalysisType?.required_columns !== 1"
                    placeholder="请选择列"
                    :disabled="!analysisForm.analysis_type || filteredColumns.length === 0"
                    :multiple-limit="currentAnalysisType?.required_columns === 1 ? 1 : undefined"
                  >
                    <el-option
                      v-for="column in filteredColumns"
                      :key="column.name"
                      :label="column.name"
                      :value="column.name"
                    />
                  </el-select>
                  <div v-if="currentAnalysisType" class="column-hint">
                    {{
                      currentAnalysisType.required_columns === 1 ? '请选择一列' : '请选择至少两列'
                    }}
                  </div>
                  <div
                    v-if="filteredColumns.length === 0"
                    class="column-hint"
                    style="color: #f56c6c"
                  >
                    没有符合当前分析类型要求的列
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="isGeneratingRequirement"
                    @click="generateRequirement"
                  >
                    {{ isGeneratingRequirement ? '生成中...' : '生成分析需求' }}
                  </el-button>
                </el-form-item>
              </el-form>

              <!-- 生成的分析需求 -->
              <div v-if="generatedRequirement" class="generated-requirement">
                <el-divider content-position="left">生成的分析需求</el-divider>
                <el-input
                  v-model="generatedRequirement"
                  type="textarea"
                  :rows="3"
                  placeholder="生成的分析需求将显示在这里"
                />
                <div class="requirement-actions">
                  <el-button type="primary" @click="useGeneratedRequirement">使用此需求</el-button>
                </div>
              </div>
            </el-card>

            <!-- 对话窗口 -->
            <el-divider content-position="left">对话分析</el-divider>
            <div class="chat-window">
              <div class="chat-messages">
                <div
                  v-for="(message, index) in chatMessages"
                  :key="index"
                  :class="['message', message.role]"
                >
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-role">{{
                        message.role === 'user' ? '用户' : '系统'
                      }}</span>
                      <span class="message-time">{{ message.timestamp }}</span>
                    </div>
                    <div class="message-body">
                      {{ message.content }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="chat-input">
                <el-input
                  v-model="chatInput"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入您的数据分析需求..."
                  @keyup.enter.ctrl="sendMessage"
                />
                <div class="chat-actions">
                  <el-button type="primary" @click="sendMessage">发送</el-button>
                </div>
              </div>
            </div>

            <!-- 数据源选择 -->
            <el-divider content-position="left">数据源选择</el-divider>
            <el-form :model="dataSourceForm" label-width="80px" class="data-source-form">
              <el-form-item label="数据源">
                <el-select
                  v-model="dataSourceForm.datasource_id"
                  placeholder="请选择数据源"
                  :loading="isLoadingDatasources"
                  @change="handleDatasourceChange"
                >
                  <el-option
                    v-for="datasource in datasources"
                    :key="datasource.id"
                    :label="datasource.name"
                    :value="datasource.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="表名">
                <el-select
                  v-model="dataSourceForm.table_name"
                  placeholder="请选择表名"
                  :loading="isLoadingTables"
                >
                  <el-option
                    v-for="table in tables"
                    :key="table.id"
                    :label="table.table_name"
                    :value="table.table_name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="数据输入">
                <el-input
                  v-model="dataSourceForm.data"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入JSON格式的数据，或从数据源获取"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="isAnalyzing" @click="analyzeData">
                  {{ isAnalyzing ? '分析中...' : '开始分析' }}
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 分析结果 -->
            <div v-if="analysisResult" class="analysis-result">
              <el-divider content-position="left">分析结果</el-divider>
              <el-card class="result-card">
                <pre>{{ analysisResult.result }}</pre>
              </el-card>

              <!-- 生成的图表 -->
              <div v-if="analysisResult.result" class="generated-charts-section">
                <el-divider content-position="left">生成的图表</el-divider>
                <div class="generated-charts">
                  <el-card
                    v-for="(chart, key) in getGeneratedCharts()"
                    :key="key"
                    class="chart-item-card"
                  >
                    <img :src="chart" :alt="String(key)" class="generated-chart" />
                    <div class="chart-caption">{{ key }}</div>
                  </el-card>
                </div>
              </div>

              <!-- 图表可视化 -->
              <div v-if="chartData.length > 0" class="chart-section">
                <el-divider content-position="left">图表可视化</el-divider>
                <el-card class="chart-card">
                  <el-select
                    v-model="selectedChartType"
                    placeholder="选择图表类型"
                    class="chart-type-select"
                  >
                    <el-option label="柱状图" value="bar" />
                    <el-option label="折线图" value="line" />
                    <el-option label="散点图" value="scatter" />
                    <el-option label="饼图" value="pie" />
                    <el-option label="热力图" value="heatmap" />
                  </el-select>
                  <ChartComponent
                    :data="chartData"
                    :chart-type="selectedChartType"
                    :x-field="chartXField"
                    :y-field="chartYField"
                    :title="chartTitle"
                  />
                </el-card>
              </div>

              <el-divider content-position="left">分析报告</el-divider>
              <el-card class="report-card">
                <p>{{ analysisResult.report }}</p>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 分析结果管理标签页 -->
        <el-tab-pane label="分析结果" name="results">
          <div class="results-section">
            <el-table :data="analysisResults" style="width: 100%">
              <el-table-column prop="name" label="名称" width="200" />
              <el-table-column prop="query" label="分析需求" width="300" />
              <el-table-column prop="create_time" label="创建时间" width="180" />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button size="small" @click="viewAnalysisResult(scope.row.id)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 报告生成标签页 -->
        <el-tab-pane label="报告生成" name="report">
          <div class="report-section">
            <el-form :model="reportForm" label-width="80px" class="report-form">
              <el-form-item label="报告名称">
                <el-input v-model="reportForm.name" placeholder="请输入报告名称" />
              </el-form-item>

              <el-form-item label="分析结果">
                <el-select
                  v-model="reportForm.analysis_result_ids"
                  multiple
                  placeholder="请选择分析结果"
                  style="width: 100%"
                >
                  <el-option
                    v-for="result in analysisResults"
                    :key="result.id"
                    :label="result.name || `分析_${result.id}`"
                    :value="result.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="对话记录">
                <el-select
                  v-model="reportForm.chat_record_ids"
                  multiple
                  placeholder="请选择对话记录"
                  style="width: 100%"
                >
                  <!-- 实际项目中应该从API获取对话记录列表 -->
                  <el-option label="测试对话 1" value="1" />
                  <el-option label="测试对话 2" value="2" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="isGenerating" @click="createReport">
                  {{ isGenerating ? '生成中...' : '生成报告' }}
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 报告列表 -->
            <el-divider content-position="left">报告列表</el-divider>
            <el-table :data="reports" style="width: 100%">
              <el-table-column prop="name" label="名称" width="200" />
              <el-table-column prop="create_time" label="创建时间" width="180" />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button size="small" @click="viewReport(scope.row.id)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { dataAgentApi } from '@/api/dataAgent'
import { ChartComponent } from '@/components/chart'
import type {
  DataAnalysisRequest,
  DataAnalysisResponse,
  AnalysisResultResponse,
  ReportResponse,
  ReportCreateRequest,
  DataBasicStatsRequest,
  DataBasicStatsResponse,
  AnalysisTypeResponse,
  AnalysisRequirementRequest,
  DatasourceResponse,
  TableResponse,
} from '@/api/dataAgent'

// 激活的标签页
const activeTab = ref('basic-stats')

// 聊天消息
const chatMessages = ref<Array<{ role: 'user' | 'system'; content: string; timestamp: string }>>([])
const chatInput = ref('')

// 数据源表单
const dataSourceForm = reactive({
  datasource_id: '',
  table_name: '',
  data: '',
})

// 分析表单
const analysisForm = reactive({
  analysis_type: '',
  selected_columns: [] as string[],
})

// 报告生成表单
const reportForm = reactive<ReportCreateRequest>({
  name: '',
  analysis_result_ids: [],
  chat_record_ids: [],
})

// 分析结果
const analysisResult = ref<DataAnalysisResponse | null>(null)
const analysisResults = ref<AnalysisResultResponse[]>([])
// 报告列表
const reports = ref<ReportResponse[]>([])
// 数据基本统计结果
const basicStatsResult = ref<DataBasicStatsResponse | null>(null)
// 分析类型列表
const analysisTypes = ref<AnalysisTypeResponse[]>([])
// 可用列列表
const availableColumns = ref<Array<{ name: string; type: string }>>([])
// 数据源列表
const datasources = ref<DatasourceResponse[]>([])
// 表列表
const tables = ref<TableResponse[]>([])
// 加载状态
const isLoadingDatasources = ref(false)
const isLoadingTables = ref(false)

// 过滤后的可用列列表（根据分析类型的数据类型要求）
const filteredColumns = computed(() => {
  if (!currentAnalysisType.value) return availableColumns.value

  const requiredTypes = currentAnalysisType.value.column_types
  return availableColumns.value.filter((column) => {
    // 映射前端列类型到后端定义的类型
    const columnType = column.type.toLowerCase()
    if (requiredTypes.includes('numeric')) {
      return ['int', 'float', 'double', 'decimal', 'number'].some((type) =>
        columnType.includes(type)
      )
    }
    if (requiredTypes.includes('datetime')) {
      return ['date', 'time', 'datetime', 'timestamp'].some((type) => columnType.includes(type))
    }
    if (requiredTypes.includes('string')) {
      return ['string', 'varchar', 'text', 'char', 'category'].some((type) =>
        columnType.includes(type)
      )
    }
    return requiredTypes.includes(columnType)
  })
})
// 生成的分析需求
const generatedRequirement = ref('')

// 图表相关变量
const chartData = ref<any[]>([])
const selectedChartType = ref<'bar' | 'line' | 'scatter' | 'pie' | 'heatmap'>('bar')
const chartXField = ref<string>('x')
const chartYField = ref<string>('y')
const chartTitle = ref<string>('分析结果')

// 加载状态
const isAnalyzing = ref(false)
const isGenerating = ref(false)
const isLoadingBasicStats = ref(false)
const isLoadingAnalysisTypes = ref(false)
const isGeneratingRequirement = ref(false)

// 当前选择的分析类型
const currentAnalysisType = computed(() => {
  if (!analysisForm.analysis_type) return null
  return analysisTypes.value.find((type) => type.id === analysisForm.analysis_type) || null
})

// 发送消息
const sendMessage = () => {
  if (!chatInput.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: chatInput.value,
    timestamp: new Date().toLocaleString(),
  })

  // 保存到分析表单
  dataSourceForm.data = chatInput.value

  // 清空输入
  chatInput.value = ''
}

// 处理分析结果并转换为图表数据
const processAnalysisResult = (result: string) => {
  try {
    const data: any = JSON.parse(result)
    chartData.value = []

    // 检查是否有图表数据
    if (data.charts && Object.keys(data.charts).length > 0) {
      // 处理图表数据（前端会通过其他方式展示base64图片）
      console.log('图表数据已生成:', data.charts)
    }

    if (data.analysis_type === 'descriptive' && data.stats) {
      // 处理描述性统计数据
      for (const [column, stats] of Object.entries(data.stats)) {
        if (typeof stats === 'object' && stats !== null) {
          for (const [stat, value] of Object.entries(stats)) {
            if (typeof value === 'number') {
              chartData.value.push({
                x: `${column}_${stat}`,
                y: value,
              })
            }
          }
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '描述性统计结果'
    } else if (data.analysis_type === 'correlation' && data.correlation_matrix) {
      // 处理相关性矩阵数据
      const matrix = data.correlation_matrix
      for (const [col1, values] of Object.entries(matrix)) {
        if (typeof values === 'object' && values !== null) {
          for (const [col2, value] of Object.entries(values)) {
            if (typeof value === 'number' && col1 !== col2) {
              chartData.value.push({
                x: `${col1}-${col2}`,
                y: value,
              })
            }
          }
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '相关性分析结果'
    } else if (data.analysis_type === 'distribution' && data.distributions) {
      // 处理分布分析数据
      for (const [_, distribution] of Object.entries(data.distributions)) {
        if (
          typeof distribution === 'object' &&
          distribution !== null &&
          (distribution as any).value_counts
        ) {
          for (const [value, count] of Object.entries((distribution as any).value_counts)) {
            chartData.value.push({
              x: value,
              y: count,
            })
          }
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '分布分析结果'
    } else if (data.analysis_type === 'trend' && data.trends) {
      // 处理趋势分析数据
      for (const [column, trend] of Object.entries(data.trends)) {
        if (typeof trend === 'object' && trend !== null && (trend as any).values) {
          for (const item of (trend as any).values) {
            const timeField = (trend as any).time_column
            if (timeField && item[timeField] && item[column]) {
              chartData.value.push({
                x: item[timeField],
                y: item[column],
              })
            }
          }
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '趋势分析结果'
    } else if (data.analysis_type === 'prediction' && data.predictions) {
      // 处理预测分析数据
      if (data.predictions.predictions) {
        for (let i = 0; i < data.predictions.predictions.length; i++) {
          const [actual, predicted] = data.predictions.predictions[i]
          chartData.value.push({
            x: i,
            y: actual,
            predicted: predicted,
          })
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '预测分析结果'
    } else if (data.analysis_type === 'classification' && data.classification) {
      // 处理分类分析数据
      const report = data.classification.report
      if (report) {
        for (const [class_name, metrics] of Object.entries(report)) {
          if (typeof metrics === 'object' && metrics !== null && 'f1-score' in metrics) {
            chartData.value.push({
              x: class_name,
              y: metrics['f1-score'],
            })
          }
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '分类分析结果'
    } else if (data.analysis_type === 'anomaly' && data.anomalies) {
      // 处理异常检测数据
      for (const [column, anomaly] of Object.entries(data.anomalies)) {
        if (typeof anomaly === 'object' && anomaly !== null) {
          chartData.value.push({
            x: column,
            y: (anomaly as any).outlier_count,
          })
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '异常检测结果'
    } else if (data.analysis_type === 'time_series' && data.time_series) {
      // 处理时间序列分析数据
      for (const [column, series] of Object.entries(data.time_series)) {
        if (typeof series === 'object' && series !== null && (series as any).values) {
          for (const item of (series as any).values) {
            const timeField = Object.keys(item)[0]
            if (timeField && item[timeField] && item[column]) {
              chartData.value.push({
                x: item[timeField],
                y: item[column],
              })
            }
          }
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '时间序列分析结果'
    } else if (data.analysis_type === 'clustering' && data.clusters) {
      // 处理聚类分析数据
      const clusterCounts = data.clusters.cluster_counts
      if (clusterCounts) {
        for (const [cluster, count] of Object.entries(clusterCounts)) {
          chartData.value.push({
            x: `Cluster ${cluster}`,
            y: count,
          })
        }
      }
      chartXField.value = 'x'
      chartYField.value = 'y'
      chartTitle.value = '聚类分析结果'
    }
  } catch (error) {
    console.error('处理分析结果失败:', error)
    chartData.value = []
  }
}

// 执行数据分析
const analyzeData = async () => {
  if (!dataSourceForm.data) {
    ElMessage.warning('请输入分析需求')
    return
  }

  isAnalyzing.value = true
  try {
    const request: DataAnalysisRequest = {
      query: dataSourceForm.data,
      data: dataSourceForm.data,
      datasource_id: dataSourceForm.datasource_id
        ? Number(dataSourceForm.datasource_id)
        : undefined,
      table_name: dataSourceForm.table_name,
      analysis_type: analysisForm.analysis_type,
      selected_columns: analysisForm.selected_columns,
    }

    const response = await dataAgentApi.analyzeData(request)
    analysisResult.value = response

    if (response.success && response.result) {
      // 处理分析结果并转换为图表数据
      processAnalysisResult(response.result)

      // 添加系统回复
      chatMessages.value.push({
        role: 'system',
        content: response.report || '分析完成',
        timestamp: new Date().toLocaleString(),
      })

      // 刷新分析结果列表
      await loadAnalysisResults()
    } else {
      ElMessage.error(response.error || '分析失败')
    }
  } catch (error) {
    ElMessage.error('分析过程中出现错误')
    console.error('分析错误:', error)
  } finally {
    isAnalyzing.value = false
  }
}

// 创建报告
const createReport = async () => {
  if (!reportForm.name || (!reportForm.analysis_result_ids && !reportForm.chat_record_ids)) {
    ElMessage.warning('请输入报告名称并选择分析结果或对话记录')
    return
  }

  isGenerating.value = true
  try {
    await dataAgentApi.createReport(reportForm)
    ElMessage.success('报告生成成功')

    // 刷新报告列表
    await loadReports()
  } catch (error) {
    ElMessage.error('报告生成过程中出现错误')
    console.error('报告生成错误:', error)
  } finally {
    isGenerating.value = false
  }
}

// 查看分析结果
const viewAnalysisResult = async (analysisId: number) => {
  try {
    await dataAgentApi.getAnalysisResult(analysisId)
    // 这里可以显示详细的分析结果
    ElMessage.info('查看分析结果功能开发中')
  } catch (error) {
    ElMessage.error('获取分析结果失败')
    console.error('获取分析结果错误:', error)
  }
}

// 查看报告
const viewReport = async (reportId: number) => {
  try {
    await dataAgentApi.getReport(reportId)
    // 这里可以显示详细的报告
    ElMessage.info('查看报告功能开发中')
  } catch (error) {
    ElMessage.error('获取报告失败')
    console.error('获取报告错误:', error)
  }
}

// 加载分析结果列表
const loadAnalysisResults = async () => {
  try {
    const response = await dataAgentApi.getAnalysisResults()
    analysisResults.value = response.items
  } catch (error) {
    console.error('加载分析结果失败:', error)
  }
}

// 加载报告列表
const loadReports = async () => {
  try {
    const response = await dataAgentApi.getReports()
    reports.value = response
  } catch (error) {
    console.error('加载报告失败:', error)
  }
}

// 获取数据基本统计信息
const getBasicStats = async () => {
  if (!dataSourceForm.datasource_id || !dataSourceForm.table_name) {
    ElMessage.warning('请选择数据源和表名')
    return
  }

  isLoadingBasicStats.value = true
  try {
    const request: DataBasicStatsRequest = {
      datasource_id: Number(dataSourceForm.datasource_id),
      table_name: dataSourceForm.table_name,
    }

    const response = await dataAgentApi.getDataBasicStats(request)
    if (response.success) {
      basicStatsResult.value = response
      // 更新可用列列表
      availableColumns.value = response.columns_info.map((col) => ({
        name: col.name,
        type: col.type,
      }))
    } else {
      ElMessage.error(response.error || '获取数据统计失败')
    }
  } catch (error) {
    ElMessage.error('获取数据统计过程中出现错误')
    console.error('获取数据统计错误:', error)
  } finally {
    isLoadingBasicStats.value = false
  }
}

// 加载分析类型
const loadAnalysisTypes = async () => {
  isLoadingAnalysisTypes.value = true
  try {
    const response = await dataAgentApi.getAnalysisTypes()
    analysisTypes.value = response
  } catch (error) {
    console.error('加载分析类型失败:', error)
  } finally {
    isLoadingAnalysisTypes.value = false
  }
}

// 处理分析类型变化
const handleAnalysisTypeChange = () => {
  // 清空之前选择的列
  analysisForm.selected_columns = []
}

// 加载数据源列表
const loadDatasources = async () => {
  isLoadingDatasources.value = true
  try {
    const response = await dataAgentApi.getDatasources()
    datasources.value = response
  } catch (error) {
    console.error('加载数据源失败:', error)
    ElMessage.error('加载数据源失败')
  } finally {
    isLoadingDatasources.value = false
  }
}

// 加载表列表
const loadTables = async (datasourceId: number) => {
  if (!datasourceId) {
    tables.value = []
    return
  }

  isLoadingTables.value = true
  try {
    const response = await dataAgentApi.getTables(datasourceId)
    tables.value = response
  } catch (error) {
    console.error('加载表列表失败:', error)
    ElMessage.error('加载表列表失败')
  } finally {
    isLoadingTables.value = false
  }
}

// 处理数据源变化
const handleDatasourceChange = (datasourceId: string) => {
  // 清空表选择
  dataSourceForm.table_name = ''
  // 加载表列表
  if (datasourceId) {
    loadTables(Number(datasourceId))
  } else {
    tables.value = []
  }
}

// 生成分析需求
const generateRequirement = async () => {
  if (!analysisForm.analysis_type || analysisForm.selected_columns.length === 0) {
    ElMessage.warning('请选择分析类型和列')
    return
  }

  if (
    currentAnalysisType.value?.required_columns === 1 &&
    analysisForm.selected_columns.length !== 1
  ) {
    ElMessage.warning('该分析类型需要选择一列')
    return
  }

  if (
    currentAnalysisType.value?.required_columns === 2 &&
    analysisForm.selected_columns.length < 2
  ) {
    ElMessage.warning('该分析类型需要选择至少两列')
    return
  }

  isGeneratingRequirement.value = true
  try {
    const request: AnalysisRequirementRequest = {
      analysis_type: analysisForm.analysis_type,
      selected_columns: analysisForm.selected_columns,
      datasource_id: Number(dataSourceForm.datasource_id),
      table_name: dataSourceForm.table_name,
    }

    const response = await dataAgentApi.generateRequirement(request)
    if (response.success) {
      generatedRequirement.value = response.requirement
    } else {
      ElMessage.error(response.error || '生成分析需求失败')
    }
  } catch (error) {
    ElMessage.error('生成分析需求过程中出现错误')
    console.error('生成分析需求错误:', error)
  } finally {
    isGeneratingRequirement.value = false
  }
}

// 使用生成的分析需求
const useGeneratedRequirement = () => {
  if (generatedRequirement.value) {
    chatInput.value = generatedRequirement.value
    dataSourceForm.data = generatedRequirement.value
    activeTab.value = 'analysis'
  }
}

// 获取生成的图表数据
const getGeneratedCharts = () => {
  if (!analysisResult.value || !analysisResult.value.result) return {}

  try {
    const data = JSON.parse(analysisResult.value.result)
    if (data.charts && typeof data.charts === 'object') {
      return data.charts
    }
  } catch (error) {
    console.error('解析图表数据失败:', error)
  }
  return {}
}

// 页面加载时获取数据
onMounted(async () => {
  await loadDatasources()
  await loadAnalysisResults()
  await loadReports()
  await loadAnalysisTypes()
})
</script>

<style scoped>
.data-agent-container {
  padding: 20px;
}

.data-agent-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-agent-tabs {
  margin-top: 20px;
}

.analysis-section,
.results-section,
.report-section,
.basic-stats-section {
  padding: 20px;
}

.chat-window {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 30px;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  margin-left: auto;
}

.message.system {
  align-self: flex-start;
}

.message-content {
  padding: 10px;
  border-radius: 8px;
}

.message.user .message-content {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.message.system .message-content {
  background-color: #f0f2f5;
  border: 1px solid #d9d9d9;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
  color: #999;
}

.message-body {
  font-size: 14px;
  line-height: 1.5;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.chat-actions {
  margin-top: 10px;
  align-self: flex-end;
}

.data-source-form,
.report-form,
.analysis-form {
  margin-bottom: 30px;
}

.analysis-result,
.basic-stats-result {
  margin-top: 30px;
}

.result-card,
.report-card,
.stats-card,
.columns-card,
.quality-card,
.sample-card,
.analysis-suggestion-card {
  margin-top: 10px;
  white-space: pre-wrap;
  word-break: break-all;
}

pre {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.stats-info,
.quality-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.column-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.generated-requirement {
  margin-top: 20px;
}

.requirement-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.empty-sample {
  text-align: center;
  padding: 20px;
  color: #999;
}

.generated-charts-section {
  margin-top: 30px;
}

.generated-charts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-item-card {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  text-align: center;
}

.generated-chart {
  max-width: 100%;
  max-height: 300px;
  margin: 0 auto;
}

.chart-caption {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
</style>
