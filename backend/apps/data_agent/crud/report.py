import json
from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from apps.data_agent.models.analysis_model import Report, ReportCreate, ReportUpdate


class ReportCRUD:
    """报告CRUD操作"""
    
    @staticmethod
    def create(db: Session, report: ReportCreate, user_id: int) -> Report:
        """创建报告"""
        data = report.model_dump()
        
        # 将列表转换为JSON字符串
        if data.get('analysis_result_ids'):
            if isinstance(data['analysis_result_ids'], list):
                data['analysis_result_ids'] = json.dumps(data['analysis_result_ids'])
        if data.get('chat_record_ids'):
            if isinstance(data['chat_record_ids'], list):
                data['chat_record_ids'] = json.dumps(data['chat_record_ids'])
        
        db_report = Report(
            **data,
            create_time=datetime.now(),
            create_by=user_id
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        return db_report
    
    @staticmethod
    def get(db: Session, report_id: int) -> Optional[Report]:
        """根据ID获取报告"""
        return db.get(Report, report_id)
    
    @staticmethod
    def get_list(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Report]:
        """获取报告列表"""
        query = select(Report)
        if user_id:
            query = query.where(Report.create_by == user_id)
        query = query.order_by(Report.create_time.desc())
        return db.exec(query.offset(skip).limit(limit)).all()
    
    @staticmethod
    def update(db: Session, report_id: int, report_update: ReportUpdate) -> Optional[Report]:
        """更新报告"""
        db_report = db.get(Report, report_id)
        if not db_report:
            return None
        update_data = report_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_report, key, value)
        db.commit()
        db.refresh(db_report)
        return db_report
    
    @staticmethod
    def delete(db: Session, report_id: int) -> bool:
        """删除报告"""
        db_report = db.get(Report, report_id)
        if not db_report:
            return False
        db.delete(db_report)
        db.commit()
        return True
