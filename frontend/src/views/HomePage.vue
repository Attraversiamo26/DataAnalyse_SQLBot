<template>
  <div class="home-container">
    <div class="welcome-section">
      <h3 style="color: rgb(0, 102, 51);">你好，我是邮政数据分析小助手</h3>
      <p>请直接输入您的问题，我会根据您的意图自动选择合适的处理方式</p>
    </div>

    <div class="feature-cards">
      <div class="feature-card" @click="navigateTo('/tools/chat')">
        <div class="card-icon chat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style="width: 48px; height: 48px; color: #006633;">
            <path fill="currentColor" d="m174.72 855.68 135.296-45.12 23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160 128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512 64 299.904 256 96 512 96s448 203.904 448 416-192 416-448 416a461.06 461.06 0 0 1-206.912-48.384l-175.616 58.56z"></path>
            <path fill="currentColor" d="M352 576h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32m32-192h256q32 0 32 32t-32 32H384q-32 0-32-32t32-32"></path>
          </svg>
        </div>
        <h4>智能问数</h4>
        <p>利用自然语言查询数据，快速获取所需信息</p>
      </div>

      <div class="feature-card" @click="navigateTo('/tools/analysis')">
        <div class="card-icon analysis-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style="width: 48px; height: 48px; color: #006633;">
            <path fill="currentColor" d="m665.216 768 110.848 192h-73.856L591.36 768H433.024L322.176 960H248.32l110.848-192H160a32 32 0 0 1-32-32V192H64a32 32 0 0 1 0-64h896a32 32 0 1 1 0 64h-64v544a32 32 0 0 1-32 32zM832 192H192v512h640zM352 448a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0v-64a32 32 0 0 1 32-32m160-64a32 32 0 0 1 32 32v128a32 32 0 0 1-64 0V416a32 32 0 0 1 32-32m160-64a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V352a32 32 0 0 1 32-32"></path>
          </svg>
        </div>
        <h4>数据分析</h4>
        <p>深度分析数据特征，发现数据中的价值</p>
      </div>

      <div class="feature-card" @click="navigateTo('/tools/report')">
        <div class="card-icon report-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style="width: 48px; height: 48px; color: #006633;">
            <path fill="currentColor" d="M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z"></path>
          </svg>
        </div>
        <h4>报告生成</h4>
        <p>自动生成分析报告，提供数据洞察</p>
      </div>
    </div>

    <div class="chat-section">
      <div class="chat-history" ref="chatContainer">
        <template v-if="currentChatInfo">
          <div v-for="(msg, index) in computedMessages" :key="index" class="chat-message-wrapper">
            <div v-if="msg.role === 'user'" class="chat-message user-message">
              <div class="message-header">
                <span class="message-role">我</span>
                <span class="message-time">{{ formatTime(msg.create_time) }}</span>
              </div>
              <div class="message-content">
                <div class="user-content">{{ msg.content }}</div>
              </div>
            </div>
            
            <div v-else class="chat-message system-message">
              <div class="message-header">
                <span class="message-role">系统</span>
                <span class="message-time">{{ formatTime(msg.create_time) }}</span>
              </div>
              <div class="message-content">
                <ChartAnswer
        :ref="el => { if (currentChatInfo && msg.index === currentChatInfo.records.length - 1) chartAnswerRef = el }"
        v-if="msg.record && !msg.record.analysis_record_id && !msg.record.predict_record_id"
        :chat-list="[]"
        :current-chat-id="currentChatId"
        :current-chat="currentChatInfo"
        :message="msg"
        :loading="msg.isTyping"
        :reasoning-name="['sql_answer', 'chart_answer']"
        @finish="onChartAnswerFinish"
        @error="onChartAnswerError"
        @stop="onChatStop"
        @scroll-bottom="scrollToBottom"
      />
                <AnalysisAnswer
        :ref="el => { if (currentChatInfo && msg.index === currentChatInfo.records.length - 1) analysisAnswerRef = el }"
        v-if="msg.record && msg.record.analysis_record_id"
        :chat-list="[]"
        :current-chat-id="currentChatId"
        :current-chat="currentChatInfo"
        :message="msg"
        :loading="msg.isTyping"
        @finish="onAnalysisAnswerFinish"
        @error="onAnalysisAnswerError"
        @stop="onChatStop"
      />
              </div>
            </div>
          </div>
        </template>
        
        <div v-if="!currentChatInfo || computedMessages.length === 0" class="empty-state">
          <p>请选择数据源或上传文件，然后开始提问</p>
        </div>
      </div>

      <div class="chat-input-section">
        <div class="datasource-section">
          <div class="datasource-select">
            <span class="label">选择数据源:</span>
            <el-select 
              v-model="selectedDataSource" 
              placeholder="请选择数据源" 
              style="width: 300px;"
              @change="handleDataSourceChange"
              clearable
            >
              <el-option 
                v-for="source in datasources" 
                :key="source.id + ':' + source.type" 
                :label="source.name" 
                :value="source.id + ':' + source.type"
              />
            </el-select>
          </div>
          
          <div class="table-select" v-if="tables.length > 0">
            <span class="label">选择数据表:</span>
            <el-select 
              v-model="currentTableName" 
              placeholder="请选择数据表" 
              style="width: 300px;"
              @change="handleTableChange"
            >
              <el-option 
                v-for="table in tables" 
                :key="table.tableName" 
                :label="table.tableName" 
                :value="table.tableName"
              />
            </el-select>
          </div>

          <div class="file-upload">
            <span class="label">或上传文件:</span>
            <el-upload
              class="file-upload"
              drag
              :auto-upload="true"
              :on-change="handleFileChange"
              :show-file-list="false"
              :limit="1"
              accept=".xlsx,.xls,.csv"
            >
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                <span class="drag-text">
                  将文件拖到此处，或<em>点击上传</em>
                </span>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 xlsx, xls, csv 格式
                </div>
              </template>
            </el-upload>
            <div v-if="uploadedFile" class="file-info">
              <Document class="file-icon" />
              <span class="file-name">{{ uploadedFile.name }}</span>
              <el-button size="small" type="danger" text @click="clearUploadedFile">移除</el-button>
            </div>
          </div>
          
          <div v-if="currentChatId && currentChatInfo" class="session-info">
            <el-tag type="success">会话 ID: {{ currentChatId }}</el-tag>
            <el-button v-if="currentChatId" text type="primary" @click="clearSession">新建会话</el-button>
          </div>
        </div>

        <div class="input-wrapper">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="2"
            placeholder="请输入您的问题..."
            :disabled="!currentChatId || isTyping"
            @keydown.enter.exact.prevent="handleKeyEnter"
          />
          <el-button 
            type="primary" 
            :disabled="!currentChatId || !userInput.trim() || isTyping"
            @click="startAnalysis"
            style="margin-top: 10px; background-color: #006633; border-color: #006633;"
            :loading="isTyping"
          >
            {{ isTyping ? '分析中...' : '开始分析' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { datasourceApi } from '@/api/datasource.ts'
import { chatApi, ChatInfo, ChatRecord } from '@/api/chat.ts'
import type { ChatMessage as ApiChatMessage } from '@/api/chat.ts'
import ChartAnswer from '@/views/chat/answer/ChartAnswer.vue'
import AnalysisAnswer from '@/views/chat/answer/AnalysisAnswer.vue'

const router = useRouter()

const datasources = ref<Array<{ id: number; name: string; type: string }>>([])
const selectedDataSource = ref<string>('')
const uploadedFile = ref<any>(null)
const currentTableName = ref<string>('')
const tables = ref<Array<{ tableName: string; tableComment: string }>>([])

const currentChatId = ref<number>()
const currentChatInfo = ref<ChatInfo | null>(null)
const chatContainer = ref<HTMLElement | null>(null)
const userInput = ref<string>('')
const isTyping = ref<boolean>(false)
const loading = ref<boolean>(false)
let chartAnswerRef: any = null
let analysisAnswerRef: any = null

const computedMessages = computed<Array<ApiChatMessage>>(() => {
  const messages: Array<ApiChatMessage> = []
  if (!currentChatInfo.value) {
    return messages
  }
  for (let i = 0; i < currentChatInfo.value.records.length; i++) {
    const record = currentChatInfo.value.records[i]
    if (record.question !== undefined && !record.first_chat) {
      messages.push({
        role: 'user',
        create_time: record.create_time,
        record: record,
        content: record.question,
        index: i,
      })
    }
    messages.push({
      role: 'assistant',
      create_time: record.create_time,
      record: record,
      isTyping: i === currentChatInfo.value.records.length - 1 && isTyping.value,
      first_chat: record.first_chat,
      recommended_question: record.recommended_question,
      index: i,
    })
  }
  return messages
})

const navigateTo = (path: string) => {
  router.push(path)
}

const formatTime = (time: Date | string | undefined) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString()
}

const loadDataSources = async () => {
  try {
    const data = await datasourceApi.list()
    datasources.value = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: 'database'
    }))
  } catch (error) {
    console.error('加载数据源失败:', error)
  }
}

const handleTableChange = (value: any) => {
  console.log('用户选择的表名:', value)
  currentTableName.value = value
}

const handleDataSourceChange = async () => {
  if (!selectedDataSource.value) {
    return
  }
  
  try {
    const [id] = selectedDataSource.value.split(':')
    const dataSourceId = parseInt(id)
    
    // 获取数据源的表名
    try {
      const tablesResult = await datasourceApi.getTables(dataSourceId)
      console.log('获取表名结果:', tablesResult)
      if (tablesResult?.length > 0) {
        tables.value = tablesResult
        currentTableName.value = tablesResult[0].tableName
        console.log('设置表名:', currentTableName.value)
      } else {
        console.error('未获取到表名:', tablesResult)
        tables.value = []
        currentTableName.value = ''
      }
    } catch (error) {
      console.error('获取表名失败:', error)
      tables.value = []
      currentTableName.value = ''
    }
    
    const chatInfo = await chatApi.startChat({ datasource: dataSourceId })
    currentChatId.value = chatInfo.id
    currentChatInfo.value = chatInfo
    
    ElMessage.success('数据源选择成功，已创建临时会话')
  } catch (error) {
    console.error('处理数据源选择失败:', error)
    ElMessage.error('数据源选择失败')
  }
}

const handleFileChange = async (file: any) => {
  if (!file.raw) return
  
  try {
    uploadedFile.value = file
    
    const formData = new FormData()
    formData.append('file', file.raw)
    
    const axios = (await import('axios')).default
    const response = await axios.post(
      import.meta.env.VITE_API_BASE_URL + '/datasource/parseExcel',
      formData,
      {
        headers: {}
      }
    )
    
    const parseResult = response.data?.code === 0 ? response.data.data : response.data
    const sheetData = parseResult.data || []
    
    if (!sheetData.length) {
      throw new Error('文件解析失败，没有数据')
    }
    
    const firstSheet = sheetData[0]
    
    const importResult = await datasourceApi.importToDb({
      filePath: parseResult.filePath,
      sheets: [{
        sheetName: firstSheet.sheetName,
        fields: firstSheet.fields
      }]
    })
    
    if (!importResult?.sheets?.length) {
      throw new Error('数据导入失败')
    }
    
    const importedSheet = importResult.sheets[0]
    // 设置表名
    currentTableName.value = importedSheet.tableName
    
    const dsResult = await datasourceApi.add({
      name: `上传文件_${file.name}_${Date.now()}`,
      type: 'excel',
      configuration: {
        sheets: [{
          tableName: importedSheet.tableName
        }]
      }
    })
    
    if (!dsResult?.id) {
      throw new Error('数据源创建失败')
    }
    
    const chatInfo = await chatApi.startChat({ 
      datasource: dsResult.id
    })
    currentChatId.value = chatInfo.id
    currentChatInfo.value = chatInfo
    
    await loadDataSources()
    
    if (dsResult.id) {
      selectedDataSource.value = `${dsResult.id}:database`
    }
    
    ElMessage.success('文件上传成功，已创建临时会话')
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error((error as any).message || '文件上传失败')
  }
}

const clearUploadedFile = () => {
  uploadedFile.value = null
}

const clearSession = () => {
  currentChatId.value = undefined
  currentChatInfo.value = null
  selectedDataSource.value = ''
  currentTableName.value = ''
  clearUploadedFile()
}

const handleKeyEnter = () => {
  if (userInput.value.trim()) {
    startAnalysis()
  }
}

const startAnalysis = async () => {
  if (!userInput.value.trim() || !currentChatId.value) {
    return
  }
  
  if (!currentChatInfo.value) {
    ElMessage.error('请先选择数据源或上传文件')
    return
  }
  
  try {
    loading.value = true
    isTyping.value = true
    
    // 创建新记录，不再使用临时id
    const newRecord = new ChatRecord()
    newRecord.chat_id = currentChatId.value
    newRecord.question = userInput.value
    newRecord.sql_answer = ''
    newRecord.sql = ''
    newRecord.chart_answer = ''
    newRecord.chart = ''
    newRecord.create_time = new Date()
    
    currentChatInfo.value.records.push(newRecord)
    
    const userQuestion = userInput.value
    userInput.value = ''
    
    await nextTick()
    scrollToBottom()
    
    // 调用后端意图识别接口
    console.log('开始调用意图识别接口...')
    
    try {
      // 从selectedDataSource中获取数据源ID
      const [id] = selectedDataSource.value.split(':')
      const dataSourceId = parseInt(id)
      
      console.log('请求数据:', {
        question: userQuestion,
        datasource_id: dataSourceId,
        table_name: currentTableName.value,
        chat_id: currentChatId.value
      })
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL + '/home/chat'
      console.log('API调用路径:', apiUrl)
      console.log('传递的参数:', {
        question: userQuestion,
        datasource_id: dataSourceId,
        table_name: currentTableName.value,
        chat_id: currentChatId.value
      })
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userQuestion,
          datasource_id: dataSourceId,
          table_name: currentTableName.value,
          chat_id: currentChatId.value
        })
      })
      
      console.log('响应状态:', response.status)
      console.log('响应头:', response.headers)
      
      const responseText = await response.text()
      console.log('响应文本:', responseText)
      
      if (!responseText) {
        throw new Error('空响应')
      }
      
      const result = JSON.parse(responseText)
      console.log('解析后的结果:', result)
      
      // 处理后端返回的包装结构
      const actualResult = result.data || result
      console.log('实际结果:', actualResult)
      
      if (actualResult.success) {
        console.log('意图识别成功，工具类型:', actualResult.tool)
        
        // 更新chat_id（如果后端返回了新的）
        if (actualResult.result && actualResult.result.chat_id) {
          currentChatId.value = actualResult.result.chat_id
          console.log('更新Chat ID:', currentChatId.value)
        }
        
        if (actualResult.tool === 'analysis') {
          // 调用数据分析功能
          ElMessage.success('数据分析已完成！')
          console.log('开始处理数据分析任务...')
          
          const lastIndex = currentChatInfo.value?.records.length - 1
          // 设置分析结果
          if (lastIndex !== undefined && lastIndex >= 0 && actualResult.result) {
            currentChatInfo.value.records[lastIndex].analysis_record_id = actualResult.result.analysis_record_id
            currentChatInfo.value.records[lastIndex].analysis = actualResult.result.report
            currentChatInfo.value.records[lastIndex].data = actualResult.result.result
            console.log('设置分析结果:', actualResult.result)
          }
          
          isTyping.value = false
        } else {
          // 调用智能问数功能
          console.log('开始处理智能问数任务...')
          
          // 设置record_id
          const lastIndex = currentChatInfo.value?.records.length - 1
          if (lastIndex !== undefined && lastIndex >= 0 && actualResult.result) {
            currentChatInfo.value.records[lastIndex].id = actualResult.result.record_id
            console.log('设置记录ID:', actualResult.result.record_id)
          }
          
          nextTick(async () => {
            console.log('最后一条记录索引:', lastIndex)
            console.log('chartAnswerRef:', chartAnswerRef)
            if (chartAnswerRef && typeof chartAnswerRef.sendMessage === 'function') {
              console.log('调用ChartAnswer组件的sendMessage方法...')
              await chartAnswerRef.sendMessage()
            } else {
              console.log('ChartAnswer组件还没有完全渲染，或者没有sendMessage方法')
              // 尝试使用setTimeout延迟一下
              setTimeout(async () => {
                if (chartAnswerRef && typeof chartAnswerRef.sendMessage === 'function') {
                  console.log('延迟后调用ChartAnswer组件的sendMessage方法...')
                  await chartAnswerRef.sendMessage()
                } else {
                  console.log('仍然无法调用sendMessage方法')
                  isTyping.value = false
                  ElMessage.error('智能问数组件初始化失败')
                }
              }, 1000)
            }
          })
        }
      } else {
        throw new Error(result.error || '意图识别失败')
      }
    } catch (fetchError) {
      console.error('意图识别接口调用失败:', fetchError)
      throw fetchError
    }
    
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败: ' + (error as any).message)
    isTyping.value = false
  } finally {
    loading.value = false
  }
}

const onChartAnswerFinish = (recordId: number) => {
  console.log('分析完成:', recordId)
  isTyping.value = false
  
  getRecordUsage(recordId)
  
  nextTick(() => {
    scrollToBottom()
  })
}

const onChartAnswerError = (recordId: number) => {
  console.log('分析错误:', recordId)
  isTyping.value = false
  getRecordUsage(recordId)
}

const onAnalysisAnswerFinish = (recordId: number) => {
  console.log('数据分析完成:', recordId)
  isTyping.value = false
  getRecordUsage(recordId)
  
  nextTick(() => {
    scrollToBottom()
  })
}

const onAnalysisAnswerError = (recordId: number | null) => {
  console.log('数据分析错误:', recordId)
  isTyping.value = false
  if (recordId) {
    getRecordUsage(recordId)
  }
}

const onChatStop = () => {
  console.log('聊天停止')
  isTyping.value = false
  loading.value = false
}

const getRecordUsage = (recordId: number | null) => {
  if (!recordId) {
    console.log('recordId为undefined或null，跳过获取使用情况')
    return
  }
  
  // 检查recordId是否是临时ID（临时ID通常是通过Date.now()生成的，比较大）
  // 真实的后端ID通常是较小的整数
  if (recordId > 1000000000000) {
    console.log('recordId是临时ID，跳过获取使用情况')
    return
  }
  
  chatApi.get_chart_usage(recordId).then((res) => {
    const logHistory = chatApi.toChatLogHistory(res)
    if (logHistory && currentChatInfo.value) {
      const record = currentChatInfo.value.records.find(r => r.id === recordId)
      if (record) {
        record.duration = logHistory.duration
        record.finish_time = logHistory.finish_time
        record.total_tokens = logHistory.total_tokens
      }
    }
  }).catch((e) => {
    console.error('获取记录使用情况失败:', e)
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

onMounted(async () => {
  await loadDataSources()
})
</script>

<style lang="scss" scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  
  h3 {
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 16px;
  }
}

.feature-cards {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
}

.feature-card {
  flex: 1;
  max-width: 300px;
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  }
  
  .card-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,102,51,0.08);
  }
  
  h4 {
    text-align: center;
    color: #006633;
    margin-bottom: 10px;
  }
  
  p {
    text-align: center;
    color: #666;
    font-size: 14px;
  }
}

.chat-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.chat-history {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.chat-message-wrapper {
  margin-bottom: 20px;
}

.chat-message {
  padding: 16px 20px;
  border-radius: 8px;
  max-width: 80%;
  
  &.user-message {
    background: #e6f7ee;
    margin-left: auto;
    border-top-right-radius: 0;
  }
  
  &.system-message {
    background: white;
    border: 1px solid #e8e8e8;
    border-top-left-radius: 0;
    width: 100%;
    max-width: 100%;
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 13px;
    color: #666;
    
    .message-role {
      font-weight: 600;
    }
    
    .message-time {
      margin-left: 12px;
    }
  }
  
  .message-content {
    font-size: 14px;
    line-height: 1.5;
    
    .user-content {
      color: #333;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.chat-input-section {
  margin-top: 20px;
}

.datasource-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.datasource-select,
.file-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .label {
    font-weight: 500;
    color: #333;
  }
}

.file-upload {
  .file-upload {
    flex: 1;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 4px;
    
    .file-icon {
      color: #006633;
    }
    
    .file-name {
      color: #333;
    }
  }
}

.drag-text {
  em {
    color: #006633;
    font-style: normal;
  }
}

.session-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
