<template>
  <div class="skill-manager-container">
    <el-card class="skill-card">
      <template #header>
        <div class="card-header">
          <span>技能管理</span>
          <el-tabs v-model="activeTab" class="skill-tabs">
            <el-tab-pane label="技能列表" name="list">
            </el-tab-pane>
            <el-tab-pane label="智能分析" name="intent">
            </el-tab-pane>
            <el-tab-pane label="历史记录" name="history">
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>

      <!-- 技能列表标签页 -->
      <div v-if="activeTab === 'list'" class="skill-list-container">
        <!-- 搜索和筛选 -->
        <div class="search-section">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索技能名称或描述..."
            class="search-input"
            @input="handleSearch"
          >
            <template #append>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="layerFilter" placeholder="选择层级" class="layer-select" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="全景分析层" value="overview" />
            <el-option label="环节分析层" value="stage" />
            <el-option label="机构下钻层" value="institution" />
          </el-select>
          <el-button type="primary" @click="loadSkills" class="refresh-btn">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredSkills.length === 0" class="empty-container">
          <el-empty :description="searchKeyword || layerFilter ? '未找到匹配的技能' : '暂无技能'">
            <el-button type="primary" @click="loadSkills">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-empty>
        </div>

        <!-- 技能卡片列表 -->
        <div v-else class="skills-grid">
          <el-card 
            v-for="skill in filteredSkills" 
            :key="skill.skill_id"
            class="skill-item"
            @click="selectSkill(skill)"
            :class="{ 'is-selected': selectedSkill?.skill_id === skill.skill_id }"
          >
            <div class="skill-header">
              <span class="skill-name">{{ skill.name }}</span>
              <el-tag :type="getLayerTagType(skill.layer)" size="small">
                {{ getLayerLabel(skill.layer) }}
              </el-tag>
            </div>
            <p class="skill-description">{{ skill.description }}</p>
            <div class="skill-info">
              <span class="info-item">
                <el-icon><Document /></el-icon>
                {{ skill.language }}
              </span>
              <span class="info-item">
                <el-icon><List /></el-icon>
                {{ skill.input_params.length }} 参数
              </span>
            </div>
            <div class="skill-tags">
              <span 
                v-for="(pattern, index) in skill.trigger_patterns.slice(0, 3)" 
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
              <el-icon><Plus /></el-icon>
              执行
            </el-button>
          </el-card>
        </div>

      </div>

      <!-- 智能分析标签页 -->
      <div v-if="activeTab === 'intent'" class="intent-container">
        <div class="intent-input-section">
          <el-input 
            v-model="intentQuery" 
            placeholder="请输入您的分析需求，例如：分析进口环节时限"
            class="intent-input"
            @keyup.enter="parseIntent"
          >
            <template #append>
              <el-button type="primary" @click="parseIntent">
                <el-icon><Search /></el-icon>
                分析
              </el-button>
            </template>
          </el-input>
        </div>

        <!-- 匹配结果 -->
        <div v-if="intentMatches.length > 0" class="intent-results">
          <el-divider content-position="left">匹配的技能</el-divider>
          <el-table :data="intentMatches" border>
            <el-table-column prop="skill_id" label="技能ID" />
            <el-table-column prop="confidence" label="置信度">
              <template #default="scope">
                <el-progress :percentage="scope.row.confidence * 100" :show-text="false" />
                <span class="confidence-text">{{ (scope.row.confidence * 100).toFixed(0) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="匹配原因" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" @click="selectSkillById(scope.row.skill_id)">查看详情</el-button>
                <el-button size="small" type="primary" @click="executeSkillById(scope.row.skill_id)">执行</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 示例查询 -->
        <div class="intent-examples">
          <el-divider content-position="left">示例查询</el-divider>
          <div class="examples-list">
            <el-tag 
              v-for="(example, index) in intentExamples" 
              :key="index"
              class="example-tag"
              @click="intentQuery = example"
            >
              {{ example }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 历史记录标签页 -->
      <div v-if="activeTab === 'history'" class="history-container">
        <div class="history-header">
          <el-button type="primary" @click="loadHistory">
            <el-icon><Refresh /></el-icon>
            刷新记录
          </el-button>
        </div>
        
        <!-- 历史记录列表 -->
        <div v-if="historyRecords.length > 0" class="history-list">
          <el-table :data="historyRecords" border>
            <el-table-column prop="skill_name" label="技能名称" />
            <el-table-column prop="params" label="输入参数">
              <template #default="scope">
                <span>{{ JSON.stringify(scope.row.params || {}) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="success" label="执行状态">
              <template #default="scope">
                <el-tag :type="scope.row.success ? 'success' : 'danger'">
                  {{ scope.row.success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="execution_time" label="耗时(秒)">
              <template #default="scope">
                {{ typeof scope.row.execution_time === 'number' ? scope.row.execution_time.toFixed(2) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="output_files" label="输出文件数">
              <template #default="scope">
                {{ scope.row.output_files?.length || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="执行时间" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" @click="reExecute(scope.row)">重新执行</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="empty-history">
          <el-empty description="暂无历史记录" />
        </div>
      </div>

      <!-- 技能详情弹窗 -->
      <el-dialog
        v-model="showSkillDetailDialog"
        :title="`技能详情 - ${selectedSkill?.name}`"
        width="700px"
        destroy-on-close
      >
        <div v-if="selectedSkill" class="skill-detail-content">
          <el-descriptions :column="2" border class="detail-descriptions">
            <el-descriptions-item label="技能名称">{{ selectedSkill.name }}</el-descriptions-item>
            <el-descriptions-item label="技能ID">{{ selectedSkill.short_id }}</el-descriptions-item>
            <el-descriptions-item label="层级">{{ getLayerLabel(selectedSkill.layer) }}</el-descriptions-item>
            <el-descriptions-item label="语言">{{ selectedSkill.language }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ selectedSkill.description }}</el-descriptions-item>
          </el-descriptions>

          <!-- 输入参数 -->
          <div v-if="selectedSkill.input_params.length > 0" class="params-section">
            <el-divider content-position="left">输入参数</el-divider>
            <el-form :model="currentParams" label-width="120px" class="params-form">
              <el-form-item 
                v-for="param in selectedSkill.input_params" 
                :key="param.name"
                :label="param.description"
                :required="param.required"
              >
                <el-input 
                  v-model="currentParams[param.name]"
                  :placeholder="`请输入${param.description}`"
                  class="param-input"
                />
                <span v-if="param.default !== undefined" class="default-hint">
                  默认值: {{ param.default }}
                </span>
                <span v-if="param.name === 'route_name'" class="example-hint">
                  示例: 滨州市大同市、北京 - 上海
                </span>
                <span v-if="param.name === 'institution_name'" class="example-hint">
                  示例: 博兴二部、济南齐河、滨州市分公司
                </span>
              </el-form-item>
            </el-form>
          </div>

          <!-- 触发模式 -->
          <div v-if="selectedSkill.trigger_patterns.length > 0" class="patterns-section">
            <el-divider content-position="left">触发示例</el-divider>
            <el-tag 
              v-for="(pattern, index) in selectedSkill.trigger_patterns" 
              :key="index"
              class="pattern-tag"
            >
              {{ pattern }}
            </el-tag>
          </div>
        </div>
        <template #footer>
          <el-button @click="showSkillDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="executeSelectedSkill">
            <el-icon><Plus /></el-icon>
            执行技能
          </el-button>
        </template>
      </el-dialog>

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
          <el-button type="primary" @click="confirmExecute">确认执行</el-button>
        </template>
      </el-dialog>

      <!-- 执行结果对话框 -->
      <el-dialog
        v-model="showResultDialog"
        :title="`执行结果 - ${currentExecutingSkill?.name}`"
        width="600px"
        destroy-on-close
      >
        <div v-if="executionResult" class="result-container">
          <!-- 执行状态 -->
          <div :class="['result-status', executionResult.success ? 'success' : 'error']">
            <el-icon :size="48">
              <Plus v-if="executionResult.success" />
              <Search v-else />
            </el-icon>
            <div class="status-info">
              <h3>{{ executionResult.success ? '执行成功' : '执行失败' }}</h3>
              <p>耗时：{{ executionResult.execution_time.toFixed(2) }} 秒</p>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="!executionResult.success && executionResult.error_message" class="error-hint">
            <el-alert 
              :message="executionResult.error_message" 
              type="error" 
              show-icon
              :closable="false"
            />
          </div>

          <!-- 输出文件 -->
          <div v-if="executionResult.success && executionResult.output_files && executionResult.output_files.length > 0" class="output-section">
            <h4>生成的文件：</h4>
            <div class="files-grid">
              <div 
                v-for="(file, index) in executionResult.output_files" 
                :key="index"
                class="file-item"
              >
                <el-icon :size="32" class="file-icon"><Document /></el-icon>
                <div class="file-info">
                  <span class="file-name">{{ getFileName(file) }}</span>
                  <div class="file-actions">
                    <el-link v-if="isHtmlFile(file)" @click="previewHtml(file)" type="primary" size="small">
                      预览
                    </el-link>
                    <el-link @click="downloadFile(file)" type="primary" size="small">
                      下载
                    </el-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- HTML预览对话框 -->
          <el-dialog
            v-model="showPreviewDialog"
            title="结果预览"
            width="800px"
            destroy-on-close
          >
            <iframe 
              v-if="previewUrl"
              :src="previewUrl" 
              class="preview-iframe"
              sandbox="allow-scripts allow-same-origin"
            />
          </el-dialog>

          <!-- 成功提示 -->
          <div v-if="executionResult.success && (!executionResult.output_files || executionResult.output_files.length === 0)" class="success-hint">
            <el-alert 
              message="技能执行成功，无输出文件" 
              type="success" 
              show-icon
              :closable="false"
            />
          </div>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh, List, Plus, Document } from '@element-plus/icons-vue';
import { skillManagerApi } from '@/api/skillManager';
import type { SkillInfo, SkillExecutionResult, IntentMatchResult, WorkflowDefinition } from '@/api/skillManager';

// 当前激活的标签页
const activeTab = ref('list');

// 技能列表
const skills = ref<SkillInfo[]>([]);
const filteredSkills = ref<SkillInfo[]>([]);
const selectedSkill = ref<SkillInfo | null>(null);
const searchKeyword = ref('');
const layerFilter = ref('');
const isLoading = ref(false);

// 执行相关
const currentParams = ref<Record<string, any>>({});
const currentExecutingSkill = ref<SkillInfo | null>(null);
const executionResult = ref<SkillExecutionResult | null>(null);
const showResultDialog = ref(false);
const showParamsDialog = ref(false);
const isExecuting = ref(false);

// 意图识别相关
const intentQuery = ref('');
const intentMatches = ref<IntentMatchResult[]>([]);
const intentExamples = [
  '开展滨州到晋城线路五环节时限对标分析',
  '生成滨州到烟台线路的五环节分析报告',
  '分析滨州到菏泽线路的五环节时限',
  '开展线路五环节时限对标分析',
  '分析收寄环节的问题机构'
];

// 可用线路列表（从数据文件中读取）
const availableRoutes = ref<string[]>([
  '滨州市晋城市',
  '滨州市烟台市',
  '滨州市菏泽市',
]);

// 可用机构列表
const availableInstitutions = ref<string[]>([
  '博兴二部',
  '滨州市分公司',
  '晋城市分公司',
]);

// 工作流相关（保留但不再使用）
const workflows = ref<WorkflowDefinition[]>([]);

// 技能详情弹窗
const showSkillDetailDialog = ref(false);

// 历史记录相关
interface HistoryRecord {
  skill_id: string;
  skill_name: string;
  params: Record<string, any>;
  success: boolean;
  execution_time: number;
  output_files: string[];
  created_at: string;
}

const historyRecords = ref<HistoryRecord[]>([]);

// 获取层级标签类型
const getLayerTagType = (layer: string) => {
  const types: Record<string, string> = {
    'overview': 'success',
    'stage': 'primary',
    'institution': 'warning'
  };
  return types[layer] || 'info';
};

// 获取层级标签
const getLayerLabel = (layer: string) => {
  const labels: Record<string, string> = {
    'overview': '全景分析层',
    'stage': '环节分析层',
    'institution': '机构下钻层'
  };
  return labels[layer] || layer;
};

// 加载技能列表
const loadSkills = async () => {
  isLoading.value = true;
  try {
    console.log('开始加载技能...');
    const skillData = await skillManagerApi.getAllSkills();
    console.log('技能数据:', skillData);
    
    skills.value = skillData;
    filteredSkills.value = skillData;
    
    if (skillData && skillData.length > 0) {
      console.log(`成功加载 ${skillData.length} 个技能`);
    } else {
      console.warn('没有加载到技能数据');
    }
  } catch (error) {
    console.error('加载技能列表错误:', error);
    ElMessage.error('加载技能列表失败');
  } finally {
    isLoading.value = false;
  }
};

// 搜索技能
const handleSearch = () => {
  let result = skills.value;
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(skill => 
      skill.name.toLowerCase().includes(keyword) ||
      skill.description.toLowerCase().includes(keyword) ||
      skill.short_id.toLowerCase().includes(keyword)
    );
  }
  
  if (layerFilter.value) {
    result = result.filter(skill => skill.layer === layerFilter.value);
  }
  
  filteredSkills.value = result;
};

// 选择技能（打开弹窗）
const selectSkill = (skill: SkillInfo) => {
  selectedSkill.value = skill;
  // 初始化参数
  currentParams.value = {};
  skill.input_params.forEach(param => {
    if (param.default !== undefined) {
      currentParams.value[param.name] = param.default;
    }
  });
  showSkillDetailDialog.value = true;
};

// 根据ID选择技能
const selectSkillById = async (skillId: string) => {
  try {
    const skill = await skillManagerApi.getSkill(skillId);
    selectedSkill.value = skill;
    currentParams.value = {};
    skill.input_params.forEach(param => {
      if (param.default !== undefined) {
        currentParams.value[param.name] = param.default;
      }
    });
    showSkillDetailDialog.value = true;
  } catch (error) {
    ElMessage.error('获取技能详情失败');
    console.error('获取技能详情错误:', error);
  }
};

// 获取文件名（从完整路径中提取）
const getFileName = (filePath: string) => {
  return filePath.replace(/\\/g, '/').split('/').pop() || filePath;
};

// 判断是否为HTML文件
const isHtmlFile = (filePath: string) => {
  return filePath.toLowerCase().endsWith('.html') || filePath.toLowerCase().endsWith('.htm');
};

// HTML预览相关
const showPreviewDialog = ref(false);
const previewUrl = ref('');

const previewHtml = (filePath: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api/v1';
  const baseUrl = apiBaseUrl.replace('/api/v1', '');
  previewUrl.value = `${baseUrl}/api/v1/skill-manager/files/preview?file_path=${encodeURIComponent(filePath)}`;
  showPreviewDialog.value = true;
};

const downloadFile = async (filePath: string) => {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api/v1';
    const baseUrl = apiBaseUrl.replace('/api/v1', '');
    const url = `${baseUrl}/api/v1/skill-manager/files/preview?file_path=${encodeURIComponent(filePath)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('下载失败');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = getFileName(filePath);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
    
    ElMessage.success('下载成功');
  } catch (error) {
    console.error('下载错误:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

// 打开参数输入对话框
const openParamsDialog = (skill: SkillInfo) => {
  currentExecutingSkill.value = skill;
  currentParams.value = {};
  skill.input_params.forEach(param => {
    if (param.default !== undefined) {
      currentParams.value[param.name] = param.default;
    }
  });
  showParamsDialog.value = true;
};

// 确认执行（从参数对话框）
const confirmExecute = async () => {
  if (!currentExecutingSkill.value) return;
  showParamsDialog.value = false;
  await executeSkill(currentExecutingSkill.value.skill_id);
};

// 直接执行技能
const executeSkillDirectly = async (skill: SkillInfo) => {
  currentExecutingSkill.value = skill;
  currentParams.value = {};
  
  // 检查是否有必填参数需要用户输入
  const requiredParams = skill.input_params.filter(p => p.required && !p.default);
  if (requiredParams.length > 0) {
    // 需要先填写参数，显示技能详情弹窗让用户填写
    selectedSkill.value = skill;
    skill.input_params.forEach(param => {
      if (param.default !== undefined) {
        currentParams.value[param.name] = param.default;
      }
    });
    showSkillDetailDialog.value = true;
    return;
  }
  
  // 所有参数都有默认值，可以直接执行
  skill.input_params.forEach(param => {
    if (param.default !== undefined) {
      currentParams.value[param.name] = param.default;
    }
  });
  await executeSkill(skill.skill_id);
};

// 执行选中的技能
const executeSelectedSkill = async () => {
  if (!selectedSkill.value) return;
  currentExecutingSkill.value = selectedSkill.value;
  await executeSkill(selectedSkill.value.skill_id);
};

// 执行技能
const executeSkill = async (skillId: string) => {
  isExecuting.value = true;
  showResultDialog.value = true;
  // 清空之前的执行结果，确保显示最新结果
  executionResult.value = null;
  
  try {
    const result = await skillManagerApi.executeSkill(skillId, currentParams.value);
    console.log('技能执行结果:', result);
    executionResult.value = result;
    
    if (result.success) {
      ElMessage.success('技能执行成功');
      if (result.output_files && result.output_files.length > 0) {
        console.log('输出文件:', result.output_files);
      } else {
        console.log('没有输出文件');
      }
    } else {
      ElMessage.error(result.error_message || '技能执行失败');
    }
    
    // 保存到历史记录
    const skillName = currentExecutingSkill.value?.name || skillId;
    saveToHistory(skillId, skillName, { ...currentParams.value }, result);
    
  } catch (error) {
    ElMessage.error('执行技能时发生错误');
    console.error('执行技能错误:', error);
    executionResult.value = {
      skill_id: skillId,
      success: false,
      output_files: [],
      execution_time: 0,
      error_message: '执行技能时发生错误'
    };
    
    // 保存失败记录到历史
    const skillName = currentExecutingSkill.value?.name || skillId;
    saveToHistory(skillId, skillName, { ...currentParams.value }, executionResult.value);
  } finally {
    isExecuting.value = false;
  }
};

// 根据意图识别结果执行技能
const executeSkillById = async (skillId: string) => {
  try {
    const skill = await skillManagerApi.getSkill(skillId);
    currentExecutingSkill.value = skill;
    currentParams.value = {};
    skill.input_params.forEach(param => {
      if (param.default !== undefined) {
        currentParams.value[param.name] = param.default;
      }
    });
    await executeSkill(skillId);
  } catch (error) {
    ElMessage.error('获取技能信息失败');
    console.error('获取技能信息错误:', error);
  }
};

// 解析用户意图
const parseIntent = async () => {
  if (!intentQuery.value.trim()) {
    ElMessage.warning('请输入分析需求');
    return;
  }
  
  try {
    const matches = await skillManagerApi.parseIntent(intentQuery.value);
    intentMatches.value = matches;
    
    if (matches.length === 0) {
      ElMessage.info('未找到匹配的技能');
    }
  } catch (error) {
    ElMessage.error('意图识别失败');
    console.error('意图识别错误:', error);
  }
};

// 确认链式执行
const confirmChainExecution = async () => {
  if (!executionResult.value?.pending_confirmation || !currentExecutingSkill.value) return;
  
  try {
    const result = await skillManagerApi.confirmChain(
      currentExecutingSkill.value.skill_id,
      executionResult.value.pending_confirmation
    );
    
    executionResult.value = result;
    currentExecutingSkill.value = await skillManagerApi.getSkill(result.skill_id);
    
    if (result.success) {
      ElMessage.success('链式触发执行成功');
    }
  } catch (error) {
    ElMessage.error('链式触发执行失败');
    console.error('链式触发错误:', error);
  }
};

// 执行工作流
const executeWorkflow = async (workflow: WorkflowDefinition) => {
  ElMessage.info(`执行工作流: ${workflow.name}`);
};

// 加载工作流列表（保留但不再使用）
const loadWorkflows = async () => {
  try {
    const response = await skillManagerApi.listWorkflows();
    workflows.value = response;
  } catch (error) {
    console.error('加载工作流列表错误:', error);
  }
};

// 加载历史记录
const loadHistory = async () => {
  try {
    const history = localStorage.getItem('skill_execution_history');
    if (history) {
      historyRecords.value = JSON.parse(history);
    } else {
      historyRecords.value = [];
    }
  } catch (error) {
    console.error('加载历史记录错误:', error);
    historyRecords.value = [];
  }
};

// 保存执行记录到历史
const saveToHistory = (skillId: string, skillName: string, params: Record<string, any>, result: SkillExecutionResult) => {
  const record: HistoryRecord = {
    skill_id: skillId,
    skill_name: skillName,
    params: { ...params },
    success: result.success,
    execution_time: result.execution_time,
    output_files: result.output_files || [],
    created_at: new Date().toLocaleString('zh-CN')
  };
  
  historyRecords.value.unshift(record);
  
  if (historyRecords.value.length > 50) {
    historyRecords.value = historyRecords.value.slice(0, 50);
  }
  
  try {
    localStorage.setItem('skill_execution_history', JSON.stringify(historyRecords.value));
  } catch (error) {
    console.error('保存历史记录错误:', error);
  }
};

// 重新执行历史记录
const reExecute = async (record: HistoryRecord) => {
  currentParams.value = { ...record.params };
  currentExecutingSkill.value = await skillManagerApi.getSkill(record.skill_id);
  await executeSkill(record.skill_id);
};

// 页面加载时获取数据
onMounted(async () => {
  await loadSkills();
  await loadWorkflows();
  await loadHistory();
});
</script>

<style scoped>
.skill-manager-container {
  padding: 20px;
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: #ffffff;
  overflow-y: auto;
}

.skill-card {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-tabs {
  margin-left: auto;
}

/* 技能列表 */
.skill-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.layer-select {
  width: 150px;
}

.refresh-btn {
  margin-left: auto;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  overflow-y: auto;
  flex: 1;
}

.skill-item {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  
  &:hover {
    border-color: #006633;
    box-shadow: 0 4px 12px rgba(0, 102, 51, 0.15);
  }
  
  &.is-selected {
    border-color: #006633;
    background-color: #f0f9f4;
  }
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.skill-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.skill-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.skill-info {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
  gap: 4px;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.trigger-tag {
  font-size: 12px;
  background-color: #f5f7fa;
  color: #606266;
}

.execute-btn {
  width: 100%;
  background-color: #006633 !important;
  border-color: #006633 !important;
}

/* 技能详情面板 */
.skill-detail-panel {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.detail-descriptions {
  margin-bottom: 20px;
}

.params-section {
  margin-bottom: 20px;
}

.params-form {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.default-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.example-hint {
  font-size: 12px;
  color: #1989fa;
  margin-left: 8px;
}

.param-input {
  width: 100%;
  max-width: 400px;
}

.patterns-section {
  margin-bottom: 20px;
}

.pattern-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 智能分析 */
.intent-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.intent-input-section {
  margin-bottom: 24px;
}

.intent-input {
  width: 100%;
}

.intent-results {
  flex: 1;
  overflow-y: auto;
}

.confidence-text {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

.intent-examples {
  margin-top: 24px;
}

.examples-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.example-tag {
  cursor: pointer;
  background-color: #f0f9f4;
  color: #006633;
  border-color: #b7eb8f;
  
  &:hover {
    background-color: #e6f7ee;
  }
}

/* 历史记录 */
.history-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-header {
  margin-bottom: 16px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
}

.empty-history {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 技能详情弹窗 */
.skill-detail-content {
  max-height: 500px;
  overflow-y: auto;
}

/* 执行结果对话框 */
.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  
  &.success {
    background-color: #f0f9f4;
    color: #006633;
    font-size: 18px;
    font-weight: 600;
  }
  
  &.error {
    background-color: #fff2f0;
    color: #f56c6c;
    font-size: 18px;
    font-weight: 600;
  }
}

.result-info {
  margin-bottom: 20px;
}

.output-files {
  margin-bottom: 20px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.structured-output pre {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.stdout-output {
  margin-bottom: 20px;
}

.output-pre {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.error-output {
  margin-bottom: 20px;
}

.error-pre {
  background-color: #fff2f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  color: #f56c6c;
}

.pending-confirm {
  margin-top: 20px;
}

.confirm-btn {
  margin-top: 12px;
}

/* 参数选择下拉框 */
.param-select {
  width: 100%;
}

/* 文件名显示 */
.file-name {
  display: block;
  word-break: break-all;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

/* 预览iframe */
.preview-iframe {
  width: 100%;
  height: 500px;
  border: none;
}

/* 卡片内容区域 */
:deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  margin: 0;
}
</style>
