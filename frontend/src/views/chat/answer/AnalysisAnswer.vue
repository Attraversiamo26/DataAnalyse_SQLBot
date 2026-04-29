<script setup lang="ts">
import BaseAnswer from './BaseAnswer.vue'
import { chatApi, ChatInfo, type ChatMessage, ChatRecord } from '@/api/chat.ts'
import { computed, nextTick, onBeforeUnmount, ref, withDefaults, defineProps, defineEmits } from 'vue'
import MdComponent from '@/views/chat/component/MdComponent.vue'
import { ElTag, ElStatistic, ElTable, ElTableColumn, ElCard, ElCollapse, ElCollapseItem } from 'element-plus'

const props = withDefaults(
  defineProps<{
    chatList?: Array<ChatInfo>
    currentChatId?: number
    currentChat?: ChatInfo
    message?: ChatMessage
    loading?: boolean
  }>(),
  {
    chatList: () => [],
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    message: undefined,
    loading: false,
  }
)

const emits = defineEmits([
  'finish',
  'error',
  'stop',
  'update:loading',
  'update:chatList',
  'update:currentChat',
  'update:currentChatId',
])

const index = computed(() => {
  if (props.message?.index) {
    return props.message.index
  }
  if (props.message?.index === 0) {
    return 0
  }
  return -1
})

const _currentChatId = computed({
  get() {
    return props.currentChatId
  },
  set(v) {
    emits('update:currentChatId', v)
  },
})

const _currentChat = computed({
  get() {
    return props.currentChat
  },
  set(v) {
    emits('update:currentChat', v)
  },
})

const _chatList = computed({
  get() {
    return props.chatList
  },
  set(v) {
    emits('update:chatList', v)
  },
})

const _loading = computed({
  get() {
    return props.loading
  },
  set(v) {
    emits('update:loading', v)
  },
})

const stopFlag = ref(false)

const parsedAnalysisResult = computed(() => {
  const analysisResult = props.message?.record?.data || props.message?.record?.analysis
  if (!analysisResult) return {}
  try {
    return typeof analysisResult === 'string' 
      ? JSON.parse(analysisResult) 
      : analysisResult
  } catch (error) {
    console.error('解析分析结果失败:', error)
    return {}
  }
})

const analysisType = computed(() => parsedAnalysisResult.value.analysis_type || '')

const isDescriptiveAnalysis = computed(() => analysisType.value === 'descriptive')
const isCorrelationAnalysis = computed(() => analysisType.value === 'correlation')
const isDistributionAnalysis = computed(() => analysisType.value === 'distribution')
const isAnomalyAnalysis = computed(() => analysisType.value === 'anomaly')
const isTrendAnalysis = computed(() => analysisType.value === 'trend')
const isTimeSeriesAnalysis = computed(() => analysisType.value === 'time_series')
const isPredictionAnalysis = computed(() => analysisType.value === 'prediction')
const isClusteringAnalysis = computed(() => analysisType.value === 'clustering')
const isRegressionAnalysis = computed(() => analysisType.value === 'regression')
const isClassificationAnalysis = computed(() => analysisType.value === 'classification')

const analysisTypeLabel = computed(() => {
  const typeLabels: Record<string, string> = {
    'descriptive': '描述性统计分析',
    'correlation': '相关性分析',
    'distribution': '分布分析',
    'anomaly': '异常检测分析',
    'trend': '趋势分析',
    'time_series': '时间序列分析',
    'prediction': '预测分析',
    'clustering': '聚类分析',
    'regression': '回归分析',
    'classification': '分类分析'
  }
  return typeLabels[analysisType.value] || analysisType.value
})

const correlationColumns = computed(() => {
  if (!parsedAnalysisResult.value.columns) return []
  return parsedAnalysisResult.value.columns
})

const correlationMatrixData = computed(() => {
  if (!parsedAnalysisResult.value.correlation_matrix) return []
  const matrix = parsedAnalysisResult.value.correlation_matrix as Record<string, Record<string, number>>
  return Object.entries(matrix).map(([column, values]) => ({
    column,
    ...values
  }))
})

const formatStatKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'mean': '均值',
    'std': '标准差',
    'min': '最小值',
    'max': '最大值',
    'median': '中位数',
    'count': '计数',
    'unique': '唯一值',
    'top': '众数',
    'freq': '众数频率',
    'skew': '偏度',
    'kurt': '峰度',
    'sum': '总和',
    '25%': '25%分位数',
    '50%': '中位数',
    '75%': '75%分位数',
    'variance': '方差'
  }
  return keyMap[key] || key
}

const getCorrelationClass = (value: number): string => {
  if (value > 0.7) return 'correlation-high-positive'
  if (value > 0.3) return 'correlation-moderate-positive'
  if (value > -0.3) return 'correlation-weak'
  if (value > -0.7) return 'correlation-moderate-negative'
  return 'correlation-high-negative'
}

const sendMessage = async () => {
  stopFlag.value = false
  _loading.value = true

  if (index.value < 0) {
    _loading.value = false
    return
  }

  const currentRecord: ChatRecord = _currentChat.value.records[index.value]

  let error: boolean = false
  if (_currentChatId.value === undefined || currentRecord.analysis_record_id === undefined) {
    error = true
  }
  if (error) {
    _loading.value = false
    emits('error', currentRecord.id || null)
    return
  }

  try {
    const controller: AbortController = new AbortController()
    const response = await chatApi.analysis(currentRecord.analysis_record_id, controller)
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let analysis_answer = ''
    let analysis_answer_thinking = ''

    let tempResult = ''

    while (true) {
      if (stopFlag.value) {
        controller.abort()
        _loading.value = false
        break
      }

      const { done, value } = await reader.read()
      if (done) {
        _loading.value = false
        break
      }

      let chunk = decoder.decode(value, { stream: true })
      tempResult += chunk
      const split = tempResult.match(/data:.*}\n\n/g)
      if (split) {
        chunk = split.join('')
        tempResult = tempResult.replace(chunk, '')
      } else {
        continue
      }
      if (chunk && chunk.startsWith('data:{')) {
        if (split) {
          for (const str of split) {
            let data
            try {
              data = JSON.parse(str.replace('data:{', '{'))
            } catch (err) {
              console.error('JSON string:', str)
              throw err
            }

            if (data.code && data.code !== 200) {
              ElMessage({
                message: data.msg,
                type: 'error',
                showClose: true,
              })
              _loading.value = false
              return
            }

            switch (data.type) {
              case 'id':
                currentRecord.id = data.id
                _currentChat.value.records[index.value].id = data.id
                break
              case 'info':
                console.info(data.msg)
                break
              case 'error':
                currentRecord.error = data.content
                emits('error', currentRecord.id || null)
                break
              case 'analysis-result':
                analysis_answer += data.content
                analysis_answer_thinking += data.reasoning_content
                _currentChat.value.records[index.value].analysis = analysis_answer
                _currentChat.value.records[index.value].analysis_thinking = analysis_answer_thinking
                break
              case 'analysis_finish':
                emits('finish', currentRecord.id)
                break
            }
            await nextTick()
          }
        }
      }
    }
  } catch (error) {
    if (!currentRecord.error) {
      currentRecord.error = ''
    }
    if (currentRecord.error.trim().length !== 0) {
      currentRecord.error = currentRecord.error + '\n'
    }
    currentRecord.error = currentRecord.error + 'Error:' + error
    console.error('Error:', error)
    emits('error', currentRecord.id || null)
  } finally {
    _loading.value = false
  }
}

function stop() {
  stopFlag.value = true
  _loading.value = false
  emits('stop')
}

onBeforeUnmount(() => {
  stop()
})

defineExpose({ sendMessage, index: () => index.value, chatList: () => _chatList.value, stop })
</script>

<template>
  <BaseAnswer
    v-if="message"
    :message="message"
    :reasoning-name="['analysis_thinking']"
    :loading="_loading"
  >
    <div v-if="parsedAnalysisResult && (parsedAnalysisResult.analysis_type || parsedAnalysisResult.charts || parsedAnalysisResult.stats || parsedAnalysisResult.anomalies || parsedAnalysisResult.correlation_matrix || parsedAnalysisResult.distributions || parsedAnalysisResult.predictions || parsedAnalysisResult.clusters || parsedAnalysisResult.regression || parsedAnalysisResult.classification || parsedAnalysisResult.time_series || parsedAnalysisResult.trends)" class="analysis-result-container" style="margin-top: 12px;">
      <div v-if="parsedAnalysisResult.analysis_type || parsedAnalysisResult.columns" class="analysis-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #eee;">
        <div v-if="parsedAnalysisResult.analysis_type" style="margin-bottom: 8px;">
          <strong style="font-size: 16px;">分析类型:</strong> {{ analysisTypeLabel || parsedAnalysisResult.analysis_type }}
        </div>
        <div v-if="parsedAnalysisResult.columns && parsedAnalysisResult.columns.length > 0">
          <strong>分析列:</strong> {{ parsedAnalysisResult.columns.join(', ') }}
        </div>
      </div>

      <!-- 描述性统计分析结果 -->
      <div v-if="isDescriptiveAnalysis && parsedAnalysisResult.stats" class="descriptive-result">
        <h3 style="margin-bottom: 12px;">描述性统计结果</h3>
        <div v-for="(stats, column) in parsedAnalysisResult.stats" :key="column" class="column-stats" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 8px;">{{ column }}</h4>
          <ElCard style="margin-bottom: 8px;">
            <ElTable :data="[stats]" style="width: 100%; font-size: 14px;">
              <ElTableColumn 
                v-for="(_, key) in stats" 
                :key="String(key)" 
                :prop="String(key)" 
                :label="formatStatKey(String(key))" 
                style="padding: 4px 8px;"
              />
            </ElTable>
          </ElCard>
          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container" style="margin-top: 8px;">
            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}统计图表`" style="width: 100%; max-height: 400px; object-fit: contain;" />
          </div>
        </div>
      </div>

      <!-- 相关性分析结果 -->
      <div v-else-if="isCorrelationAnalysis" class="correlation-result">
        <h3 style="margin-bottom: 12px;">相关性矩阵</h3>
        <ElCard style="margin-bottom: 12px;">
          <ElTable :data="correlationMatrixData" style="width: 100%; font-size: 14px;">
            <ElTableColumn prop="column" label="列名" width="120" />
            <ElTableColumn 
              v-for="col in correlationColumns" 
              :key="col" 
              :prop="col" 
              :label="col"
            >
              <template #default="scope">
                <span :class="getCorrelationClass(scope.row[col])" style="display: inline-block; padding: 4px 8px; border-radius: 4px;">
                  {{ scope.row[col]?.toFixed(4) || 'N/A' }}
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
        <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.correlation_matrix" class="chart-container">
          <img :src="parsedAnalysisResult.charts.correlation_matrix" alt="相关性矩阵热力图" style="width: 100%; max-height: 500px; object-fit: contain;" />
        </div>
      </div>

      <!-- 分布分析结果 -->
      <div v-else-if="isDistributionAnalysis && parsedAnalysisResult.distributions" class="distribution-result">
        <h3 style="margin-bottom: 12px;">分布分析结果</h3>
        <div v-for="(dist, column) in parsedAnalysisResult.distributions" :key="column" class="column-distribution" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 8px;">{{ column }}</h4>
          <ElCard style="margin-bottom: 8px;">
            <ElCollapse>
              <ElCollapseItem title="分位数">
                <ElTable :data="[dist.quantiles]" style="width: 100%; font-size: 14px;">
                  <ElTableColumn 
                    v-for="(_, key) in dist.quantiles" 
                    :key="String(key)" 
                    :prop="String(key)" 
                    :label="`${String(key)}分位数`" 
                  />
                </ElTable>
              </ElCollapseItem>
              <ElCollapseItem title="值分布">
                <ElTable 
                  :data="Object.entries(dist.value_counts).map(([value, count]) => ({ value, count }))" 
                  style="width: 100%; font-size: 14px;"
                >
                  <ElTableColumn prop="value" label="值" />
                  <ElTableColumn prop="count" label="计数" />
                </ElTable>
              </ElCollapseItem>
            </ElCollapse>
          </ElCard>
          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container" style="margin-top: 8px;">
            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}分布图`" style="width: 100%; max-height: 400px; object-fit: contain;" />
          </div>
        </div>
      </div>

      <!-- 异常检测分析结果 -->
      <div v-else-if="isAnomalyAnalysis && parsedAnalysisResult.anomalies" class="anomaly-result">
        <h3 style="margin-bottom: 12px;">异常检测结果</h3>
        <div v-for="(anomaly, column) in parsedAnalysisResult.anomalies" :key="column" class="column-anomaly" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 8px;">{{ column }}</h4>
          <ElCard class="anomaly-info-card" style="margin-bottom: 8px;">
            <div class="anomaly-stats" style="display: flex; justify-content: space-around; margin-bottom: 12px;">
              <ElStatistic title="下限值" :value="anomaly.lower_bound" :precision="2" />
              <ElStatistic title="上限值" :value="anomaly.upper_bound" :precision="2" />
              <ElStatistic title="异常值数量" :value="anomaly.outlier_count" />
            </div>
            <div class="anomaly-values">
              <h5 style="margin-bottom: 8px;">异常值列表：</h5>
              <div class="outlier-tags" style="display: flex; flex-wrap: wrap; gap: 4px;">
                <ElTag 
                  v-for="(val, idx) in anomaly.outliers.slice(0, 20)" 
                  :key="idx" 
                  type="danger" 
                  size="small"
                >
                  {{ val }}
                </ElTag>
                <ElTag v-if="anomaly.outliers.length > 20" type="info" size="small">
                  还有 {{ anomaly.outliers.length - 20 }} 个异常值
                </ElTag>
              </div>
            </div>
          </ElCard>
          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container" style="margin-top: 8px;">
            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}箱线图`" style="width: 100%; max-height: 400px; object-fit: contain;" />
          </div>
        </div>
      </div>

      <!-- 趋势分析结果 -->
      <div v-else-if="isTrendAnalysis && parsedAnalysisResult.trends" class="trend-result">
        <h3 style="margin-bottom: 12px;">趋势分析结果</h3>
        <div v-for="(_, column) in parsedAnalysisResult.trends" :key="column" class="column-trend" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 8px;">{{ column }}</h4>
          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container">
            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}趋势图`" style="width: 100%; max-height: 400px; object-fit: contain;" />
          </div>
        </div>
      </div>

      <!-- 时间序列分析结果 -->
      <div v-else-if="isTimeSeriesAnalysis && parsedAnalysisResult.time_series" class="time-series-result">
        <h3 style="margin-bottom: 12px;">时间序列分析结果</h3>
        <div v-for="(ts, column) in parsedAnalysisResult.time_series" :key="column" class="column-time-series" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 8px;">{{ column }}</h4>
          <ElCard style="margin-bottom: 8px;">
            <div class="ts-stats" style="display: flex; justify-content: space-around;">
              <ElStatistic title="均值" :value="ts.mean" :precision="2" />
              <ElStatistic title="标准差" :value="ts.std" :precision="2" />
            </div>
          </ElCard>
          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container" style="margin-top: 8px;">
            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}时间序列图`" style="width: 100%; max-height: 400px; object-fit: contain;" />
          </div>
        </div>
      </div>

      <!-- 预测分析结果 -->
      <div v-else-if="isPredictionAnalysis && parsedAnalysisResult.predictions" class="prediction-result">
        <h3 style="margin-bottom: 12px;">预测分析结果</h3>
        <ElCard style="margin-bottom: 12px;">
          <div v-if="parsedAnalysisResult.predictions.model" class="model-info">
            <ElTable :data="[{
              model: parsedAnalysisResult.predictions.model,
              target_column: parsedAnalysisResult.predictions.target_column,
              feature_columns: parsedAnalysisResult.predictions.feature_columns?.join(', ') || '-',
              mse: parsedAnalysisResult.predictions.mse?.toFixed(4) || '-',
              r2: parsedAnalysisResult.predictions.r2?.toFixed(4) || '-'
            }]" style="width: 100%; font-size: 14px;">
              <ElTableColumn prop="model" label="模型" />
              <ElTableColumn prop="target_column" label="目标列" />
              <ElTableColumn prop="feature_columns" label="特征列" />
              <ElTableColumn prop="mse" label="均方误差" />
              <ElTableColumn prop="r2" label="R²分数" />
            </ElTable>
          </div>
          <div v-else-if="parsedAnalysisResult.predictions.error" class="error-message" style="color: #f56c6c;">
            {{ parsedAnalysisResult.predictions.error }}
          </div>
        </ElCard>
        <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.prediction" class="chart-container">
          <img :src="parsedAnalysisResult.charts.prediction" alt="预测图表" style="width: 100%; max-height: 400px; object-fit: contain;" />
        </div>
      </div>

      <!-- 聚类分析结果 -->
      <div v-else-if="isClusteringAnalysis && parsedAnalysisResult.clusters" class="clustering-result">
        <h3 style="margin-bottom: 12px;">聚类分析结果</h3>
        <ElCard style="margin-bottom: 12px;">
          <div v-if="parsedAnalysisResult.clusters.model" class="model-info">
            <ElTable :data="[{
              model: parsedAnalysisResult.clusters.model,
              n_clusters: parsedAnalysisResult.clusters.n_clusters,
              cluster_columns: parsedAnalysisResult.clusters.cluster_columns?.join(', ') || '-',
              cluster_centers: JSON.stringify(parsedAnalysisResult.clusters.cluster_centers, null, 2),
              cluster_counts: JSON.stringify(parsedAnalysisResult.clusters.cluster_counts, null, 2)
            }]" style="width: 100%; font-size: 14px;">
              <ElTableColumn prop="model" label="模型" />
              <ElTableColumn prop="n_clusters" label="聚类数量" />
              <ElTableColumn prop="cluster_columns" label="聚类列" />
              <ElTableColumn prop="cluster_centers" label="聚类中心">
                <template #default="scope">
                  <pre style="margin: 0; font-size: 12px; max-height: 100px; overflow-y: auto;">{{ scope.row.cluster_centers }}</pre>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="cluster_counts" label="聚类计数">
                <template #default="scope">
                  <pre style="margin: 0; font-size: 12px;">{{ scope.row.cluster_counts }}</pre>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
          <div v-else-if="parsedAnalysisResult.clusters.error" class="error-message" style="color: #f56c6c;">
            {{ parsedAnalysisResult.clusters.error }}
          </div>
        </ElCard>
        <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.clustering" class="chart-container">
          <img :src="parsedAnalysisResult.charts.clustering" alt="聚类图表" style="width: 100%; max-height: 400px; object-fit: contain;" />
        </div>
      </div>

      <!-- 回归分析结果 -->
      <div v-else-if="isRegressionAnalysis && parsedAnalysisResult.regression" class="regression-result">
        <h3 style="margin-bottom: 12px;">回归分析结果</h3>
        <ElCard style="margin-bottom: 12px;">
          <div v-if="parsedAnalysisResult.regression.model" class="model-info">
            <ElTable :data="[{
              model: parsedAnalysisResult.regression.model,
              target_column: parsedAnalysisResult.regression.target_column,
              feature_columns: parsedAnalysisResult.regression.feature_columns?.join(', ') || '-',
              mse: parsedAnalysisResult.regression.mse?.toFixed(4) || '-',
              r2: parsedAnalysisResult.regression.r2?.toFixed(4) || '-'
            }]" style="width: 100%; font-size: 14px;">
              <ElTableColumn prop="model" label="模型" />
              <ElTableColumn prop="target_column" label="目标列" />
              <ElTableColumn prop="feature_columns" label="特征列" />
              <ElTableColumn prop="mse" label="均方误差" />
              <ElTableColumn prop="r2" label="R²分数" />
            </ElTable>
          </div>
          <div v-else-if="parsedAnalysisResult.regression.error" class="error-message" style="color: #f56c6c;">
            {{ parsedAnalysisResult.regression.error }}
          </div>
        </ElCard>
        <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.regression" class="chart-container">
          <img :src="parsedAnalysisResult.charts.regression" alt="回归图表" style="width: 100%; max-height: 400px; object-fit: contain;" />
        </div>
      </div>

      <!-- 分类分析结果 -->
      <div v-else-if="isClassificationAnalysis && parsedAnalysisResult.classification" class="classification-result">
        <h3 style="margin-bottom: 12px;">分类分析结果</h3>
        <ElCard style="margin-bottom: 12px;">
          <div v-if="parsedAnalysisResult.classification.model" class="model-info">
            <ElTable :data="[{
              model: parsedAnalysisResult.classification.model,
              target_column: parsedAnalysisResult.classification.target_column,
              feature_columns: parsedAnalysisResult.classification.feature_columns?.join(', ') || '-',
              accuracy: parsedAnalysisResult.classification.accuracy?.toFixed(4) || '-',
              precision: parsedAnalysisResult.classification.precision?.toFixed(4) || '-',
              recall: parsedAnalysisResult.classification.recall?.toFixed(4) || '-',
              f1_score: parsedAnalysisResult.classification.f1_score?.toFixed(4) || '-'
            }]" style="width: 100%; font-size: 14px;">
              <ElTableColumn prop="model" label="模型" />
              <ElTableColumn prop="target_column" label="目标列" />
              <ElTableColumn prop="feature_columns" label="特征列" />
              <ElTableColumn prop="accuracy" label="准确率" />
              <ElTableColumn prop="precision" label="精确率" />
              <ElTableColumn prop="recall" label="召回率" />
              <ElTableColumn prop="f1_score" label="F1分数" />
            </ElTable>
          </div>
          <div v-else-if="parsedAnalysisResult.classification.error" class="error-message" style="color: #f56c6c;">
            {{ parsedAnalysisResult.classification.error }}
          </div>
        </ElCard>
        <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.classification" class="chart-container">
          <img :src="parsedAnalysisResult.charts.classification" alt="分类图表" style="width: 100%; max-height: 400px; object-fit: contain;" />
        </div>
      </div>

      <!-- 默认显示：当没有匹配到特定分析类型时，自动展示所有可用的数据和图表 -->
      <div v-else-if="parsedAnalysisResult && Object.keys(parsedAnalysisResult).length > 0" class="generic-analysis-result">
        <h3 style="margin-bottom: 12px;">分析结果</h3>
        
        <div v-if="parsedAnalysisResult.stats" class="stats-section">
          <h4 style="margin-bottom: 8px;">统计信息</h4>
          <ElCard style="margin-bottom: 12px;">
            <div v-for="(stats, column) in parsedAnalysisResult.stats" :key="column" class="column-stats" style="margin-bottom: 8px;">
              <h5>{{ column }}</h5>
              <ElTable :data="[stats]" style="width: 100%; font-size: 14px;">
                <ElTableColumn 
                  v-for="(_, key) in stats" 
                  :key="String(key)" 
                  :prop="String(key)" 
                  :label="formatStatKey(String(key))" 
                />
              </ElTable>
            </div>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.anomalies" class="anomalies-section">
          <h4 style="margin-bottom: 8px;">异常检测结果</h4>
          <ElCard style="margin-bottom: 12px;">
            <div v-for="(anomaly, column) in parsedAnalysisResult.anomalies" :key="column" class="column-anomaly" style="margin-bottom: 8px;">
              <h5>{{ column }}</h5>
              <div style="display: flex; justify-content: space-around; margin-bottom: 8px;">
                <ElStatistic title="下限值" :value="anomaly.lower_bound" :precision="2" />
                <ElStatistic title="上限值" :value="anomaly.upper_bound" :precision="2" />
                <ElStatistic title="异常值数量" :value="anomaly.outlier_count" />
              </div>
            </div>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.correlation_matrix" class="correlation-section">
          <h4 style="margin-bottom: 8px;">相关性矩阵</h4>
          <ElCard style="margin-bottom: 12px;">
            <ElTable :data="correlationMatrixData" style="width: 100%; font-size: 14px;">
              <ElTableColumn prop="column" label="列名" width="120" />
              <ElTableColumn 
                v-for="col in correlationColumns" 
                :key="col" 
                :prop="col" 
                :label="col"
              >
                <template #default="scope">
                  <span :class="getCorrelationClass(scope.row[col])" style="display: inline-block; padding: 4px 8px; border-radius: 4px;">
                    {{ scope.row[col]?.toFixed(4) || 'N/A' }}
                  </span>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.distributions" class="distributions-section">
          <h4 style="margin-bottom: 8px;">分布分析结果</h4>
          <ElCard style="margin-bottom: 12px;">
            <ElCollapse>
              <ElCollapseItem v-for="(dist, column) in parsedAnalysisResult.distributions" :key="String(column)" :title="String(column)">
                <ElTable :data="[dist.quantiles]" style="width: 100%; font-size: 14px;">
                  <ElTableColumn 
                    v-for="(_, key) in dist.quantiles" 
                    :key="String(key)" 
                    :prop="String(key)" 
                    :label="`${String(key)}分位数`" 
                  />
                </ElTable>
              </ElCollapseItem>
            </ElCollapse>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.predictions" class="predictions-section">
          <h4 style="margin-bottom: 8px;">预测结果</h4>
          <ElCard style="margin-bottom: 12px;">
            <pre style="margin: 0; font-size: 14px;">{{ JSON.stringify(parsedAnalysisResult.predictions, null, 2) }}</pre>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.clusters" class="clusters-section">
          <h4 style="margin-bottom: 8px;">聚类结果</h4>
          <ElCard style="margin-bottom: 12px;">
            <pre style="margin: 0; font-size: 14px;">{{ JSON.stringify(parsedAnalysisResult.clusters, null, 2) }}</pre>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.regression" class="regression-section">
          <h4 style="margin-bottom: 8px;">回归分析结果</h4>
          <ElCard style="margin-bottom: 12px;">
            <pre style="margin: 0; font-size: 14px;">{{ JSON.stringify(parsedAnalysisResult.regression, null, 2) }}</pre>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.classification" class="classification-section">
          <h4 style="margin-bottom: 8px;">分类分析结果</h4>
          <ElCard style="margin-bottom: 12px;">
            <pre style="margin: 0; font-size: 14px;">{{ JSON.stringify(parsedAnalysisResult.classification, null, 2) }}</pre>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.time_series" class="time-series-section">
          <h4 style="margin-bottom: 8px;">时间序列分析结果</h4>
          <ElCard style="margin-bottom: 12px;">
            <pre style="margin: 0; font-size: 14px;">{{ JSON.stringify(parsedAnalysisResult.time_series, null, 2) }}</pre>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.trends" class="trends-section">
          <h4 style="margin-bottom: 8px;">趋势分析结果</h4>
          <ElCard style="margin-bottom: 12px;">
            <pre style="margin: 0; font-size: 14px;">{{ JSON.stringify(parsedAnalysisResult.trends, null, 2) }}</pre>
          </ElCard>
        </div>

        <div v-if="parsedAnalysisResult.charts && Object.keys(parsedAnalysisResult.charts).length > 0" class="charts-section">
          <h4 style="margin-bottom: 8px;">图表</h4>
          <div v-for="(chart, key) in parsedAnalysisResult.charts" :key="String(key)" class="chart-container" style="margin-bottom: 16px;">
            <h5 style="margin-bottom: 8px;">{{ String(key) }}</h5>
            <img :src="chart" :alt="String(key)" style="width: 100%; max-height: 400px; object-fit: contain;" />
          </div>
        </div>

        <div v-if="!parsedAnalysisResult.stats && !parsedAnalysisResult.anomalies && !parsedAnalysisResult.correlation_matrix && 
                    !parsedAnalysisResult.distributions && !parsedAnalysisResult.predictions && !parsedAnalysisResult.clusters && 
                    !parsedAnalysisResult.regression && !parsedAnalysisResult.classification && !parsedAnalysisResult.time_series && 
                    !parsedAnalysisResult.trends && !parsedAnalysisResult.charts" class="fallback-section">
          <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 14px;">{{ JSON.stringify(parsedAnalysisResult, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div v-if="message.record?.analysis" class="analysis-report" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
      <h3 style="margin-bottom: 12px;">分析报告</h3>
      <MdComponent :message="message.record.analysis" />
    </div>

    <slot></slot>
    <template #tool>
      <slot name="tool"></slot>
    </template>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </BaseAnswer>
</template>

<style scoped lang="less">
.correlation-high-positive {
  background-color: #fef08a;
  color: #854d0e;
}
.correlation-moderate-positive {
  background-color: #bbf7d0;
  color: #166534;
}
.correlation-weak {
  background-color: #f1f5f9;
  color: #64748b;
}
.correlation-moderate-negative {
  background-color: #bfdbfe;
  color: #1e40af;
}
.correlation-high-negative {
  background-color: #fecaca;
  color: #991b1b;
}
</style>
