import time
import pandas as pd
import json
import numpy as np
from fastapi import APIRouter, HTTPException, Depends, Query, File, UploadFile
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# 辅助函数：将numpy类型转换为Python原生类型
def convert_numpy_types(obj):
    import pandas as pd
    import math
    # 优先处理NaN值
    if obj is None:
        return None
    elif isinstance(obj, float) and math.isnan(obj):
        return None
    elif hasattr(obj, 'dtype') and np.issubdtype(obj.dtype, np.floating) and np.isnan(obj):
        return None
    # 处理数值类型
    elif isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif isinstance(obj, pd.Timedelta):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif hasattr(obj, 'dtype') and np.issubdtype(obj.dtype, np.integer):
        return int(obj)
    elif hasattr(obj, 'dtype') and np.issubdtype(obj.dtype, np.floating):
        return float(obj)
    else:
        return obj

from apps.data_agent.code.code_executor import CodeExecutorFactory, TaskRequest
from apps.ai_model.model_factory import LLMFactory, LLMConfig, get_default_config
from apps.data_agent.models.analysis_model import (
    AnalysisResult, AnalysisResultCreate, AnalysisResultUpdate, AnalysisResultResponse, AnalysisResultList,
    ReportTemplate, ReportTemplateCreate, ReportTemplateUpdate, ReportTemplateResponse,
    Report, ReportCreate, ReportUpdate, ReportResponse
)
from apps.data_agent.crud.analysis_result import AnalysisResultCRUD
from apps.data_agent.crud.report_template import ReportTemplateCRUD
from apps.data_agent.crud.report import ReportCRUD
from apps.data_agent.analysis import AnalysisTools
from common.core.deps import get_session, get_current_user
from apps.system.models.user import UserModel as User

# 导入数据源相关模块
from apps.datasource.models.datasource import CoreDatasource, CoreTable
from apps.db.db import get_schema, get_engine
from apps.db.engine import get_engine_conn
from apps.datasource.crud.datasource import get_table_schema

# 导入术语配置相关模块
from apps.terminology.curd.terminology import get_terminology_template

# 导入会话相关模块
from apps.chat.models.chat_model import ChatRecord, Chat, CreateChat, ChatInfo, ChatQuestion
from apps.chat.curd.chat import save_analysis_predict_record, create_chat, save_question

router = APIRouter()

# 添加datetime导入（如果还没有的话）
from datetime import datetime

def create_analysis_chat_record(db, current_user, request, result_data, report, python_code=None):
    """
    创建数据分析的会话记录
    
    参数：
        db: 数据库会话
        current_user: 当前用户
        request: 数据分析请求
        result_data: 分析结果数据
        report: 分析报告
        python_code: 分析代码（可选）
    
    返回：
        chat_id: 会话ID（如果创建成功）
    """
    try:
        # 只有提供了数据源ID才创建会话记录
        if not request.datasource_id:
            print("没有提供数据源ID，跳过会话记录创建")
            return None
        
        print(f"create_analysis_chat_record: datasource_id={request.datasource_id}, query={request.query[:30]}")
        
        chat_id = None
        
        # 检查是否已有会话ID（同一对话中的后续问题）
        if hasattr(request, 'chat_id') and request.chat_id:
            # 使用现有会话
            chat_id = request.chat_id
            print(f"使用现有会话ID: {chat_id}")
        else:
            # 创建新会话 - 使用 "analysis" 类型与智能问数区分
            create_chat_data = CreateChat(
                question=request.query,
                datasource=request.datasource_id,
                origin=0,  # 从页面直接使用
                chat_type="analysis"
            )
            chat_info = create_chat(db, current_user, create_chat_data)
            chat_id = chat_info.id
            print(f"创建新会话ID: {chat_id}")
        
        # 创建问题记录
        chat_question = ChatQuestion(
            chat_id=chat_id,
            question=request.query
        )
        base_record = save_question(db, current_user, chat_question)
        
        # 创建分析记录
        analysis_record = ChatRecord()
        analysis_record.question = base_record.question
        analysis_record.chat_id = base_record.chat_id
        analysis_record.datasource = base_record.datasource
        analysis_record.engine_type = base_record.engine_type
        analysis_record.ai_modal_id = base_record.ai_modal_id
        analysis_record.create_time = datetime.now()
        analysis_record.create_by = base_record.create_by
        analysis_record.chart = base_record.chart
        analysis_record.data = result_data
        analysis_record.analysis_record_id = base_record.id
        analysis_record.sql = python_code  # 保存分析代码
        
        # 保存分析报告
        analysis_answer = json.dumps({"content": report}, ensure_ascii=False)
        analysis_record.analysis = analysis_answer
        analysis_record.finish = True
        analysis_record.finish_time = datetime.now()
        
        # 添加到会话并提交
        db.add(analysis_record)
        db.flush()
        db.refresh(analysis_record)
        db.commit()
        
        print(f"数据分析会话记录已创建，ID: {analysis_record.id}，Chat ID: {chat_id}，Chat Type: analysis")
        return chat_id
        
    except Exception as e:
        import traceback
        print(f"创建会话记录失败: {str(e)}")
        print(f"异常堆栈: {traceback.format_exc()}")
        return None

class DataBasicStatsRequest(BaseModel):
    """数据基本统计请求"""
    datasource_id: int
    table_name: str

class DataBasicStatsResponse(BaseModel):
    """数据基本统计响应"""
    success: bool
    total_rows: int
    total_columns: int
    columns_info: List[Dict[str, Any]]
    sample_data: List[Dict[str, Any]]
    data_quality: Dict[str, Any]
    error: Optional[str] = None

class AnalysisTypeResponse(BaseModel):
    """分析类型响应"""
    id: str
    name: str
    description: str
    required_columns: int  # 1: 单列, 2: 多列, 3: 任意
    column_types: List[str]  # 支持的列类型

class AnalysisRequirementRequest(BaseModel):
    """分析需求生成请求"""
    analysis_type: str
    selected_columns: List[str]
    datasource_id: int
    table_name: str

class AnalysisRequirementResponse(BaseModel):
    """分析需求生成响应"""
    success: bool
    requirement: str
    error: Optional[str] = None

class DataAnalysisRequest(BaseModel):
    """数据分析请求"""
    query: str
    data: Optional[str] = None
    requirements: Optional[str] = ""
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    datasource_id: Optional[int] = None
    table_name: Optional[str] = None
    analysis_type: Optional[str] = None
    selected_columns: Optional[List[str]] = None
    chat_id: Optional[int] = None  # 可选的会话ID，用于同一对话中的后续问题

class DataAnalysisResponse(BaseModel):
    """数据分析响应"""
    success: bool
    result: Optional[str] = None
    error: Optional[str] = None
    report: Optional[str] = None
    analysis_id: Optional[int] = None
    chat_id: Optional[int] = None  # 会话ID，用于同一对话中的后续问题

class ReportGenerationRequest(BaseModel):
    """报告生成请求"""
    user_query: str
    analysis_result: str

class ReportGenerationResponse(BaseModel):
    """报告生成响应"""
    success: bool
    report: Optional[str] = None
    error: Optional[str] = None

class ReportCreateRequest(BaseModel):
    """创建报告请求"""
    name: str
    description: Optional[str] = None
    template_id: Optional[int] = None
    analysis_result_ids: Optional[List[int]] = None
    chat_record_ids: Optional[List[int]] = None

class TemplateUploadResponse(BaseModel):
    """模板上传响应"""
    success: bool
    template_id: Optional[int] = None
    focus_content: Optional[str] = None
    error: Optional[str] = None

class QuestionsGenerateRequest(BaseModel):
    """问题生成请求"""
    template_content: Optional[str] = None
    template_id: Optional[int] = None
    focus_content: Optional[str] = None

class QuestionsGenerateResponse(BaseModel):
    """问题生成响应"""
    success: bool
    questions: Optional[List[str]] = None
    error: Optional[str] = None

class ReportFromTemplateRequest(BaseModel):
    """从模板生成报告请求"""
    name: str
    template_content: Optional[str] = None
    template_id: Optional[int] = None
    questions: Optional[List[str]] = None
    datasource_id: Optional[int] = None

class ReportFromChatsRequest(BaseModel):
    """从会话生成报告请求"""
    name: str
    chat_record_ids: List[int]

# 定义支持的分析类型
ANALYSIS_TYPES = [
    {
        "id": "descriptive",
        "name": "描述性统计",
        "description": "计算数据的基本统计指标，如均值、中位数、标准差等",
        "required_columns": 1,
        "column_types": ["numeric"]
    },
    {
        "id": "correlation",
        "name": "相关性分析",
        "description": "分析两个或多个变量之间的相关性",
        "required_columns": 2,
        "column_types": ["numeric"]
    },
    {
        "id": "distribution",
        "name": "分布分析",
        "description": "分析数据的分布情况，包括直方图、分位数等",
        "required_columns": 1,
        "column_types": ["numeric"]
    },
    {
        "id": "trend",
        "name": "趋势分析",
        "description": "分析数据随时间的变化趋势",
        "required_columns": 2,
        "column_types": ["datetime", "numeric"]
    },
    {
        "id": "prediction",
        "name": "机器学习预测",
        "description": "使用机器学习模型对数据进行预测",
        "required_columns": 2,
        "column_types": ["numeric"]
    },
    {
        "id": "anomaly",
        "name": "异常检测",
        "description": "检测数据中的异常值",
        "required_columns": 1,
        "column_types": ["numeric"]
    },
    {
        "id": "time_series",
        "name": "时间序列分析",
        "description": "分析时间序列数据的模式和趋势",
        "required_columns": 2,
        "column_types": ["datetime", "numeric"]
    },
    {
        "id": "regression",
        "name": "回归分析",
        "description": "分析变量之间的回归关系",
        "required_columns": 2,
        "column_types": ["numeric"]
    },
    {
        "id": "clustering",
        "name": "聚类分析",
        "description": "对数据进行聚类分析，发现数据中的自然分组",
        "required_columns": 2,
        "column_types": ["numeric"]
    }
]

@router.get("/analysis-types", response_model=List[AnalysisTypeResponse])
async def get_analysis_types(
    current_user: User = Depends(get_current_user)
):
    """获取支持的分析类型"""
    return [AnalysisTypeResponse(**analysis_type) for analysis_type in ANALYSIS_TYPES]

@router.post("/generate-requirement", response_model=AnalysisRequirementResponse)
async def generate_analysis_requirement(
    request: AnalysisRequirementRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """根据选择的分析类型和列生成分析需求"""
    try:
        # 验证分析类型是否存在
        analysis_type = next((at for at in ANALYSIS_TYPES if at["id"] == request.analysis_type), None)
        if not analysis_type:
            return AnalysisRequirementResponse(
                success=False,
                requirement="",
                error="分析类型不存在"
            )
        
        # 验证列数是否符合要求
        if analysis_type["required_columns"] == 1 and len(request.selected_columns) != 1:
            return AnalysisRequirementResponse(
                success=False,
                requirement="",
                error="该分析类型需要选择一列"
            )
        elif analysis_type["required_columns"] == 2 and len(request.selected_columns) < 2:
            return AnalysisRequirementResponse(
                success=False,
                requirement="",
                error="该分析类型需要选择至少两列"
            )
        
        # 生成分析需求
        columns_str = ", ".join(request.selected_columns)
        
        # 获取表信息，添加到需求描述中
        table_info = f"{request.table_name} 表"
        
        if request.analysis_type == "descriptive":
            requirement = f"对{table_info}中的列 '{columns_str}' 进行描述性统计分析，包括均值、中位数、标准差、最小值、最大值等基本统计指标"
        elif request.analysis_type == "correlation":
            requirement = f"分析{table_info}中列 '{columns_str}' 之间的相关性，计算相关系数并生成相关性矩阵"
        elif request.analysis_type == "distribution":
            requirement = f"分析{table_info}中列 '{columns_str}' 的数据分布情况，生成直方图和分位数统计"
        elif request.analysis_type == "trend":
            if len(request.selected_columns) >= 2:
                time_column = request.selected_columns[0]
                value_column = ", ".join(request.selected_columns[1:])
                requirement = f"分析{table_info}中以 '{time_column}' 为时间轴，'{value_column}' 的时间趋势变化，生成趋势图表"
            else:
                requirement = f"分析{table_info}中列 '{columns_str}' 的时间趋势变化，生成趋势图表"
        elif request.analysis_type == "prediction":
            if len(request.selected_columns) >= 2:
                feature_columns = ", ".join(request.selected_columns[:-1])
                target_column = request.selected_columns[-1]
                requirement = f"使用机器学习模型，基于{table_info}中的 '{feature_columns}' 列预测 '{target_column}' 列的值，生成预测结果和模型评估指标"
            else:
                requirement = f"使用机器学习模型对{table_info}中的列 '{columns_str}' 进行预测分析，生成预测结果和模型评估指标"

        elif request.analysis_type == "anomaly":
            requirement = f"检测{table_info}中列 '{columns_str}' 的异常值，识别数据中的异常模式"
        elif request.analysis_type == "time_series":
            if len(request.selected_columns) >= 2:
                time_column = request.selected_columns[0]
                value_column = ", ".join(request.selected_columns[1:])
                requirement = f"对{table_info}中以 '{time_column}' 为时间轴的 '{value_column}' 列进行时间序列分析，识别趋势、季节性和周期性模式"
            else:
                requirement = f"对{table_info}中列 '{columns_str}' 进行时间序列分析，识别趋势、季节性和周期性模式"
        elif request.analysis_type == "regression":
            if len(request.selected_columns) >= 2:
                feature_columns = ", ".join(request.selected_columns[:-1])
                target_column = request.selected_columns[-1]
                requirement = f"分析{table_info}中 '{feature_columns}' 列与 '{target_column}' 列之间的回归关系，建立回归模型并评估模型性能"
            else:
                requirement = f"对{table_info}中列 '{columns_str}' 进行回归分析，建立回归模型并评估模型性能"
        elif request.analysis_type == "clustering":
            requirement = f"对{table_info}中列 '{columns_str}' 进行聚类分析，发现数据中的自然分组，评估聚类效果"
        else:
            requirement = f"对{table_info}中的列 '{columns_str}' 进行 {analysis_type['name']} 分析"
        
        return AnalysisRequirementResponse(
            success=True,
            requirement=requirement
        )
    except Exception as e:
        return AnalysisRequirementResponse(
            success=False,
            requirement="",
            error=str(e)
        )

@router.post("/basic-stats", response_model=DataBasicStatsResponse)
async def get_data_basic_stats(
    request: DataBasicStatsRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """获取数据基本统计信息"""
    try:
        # 获取数据源信息
        datasource = db.query(CoreDatasource).filter(CoreDatasource.id == request.datasource_id).first()
        if not datasource:
            raise HTTPException(status_code=404, detail="数据源不存在")
        
        # 获取数据库连接
        engine = get_engine(datasource)
        if not engine:
            raise HTTPException(status_code=500, detail="无法连接到数据源")
        
        # 获取数据库类型
        db_type = datasource.type.lower()
        table_name = request.table_name
        
        # 1. 计算总行数，使用更高效的SQL查询
        if db_type in ['mysql', 'doris', 'starrocks']:
            count_query = f"SELECT COUNT(*) FROM `{table_name}`"
        elif db_type in ['pg', 'excel', 'redshift', 'kingbase']:
            count_query = f"SELECT COUNT(*) FROM \"{table_name}\""
        elif db_type == 'sqlserver':
            count_query = f"SELECT COUNT(*) FROM [{table_name}]"
        elif db_type == 'oracle':
            count_query = f"SELECT COUNT(*) FROM \"{table_name}\""
        elif db_type == 'ck':
            count_query = f"SELECT COUNT(*) FROM \"{table_name}\""
        else:
            # 默认可用的查询
            count_query = f"SELECT COUNT(*) FROM {table_name}"
        
        # 执行计数查询
        with engine.connect() as conn:
            result = conn.execute(text(count_query))
            total_rows = result.scalar() or 0
        
        # 2. 获取前5条数据作为样例，限制查询结果以提高性能
        if db_type in ['mysql', 'doris', 'starrocks']:
            sample_query = f"SELECT * FROM `{table_name}` LIMIT 5"
        elif db_type in ['pg', 'excel', 'redshift', 'kingbase']:
            sample_query = f"SELECT * FROM \"{table_name}\" LIMIT 5"
        elif db_type == 'sqlserver':
            sample_query = f"SELECT TOP 5 * FROM [{table_name}]"
        elif db_type == 'oracle':
            sample_query = f"SELECT * FROM (SELECT * FROM \"{table_name}\") WHERE ROWNUM <= 5"
        elif db_type == 'ck':
            sample_query = f"SELECT * FROM \"{table_name}\" LIMIT 5"
        else:
            # 默认可用的查询
            sample_query = f"SELECT * FROM {table_name} LIMIT 5"
        
        # 执行样例查询
        df_sample = pd.read_sql(sample_query, engine)
        total_columns = len(df_sample.columns)
        
        # 3. 获取列信息和数据质量指标
        columns_info = []
        total_null_count = 0
        duplicate_count = 0
        
        # 对于小表（少于1000行），使用完整数据计算
        if total_rows < 1000:
            if db_type in ['mysql', 'doris', 'starrocks']:
                full_query = f"SELECT * FROM `{table_name}`"
            elif db_type in ['pg', 'excel', 'redshift', 'kingbase']:
                full_query = f"SELECT * FROM \"{table_name}\""
            elif db_type == 'sqlserver':
                full_query = f"SELECT * FROM [{table_name}]"
            elif db_type == 'oracle':
                full_query = f"SELECT * FROM \"{table_name}\""
            elif db_type == 'ck':
                full_query = f"SELECT * FROM \"{table_name}\""
            else:
                full_query = f"SELECT * FROM {table_name}"
            
            df_full = pd.read_sql(full_query, engine)
            
            for col in df_full.columns:
                dtype = str(df_full[col].dtype)
                # 尝试推断更准确的数据类型
                if pd.api.types.is_numeric_dtype(df_full[col]):
                    col_type = "numeric"
                elif pd.api.types.is_datetime64_any_dtype(df_full[col]):
                    col_type = "datetime"
                elif pd.api.types.is_bool_dtype(df_full[col]):
                    col_type = "boolean"
                else:
                    col_type = "string"
                
                # 计算非空值数量
                non_null_count = df_full[col].count()
                null_count = total_rows - non_null_count
                null_percentage = (null_count / total_rows * 100) if total_rows > 0 else 0
                total_null_count += null_count
                
                columns_info.append({
                    "name": col,
                    "type": col_type,
                    "dtype": dtype,
                    "non_null_count": non_null_count,
                    "null_count": null_count,
                    "null_percentage": round(null_percentage, 2)
                })
            
            # 计算重复行数
            duplicate_count = int(df_full.duplicated().sum())
        else:
            # 对于大表，使用样本来估算空值，使用更高效的方法计算列信息
            for col in df_sample.columns:
                dtype = str(df_sample[col].dtype)
                # 尝试推断更准确的数据类型
                if pd.api.types.is_numeric_dtype(df_sample[col]):
                    col_type = "numeric"
                elif pd.api.types.is_datetime64_any_dtype(df_sample[col]):
                    col_type = "datetime"
                elif pd.api.types.is_bool_dtype(df_sample[col]):
                    col_type = "boolean"
                else:
                    col_type = "string"
                
                # 对于大表，使用SQL查询计算每列的非空值数量
                if db_type in ['mysql', 'doris', 'starrocks']:
                    null_query = f"SELECT COUNT(*) - COUNT(`{col}`) AS null_count FROM `{table_name}`"
                elif db_type in ['pg', 'excel', 'redshift', 'kingbase']:
                    null_query = f"SELECT COUNT(*) - COUNT(\"{col}\") AS null_count FROM \"{table_name}\""
                elif db_type == 'sqlserver':
                    null_query = f"SELECT COUNT(*) - COUNT([{col}]) AS null_count FROM [{table_name}]"
                elif db_type == 'oracle':
                    null_query = f"SELECT COUNT(*) - COUNT(\"{col}\") AS null_count FROM \"{table_name}\""
                elif db_type == 'ck':
                    null_query = f"SELECT COUNT(*) - COUNT(\"{col}\") AS null_count FROM \"{table_name}\""
                else:
                    null_query = f"SELECT COUNT(*) - COUNT({col}) AS null_count FROM {table_name}"
                
                # 执行空值查询
                with engine.connect() as conn:
                    result = conn.execute(text(null_query))
                    null_count = result.scalar() or 0
                
                non_null_count = total_rows - null_count
                null_percentage = (null_count / total_rows * 100) if total_rows > 0 else 0
                total_null_count += null_count
                
                columns_info.append({
                    "name": col,
                    "type": col_type,
                    "dtype": dtype,
                    "non_null_count": non_null_count,
                    "null_count": null_count,
                    "null_percentage": round(null_percentage, 2)
                })
            
            # 对于大表，使用近似方法计算重复行数（如果数据库支持）
            if db_type in ['mysql', 'pg', 'doris', 'starrocks']:
                if db_type in ['mysql', 'doris', 'starrocks']:
                    duplicate_query = f"SELECT COUNT(*) - COUNT(DISTINCT *) FROM `{table_name}`"
                elif db_type in ['pg', 'redshift', 'kingbase']:
                    # PostgreSQL不支持COUNT(DISTINCT *)，需要列出所有列
                    columns = ", ".join([f"\"{col}\"" for col in df_sample.columns])
                    duplicate_query = f"SELECT COUNT(*) - COUNT(DISTINCT ({columns})) FROM \"{table_name}\""
                
                try:
                    with engine.connect() as conn:
                        result = conn.execute(text(duplicate_query))
                        duplicate_count = result.scalar() or 0
                except:
                    # 如果查询失败，使用样本来估算
                    duplicate_count = 0
            else:
                # 对于其他数据库，使用样本来估算
                duplicate_count = 0
        
        # 获取前5条数据作为样例
        sample_data = df_sample.head().to_dict(orient='records')
        
        # 计算数据质量指标
        data_quality = {
            "total_rows": total_rows,
            "total_columns": total_columns,
            "null_values": {
                "total_null_count": total_null_count,
                "null_percentage": round(total_null_count / (total_rows * total_columns) * 100, 2) if total_rows > 0 else 0
            },
            "duplicate_rows": {
                "total_duplicate_count": duplicate_count,
                "duplicate_percentage": round(duplicate_count / total_rows * 100, 2) if total_rows > 0 else 0
            }
        }
        
        # 转换numpy类型为Python原生类型
        total_rows = int(total_rows) if hasattr(total_rows, 'dtype') else total_rows
        total_columns = int(total_columns) if hasattr(total_columns, 'dtype') else total_columns
        
        # 转换columns_info中的numpy类型
        for col_info in columns_info:
            col_info['non_null_count'] = int(col_info['non_null_count']) if hasattr(col_info['non_null_count'], 'dtype') else col_info['non_null_count']
            col_info['null_count'] = int(col_info['null_count']) if hasattr(col_info['null_count'], 'dtype') else col_info['null_count']
            col_info['null_percentage'] = float(col_info['null_percentage']) if hasattr(col_info['null_percentage'], 'dtype') else col_info['null_percentage']
        
        # 转换sample_data中的numpy类型
        for row in sample_data:
            for key, value in row.items():
                if hasattr(value, 'dtype'):
                    if np.issubdtype(value.dtype, np.integer):
                        row[key] = int(value)
                    elif np.issubdtype(value.dtype, np.floating):
                        row[key] = float(value)
        
        # 转换data_quality中的numpy类型
        data_quality['total_rows'] = int(data_quality['total_rows']) if hasattr(data_quality['total_rows'], 'dtype') else data_quality['total_rows']
        data_quality['total_columns'] = int(data_quality['total_columns']) if hasattr(data_quality['total_columns'], 'dtype') else data_quality['total_columns']
        data_quality['null_values']['total_null_count'] = int(data_quality['null_values']['total_null_count']) if hasattr(data_quality['null_values']['total_null_count'], 'dtype') else data_quality['null_values']['total_null_count']
        data_quality['null_values']['null_percentage'] = float(data_quality['null_values']['null_percentage']) if hasattr(data_quality['null_values']['null_percentage'], 'dtype') else data_quality['null_values']['null_percentage']
        data_quality['duplicate_rows']['total_duplicate_count'] = int(data_quality['duplicate_rows']['total_duplicate_count']) if hasattr(data_quality['duplicate_rows']['total_duplicate_count'], 'dtype') else data_quality['duplicate_rows']['total_duplicate_count']
        data_quality['duplicate_rows']['duplicate_percentage'] = float(data_quality['duplicate_rows']['duplicate_percentage']) if hasattr(data_quality['duplicate_rows']['duplicate_percentage'], 'dtype') else data_quality['duplicate_rows']['duplicate_percentage']
        
        # 直接返回响应，符合Pydantic模型要求
        return DataBasicStatsResponse(
            success=True,
            total_rows=total_rows,
            total_columns=total_columns,
            columns_info=columns_info,
            sample_data=sample_data,
            data_quality=data_quality
        )
    except Exception as e:
        # 返回错误响应
        return DataBasicStatsResponse(
            success=False,
            total_rows=0,
            total_columns=0,
            columns_info=[],
            sample_data=[],
            data_quality={},
            error=str(e)
        )

@router.post("/analyze", response_model=DataAnalysisResponse)
async def analyze_data(
    request: DataAnalysisRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """执行数据分析"""
    try:
        # 记录开始时间
        start_time = time.time()
        
        # 记录分析请求的详细信息
        print(f"\n=== 接收到数据分析请求 ===")
        print(f"用户ID: {current_user.id}")
        print(f"查询内容: {request.query}")
        print(f"分析类型: {request.analysis_type}")
        print(f"选择的列: {request.selected_columns}")
        print(f"数据源ID: {request.datasource_id}")
        print(f"表名: {request.table_name}")
        print(f"分析需求: {request.requirements}")
        
        # 处理获取数据前5条的请求（不算会话，不创建会话记录）
        if request.query == "获取数据前5条" and request.datasource_id and request.table_name:
            try:
                print(f"处理获取数据前5条请求: 数据源ID={request.datasource_id}, 表名={request.table_name}")
                # 获取数据源信息
                datasource = db.query(CoreDatasource).filter(CoreDatasource.id == request.datasource_id).first()
                if not datasource:
                    raise HTTPException(status_code=404, detail="数据源不存在")
                
                # 获取数据库连接
                engine = get_engine(datasource)
                if not engine:
                    raise HTTPException(status_code=500, detail="无法连接到数据源")
                
                # 获取数据库类型
                db_type = datasource.type.lower()
                table_name = request.table_name
                
                # 获取前5条数据
                if db_type in ['mysql', 'doris', 'starrocks']:
                    sample_query = f"SELECT * FROM `{table_name}` LIMIT 5"
                elif db_type in ['pg', 'excel', 'redshift', 'kingbase']:
                    sample_query = f"SELECT * FROM \"{table_name}\" LIMIT 5"
                elif db_type == 'sqlserver':
                    sample_query = f"SELECT TOP 5 * FROM [{table_name}]"
                elif db_type == 'oracle':
                    sample_query = f"SELECT * FROM (SELECT * FROM \"{table_name}\") WHERE ROWNUM <= 5"
                elif db_type == 'ck':
                    sample_query = f"SELECT * FROM \"{table_name}\" LIMIT 5"
                else:
                    sample_query = f"SELECT * FROM {table_name} LIMIT 5"
                
                print(f"执行查询: {sample_query}")
                # 执行样例查询
                df_sample = pd.read_sql(sample_query, engine)
                print(f"查询结果: {len(df_sample)} 行")
                
                # 转换numpy类型为Python原生类型
                df_sample = df_sample.applymap(lambda x: int(x) if isinstance(x, np.integer) else x)
                df_sample = df_sample.applymap(lambda x: float(x) if isinstance(x, np.floating) else x)
                
                # 转换为JSON字符串
                result_data = df_sample.to_json(orient='records', force_ascii=False)
                
                # 生成报告
                report = "获取数据前5条成功"
                
                # 计算执行时间
                execution_time = time.time() - start_time
                print(f"获取数据前5条执行时间: {execution_time:.2f}秒")
                
                # 存储分析结果（仅存储，不创建会话记录）
                analysis_create = AnalysisResultCreate(
                    name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                    description=request.description,
                    tags=request.tags,
                    query=request.query,
                    datasource_id=request.datasource_id,
                    table_name=request.table_name,
                    python_code="获取数据前5条",
                    execution_time=execution_time,
                    status="success",
                    result_data=result_data,
                    result_summary=report
                )
                analysis_result_db = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
                print(f"分析结果已存储，ID: {analysis_result_db.id}")
                
                # 注意：获取数据前5条不算会话，不需要创建会话记录
                
                return DataAnalysisResponse(
                    success=True,
                    result=result_data,
                    report=report,
                    analysis_id=analysis_result_db.id
                )
            except Exception as e:
                print(f"获取数据前5条失败: {str(e)}")
                return DataAnalysisResponse(
                    success=False,
                    error=f"获取数据前5条失败: {str(e)}"
                )
        
        # 处理基于字段名称生成分析建议的请求（不算会话，不创建会话记录）
        if request.query == "基于字段名称生成分析建议" and request.data:
            try:
                print(f"处理基于字段名称生成分析建议的请求")
                # 解析字段信息
                fields_info = json.loads(request.data)
                print(f"字段信息: {fields_info}")
                
                # 使用大模型生成分析建议
                config = await get_default_config()
                llm = LLMFactory.create_llm(config)
                print(f"使用大模型: {type(llm).__name__}")
                
                # 构建提示词
                fields_str = "\n".join([f"- {field['name']} (类型: {field['type']})" for field in fields_info])
                prompt = f"""
# 角色: 数据分析专家

你是一位专业的数据分析专家，擅长根据数据库字段名称和类型，为用户提供有针对性的数据分析建议。

## 数据库字段信息
{fields_str}

## 任务要求
1. 请根据字段名称和类型，生成 5-10 个具体的数据分析建议
2. 建议应该包括字段之间的相关性分析、趋势分析、聚类分析、分布分析、统计分析等
3. 建议应该具体明确，适合用户直接使用
4. 只返回建议列表，不需要其他内容

## 输出格式
请以JSON数组格式输出分析建议，例如：
["分析字段A与字段B之间的相关性", "分析字段C的分布情况"]
"""
                
                # 调用大模型
                print("调用大模型生成分析建议...")
                if hasattr(llm, 'generate'):
                    result = llm.llm.invoke(prompt)
                else:
                    result = llm.llm.invoke(prompt)
                
                # 处理返回结果
                if hasattr(result, 'content'):
                    content = result.content
                elif isinstance(result, str):
                    content = result
                else:
                    content = str(result)
                print(f"大模型返回结果: {content[:100]}...")
                
                # 提取JSON部分
                import re
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                    suggestions = json.loads(json_str)
                else:
                    # 如果没有找到JSON，使用简单的硬编码建议
                    suggestions = [
                        "分析数据的基本统计信息",
                        "分析数据的分布情况",
                        "分析数据中的异常值",
                        "分析数据的趋势变化",
                        "分析数据之间的相关性"
                    ]
                print(f"生成的分析建议: {suggestions}")
                
                # 转换为JSON字符串
                result_data = json.dumps(suggestions, ensure_ascii=False)
                
                # 生成报告
                report = "基于字段名称生成的分析建议已完成"
                
                # 计算执行时间
                execution_time = time.time() - start_time
                print(f"生成分析建议执行时间: {execution_time:.2f}秒")
                
                # 存储分析结果（仅存储，不创建会话记录）
                analysis_create = AnalysisResultCreate(
                    name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                    description=request.description,
                    tags=request.tags,
                    query=request.query,
                    datasource_id=request.datasource_id,
                    table_name=request.table_name,
                    python_code="生成基于字段名称的分析建议",
                    execution_time=execution_time,
                    status="success",
                    result_data=result_data,
                    result_summary=report
                )
                analysis_result_db = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
                print(f"分析结果已存储，ID: {analysis_result_db.id}")
                
                # 注意：生成分析建议不算会话，不需要创建会话记录
                
                return DataAnalysisResponse(
                    success=True,
                    result=result_data,
                    report=report,
                    analysis_id=analysis_result_db.id
                )
            except Exception as e:
                print(f"生成分析建议失败: {str(e)}")
                return DataAnalysisResponse(
                    success=False,
                    error=f"生成分析建议失败: {str(e)}"
                )
        
        # 获取实际数据
        data = None
        if request.datasource_id and request.table_name:
            print(f"从数据源获取数据: 数据源ID={request.datasource_id}, 表名={request.table_name}")
            data = await fetch_data_from_datasource(request.datasource_id, request.table_name, db)
            print(f"获取数据成功，数据形状: {data.shape}")
        elif request.data:
            print(f"使用直接输入的数据，数据长度: {len(request.data)}字符")
            # 解析JSON数据为DataFrame
            try:
                data_list = json.loads(request.data)
                data = pd.DataFrame(data_list)
                print(f"解析数据成功，数据形状: {data.shape}")
            except json.JSONDecodeError as e:
                print(f"JSON解析失败: {str(e)}")
                raise HTTPException(status_code=400, detail=f"数据格式错误: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="请提供数据源和表名，或直接输入数据")
        
        # 检查是否使用分析工具
        if request.analysis_type and request.selected_columns:
            print(f"使用分析工具执行分析: 分析类型={request.analysis_type}, 选择的列={request.selected_columns}")
            # 验证分析类型是否支持
            supported_types = [at["id"] for at in ANALYSIS_TYPES]
            if request.analysis_type not in supported_types:
                print(f"不支持的分析类型: {request.analysis_type}")
                return DataAnalysisResponse(
                    success=False,
                    error=f"不支持的分析类型: {request.analysis_type}"
                )
            
            # 验证列数是否符合要求
            analysis_type_info = next((at for at in ANALYSIS_TYPES if at["id"] == request.analysis_type), None)
            if analysis_type_info:
                if analysis_type_info["required_columns"] == 1 and len(request.selected_columns) != 1:
                    print(f"列数不符合要求: 需要1列，实际选择了{len(request.selected_columns)}列")
                    return DataAnalysisResponse(
                        success=False,
                        error="该分析类型需要选择一列"
                    )
                elif analysis_type_info["required_columns"] == 2 and len(request.selected_columns) < 2:
                    print(f"列数不符合要求: 需要至少2列，实际选择了{len(request.selected_columns)}列")
                    return DataAnalysisResponse(
                        success=False,
                        error="该分析类型需要选择至少两列"
                    )
            
            # 验证变量传递：确保使用用户选择的列，而不是硬编码的列
            print(f"验证变量传递: 使用用户选择的列 {request.selected_columns}")
            
            # 使用分析工具执行分析
            print("调用AnalysisTools.analyze_data执行分析...")
            analysis_result = AnalysisTools.analyze_data(data, request.analysis_type, request.selected_columns)
            # 转换numpy类型为Python原生类型
            analysis_result = convert_numpy_types(analysis_result)
            result_data = json.dumps(analysis_result, ensure_ascii=False)
            print(f"分析结果: {result_data[:100]}...")
            
            # 验证分析结果格式
            print("验证分析结果格式...")
            try:
                parsed_result = json.loads(result_data)
                print(f"分析结果格式验证成功，类型: {type(parsed_result)}")
                if isinstance(parsed_result, dict):
                    print(f"分析结果包含的键: {list(parsed_result.keys())}")
            except json.JSONDecodeError as e:
                print(f"分析结果格式验证失败: {str(e)}")
            
            # 生成报告
            print("生成分析报告...")
            report = await generate_report(request.query, result_data)
            print(f"报告生成完成: {report[:100]}...")
            
            # 计算执行时间
            execution_time = time.time() - start_time
            print(f"分析执行时间: {execution_time:.2f}秒")
            
            # 存储分析结果
            analysis_create = AnalysisResultCreate(
                name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                description=request.description,
                tags=request.tags,
                query=request.query,
                datasource_id=request.datasource_id,
                table_name=request.table_name,
                python_code=f"使用分析工具: {request.analysis_type}, 列: {request.selected_columns}",
                execution_time=execution_time,
                status="success",
                result_data=result_data,
                result_summary=report
            )
            analysis_result_db = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
            print(f"分析结果已存储，ID: {analysis_result_db.id}")
            
            # 创建会话记录（用户选择列进行分析属于会话）
            python_code = f"使用分析工具: {request.analysis_type}, 列: {request.selected_columns}"
            print(f"准备创建会话记录: query={request.query[:50]}, datasource_id={request.datasource_id}, result_data_length={len(result_data)}")
            chat_id = create_analysis_chat_record(db, current_user, request, result_data, report, python_code)
            print(f"会话记录创建完成: chat_id={chat_id}")
            
            # 准备返回响应
            print("准备返回分析结果响应...")
            response = DataAnalysisResponse(
                success=True,
                result=result_data,
                report=report,
                analysis_id=analysis_result_db.id,
                chat_id=chat_id
            )
            print("分析结果响应准备完成")
            return response
        else:
            # 尝试通过大模型识别分析意图
            print("通过大模型识别分析意图...")
            analysis_type, selected_columns = await identify_analysis_intent(request.query, data, db, current_user, request.datasource_id)
            print(f"大模型识别结果: 分析类型={analysis_type}, 选择的列={selected_columns}")
            
            if analysis_type and selected_columns:
                # 验证变量传递：确保使用大模型识别的列，而不是硬编码的列
                print(f"验证变量传递: 使用大模型识别的列 {selected_columns}")
                
                # 使用分析工具执行分析
                print(f"使用分析工具执行分析: 分析类型={analysis_type}, 选择的列={selected_columns}")
                analysis_result = AnalysisTools.analyze_data(data, analysis_type, selected_columns)
                # 转换numpy类型为Python原生类型
                analysis_result = convert_numpy_types(analysis_result)
                result_data = json.dumps(analysis_result, ensure_ascii=False)
                print(f"分析结果: {result_data[:100]}...")
                
                # 生成报告
                print("生成分析报告...")
                report = await generate_report(request.query, result_data)
                print(f"报告生成完成: {report[:100]}...")
                
                # 计算执行时间
                execution_time = time.time() - start_time
                print(f"分析执行时间: {execution_time:.2f}秒")
                
                # 存储分析结果
                analysis_create = AnalysisResultCreate(
                    name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                    description=request.description,
                    tags=request.tags,
                    query=request.query,
                    datasource_id=request.datasource_id,
                    table_name=request.table_name,
                    python_code=f"使用分析工具: {analysis_type}, 列: {selected_columns}",
                    execution_time=execution_time,
                    status="success",
                    result_data=result_data,
                    result_summary=report
                )
                analysis_result_db = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
                print(f"分析结果已存储，ID: {analysis_result_db.id}")
                
                # 创建会话记录（大模型识别分析意图后的分析属于会话）
                python_code = f"使用分析工具: {analysis_type}, 列: {selected_columns}"
                print(f"准备创建会话记录: query={request.query[:50]}, datasource_id={request.datasource_id}, result_data_length={len(result_data)}")
                chat_id = create_analysis_chat_record(db, current_user, request, result_data, report, python_code)
                print(f"会话记录创建完成: chat_id={chat_id}")
                
                return DataAnalysisResponse(
                    success=True,
                    result=result_data,
                    report=report,
                    analysis_id=analysis_result_db.id,
                    chat_id=chat_id
                )
            else:
                # 使用传统的代码执行方式，生成Python代码...
                print("使用传统的代码执行方式，生成Python代码...")
                # 将DataFrame转换为JSON字符串传递给代码生成器
                data_str = data.to_json(orient='records', force_ascii=False)
                python_code = await generate_analysis_code(request.query, data_str)
                print(f"生成的Python代码: {python_code[:100]}...")
                
                # 创建任务请求
                task_request = TaskRequest(
                    code=python_code,
                    input_data=data_str,
                    requirement=request.requirements
                )
                
                # 执行代码
                print("执行Python代码...")
                executor = CodeExecutorFactory.get_executor("local", timeout=60)
                response = executor.run_task(task_request)
                
                # 计算执行时间
                execution_time = time.time() - start_time
                print(f"代码执行时间: {execution_time:.2f}秒")
                
                if response.is_success:
                    print(f"代码执行成功: {response.std_out[:100]}...")
                    # 生成报告
                    report = await generate_report(request.query, response.std_out)
                    print(f"报告生成完成: {report[:100]}...")
                    
                    # 存储分析结果
                    analysis_create = AnalysisResultCreate(
                        name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                        description=request.description,
                        tags=request.tags,
                        query=request.query,
                        datasource_id=request.datasource_id,
                        table_name=request.table_name,
                        python_code=python_code,
                        execution_time=execution_time,
                        status="success",
                        result_data=response.std_out,
                        result_summary=report
                    )
                    analysis_result = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
                    print(f"分析结果已存储，ID: {analysis_result.id}")
                    
                    # 创建会话记录（用户输入分析需求属于会话）
                    chat_id = create_analysis_chat_record(db, current_user, request, response.std_out, report, python_code)
                    
                    return DataAnalysisResponse(
                        success=True,
                        result=response.std_out,
                        report=report,
                        analysis_id=analysis_result.id,
                        chat_id=chat_id
                    )
                else:
                    print(f"代码执行失败: {response.exception_msg or response.std_err}")
                    # 存储失败的分析结果
                    analysis_create = AnalysisResultCreate(
                        name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                        description=request.description,
                        tags=request.tags,
                        query=request.query,
                        datasource_id=request.datasource_id,
                        table_name=request.table_name,
                        python_code=python_code,
                        execution_time=execution_time,
                        status="failed",
                        error_message=response.exception_msg or response.std_err
                    )
                    analysis_result = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
                    print(f"分析结果已存储，ID: {analysis_result.id}")
                    
                    return DataAnalysisResponse(
                        success=False,
                        error=response.exception_msg or response.std_err,
                        analysis_id=analysis_result.id
                    )
    except Exception as e:
        print(f"分析过程中发生错误: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def identify_analysis_intent(query: str, data: pd.DataFrame, db=None, current_user=None, datasource_id=None) -> tuple[str, list[str]]:
    """通过大模型识别分析意图"""
    try:
        print(f"\n=== 开始识别分析意图 ===")
        print(f"用户查询: {query}")
        # 从DataFrame获取列名
        if data.empty:
            print("数据为空，无法识别分析意图")
            return "", []
        
        columns = list(data.columns)
        print(f"可用列: {columns}")
        
        # 获取术语配置
        terminologies = ""
        if db and current_user and datasource_id:
            try:
                # 调用术语配置获取函数
                terminologies, term_list = get_terminology_template(db, query, current_user.oid, datasource_id)
                print(f"获取到术语配置: {term_list}")
            except Exception as e:
                print(f"获取术语配置失败: {str(e)}")
                terminologies = ""
        
        # 获取表结构和注释
        table_schema = ""
        if db and current_user and datasource_id:
            try:
                # 获取数据源信息
                datasource = db.query(CoreDatasource).filter(CoreDatasource.id == datasource_id).first()
                if datasource:
                    # 调用get_table_schema获取表结构和注释
                    table_schema = get_table_schema(db, current_user, datasource, query)
                    print(f"获取到表结构: {table_schema[:100]}...")
            except Exception as e:
                print(f"获取表结构失败: {str(e)}")
                table_schema = ""
        
        # 构建提示词，优化为更智能的分析意图识别
        prompt = f"""
        # 角色: 资深数据分析顾问
        
        你的任务是分析用户的数据分析需求，识别出最合适的分析类型和需要分析的列。
        
        ## 核心指令
        你是一位资深的数据分析专家，当用户的需求不明确时，请主动思考并推荐最合适的分析方法。
        
        ## 用户需求
        {query}
        
        ## 可用列
        {', '.join(columns)}
        
        ## 术语配置
        {terminologies if terminologies else "无"}
        
        ## 表结构和注释
        {table_schema if table_schema else "无"}
        
        ## 分析类型说明
        | 分析类型 | ID | 说明 | 所需列数 |
        |---------|-----|------|----------|
        | 描述性统计 | descriptive | 对数据的基本特征进行统计描述（均值、标准差、极值等） | 1+ |
        | 相关性分析 | correlation | 分析多个变量之间的线性相关关系，生成相关性矩阵和热力图 | 2+ |
        | 分布分析 | distribution | 分析数据的分布特征，包括分位数、直方图等 | 1+ |
        | 趋势分析 | trend | 分析数据随时间的变化趋势 | 2+（含时间列） |
        | 机器学习预测 | prediction | 使用机器学习模型进行预测分析 | 2+ |
        | 分类分析 | classification | 使用分类算法进行类别预测 | 2+ |
        | 异常检测 | anomaly | 检测数据中的异常值和离群点，生成箱线图 | 1+ |
        | 时间序列分析 | time_series | 对时间序列数据进行深入分析 | 2+（含时间列） |
        | 聚类分析 | clustering | 将数据自动分组，识别相似数据的群体 | 2+ |
        | 回归分析 | regression | 建立变量之间的回归模型，分析因果关系 | 2+ |
        
        ## 智能分析策略
        当用户需求不明确或没有完全匹配的分析类型时，请按照以下策略选择：
        
        1. **探索性分析**：如果用户只是说"分析数据"、"看看数据"等，选择 descriptive + correlation，进行多维度探索
        2. **关联性分析**：如果用户询问"关系"、"影响"、"关联"等，选择 correlation 或 regression
        3. **预测需求**：如果用户询问"预测"、"未来"、"趋势"等，选择 prediction 或 trend
        4. **分组需求**：如果用户询问"分组"、"分类"、"群体"等，选择 clustering 或 classification
        5. **异常检测**：如果用户询问"异常"、"异常值"、"离群点"等，选择 anomaly
        6. **综合分析**：如果用户需求复杂，可以选择多个分析类型的组合
        
        ## 多维度分析建议
        - 如果数据包含数值列较多，优先考虑 descriptive + correlation
        - 如果数据包含时间列，优先考虑 trend + time_series
        - 如果数据包含分类列，优先考虑 classification + clustering
        - 如果数据量较大，优先考虑 anomaly 检测数据质量
        
        ## 输出格式
        请以JSON格式输出识别结果，包含以下字段：
        - analysis_type: 识别到的分析类型（从上述分析类型ID中选择）
        - columns: 需要分析的列名列表（从可用列中选择）
        - reason: 选择该分析类型的理由（简要说明为什么选择这个分析类型）
        
        ## 注意事项
        1. 请确保识别的分析类型ID正确
        2. 请确保识别的列名在可用列列表中
        3. 请根据分析类型的要求选择适当数量的列
        4. 请返回格式正确的JSON，不要包含其他无关内容
        5. 请参考术语配置，理解用户使用的术语与列名的对应关系
        6. 请参考表结构和注释，理解列的含义和用途
        7. 如果用户需求不明确，选择最通用的分析类型（如 descriptive + correlation）
        
        ## 示例
        示例1（明确需求）:
        用户: "分析销售额和利润的相关性"
        输出: {{"analysis_type": "correlation", "columns": ["销售额", "利润"], "reason": "用户明确要求分析两个变量之间的相关性"}}
        
        示例2（模糊需求）:
        用户: "帮我分析一下这些数据"
        输出: {{"analysis_type": "descriptive", "columns": ["列1", "列2", "列3"], "reason": "用户需求不明确，选择描述性统计进行数据探索"}}
        
        示例3（预测需求）:
        用户: "预测下个月的销售额"
        输出: {{"analysis_type": "prediction", "columns": ["日期", "销售额"], "reason": "用户要求预测，选择机器学习预测分析"}}
        """
        
        # 获取默认大模型配置
        config = await get_default_config()
        llm = LLMFactory.create_llm(config)
        print(f"使用大模型: {type(llm).__name__}")
        
        # 调用大模型
        print("调用大模型识别分析意图...")
        if hasattr(llm, 'generate'):
            result = llm.llm.invoke(prompt)
        else:
            result = llm.llm.invoke(prompt)
        
        # 处理返回结果
        if hasattr(result, 'content'):
            content = result.content
        elif isinstance(result, str):
            content = result
        else:
            content = str(result)
        print(f"大模型返回结果: {content[:200]}...")
        
        # 提取JSON部分
        import re
        # 使用更强大的正则表达式提取完整的JSON对象
        json_pattern = r'\{(?:[^{}]|(?R))*\}'
        json_match = re.search(json_pattern, content)
        if json_match:
            json_str = json_match.group(0)
            print(f"提取的JSON: {json_str}")
            intent_data = json.loads(json_str)
            analysis_type = intent_data.get('analysis_type', '')
            selected_columns = intent_data.get('columns', [])
            reason = intent_data.get('reason', '')
            
            # 验证识别结果
            print(f"识别结果 - 分析类型: {analysis_type}, 选择的列: {selected_columns}")
            if reason:
                print(f"选择理由: {reason}")
            
            # 验证选择的列是否在可用列中
            valid_columns = [col for col in selected_columns if col in columns]
            if len(valid_columns) != len(selected_columns):
                invalid_columns = [col for col in selected_columns if col not in columns]
                print(f"警告: 识别到的列 {invalid_columns} 不在可用列中")
                selected_columns = valid_columns
            
            # 验证分析类型是否有效
            valid_analysis_types = ["descriptive", "correlation", "distribution", "trend", "prediction", "classification", "anomaly", "time_series", "clustering", "regression"]
            if analysis_type not in valid_analysis_types:
                print(f"警告: 识别到的分析类型 {analysis_type} 无效")
                analysis_type = ""
            
            # 验证列数是否符合分析类型的要求
            if analysis_type:
                # 根据分析类型验证列数
                if analysis_type in ["descriptive", "distribution", "anomaly"]:
                    if len(selected_columns) < 1:
                        print(f"警告: {analysis_type} 分析需要至少1列")
                        analysis_type = ""
                elif analysis_type in ["correlation", "trend", "prediction", "classification", "time_series", "clustering", "regression"]:
                    if len(selected_columns) < 2:
                        print(f"警告: {analysis_type} 分析需要至少2列")
                        analysis_type = ""
            
            # 如果验证后分析类型或列无效，使用回退策略
            if not analysis_type or (not selected_columns or len(selected_columns) == 0):
                print("验证失败，使用回退策略")
                
                # 默认选择描述性统计分析
                analysis_type = "descriptive"
                
                # 选择所有数值列（排除时间列和ID列）
                numeric_columns = []
                for col in columns:
                    if not any(keyword in col for keyword in ["时间", "日期", "id", "ID", "Id", "_id", "编号", "序号"]):
                        numeric_columns.append(col)
                
                if not numeric_columns:
                    numeric_columns = columns[:3]
                
                selected_columns = numeric_columns[:5]
                print(f"回退策略 - 分析类型: {analysis_type}, 选择的列: {selected_columns}")
            
            print(f"验证后的识别结果 - 分析类型: {analysis_type}, 选择的列: {selected_columns}")
        
        return analysis_type, selected_columns
    
    except Exception as e:
        print(f"识别分析意图失败: {str(e)}")
        
        # 添加回退策略：如果大模型识别失败，自动选择描述性统计分析和所有数值列
        print("使用回退策略")
        
        # 默认选择描述性统计分析
        analysis_type = "descriptive"
        
        # 选择所有数值列（排除时间列和ID列）
        numeric_columns = []
        for col in columns:
            # 简单判断：如果列名不包含"时间"、"日期"等关键字，且不是明显的ID列，则认为是数值列
            if not any(keyword in col for keyword in ["时间", "日期", "id", "ID", "Id", "_id", "编号", "序号"]):
                numeric_columns.append(col)
        
        # 如果没有找到数值列，选择前3列
        if not numeric_columns:
            numeric_columns = columns[:3]
        
        # 最多选择5列进行分析
        selected_columns = numeric_columns[:5]
        print(f"回退策略 - 分析类型: {analysis_type}, 选择的列: {selected_columns}")
        
        return analysis_type, selected_columns


async def fetch_data_from_datasource(datasource_id: int, table_name: str, db) -> pd.DataFrame:
    """从数据源获取数据"""
    try:
        # 获取数据源信息
        datasource = db.query(CoreDatasource).filter(CoreDatasource.id == datasource_id).first()
        if not datasource:
            raise HTTPException(status_code=404, detail="数据源不存在")
        
        # 获取数据库连接
        engine = get_engine(datasource)
        if not engine:
            raise HTTPException(status_code=500, detail="无法连接到数据源")
        
        # 获取数据库类型
        db_type = datasource.type.lower()
        
        # 查询数据，移除限制以获取全量数据
        if db_type in ['mysql', 'doris', 'starrocks']:
            query = f"SELECT * FROM `{table_name}`"
        elif db_type in ['pg', 'excel', 'redshift', 'kingbase']:
            query = f"SELECT * FROM \"{table_name}\""
        elif db_type == 'sqlserver':
            query = f"SELECT * FROM [{table_name}]"
        elif db_type == 'oracle':
            query = f"SELECT * FROM \"{table_name}\""
        elif db_type == 'ck':
            query = f"SELECT * FROM \"{table_name}\""
        else:
            # 默认可用的查询
            query = f"SELECT * FROM {table_name}"
        
        # 使用更快的方式读取数据
        df = pd.read_sql(query, engine, chunksize=1000)
        df = pd.concat(df)
        
        # 转换numpy类型为Python原生类型，使用更高效的方式
        for col in df.columns:
            if pd.api.types.is_integer_dtype(df[col]):
                df[col] = df[col].astype(int)
            elif pd.api.types.is_float_dtype(df[col]):
                df[col] = df[col].astype(float)
        
        return df
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取数据失败: {str(e)}")

@router.post("/generate-report", response_model=ReportGenerationResponse)
async def generate_report_endpoint(request: ReportGenerationRequest):
    """生成分析报告"""
    try:
        report = await generate_report(request.user_query, request.analysis_result)
        return ReportGenerationResponse(
            success=True,
            report=report
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 分析结果管理
@router.get("/analysis-results", response_model=AnalysisResultList)
async def get_analysis_results(
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """获取分析结果列表"""
    results = AnalysisResultCRUD.get_list(db, skip=skip, limit=limit, user_id=current_user.id)
    total = len(results)
    return AnalysisResultList(
        total=total,
        items=[AnalysisResultResponse.from_orm(r) for r in results]
    )

@router.get("/analysis-results/{analysis_id}", response_model=AnalysisResultResponse)
async def get_analysis_result(
    analysis_id: int,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """获取分析结果详情"""
    result = AnalysisResultCRUD.get(db, analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="分析结果不存在")
    if result.create_by != current_user.id:
        raise HTTPException(status_code=403, detail="无权访问此分析结果")
    return AnalysisResultResponse.from_orm(result)

@router.put("/analysis-results/{analysis_id}", response_model=AnalysisResultResponse)
async def update_analysis_result(
    analysis_id: int,
    update: AnalysisResultUpdate,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """更新分析结果"""
    result = AnalysisResultCRUD.get(db, analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="分析结果不存在")
    if result.create_by != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改此分析结果")
    updated = AnalysisResultCRUD.update(db, analysis_id, update)
    return AnalysisResultResponse.from_orm(updated)

@router.delete("/analysis-results/{analysis_id}")
async def delete_analysis_result(
    analysis_id: int,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """删除分析结果"""
    result = AnalysisResultCRUD.get(db, analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="分析结果不存在")
    if result.create_by != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除此分析结果")
    AnalysisResultCRUD.delete(db, analysis_id)
    return {"message": "分析结果删除成功"}

# 报告模板管理
@router.post("/report-templates", response_model=ReportTemplateResponse)
async def create_report_template(
    template: ReportTemplateCreate,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """创建报告模板"""
    created = ReportTemplateCRUD.create(db, template, current_user.id)
    return ReportTemplateResponse.from_orm(created)

@router.get("/report-templates", response_model=List[ReportTemplateResponse])
async def get_report_templates(
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """获取报告模板列表"""
    templates = ReportTemplateCRUD.get_list(db, skip=skip, limit=limit)
    return [ReportTemplateResponse.from_orm(t) for t in templates]

@router.get("/report-templates/{template_id}", response_model=ReportTemplateResponse)
async def get_report_template(
    template_id: int,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """获取报告模板详情"""
    template = ReportTemplateCRUD.get(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="报告模板不存在")
    return ReportTemplateResponse.from_orm(template)

@router.put("/report-templates/{template_id}", response_model=ReportTemplateResponse)
async def update_report_template(
    template_id: int,
    update: ReportTemplateUpdate,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """更新报告模板"""
    template = ReportTemplateCRUD.get(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="报告模板不存在")
    updated = ReportTemplateCRUD.update(db, template_id, update)
    return ReportTemplateResponse.from_orm(updated)

@router.delete("/report-templates/{template_id}")
async def delete_report_template(
    template_id: int,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """删除报告模板"""
    template = ReportTemplateCRUD.get(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="报告模板不存在")
    ReportTemplateCRUD.delete(db, template_id)
    return {"message": "报告模板删除成功"}

# 报告管理
@router.post("/reports", response_model=ReportResponse)
async def create_report(
    request: ReportCreateRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """创建报告"""
    # 验证分析结果权限
    if request.analysis_result_ids:
        for analysis_id in request.analysis_result_ids:
            analysis = AnalysisResultCRUD.get(db, analysis_id)
            if not analysis:
                raise HTTPException(status_code=404, detail=f"分析结果 {analysis_id} 不存在")
            if analysis.create_by != current_user.id:
                raise HTTPException(status_code=403, detail=f"无权访问分析结果 {analysis_id}")
    
    # 生成报告内容
    report_content = await generate_report_from_results(
        db, request.analysis_result_ids, request.chat_record_ids
    )
    
    report_create = ReportCreate(
        name=request.name,
        description=request.description,
        template_id=request.template_id,
        report_content=report_content,
        analysis_result_ids=request.analysis_result_ids,
        chat_record_ids=request.chat_record_ids
    )
    created = ReportCRUD.create(db, report_create, current_user.id)
    return ReportResponse.from_orm(created)

@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """获取报告列表"""
    reports = ReportCRUD.get_list(db, skip=skip, limit=limit, user_id=current_user.id)
    return [ReportResponse.from_orm(r) for r in reports]

@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """获取报告详情"""
    report = ReportCRUD.get(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    if report.create_by != current_user.id:
        raise HTTPException(status_code=403, detail="无权访问此报告")
    return ReportResponse.from_orm(report)

@router.put("/reports/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    update: ReportUpdate,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """更新报告"""
    report = ReportCRUD.get(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    if report.create_by != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改此报告")
    updated = ReportCRUD.update(db, report_id, update)
    return ReportResponse.from_orm(updated)

@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: int,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """删除报告"""
    report = ReportCRUD.get(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    if report.create_by != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除此报告")
    ReportCRUD.delete(db, report_id)
    return {"message": "报告删除成功"}

# 报告生成相关API
@router.post("/upload-template", response_model=TemplateUploadResponse)
async def upload_template(
    file: UploadFile = File(...),
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """上传报告模板并解析【重点关注】内容"""
    try:
        # 读取文件内容
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # 解析【重点关注】内容
        focus_content = extract_focus_content(content_str)
        
        # 保存模板
        template_create = ReportTemplateCreate(
            name=file.filename or "未命名模板",
            description="上传的报告模板",
            content=content_str,
            is_default=False
        )
        template = ReportTemplateCRUD.create(db, template_create, current_user.id)
        
        return TemplateUploadResponse(
            success=True,
            template_id=template.id,
            focus_content=focus_content
        )
    except Exception as e:
        return TemplateUploadResponse(
            success=False,
            error=str(e)
        )

def extract_focus_content(content: str) -> str:
    """提取模板中的【重点关注】内容"""
    import re
    # 匹配【重点关注】和下一个【】之间的内容
    pattern = r'【重点关注】(.*?)(?=【|$)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

@router.post("/generate-questions", response_model=QuestionsGenerateResponse)
async def generate_questions(
    request: QuestionsGenerateRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """根据模板内容生成问题列表"""
    try:
        # 获取模板内容
        content = request.template_content
        if request.template_id:
            template = ReportTemplateCRUD.get(db, request.template_id)
            if template:
                content = template.content
        
        # 获取重点关注内容
        focus_content = request.focus_content
        if not focus_content and content:
            focus_content = extract_focus_content(content)
        
        if not focus_content:
            return QuestionsGenerateResponse(
                success=False,
                error="未找到【重点关注】内容"
            )
        
        # 调用大模型生成问题列表
        config = await get_default_config()
        llm = LLMFactory.create_llm(config)
        
        prompt = f"""
# ROLE: 问题生成专家

你是一位专业的数据分析问题生成专家。请根据以下【重点关注】内容，生成一系列相关的数据分析问题。

## 重点关注内容
{focus_content}

## 任务要求
1. 根据【重点关注】内容，生成5-10个具体的数据分析问题
2. 问题应该覆盖重点关注内容的各个方面
3. 问题应该适合使用智能问数或数据分析工具来回答
4. 问题应该简洁明了

## 输出格式
请以JSON数组格式输出问题列表，例如：
["问题1", "问题2", "问题3"]
"""
        
        if hasattr(llm, 'generate'):
            result = llm.llm.invoke(prompt)
        else:
            result = llm.llm.invoke(prompt)
        
        if hasattr(result, 'content'):
            content = result.content
        elif isinstance(result, str):
            content = result
        else:
            content = str(result)
        
        # 提取JSON数组
        import re
        json_match = re.search(r'\[.*\]', content, re.DOTALL)
        if json_match:
            questions = json.loads(json_match.group(0))
        else:
            # 如果没有找到JSON，使用默认问题
            questions = [
                "分析重点关注内容中的主要数据指标",
                "分析重点关注内容中的趋势变化",
                "分析重点关注内容中的异常情况",
                "分析重点关注内容中的相关性",
                "总结重点关注内容的关键发现"
            ]
        
        return QuestionsGenerateResponse(
            success=True,
            questions=questions
        )
    except Exception as e:
        return QuestionsGenerateResponse(
            success=False,
            error=str(e)
        )

@router.post("/generate-report-from-template", response_model=ReportResponse)
async def generate_report_from_template(
    request: ReportFromTemplateRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """从模板生成报告"""
    try:
        # 获取问题列表
        questions = request.questions
        if not questions:
            # 如果没有提供问题，先生成问题
            q_request = QuestionsGenerateRequest(
                template_content=request.template_content,
                template_id=request.template_id
            )
            q_response = await generate_questions(q_request, db, current_user)
            questions = q_response.questions or []
        
        if not questions:
            raise HTTPException(status_code=400, detail="无法生成问题列表")
        
        # 执行问题并收集结果
        results = []
        for idx, question in enumerate(questions):
            print(f"执行问题 {idx+1}/{len(questions)}: {question}")
            
            # 调用智能问数API执行问题
            # 这里需要根据实际情况调用相应的工具
            try:
                # 模拟执行结果
                result = {
                    "question": question,
                    "answer": f"针对问题 '{question}' 的分析结果",
                    "data": {}
                }
                results.append(result)
            except Exception as e:
                results.append({
                    "question": question,
                    "answer": f"执行失败: {str(e)}",
                    "data": {}
                })
        
        # 生成综合报告
        report_content = await synthesize_report(request.name, questions, results)
        
        # 保存报告
        report_create = ReportCreate(
            name=request.name,
            description=f"基于模板生成的报告，包含{len(questions)}个问题",
            report_content=report_content
        )
        report = ReportCRUD.create(db, report_create, current_user.id)
        
        return ReportResponse.from_orm(report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-report-from-chats", response_model=ReportResponse)
async def generate_report_from_chats(
    request: ReportFromChatsRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """从历史会话生成报告"""
    try:
        from apps.chat.curd.chat import get_chat_with_records
        
        # 获取选中的会话记录
        chat_records = []
        for record_id in request.chat_record_ids:
            # 查询会话记录
            record = db.query(ChatRecord).filter(ChatRecord.id == record_id).first()
            if record and record.create_by == current_user.id:
                chat_records.append(record)
        
        if not chat_records:
            raise HTTPException(status_code=400, detail="未找到有效的会话记录")
        
        # 提取问题和答案
        questions = []
        results = []
        for record in chat_records:
            question = record.question
            answer = ""
            
            # 从不同字段获取答案
            if record.data:
                try:
                    data = json.loads(record.data) if isinstance(record.data, str) else record.data
                    if data:
                        answer = str(data)
                except:
                    answer = str(record.data)
            elif record.sql_answer:
                answer = record.sql_answer
            elif record.chart_answer:
                answer = record.chart_answer
            elif record.analysis:
                answer = record.analysis
            
            questions.append(question)
            results.append({
                "question": question,
                "answer": answer,
                "data": {}
            })
        
        # 生成综合报告
        report_content = await synthesize_report(request.name, questions, results)
        
        # 保存报告
        report_create = ReportCreate(
            name=request.name,
            description=f"基于{len(chat_records)}个会话生成的综合报告",
            report_content=report_content,
            chat_record_ids=request.chat_record_ids
        )
        report = ReportCRUD.create(db, report_create, current_user.id)
        
        return ReportResponse.from_orm(report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def synthesize_report(title: str, questions: list, results: list) -> str:
    """综合问题和结果生成报告"""
    try:
        config = await get_default_config()
        llm = LLMFactory.create_llm(config)
        
        # 构建问题和结果的字符串
        qr_str = ""
        for i, (q, r) in enumerate(zip(questions, results), 1):
            qr_str += f"## 问题{i}: {q}\n\n"
            qr_str += f"### 分析结果\n{r['answer']}\n\n"
        
        prompt = f"""
# ROLE: 数据分析报告撰写专家

请根据以下问题和分析结果，撰写一份专业的数据分析报告。

## 报告标题
{title}

## 问题与分析结果
{qr_str}

## 报告要求
1. 报告应该结构清晰，包含摘要、详细分析、结论和建议
2. 对每个问题的分析结果进行综合推理
3. 识别数据中的趋势、模式和异常
4. 提供有价值的洞察和建议
5. 使用markdown格式输出
6. 语言专业但易于理解

## 输出格式
只输出报告内容，不要包含其他无关内容。
"""
        
        if hasattr(llm, 'generate'):
            result = llm.llm.invoke(prompt)
        else:
            result = llm.llm.invoke(prompt)
        
        if hasattr(result, 'content'):
            report_content = result.content
        elif isinstance(result, str):
            report_content = result
        else:
            report_content = str(result)
        
        return report_content
    except Exception as e:
        # 生成默认报告
        report = f"# {title}\n\n"
        report += "## 摘要\n\n"
        report += f"本报告基于{len(questions)}个问题的分析结果生成。\n\n"
        report += "## 详细分析\n\n"
        for i, (q, r) in enumerate(zip(questions, results), 1):
            report += f"### {i}. {q}\n\n"
            report += f"{r['answer']}\n\n"
        report += "## 结论\n\n"
        report += "分析完成，请查看上述详细分析结果。\n"
        return report

async def generate_analysis_code(query: str, data: str) -> str:
    """生成分析代码"""
    try:
        # 使用大模型生成分析代码
        config = await get_default_config()
        llm = LLMFactory.create_llm(config)
        
        prompt = f"""
# ROLE: 数据分析师

你是一位专业的数据分析师，擅长根据用户的分析需求生成高质量的Python代码。

请根据以下用户需求和数据结构，生成一段Python代码，用于执行数据分析并返回结果。

## 用户需求
{query}

## 数据结构
数据是一个JSON格式的数组，每个元素是一个对象，包含以下字段：
{data[:500]}...

## 代码要求
1. 使用pandas库进行数据分析
2. 从'input.txt'文件中读取数据
3. 执行与用户需求相关的分析
4. 将分析结果转换为JSON格式并打印
5. 代码应该包含适当的错误处理
6. 代码应该简洁、高效、易读

## 输出格式
只输出Python代码，不要包含任何其他内容。
""".format(query=query, data=data)
        
        if hasattr(llm, 'generate'):
            result = llm.llm.invoke(prompt)
        else:
            result = llm.llm.invoke(prompt)
        
        if hasattr(result, 'content'):
            code = result.content
        elif isinstance(result, str):
            code = result
        else:
            code = str(result)
        
        # 提取代码部分
        if '```python' in code:
            code = code.split('```python')[1].split('```')[0]
        elif '```' in code:
            code = code.split('```')[1].split('```')[0]
        
        return code
    except Exception as e:
        # 回退到默认代码
        return """
import pandas as pd
import json

# 读取输入数据
with open('input.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)
df = pd.DataFrame(data)

# 执行分析
result = {
    'total_rows': len(df),
    'summary': df.describe().to_dict(),
    'columns': list(df.columns)
}

# 输出结果
print(json.dumps(result, ensure_ascii=False))
"""


async def generate_report(user_query: str, analysis_result: str) -> str:
    """生成分析报告"""
    try:
        # 简化分析结果，提取关键信息
        simplified_result = simplify_analysis_result(analysis_result)
        
        # 构建提示词
        prompt = f"""
# ROLE: 资深数据分析顾问

你是一位资深的数据分析顾问，擅长将复杂的数据分析结果转化为有价值的业务洞察和建议。

---

### 输入信息

**用户原始查询**
{user_query}

**分析结果详情**
{simplified_result}

---

### 输出要求

1. **结构清晰**：报告应包含以下几个部分，每部分用简洁的小标题：
   - 分析概述：简要说明本次分析的目的和方法（一句话即可）
   - 关键发现：列出最重要的2-3个发现，包含具体数值和数据特征
   - 业务建议：基于分析结果给出1-2条具体可操作的建议
   - 注意事项：指出分析的局限性或需要关注的问题

2. **内容详实**：
   - 如果是聚类分析，请分析每个簇的特征，说明各类别之间的差异和业务含义
   - 如果是相关性分析，请解释相关关系的强度（高/中/低）和业务意义
   - 如果是异常检测，请说明异常值的影响和处理建议，给出异常比例
   - 如果是预测分析，请解释预测结果的可靠性和应用场景

3. **语言要求**：
   - 使用专业但易懂的语言，避免过于技术化的术语
   - 提供具体的数值和对比，增强说服力
   - 给出可操作的建议，而不仅仅是描述事实

4. **格式要求**：
   - 标题格式：**分析概述**、**关键发现**、**业务建议**、**注意事项**（用中文顿号分隔）
   - 不要使用大号标题（不要用#或##）
   - 内容详实但精炼，总字数控制在400-500字
   - 严格基于提供的分析结果，不要虚构内容

---

请生成一份专业、有价值的数据分析报告：
"""
        
        # 获取默认大模型配置
        config = await get_default_config()
        llm = LLMFactory.create_llm(config)
        
        # 调用大模型生成报告
        if hasattr(llm, 'generate'):
            # 直接使用LangChain的invoke方法，避免generate方法返回字符串化的AIMessage
            result = llm.llm.invoke(prompt)
        else:
            # 使用LangChain的invoke方法
            result = llm.llm.invoke(prompt)
        
        # 处理不同类型的返回结果
        if hasattr(result, 'content'):
            report = result.content
        elif isinstance(result, str):
            # 如果返回的是字符串，直接使用
            report = result
        else:
            # 其他情况，转换为字符串
            report = str(result)
        
        return report
    except Exception as e:
        return f"报告生成失败: {str(e)}"

async def generate_report_from_results(db, analysis_result_ids, chat_record_ids):
    """从分析结果和对话记录生成报告"""
    # 收集分析结果
    analysis_results = []
    if analysis_result_ids:
        for analysis_id in analysis_result_ids:
            analysis = AnalysisResultCRUD.get(db, analysis_id)
            if analysis:
                analysis_results.append(analysis)
    
    # 收集对话记录
    chat_records = []
    if chat_record_ids:
        # 根据实际的对话记录存储方式进行查询
        try:
            from apps.chat.crud.chat import ChatCRUD
            for chat_id in chat_record_ids:
                # 获取聊天会话
                chat = ChatCRUD.get(db, chat_id)
                if chat:
                    # 获取聊天记录
                    records = ChatCRUD.get_records(db, chat_id)
                    if records:
                        # 取最新的记录
                        latest_record = records[-1]
                        chat_records.append({
                            'id': chat.id,
                            'name': chat.brief or f'对话_{chat.id}',
                            'query': latest_record.question,
                            'answer': latest_record.analysis or latest_record.chart_answer or latest_record.sql_answer or '无回答'
                        })
        except Exception as e:
            pass
    
    # 构建报告内容
    report_parts = []
    report_parts.append("# 数据分析报告")
    report_parts.append(f"生成时间: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if analysis_results:
        report_parts.append("\n## 分析结果")
        for i, analysis in enumerate(analysis_results, 1):
            report_parts.append(f"\n### 分析 {i}: {analysis.name or f'分析_{analysis.id}'}")
            report_parts.append(f"**分析需求**: {analysis.query}")
            report_parts.append(f"**分析结果**: {analysis.result_summary}")
    
    if chat_records:
        report_parts.append("\n## 智能问数结果")
        for i, chat in enumerate(chat_records, 1):
            chat_name = chat.get('name', f'对话_{chat.get("id", i)}')
            chat_query = chat.get('query', '无问题')
            chat_answer = chat.get('answer', '无回答')
            report_parts.append(f"\n### 对话 {i}: {chat_name}")
            report_parts.append(f"**问题**: {chat_query}")
            if len(chat_answer) > 500:
                report_parts.append(f"**回答**: {chat_answer[:500]}...")
            else:
                report_parts.append(f"**回答**: {chat_answer}")
    
    # 使用大模型生成专业的总结
    try:
        # 构建对话记录摘要
        chat_summaries = []
        for i, chat in enumerate(chat_records, 1):
            chat_name = chat.get('name', f'对话_{chat.get("id", i)}')
            chat_query = chat.get('query', '无问题')
            chat_summaries.append(f"- {chat_name}: {chat_query[:200]}...")
        
        summary_prompt = f"""
# ROLE: 数据分析报告专家

请根据以下分析结果和对话记录，生成一份专业的数据分析报告总结。

## 分析结果
{chr(10).join([f"- {analysis.name}: {analysis.result_summary[:200]}..." for analysis in analysis_results]) if analysis_results else "无"}

## 对话记录
{chr(10).join(chat_summaries) if chat_summaries else "无"}

## 总结要求
1. 语言专业、客观、准确
2. 突出关键发现和洞察
3. 提供数据支持的结论
4. 给出合理的建议
5. 保持在500字左右
"""


        
        config = await get_default_config()
        llm = LLMFactory.create_llm(config)
        summary_result = llm.llm.invoke(summary_prompt)
        
        if hasattr(summary_result, 'content'):
            summary = summary_result.content
        elif isinstance(summary_result, str):
            summary = summary_result
        else:
            summary = str(summary_result)
        
        report_parts.append("\n## 总结")
        report_parts.append(summary)
    except Exception as e:
        report_parts.append("\n## 总结")
        report_parts.append("本报告基于系统分析结果自动生成。")
    
    return '\n'.join(report_parts)


def simplify_analysis_result(analysis_result: str) -> str:
    """简化分析结果，提取关键信息"""
    try:
        import json
        # 尝试解析JSON
        result = json.loads(analysis_result)
        # 构建简化的结果描述
        simplified = []
        
        # 添加分析类型
        if 'analysis_type' in result:
            simplified.append(f"分析类型: {result['analysis_type']}")
        
        # 添加列信息
        if 'columns' in result:
            simplified.append(f"分析列: {', '.join(result['columns'])}")
        
        # 添加描述性统计信息
        if 'stats' in result:
            stats = result['stats']
            for column, column_stats in stats.items():
                if isinstance(column_stats, dict):
                    simplified.append(f"\n{column}的统计信息:")
                    if 'mean' in column_stats:
                        simplified.append(f"  平均值: {column_stats['mean']:.2f}")
                    if 'std' in column_stats:
                        simplified.append(f"  标准差: {column_stats['std']:.2f}")
                    if 'min' in column_stats:
                        simplified.append(f"  最小值: {column_stats['min']}")
                    if 'max' in column_stats:
                        simplified.append(f"  最大值: {column_stats['max']}")
                    if 'count' in column_stats:
                        simplified.append(f"  计数: {column_stats['count']}")
                    if 'unique' in column_stats:
                        simplified.append(f"  唯一值: {column_stats['unique']}")
        
        # 添加相关性分析信息 - 改进版，显示具体的相关性数值
        if 'correlation_matrix' in result:
            simplified.append("\n相关性矩阵:")
            corr_matrix = result['correlation_matrix']
            columns = list(corr_matrix.keys())
            if columns:
                simplified.append(f"  分析列: {', '.join(columns)}")
                # 显示每对列的相关性
                for i, col1 in enumerate(columns):
                    for col2 in columns[i+1:]:  # 避免重复显示
                        try:
                            # 不同的字典结构可能会有不同的获取方式
                            if isinstance(corr_matrix, dict) and col1 in corr_matrix and isinstance(corr_matrix[col1], dict):
                                if col2 in corr_matrix[col1]:
                                    corr_value = corr_matrix[col1][col2]
                                    if not pd.isna(corr_value):
                                        strength = "强正相关" if corr_value > 0.7 else ("中等正相关" if corr_value > 0.3 else ("弱正相关" if corr_value > 0 else "无相关"))
                                        if corr_value < 0:
                                            strength = "强负相关" if corr_value < -0.7 else ("中等负相关" if corr_value < -0.3 else "弱负相关")
                                        simplified.append(f"  {col1} 与 {col2}: {corr_value:.3f} ({strength})")
                        except Exception as e:
                            continue  # 跳过有问题的相关性计算
        
        # 添加分布分析信息
        if 'distributions' in result:
            distributions = result['distributions']
            for column, dist in distributions.items():
                simplified.append(f"\n{column}的分布信息:")
                if 'quantiles' in dist:
                    simplified.append("  分位数:")
                    for quantile, value in dist['quantiles'].items():
                        simplified.append(f"    {quantile}: {value:.2f}")
        
        # 添加聚类分析信息
        if 'clusters' in result:
            clusters = result['clusters']
            simplified.append(f"\n聚类分析结果:")
            if 'model' in clusters:
                simplified.append(f"  模型: {clusters['model']}")
            if 'n_clusters' in clusters:
                simplified.append(f"  聚类数量: {clusters['n_clusters']}")
            if 'cluster_columns' in clusters:
                simplified.append(f"  聚类列: {', '.join(clusters['cluster_columns'])}")
            if 'cluster_counts' in clusters:
                simplified.append(f"  各类簇样本数:")
                for cluster_id, count in clusters['cluster_counts'].items():
                    simplified.append(f"    簇{cluster_id}: {count}个样本")
            if 'cluster_centers' in clusters:
                simplified.append(f"  聚类中心:")
                centers = clusters['cluster_centers']
                if isinstance(centers, dict):
                    for cluster_id, center in centers.items():
                        simplified.append(f"    簇{cluster_id}中心:")
                        for col, val in center.items():
                            simplified.append(f"      {col}: {val:.2f}")
        
        # 添加异常检测分析信息
        if 'anomalies' in result:
            anomalies = result['anomalies']
            simplified.append(f"\n异常检测结果:")
            for column, anomaly in anomalies.items():
                simplified.append(f"\n  {column}:")
                if 'lower_bound' in anomaly:
                    simplified.append(f"    下限值: {anomaly['lower_bound']:.2f}")
                if 'upper_bound' in anomaly:
                    simplified.append(f"    上限值: {anomaly['upper_bound']:.2f}")
                if 'outlier_count' in anomaly:
                    simplified.append(f"    异常值数量: {anomaly['outlier_count']}")
        
        # 添加预测分析信息
        if 'predictions' in result:
            predictions = result['predictions']
            simplified.append(f"\n预测分析结果:")
            if 'model' in predictions:
                simplified.append(f"  模型: {predictions['model']}")
            if 'target_column' in predictions:
                simplified.append(f"  目标列: {predictions['target_column']}")
            if 'mse' in predictions:
                simplified.append(f"  均方误差: {predictions['mse']:.4f}")
            if 'r2' in predictions:
                simplified.append(f"  R²分数: {predictions['r2']:.4f}")
        
        # 添加回归分析信息
        if 'regression' in result:
            regression = result['regression']
            simplified.append(f"\n回归分析结果:")
            if 'model' in regression:
                simplified.append(f"  模型: {regression['model']}")
            if 'target_column' in regression:
                simplified.append(f"  目标列: {regression['target_column']}")
            if 'mse' in regression:
                simplified.append(f"  均方误差: {regression['mse']:.4f}")
            if 'r2' in regression:
                simplified.append(f"  R²分数: {regression['r2']:.4f}")
        
        # 添加时间序列分析信息
        if 'time_series' in result:
            time_series = result['time_series']
            simplified.append(f"\n时间序列分析结果:")
            for column, ts_data in time_series.items():
                simplified.append(f"\n  {column}:")
                if 'mean' in ts_data:
                    simplified.append(f"    均值: {ts_data['mean']:.2f}")
                if 'std' in ts_data:
                    simplified.append(f"    标准差: {ts_data['std']:.2f}")
        
        # 添加趋势分析信息
        if 'trends' in result:
            trends = result['trends']
            simplified.append(f"\n趋势分析结果:")
            for column, trend_data in trends.items():
                simplified.append(f"\n  {column}:")
                if isinstance(trend_data, dict):
                    if 'trend' in trend_data:
                        simplified.append(f"    趋势方向: {'上升' if trend_data['trend'] > 0 else '下降'}")
                    if 'slope' in trend_data:
                        simplified.append(f"    趋势斜率: {trend_data['slope']:.4f}")
        
        # 添加分类分析信息
        if 'classification' in result:
            classification = result['classification']
            simplified.append(f"\n分类分析结果:")
            if 'model' in classification:
                simplified.append(f"  模型: {classification['model']}")
            if 'accuracy' in classification:
                simplified.append(f"  准确率: {classification['accuracy']:.4f}")
            if 'precision' in classification:
                simplified.append(f"  精确率: {classification['precision']:.4f}")
            if 'recall' in classification:
                simplified.append(f"  召回率: {classification['recall']:.4f}")
            if 'f1_score' in classification:
                simplified.append(f"  F1分数: {classification['f1_score']:.4f}")
        
        # 如果上述都没有找到，检查是否有原始数据直接返回
        if not simplified and analysis_result and len(analysis_result.strip()) > 0:
            return f"分析结果数据:\n{analysis_result[:1000]}"
        
        return '\n'.join(simplified) if simplified else '未找到分析结果'
    except Exception as e:
        # 如果解析失败，直接返回原始结果
        try:
            return f"分析结果数据:\n{analysis_result[:1500]}"
        except:
            return '分析结果数据存在'


import time
import pandas as pd
