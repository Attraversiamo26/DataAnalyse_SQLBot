from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel
from sqlalchemy import Column, Integer, Text, BigInteger, DateTime, Identity, Boolean, ARRAY, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import SQLModel, Field


class AnalysisResult(SQLModel, table=True):
    """分析结果存储模型"""
    __tablename__ = "analysis_result"
    
    id: Optional[int] = Field(sa_column=Column(BigInteger, Identity(always=True), primary_key=True))
    oid: Optional[int] = Field(sa_column=Column(BigInteger, nullable=True, default=1))
    create_time: datetime = Field(sa_column=Column(DateTime(timezone=False), nullable=True))
    create_by: int = Field(sa_column=Column(BigInteger, nullable=True))
    
    # 分析基本信息
    name: str = Field(max_length=255, nullable=True)
    description: str = Field(sa_column=Column(Text, nullable=True))
    tags: Optional[List[str]] = Field(sa_column=Column(ARRAY(String), nullable=True))
    
    # 分析配置
    query: str = Field(sa_column=Column(Text, nullable=True))  # 用户的分析需求
    datasource_id: Optional[int] = Field(sa_column=Column(BigInteger, nullable=True))
    table_name: Optional[str] = Field(max_length=255, nullable=True)
    
    # 分析执行信息
    python_code: str = Field(sa_column=Column(Text, nullable=True))
    execution_time: Optional[float] = Field(sa_column=Column(Integer, nullable=True))  # 执行时间（秒）
    status: str = Field(max_length=50, default="success")  # success, failed
    error_message: str = Field(sa_column=Column(Text, nullable=True))
    
    # 分析结果
    result_data: str = Field(sa_column=Column(Text, nullable=True))  # 分析结果数据（JSON 字符串）
    result_summary: str = Field(sa_column=Column(Text, nullable=True))  # 分析结果摘要
    
    # 报告相关
    report_id: Optional[int] = Field(sa_column=Column(BigInteger, nullable=True))
    

class AnalysisResultBase(BaseModel):
    """分析结果基础模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    query: Optional[str] = None
    datasource_id: Optional[int] = None
    table_name: Optional[str] = None
    python_code: Optional[str] = None
    execution_time: Optional[float] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    result_data: Optional[str] = None
    result_summary: Optional[str] = None


class AnalysisResultCreate(AnalysisResultBase):
    """创建分析结果模型"""
    pass


class AnalysisResultUpdate(BaseModel):
    """更新分析结果模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class AnalysisResultResponse(AnalysisResultBase):
    """分析结果响应模型"""
    id: int
    oid: int
    create_time: datetime
    create_by: int
    
    class Config:
        from_attributes = True


class AnalysisResultList(BaseModel):
    """分析结果列表响应模型"""
    total: int
    items: List[AnalysisResultResponse]


class ReportTemplate(SQLModel, table=True):
    """报告模板存储模型"""
    __tablename__ = "report_template"
    
    id: Optional[int] = Field(sa_column=Column(BigInteger, Identity(always=True), primary_key=True))
    oid: Optional[int] = Field(sa_column=Column(BigInteger, nullable=True, default=1))
    create_time: datetime = Field(sa_column=Column(DateTime(timezone=False), nullable=True))
    create_by: int = Field(sa_column=Column(BigInteger, nullable=True))
    
    name: str = Field(max_length=255, nullable=False)
    description: str = Field(sa_column=Column(Text, nullable=True))
    template_content: str = Field(sa_column=Column(Text, nullable=False))  # 模板内容（支持变量替换）
    is_default: bool = Field(default=False)
    

class ReportTemplateBase(BaseModel):
    """报告模板基础模型"""
    name: str
    description: Optional[str] = None
    template_content: str
    is_default: Optional[bool] = False


class ReportTemplateCreate(ReportTemplateBase):
    """创建报告模板模型"""
    pass


class ReportTemplateUpdate(BaseModel):
    """更新报告模板模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    template_content: Optional[str] = None
    is_default: Optional[bool] = None


class ReportTemplateResponse(ReportTemplateBase):
    """报告模板响应模型"""
    id: int
    oid: int
    create_time: datetime
    create_by: int
    
    class Config:
        from_attributes = True


class Report(SQLModel, table=True):
    """报告存储模型"""
    __tablename__ = "report"
    
    id: Optional[int] = Field(sa_column=Column(BigInteger, Identity(always=True), primary_key=True))
    oid: Optional[int] = Field(sa_column=Column(BigInteger, nullable=True, default=1))
    create_time: datetime = Field(sa_column=Column(DateTime(timezone=False), nullable=True))
    create_by: int = Field(sa_column=Column(BigInteger, nullable=True))
    
    name: str = Field(max_length=255, nullable=False)
    description: str = Field(sa_column=Column(Text, nullable=True))
    template_id: Optional[int] = Field(sa_column=Column(BigInteger, nullable=True))
    
    # 报告内容
    report_content: str = Field(sa_column=Column(Text, nullable=True))  # Markdown 格式的报告内容
    status: str = Field(max_length=50, default="generated")  # generated, edited, exported
    
    # 关联的分析结果
    analysis_result_ids: Optional[List[int]] = Field(sa_column=Column(ARRAY(Integer), nullable=True))
    chat_record_ids: Optional[List[int]] = Field(sa_column=Column(ARRAY(Integer), nullable=True))
    

class ReportBase(BaseModel):
    """报告基础模型"""
    name: str
    description: Optional[str] = None
    template_id: Optional[int] = None
    report_content: Optional[str] = None
    status: Optional[str] = None
    analysis_result_ids: Optional[List[int]] = None
    chat_record_ids: Optional[List[int]] = None


class ReportCreate(ReportBase):
    """创建报告模型"""
    pass


class ReportUpdate(BaseModel):
    """更新报告模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    report_content: Optional[str] = None
    status: Optional[str] = None


class ReportResponse(ReportBase):
    """报告响应模型"""
    id: int
    oid: int
    create_time: datetime
    create_by: int
    
    class Config:
        from_attributes = True
