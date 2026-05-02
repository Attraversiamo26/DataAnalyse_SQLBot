from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from common.core.db import get_session
from common.core.deps import get_current_user
from apps.system.models.user import UserModel as User

from .crud.report_template import (
    create_report_template,
    get_report_template,
    get_report_templates,
    update_report_template,
    delete_report_template,
)
from .generators.report_generator import generate_report

router = APIRouter(prefix="/report", tags=["report"])


@router.post("/template", summary="创建报告模板")
async def create_template(
    name: str,
    description: Optional[str] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    template = create_report_template(
        db=db,
        name=name,
        description=description,
        content=content.decode("utf-8"),
        user_id=current_user.id,
    )
    return {"id": template.id, "name": template.name, "message": "模板创建成功"}


@router.get("/template/{template_id}", summary="获取报告模板")
async def get_template(
    template_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    template = get_report_template(db=db, template_id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "content": template.content,
        "created_at": template.created_at,
    }


@router.get("/templates", summary="获取报告模板列表")
async def list_templates(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    templates = get_report_templates(db=db, skip=skip, limit=limit)
    return {
        "items": [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "created_at": t.created_at,
            }
            for t in templates
        ],
        "total": len(templates),
    }


@router.put("/template/{template_id}", summary="更新报告模板")
async def update_template(
    template_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    file: Optional[UploadFile] = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    content = None
    if file:
        content = await file.read()
    
    template = update_report_template(
        db=db,
        template_id=template_id,
        name=name,
        description=description,
        content=content.decode("utf-8") if content else None,
    )
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    return {"id": template.id, "name": template.name, "message": "模板更新成功"}


@router.delete("/template/{template_id}", summary="删除报告模板")
async def delete_template(
    template_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    success = delete_report_template(db=db, template_id=template_id)
    if not success:
        raise HTTPException(status_code=404, detail="模板不存在")
    return {"message": "模板删除成功"}


@router.post("/generate", summary="生成报告")
async def generate_report_endpoint(
    template_id: Optional[int] = None,
    template_content: Optional[str] = None,
    questions: Optional[List[str]] = None,
    data: Optional[dict] = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not template_id and not template_content:
        raise HTTPException(status_code=400, detail="必须提供模板ID或模板内容")
    
    content = template_content
    if template_id:
        template = get_report_template(db=db, template_id=template_id)
        if not template:
            raise HTTPException(status_code=404, detail="模板不存在")
        content = template.content
    
    result = await generate_report(content=content, questions=questions, data=data)
    return {"report": result}