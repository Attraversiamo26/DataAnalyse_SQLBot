from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from common.core.models import SnowflakeBase


class ReportTemplate(SnowflakeBase, table=True):
    __tablename__ = "report_template"
    __table_args__ = {'extend_existing': True}
    
    name: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    content: Optional[str] = Field(default=None)
    user_id: Optional[int] = Field(default=None)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)