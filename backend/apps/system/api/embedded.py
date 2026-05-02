from fastapi import APIRouter, HTTPException, Path, Query
from sqlalchemy import and_, select, func
from sqlalchemy.orm import Session

from apps.system.schemas.permission import SqlbotPermission, require_permissions
from common.core.deps import SessionDep, CurrentUser, Trans
from common.audit.models.log_model import OperationType, OperationModules
from common.audit.schemas.logger_decorator import LogConfig, system_log
import random
import string
import time

router = APIRouter(tags=["system/embedded"], prefix="/system/embedded", include_in_schema=False)


def generate_app_id():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=20))


def generate_app_secret():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=40))


@router.get("/{page}/{size}")
async def get_embedded_applications(
    session: SessionDep,
    current_user: CurrentUser,
    page: int = Path(..., description="页码"),
    size: int = Path(..., description="每页大小"),
    keyword: str = Query(None, description="关键词")
):
    try:
        from sqlalchemy import text
        
        # 构建查询
        query = text("SELECT * FROM embedded_application")
        count_query = text("SELECT COUNT(*) FROM embedded_application")
        
        # 添加关键词过滤
        if keyword:
            query = text(f"SELECT * FROM embedded_application WHERE name LIKE '%{keyword}%'")
            count_query = text(f"SELECT COUNT(*) FROM embedded_application WHERE name LIKE '%{keyword}%'")
        
        # 执行计数查询
        total_result = session.execute(count_query)
        total = total_result.scalar()
        
        # 执行分页查询
        offset = (page - 1) * size
        query = text(str(query) + f" LIMIT {size} OFFSET {offset}")
        result = session.execute(query)
        
        # 处理结果
        items = []
        for row in result:
            items.append({
                "id": row.id,
                "name": row.name,
                "app_id": row.app_id,
                "domain": row.domain,
                "type": row.type,
                "description": row.description,
                "create_time": row.create_time
            })
        
        return {
            "items": items,
            "total": total
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/{id}")
async def get_embedded_application(
    session: SessionDep,
    current_user: CurrentUser,
    id: int = Path(..., description="应用ID")
):
    try:
        from sqlalchemy import text
        
        # 查询应用
        query = text("SELECT * FROM embedded_application WHERE id = :id")
        result = session.execute(query, {"id": id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=404,
                detail="Application not found"
            )
        
        return {
            "id": row.id,
            "name": row.name,
            "app_id": row.app_id,
            "app_secret": row.app_secret,
            "domain": row.domain,
            "type": row.type,
            "configuration": row.configuration,
            "description": row.description
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("")
async def create_embedded_application(
    session: SessionDep,
    current_user: CurrentUser,
    data: dict
):
    try:
        from sqlalchemy import text
        
        # 生成唯一的app_id和app_secret
        app_id = generate_app_id()
        app_secret = generate_app_secret()
        current_time = int(time.time() * 1000)
        
        # 插入数据
        query = text("""
            INSERT INTO embedded_application 
            (name, app_id, app_secret, domain, type, configuration, description, create_time, update_time)
            VALUES (:name, :app_id, :app_secret, :domain, :type, :configuration, :description, :create_time, :update_time)
            RETURNING id
        """)
        
        result = session.execute(query, {
            "name": data.get("name"),
            "app_id": app_id,
            "app_secret": app_secret,
            "domain": data.get("domain"),
            "type": data.get("type", 4),
            "configuration": data.get("configuration", "{}"),
            "description": data.get("description", ""),
            "create_time": current_time,
            "update_time": current_time
        })
        
        id = result.scalar()
        session.commit()
        
        return {
            "id": id,
            "name": data.get("name"),
            "app_id": app_id,
            "app_secret": app_secret,
            "domain": data.get("domain"),
            "type": data.get("type", 4),
            "configuration": data.get("configuration", "{}"),
            "description": data.get("description", "")
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.put("")
async def update_embedded_application(
    session: SessionDep,
    current_user: CurrentUser,
    data: dict
):
    try:
        from sqlalchemy import text
        
        current_time = int(time.time() * 1000)
        
        # 更新数据
        query = text("""
            UPDATE embedded_application 
            SET name = :name, domain = :domain, type = :type, 
                configuration = :configuration, description = :description, 
                update_time = :update_time
            WHERE id = :id
        """)
        
        session.execute(query, {
            "id": data.get("id"),
            "name": data.get("name"),
            "domain": data.get("domain"),
            "type": data.get("type", 4),
            "configuration": data.get("configuration", "{}"),
            "description": data.get("description", ""),
            "update_time": current_time
        })
        
        session.commit()
        
        # 获取更新后的数据
        get_query = text("SELECT * FROM embedded_application WHERE id = :id")
        result = session.execute(get_query, {"id": data.get("id")})
        row = result.fetchone()
        
        return {
            "id": row.id,
            "name": row.name,
            "app_id": row.app_id,
            "app_secret": row.app_secret,
            "domain": row.domain,
            "type": row.type,
            "configuration": row.configuration,
            "description": row.description
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.delete("")
async def delete_embedded_applications(
    session: SessionDep,
    current_user: CurrentUser,
    data: list
):
    try:
        from sqlalchemy import text
        
        # 删除应用
        for id in data:
            query = text("DELETE FROM embedded_application WHERE id = :id")
            session.execute(query, {"id": id})
        
        session.commit()
        return {"success": True}
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.patch("/secret/{id}")
async def refresh_embedded_secret(
    session: SessionDep,
    current_user: CurrentUser,
    id: int = Path(..., description="应用ID")
):
    try:
        from sqlalchemy import text
        
        # 生成新的app_secret
        app_secret = generate_app_secret()
        current_time = int(time.time() * 1000)
        
        # 更新密钥
        query = text("""
            UPDATE embedded_application 
            SET app_secret = :app_secret, update_time = :update_time
            WHERE id = :id
        """)
        
        session.execute(query, {
            "id": id,
            "app_secret": app_secret,
            "update_time": current_time
        })
        
        session.commit()
        
        return {
            "id": id,
            "app_secret": app_secret
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
