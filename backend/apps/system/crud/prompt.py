import datetime
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import and_
from sqlmodel import select

from apps.system.models.prompt_model import CustomPromptModel
from apps.system.schemas.prompt_schema import UpdatePromptRequest
from common.core.deps import SessionDep, CurrentUser, Trans
from common.core.pagination import Paginator
from common.core.schemas import PaginationParams


def create_prompt(
    session: SessionDep,
    user: CurrentUser,
    trans: Trans,
    prompt: CustomPromptModel
) -> CustomPromptModel:
    check_name(session, trans, prompt)
    prompt.oid = user.oid
    prompt.create_time = int(datetime.datetime.now().timestamp() * 1000)
    prompt.id = None
    session.add(prompt)
    session.commit()
    session.refresh(prompt)
    return prompt


def get_prompt(
    session: SessionDep,
    trans: Trans,
    prompt_id: int
) -> Optional[CustomPromptModel]:
    return session.get(CustomPromptModel, prompt_id)


def list_prompts(
    session: SessionDep,
    trans: Trans,
    oid: Optional[int] = None,
    name: Optional[str] = None,
    prompt_type: Optional[int] = None,
    enabled: Optional[bool] = None
) -> List[CustomPromptModel]:
    stmt = select(CustomPromptModel)
    
    conditions = []
    if oid is not None:
        conditions.append(CustomPromptModel.oid == oid)
    if name is not None:
        conditions.append(CustomPromptModel.name.like(f'%{name}%'))
    if prompt_type is not None:
        conditions.append(CustomPromptModel.type == prompt_type)
    if enabled is not None:
        conditions.append(CustomPromptModel.enabled == enabled)
    
    if conditions:
        stmt = stmt.where(and_(*conditions))
    
    stmt = stmt.order_by(CustomPromptModel.create_time.desc())
    return session.exec(stmt).all()


async def list_prompts_page(
    session: SessionDep,
    trans: Trans,
    page_num: int,
    page_size: int,
    name: Optional[str] = None,
    prompt_type: Optional[int] = None,
    enabled: Optional[bool] = None
) -> dict:
    pagination = PaginationParams(page=page_num, size=page_size)
    paginator = Paginator(session)
    
    stmt = select(CustomPromptModel)
    conditions = []
    
    if name is not None:
        conditions.append(CustomPromptModel.name.like(f'%{name}%'))
    if prompt_type is not None:
        conditions.append(CustomPromptModel.type == prompt_type)
    if enabled is not None:
        conditions.append(CustomPromptModel.enabled == enabled)
    
    if conditions:
        stmt = stmt.where(and_(*conditions))
    
    stmt = stmt.order_by(CustomPromptModel.create_time.desc())
    
    prompt_page = await paginator.get_paginated_response(
        stmt=stmt,
        pagination=pagination
    )
    
    return {
        "items": prompt_page.items,
        "page": prompt_page.page,
        "size": prompt_page.size,
        "total": prompt_page.total,
        "total_pages": prompt_page.total_pages
    }

  
def update_prompt(
    session: SessionDep,
    user: CurrentUser,
    trans: Trans,
    prompt_id: int,
    prompt_data: UpdatePromptRequest
) -> CustomPromptModel:
    db_prompt = session.get(CustomPromptModel, prompt_id)
    if not db_prompt:
        raise HTTPException(status_code=404, detail=trans('i18n_custom_prompt.not_exists'))
    
    if db_prompt.oid != user.oid:
        raise HTTPException(status_code=403, detail=trans('i18n_permission.no_permission'))
    
    update_data = prompt_data.model_dump(exclude_unset=True)
    
    if 'name' in update_data:
        check_name_for_update(session, trans, prompt_id, update_data['name'], user.oid)
    
    for field, value in update_data.items():
        if field == 'datasource_ids' and value is None:
            value = []
        setattr(db_prompt, field, value)
    
    session.add(db_prompt)
    session.commit()
    session.refresh(db_prompt)
    return db_prompt


def delete_prompt(
    session: SessionDep,
    user: CurrentUser,
    trans: Trans,
    prompt_ids: List[int]
) -> dict:
    prompts = session.exec(select(CustomPromptModel).where(CustomPromptModel.id.in_(prompt_ids))).all()
    
    for prompt in prompts:
        if prompt.oid != user.oid:
            raise HTTPException(status_code=403, detail=trans('i18n_permission.no_permission'))
    
    for prompt_id in prompt_ids:
        prompt = session.get(CustomPromptModel, prompt_id)
        if prompt:
            session.delete(prompt)
    
    session.commit()
    return {"message": "删除成功", "deleted_count": len(prompt_ids)}


def enable_prompt(
    session: SessionDep,
    user: CurrentUser,
    trans: Trans,
    prompt_id: int,
    enabled: bool
) -> CustomPromptModel:
    db_prompt = session.get(CustomPromptModel, prompt_id)
    if not db_prompt:
        raise HTTPException(status_code=404, detail=trans('i18n_prompt.not_found'))
    
    if db_prompt.oid != user.oid:
        raise HTTPException(status_code=403, detail=trans('i18n_prompt.no_permission'))
    
    db_prompt.enabled = enabled
    session.add(db_prompt)
    session.commit()
    session.refresh(db_prompt)
    return db_prompt


def check_name(session: SessionDep, trans: Trans, prompt: CustomPromptModel):
    stmt = select(CustomPromptModel).where(
        and_(
            CustomPromptModel.name == prompt.name,
            CustomPromptModel.oid == prompt.oid
        )
    )
    existing = session.exec(stmt).first()
    if existing:
        raise HTTPException(status_code=400, detail=trans('i18n_prompt.name_exist'))


def check_name_for_update(session: SessionDep, trans: Trans, prompt_id: int, name: str, oid: int):
    stmt = select(CustomPromptModel).where(
        and_(
            CustomPromptModel.name == name,
            CustomPromptModel.oid == oid,
            CustomPromptModel.id != prompt_id
        )
    )
    existing = session.exec(stmt).first()
    if existing:
        raise HTTPException(status_code=400, detail=trans('i18n_custom_prompt.exists_in_db'))
