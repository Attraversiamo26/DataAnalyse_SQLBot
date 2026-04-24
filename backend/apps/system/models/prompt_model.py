from enum import Enum
from typing import List, Optional

from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import BigInteger, Field, SQLModel, Column

from common.core.models import SnowflakeBase


class CustomPromptTypeEnum(int, Enum):
    GENERATE_SQL = 1
    ANALYSIS = 2
    PREDICT_DATA = 3


class CustomPromptBase(SQLModel):
    oid: int = Field(nullable=False, sa_type=BigInteger())
    type: int = Field(nullable=False)
    name: str = Field(max_length=255, nullable=False)
    prompt: str = Field(nullable=False)
    specific_ds: bool = Field(default=False, nullable=False)
    datasource_ids: List[int] = Field(sa_column=Column(JSONB, nullable=True))
    enabled: bool = Field(default=True, nullable=False)


class CustomPromptModel(SnowflakeBase, CustomPromptBase, table=True):
    __tablename__ = "sys_custom_prompt"
    create_time: int = Field(default=0, sa_type=BigInteger())
