import { request } from '@/utils/request'

/**
 * 数据分析请求参数
 */
export interface DataAnalysisRequest {
  query: string
  data: string
  requirements?: string
  name?: string
  description?: string
  tags?: string[]
  datasource_id?: number
  table_name?: string
  analysis_type?: string
  selected_columns?: string[]
}

/**
 * 数据分析响应参数
 */
export interface DataAnalysisResponse {
  success: boolean
  result?: string
  error?: string
  report?: string
  analysis_id?: number
}

/**
 * 报告生成请求参数
 */
export interface ReportGenerationRequest {
  user_query: string
  analysis_result: string
}

/**
 * 报告生成响应参数
 */
export interface ReportGenerationResponse {
  success: boolean
  report?: string
  error?: string
}

/**
 * 分析结果响应参数
 */
export interface AnalysisResultResponse {
  id: number
  oid: number
  create_time: string
  create_by: number
  name?: string
  description?: string
  tags?: string[]
  query?: string
  datasource_id?: number
  table_name?: string
  python_code?: string
  execution_time?: number
  status?: string
  error_message?: string
  result_data?: string
  result_summary?: string
}

/**
 * 分析结果列表响应参数
 */
export interface AnalysisResultList {
  total: number
  items: AnalysisResultResponse[]
}

/**
 * 报告模板响应参数
 */
export interface ReportTemplateResponse {
  id: number
  oid: number
  create_time: string
  create_by: number
  name: string
  description?: string
  template_content: string
  is_default: boolean
}

/**
 * 报告响应参数
 */
export interface ReportResponse {
  id: number
  oid: number
  create_time: string
  create_by: number
  name: string
  description?: string
  template_id?: number
  report_content?: string
  status?: string
  analysis_result_ids?: number[]
  chat_record_ids?: number[]
}

/**
 * 创建报告请求参数
 */
export interface ReportCreateRequest {
  name: string
  description?: string
  template_id?: number
  analysis_result_ids?: number[]
  chat_record_ids?: number[]
}

/**
 * 数据基本统计请求参数
 */
export interface DataBasicStatsRequest {
  datasource_id: number
  table_name: string
}

/**
 * 数据基本统计响应参数
 */
export interface DataBasicStatsResponse {
  success: boolean
  total_rows: number
  total_columns: number
  columns_info: Array<{
    name: string
    type: string
    dtype: string
    non_null_count: number
    null_count: number
    null_percentage: number
  }>
  sample_data: Array<Record<string, any>>
  data_quality: {
    total_rows: number
    total_columns: number
    null_values: {
      total_null_count: number
      null_percentage: number
    }
    duplicate_rows: {
      total_duplicate_count: number
      duplicate_percentage: number
    }
  }
  error?: string
}

/**
 * 分析类型响应参数
 */
export interface AnalysisTypeResponse {
  id: string
  name: string
  description: string
  required_columns: number
  column_types: string[]
}

/**
 * 分析需求生成请求参数
 */
export interface AnalysisRequirementRequest {
  analysis_type: string
  selected_columns: string[]
  datasource_id: number
  table_name: string
}

/**
 * 分析需求生成响应参数
 */
export interface AnalysisRequirementResponse {
  success: boolean
  requirement: string
  error?: string
}

/**
 * 数据源响应参数
 */
export interface DatasourceResponse {
  id: number
  name: string
  type: string
  host: string
  port: number
  username: string
  password: string
  database: string
  create_time: string
  create_by: number
}

/**
 * 表响应参数
 */
export interface TableResponse {
  id: number
  ds_id: number
  table_name: string
  custom_comment: string
  create_time: string
  create_by: number
}

/**
 * 数据代理API服务
 */
export const dataAgentApi = {
  /**
   * 执行数据分析
   * @param params 数据分析请求参数
   * @returns 数据分析响应
   */
  analyzeData: (params: DataAnalysisRequest) => {
    return request.post<DataAnalysisResponse>('/data-agent/analyze', params)
  },

  /**
   * 生成分析报告
   * @param params 报告生成请求参数
   * @returns 报告生成响应
   */
  generateReport: (params: ReportGenerationRequest) => {
    return request.post<ReportGenerationResponse>('/data-agent/generate-report', params)
  },

  /**
   * 获取分析结果列表
   * @param skip 跳过条数
   * @param limit 限制条数
   * @returns 分析结果列表
   */
  getAnalysisResults: (skip: number = 0, limit: number = 100) => {
    return request.get<AnalysisResultList>('/data-agent/analysis-results', {
      params: { skip, limit },
    })
  },

  /**
   * 获取分析结果详情
   * @param analysisId 分析结果ID
   * @returns 分析结果详情
   */
  getAnalysisResult: (analysisId: number) => {
    return request.get<AnalysisResultResponse>(`/data-agent/analysis-results/${analysisId}`)
  },

  /**
   * 获取报告模板列表
   * @param skip 跳过条数
   * @param limit 限制条数
   * @returns 报告模板列表
   */
  getReportTemplates: (skip: number = 0, limit: number = 100) => {
    return request.get<ReportTemplateResponse[]>('/data-agent/report-templates', {
      params: { skip, limit },
    })
  },

  /**
   * 创建报告
   * @param params 创建报告请求参数
   * @returns 报告详情
   */
  createReport: (params: ReportCreateRequest) => {
    return request.post<ReportResponse>('/data-agent/reports', params)
  },

  /**
   * 获取报告列表
   * @param skip 跳过条数
   * @param limit 限制条数
   * @returns 报告列表
   */
  getReports: (skip: number = 0, limit: number = 100) => {
    return request.get<ReportResponse[]>('/data-agent/reports', { params: { skip, limit } })
  },

  /**
   * 获取报告详情
   * @param reportId 报告ID
   * @returns 报告详情
   */
  getReport: (reportId: number) => {
    return request.get<ReportResponse>(`/data-agent/reports/${reportId}`)
  },

  /**
   * 获取数据基本统计信息
   * @param params 数据基本统计请求参数
   * @returns 数据基本统计响应
   */
  getDataBasicStats: (params: DataBasicStatsRequest) => {
    return request.post<DataBasicStatsResponse>('/data-agent/basic-stats', params)
  },

  /**
   * 获取支持的分析类型
   * @returns 分析类型列表
   */
  getAnalysisTypes: () => {
    return request.get<AnalysisTypeResponse[]>('/data-agent/analysis-types')
  },

  /**
   * 生成分析需求
   * @param params 分析需求生成请求参数
   * @returns 分析需求生成响应
   */
  generateRequirement: (params: AnalysisRequirementRequest) => {
    return request.post<AnalysisRequirementResponse>('/data-agent/generate-requirement', params)
  },

  /**
   * 获取数据源列表
   * @returns 数据源列表
   */
  getDatasources: () => {
    return request.get<DatasourceResponse[]>('/datasource/list')
  },

  /**
   * 获取数据表列表
   * @param datasourceId 数据源ID
   * @returns 数据表列表
   */
  getTables: (datasourceId: number) => {
    return request.post<TableResponse[]>(`/datasource/tableList/${datasourceId}`)
  },

  /**
   * 根据模板内容生成问题列表
   * @param params 问题生成请求参数
   * @returns 问题生成响应
   */
  generateQuestions: (params: {
    template_content?: string
    template_id?: number
    focus_content?: string
  }) => {
    return request.post<{ success: boolean; questions?: string[]; error?: string }>(
      '/data-agent/generate-questions',
      params
    )
  },

  /**
   * 从模板生成报告
   * @param params 报告生成请求参数
   * @returns 报告详情
   */
  generateReportFromTemplate: (params: {
    name: string
    template_content?: string
    template_id?: number
    questions?: string[]
    datasource_id?: number
    datasource_name?: string
    datasource_type?: string
  }) => {
    return request.post<ReportResponse>('/data-agent/generate-report-from-template', params)
  },

  /**
   * 从会话生成报告
   * @param params 报告生成请求参数
   * @returns 报告详情
   */
  generateReportFromChats: (params: { name: string; chat_record_ids: number[] }) => {
    return request.post<ReportResponse>('/data-agent/generate-report-from-chats', params)
  },
}
