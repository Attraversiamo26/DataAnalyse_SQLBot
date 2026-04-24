from typing import List, Optional
from pydantic import BaseModel, Field

from apps.swagger.i18n import PLACEHOLDER_PREFIX
from common.core.schemas import BaseCreatorDTO


class CreatePromptRequest(BaseModel):
    type: int = Field(description=f"{PLACEHOLDER_PREFIX}prompt_type")
    name: str = Field(min_length=1, max_length=255, description=f"{PLACEHOLDER_PREFIX}prompt_name")
    prompt: str = Field(description=f"{PLACEHOLDER_PREFIX}prompt_content")
    specific_ds: bool = Field(default=False, description=f"{PLACEHOLDER_PREFIX}specific_datasource")
    datasource_ids: Optional[List[int]] = Field(default=None, description=f"{PLACEHOLDER_PREFIX}datasource_ids")
    enabled: bool = Field(default=True, description=f"{PLACEHOLDER_PREFIX}enabled")


class UpdatePromptRequest(CreatePromptRequest, BaseCreatorDTO):
    pass


class PromptListItem(BaseCreatorDTO):
    type: int = Field(description=f"{PLACEHOLDER_PREFIX}prompt_type")
    name: str = Field(description=f"{PLACEHOLDER_PREFIX}prompt_name")
    prompt: str = Field(description=f"{PLACEHOLDER_PREFIX}prompt_content")
    specific_ds: bool = Field(description=f"{PLACEHOLDER_PREFIX}specific_datasource")
    datasource_ids: Optional[List[int]] = Field(description=f"{PLACEHOLDER_PREFIX}datasource_ids")
    enabled: bool = Field(description=f"{PLACEHOLDER_PREFIX}enabled")
    create_time: int = Field(description=f"{PLACEHOLDER_PREFIX}create_time")


class PromptResponse(PromptListItem):
    pass
