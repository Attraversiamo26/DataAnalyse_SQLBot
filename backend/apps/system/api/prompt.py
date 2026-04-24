from fastapi import APIRouter, Path
from sqlmodel import select

from apps.system.models.prompt_model import CustomPromptModel
from apps.system.schemas.permission import SqlbotPermission, require_permissions
from apps.system.schemas.prompt_schema import CreatePromptRequest, UpdatePromptRequest, PromptListItem, PromptResponse
from common.audit.models.log_model import OperationType, OperationModules
from common.audit.schemas.logger_decorator import LogConfig, system_log
from common.core.deps import CurrentUser, SessionDep, Trans
from apps.system.crud import prompt as prompt_crud

router = APIRouter(tags=["system_prompt"], prefix="/system/prompt")


@router.get("", response_model=list[PromptListItem], summary="获取提示词列表", description="获取当前工作空间的所有自定义提示词")
@require_permissions(permission=SqlbotPermission(role=['ws_admin']))
async def list_prompts(session: SessionDep, current_user: CurrentUser, trans: Trans):
    return prompt_crud.list_prompts(session, trans, oid=current_user.oid)


@router.get("/{id}", response_model=PromptResponse, summary="获取单个提示词", description="根据 ID 获取自定义提示词详情")
async def get_prompt(session: SessionDep, id: int = Path(description="提示词 ID"), trans: Trans = None):
    result = prompt_crud.get_prompt(session, trans, id)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"提示词 {id} 不存在")
    return result


@router.post("", summary="创建提示词", description="创建新的自定义提示词")
@require_permissions(permission=SqlbotPermission(role=['ws_admin']))
@system_log(LogConfig(
    operation_type=OperationType.CREATE,
    module=OperationModules.PROMPT_WORDS,
    result_id_expr="result.id"
))
async def create_prompt(
    session: SessionDep,
    current_user: CurrentUser,
    request: CreatePromptRequest,
    trans: Trans
):
    prompt_model = CustomPromptModel(
        oid=current_user.oid,
        type=request.type,
        name=request.name,
        prompt=request.prompt,
        specific_ds=request.specific_ds,
        datasource_ids=request.datasource_ids or [],
        enabled=request.enabled
    )
    return prompt_crud.create_prompt(session, current_user, trans, prompt_model)


@router.put("/{id}", summary="更新提示词", description="更新指定的自定义提示词")
@require_permissions(permission=SqlbotPermission(role=['ws_admin']))
@system_log(LogConfig(
    operation_type=OperationType.UPDATE,
    module=OperationModules.PROMPT_WORDS,
    resource_id_expr="id"
))
async def update_prompt(
    session: SessionDep,
    id: int = Path(description="提示词 ID"),
    request: UpdatePromptRequest = None,
    current_user: CurrentUser = None,
    trans: Trans = None
):
    return prompt_crud.update_prompt(session, current_user, trans, id, request)


@router.delete("/{id}", summary="删除提示词", description="删除指定的自定义提示词")
@require_permissions(permission=SqlbotPermission(role=['ws_admin']))
@system_log(LogConfig(
    operation_type=OperationType.DELETE,
    module=OperationModules.PROMPT_WORDS,
    resource_id_expr="id"
))
async def delete_prompt(session: SessionDep, id: int = Path(description="提示词 ID"), current_user: CurrentUser = None, trans: Trans = None):
    return prompt_crud.delete_prompt(session, current_user, trans, [id])


@router.put("/{id}/enable", summary="启用/禁用提示词", description="切换自定义提示词的启用状态")
@require_permissions(permission=SqlbotPermission(role=['ws_admin']))
@system_log(LogConfig(
    operation_type=OperationType.UPDATE_STATUS,
    module=OperationModules.PROMPT_WORDS,
    resource_id_expr="id"
))
async def enable_prompt(
    session: SessionDep,
    id: int = Path(description="提示词 ID"),
    enabled: bool = ...,
    current_user: CurrentUser = None,
    trans: Trans = None
):
    return prompt_crud.enable_prompt(session, current_user, trans, id, enabled)
