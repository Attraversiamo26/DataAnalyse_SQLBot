from sqlmodel import select
from common.core.sqlbot_cache import cache, clear_cache
from common.core.config import settings
from common.utils.utils import SQLBotLogUtil
from ..models.datasource import CoreDatasource


@cache(namespace="sqlbot:auth", cacheName="ds:id:list", keyExpression="oid")
async def get_ws_ds(session, oid) -> list:
    stmt = select(CoreDatasource.id).distinct().where(CoreDatasource.oid == oid)
    db_list = session.exec(stmt).all()
    return db_list


@clear_cache(namespace="sqlbot:auth", cacheName="ds:id:list", keyExpression="oid")
async def clear_ws_ds_cache(oid):
    SQLBotLogUtil.info(f"ds cache for ws [{oid}] has been cleaned")
