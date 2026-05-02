
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

def query_record_141():
    db = SessionLocal()
    try:
        # 查询会话ID为141的记录
        stmt = select(ChatRecord).where(ChatRecord.id == 141)
        result = db.execute(stmt)
        record = result.scalar_one_or_none()
        
        if record:
            print("=" * 80)
            print("有完整数据的会话记录详情 (ChatRecord ID: 141)")
            print("=" * 80)
            print(f"ID: {record.id}")
            print(f"Chat ID: {record.chat_id}")
            print(f"问题: {record.question}")
            print(f"创建时间: {record.create_time}")
            print(f"完成时间: {record.finish_time}")
            print(f"是否完成: {record.finish}")
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
            
            # 数据字段
            if record.data:
                print("-" * 80)
                print("数据 (data):")
                print("-" * 80)
                print(record.data[:1000] + "..." if len(record.data) > 1000 else record.data)
                print()
            
            # 图表相关字段
            if record.chart:
                print("-" * 80)
                print("图表配置 (chart):")
                print("-" * 80)
                print(record.chart)
                print()
            
            print("=" * 80)
            print("查询完成")
            print("=" * 80)
        else:
            print("未找到会话ID为141的记录")
            
    except Exception as e:
        print(f"查询出错: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    query_record_141()
