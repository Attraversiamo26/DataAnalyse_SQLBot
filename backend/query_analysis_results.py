
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from common.core.config import settings
from apps.data_agent.models.analysis_model import AnalysisResult

# 创建数据库引擎
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def query_analysis_results():
    db = SessionLocal()
    try:
        print("=" * 80)
        print("查询所有分析结果 (AnalysisResult)")
        print("=" * 80)
        print()
        
        # 查询所有分析结果
        stmt = select(AnalysisResult).order_by(AnalysisResult.create_time.desc())
        result = db.execute(stmt)
        records = result.scalars().all()
        
        print(f"找到 {len(records)} 条分析结果记录:")
        print()
        
        for i, record in enumerate(records):
            print("-" * 80)
            print(f"分析结果 {i+1} (ID: {record.id})")
            print("-" * 80)
            print(f"  名称: {record.name}")
            print(f"  描述: {record.description}")
            print(f"  标签: {record.tags}")
            print(f"  查询: {record.query}")
            print(f"  数据源ID: {record.datasource_id}")
            print(f"  表名: {record.table_name}")
            print(f"  创建时间: {record.create_time}")
            print(f"  状态: {record.status}")
            
            if record.error_message:
                print(f"  错误信息: {record.error_message}")
            
            if record.result_summary:
                print(f"  结果摘要: {record.result_summary}")
            
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
    query_analysis_results()
