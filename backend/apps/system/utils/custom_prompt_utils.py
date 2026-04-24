from typing import List, Optional, Tuple
from sqlalchemy import or_
from sqlmodel import select

from apps.system.models.prompt_model import CustomPromptModel, CustomPromptTypeEnum
from common.core.deps import SessionDep


def find_custom_prompts(
    session: SessionDep,
    custom_prompt_type: CustomPromptTypeEnum,
    oid: int,
    ds_id: Optional[int] = None
) -> Tuple[str, List[CustomPromptModel]]:
    """
    根据 type/oid/datasource_id 过滤启用的提示词
    
    Args:
        session: 数据库会话
        custom_prompt_type: 提示词类型
        oid: 组织 ID
        ds_id: 数据源 ID（可选）
    
    Returns:
        (prompt_text, prompt_list) 元组
        - prompt_text: 所有提示词文本拼接结果
        - prompt_list: 匹配的提示词列表
    """
    stmt = select(CustomPromptModel).where(
        CustomPromptModel.type == custom_prompt_type,
        CustomPromptModel.oid == oid,
        CustomPromptModel.enabled == True
    )
    
    if ds_id is not None:
        from sqlalchemy import cast, Integer
        from sqlalchemy.dialects.postgresql import array
        
        stmt = stmt.where(
            or_(
                CustomPromptModel.specific_ds == False,
                CustomPromptModel.datasource_ids.contains([ds_id])
            )
        )
    
    prompt_list = session.exec(stmt).all()
    
    prompt_text = "\n\n".join([prompt.prompt for prompt in prompt_list])
    
    return (prompt_text, prompt_list)
