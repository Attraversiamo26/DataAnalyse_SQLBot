<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { chatApi, ChatRecord } from '@/api/chat'
import { Refresh, Search, FileText, CheckSquare, Square } from '@element-plus/icons-vue'

const loading = ref(false)
const sessions = ref<Array<any>>([])
const filterTool = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const searchKeyword = ref('')
const selectedSessionIds = ref<Set<number>>(new Set())

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
  
  if (filterTool.value) {
    result = result.filter(session => session.tool === filterTool.value)
  }
  
  if (dateRange.value) {
    const startDate = dateRange.value[0].getTime()
    const endDate = dateRange.value[1].getTime()
    result = result.filter(session => {
      const createTime = new Date(session.create_time).getTime()
      return createTime >= startDate && createTime <= endDate
    })
  }
  
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

const selectAll = (val: boolean) => {
  if (val) {
    filteredSessions.value.forEach(session => {
      selectedSessionIds.value.add(session.id)
    })
  } else {
    selectedSessionIds.value.clear()
  }
}

const toggleSelect = (id: number) => {
  if (selectedSessionIds.value.has(id)) {
    selectedSessionIds.value.delete(id)
  } else {
    selectedSessionIds.value.add(id)
  }
}

const isSelected = (id: number) => selectedSessionIds.value.has(id)

// 会话去重函数：去除重复问题，如果重复问题则保留工具类型为数据分析的
const deduplicateSessions = (records: Array<any>): Array<any> => {
  const questionMap = new Map<string, any>()
  
  records.forEach(record => {
    const question = record.question.trim()
    
    if (questionMap.has(question)) {
      const existing = questionMap.get(question)
      if (record.tool === 'analysis' && existing.tool !== 'analysis') {
        questionMap.set(question, record)
      }
    } else {
      questionMap.set(question, record)
    }
  })
  
  const deduplicated = Array.from(questionMap.values())
  deduplicated.sort((a, b) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime())
  
  return deduplicated
}

const loadSessions = async () => {
  loading.value = true
  try {
    const chatListResponse = await chatApi.list()
    
    const chatInfos: Array<any> = []
    for (const chat of chatListResponse) {
      if (chat.id) {
        try {
          const chatInfo = await chatApi.get(chat.id)
          chatInfos.push(chatInfo)
        } catch (error) {
          console.error(`获取会话 ${chat.id} 详情失败:`, error)
        }
      }
    }
    
    const records: Array<any> = []
    chatInfos.forEach(chatInfo => {
      chatInfo.records.forEach((record: ChatRecord) => {
        if (!record.first_chat && record.finish_time) {
          let result = ''
          const toolType = chatInfo.chat_type === 'analysis' ? 'analysis' : 'chat'
          
          if (toolType === 'analysis') {
            const parts = []
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
            
            if (record.data) {
              try {
                const dataObj = typeof record.data === 'string' ? JSON.parse(record.data) : record.data
                let dataSummary = ''
                if (dataObj.analysis_type) {
                  dataSummary += `分析类型: ${dataObj.analysis_type}`
                }
                if (dataObj.columns && Array.isArray(dataObj.columns)) {
                  dataSummary += `, 列: ${dataObj.columns.join(', ')}`
                }
                if (!dataSummary) {
                  dataSummary = `数据长度: ${record.data.length} 字符`
                }
                parts.push(dataSummary)
              } catch (e) {
                parts.push(`数据长度: ${record.data.length} 字符`)
              }
            }
            
            result = parts.length > 0 ? parts.join(' | ') : '失败'
          } else {
            if (record.data && record.data.length > 0) {
              result = '查询成功'
            } else if (record.sql_answer) {
              result = record.sql_answer.substring(0, 100) + (record.sql_answer.length > 100 ? '...' : '')
            } else if (record.chart_answer) {
              result = record.chart_answer.substring(0, 100) + (record.chart_answer.length > 100 ? '...' : '')
            } else {
              return
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
          records.push(sessionData)
        }
      })
    })
    
    const deduplicatedRecords = deduplicateSessions(records)
    
    sessions.value = deduplicatedRecords
    state.tableData = deduplicatedRecords
    state.pageInfo.total = deduplicatedRecords.length
  } catch (error) {
    ElMessage.error('获取会话记录失败')
    console.error('Error loading sessions:', error)
  } finally {
    loading.value = false
  }
}

const refreshSessions = () => {
  state.pageInfo.currentPage = 1
  selectedSessionIds.value.clear()
  loadSessions()
}

const handleSearch = () => {
  state.pageInfo.currentPage = 1
  loadSessions()
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

const generateReport = async () => {
  const selectedIds = Array.from(selectedSessionIds.value)
  if (selectedIds.length === 0) {
    ElMessage.warning('请先选择要生成报告的会话')
    return
  }
  
  try {
    loading.value = true
    // 调用后端API生成报告
    const response = await fetch('/api/v1/report/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `分析报告_${new Date().toISOString().split('T')[0]}`,
        chat_record_ids: selectedIds
      })
    })
    
    const result = await response.json()
    if (result.success) {
      ElMessage.success('报告生成成功')
      // 可以跳转到报告详情页面或下载报告
      console.log('报告生成结果:', result)
    } else {
      ElMessage.error(result.error || '报告生成失败')
    }
  } catch (error) {
    ElMessage.error('报告生成失败')
    console.error('Error generating report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSessions()
})
</script>

<template>
  <div class="report-tool-container">
    <div class="report-header">
      <div class="header-left">
        <h2 class="page-title">报告生成</h2>
        <p class="page-subtitle">选择会话记录生成专业分析报告</p>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :disabled="selectedSessionIds.size === 0"
          @click="generateReport"
        >
          <template #icon>
            <FileText />
          </template>
          生成报告 ({{ selectedSessionIds.size }})
        </el-button>
      </div>
    </div>
    
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
    </div>
    
    <div class="session-table">
      <el-table
        v-loading="loading"
        :data="filteredSessions"
        style="width: 100%"
        border
        :default-sort="{prop: 'create_time', order: 'descending'}"
        :header-cell-style="{background: '#f5f7fa'}"
      >
        <el-table-column type="selection" width="55">
          <template #default="scope">
            <el-checkbox 
              :checked="isSelected(scope.row.id)" 
              @change="toggleSelect(scope.row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="id" label="会话ID" width="100" />
        <el-table-column prop="tool" label="工具类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.tool === 'chat' ? 'success' : 'primary'">
              {{ scope.row.tool === 'chat' ? '智能问数' : '数据分析' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="问题" min-width="300" show-overflow-tooltip />
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column prop="datasource_name" label="数据源" width="150" />
        <el-table-column prop="result" label="结果摘要" min-width="200" show-overflow-tooltip />
      </el-table>
    </div>
    
    <div v-if="state.tableData.length" class="pagination-container">
      <el-pagination
        v-model:current-page="state.pageInfo.currentPage"
        v-model:page-size="state.pageInfo.pageSize"
        :page-sizes="[10, 20, 30]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="state.pageInfo.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.report-tool-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  .header-left {
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 8px 0;
    }
    
    .page-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  }
  
  .header-right {
    .el-button {
      padding: 10px 24px;
      font-size: 14px;
    }
  }
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.session-table {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  :deep(.el-table) {
    --el-table-header-bg-color: #f5f7fa;
    --el-table-border-color: #ebeef5;
  }
}

.pagination-container {
  display: flex;
  justify-content: end;
  align-items: center;
  margin-top: 16px;
}
</style>