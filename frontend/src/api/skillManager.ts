import { request } from '@/utils/request'

/**
 * 技能信息接口
 */
export interface SkillInfo {
  skill_id: string
  short_id: string
  name: string
  description: string
  layer: string
  language: string
  trigger_patterns: string[]
  input_params: SkillInputParam[]
  output_formats: SkillOutputFormat[]
  outputs: SkillOutputDef[]
  chain_triggers: SkillChainTrigger[]
  data_sheets: string[]
  executable: string
  skill_dir: string
  steps: SkillInternalStep[]
  data_file: string
  env_requirements: string[]
}

/**
 * 技能输入参数
 */
export interface SkillInputParam {
  name: string
  type: string
  required: boolean
  default?: any
  description: string
  readonly?: boolean
}

/**
 * 技能输出格式
 */
export interface SkillOutputFormat {
  name: string
  format: string
  path: string
}

/**
 * 技能输出定义
 */
export interface SkillOutputDef {
  name: string
  type: string
  value?: string
  description?: string
}

/**
 * 技能链式触发
 */
export interface SkillChainTrigger {
  skill_id: string
  trigger_type: string
  condition?: string
  params_mapping: Record<string, string>
}

/**
 * 技能内部步骤
 */
export interface SkillInternalStep {
  id: string
  name: string
  description: string
  script: string
  language: string
  args_template: string[]
  depends_on: string[]
  condition?: string
  timeout: number
  optional: boolean
  outputs: SkillOutputDef[]
}

/**
 * 技能执行请求参数
 */
export interface SkillExecutionRequest {
  skill_id: string
  params?: Record<string, any>
  timeout?: number
}

/**
 * 技能执行结果
 */
export interface SkillExecutionResult {
  skill_id: string
  success: boolean
  output_files: string[]
  execution_time: number
  output?: string
  error?: string
  error_message?: string
  extracted_params?: Record<string, any>
  structured_outputs?: Record<string, any>
  pending_confirmation?: PendingConfirmation
}

/**
 * 待确认信息
 */
export interface PendingConfirmation {
  message: string
  trigger_skill_id: string
  params: Record<string, any>
  original_trigger: Record<string, any>
}

/**
 * 意图匹配结果
 */
export interface IntentMatchResult {
  skill_id: string
  confidence: number
  reason: string
  extracted_params?: Record<string, any>
}

/**
 * 工作流定义
 */
export interface WorkflowDefinition {
  workflow_id: string
  name: string
  description: string
  steps: WorkflowStep[]
  params: SkillInputParam[]
}

/**
 * 工作流步骤
 */
export interface WorkflowStep {
  id: string
  skill_id?: string
  params?: Record<string, any>
  condition?: string
  depends_on?: string[]
  parallel?: boolean
  sub_skills?: WorkflowStep[]
}

/**
 * 并行执行请求
 */
export interface ParallelExecutionRequest {
  skills: { skill_id: string; params?: Record<string, any>; timeout?: number }[]
}

/**
 * 工作流执行请求
 */
export interface WorkflowExecutionRequest {
  workflow_id?: string
  workflow_file?: string
  params?: Record<string, any>
  timeout?: number
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  success: boolean
  output_files?: string[]
  execution_time?: number
  output?: string
  error?: string
}

/**
 * 技能管理API服务
 */
export const skillManagerApi = {
  /**
   * 获取所有技能列表
   * @param layer 技能层级过滤（可选）
   * @returns 技能列表
   */
  getAllSkills: (layer?: string) => {
    const params = layer ? { layer } : {}
    return request.get<SkillInfo[]>('/skill-manager/skills', { params })
  },

  /**
   * 搜索技能
   * @param keyword 搜索关键词
   * @returns 匹配的技能列表
   */
  searchSkills: (keyword: string) => {
    return request.get<SkillInfo[]>('/skill-manager/skills/search', { params: { keyword } })
  },

  /**
   * 获取技能详情
   * @param skillId 技能ID
   * @returns 技能详情
   */
  getSkill: (skillId: string) => {
    return request.get<SkillInfo>(`/skill-manager/skills/${skillId}`)
  },

  /**
   * 执行技能
   * @param skillId 技能ID
   * @param params 执行参数
   * @param timeout 超时时间（可选，默认300秒）
   * @returns 执行结果
   */
  executeSkill: (skillId: string, params?: Record<string, any>, timeout?: number) => {
    const requestBody: SkillExecutionRequest = {
      skill_id: skillId,
      params,
      timeout,
    }
    return request.post<SkillExecutionResult>(
      `/skill-manager/skills/${skillId}/execute`,
      requestBody
    )
  },

  /**
   * 按步骤执行技能（工作流模式）
   * @param skillId 技能ID
   * @param params 执行参数
   * @param timeout 超时时间（可选，默认600秒）
   * @returns 执行结果
   */
  executeSkillSteps: (skillId: string, params?: Record<string, any>, timeout?: number) => {
    const requestBody: SkillExecutionRequest = {
      skill_id: skillId,
      params,
      timeout,
    }
    return request.post<SkillExecutionResult>(
      `/skill-manager/skills/${skillId}/execute-steps`,
      requestBody
    )
  },

  /**
   * 执行技能链
   * @param skillId 技能ID
   * @param params 执行参数
   * @param timeout 超时时间（可选，默认300秒）
   * @returns 执行结果列表
   */
  executeSkillChain: (skillId: string, params?: Record<string, any>, timeout?: number) => {
    const requestBody: SkillExecutionRequest = {
      skill_id: skillId,
      params,
      timeout,
    }
    return request.post<SkillExecutionResult[]>(
      `/skill-manager/skills/${skillId}/execute-chain`,
      requestBody
    )
  },

  /**
   * 确认链式触发
   * @param skillId 技能ID
   * @param confirmation 确认信息
   * @returns 执行结果
   */
  confirmChain: (skillId: string, confirmation: PendingConfirmation) => {
    return request.post<SkillExecutionResult>(
      `/skill-manager/skills/${skillId}/confirm-chain`,
      confirmation
    )
  },

  /**
   * 并行执行多个技能
   * @param requestData 并行执行请求
   * @returns 执行结果映射
   */
  executeParallel: (requestData: ParallelExecutionRequest) => {
    return request.post<Record<string, SkillExecutionResult>>(
      '/skill-manager/skills/execute-parallel',
      requestData
    )
  },

  /**
   * 解析用户意图
   * @param query 用户查询
   * @returns 匹配的技能列表
   */
  parseIntent: (query: string) => {
    return request.post<IntentMatchResult[]>('/skill-manager/intent/parse', { query })
  },

  /**
   * 获取最佳匹配技能
   * @param query 用户查询
   * @param minConfidence 最小置信度（可选，默认0.5）
   * @returns 最佳匹配结果
   */
  getBestMatch: (query: string, minConfidence?: number) => {
    return request.post<IntentMatchResult>(
      '/skill-manager/intent/best-match',
      { query },
      { params: { min_confidence: minConfidence } }
    )
  },

  /**
   * 获取决策树推荐
   * @param query 用户查询
   * @returns 推荐结果
   */
  getDecisionTree: (query: string) => {
    return request.post<Record<string, any>>('/skill-manager/intent/decision-tree', { query })
  },

  /**
   * 运行工作流
   * @param query 用户查询
   * @param params 参数（可选）
   * @param timeout 超时时间（可选，默认300秒）
   * @returns 执行结果
   */
  runWorkflow: (query: string, params?: Record<string, any>, timeout?: number) => {
    return request.post<Record<string, any>>('/skill-manager/workflow/run', {
      query,
      params,
      timeout,
    })
  },

  /**
   * 执行工作流
   * @param requestData 工作流执行请求
   * @returns 执行结果
   */
  executeWorkflow: (requestData: WorkflowExecutionRequest) => {
    return request.post<WorkflowExecutionResult>('/skill-manager/workflow/execute', requestData)
  },

  /**
   * 获取工作流列表
   * @returns 工作流列表
   */
  listWorkflows: () => {
    return request.get<WorkflowDefinition[]>('/skill-manager/workflow/list')
  },

  /**
   * 重新加载技能
   * @returns 重新加载结果
   */
  reloadSkills: () => {
    return request.post<{ message: string; count: number }>('/skill-manager/skills/reload')
  },
}
