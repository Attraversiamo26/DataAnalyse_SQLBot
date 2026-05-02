
import sys
import os
import json

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from common.core.config import settings
from apps.chat.models.chat_model import ChatRecord

# 创建数据库引擎
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_api():
    db = SessionLocal()
    try:
        # 查询会话ID为141的记录
        stmt = select(ChatRecord).where(ChatRecord.id == 141)
        result = db.execute(stmt)
        record = result.scalar_one_or_none()
        
        if record:
            print("=" * 80)
            print("测试后端数据 - ChatRecord ID: 141")
            print("=" * 80)
            print(f"ID: {record.id}")
            print(f"Chat ID: {record.chat_id}")
            print(f"问题: {record.question}")
            print(f"是否有 data 字段: {hasattr(record, 'data')}")
            print(f"data 字段值: {'有数据' if record.data else '空'}")
            print(f"data 字段长度: {len(record.data) if record.data else 0}")
            print()
            
            if record.data:
                print("-" * 80)
                print("data 字段内容:")
                print("-" * 80)
                print(record.data)
                print()
            
            print("=" * 80)
            print("验证数据格式")
            print("=" * 80)
            if record.data:
                try:
                    parsed_data = json.loads(record.data)
                    print(f"JSON解析成功")
                    print(f"数据结构: {json.dumps(parsed_data, ensure_ascii=False, indent=2)}")
                except json.JSONDecodeError as e:
                    print(f"JSON解析失败: {e}")
                    
            print()
            print("=" * 80)
            print("测试完成")
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
    test_api()
