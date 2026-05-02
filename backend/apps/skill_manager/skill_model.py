from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class SkillLayer(str, Enum):
    OVERVIEW = "overview"
    STAGE = "stage"
    INSTITUTION = "institution"


class SkillLanguage(str, Enum):
    NODEJS = "nodejs"
    PYTHON = "python"


class SkillInputParam(BaseModel):
    name: str = Field(description="参数名称")
    type: str = Field(default="string", description="参数类型")
    required: bool = Field(default=True, description="是否必填")
    default: Optional[Any] = Field(default=None, description="默认值")
    description: str = Field(default="", description="参数描述")


class SkillOutputDef(BaseModel):
    name: str = Field(description="输出名称")
    type: str = Field(default="string", description="输出类型：file/array/object/string/number")
    value: str = Field(default="", description="输出值表达式")
    description: str = Field(default="", description="输出描述")


class SkillOutputFormat(BaseModel):
    name: str = Field(default="", description="输出名称")
    format: str = Field(description="输出格式")
    path: str = Field(default="", description="输出路径模板")


class SkillChainTrigger(BaseModel):
    skill_id: str = Field(description="触发的技能ID")
    condition: Optional[str] = Field(default=None, description="触发条件表达式")
    params_mapping: Dict[str, str] = Field(default_factory=dict, description="参数映射，key为目标参数名，value为来源表达式")
    trigger_type: str = Field(default="on_success", description="触发类型：on_success/on_user_confirm")


class SkillInternalStep(BaseModel):
    id: str = Field(description="步骤ID")
    name: str = Field(default="", description="步骤名称")
    description: str = Field(default="", description="步骤描述")
    script: str = Field(description="脚本文件路径，相对于技能目录")
    language: SkillLanguage = Field(default=SkillLanguage.PYTHON, description="脚本语言")
    args_template: List[str] = Field(default_factory=list, description="参数模板，支持 ${params.xxx} 和 ${steps.prev_id.output.xxx}")
    depends_on: List[str] = Field(default_factory=list, description="依赖的前置步骤ID")
    condition: Optional[str] = Field(default=None, description="执行条件表达式")
    timeout: int = Field(default=120, description="步骤超时时间（秒）")
    optional: bool = Field(default=False, description="是否可选（失败不阻断后续步骤）")
    outputs: List[SkillOutputDef] = Field(default_factory=list, description="步骤输出定义")


class SkillInfo(BaseModel):
    skill_id: str = Field(description="技能唯一标识（目录名）")
    short_id: Optional[str] = Field(default=None, description="短ID，如 line-five-stage")
    name: str = Field(description="技能名称")
    description: str = Field(default="", description="技能描述")
    layer: SkillLayer = Field(default=SkillLayer.STAGE, description="技能层级")
    language: SkillLanguage = Field(default=SkillLanguage.PYTHON, description="实现语言")
    trigger_patterns: List[str] = Field(default_factory=list, description="触发模式列表")
    input_params: List[SkillInputParam] = Field(default_factory=list, description="输入参数定义")
    output_formats: List[SkillOutputFormat] = Field(default_factory=list, description="输出文件格式定义")
    outputs: List[SkillOutputDef] = Field(default_factory=list, description="结构化输出定义")
    chain_triggers: List[SkillChainTrigger] = Field(default_factory=list, description="链式触发定义")
    data_sheets: List[str] = Field(default_factory=list, description="使用的数据Sheet")
    executable: Optional[str] = Field(default=None, description="可执行文件路径")
    skill_dir: str = Field(default="", description="技能目录路径")
    args: List[str] = Field(default_factory=list, description="默认参数")
    steps: List[SkillInternalStep] = Field(default_factory=list, description="内部工作流步骤")
    data_file: str = Field(default="../data/寄递时限对标分析指标大全.xlsx", description="数据文件路径")
    env_requirements: List[str] = Field(default_factory=list, description="环境依赖")

    class Config:
        from_attributes = True


class SkillExecutionResult(BaseModel):
    skill_id: str = Field(description="技能ID")
    success: bool = Field(description="是否成功")
    output_files: List[str] = Field(default_factory=list, description="输出文件路径列表")
    error_message: Optional[str] = Field(default=None, description="错误信息")
    execution_time: float = Field(default=0, description="执行时间（秒）")
    output: str = Field(default="", description="标准输出")
    error: str = Field(default="", description="标准错误")
    extracted_params: Dict[str, Any] = Field(default_factory=dict, description="从执行结果中提取的参数，用于链式触发")
    structured_outputs: Dict[str, Any] = Field(default_factory=dict, description="结构化输出，如 slowest_institution, key_problem_stage 等")
    pending_confirmation: Optional[Dict[str, Any]] = Field(default=None, description="等待用户确认的联动触发信息")


class IntentMatchResult(BaseModel):
    skill_id: str = Field(description="技能ID")
    confidence: float = Field(description="匹配置信度")
    reason: str = Field(default="", description="匹配原因")
    skill_info: Optional[SkillInfo] = Field(default=None, description="技能详细信息")
    extracted_params: Dict[str, Any] = Field(default_factory=dict, description="从用户查询中提取的参数")
    decision_path: str = Field(default="", description="决策路径描述")


class SkillExecutionRequest(BaseModel):
    skill_id: Optional[str] = Field(None, description="技能ID（可从URL获取）")
    params: Dict[str, Any] = Field(default_factory=dict, description="输入参数")
    timeout: int = Field(default=300, description="超时时间（秒）")


class ParallelExecutionRequest(BaseModel):
    skills: List[SkillExecutionRequest] = Field(description="并行执行的技能列表")


class WorkflowStep(BaseModel):
    id: str = Field(description="步骤ID")
    skill_id: Optional[str] = Field(default=None, description="技能ID")
    params: Dict[str, Any] = Field(default_factory=dict, description="步骤参数")
    condition: Optional[str] = Field(default=None, description="执行条件")
    depends_on: List[str] = Field(default_factory=list, description="依赖的步骤ID")
    parallel: bool = Field(default=False, description="是否并行执行子步骤")
    sub_skills: List['WorkflowStep'] = Field(default_factory=list, description="并行子步骤")


class WorkflowDefinition(BaseModel):
    workflow_id: str = Field(description="工作流ID")
    name: str = Field(default="", description="工作流名称")
    description: str = Field(default="", description="工作流描述")
    steps: List[WorkflowStep] = Field(default_factory=list, description="工作流步骤")
    params: List[SkillInputParam] = Field(default_factory=list, description="工作流输入参数")


class WorkflowExecutionRequest(BaseModel):
    workflow_id: str = Field(default="", description="内置工作流ID")
    workflow_file: Optional[str] = Field(default=None, description="自定义YAML工作流文件路径")
    params: Dict[str, Any] = Field(default_factory=dict, description="工作流参数")
    timeout: int = Field(default=600, description="总超时时间（秒）")


class WorkflowExecutionResult(BaseModel):
    workflow_id: str = Field(description="工作流ID")
    success: bool = Field(description="是否成功")
    step_results: Dict[str, SkillExecutionResult] = Field(default_factory=dict, description="各步骤执行结果")
    final_output: str = Field(default="", description="最终输出")
    execution_time: float = Field(default=0, description="总执行时间（秒）")


class DecisionTreeNode(BaseModel):
    question: str = Field(description="决策问题")
    options: Dict[str, 'DecisionTreeNode'] = Field(default_factory=dict, description="选项到子节点的映射")
    skill_id: Optional[str] = Field(default=None, description="叶节点对应的技能ID")
    description: str = Field(default="", description="节点描述")
