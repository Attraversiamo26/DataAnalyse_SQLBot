from pydantic import field_validator
from sqlmodel import BigInteger, SQLModel, Field
from typing import Optional

from common.utils.snowflake import snowflake

class SnowflakeBase(SQLModel):
    id: Optional[int] = Field(
        default_factory=snowflake.generate_id,
        primary_key=True,
        sa_type=BigInteger(),
        index=True,
        nullable=False
    )
    
