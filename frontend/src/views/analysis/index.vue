<template>
  <div class="analysis-container">
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>数据分析</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="analysis-tabs">
        <!-- 数据基本统计标签页 -->
        <el-tab-pane label="数据基本统计" name="basic-stats">
          <div class="basic-stats-section">
            <!-- 数据源选择 -->
            <el-divider content-position="left">数据源选择</el-divider>
            <el-form :model="dataSourceForm" label-width="80px" class="data-source-form">
              <el-form-item label="数据源">
                <el-select 
                  v-model="dataSourceForm.datasource_id" 
                  placeholder="请选择数据源"
                  @change="loadTables"
                  style="width: 100%"
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
                  @change="loadDataPreview"
                  style="width: 100%"
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
                <el-button type="primary" @click="getBasicStats" :loading="isLoadingBasicStats">
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
                    <template #default="scope">
                      {{ scope.row.null_percentage }}%
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
              
              <el-divider content-position="left">数据质量</el-divider>
              <el-card class="quality-card">
                <div class="quality-info">
                  <el-statistic title="空值总数" :value="basicStatsResult.data_quality.null_values.total_null_count" />
                  <el-statistic title="空值百分比" :value="basicStatsResult.data_quality.null_values.null_percentage" suffix="%" />
                  <el-statistic title="重复行数" :value="basicStatsResult.data_quality.duplicate_rows.total_duplicate_count" />
                  <el-statistic title="重复行百分比" :value="basicStatsResult.data_quality.duplicate_rows.duplicate_percentage" suffix="%" />
                </div>
              </el-card>
              
              <el-divider content-position="left">前5条数据</el-divider>
              <el-card class="sample-card">
                <el-table v-if="basicStatsResult.sample_data.length > 0" :data="basicStatsResult.sample_data" style="width: 100%">
                  <el-table-column v-for="(_, key) in basicStatsResult.sample_data[0]" :key="key" :prop="key" :label="key" />
                </el-table>
                <div v-else class="empty-sample">
                  无数据
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 数据分析标签页 -->
        <el-tab-pane label="数据分析" name="analysis">
          <div class="analysis-section">
            <!-- 数据源选择 -->
            <el-divider content-position="left">数据源选择</el-divider>
            <el-form :model="dataSourceForm" label-width="80px" class="data-source-form">
              <el-form-item label="数据源">
                <el-select 
                  v-model="dataSourceForm.datasource_id" 
                  placeholder="请选择数据源"
                  @change="loadTables"
                  style="width: 100%"
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
                  @change="loadDataPreview"
                  style="width: 100%"
                >
                  <el-option
                    v-for="table in tables"
                    :key="table.id"
                    :label="table.table_name"
                    :value="table.table_name"
                  />
                </el-select>
              </el-form-item>
            </el-form>
            
            <!-- 数据预览 -->
            <div v-if="dataPreview.length > 0" class="data-preview">
              <el-divider content-position="left">数据预览（前5条）</el-divider>
              <el-table :data="dataPreview" style="width: 100%">
                <el-table-column 
                  v-for="column in dataColumns" 
                  :key="column" 
                  :prop="column" 
                  :label="column" 
                />
              </el-table>
            </div>
            
            <!-- 分析类型和列选择 -->
            <el-divider content-position="left">分析类型和列选择</el-divider>
            <el-card class="analysis-type-card">
              <el-form :model="analysisForm" label-width="100px" class="analysis-form">
                <el-form-item label="分析类型">
                  <el-select v-model="analysisForm.analysis_type" placeholder="请选择分析类型" @change="handleAnalysisTypeChange" :loading="isLoadingAnalysisTypes">
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
                    :multiple="true"
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
                    {{ currentAnalysisType.required_columns === 1 ? '请选择一列' : '请选择至少两列' }}
                  </div>
                  <div v-if="filteredColumns.length === 0" class="column-hint" style="color: #f56c6c;">
                    没有符合当前分析类型要求的列
                  </div>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="generateRequirement" :loading="isGeneratingRequirement">
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
            
            <!-- 分析需求建议 -->
            <el-divider content-position="left">分析需求建议</el-divider>
            <div class="analysis-suggestions">
              <el-tag 
                v-for="(suggestion, index) in analysisSuggestions" 
                :key="index" 
                class="suggestion-tag"
                @click="useSuggestion(suggestion)"
              >
                {{ suggestion }}
              </el-tag>
            </div>
            
            <!-- 对话窗口 -->
            <el-divider content-position="left">数据分析需求</el-divider>
            <div class="chat-window">
              <div class="chat-messages">
                <div v-for="(message, index) in chatMessages" :key="index" :class="['message', message.role]">
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-role">{{ message.role === 'user' ? '用户' : '系统' }}</span>
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
                  <el-button type="primary" @click="sendMessage" :loading="isAnalyzing">
                    {{ isAnalyzing ? '分析中...' : '发送' }}
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- 分析结果展示 -->
            <div v-if="analysisResult" class="analysis-result">
              <el-divider content-position="left">分析结果展示</el-divider>
              
              <el-tabs v-model="resultTab" class="result-tabs">
                <el-tab-pane label="分析结果" name="result">
                  <el-card class="result-card">
                    <!-- 相关性分析结果表格 -->
                    <div v-if="isCorrelationAnalysis" class="correlation-result">
                      <h3>相关性矩阵</h3>
                      <el-table :data="correlationMatrixData" style="width: 100%">
                        <el-table-column prop="column" label="列名" width="120" />
                        <el-table-column 
                          v-for="col in correlationColumns" 
                          :key="col" 
                          :prop="col" 
                          :label="col"
                        >
                          <template #default="scope">
                            <span :class="getCorrelationClass(scope.row[col])">{{ scope.row[col].toFixed(4) }}</span>
                          </template>
                        </el-table-column>
                      </el-table>
                      <!-- 显示热力图 -->
                      <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.correlation_matrix" class="chart-container">
                        <img :src="parsedAnalysisResult.charts.correlation_matrix" alt="相关性矩阵热力图" style="width: 100%;" />
                      </div>
                    </div>
                    <!-- 其他分析结果 -->
                    <div v-else class="analysis-result-content">
                      <!-- 描述性统计分析结果 -->
                      <div v-if="isDescriptiveAnalysis" class="descriptive-result">
                        <h3>描述性统计结果</h3>
                        <div v-for="(stats, column) in parsedAnalysisResult.stats" :key="column" class="column-stats">
                          <h4>{{ column }}</h4>
                          <el-table :data="[stats]" style="width: 100%">
                            <el-table-column v-for="(_, key) in stats" :key="key" :prop="key" :label="formatStatKey(key.toString())" />
                          </el-table>
                          <!-- 显示图表 -->
                          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container">
                            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}统计图表`" style="width: 100%;" />
                          </div>
                        </div>
                      </div>
                      <!-- 分布分析结果 -->
                      <div v-else-if="isDistributionAnalysis" class="distribution-result">
                        <h3>分布分析结果</h3>
                        <div v-for="(dist, column) in parsedAnalysisResult.distributions" :key="column" class="column-distribution">
                          <h4>{{ column }}</h4>
                          <el-collapse>
                            <el-collapse-item title="分位数">
                              <el-table :data="[dist.quantiles]" style="width: 100%">
                                <el-table-column v-for="(_, key) in dist.quantiles" :key="key" :prop="key" :label="`${key.toString()}分位数`" />
                              </el-table>
                            </el-collapse-item>
                            <el-collapse-item title="值分布">
                              <el-table :data="Object.entries(dist.value_counts).map(([value, count]) => ({ value, count }))" style="width: 100%">
                                <el-table-column prop="value" label="值" />
                                <el-table-column prop="count" label="计数" />
                              </el-table>
                            </el-collapse-item>
                          </el-collapse>
                          <!-- 显示分布图 -->
                          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container">
                            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}分布图`" style="width: 100%;" />
                          </div>
                        </div>
                      </div>
                      <!-- 异常检测分析结果 -->
                      <div v-else-if="isAnomalyAnalysis" class="anomaly-result">
                        <h3>异常检测结果</h3>
                        <div v-for="(anomaly, column) in parsedAnalysisResult.anomalies" :key="column" class="column-anomaly">
                          <h4>{{ column }}</h4>
                          <el-card class="anomaly-info-card">
                            <div class="anomaly-stats">
                              <el-statistic title="下限值" :value="anomaly.lower_bound" :precision="2" />
                              <el-statistic title="上限值" :value="anomaly.upper_bound" :precision="2" />
                              <el-statistic title="异常值数量" :value="anomaly.outlier_count" />
                            </div>
                            <div class="anomaly-values">
                              <h5>异常值列表：</h5>
                              <div class="outlier-tags">
                                <el-tag v-for="(val, idx) in anomaly.outliers" :key="idx" type="danger" class="outlier-tag">
                                  {{ val }}
                                </el-tag>
                              </div>
                            </div>
                          </el-card>
                          <!-- 显示箱线图 -->
                          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container">
                            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}箱线图`" style="width: 100%;" />
                          </div>
                        </div>
                      </div>
                      <!-- 趋势分析结果 -->
                      <div v-else-if="isTrendAnalysis" class="trend-result">
                        <h3>趋势分析结果</h3>
                        <div v-for="(_, column) in parsedAnalysisResult.trends" :key="column" class="column-trend">
                          <h4>{{ column }}</h4>
                          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container">
                            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}趋势图`" style="width: 100%;" />
                          </div>
                        </div>
                      </div>
                      <!-- 时间序列分析结果 -->
                      <div v-else-if="isTimeSeriesAnalysis" class="time-series-result">
                        <h3>时间序列分析结果</h3>
                        <div v-for="(ts, column) in parsedAnalysisResult.time_series" :key="column" class="column-time-series">
                          <h4>{{ column }}</h4>
                          <el-card class="ts-stats-card">
                            <div class="ts-stats">
                              <el-statistic title="均值" :value="ts.mean" :precision="2" />
                              <el-statistic title="标准差" :value="ts.std" :precision="2" />
                            </div>
                          </el-card>
                          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts[column]" class="chart-container">
                            <img :src="parsedAnalysisResult.charts[column]" :alt="`${column}时间序列图`" style="width: 100%;" />
                          </div>
                        </div>
                      </div>
                      <!-- 预测分析结果 -->
                      <div v-else-if="isPredictionAnalysis" class="prediction-result">
                        <h3>预测分析结果</h3>
                        <div v-if="parsedAnalysisResult.predictions" class="prediction-info">
                          <el-card>
                            <div v-if="parsedAnalysisResult.predictions.model" class="model-info">
                              <el-descriptions :column="2" border>
                                <el-descriptions-item label="模型">{{ parsedAnalysisResult.predictions.model }}</el-descriptions-item>
                                <el-descriptions-item label="目标列">{{ parsedAnalysisResult.predictions.target_column }}</el-descriptions-item>
                                <el-descriptions-item label="特征列">{{ parsedAnalysisResult.predictions.feature_columns?.join(', ') }}</el-descriptions-item>
                                <el-descriptions-item label="均方误差">{{ parsedAnalysisResult.predictions.mse?.toFixed(4) }}</el-descriptions-item>
                                <el-descriptions-item label="R²分数" :span="2">{{ parsedAnalysisResult.predictions.r2?.toFixed(4) }}</el-descriptions-item>
                              </el-descriptions>
                            </div>
                            <div v-else-if="parsedAnalysisResult.predictions.error" class="error-message">
                              {{ parsedAnalysisResult.predictions.error }}
                            </div>
                          </el-card>
                          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.prediction" class="chart-container">
                            <img :src="parsedAnalysisResult.charts.prediction" alt="预测图表" style="width: 100%;" />
                          </div>
                        </div>
                      </div>
                      <!-- 聚类分析结果 -->
                    <div v-else-if="isClusteringAnalysis" class="clustering-result">
                        <h3>聚类分析结果</h3>
                        <div v-if="parsedAnalysisResult.clusters" class="clustering-info">
                            <el-card>
                                <div v-if="parsedAnalysisResult.clusters.model" class="model-info">
                                    <el-descriptions :column="2" border>
                                        <el-descriptions-item label="模型">{{ parsedAnalysisResult.clusters.model }}</el-descriptions-item>
                                        <el-descriptions-item label="聚类数量">{{ parsedAnalysisResult.clusters.n_clusters }}</el-descriptions-item>
                                        <el-descriptions-item label="聚类列" :span="2">{{ parsedAnalysisResult.clusters.cluster_columns?.join(', ') }}</el-descriptions-item>
                                        <el-descriptions-item label="聚类中心" :span="2">
                                            <pre style="margin: 0;">{{ JSON.stringify(parsedAnalysisResult.clusters.cluster_centers, null, 2) }}</pre>
                                        </el-descriptions-item>
                                        <el-descriptions-item label="聚类计数" :span="2">
                                            <pre style="margin: 0;">{{ JSON.stringify(parsedAnalysisResult.clusters.cluster_counts, null, 2) }}</pre>
                                        </el-descriptions-item>
                                    </el-descriptions>
                                </div>
                                <div v-else-if="parsedAnalysisResult.clusters.error" class="error-message">
                                    {{ parsedAnalysisResult.clusters.error }}
                                </div>
                            </el-card>
                            <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.clustering" class="chart-container">
                                <img :src="parsedAnalysisResult.charts.clustering" alt="聚类图表" style="width: 100%;" />
                            </div>
                        </div>
                    </div>
                      <!-- 回归分析结果 -->
                      <div v-else-if="isRegressionAnalysis" class="regression-result">
                        <h3>回归分析结果</h3>
                        <div v-if="parsedAnalysisResult.regression" class="regression-info">
                          <el-card>
                            <div v-if="parsedAnalysisResult.regression.model" class="model-info">
                              <el-descriptions :column="2" border>
                                <el-descriptions-item label="模型">{{ parsedAnalysisResult.regression.model }}</el-descriptions-item>
                                <el-descriptions-item label="目标列">{{ parsedAnalysisResult.regression.target_column }}</el-descriptions-item>
                                <el-descriptions-item label="特征列" :span="2">{{ parsedAnalysisResult.regression.feature_columns?.join(', ') }}</el-descriptions-item>
                                <el-descriptions-item label="均方误差">{{ parsedAnalysisResult.regression.mse?.toFixed(4) }}</el-descriptions-item>
                                <el-descriptions-item label="R²分数">{{ parsedAnalysisResult.regression.r2?.toFixed(4) }}</el-descriptions-item>
                              </el-descriptions>
                            </div>
                            <div v-else-if="parsedAnalysisResult.regression.error" class="error-message">
                              {{ parsedAnalysisResult.regression.error }}
                            </div>
                          </el-card>
                          <div v-if="parsedAnalysisResult.charts && parsedAnalysisResult.charts.regression" class="chart-container">
                            <img :src="parsedAnalysisResult.charts.regression" alt="回归图表" style="width: 100%;" />
                          </div>
                        </div>
                      </div>
                      <!-- 其他分析类型的结果 -->
                      <pre v-else>{{ analysisResult.result }}</pre>
                    </div>
                  </el-card>
                </el-tab-pane>
                
                <el-tab-pane label="分析报告" name="report">
                  <el-card class="report-card">
                    <div class="markdown-content" v-html="renderMarkdown(analysisResult.report || '')"></div>
                  </el-card>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 分析结果历史标签页 -->
        <el-tab-pane label="分析结果历史" name="history">
          <div class="history-section">
            <el-table :data="analysisResults" style="width: 100%">
              <el-table-column prop="name" label="名称" width="200" />
              <el-table-column prop="query" label="分析需求" width="300" />
              <el-table-column prop="create_time" label="创建时间" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                    {{ scope.row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button size="small" @click="viewAnalysisResult(scope.row)">查看</el-button>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { dataAgentApi } from '@/api/dataAgent';
import { datasourceApi } from '@/api/datasource';
import type { 
  DataAnalysisRequest, 
  DataAnalysisResponse, 
  AnalysisResultResponse,
  DataBasicStatsRequest,
  DataBasicStatsResponse,
  AnalysisTypeResponse,
  AnalysisRequirementRequest
} from '@/api/dataAgent';

// 聊天消息
const chatMessages = ref<Array<{ role: 'user' | 'system'; content: string; timestamp: string }>>([]);
const chatInput = ref('');

// 数据源表单
const dataSourceForm = reactive({
  datasource_id: null as number | null,
  table_name: ''
});

// 数据源和表列表
const datasources = ref<any[]>([]);
const tables = ref<any[]>([]);

// 数据预览
const dataPreview = ref<any[]>([]);
const dataColumns = ref<string[]>([]);

// 分析需求建议
const analysisSuggestions = ref<string[]>([
  '分析数据的基本统计信息',
  '分析数据的分布情况',
  '分析数据中的异常值',
  '分析数据的趋势变化',
  '分析数据之间的相关性',
  '分析数据的分类统计',
  '分析数据的时间序列变化',
  '分析数据的聚合统计'
]);

// 分析结果
const analysisResult = ref<DataAnalysisResponse | null>(null);
const analysisResults = ref<AnalysisResultResponse[]>([]);

// 数据基本统计结果
const basicStatsResult = ref<DataBasicStatsResponse | null>(null);

// 分析类型列表
const analysisTypes = ref<AnalysisTypeResponse[]>([]);
// 可用列列表
const availableColumns = ref<Array<{ name: string; type: string }>>([]);
// 分析表单
const analysisForm = reactive({
  analysis_type: '',
  selected_columns: [] as string[]
});
// 生成的分析需求
const generatedRequirement = ref('');

// 加载状态和Tab
const isAnalyzing = ref(false);
const activeTab = ref('basic-stats');
const resultTab = ref('result');
const isLoadingBasicStats = ref(false);
const isLoadingAnalysisTypes = ref(false);
const isGeneratingRequirement = ref(false);

// 加载数据源列表
const loadDatasources = async () => {
  try {
    const response = await datasourceApi.list();
    datasources.value = response || [];
  } catch (error) {
    console.error('加载数据源失败:', error);
    ElMessage.error('加载数据源失败');
  }
};

// 加载表列表
const loadTables = async () => {
  if (!dataSourceForm.datasource_id) {
    tables.value = [];
    dataPreview.value = [];
    dataColumns.value = [];
    return;
  }
  
  try {
    const response = await datasourceApi.tableList(dataSourceForm.datasource_id);
    tables.value = response || [];
  } catch (error) {
    console.error('加载表列表失败:', error);
    ElMessage.error('加载表列表失败');
  }
};

// 生成基于字段名称的分析建议
const generateFieldBasedSuggestions = async () => {
  if (!dataSourceForm.datasource_id || !dataSourceForm.table_name || availableColumns.value.length === 0) {
    return;
  }
  
  try {
    console.log('Generating field-based suggestions...');
    // 准备字段信息
    const fieldsInfo = availableColumns.value.map(col => ({
      name: col.name,
      type: col.type
    }));
    
    console.log('Fields info:', fieldsInfo);
    // 调用后端API生成分析建议
    const request = {
      query: '基于字段名称生成分析建议',
      data: JSON.stringify(fieldsInfo),
      datasource_id: dataSourceForm.datasource_id,
      table_name: dataSourceForm.table_name
    };
    
    console.log('Request:', request);
    const response = await dataAgentApi.analyzeData(request);
    console.log('Response:', response);
    if (response.success && response.result) {
      try {
        const suggestions = JSON.parse(response.result);
        console.log('Suggestions:', suggestions);
        if (suggestions && Array.isArray(suggestions)) {
          // 过滤掉空的建议
          const validSuggestions = suggestions.filter(suggestion => suggestion && suggestion.trim());
          // 如果有有效的建议，更新分析需求建议
          if (validSuggestions.length > 0) {
            analysisSuggestions.value = validSuggestions;
            console.log('Updated analysis suggestions:', analysisSuggestions.value);
          } else {
            // 如果没有有效的建议，使用默认建议
            console.warn('No valid suggestions generated, using default');
            analysisSuggestions.value = [
              '分析数据的基本统计信息',
              '分析数据的分布情况',
              '分析数据中的异常值',
              '分析数据的趋势变化',
              '分析数据之间的相关性'
            ];
          }
        } else {
          console.error('分析建议格式错误:', suggestions);
          // 如果格式错误，使用默认建议
          analysisSuggestions.value = [
            '分析数据的基本统计信息',
            '分析数据的分布情况',
            '分析数据中的异常值',
            '分析数据的趋势变化',
            '分析数据之间的相关性'
          ];
        }
      } catch (e) {
        console.error('解析分析建议失败:', e);
        // 如果解析失败，使用默认建议
        analysisSuggestions.value = [
          '分析数据的基本统计信息',
          '分析数据的分布情况',
          '分析数据中的异常值',
          '分析数据的趋势变化',
          '分析数据之间的相关性'
        ];
      }
    } else {
      console.error('生成分析建议失败:', response.error);
      // 如果API调用失败，使用默认建议
      analysisSuggestions.value = [
        '分析数据的基本统计信息',
        '分析数据的分布情况',
        '分析数据中的异常值',
        '分析数据的趋势变化',
        '分析数据之间的相关性'
      ];
    }
  } catch (error) {
    console.error('生成分析建议失败:', error);
    // 如果发生异常，使用默认建议
    analysisSuggestions.value = [
      '分析数据的基本统计信息',
      '分析数据的分布情况',
      '分析数据中的异常值',
      '分析数据的趋势变化',
      '分析数据之间的相关性'
    ];
  }
};

// 加载数据预览
const loadDataPreview = async () => {
  if (!dataSourceForm.datasource_id || !dataSourceForm.table_name) {
    dataPreview.value = [];
    dataColumns.value = [];
    availableColumns.value = [];
    return;
  }
  
  try {
    // 调用后端API获取数据预览
    const request = {
      query: '获取数据前5条',
      data: '',
      datasource_id: dataSourceForm.datasource_id,
      table_name: dataSourceForm.table_name
    };
    
    console.log('加载数据预览请求参数:', request);
    const response = await dataAgentApi.analyzeData(request);
    console.log('加载数据预览响应结果:', response);
    if (response.success && response.result) {
      try {
        const resultData = JSON.parse(response.result);
        console.log('解析后的数据预览:', resultData);
        if (resultData && Array.isArray(resultData)) {
          // 限制数据预览为前5条，减少前端渲染负担
          dataPreview.value = resultData.slice(0, 5);
          if (dataPreview.value.length > 0) {
            dataColumns.value = Object.keys(dataPreview.value[0]);
            console.log('数据列:', dataColumns.value);
            // 自动填充availableColumns，根据数据内容推断类型
            availableColumns.value = dataColumns.value.map(col => {
              // 尝试推断列类型
              let colType = 'string';
              // 检查前5条数据，尝试推断类型
              for (const row of dataPreview.value) {
                const value = row[col];
                if (value !== null && value !== undefined) {
                  if (typeof value === 'number') {
                    colType = 'numeric';
                    break;
                  } else if (typeof value === 'boolean') {
                    colType = 'boolean';
                    break;
                  } else if (!isNaN(Date.parse(value))) {
                    colType = 'datetime';
                    break;
                  }
                }
              }
              return {
                name: col,
                type: colType
              };
            });
            
            console.log('Available columns:', availableColumns.value);
            // 生成基于字段名称的分析建议
            await generateFieldBasedSuggestions();
          }
        }
      } catch (e) {
        console.error('解析数据预览失败:', e);
        ElMessage.error('解析数据预览失败');
      }
    } else {
      console.error('加载数据预览失败:', response.error);
      ElMessage.error('加载数据预览失败');
    }
  } catch (error) {
    console.error('加载数据预览失败:', error);
    ElMessage.error('加载数据预览失败');
  }
};

// 使用分析需求建议
const useSuggestion = (suggestion: string) => {
  chatInput.value = suggestion;
};

// 发送消息
const sendMessage = async () => {
  if (!chatInput.value.trim()) {
    ElMessage.warning('请输入分析需求');
    return;
  }
  
  if (!dataSourceForm.datasource_id) {
    ElMessage.warning('请选择数据源');
    return;
  }
  
  if (!dataSourceForm.table_name) {
    ElMessage.warning('请选择表名');
    return;
  }
  
  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: chatInput.value,
    timestamp: new Date().toLocaleString()
  });
  
  const query = chatInput.value;
  chatInput.value = '';
  
  await analyzeData(query);
};

// 执行数据分析
const analyzeData = async (query: string) => {
  isAnalyzing.value = true;
  try {
    // 准备请求数据
    let requestData = '';
    if (dataSourceForm.datasource_id && dataSourceForm.table_name) {
      // 如果有数据源和表名，不设置data参数，让后端从数据源获取
      requestData = '';
    } else {
      // 否则使用查询作为数据
      requestData = query;
    }
    
    const request: DataAnalysisRequest = {
      query: query,
      data: requestData,
      datasource_id: dataSourceForm.datasource_id ?? undefined,
      table_name: dataSourceForm.table_name,
      analysis_type: analysisForm.analysis_type || undefined,
      selected_columns: analysisForm.selected_columns.length > 0 ? analysisForm.selected_columns : undefined
    };
    
    console.log('分析请求参数:', request);
    const response = await dataAgentApi.analyzeData(request);
    console.log('分析响应结果:', response);
    analysisResult.value = response;
    
    if (response.success) {
      // 添加系统回复
      chatMessages.value.push({
        role: 'system',
        content: response.report || '分析完成',
        timestamp: new Date().toLocaleString()
      });
      
      // 刷新分析结果列表
      await loadAnalysisResults();
    } else {
      // 显示错误信息
      const errorMessage = response.error || '分析失败';
      ElMessage.error(errorMessage);
      // 添加错误回复到聊天记录
      chatMessages.value.push({
        role: 'system',
        content: `分析失败: ${errorMessage}`,
        timestamp: new Date().toLocaleString()
      });
    }
  } catch (error) {
    // 处理网络错误或其他异常
    const errorMessage = error instanceof Error ? error.message : '分析过程中出现错误';
    ElMessage.error(errorMessage);
    console.error('分析错误:', error);
    // 添加错误回复到聊天记录
    chatMessages.value.push({
      role: 'system',
      content: `分析失败: ${errorMessage}`,
      timestamp: new Date().toLocaleString()
    });
  } finally {
    // 确保无论成功还是失败，都设置isAnalyzing为false
    isAnalyzing.value = false;
    console.log('分析完成，isAnalyzing设置为false');
  }
};

// 查看分析结果
const viewAnalysisResult = (result: AnalysisResultResponse) => {
  if (result.result_summary) {
    analysisResult.value = {
      success: result.status === 'success',
      result: result.result_data || '',
      report: result.result_summary || '',
      analysis_id: result.id
    };
    
    chatMessages.value = [
      {
        role: 'user',
        content: result.query || '',
        timestamp: result.create_time
      },
      {
        role: 'system',
        content: result.result_summary || '分析完成',
        timestamp: result.create_time
      }
    ];
  }
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

// 当前选择的分析类型
const currentAnalysisType = computed(() => {
  if (!analysisForm.analysis_type) return null;
  const type = analysisTypes.value.find(type => type.id === analysisForm.analysis_type) || null;
  console.log('Current analysis type:', type);
  return type;
});

// 过滤后的可用列列表（根据分析类型的数据类型要求）
const filteredColumns = computed(() => {
  if (!currentAnalysisType.value) return availableColumns.value;
  
  const requiredTypes = currentAnalysisType.value.column_types;
  console.log('Required types:', requiredTypes);
  console.log('Available columns:', availableColumns.value);
  
  const filtered = availableColumns.value.filter(column => {
    // 映射前端列类型到后端定义的类型
    const columnType = column.type.toLowerCase();
    console.log('Checking column:', column.name, 'with type:', columnType);
    
    // 检查列类型是否符合任何一个要求的类型
    for (const requiredType of requiredTypes) {
      if (requiredType === 'numeric' && columnType === 'numeric') {
        console.log('Is numeric:', true);
        return true;
      } else if (requiredType === 'datetime' && columnType === 'datetime') {
        console.log('Is datetime:', true);
        return true;
      } else if (requiredType === 'string' && columnType === 'string') {
        console.log('Is string:', true);
        return true;
      }
    }
    
    // 如果没有找到匹配的类型，默认不允许该列
    console.log('No matching type found');
    return false;
  });
  
  console.log('Filtered columns:', filtered);
  return filtered;
});

// 加载分析类型
const loadAnalysisTypes = async () => {
  isLoadingAnalysisTypes.value = true;
  try {
    const response = await dataAgentApi.getAnalysisTypes();
    analysisTypes.value = response;
  } catch (error) {
    console.error('加载分析类型失败:', error);
  } finally {
    isLoadingAnalysisTypes.value = false;
  }
};

// 处理分析类型变化
const handleAnalysisTypeChange = () => {
  // 清空之前选择的列
  analysisForm.selected_columns = [];
};

// 获取数据基本统计信息
const getBasicStats = async () => {
  if (!dataSourceForm.datasource_id || !dataSourceForm.table_name) {
    ElMessage.warning('请选择数据源和表名');
    return;
  }
  
  isLoadingBasicStats.value = true;
  try {
    const request: DataBasicStatsRequest = {
      datasource_id: dataSourceForm.datasource_id,
      table_name: dataSourceForm.table_name
    };
    
    console.log('获取数据基本统计请求参数:', request);
    const response = await dataAgentApi.getDataBasicStats(request);
    console.log('获取数据基本统计响应结果:', response);
    if (response.success) {
      basicStatsResult.value = response;
      // 更新可用列列表
      availableColumns.value = response.columns_info.map(col => ({
        name: col.name,
        type: col.type
      }));
      console.log('更新后的可用列列表:', availableColumns.value);
      // 生成基于字段名称的分析建议
      await generateFieldBasedSuggestions();
    } else {
      const errorMessage = response.error || '获取数据统计失败';
      ElMessage.error(errorMessage);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取数据统计过程中出现错误';
    ElMessage.error(errorMessage);
    console.error('获取数据统计错误:', error);
  } finally {
    isLoadingBasicStats.value = false;
  }
};

// 生成分析需求
const generateRequirement = async () => {
  if (!analysisForm.analysis_type || analysisForm.selected_columns.length === 0) {
    ElMessage.warning('请选择分析类型和列');
    return;
  }
  
  if (currentAnalysisType.value?.required_columns === 1 && analysisForm.selected_columns.length !== 1) {
    ElMessage.warning('该分析类型需要选择一列');
    return;
  }
  
  if (currentAnalysisType.value?.required_columns === 2 && analysisForm.selected_columns.length < 2) {
    ElMessage.warning('该分析类型需要选择至少两列');
    return;
  }
  
  if (!dataSourceForm.datasource_id) {
    ElMessage.warning('请选择数据源');
    return;
  }
  
  if (!dataSourceForm.table_name) {
    ElMessage.warning('请选择表名');
    return;
  }
  
  isGeneratingRequirement.value = true;
  try {
    const request: AnalysisRequirementRequest = {
      analysis_type: analysisForm.analysis_type,
      selected_columns: analysisForm.selected_columns,
      datasource_id: dataSourceForm.datasource_id!,
      table_name: dataSourceForm.table_name
    };
    
    console.log('生成分析需求请求参数:', request);
    const response = await dataAgentApi.generateRequirement(request);
    console.log('生成分析需求响应结果:', response);
    if (response.success) {
      generatedRequirement.value = response.requirement;
    } else {
      const errorMessage = response.error || '生成分析需求失败';
      ElMessage.error(errorMessage);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '生成分析需求过程中出现错误';
    ElMessage.error(errorMessage);
    console.error('生成分析需求错误:', error);
  } finally {
    isGeneratingRequirement.value = false;
  }
};

// 使用生成的分析需求
const useGeneratedRequirement = () => {
  if (generatedRequirement.value) {
    chatInput.value = generatedRequirement.value;
  }
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

// 判断是否为相关性分析
const isCorrelationAnalysis = computed(() => {
  if (!analysisResult.value || !analysisResult.value.result) return false;
  try {
    const result = JSON.parse(analysisResult.value.result);
    return result.analysis_type === 'correlation';
  } catch (e) {
    return false;
  }
});

// 解析分析结果
const parsedAnalysisResult = computed(() => {
  if (!analysisResult.value || !analysisResult.value.result) return {};
  try {
    return JSON.parse(analysisResult.value.result);
  } catch (e) {
    return {};
  }
});

// 判断是否为描述性统计分析
const isDescriptiveAnalysis = computed(() => {
  return parsedAnalysisResult.value.analysis_type === 'descriptive';
});

// 判断是否为分布分析
const isDistributionAnalysis = computed(() => {
  return parsedAnalysisResult.value.analysis_type === 'distribution';
});

// 判断是否为异常检测分析
const isAnomalyAnalysis = computed(() => {
  return parsedAnalysisResult.value.analysis_type === 'anomaly';
});

// 判断是否为趋势分析
const isTrendAnalysis = computed(() => {
  return parsedAnalysisResult.value.analysis_type === 'trend';
});

// 判断是否为时间序列分析
const isTimeSeriesAnalysis = computed(() => {
  return parsedAnalysisResult.value.analysis_type === 'time_series';
});

// 判断是否为预测分析
const isPredictionAnalysis = computed(() => {
  return parsedAnalysisResult.value.analysis_type === 'prediction';
});

// 判断是否为聚类分析
const isClusteringAnalysis = computed(() => {
  return parsedAnalysisResult.value.analysis_type === 'clustering';
});

// 判断是否为回归分析
const isRegressionAnalysis = computed(() => {
  return parsedAnalysisResult.value.analysis_type === 'regression';
});

// 格式化统计指标的键名
const formatStatKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'count': '计数',
    'mean': '均值',
    'std': '标准差',
    'min': '最小值',
    '25%': '25%分位数',
    '50%': '中位数',
    '75%': '75%分位数',
    'max': '最大值',
    'unique': '唯一值数量',
    'top': '最常见值',
    'freq': '最常见值频率'
  };
  return keyMap[key] || key;
};

// 相关性矩阵数据
const correlationMatrixData = computed(() => {
  if (!analysisResult.value || !analysisResult.value.result) return [];
  try {
    const result = JSON.parse(analysisResult.value.result);
    if (!result.correlation_matrix) return [];
    
    const matrix = result.correlation_matrix;
    const columns = Object.keys(matrix);
    
    return columns.map(col => {
      const row: any = { column: col };
      columns.forEach(c => {
        row[c] = matrix[col][c];
      });
      return row;
    });
  } catch (e) {
    return [];
  }
});

// 相关性矩阵列名
const correlationColumns = computed(() => {
  if (!analysisResult.value || !analysisResult.value.result) return [];
  try {
    const result = JSON.parse(analysisResult.value.result);
    if (!result.correlation_matrix) return [];
    return Object.keys(result.correlation_matrix);
  } catch (e) {
    return [];
  }
});

// 根据相关系数值获取样式类
const getCorrelationClass = (value: number) => {
  if (value === 1) return 'correlation-1';
  if (value > 0.7) return 'correlation-high';
  if (value > 0.3) return 'correlation-medium';
  if (value > 0) return 'correlation-low';
  if (value > -0.3) return 'correlation-negative-low';
  if (value > -0.7) return 'correlation-negative-medium';
  return 'correlation-negative-high';
};

// 页面加载时获取数据
onMounted(async () => {
  try {
    await loadDatasources();
    await loadAnalysisTypes();
    await loadAnalysisResults();
  } catch (error) {
    console.error('页面初始化失败:', error);
  }
});
</script>

<style scoped>
.analysis-container {
  padding: 20px;
}

.analysis-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-source-form {
  margin-bottom: 30px;
}

.data-preview {
  margin-bottom: 30px;
}

.analysis-suggestions {
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.suggestion-tag {
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
}

.suggestion-tag:hover {
  background-color: #ecf5ff;
  border-color: #91d5ff;
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

.analysis-result {
  margin-top: 30px;
}

.result-tabs {
  margin-bottom: 20px;
}

.result-card,
.report-card {
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

.markdown-content {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  min-height: 200px;
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

.analysis-tabs {
  margin-top: 20px;
}

.basic-stats-section,
.analysis-section,
.history-section {
  padding: 20px;
}

.stats-info,
.quality-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.stats-card,
.columns-card,
.quality-card,
.sample-card,
.analysis-type-card {
  margin-top: 10px;
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

.result-tabs {
  margin-bottom: 20px;
}

/* 相关性分析结果样式 */
.correlation-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.correlation-1 {
  color: #409EFF;
  font-weight: bold;
}

.correlation-high {
  color: #67C23A;
  font-weight: bold;
}

.correlation-medium {
  color: #E6A23C;
}

.correlation-low {
  color: #909399;
}

.correlation-negative-low {
  color: #909399;
}

.correlation-negative-medium {
  color: #F56C6C;
}

.correlation-negative-high {
  color: #F56C6C;
  font-weight: bold;
}

/* 描述性统计分析结果样式 */
.descriptive-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.column-stats {
  margin-bottom: 30px;
}

.column-stats h4 {
  margin-bottom: 10px;
  color: #409EFF;
  font-size: 16px;
}

/* 分布分析结果样式 */
.distribution-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.column-distribution {
  margin-bottom: 30px;
}

.column-distribution h4 {
  margin-bottom: 10px;
  color: #409EFF;
  font-size: 16px;
}

/* 图表容器样式 */
.chart-container {
  margin-top: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

/* 异常检测分析结果样式 */
.anomaly-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.column-anomaly {
  margin-bottom: 30px;
}

.column-anomaly h4 {
  margin-bottom: 10px;
  color: #409EFF;
  font-size: 16px;
}

.anomaly-info-card {
  margin-bottom: 20px;
}

.anomaly-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.anomaly-values h5 {
  margin-bottom: 10px;
  color: #F56C6C;
}

.outlier-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.outlier-tag {
  margin-right: 0;
}

/* 趋势分析结果样式 */
.trend-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.column-trend {
  margin-bottom: 30px;
}

.column-trend h4 {
  margin-bottom: 10px;
  color: #409EFF;
  font-size: 16px;
}

/* 时间序列分析结果样式 */
.time-series-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.column-time-series {
  margin-bottom: 30px;
}

.column-time-series h4 {
  margin-bottom: 10px;
  color: #409EFF;
  font-size: 16px;
}

.ts-stats-card {
  margin-bottom: 20px;
}

.ts-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

/* 预测分析结果样式 */
.prediction-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.prediction-info {
  margin-bottom: 30px;
}

.model-info {
  margin-bottom: 20px;
}

.error-message {
  color: #F56C6C;
  padding: 15px;
}

/* 聚类分析结果样式 */
.clustering-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.clustering-info {
  margin-bottom: 30px;
}

/* 回归分析结果样式 */
.regression-result h3 {
  margin-bottom: 20px;
  color: #303133;
}

.regression-info {
  margin-bottom: 30px;
}

.analysis-result-content {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>
