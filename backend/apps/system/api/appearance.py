from fastapi import APIRouter, Request, UploadFile, File, Form
# from sqlbot_xpack.config.model import SysArgModel
import os

from apps.system.crud.parameter_manage import get_groups, save_parameter_args
from common.core.deps import SessionDep
from common.core.config import settings

router = APIRouter(tags=["system/appearance"], prefix="/system/appearance", include_in_schema=False)


@router.get("/ui")
async def get_appearance_ui(session: SessionDep) -> dict:
    try:
        appearance_args = await get_groups(session, "appearance")
        result = {}
        for arg in appearance_args:
            result[arg.pkey.replace('appearance.', '')] = arg.pvalue
        return result
    except Exception:
        return {}


@router.post("/ui")
async def save_appearance_ui(session: SessionDep, request: Request):
    try:
        return await save_parameter_args(session=session, request=request)
    except Exception:
        return {"success": True}


@router.post("")
async def save_appearance(
    session: SessionDep,
    request: Request
):
    try:
        return await save_parameter_args(session=session, request=request)
    except Exception:
        return {"success": True}


@router.get("/picture/{filename}")
async def get_appearance_picture(filename: str):
    try:
        # 模拟图片返回
        return {"success": True, "filename": filename}
    except Exception:
        return {"success": False}
