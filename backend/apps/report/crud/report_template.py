from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List

from apps.report.models.report_model import ReportTemplate


def create_report_template(
    db: Session,
    name: str,
    description: Optional[str] = None,
    content: str = "",
    user_id: int = 0,
) -> ReportTemplate:
    template = ReportTemplate(
        name=name,
        description=description,
        content=content,
        user_id=user_id,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def get_report_template(db: Session, template_id: int) -> Optional[ReportTemplate]:
    return db.query(ReportTemplate).filter(ReportTemplate.id == template_id).first()


def get_report_templates(
    db: Session, skip: int = 0, limit: int = 10
) -> List[ReportTemplate]:
    return db.query(ReportTemplate).offset(skip).limit(limit).all()


def update_report_template(
    db: Session,
    template_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    content: Optional[str] = None,
) -> Optional[ReportTemplate]:
    template = get_report_template(db=db, template_id=template_id)
    if not template:
        return None
    
    if name is not None:
        template.name = name
    if description is not None:
        template.description = description
    if content is not None:
        template.content = content
    template.updated_at = datetime.now()
    
    db.commit()
    db.refresh(template)
    return template


def delete_report_template(db: Session, template_id: int) -> bool:
    template = get_report_template(db=db, template_id=template_id)
    if not template:
        return False
    
    db.delete(template)
    db.commit()
    return True