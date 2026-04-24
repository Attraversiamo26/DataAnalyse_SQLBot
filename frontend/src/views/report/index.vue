<template>
  <div class="report-container">
    <el-card class="report-card">
      <template #header>
        <div class="card-header">
          <span>报告查看</span>
        </div>
      </template>
      
      <!-- 报告模板管理 -->
      <el-divider content-position="left">报告模板管理</el-divider>
      <div class="template-section">
        <el-button type="primary" @click="uploadTemplate">上传模板</el-button>
        <el-table :data="reportTemplates" style="width: 100%; margin-top: 20px">
          <el-table-column prop="name" label="模板名称" width="200" />
          <el-table-column prop="description" label="描述" width="300" />
          <el-table-column prop="create_time" label="创建时间" width="180" />
          <el-table-column prop="is_default" label="是否默认" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.is_default" type="success">是</el-tag>
              <el-tag v-else type="info">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" @click="useTemplate(scope.row.id)">使用</el-button>
              <el-button size="small" type="danger" @click="deleteTemplate(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 报告生成 -->
      <el-divider content-position="left">报告生成</el-divider>
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
        
        <el-form-item label="报告模板">
          <el-select v-model="reportForm.template_id" placeholder="请选择报告模板">
            <el-option
              v-for="template in reportTemplates"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="createReport" :loading="isGenerating">
            {{ isGenerating ? '生成中...' : '生成报告' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 生成的报告 -->
      <div v-if="generatedReport" class="generated-report">
        <el-divider content-position="left">生成的报告</el-divider>
        <el-card class="report-content">
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { dataAgentApi } from '@/api/dataAgent';
import type { 
  AnalysisResultResponse, 
  ReportResponse, 
  ReportCreateRequest,
  ReportTemplateResponse
} from '@/api/dataAgent';

// 报告生成表单
const reportForm = reactive<ReportCreateRequest>({
  name: '',
  analysis_result_ids: [],
  chat_record_ids: [],
  template_id: undefined
});

// 分析结果列表
const analysisResults = ref<AnalysisResultResponse[]>([]);
// 报告模板列表
const reportTemplates = ref<ReportTemplateResponse[]>([]);
// 报告列表
const reports = ref<ReportResponse[]>([]);
// 生成的报告
const generatedReport = ref<ReportResponse | null>(null);

// 加载状态
const isGenerating = ref(false);

// 上传模板
const uploadTemplate = () => {
  ElMessage.info('上传模板功能开发中');
};

// 使用模板
const useTemplate = (templateId: number) => {
  reportForm.template_id = templateId;
  ElMessage.success('已选择模板');
};

// 删除模板
const deleteTemplate = (_templateId: number) => {
  ElMessage.info('删除模板功能开发中');
};

// 创建报告
const createReport = async () => {
  if (!reportForm.name || (!reportForm.analysis_result_ids && !reportForm.chat_record_ids)) {
    ElMessage.warning('请输入报告名称并选择分析结果或对话记录');
    return;
  }
  
  isGenerating.value = true;
  try {
    const response = await dataAgentApi.createReport(reportForm);
    ElMessage.success('报告生成成功');
    generatedReport.value = response;
    
    // 刷新报告列表
    await loadReports();
  } catch (error) {
    ElMessage.error('报告生成过程中出现错误');
    console.error('报告生成错误:', error);
  } finally {
    isGenerating.value = false;
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
  // 简单的Markdown渲染，实际项目中可以使用专门的Markdown渲染库
  return content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\*(.*?)\*/gim, '<strong>$1</strong>')
    .replace(/\n/gim, '<br>');
};

// 加载分析结果列表
const loadAnalysisResults = async () => {
  try {
    const response = await dataAgentApi.getAnalysisResults();
    analysisResults.value = response.items;
  } catch (error) {
    console.error('加载分析结果失败:', error);
  }
};

// 加载报告模板列表
const loadReportTemplates = async () => {
  try {
    const response = await dataAgentApi.getReportTemplates();
    reportTemplates.value = response;
  } catch (error) {
    console.error('加载报告模板失败:', error);
  }
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
  await loadAnalysisResults();
  await loadReportTemplates();
  await loadReports();
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

.template-section {
  margin-bottom: 30px;
}

.report-form {
  margin-bottom: 30px;
}

.generated-report {
  margin-top: 30px;
  margin-bottom: 30px;
}

.report-content {
  position: relative;
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
