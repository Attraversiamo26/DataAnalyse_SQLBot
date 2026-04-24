from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from apps.data_agent.models.analysis_model import ReportTemplate, ReportTemplateCreate, ReportTemplateUpdate


class ReportTemplateCRUD:
    """报告模板CRUD操作"""
    
    @staticmethod
    def create(db: Session, template: ReportTemplateCreate, user_id: int) -> ReportTemplate:
        """创建报告模板"""
        db_template = ReportTemplate(
            **template.model_dump(),
            create_time=datetime.now(),
            create_by=user_id
        )
        # 如果设置为默认模板，将其他模板设置为非默认
        if template.is_default:
            db.exec(select(ReportTemplate).where(ReportTemplate.is_default == True)).all()
            for t in db.exec(select(ReportTemplate).where(ReportTemplate.is_default == True)).all():
                t.is_default = False
        db.add(db_template)
        db.commit()
        db.refresh(db_template)
        return db_template
    
    @staticmethod
    def get(db: Session, template_id: int) -> Optional[ReportTemplate]:
        """根据ID获取报告模板"""
        return db.get(ReportTemplate, template_id)
    
    @staticmethod
    def get_list(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[ReportTemplate]:
        """获取报告模板列表"""
        query = select(ReportTemplate)
        if user_id:
            query = query.where(ReportTemplate.create_by == user_id)
        return db.exec(query.offset(skip).limit(limit)).all()
    
    @staticmethod
    def get_default(db: Session) -> Optional[ReportTemplate]:
        """获取默认报告模板"""
        return db.exec(select(ReportTemplate).where(ReportTemplate.is_default == True)).first()
    
    @staticmethod
    def update(db: Session, template_id: int, template_update: ReportTemplateUpdate) -> Optional[ReportTemplate]:
        """更新报告模板"""
        db_template = db.get(ReportTemplate, template_id)
        if not db_template:
            return None
        update_data = template_update.model_dump(exclude_unset=True)
        # 如果设置为默认模板，将其他模板设置为非默认
        if update_data.get('is_default'):
            for t in db.exec(select(ReportTemplate).where(ReportTemplate.is_default == True)).all():
                if t.id != template_id:
                    t.is_default = False
        for key, value in update_data.items():
            setattr(db_template, key, value)
        db.commit()
        db.refresh(db_template)
        return db_template
    
    @staticmethod
    def delete(db: Session, template_id: int) -> bool:
        """删除报告模板"""
        db_template = db.get(ReportTemplate, template_id)
        if not db_template:
            return False
        db.delete(db_template)
        db.commit()
        return True
