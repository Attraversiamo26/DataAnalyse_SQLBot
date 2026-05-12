<template>
  <div class="skill-manager-container">
    <!-- 顶部欢迎区域 -->
    <div class="skill-header">
      <h3 class="welcome-title">你好，我是邮政专业技能小管家</h3>
      <p class="welcome-desc">请通过对话或智能体技能卡片选择方式执行专业技能</p>
    </div>

    <!-- 主内容区域 -->
    <div class="skill-main-content">
      <!-- 左侧：技能卡片列表 -->
      <div class="skill-cards-section">
        <div class="section-header">
          <span class="section-title">可用技能</span>
          <div class="header-actions">
            <el-select
              v-model="selectedDomain"
              placeholder="选择领域"
              class="domain-select"
            >
              <el-option
                v-for="domain in domains"
                :key="domain.id"
                :label="domain.name"
                :value="domain.id"
              />
            </el-select>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索技能..."
              class="search-input"
              @input="handleSearch"
            >
              <template #prepend>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        
        <!-- 技能卡片网格 -->
        <div class="skills-grid">
          <el-card
            v-for="skill in filteredSkills"
            :key="skill.skill_id"
            class="skill-card-item"
            :class="{ 'is-selected': selectedSkill?.skill_id === skill.skill_id }"
            @click="selectSkill(skill)"
          >
            <div class="skill-card-header">
              <div class="skill-icon-wrapper" :class="skill.layer">
                <el-icon :size="32"><List /></el-icon>
              </div>
              <div class="skill-info">
                <h3 class="skill-name">{{ skill.name }}</h3>
                <el-tag :type="getLayerTagType(skill.layer)" size="small">
                  {{ getLayerLabel(skill.layer) }}
                </el-tag>
              </div>
            </div>
            <p class="skill-desc">{{ skill.description }}</p>
            <div class="skill-meta">
              <span class="meta-item">
                <el-icon><Setting /></el-icon>
                {{ skill.input_params.length }} 参数
              </span>
            </div>
            <div class="skill-tags">
              <span
                v-for="(pattern, index) in skill.trigger_patterns.slice(0, 2)"
                :key="index"
                class="trigger-tag"
              >
                {{ pattern }}
              </span>
            </div>
            <el-button
              type="primary"
              size="small"
              class="execute-btn"
              @click.stop="openParamsDialog(skill)"
            >
              <el-icon><Refresh /></el-icon>
              执行
            </el-button>
          </el-card>
        </div>
      </div>

      <!-- 右侧：对话式交互区 -->
      <div class="skill-chat-section">
        <!-- 对话历史 -->
        <div class="chat-history" ref="chatHistoryRef">
          <div class="chat-welcome">
            <div class="welcome-icon">
              <el-icon :size="64"><List /></el-icon>
            </div>
            <h3>欢迎使用技能管理</h3>
            <p>您可以通过以下方式执行技能：</p>
            <ul class="welcome-tips">
              <li>在下方输入框中描述您的分析需求</li>
              <li>从左侧选择一个技能卡片</li>
              <li>点击技能卡片上的"执行"按钮</li>
            </ul>
            <div class="quick-examples">
              <span class="examples-label">试试这些：</span>
              <el-tag
                v-for="(example, index) in quickExamples"
                :key="index"
                class="quick-tag"
                @click="sendMessage(example)"
              >
                {{ example }}
              </el-tag>
            </div>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['chat-message', message.type]"
          >
            <div class="message-avatar">
              <el-icon v-if="message.type === 'user'" :size="32"><User /></el-icon>
              <div v-else class="bot-avatar">
                <el-icon :size="24"><Cpu /></el-icon>
              </div>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="sender-name">{{ message.type === 'user' ? '您' : '智能助手' }}</span>
                <span class="message-time">{{ message.time }}</span>
              </div>
              <p class="message-text">{{ message.content }}</p>
              
              <!-- 技能匹配结果 -->
              <div v-if="message.type === 'bot' && message.matches" class="skill-matches">
                <p class="matches-title">匹配到以下技能：</p>
                <div class="matches-list">
                  <div
                    v-for="(match, idx) in message.matches"
                    :key="idx"
                    class="match-item"
                  >
                    <div class="match-info">
                      <span class="match-name">{{ getSkillName(match.skill_id) }}</span>
                      <span class="match-confidence">置信度: {{ (match.confidence * 100).toFixed(0) }}%</span>
                    </div>
                    <div class="match-actions">
                      <el-button size="mini" @click="selectSkillById(match.skill_id)">查看</el-button>
                      <el-button size="mini" @click="executeSkillById(match.skill_id)">执行</el-button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 执行结果 -->
              <div v-if="message.type === 'bot' && message.result" class="execution-result" :class="message.result.success ? 'success' : 'error'">
                <div class="result-header">
                  <span class="result-icon">{{ message.result.success ? '✓' : '✗' }}</span>
                  <span>{{ message.result.success ? '执行成功' : '执行失败' }}</span>
                </div>
                <p class="result-time">耗时: {{ message.result.execution_time?.toFixed(2) || '-' }} 秒</p>
                <div v-if="message.result.error_message" class="result-error">
                  {{ message.result.error_message }}
                </div>
                <div v-if="message.result.output_files && message.result.output_files.length > 0" class="result-files">
                  <p>生成文件:</p>
                  <div class="files-list">
                    <div
                      v-for="(file, idx) in message.result.output_files"
                      :key="idx"
                      class="file-item"
                    >
                      <el-icon><Document /></el-icon>
                      <span>{{ getFileName(file) }}</span>
                      <template v-if="isPreviewableFile(file)">
                        <el-link size="small" @click="previewFile(file)">预览</el-link>
                      </template>
                      <el-link size="small" @click="downloadFile(file)">下载</el-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="chat-input-header">
            <el-select
              v-model="selectedChatDomain"
              placeholder="选择领域"
              class="chat-domain-select"
            >
              <el-option
                v-for="domain in domains"
                :key="domain.id"
                :label="domain.name"
                :value="domain.id"
              />
            </el-select>
          </div>
          <el-input
            v-model="inputMessage"
            placeholder="输入您的分析需求，例如：分析滨州到晋城线路五环节时限"
            class="chat-input"
            @keyup.enter="sendMessage(inputMessage)"
          >
            <template #append>
              <el-button @click="sendMessage(inputMessage)" :disabled="!inputMessage.trim()">
                <el-icon><Search /></el-icon>
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 参数输入对话框 -->
    <el-dialog
      v-model="showParamsDialog"
      :title="`执行技能 - ${currentExecutingSkill?.name}`"
      width="500px"
      destroy-on-close
    >
      <div v-if="currentExecutingSkill">
        <el-form :model="currentParams" label-width="120px">
          <el-form-item
            v-for="param in currentExecutingSkill.input_params"
            :key="param.name"
            :label="param.description"
            :required="param.required"
          >
            <el-select
              v-if="param.name === 'route_name'"
              v-model="currentParams[param.name]"
              :placeholder="`请选择${param.description}`"
              :disabled="param.readonly"
              class="param-select"
            >
              <el-option
                v-for="route in availableRoutes"
                :key="route"
                :label="route"
                :value="route"
              />
            </el-select>
            <el-select
              v-else-if="param.name === 'institution_name'"
              v-model="currentParams[param.name]"
              :placeholder="`请选择${param.description}`"
              :disabled="param.readonly"
              class="param-select"
            >
              <el-option
                v-for="institution in availableInstitutions"
                :key="institution"
                :label="institution"
                :value="institution"
              />
              <el-option label="其他" value="" />
            </el-select>
            <el-input
              v-else
              v-model="currentParams[param.name]"
              :placeholder="`请输入${param.description}`"
              :disabled="param.readonly"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showParamsDialog = false">取消</el-button>
        <el-button @click="confirmExecute">确认执行</el-button>
      </template>
    </el-dialog>

    <!-- HTML预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="结果预览" width="900px" destroy-on-close>
      <iframe
        v-if="previewUrl"
        :src="previewUrl"
        class="preview-iframe"
        sandbox="allow-scripts allow-same-origin"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  List,
  Setting,
  Refresh,
  User,
  Cpu,
  Document,
} from '@element-plus/icons-vue'
import { skillManagerApi } from '@/api/skillManager'
import type { SkillInfo, SkillExecutionResult, IntentMatchResult } from '@/api/skillManager'

// 消息类型定义
interface ChatMessage {
  type: 'user' | 'bot'
  content: string
  time: string
  matches?: IntentMatchResult[]
  result?: Partial<SkillExecutionResult>
}

// 领域数据
const domains = ref([
  { id: 'all', name: '全部领域' },
  { id: 'logistics_time', name: '物流时限分析' },
  { id: 'finance', name: '代理金融分析' },
  { id: 'risk_control', name: '风险防控分析' },
])

// 当前选中的领域
const selectedDomain = ref('all')
const selectedChatDomain = ref('all')

// 当前状态
const searchKeyword = ref('')
const skills = ref<SkillInfo[]>([])
const selectedSkill = ref<SkillInfo | null>(null)

// 对话相关
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const chatHistoryRef = ref<HTMLElement | null>(null)

// 快捷示例
const quickExamples = [
  '开展滨州到晋城线路五环节时限对标分析',
  '分析进口环节时限',
  '生成线路分析报告',
]

// 执行相关
const currentParams = ref<Record<string, any>>({})
const currentExecutingSkill = ref<SkillInfo | null>(null)
const showParamsDialog = ref(false)

// 预览相关
const showPreviewDialog = ref(false)
const previewUrl = ref('')

// 可用线路列表
const availableRoutes = ref<string[]>(['滨州市晋城市', '滨州市烟台市', '滨州市菏泽市', '滨州市大同市'])

// 可用机构列表
const availableInstitutions = ref<string[]>(['博兴二部', '滨州市分公司', '晋城市分公司', '济南齐河'])

// 获取技能所属领域
const getSkillDomain = (skill: SkillInfo): string => {
  const layer = skill.layer || ''
  if (layer.includes('stage') || layer.includes('institution') || layer.includes('overview')) {
    return 'logistics_time'
  }
  return 'logistics_time'
}

// 过滤后的技能列表
const filteredSkills = computed(() => {
  let result = skills.value
  
  if (selectedDomain.value !== 'all') {
    result = result.filter(skill => getSkillDomain(skill) === selectedDomain.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (skill) =>
        skill.name.toLowerCase().includes(keyword) ||
        skill.description.toLowerCase().includes(keyword) ||
        skill.trigger_patterns.some((p) => p.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

// 获取层级标签类型
const getLayerTagType = (layer: string) => {
  const types: Record<string, string> = {
    overview: 'success',
    stage: 'primary',
    institution: 'warning',
  }
  return types[layer] || 'info'
}

// 获取层级标签
const getLayerLabel = (layer: string) => {
  const labels: Record<string, string> = {
    overview: '全景分析层',
    stage: '环节分析层',
    institution: '机构下钻层',
  }
  return labels[layer] || layer
}

// 根据技能ID获取技能名称
const getSkillName = (skillId: string) => {
  const skill = skills.value.find((s) => s.skill_id === skillId)
  return skill?.name || skillId
}

// 获取文件名
const getFileName = (filePath: string) => {
  return filePath.split('/').pop() || filePath
}

// 是否是可预览文件
const isPreviewableFile = (filePath: string) => {
  const lowerPath = filePath.toLowerCase()
  return lowerPath.endsWith('.html') || lowerPath.endsWith('.pdf')
}

// 获取文件类型
const getFileType = (filePath: string) => {
  const lowerPath = filePath.toLowerCase()
  if (lowerPath.endsWith('.html')) return 'html'
  if (lowerPath.endsWith('.pdf')) return 'pdf'
  if (lowerPath.endsWith('.docx')) return 'docx'
  if (lowerPath.endsWith('.doc')) return 'doc'
  if (lowerPath.endsWith('.pptx')) return 'pptx'
  if (lowerPath.endsWith('.ppt')) return 'ppt'
  if (lowerPath.endsWith('.xlsx')) return 'xlsx'
  if (lowerPath.endsWith('.xls')) return 'xls'
  return 'other'
}

// 预览文件
const previewFile = (filePath: string) => {
  const fileType = getFileType(filePath)
  if (fileType === 'html' || fileType === 'pdf') {
    previewUrl.value = `${import.meta.env.VITE_API_URL}/api/v1/skill-manager/files/${encodeURIComponent(filePath)}`
    showPreviewDialog.value = true
  } else {
    // 对于不支持直接预览的文件格式，提示用户下载
    ElMessage.info('该文件格式暂不支持预览，请下载后查看')
    downloadFile(filePath)
  }
}

// 搜索处理
const handleSearch = () => {}

// 加载技能列表
const loadSkills = async () => {
  try {
    const result = await skillManagerApi.getAllSkills()
    skills.value = result
  } catch (error) {
    ElMessage.error('加载技能列表失败')
    console.error('加载技能错误:', error)
  }
}

// 选择技能
const selectSkill = (skill: SkillInfo) => {
  selectedSkill.value = skill
}

// 根据ID选择技能
const selectSkillById = async (skillId: string) => {
  try {
    const skill = await skillManagerApi.getSkill(skillId)
    selectedSkill.value = skill
    currentExecutingSkill.value = skill
    
    // 滚动到卡片位置
    const cards = document.querySelectorAll('.skill-card-item')
    cards.forEach((card) => {
      if (card.getAttribute('data-skill-id') === skillId) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  } catch (error) {
    ElMessage.error('获取技能详情失败')
  }
}

// 打开参数对话框
const openParamsDialog = (skill: SkillInfo) => {
  currentExecutingSkill.value = skill
  currentParams.value = {}
  skill.input_params.forEach((param) => {
    if (param.default !== undefined) {
      currentParams.value[param.name] = param.default
    }
  })
  showParamsDialog.value = true
}

// 发送消息
const sendMessage = async (message: string) => {
  if (!message.trim()) return

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: message.trim(),
    time: new Date().toLocaleTimeString(),
  })
  inputMessage.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  try {
    // 获取当前选中的领域对应的技能列表
    let domainSkills = skills.value
    if (selectedChatDomain.value !== 'all') {
      domainSkills = skills.value.filter(skill => getSkillDomain(skill) === selectedChatDomain.value)
    }
    
    // 调用意图识别接口（限定在当前领域内）
    const matches = await skillManagerApi.parseIntent(message.trim())
    
    // 如果选择了特定领域，过滤匹配结果
    let filteredMatches = matches
    if (selectedChatDomain.value !== 'all') {
      filteredMatches = matches.filter(match => {
        const skill = domainSkills.find(s => s.skill_id === match.skill_id)
        return skill !== undefined
      })
    }
    
    // 找出最高置信度的技能
    const sortedMatches = [...filteredMatches].sort((a, b) => b.confidence - a.confidence)
    const topMatch = sortedMatches[0]
    
    let responseContent = `已识别您的需求，匹配到 ${filteredMatches.length} 个技能`
    if (topMatch) {
      responseContent = `已识别您的需求，最高匹配技能：${getSkillName(topMatch.skill_id)}（置信度: ${(topMatch.confidence * 100).toFixed(0)}%）`
    }
    
    // 添加机器人回复
    messages.value.push({
      type: 'bot',
      content: responseContent,
      time: new Date().toLocaleTimeString(),
      matches: filteredMatches,
    })
  } catch (error) {
    messages.value.push({
      type: 'bot',
      content: '抱歉，识别失败，请重试',
      time: new Date().toLocaleTimeString(),
    })
    console.error('意图识别错误:', error)
  }

  // 滚动到底部
  await nextTick()
  scrollToBottom()
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatHistoryRef.value) {
    chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
  }
}

// 根据意图识别结果执行技能（使用后端提取的参数）
const executeSkillById = async (skillId: string) => {
  try {
    const skill = await skillManagerApi.getSkill(skillId)
    currentExecutingSkill.value = skill
    currentParams.value = {}
    
    // 获取最新的意图识别结果中的参数
    const latestBotMessage = messages.value.filter(m => m.type === 'bot' && m.matches).pop()
    const matchedSkill = latestBotMessage?.matches?.find(m => m.skill_id === skillId)
    
    // 合并参数：后端提取的参数优先于默认值
    skill.input_params.forEach((param) => {
      // 优先使用后端提取的参数
      if (matchedSkill?.extracted_params && matchedSkill.extracted_params[param.name]) {
        currentParams.value[param.name] = matchedSkill.extracted_params[param.name]
      } 
      // 其次使用默认值
      else if (param.default !== undefined) {
        currentParams.value[param.name] = param.default
      }
    })
    
    // 检查必填参数是否完整
    const missingRequiredParams = skill.input_params.filter(
      (param) => param.required && !currentParams.value[param.name]
    )
    
    if (missingRequiredParams.length > 0) {
      showParamsDialog.value = true
      ElMessage.warning('请填写必填参数')
      return
    }
    
    await executeSkill(skillId)
  } catch (error) {
    ElMessage.error('获取技能信息失败')
    console.error('获取技能信息错误:', error)
  }
}

// 执行技能
const executeSkill = async (skillId: string) => {
  try {
    const result = await skillManagerApi.executeSkill(skillId, currentParams.value)
    
    messages.value.push({
      type: 'bot',
      content: result.success ? '技能执行完成' : '技能执行失败',
      time: new Date().toLocaleTimeString(),
      result,
    })
    
    await nextTick()
    scrollToBottom()
    
    if (!result.success) {
      ElMessage.error('技能执行失败')
    } else {
      ElMessage.success('技能执行成功')
    }
  } catch (error: any) {
    messages.value.push({
      type: 'bot',
      content: '技能执行失败: ' + (error.message || '未知错误'),
      time: new Date().toLocaleTimeString(),
      result: {
        success: false,
        execution_time: 0,
        error_message: error.message || '未知错误',
        output_files: [],
      },
    })
    await nextTick()
    scrollToBottom()
    ElMessage.error('技能执行失败')
    console.error('执行技能错误:', error)
  }
}

// 确认执行
const confirmExecute = async () => {
  if (!currentExecutingSkill.value) return
  
  showParamsDialog.value = false
  
  try {
    const result = await skillManagerApi.executeSkill(
      currentExecutingSkill.value.skill_id,
      currentParams.value
    )
    
    messages.value.push({
      type: 'bot',
      content: result.success ? '技能执行完成' : '技能执行失败',
      time: new Date().toLocaleTimeString(),
      result,
    })
    
    await nextTick()
    scrollToBottom()
    
    if (!result.success) {
      ElMessage.error('技能执行失败')
    } else {
      ElMessage.success('技能执行成功')
    }
  } catch (error: any) {
    messages.value.push({
      type: 'bot',
      content: '技能执行失败: ' + (error.message || '未知错误'),
      time: new Date().toLocaleTimeString(),
      result: {
        success: false,
        execution_time: 0,
        error_message: error.message || '未知错误',
        output_files: [],
      },
    })
    await nextTick()
    scrollToBottom()
    ElMessage.error('技能执行失败')
    console.error('执行技能错误:', error)
  }
}

// 下载文件
const downloadFile = (filePath: string) => {
  window.open(`${import.meta.env.VITE_API_URL}/api/v1/skill-manager/files/${encodeURIComponent(filePath)}`, '_blank')
}



// 初始化
onMounted(() => {
  loadSkills()
})
</script>

<style lang="less" scoped>
.skill-manager-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
}

.skill-header {
  text-align: center;
  margin-bottom: 40px;
  
  .welcome-title {
    font-weight: 600;
    margin: 0 0 10px 0;
    color: #006633;
  }
  
  .welcome-desc {
    font-size: 16px;
    margin: 0;
    color: #666666;
  }
}

.skill-main-content {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.skill-cards-section {
  width: 450px;
  flex-shrink: 0;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .domain-select {
    width: 120px;
  }
  
  .search-input {
    width: 140px;
  }
}

.skills-grid {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.skill-card-item {
  margin-bottom: 16px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #006633;
    box-shadow: 0 4px 12px rgba(0, 102, 51, 0.15);
  }
  
  &.is-selected {
    border-color: #006633;
    background-color: #f6fff9;
  }
}

.skill-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  .skill-icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.overview {
      background: #e6f7ff;
      color: #1890ff;
    }
    
    &.stage {
      background: #f6ffed;
      color: #52c41a;
    }
    
    &.institution {
      background: #fff7e6;
      color: #fa8c16;
    }
  }
  
  .skill-info {
    flex: 1;
    
    .skill-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }
  }
}

.skill-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.skill-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
  }
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
  
  .trigger-tag {
    font-size: 11px;
    padding: 2px 8px;
    background: #f0f0f0;
    border-radius: 4px;
    color: #666;
  }
}

.execute-btn {
  width: 100%;
}

.skill-chat-section {
  flex: 1;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chat-history {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.chat-welcome {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  
  .welcome-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 20px;
    background: #006633;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    margin: 0 0 16px 0;
  }
  
  .welcome-tips {
    text-align: left;
    max-width: 300px;
    margin: 0 auto 20px;
    padding-left: 20px;
    
    li {
      font-size: 13px;
      margin-bottom: 8px;
    }
  }
  
  .quick-examples {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    
    .examples-label {
      font-size: 13px;
      color: #999;
      margin-right: 8px;
    }
    
    .quick-tag {
      cursor: pointer;
      background: #f0f7f0;
      color: #006633;
      
      &:hover {
        background: #006633;
        color: white;
      }
    }
  }
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  
  &.user {
    .message-content {
      background: #f0f0f0;
      color: #333;
      border-radius: 0 12px 12px 12px;
    }
  }
  
  &.bot {
    flex-direction: row-reverse;
    
    .message-content {
      background: #f5f7fa;
      color: #333;
      border-radius: 12px 0 12px 12px;
    }
  }
  
  .message-avatar {
    flex-shrink: 0;
    
    .bot-avatar {
      width: 40px;
      height: 40px;
      background: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #006633;
    }
  }
  
  .message-content {
    max-width: 70%;
    padding: 12px 16px;
    
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .sender-name {
        font-size: 13px;
        font-weight: 600;
      }
      
      .message-time {
        font-size: 11px;
        opacity: 0.7;
      }
    }
    
    .message-text {
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }
  }
}

.skill-matches {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
  
  .matches-title {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
  
  .matches-list {
    .match-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      
      .match-info {
        .match-name {
          font-size: 14px;
          font-weight: 500;
          margin-right: 12px;
        }
        
        .match-confidence {
          font-size: 12px;
          color: #666;
        }
      }
      
      .match-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.execution-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  
  &.success {
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    
    .result-header {
      color: #52c41a;
    }
  }
  
  &.error {
    background: #fff2f0;
    border: 1px solid #ffccc7;
    
    .result-header {
      color: #ff4d4f;
    }
  }
  
  .result-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .result-time {
    font-size: 13px;
    color: #666;
    margin: 0 0 8px 0;
  }
  
  .result-error {
    font-size: 13px;
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.1);
    padding: 8px;
    border-radius: 4px;
  }
  
  .result-files {
    margin-top: 12px;
    
    p {
      font-size: 13px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    
    .files-list {
      .file-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 13px;
      }
    }
  }
}

.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  
  .chat-input-header {
    margin-bottom: 12px;
  }
  
  .chat-domain-select {
    width: 160px;
  }
  
  .chat-input {
    width: 100%;
  }
}

.param-select {
  width: 100%;
}

.preview-iframe {
  width: 100%;
  height: 500px;
  border: none;
}
</style>
