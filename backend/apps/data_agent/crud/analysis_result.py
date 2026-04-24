from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from apps.data_agent.models.analysis_model import AnalysisResult, AnalysisResultCreate, AnalysisResultUpdate


class AnalysisResultCRUD:
    """分析结果CRUD操作"""
    
    @staticmethod
    def create(db: Session, analysis_result: AnalysisResultCreate, user_id: int) -> AnalysisResult:
        """创建分析结果"""
        db_analysis = AnalysisResult(
            **analysis_result.model_dump(),
            create_time=datetime.now(),
            create_by=user_id
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        return db_analysis
    
    @staticmethod
    def get(db: Session, analysis_id: int) -> Optional[AnalysisResult]:
        """根据ID获取分析结果"""
        return db.get(AnalysisResult, analysis_id)
    
    @staticmethod
    def get_list(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[AnalysisResult]:
        """获取分析结果列表"""
        query = select(AnalysisResult)
        if user_id:
            query = query.where(AnalysisResult.create_by == user_id)
        query = query.order_by(AnalysisResult.create_time.desc())
        return db.exec(query.offset(skip).limit(limit)).all()
    
    @staticmethod
    def update(db: Session, analysis_id: int, analysis_update: AnalysisResultUpdate) -> Optional[AnalysisResult]:
        """更新分析结果"""
        db_analysis = db.get(AnalysisResult, analysis_id)
        if not db_analysis:
            return None
        update_data = analysis_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_analysis, key, value)
        db.commit()
        db.refresh(db_analysis)
        return db_analysis
    
    @staticmethod
    def delete(db: Session, analysis_id: int) -> bool:
        """删除分析结果"""
        db_analysis = db.get(AnalysisResult, analysis_id)
        if not db_analysis:
            return False
        db.delete(db_analysis)
        db.commit()
        return True
    
    @staticmethod
    def get_by_tags(db: Session, tags: List[str], user_id: Optional[int] = None) -> List[AnalysisResult]:
        """根据标签获取分析结果"""
        query = select(AnalysisResult)
        if user_id:
            query = query.where(AnalysisResult.create_by == user_id)
        # 这里简化处理，实际可能需要更复杂的标签匹配逻辑
        # 假设tags是一个JSONB字段，存储为字符串列表
        query = query.where(AnalysisResult.tags.contains(tags))
        return db.exec(query).all()
