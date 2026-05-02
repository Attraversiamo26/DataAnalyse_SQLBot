from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime
import pandas as pd
import json

from common.core.deps import get_session, get_current_user
from apps.system.models.user import UserModel as User
from apps.datasource.models.datasource import CoreDatasource
from apps.db.db import get_engine
from apps.chat.task.llm import LLMService
from apps.chat.models.chat_model import ChatQuestion, ChatRecord, CreateChat, ChatInfo
from apps.chat.curd.chat import save_analysis_predict_record, create_chat, save_question
from apps.data_agent.api import analyze_data as data_agent_analyze
from apps.data_agent.api import DataAnalysisRequest

router = APIRouter(tags=["Home Page"])


class HomeChatRequest(BaseModel):
    """主页面聊天请求"""
    question: str
    datasource_id: Optional[int] = None
    table_name: Optional[str] = None
    data: Optional[str] = None
    chat_id: Optional[int] = None  # 可选的chat_id，如果有就继续这个会话，没有就新建


class HomeChatResponse(BaseModel):
    """主页面聊天响应"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    tool: Optional[str] = None  # "search" or "analysis"


def identify_intent(question: str) -> str:
    """识别用户意图
    
    Args:
        question: 用户问题
        
    Returns:
        str: 识别结果，"search" 或 "analysis"
    """
    # 增强的意图识别逻辑
    # 分析关键词具有更高优先级
    search_keywords = ["查询", "SQL", "表", "字段", "记录", "统计"]
    analysis_keywords = ["分析", "趋势", "预测", "相关性", "分布", "异常", "时间序列", "聚类", "相关", "关联"]
    
    search_score = sum(1 for keyword in search_keywords if keyword in question)
    analysis_score = sum(1 for keyword in analysis_keywords if keyword in question)
    
    # 分析关键词优先级更高，得分相同时优先返回analysis
    if analysis_score >= search_score and analysis_score > 0:
        return "analysis"
    else:
        return "search"


def get_data_from_datasource(db: Session, datasource_id: int, table_name: Optional[str] = None) -> tuple[pd.DataFrame, str]:
    """从数据源获取数据
    
    Args:
        db: 数据库会话
        datasource_id: 数据源ID
        table_name: 表名（可选）
        
    Returns:
        tuple[pd.DataFrame, str]: 数据框和表名
    """
    try:
        # 获取数据源信息
        datasource = db.query(CoreDatasource).filter(CoreDatasource.id == datasource_id).first()
        if not datasource:
            raise Exception("数据源不存在")
        
        # 获取数据库连接
        engine = get_engine(datasource)
        if not engine:
            raise Exception("无法连接到数据源")
        
        # 如果没有提供表名，尝试获取第一个表
        if not table_name:
            # 获取数据源中的表名
            db_type = datasource.type.lower()
            if db_type in ['mysql', 'doris', 'starrocks']:
                table_query = "SHOW TABLES"
            elif db_type in ['pg', 'excel', 'redshift', 'kingbase']:
                table_query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            elif db_type == 'sqlserver':
                table_query = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
            elif db_type == 'oracle':
                table_query = "SELECT table_name FROM user_tables"
            elif db_type == 'ck':
                table_query = "SHOW TABLES"
            else:
                table_query = "SHOW TABLES"
            
            try:
                df_tables = pd.read_sql(table_query, engine)
                if len(df_tables) > 0:
                    table_name = df_tables.iloc[0, 0]
                    print(f"自动选择表: {table_name}")
                else:
                    raise Exception("数据源中没有表")
            except:
                # 如果获取表名失败，尝试使用配置中存储的表名
                try:
                    config = datasource.configuration
                    if isinstance(config, str):
                        config = json.loads(config)
                    if config and 'sheets' in config and len(config['sheets']) > 0:
                        table_name = config['sheets'][0]['tableName']
                        print(f"从配置中获取表名: {table_name}")
                except:
                    raise Exception("无法获取表名")
        
        # 获取数据库类型
        db_type = datasource.type.lower()
        
        # 获取数据
        if db_type in ['mysql', 'doris', 'starrocks']:
            data_query = f"SELECT * FROM `{table_name}` LIMIT 1000"
        elif db_type in ['pg', 'excel', 'redshift', 'kingbase']:
            data_query = f"SELECT * FROM \"{table_name}\" LIMIT 1000"
        elif db_type == 'sqlserver':
            data_query = f"SELECT TOP 1000 * FROM [{table_name}]"
        elif db_type == 'oracle':
            data_query = f"SELECT * FROM (SELECT * FROM \"{table_name}\") WHERE ROWNUM <= 1000"
        elif db_type == 'ck':
            data_query = f"SELECT * FROM \"{table_name}\" LIMIT 1000"
        else:
            data_query = f"SELECT * FROM {table_name} LIMIT 1000"
        
        print(f"执行查询: {data_query}")
        df = pd.read_sql(data_query, engine)
        print(f"查询结果: {len(df)} 行, {len(df.columns)} 列")
        print(f"列名: {list(df.columns)}")
        
        return df, table_name
    except Exception as e:
        print(f"获取数据失败: {str(e)}")
        raise Exception(f"获取数据失败: {str(e)}")


@router.post("/chat", response_model=HomeChatResponse)
async def home_chat(
    request: HomeChatRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """主页面聊天接口

    集成智能问数和数据分析功能，根据用户意图自动选择合适的工具
    """
    try:
        print(f"\n=== 主页面聊天请求 ===")
        print(f"用户问题: {request.question}")
        print(f"数据源ID: {request.datasource_id}")
        print(f"表名: '{request.table_name}'")
        print(f"表名类型: {type(request.table_name)}")
        print(f"表名长度: {len(request.table_name) if request.table_name else 0}")
        print(f"Chat ID: {request.chat_id}")
        
        # 首先检查是否有数据源
        if not request.datasource_id:
            raise Exception("请先选择数据源或上传文件")
        
        # 检查表名
        if not request.table_name or request.table_name.strip() == "":
            raise Exception("未提供表名，请先选择表")
        
        print("参数检查通过，开始处理意图识别")
        
        # 先识别用户意图，根据意图决定创建什么类型的会话
        intent = identify_intent(request.question)
        print(f"识别意图: {intent}")
        
        # 处理chat_id：数据分析始终创建新的analysis类型会话，智能问数可以继续使用现有会话
        chat_info: ChatInfo
        chat_type = "analysis" if intent == "analysis" else "chat"
        
        if intent == "analysis":
            # 数据分析：始终创建新的analysis类型会话，确保与智能问数分离
            create_chat_obj = CreateChat(
                datasource=request.datasource_id,
                question=request.question,
                origin=1,  # 标记为主页面发起的对话
                chat_type="analysis"  # 强制设置为analysis类型
            )
            chat_info = create_chat(db, current_user, create_chat_obj, require_datasource=True)
            print(f"数据分析 - 创建新的Chat ID: {chat_info.id}，类型: analysis")
        elif not request.chat_id:
            # 智能问数：没有现有会话，创建新的chat类型会话
            create_chat_obj = CreateChat(
                datasource=request.datasource_id,
                question=request.question,
                origin=1,  # 标记为主页面发起的对话
                chat_type="chat"  # 智能问数使用chat类型
            )
            chat_info = create_chat(db, current_user, create_chat_obj, require_datasource=True)
            print(f"智能问数 - 创建新的Chat ID: {chat_info.id}，类型: chat")
        else:
            # 智能问数：继续使用现有chat类型会话
            chat_info = ChatInfo(id=request.chat_id, datasource=request.datasource_id, records=[], chat_type="chat")
            print(f"智能问数 - 继续使用现有Chat ID: {chat_info.id}，类型: chat")
        
        if intent == "search":
            # 调用智能问数功能
            # 保存用户问题记录
            chat_question = ChatQuestion(
                chat_id=chat_info.id,
                question=request.question
            )
            base_record = save_question(db, current_user, chat_question)
            
            # 返回search标识和record_id，让前端调用智能问数的ChartAnswer组件
            return HomeChatResponse(
                success=True,
                result={
                    "chat_id": chat_info.id,
                    "record_id": base_record.id,
                    "message": "智能问数功能已启动"
                },
                tool="search"
            )
        else:
            # 调用数据分析功能
            # 确保有表名
            if not request.table_name or request.table_name.strip() == "":
                raise Exception("未提供表名，请先选择表")
            
            # 调用data_agent的分析功能
            print("调用data_agent的分析功能...")
            # 注意：我们需要直接调用分析逻辑，而不是通过HTTP请求
            # 让我们复制data_agent中的分析逻辑
            
            # 调用分析功能的函数
            from apps.data_agent.api import fetch_data_from_datasource, identify_analysis_intent, convert_numpy_types, generate_report
            from apps.data_agent.analysis import AnalysisTools
            from apps.data_agent.models.analysis_model import AnalysisResultCreate
            from apps.data_agent.crud.analysis_result import AnalysisResultCRUD
            import time
            
            start_time = time.time()
            
            # 获取数据
            print(f"从数据源获取数据: 数据源ID={request.datasource_id}, 表名={request.table_name}")
            data = await fetch_data_from_datasource(request.datasource_id, request.table_name, db)
            print(f"获取数据成功，数据形状: {data.shape}")
            
            # 通过大模型识别分析意图
            print("通过大模型识别分析意图...")
            analysis_type, selected_columns = await identify_analysis_intent(request.question, data, db, current_user, request.datasource_id)
            print(f"大模型识别结果: 分析类型={analysis_type}, 选择的列={selected_columns}")
            
            if analysis_type and selected_columns:
                # 使用分析工具执行分析
                print(f"使用分析工具执行分析: 分析类型={analysis_type}, 选择的列={selected_columns}")
                analysis_result = AnalysisTools.analyze_data(data, analysis_type, selected_columns)
                # 转换numpy类型为Python原生类型
                analysis_result = convert_numpy_types(analysis_result)
                result_data = json.dumps(analysis_result, ensure_ascii=False)
                print(f"分析结果: {result_data[:100]}...")
                
                # 生成报告
                print("生成分析报告...")
                report = await generate_report(request.question, result_data)
                print(f"报告生成完成: {report[:100]}...")
                
                # 计算执行时间
                execution_time = time.time() - start_time
                print(f"分析执行时间: {execution_time:.2f}秒")
                
                # 存储分析结果
                analysis_create = AnalysisResultCreate(
                    name=f"分析_{current_user.id}_{int(time.time())}",
                    query=request.question,
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
                
                # 创建会话记录（使用已有的analysis类型会话）
                from apps.chat.models.chat_model import ChatQuestion, ChatRecord
                from apps.chat.crud.chat import save_question
                
                # 创建问题记录
                chat_question = ChatQuestion(
                    chat_id=chat_info.id,
                    question=request.question
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
                analysis_record.sql = f"使用分析工具: {analysis_type}, 列: {selected_columns}"
                
                # 保存分析报告
                import json
                analysis_answer = json.dumps({"content": report}, ensure_ascii=False)
                analysis_record.analysis = analysis_answer
                analysis_record.finish = True
                analysis_record.finish_time = datetime.now()
                
                db.add(analysis_record)
                db.commit()
                
                print(f"数据分析会话记录已创建，Chat ID: {chat_info.id}")
                
                # 返回分析结果
                return HomeChatResponse(
                    success=True,
                    result={
                        "chat_id": chat_info.id,
                        "analysis_id": analysis_result_db.id,
                        "result": result_data,
                        "report": report,
                        "message": "数据分析已完成"
                    },
                    tool="analysis"
                )
            else:
                raise Exception("未能识别分析意图")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"主页面聊天请求失败: {str(e)}")
        return HomeChatResponse(
            success=False,
            error=str(e),
            tool=None
        )
