
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from common.core.config import settings
from apps.chat.models.chat_model import ChatRecord, Chat

# 创建数据库引擎
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def query_chat_58():
    db = SessionLocal()
    try:
        print("=" * 80)
        print("查询 Chat ID: 58 的所有记录")
        print("=" * 80)
        print()
        
        # 查询Chat信息
        chat_stmt = select(Chat).where(Chat.id == 58)
        chat_result = db.execute(chat_stmt)
        chat = chat_result.scalar_one_or_none()
        
        if chat:
            print("Chat信息:")
            print(f"  ID: {chat.id}")
            print(f"  创建时间: {chat.create_time}")
            print(f"  简短描述: {chat.brief}")
            print(f"  聊天类型: {chat.chat_type}")
            print(f"  数据源: {chat.datasource}")
            print(f"  引擎类型: {chat.engine_type}")
            print()
        
        # 查询Chat的所有记录
        stmt = select(ChatRecord).where(ChatRecord.chat_id == 58).order_by(ChatRecord.create_time)
        result = db.execute(stmt)
        records = result.scalars().all()
        
        print(f"找到 {len(records)} 条 ChatRecord 记录:")
        print()
        
        for i, record in enumerate(records):
            print("-" * 80)
            print(f"记录 {i+1} (ID: {record.id})")
            print("-" * 80)
            print(f"  问题: {record.question}")
            print(f"  创建时间: {record.create_time}")
            print(f"  是否完成: {record.finish}")
            print(f"  完成时间: {record.finish_time}")
            
            # 检查是否有数据
            has_data = False
            if record.sql_answer:
                print(f"  [✓] 有SQL答案")
                has_data = True
            if record.sql:
                print(f"  [✓] 有SQL语句")
                has_data = True
            if record.data:
                print(f"  [✓] 有数据")
                has_data = True
            if record.chart:
                print(f"  [✓] 有图表配置")
                has_data = True
            if record.analysis:
                print(f"  [✓] 有分析结果")
                has_data = True
            if record.predict:
                print(f"  [✓] 有预测结果")
                has_data = True
            
            if not has_data:
                print(f"  [✗] 无结果数据")
            
            if record.analysis_record_id:
                print(f"  分析记录ID: {record.analysis_record_id}")
            if record.predict_record_id:
                print(f"  预测记录ID: {record.predict_record_id}")
            
            print()
        
        print("=" * 80)
        print("查询完成")
        print("=" * 80)
            
    except Exception as e:
        print(f"查询出错: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    query_chat_58()
