
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from common.core.config import settings
from apps.chat.models.chat_model import ChatRecord

# 创建数据库引擎
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def query_session_142():
    db = SessionLocal()
    try:
        # 查询会话ID为142的记录
        stmt = select(ChatRecord).where(ChatRecord.id == 142)
        result = db.execute(stmt)
        record = result.scalar_one_or_none()
        
        if record:
            print("=" * 80)
            print("会话记录详情 (ChatRecord ID: 142)")
            print("=" * 80)
            print(f"ID: {record.id}")
            print(f"Chat ID: {record.chat_id}")
            print(f"问题: {record.question}")
            print(f"创建时间: {record.create_time}")
            print(f"完成时间: {record.finish_time}")
            print(f"是否完成: {record.finish}")
            print(f"数据源ID: {record.datasource}")
            print(f"AI模型ID: {record.ai_modal_id}")
            print(f"引擎类型: {record.engine_type}")
            print()
            
            # SQL相关字段
            if record.sql_answer:
                print("-" * 80)
                print("SQL答案 (sql_answer):")
                print("-" * 80)
                print(record.sql_answer)
                print()
            
            if record.sql:
                print("-" * 80)
                print("SQL语句 (sql):")
                print("-" * 80)
                print(record.sql)
                print()
            
            if record.sql_exec_result:
                print("-" * 80)
                print("SQL执行结果 (sql_exec_result):")
                print("-" * 80)
                print(record.sql_exec_result)
                print()
            
            # 数据字段
            if record.data:
                print("-" * 80)
                print("数据 (data):")
                print("-" * 80)
                print(record.data)
                print()
            
            # 图表相关字段
            if record.chart_answer:
                print("-" * 80)
                print("图表答案 (chart_answer):")
                print("-" * 80)
                print(record.chart_answer)
                print()
            
            if record.chart:
                print("-" * 80)
                print("图表配置 (chart):")
                print("-" * 80)
                print(record.chart)
                print()
            
            # 分析相关字段
            if record.analysis:
                print("-" * 80)
                print("分析结果 (analysis):")
                print("-" * 80)
                print(record.analysis)
                print()
            
            # 预测相关字段
            if record.predict:
                print("-" * 80)
                print("预测结果 (predict):")
                print("-" * 80)
                print(record.predict)
                print()
            
            if record.predict_data:
                print("-" * 80)
                print("预测数据 (predict_data):")
                print("-" * 80)
                print(record.predict_data)
                print()
            
            # 其他字段
            if record.analysis_record_id:
                print(f"分析记录ID: {record.analysis_record_id}")
            
            if record.predict_record_id:
                print(f"预测记录ID: {record.predict_record_id}")
            
            if record.regenerate_record_id:
                print(f"重新生成记录ID: {record.regenerate_record_id}")
            
            if record.first_chat:
                print(f"是否首次对话: {record.first_chat}")
            
            if record.error:
                print("-" * 80)
                print("错误信息 (error):")
                print("-" * 80)
                print(record.error)
                print()
            
            print("=" * 80)
            print("查询完成")
            print("=" * 80)
        else:
            print("未找到会话ID为142的记录")
            
    except Exception as e:
        print(f"查询出错: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    query_session_142()
