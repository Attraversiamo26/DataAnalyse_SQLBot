<template>
  <div class="sqlbot-table-container professional-container">
    <div class="tool-left">
      <span class="page-title">会话管理</span>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          style="width: 240px; margin-right: 12px"
          placeholder="搜索会话内容"
          clearable
          @keydown.enter.exact.prevent="handleSearch"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-select v-model="filterTool" placeholder="按工具类型筛选" style="width: 160px; margin-right: 12px">
          <el-option label="全部" value="" />
          <el-option label="智能问数" value="chat" />
          <el-option label="数据分析" value="analysis" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px; margin-right: 12px"
        />

        <el-button type="primary" @click="refreshSessions">
          <template #icon>
            <Refresh />
          </template>
          刷新
        </el-button>
        
        <el-button type="info" @click="countSessionsWithResults">
          统计有结果的会话
        </el-button>
      </div>
    </div>
    
    <div class="sqlbot-table_session">
      <el-table
        v-loading="loading"
        :data="filteredSessions"
        style="width: 100%"
        border
        :default-sort="{prop: 'create_time', order: 'descending'}"
        :header-cell-style="{background: '#f5f7fa'}"
        :cell-style="{padding: '8px 12px'}"
      >
        <el-table-column prop="id" label="会话ID" width="120" />
        <el-table-column prop="tool" label="工具类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.tool === 'chat' ? 'success' : 'primary'">
              {{ scope.row.tool === 'chat' ? '智能问数' : '数据分析' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="问题" min-width="300" show-overflow-tooltip />
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column prop="finish_time" label="结束时间" width="180" />
        <el-table-column prop="datasource_name" label="数据源" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
              {{ scope.row.status === 'completed' ? '已完成' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="返回结果" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="scope.row.result" class="result-content">
              {{ scope.row.result }}
            </div>
            <div v-else class="result-failed">
              失败
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="table-operate">
              <el-button type="primary" size="small" @click="viewSession(scope.row)">
                查看
              </el-button>
              <div class="line"></div>
              <el-button type="danger" size="small" @click="deleteSession(scope.row.id)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div v-if="state.tableData.length" class="pagination-container">
      <el-pagination
        v-model:current-page="state.pageInfo.currentPage"
        v-model:page-size="state.pageInfo.pageSize"
        :page-sizes="[10, 20, 30]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  
  <!-- 结果查看对话框 -->
  <el-dialog
    v-model="showResultDialog"
    :title="`查看会话结果 - ${selectedSession?.tool === 'chat' ? '智能问数' : '数据分析'}`"
    width="80%"
    destroy-on-close
  >
    <div v-if="selectedSession">
      <div class="dialog-section">
        <h3>会话信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会话ID">{{ selectedSession.id }}</el-descriptions-item>
          <el-descriptions-item label="工具类型">{{ selectedSession.tool === 'chat' ? '智能问数' : '数据分析' }}</el-descriptions-item>
          <el-descriptions-item label="问题">{{ selectedSession.question }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedSession.create_time }}</el-descriptions-item>
          <el-descriptions-item label="结束时间" :span="2">{{ selectedSession.finish_time || '未完成' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="dialog-section">
        <h3>结果内容</h3>
        
        <!-- 表格结果 -->
        <div v-if="selectedSession.resultType === 'table' && selectedSession.resultData && Array.isArray(selectedSession.resultData)">
          <el-table :data="selectedSession.resultData" style="width: 100%" border>
            <el-table-column 
              v-for="(_, key) in selectedSession.resultData[0]" 
              :key="key" 
              :prop="key" 
              :label="key"
            />
          </el-table>
        </div>
        
        <!-- 分析结果 -->
        <div v-else-if="selectedSession.resultType === 'analysis'">
          <div v-if="selectedSession.rawData" class="analysis-data">
            <!-- 相关性分析结果 -->
            <div v-if="selectedSession.rawData.correlation_matrix" class="correlation-result">
              <h4>相关性矩阵</h4>
              <el-table :data="selectedSession.rawData.correlation_matrix" border>
                <el-table-column prop="column" label="列名" width="120" />
                <el-table-column v-for="col in selectedSession.correlationColumns" :key="col" :prop="col" :label="col" />
              </el-table>
              <div v-if="selectedSession.rawData.charts && selectedSession.rawData.charts.correlation_matrix" class="chart-container">
                <img :src="selectedSession.rawData.charts.correlation_matrix" alt="相关性矩阵热力图" style="width: 100%;" />
              </div>
            </div>
            
            <!-- 描述性统计分析结果 -->
            <div v-if="selectedSession.rawData.stats" class="descriptive-result">
              <h4>描述性统计结果</h4>
              <div v-for="(stats, column) in selectedSession.rawData.stats" :key="column">
                <h5>{{ column }}</h5>
                <el-table :data="[stats]" border>
                  <el-table-column v-for="(_, key) in stats" :key="key" :prop="key" :label="key" />
                </el-table>
                <div v-if="selectedSession.rawData.charts && selectedSession.rawData.charts[column]" class="chart-container">
                  <img :src="selectedSession.rawData.charts[column]" :alt="`${column}统计图表`" style="width: 100%;" />
                </div>
              </div>
            </div>
            
            <!-- 聚类分析结果 -->
            <div v-if="selectedSession.rawData.clusters" class="clusters-result">
              <h4>聚类分析结果</h4>
              <div v-if="selectedSession.rawData.clusters.centers">
                <h5>聚类中心</h5>
                <el-table :data="selectedSession.rawData.clusters.centers" border>
                  <el-table-column v-for="key in Object.keys(selectedSession.rawData.clusters.centers[0] || {})" :key="key" :prop="key" :label="key" />
                </el-table>
              </div>
              <div v-if="selectedSession.rawData.clusters.counts">
                <h5>聚类计数</h5>
                <el-table :data="selectedSession.rawData.clusters.counts" border>
                  <el-table-column prop="cluster" label="簇" />
                  <el-table-column prop="count" label="数量" />
                  <el-table-column prop="percentage" label="占比" />
                </el-table>
              </div>
              <div v-if="selectedSession.rawData.charts && selectedSession.rawData.charts.cluster_plot">
                <img :src="selectedSession.rawData.charts.cluster_plot" alt="聚类分布图" style="width: 100%;" />
              </div>
            </div>
            
            <!-- 回归分析结果 -->
            <div v-if="selectedSession.rawData.regression" class="regression-result">
              <h4>回归分析结果</h4>
              <p>均方误差: {{ selectedSession.rawData.regression.mse }}</p>
              <p>R²分数: {{ selectedSession.rawData.regression.r2_score }}</p>
              <div v-if="selectedSession.rawData.regression.coefficients">
                <h5>回归系数</h5>
                <el-table :data="selectedSession.rawData.regression.coefficients" border>
                  <el-table-column prop="feature" label="特征" />
                  <el-table-column prop="coefficient" label="系数" />
                </el-table>
              </div>
              <div v-if="selectedSession.rawData.charts && selectedSession.rawData.charts.regression_plot">
                <img :src="selectedSession.rawData.charts.regression_plot" alt="回归拟合图" style="width: 100%;" />
              </div>
            </div>
            
            <!-- 异常检测结果 -->
            <div v-if="selectedSession.rawData.anomalies" class="anomaly-result">
              <h4>异常检测结果</h4>
              <div v-for="(anomaly, colName) in selectedSession.rawData.anomalies" :key="colName">
                <h5>{{ colName }}</h5>
                <p>异常值数量: {{ anomaly.outlier_count }}</p>
                <p>正常范围: {{ anomaly.lower_bound }} - {{ anomaly.upper_bound }}</p>
              </div>
              <div v-if="selectedSession.rawData.charts && selectedSession.rawData.charts.anomaly_plot">
                <img :src="selectedSession.rawData.charts.anomaly_plot" alt="异常检测图" style="width: 100%;" />
              </div>
            </div>
            
            <!-- 分布分析结果 -->
            <div v-if="selectedSession.rawData.distributions" class="distribution-result">
              <h4>分布分析结果</h4>
              <div v-for="(dist, column) in selectedSession.rawData.distributions" :key="column">
                <h5>{{ column }}</h5>
                <div v-if="dist.quantiles">
                  <h6>分位数</h6>
                  <el-table :data="[dist.quantiles]" border>
                    <el-table-column v-for="(_, key) in dist.quantiles" :key="key" :prop="key" :label="`${key}分位数`" />
                  </el-table>
                </div>
                <div v-if="selectedSession.rawData.charts && selectedSession.rawData.charts[column]">
                  <img :src="selectedSession.rawData.charts[column]" :alt="`${column}分布图`" style="width: 100%;" />
                </div>
              </div>
            </div>
            
            <!-- 趋势分析结果 -->
            <div v-if="selectedSession.rawData.trends" class="trend-result">
              <h4>趋势分析结果</h4>
              <div v-if="selectedSession.rawData.charts && selectedSession.rawData.charts.trend_plot">
                <img :src="selectedSession.rawData.charts.trend_plot" alt="趋势图" style="width: 100%;" />
              </div>
            </div>
            
            <!-- 时间序列分析结果 -->
            <div v-if="selectedSession.rawData.time_series" class="timeseries-result">
              <h4>时间序列分析结果</h4>
              <p>均值: {{ selectedSession.rawData.time_series.mean }}</p>
              <p>标准差: {{ selectedSession.rawData.time_series.std }}</p>
              <div v-if="selectedSession.rawData.charts && selectedSession.rawData.charts.time_series_plot">
                <img :src="selectedSession.rawData.charts.time_series_plot" alt="时间序列图" style="width: 100%;" />
              </div>
            </div>
          </div>
          
          <!-- 分析报告 -->
          <div v-if="selectedSession.resultData.content" class="analysis-content">
            <h4>分析报告</h4>
            <div class="markdown-content" v-html="renderMarkdown(selectedSession.resultData.content)"></div>
          </div>
        </div>
        
        <!-- 文本结果 -->
        <div v-else-if="selectedSession.resultData.content" class="text-content">
          <pre>{{ selectedSession.resultData.content }}</pre>
        </div>
        
        <!-- 空结果 -->
        <div v-else class="empty-content">
          <div class="no-result-text">没有结果数据</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { chatApi, ChatRecord } from '@/api/chat'
import { Refresh, Search } from '@element-plus/icons-vue'

const loading = ref(false)
const sessions = ref<Array<any>>([])
const total = ref(0)
const filterTool = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const searchKeyword = ref('')

const state = reactive<any>({
  tableData: [],
  pageInfo: {
    currentPage: 1,
    pageSize: 20,
    total: 0,
  },
})

const filteredSessions = computed(() => {
  let result = [...sessions.value]
  
  // 按工具类型筛选
  if (filterTool.value) {
    result = result.filter(session => session.tool === filterTool.value)
  }
  
  // 按日期范围筛选
  if (dateRange.value) {
    const startDate = dateRange.value[0].getTime()
    const endDate = dateRange.value[1].getTime()
    result = result.filter(session => {
      const createTime = new Date(session.create_time).getTime()
      return createTime >= startDate && createTime <= endDate
    })
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(session => 
      session.question.toLowerCase().includes(keyword) ||
      (session.result && session.result.toLowerCase().includes(keyword)) ||
      (session.datasource_name && session.datasource_name.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

const loadSessions = async () => {
  loading.value = true
  try {
    // 首先获取所有聊天会话
    const chatListResponse = await chatApi.list()
    console.log('Chat list response:', chatListResponse)
    
    // 为每个聊天会话获取完整的详细信息（包含records）
    const chatInfos: Array<any> = []
    for (const chat of chatListResponse) {
      if (chat.id) {
        try {
          const chatInfo = await chatApi.get(chat.id)
          console.log('Chat info:', chatInfo)
          chatInfos.push(chatInfo)
        } catch (error) {
          console.error(`获取会话 ${chat.id} 详情失败:`, error)
        }
      }
    }
    
    // 转换为表格需要的格式
    const records: Array<any> = []
    chatInfos.forEach(chatInfo => {
      chatInfo.records.forEach((record: ChatRecord) => {
        // 只显示非首次对话且已完成的记录（有结果数据的记录）
        if (!record.first_chat && record.finish_time) {
          // 获取返回结果
          let result = ''
          // 根据 chatInfo.chat_type 来区分会话类型
          const toolType = chatInfo.chat_type === 'analysis' ? 'analysis' : 'chat'
          
          if (toolType === 'analysis') {
            // 数据分析 - 同时显示分析报告和分析数据摘要
            const parts = []
            
            // 添加分析报告
            if (record.analysis) {
              try {
                const analysisObj = typeof record.analysis === 'string' ? JSON.parse(record.analysis) : record.analysis
                const reportContent = analysisObj.content || analysisObj.report || ''
                if (reportContent) {
                  parts.push(`报告: ${reportContent.substring(0, 150)}${reportContent.length > 150 ? '...' : ''}`)
                }
              } catch (e) {
                const analysisStr = typeof record.analysis === 'string' ? record.analysis : JSON.stringify(record.analysis)
                parts.push(`报告: ${analysisStr.substring(0, 150)}${analysisStr.length > 150 ? '...' : ''}`)
              }
            }
            
            // 添加分析数据摘要
            if (record.data) {
              try {
                const dataObj = typeof record.data === 'string' ? JSON.parse(record.data) : record.data
                // 提取关键信息作为摘要
                let dataSummary = ''
                if (dataObj.analysis_type) {
                  dataSummary += `分析类型: ${dataObj.analysis_type}`
                }
                if (dataObj.columns && Array.isArray(dataObj.columns)) {
                  dataSummary += `, 列: ${dataObj.columns.join(', ')}`
                }
                if (!dataSummary) {
                  // 如果没有结构化数据，显示数据长度
                  dataSummary = `数据长度: ${record.data.length} 字符`
                }
                parts.push(dataSummary)
              } catch (e) {
                parts.push(`数据长度: ${record.data.length} 字符`)
              }
            }
            
            result = parts.length > 0 ? parts.join(' | ') : '失败'
          } else {
            // 智能问数 - 只显示有数据的记录
            let hasData = false
            if (record.data) {
              // 后端修改后，record.data 是对象，表格数据在 record.data.data 中
              if (typeof record.data === 'object') {
                if (Array.isArray(record.data.data) && record.data.data.length > 0) {
                  hasData = true
                } else if (Array.isArray(record.data) && record.data.length > 0) {
                  // 兼容旧格式
                  hasData = true
                }
              }
            }
            if (hasData) {
              result = '查询成功'
            } else if (record.sql_answer) {
              result = record.sql_answer.substring(0, 100) + (record.sql_answer.length > 100 ? '...' : '')
            } else if (record.chart_answer) {
              result = record.chart_answer.substring(0, 100) + (record.chart_answer.length > 100 ? '...' : '')
            } else {
              return // 跳过没有结果的记录
            }
          }

          const sessionData = {
            id: record.id,
            chat_id: chatInfo.id,
            tool: toolType,
            question: record.question,
            result: result,
            create_time: record.create_time,
            finish_time: record.finish_time,
            datasource_name: chatInfo.datasource_name,
            status: 'completed'
          }
          console.log('Session data:', sessionData)
          records.push(sessionData)
        }
      })
    })
    
    sessions.value = records
    state.tableData = records
    total.value = records.length
    state.pageInfo.total = records.length
  } catch (error) {
    ElMessage.error('获取会话记录失败')
    console.error('Error loading sessions:', error)
  } finally {
    loading.value = false
  }
}

const refreshSessions = () => {
  state.pageInfo.currentPage = 1
  loadSessions()
}

const handleSearch = () => {
  state.pageInfo.currentPage = 1
  loadSessions()
}

// 查看会话结果
const selectedSession = ref<any>(null)
const showResultDialog = ref(false)

const viewSession = async (session: any) => {
  try {
    console.log('Viewing session:', session)
    // 加载会话的详细信息
    const chatInfo = await chatApi.get(session.chat_id)
    console.log('Chat info:', chatInfo)
    if (chatInfo) {
      // 找到对应的记录
      console.log('Looking for record with id:', session.id)
      console.log('Available records:', chatInfo.records.map((r: any) => r.id))
      const record = chatInfo.records.find((r: any) => r.id === session.id)
      console.log('Found record:', record)
      if (record) {
        // 准备结果数据
        let resultData = {}
        let resultType = 'text'
        
        if (record.analysis_record_id) {
          // 数据分析
          let charts: any = {}
          let rawData: any = {}
          let correlationColumns: any[] = []
          
          // 后端已解析并格式化数据，直接使用
          if (record.data && typeof record.data === 'object') {
            // 提取图表
            if (record.data.charts && typeof record.data.charts === 'object') {
              charts = record.data.charts
            }
            // 提取原始分析数据（用于展示表格）
            rawData = record.data
            // 提取相关性矩阵的列名
            if (record.data.correlation_matrix && Array.isArray(record.data.correlation_matrix) && record.data.correlation_matrix.length > 0) {
              correlationColumns = Object.keys(record.data.correlation_matrix[0])
            }
          }
          
          if (record.analysis) {
            // 分析报告已经被后端处理为内容字符串或JSON对象
            if (typeof record.analysis === 'string') {
              // 如果是字符串，尝试解析为JSON
              try {
                const analysisObj = JSON.parse(record.analysis)
                resultData = { content: analysisObj.content || analysisObj.report || '' }
              } catch (e) {
                // 如果不是JSON，直接作为内容
                resultData = { content: record.analysis }
              }
            } else if (typeof record.analysis === 'object' && record.analysis.content) {
              resultData = { content: record.analysis.content }
            } else {
              resultData = { content: record.analysis }
            }
            resultType = 'analysis'
          } else if (record.data) {
            resultData = { content: JSON.stringify(record.data, null, 2) }
            resultType = 'text'
          }
          
          selectedSession.value = {
            ...session,
            record: record,
            resultData: resultData,
            resultType: resultType,
            charts: charts,
            rawData: rawData,
            correlationColumns: correlationColumns
          }
          showResultDialog.value = true
          return
        } else {
          // 智能问数
          if (record.data) {
            try {
              // 后端已格式化数据，智能问数的数据在 record.data.data 中
              const dataObj = typeof record.data === 'string' ? JSON.parse(record.data) : record.data
              // 如果是对象且包含 data 数组，使用 data 数组作为表格数据
              if (dataObj && typeof dataObj === 'object' && Array.isArray(dataObj.data)) {
                resultData = dataObj.data
              } else if (Array.isArray(dataObj)) {
                // 兼容旧格式
                resultData = dataObj
              } else {
                resultData = { content: JSON.stringify(dataObj, null, 2) }
                resultType = 'text'
                showResultDialog.value = true
                return
              }
              resultType = 'table'
            } catch (e) {
              resultData = { content: record.data }
              resultType = 'text'
            }
          } else if (record.sql_answer) {
            resultData = { content: record.sql_answer }
            resultType = 'text'
          } else if (record.chart_answer) {
            resultData = { content: record.chart_answer }
            resultType = 'text'
          }
        }
        
        selectedSession.value = {
          ...session,
          record: record,
          resultData: resultData,
          resultType: resultType
        }
        showResultDialog.value = true
      } else {
        console.error('Record not found:', session.id)
        ElMessage.error('找不到对应的会话记录')
      }
    }
  } catch (error) {
    console.error('Failed to load session details:', error)
    ElMessage.error('加载会话详情失败')
  }
}

const deleteSession = (id: number) => {
  ElMessageBox.confirm('确定要删除这个会话记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里应该调用后端API删除会话记录
      // await chatApi.deleteRecord(id)
      sessions.value = sessions.value.filter(session => session.id !== id)
      state.tableData = sessions.value
      total.value = sessions.value.length
      state.pageInfo.total = sessions.value.length
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
      console.error('Error deleting session:', error)
    }
  })
}

const handleSizeChange = (size: number) => {
  state.pageInfo.pageSize = size
  state.pageInfo.currentPage = 1
  loadSessions()
}

const handleCurrentChange = (current: number) => {
  state.pageInfo.currentPage = current
  loadSessions()
}

// 统计有结果数据的会话
const countSessionsWithResults = () => {
  const sessionsWithResults = sessions.value.filter(session => session.result && session.result !== '失败')
  console.log(`有结果数据的会话数量: ${sessionsWithResults.length}`)
  console.log('会话ID列表:', sessionsWithResults.map(session => session.id))
  ElMessage.success(`有结果数据的会话数量: ${sessionsWithResults.length}\n会话ID: ${sessionsWithResults.map(session => session.id).join(', ')}`)
}

// 渲染Markdown
const renderMarkdown = (content: string) => {
  return content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>')
}

onMounted(() => {
  loadSessions()
})
</script>

<style lang="less" scoped>
.sqlbot-table-container {
  width: 100%;
  height: 100%;
  position: relative;
  
  .tool-left {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .page-title {
      font-weight: 500;
      font-size: 20px;
      line-height: 28px;
    }
    
    .search-bar {
      display: flex;
      align-items: center;
    }
  }
  
  .sqlbot-table_session {
    width: 100%;
    max-height: calc(100vh - 150px);
    overflow: auto;

    :deep(.ed-table) {
      --el-table-header-bg-color: #f5f7fa;
      --el-table-border-color: #ebeef5;
      --el-table-header-text-color: #606266;

      th {
        font-weight: 600;
        height: 48px;
      }

      td {
        height: 52px;
      }
    }
    
    .table-operate {
      display: flex;
      align-items: center;
      height: 24px;
      line-height: 24px;
      
      .line {
        margin: 0 10px 0 12px;
        height: 16px;
        width: 1px;
        background-color: #1f232926;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: end;
    align-items: center;
    margin-top: 16px;
  }
}
.result-content {
  color: #606266;
  line-height: 1.4;
}

.result-failed {
  color: #f56c6c;
  font-style: italic;
}

.dialog-section {
  margin-bottom: 24px;
  
  h3 {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 600;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
  }
}

.analysis-content,
.analysis-report {
  margin-top: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  
  h4 {
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
}

.analysis-data {
  margin-top: 16px;
}

.correlation-result,
.descriptive-result,
.clusters-result,
.regression-result,
.anomaly-result,
.distribution-result,
.trend-result,
.timeseries-result {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  
  h4 {
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
  
  h5 {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #606266;
  }
}

.chart-container {
  margin-top: 16px;
  margin-bottom: 8px;
}

.markdown-content {
  line-height: 1.6;
  
  h1 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  h3 {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  strong {
    font-weight: 600;
  }
  
  em {
    font-style: italic;
  }
}

.text-content {
  pre {
    background-color: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    line-height: 1.4;
  }
}

.analysis-charts {
  margin-bottom: 20px;
  
  h4 {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .charts-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .chart-item {
    flex: 1;
    min-width: 300px;
    max-width: 500px;
    background-color: #fafafa;
    border-radius: 8px;
    padding: 12px;
    
    h5 {
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #606266;
    }
    
    .chart-image {
      width: 100%;
      height: auto;
      border-radius: 4px;
      background-color: #fff;
    }
  }
}

.empty-content {
  text-align: center;
  padding: 40px 0;
  
  .no-result-text {
    font-size: 14px;
    color: #909399;
  }
}
</style>