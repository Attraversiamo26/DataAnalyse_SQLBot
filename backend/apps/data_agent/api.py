import time
import pandas as pd
import json
import numpy as np
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# 辅助函数：将numpy类型转换为Python原生类型
def convert_numpy_types(obj):
    import pandas as pd
    if isinstance(obj, (np.integer, np.int64)):
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

router = APIRouter()

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
    data: str
    requirements: Optional[str] = ""
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    datasource_id: Optional[int] = None
    table_name: Optional[str] = None
    analysis_type: Optional[str] = None
    selected_columns: Optional[List[str]] = None

class DataAnalysisResponse(BaseModel):
    """数据分析响应"""
    success: bool
    result: Optional[str] = None
    error: Optional[str] = None
    report: Optional[str] = None
    analysis_id: Optional[int] = None

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
        
        # 处理获取数据前5条的请求
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
                
                # 存储分析结果
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
        
        # 处理基于字段名称生成分析建议的请求
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
2. 建议应该包括字段之间的相关性分析、趋势分析、统计分析等
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
                
                # 存储分析结果
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
            
            # 准备返回响应
            print("准备返回分析结果响应...")
            response = DataAnalysisResponse(
                success=True,
                result=result_data,
                report=report,
                analysis_id=analysis_result_db.id
            )
            print("分析结果响应准备完成")
            return response
        else:
            # 尝试通过大模型识别分析意图
            print("通过大模型识别分析意图...")
            analysis_type, selected_columns = await identify_analysis_intent(request.query, data)
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
                
                return DataAnalysisResponse(
                    success=True,
                    result=result_data,
                    report=report,
                    analysis_id=analysis_result_db.id
                )
            else:
                # 使用传统的代码执行方式
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
                    
                    return DataAnalysisResponse(
                        success=True,
                        result=response.std_out,
                        report=report,
                        analysis_id=analysis_result.id
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

async def identify_analysis_intent(query: str, data: pd.DataFrame) -> tuple[str, list[str]]:
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
        
        # 构建提示词，优化为更清晰的function calling格式
        prompt = f"""
        # 角色: 数据分析意图识别专家
        
        你的任务是分析用户的数据分析需求，识别出具体的分析类型和需要分析的列。
        
        ## 用户需求
        {query}
        
        ## 可用列
        {', '.join(columns)}
        
        ## 分析类型映射
        - 描述性统计: descriptive
        - 相关性分析: correlation
        - 分布分析: distribution
        - 趋势分析: trend
        - 机器学习预测: prediction
        - 分类分析: classification
        - 异常检测: anomaly
        - 时间序列分析: time_series
        - 聚类分析: clustering
        - 回归分析: regression
        
        ## 输出格式
        请以JSON格式输出识别结果，包含以下字段：
        - analysis_type: 识别到的分析类型
        - columns: 需要分析的列名列表
        
        注意：
        1. 请确保识别的分析类型是上述映射中的一种
        2. 请确保识别的列名在可用列列表中
        3. 请根据分析类型的要求选择适当数量的列
        4. 请返回格式正确的JSON，不要包含其他无关内容
        
        示例输出:
        {{"analysis_type": "correlation", "columns": ["列1", "列2"]}}
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
        json_match = re.search(r'\{[^\}]+\}', content)
        if json_match:
            json_str = json_match.group(0)
            print(f"提取的JSON: {json_str}")
            intent_data = json.loads(json_str)
            analysis_type = intent_data.get('analysis_type', '')
            selected_columns = intent_data.get('columns', [])
            
            # 验证识别结果
            print(f"识别结果 - 分析类型: {analysis_type}, 选择的列: {selected_columns}")
            
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
                elif analysis_type in ["correlation", "trend", "prediction", "classification", "time_series", "clustering", "regression"]:
                    if len(selected_columns) < 2:
                        print(f"警告: {analysis_type} 分析需要至少2列")
            
            print(f"验证后的识别结果 - 分析类型: {analysis_type}, 选择的列: {selected_columns}")
            return analysis_type, selected_columns
        
        print("无法从大模型返回结果中提取JSON")
        return "", []
    except Exception as e:
        print(f"识别分析意图失败: {str(e)}")
        return "", []


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
# ROLE: 数据分析报告撰写专家

你是一位专业的数据分析报告撰写专家，擅长将复杂的数据分析结果转化为清晰、准确、易懂的自然语言总结。

你的任务是根据用户的原始查询需求和Python脚本的分析输出结果，生成一段结构清晰、语言简洁、内容准确的总结性描述。

---

### 输入信息

【用户原始查询】
{user_query}

【Python分析结果】
{simplified_result}

---

### 输出要求

1. 只输出自然语言总结，不要包含任何代码、JSON、Markdown或其他格式。
2. 总结内容应直接回应用户的查询需求，突出关键结论。
3. 如果分析结果为空或出错，请明确指出（如"未找到相关数据"或"分析过程中出现错误"）。
4. 语言要简洁明了，避免使用技术术语，除非用户查询中明确涉及。
5. 不要添加任何解释性内容或额外建议，只做结果归纳。
6. 不要猜测或虚构内容，严格基于Python输出结果进行总结。

---

请生成符合要求的总结内容：
""".format(user_query=user_query, simplified_result=simplified_result)
        
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
        
        # 添加相关性分析信息
        if 'correlation_matrix' in result:
            simplified.append("\n相关性矩阵:")
            corr_matrix = result['correlation_matrix']
            columns = list(corr_matrix.keys())
            if columns:
                simplified.append(f"  分析列: {', '.join(columns)}")
                simplified.append("  相关性分析已完成")
        
        # 添加分布分析信息
        if 'distributions' in result:
            distributions = result['distributions']
            for column, dist in distributions.items():
                simplified.append(f"\n{column}的分布信息:")
                if 'quantiles' in dist:
                    simplified.append("  分位数:")
                    for quantile, value in dist['quantiles'].items():
                        simplified.append(f"    {quantile}: {value:.2f}")
        
        return '\n'.join(simplified) if simplified else '未找到分析结果'
    except Exception as e:
        # 如果解析失败，返回原始结果的前500个字符
        return analysis_result[:500] + ('...' if len(analysis_result) > 500 else '')

import time
import pandas as pd
