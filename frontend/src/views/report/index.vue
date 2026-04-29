<template>
  <div class="report-container">
    <el-card class="report-card">
      <template #header>
        <div class="card-header">
          <span>报告生成</span>
          <el-tabs v-model="activeTab" class="report-tabs">
            <el-tab-pane label="模板生成" name="template">
            </el-tab-pane>
            <el-tab-pane label="会话汇总" name="chat">
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      
      <!-- 模板生成方式 -->
      <div v-if="activeTab === 'template'">
        <!-- 模板上传区域 -->
        <el-divider content-position="left">上传报告模板</el-divider>
        <div class="upload-section">
          <div 
            class="upload-area" 
            :class="{ 'drag-over': isDragOver }"
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
          >
            <input 
              type="file" 
              class="upload-input" 
              accept=".md,.txt"
              @change="handleFileSelect"
            />
            <div class="upload-content">
              <el-icon class="upload-icon" size="48">
                <Upload />
              </el-icon>
              <p>点击或拖拽上传报告模板文件</p>
              <p class="upload-hint">支持 .md 或 .txt 格式</p>
            </div>
          </div>
          
          <!-- 解析结果展示 -->
          <div v-if="parsedFocusContent" class="focus-content">
            <el-divider content-position="left">【重点关注】内容</el-divider>
            <el-card class="focus-card">
              <p>{{ parsedFocusContent }}</p>
            </el-card>
          </div>
          
          <!-- 问题列表 -->
          <div v-if="generatedQuestions.length > 0" class="questions-section">
            <el-divider content-position="left">生成的问题列表</el-divider>
            <el-checkbox-group v-model="selectedQuestions" class="questions-group">
              <el-checkbox 
                v-for="(question, index) in generatedQuestions" 
                :key="index"
                :label="question"
              >
                {{ index + 1 }}. {{ question }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          
          <!-- 操作按钮 -->
          <div class="template-actions">
            <el-button 
              type="primary" 
              @click="generateQuestions" 
              :loading="isGeneratingQuestions"
              :disabled="!parsedFocusContent"
            >
              {{ isGeneratingQuestions ? '生成中...' : '生成问题列表' }}
            </el-button>
            <el-button 
              type="success" 
              @click="generateReportFromTemplate" 
              :loading="isGeneratingReport"
              :disabled="selectedQuestions.length === 0"
            >
              {{ isGeneratingReport ? '生成报告中...' : '生成报告' }}
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 会话汇总方式 -->
      <div v-if="activeTab === 'chat'">
        <el-divider content-position="left">选择历史会话</el-divider>
        
        <!-- 会话列表 -->
        <div class="chat-section">
          <el-table 
            :data="chatRecords" 
            style="width: 100%"
            :row-key="(record: any) => record.id"
            :default-sort="{ prop: 'create_time', order: 'descending' }"
            @selection-change="handleChatSelectionChange"
            border
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="tool" label="工具类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.tool === 'chat' ? 'primary' : 'success'">
                  {{ scope.row.tool === 'chat' ? '智能问数' : '数据分析' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="question" label="问题" min-width="250" show-overflow-tooltip />
            <el-table-column prop="datasource_name" label="数据源" width="150" />
            <el-table-column prop="create_time" label="创建时间" width="180" />
            <el-table-column prop="finish_time" label="结束时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
                  {{ scope.row.status === 'completed' ? '已完成' : '处理中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="result" label="返回结果" min-width="200" show-overflow-tooltip>
              <template #default="scope">
                <div :class="scope.row.result === '失败' ? 'result-failed' : 'result-content'">
                  {{ scope.row.result }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <div class="table-operate">
                  <el-button 
                    size="small" 
                    type="success" 
                    @click="viewChatDetail(scope.row)"
                    style="margin-right: 8px;"
                  >
                    查看
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="deleteChatRecord(scope.row)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 操作按钮 -->
        <div class="chat-actions">
          <el-button 
            type="success" 
            @click="generateReportFromChats" 
            :loading="isGeneratingReport"
            :disabled="selectedChatRecords.length === 0"
          >
            {{ isGeneratingReport ? '生成报告中...' : `生成综合报告 (已选${selectedChatRecords.length}条)` }}
          </el-button>
        </div>
      </div>
      
      <!-- 会话详情对话框 -->
      <el-dialog
        v-model="showChatDetailDialog"
        :title="`查看会话详情 - ${selectedChatDetail?.tool === 'chat' ? '智能问数' : '数据分析'}`"
        width="80%"
        destroy-on-close
      >
        <div v-if="selectedChatDetail">
          <div class="dialog-section">
            <h3>会话信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="会话ID">{{ selectedChatDetail.id }}</el-descriptions-item>
              <el-descriptions-item label="工具类型">{{ selectedChatDetail.tool === 'chat' ? '智能问数' : '数据分析' }}</el-descriptions-item>
              <el-descriptions-item label="问题">{{ selectedChatDetail.question }}</el-descriptions-item>
              <el-descriptions-item label="数据源">{{ selectedChatDetail.datasource_name }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ selectedChatDetail.create_time }}</el-descriptions-item>
              <el-descriptions-item label="结束时间">{{ selectedChatDetail.finish_time || '未完成' }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ selectedChatDetail.status === 'completed' ? '已完成' : '处理中' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          
          <div class="dialog-section">
            <h3>返回结果</h3>
            <div class="result-content-detail">{{ selectedChatDetail.result }}</div>
          </div>
        </div>
      </el-dialog>
      
      <!-- 生成的报告 -->
      <div v-if="generatedReport" class="generated-report">
        <el-divider content-position="left">生成的报告</el-divider>
        <el-card class="report-content">
          <div class="report-header">
            <h3>{{ generatedReport.name }}</h3>
            <span class="report-time">{{ generatedReport.create_time }}</span>
          </div>
          <div class="markdown-content" v-html="renderMarkdown(generatedReport.report_content || '')"></div>
          <div class="report-actions">
            <el-button type="primary" @click="editReport">编辑</el-button>
            <el-button @click="downloadReport">下载</el-button>
          </div>
        </el-card>
      </div>
      
      <!-- 报告列表 -->
      <el-divider content-position="left">报告列表</el-divider>
      <el-table :data="reports" style="width: 100%">
        <el-table-column prop="name" label="名称" width="200" />
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="viewReport(scope.row.id)">查看</el-button>
            <el-button size="small" type="danger" @click="deleteReport(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import { dataAgentApi } from '@/api/dataAgent';
import { chatApi } from '@/api/chat';
import type { ReportResponse } from '@/api/dataAgent';

// 当前激活的标签页
const activeTab = ref('template');

// 模板上传相关
const isDragOver = ref(false);
const parsedFocusContent = ref('');
const generatedQuestions = ref<string[]>([]);
const selectedQuestions = ref<string[]>([]);
const isGeneratingQuestions = ref(false);

// 会话相关
const chatRecords = ref<any[]>([]);
const selectedChatRecords = ref<number[]>([]);
const showChatDetailDialog = ref(false);
const selectedChatDetail = ref<any>(null);

// 报告生成相关
const isGeneratingReport = ref(false);
const generatedReport = ref<ReportResponse | null>(null);
const reports = ref<ReportResponse[]>([]);

// 处理文件拖放
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

// 处理文件
const processFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/v1/data-agent/upload-template', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    const result = await response.json();
    if (result.success) {
      parsedFocusContent.value = result.focus_content || '';
      generatedQuestions.value = [];
      selectedQuestions.value = [];
      ElMessage.success('模板上传成功');
    } else {
      ElMessage.error(result.error || '上传失败');
    }
  } catch (error) {
    ElMessage.error('上传失败');
    console.error('上传错误:', error);
  }
};

// 生成问题列表
const generateQuestions = async () => {
  if (!parsedFocusContent.value) {
    ElMessage.warning('请先上传模板');
    return;
  }
  
  isGeneratingQuestions.value = true;
  try {
    const response = await dataAgentApi.generateQuestions({
      focus_content: parsedFocusContent.value
    });
    
    if (response.success) {
      generatedQuestions.value = response.questions || [];
      selectedQuestions.value = [...generatedQuestions.value];
      ElMessage.success('问题生成成功');
    } else {
      ElMessage.error(response.error || '生成失败');
    }
  } catch (error) {
    ElMessage.error('生成失败');
    console.error('生成问题错误:', error);
  } finally {
    isGeneratingQuestions.value = false;
  }
};

// 从模板生成报告
const generateReportFromTemplate = async () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请选择问题');
    return;
  }
  
  isGeneratingReport.value = true;
  try {
    const response = await dataAgentApi.generateReportFromTemplate({
      name: `报告_${new Date().toLocaleDateString()}`,
      questions: selectedQuestions.value
    });
    
    generatedReport.value = response;
    ElMessage.success('报告生成成功');
    
    // 刷新报告列表
    await loadReports();
  } catch (error) {
    ElMessage.error('生成报告失败');
    console.error('生成报告错误:', error);
  } finally {
    isGeneratingReport.value = false;
  }
};

// 加载会话记录
const loadChatRecords = async () => {
  try {
    // 获取所有聊天会话
    const chatListResponse = await chatApi.list();
    
    const chatInfos: Array<any> = [];
    for (const chat of chatListResponse) {
      if (chat.id) {
        try {
          const chatInfo = await chatApi.get(chat.id);
          chatInfos.push(chatInfo);
        } catch (error) {
          console.error(`获取会话 ${chat.id} 详情失败:`, error);
        }
      }
    }
    
    const records: any[] = [];
    chatInfos.forEach((chatInfo: any) => {
      if (chatInfo && chatInfo.records && Array.isArray(chatInfo.records)) {
        chatInfo.records.forEach((record: any) => {
          // 只收集有问题内容的记录（排除第一条空记录）
          if (record && record.id && record.question && record.question.trim()) {
            let result = '';
            const toolType = chatInfo.chat_type === 'analysis' ? 'analysis' : 'chat';
            
            if (toolType === 'analysis') {
              // 数据分析
              const parts: string[] = [];
              if (record.analysis) {
                try {
                  const analysisObj = typeof record.analysis === 'string' ? JSON.parse(record.analysis) : record.analysis;
                  const reportContent = analysisObj.content || analysisObj.report || '';
                  if (reportContent) {
                    parts.push(`报告: ${reportContent.substring(0, 100)}${reportContent.length > 100 ? '...' : ''}`);
                  }
                } catch (e) {
                  const analysisStr = typeof record.analysis === 'string' ? record.analysis : JSON.stringify(record.analysis);
                  parts.push(`报告: ${analysisStr.substring(0, 100)}${analysisStr.length > 100 ? '...' : ''}`);
                }
              }
              result = parts.length > 0 ? parts.join(' | ') : '失败';
            } else {
              // 智能问数
              if (record.data) {
                const dataObj = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
                if (typeof dataObj === 'object' && Array.isArray(dataObj.data) && dataObj.data.length > 0) {
                  result = '查询成功';
                } else if (Array.isArray(dataObj) && dataObj.length > 0) {
                  result = '查询成功';
                }
              }
              if (!result && record.sql_answer) {
                result = record.sql_answer.substring(0, 100) + (record.sql_answer.length > 100 ? '...' : '');
              }
              if (!result && record.chart_answer) {
                result = record.chart_answer.substring(0, 100) + (record.chart_answer.length > 100 ? '...' : '');
              }
              if (!result) {
                return; // 跳过没有结果的记录
              }
            }
            
            records.push({
              id: record.id,
              chat_id: chatInfo.id,
              question: record.question,
              tool: toolType,
              datasource_name: chatInfo.datasource_name || '未知数据源',
              create_time: record.create_time,
              finish_time: record.finish_time || '',
              status: record.finish ? 'completed' : 'processing',
              result: result
            });
          }
        });
      }
    });
    
    chatRecords.value = records;
  } catch (error) {
    console.error('加载会话记录失败:', error);
  }
};

// 处理会话选择变化
const handleChatSelectionChange = (val: any[]) => {
  selectedChatRecords.value = val.map((item: any) => item.id);
};

// 查看会话详情
const viewChatDetail = (record: any) => {
  selectedChatDetail.value = record;
  showChatDetailDialog.value = true;
};

// 删除会话记录
const deleteChatRecord = (record: any) => {
  ElMessage.confirm('确定要删除这条会话记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 从列表中移除
      chatRecords.value = chatRecords.value.filter(r => r.id !== record.id);
      // 从选中列表中移除
      selectedChatRecords.value = selectedChatRecords.value.filter(id => id !== record.id);
      ElMessage.success('删除成功');
    } catch (error) {
      ElMessage.error('删除失败');
      console.error('删除会话记录错误:', error);
    }
  }).catch(() => {
    // 用户取消删除
  });
};

// 从会话生成报告
const generateReportFromChats = async () => {
  if (selectedChatRecords.value.length === 0) {
    ElMessage.warning('请选择会话');
    return;
  }
  
  isGeneratingReport.value = true;
  try {
    const response = await dataAgentApi.generateReportFromChats({
      name: `综合报告_${new Date().toLocaleDateString()}`,
      chat_record_ids: selectedChatRecords.value
    });
    
    generatedReport.value = response;
    ElMessage.success('报告生成成功');
    
    // 刷新报告列表
    await loadReports();
  } catch (error) {
    ElMessage.error('生成报告失败');
    console.error('生成报告错误:', error);
  } finally {
    isGeneratingReport.value = false;
  }
};

// 查看报告
const viewReport = async (reportId: number) => {
  try {
    const report = await dataAgentApi.getReport(reportId);
    generatedReport.value = report;
  } catch (error) {
    ElMessage.error('获取报告失败');
    console.error('获取报告错误:', error);
  }
};

// 编辑报告
const editReport = () => {
  ElMessage.info('编辑报告功能开发中');
};

// 下载报告
const downloadReport = () => {
  if (generatedReport.value && generatedReport.value.report_content) {
    const blob = new Blob([generatedReport.value.report_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.value.name || 'report'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success('报告下载成功');
  }
};

// 删除报告
const deleteReport = (_reportId: number) => {
  ElMessage.info('删除报告功能开发中');
};

// 渲染Markdown
const renderMarkdown = (content: string) => {
  return content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
};

// 加载报告列表
const loadReports = async () => {
  try {
    const response = await dataAgentApi.getReports();
    reports.value = response;
  } catch (error) {
    console.error('加载报告失败:', error);
  }
};

// 页面加载时获取数据
onMounted(async () => {
  await loadReports();
  await loadChatRecords();
});
</script>

<style scoped>
.report-container {
  padding: 20px;
}

.report-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-tabs {
  margin-left: auto;
}

/* 上传区域 */
.upload-section {
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #006633;
  background-color: #f0f9f4;
}

.upload-input {
  display: none;
}

.upload-content {
  color: #666;
}

.upload-icon {
  color: #006633;
  margin-bottom: 16px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 重点关注内容 */
.focus-content {
  margin-top: 20px;
}

.focus-card {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}

.focus-card p {
  white-space: pre-wrap;
  word-break: break-all;
}

/* 问题列表 */
.questions-section {
  margin-top: 20px;
}

.questions-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 操作按钮 */
.template-actions,
.chat-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

/* 会话列表 */
.chat-section {
  margin-bottom: 20px;
}

/* 生成的报告 */
.generated-report {
  margin-top: 30px;
  margin-bottom: 30px;
}

.report-content {
  position: relative;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.report-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.report-time {
  color: #999;
  font-size: 14px;
}

.markdown-content {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 20px;
  min-height: 200px;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 表格操作列 */
.table-operate {
  display: flex;
  align-items: center;
  
  .el-button {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
  }
}

/* 会话详情对话框 */
.dialog-section {
  margin-bottom: 20px;
  
  h3 {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
  }
}

.result-content-detail {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

/* 结果样式 */
.result-content {
  color: #606266;
}

.result-failed {
  color: #f56c6c;
}

/* Markdown样式 */
.markdown-content h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.markdown-content h2 {
  font-size: 20px;
  margin-bottom: 15px;
}

.markdown-content h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content strong {
  font-weight: bold;
}

.markdown-content br {
  margin-bottom: 10px;
}
</style>
