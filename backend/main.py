import os
import sys
from typing import Dict, Any

# 添加backend目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 暂时注释掉SQLBot XPack以避免启动问题
# import sqlbot_xpack
from alembic.config import Config
from fastapi import FastAPI, Request
from fastapi.concurrency import asynccontextmanager
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from fastapi_mcp import FastApiMCP
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.cors import CORSMiddleware

from alembic import command
from apps.api import api_router
from apps.swagger.i18n import PLACEHOLDER_PREFIX, tags_metadata, i18n_list
from apps.swagger.i18n import get_translation, DEFAULT_LANG
from apps.system.crud.aimodel_manage import async_model_info
from apps.system.crud.assistant import init_dynamic_cors
from apps.system.middleware.auth import TokenMiddleware
from apps.system.schemas.permission import RequestContextMiddleware
from common.audit.schemas.request_context import RequestContextMiddlewareCommon
from common.core.config import settings
from common.core.response_middleware import ResponseMiddleware, exception_handler
from common.core.sqlbot_cache import init_sqlbot_cache
from common.utils.embedding_threads import fill_empty_terminology_embeddings, fill_empty_data_training_embeddings, \
    fill_empty_table_and_ds_embeddings
from common.utils.utils import SQLBotLogUtil
from common.core.db import get_session

# 解析命令行参数
skip_migrations = "--skip-migrations" in sys.argv


def check_table_exists(table_name: str) -> bool:
    """检查数据库表是否存在"""
    from sqlalchemy import create_engine, text
    from common.core.config import settings
    
    try:
        # 直接创建一个临时连接来检查表是否存在
        engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
        with engine.connect() as conn:
            # 检查表是否存在
            query = text(f"SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '{table_name}')")
            result = conn.execute(query)
            exists = result.scalar()
            return bool(exists)
    except Exception as e:
        SQLBotLogUtil.error(f"检查表是否存在时出错: {str(e)}")
        return False


def run_migrations():
    SQLBotLogUtil.info("开始运行数据库迁移")
    # 首先检查 analysis_result 表是否存在
    table_exists = check_table_exists('analysis_result')
    SQLBotLogUtil.info(f"analysis_result 表存在: {table_exists}")
    SQLBotLogUtil.info(f"skip_migrations: {skip_migrations}")
    
    if not skip_migrations and not table_exists:
        SQLBotLogUtil.info("analysis_result 表不存在，执行数据库迁移")
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    else:
        if skip_migrations:
            SQLBotLogUtil.info("跳过数据库迁移（命令行参数）")
        else:
            SQLBotLogUtil.info("跳过数据库迁移（表已存在）")
    SQLBotLogUtil.info("数据库迁移完成")


def init_terminology_embedding_data():
    fill_empty_terminology_embeddings()


def init_data_training_embedding_data():
    fill_empty_data_training_embeddings()


def init_table_and_ds_embedding():
    fill_empty_table_and_ds_embeddings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 执行数据库迁移，创建所有必要的表结构（容错处理）
    try:
        run_migrations()
    except Exception as e:
        SQLBotLogUtil.warning(f"数据库迁移失败，继续启动: {str(e)}")
    
    try:
        init_sqlbot_cache()
    except Exception as e:
        SQLBotLogUtil.warning(f"缓存初始化失败，继续启动: {str(e)}")
    
    try:
        init_dynamic_cors(app)
    except Exception as e:
        SQLBotLogUtil.warning(f"动态CORS初始化失败，继续启动: {str(e)}")
    
    # 暂时注释掉可能导致问题的初始化步骤
    # init_terminology_embedding_data()
    # init_data_training_embedding_data()
    # init_table_and_ds_embedding()
    SQLBotLogUtil.info("✅ SQLBot 初始化完成")
    # 暂时注释掉SQLBot XPack相关初始化
    # await sqlbot_xpack.core.clean_xpack_cache()
    # await async_model_info()  # 异步加密已有模型的密钥和地址
    # await sqlbot_xpack.core.monitor_app(app)
    yield
    SQLBotLogUtil.info("SQLBot 应用关闭")


def custom_generate_unique_id(route: APIRoute) -> str:
    tag = route.tags[0] if route.tags and len(route.tags) > 0 else ""
    return f"{tag}-{route.name}"


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None
)

# cache docs for different text
_openapi_cache: Dict[str, Dict[str, Any]] = {}

# replace placeholder
def replace_placeholders_in_schema(schema: Dict[str, Any], trans: Dict[str, str]) -> None:
    """
    search OpenAPI schema，replace PLACEHOLDER_xxx to text。
    """
    if isinstance(schema, dict):
        for key, value in schema.items():
            if isinstance(value, str) and value.startswith(PLACEHOLDER_PREFIX):
                placeholder_key = value[len(PLACEHOLDER_PREFIX):]
                schema[key] = trans.get(placeholder_key, value)
            else:
                replace_placeholders_in_schema(value, trans)
    elif isinstance(schema, list):
        for item in schema:
            replace_placeholders_in_schema(item, trans)



# OpenAPI build
def get_language_from_request(request: Request) -> str:
    # get param from query ?lang=zh
    lang = request.query_params.get("lang")
    if lang in i18n_list:
        return lang
    # get lang from Accept-Language Header
    accept_lang = request.headers.get("accept-language", "")
    if "zh" in accept_lang.lower():
        return "zh"
    return DEFAULT_LANG


def generate_openapi_for_lang(lang: str) -> Dict[str, Any]:
    if lang in _openapi_cache:
        return _openapi_cache[lang]

    # tags metadata
    trans = get_translation(lang)
    localized_tags = []
    for tag in tags_metadata:
        desc = tag["description"]
        if desc.startswith(PLACEHOLDER_PREFIX):
            key = desc[len(PLACEHOLDER_PREFIX):]
            desc = trans.get(key, desc)
        localized_tags.append({
            "name": tag["name"],
            "description": desc
        })

    # 1. create OpenAPI
    openapi_schema = get_openapi(
        title="SQLBot API Document" if lang == "en" else "SQLBot API 文档",
        version="1.0.0",
        routes=app.routes,
        tags=localized_tags
    )

    # openapi version
    openapi_schema.setdefault("openapi", "3.1.0")

    # 2. get trans for lang
    trans = get_translation(lang)

    # 3. replace placeholder
    replace_placeholders_in_schema(openapi_schema, trans)

    # 4. cache
    _openapi_cache[lang] = openapi_schema
    return openapi_schema



# custom /openapi.json and /docs
@app.get("/openapi.json", include_in_schema=False)
async def custom_openapi(request: Request):
    lang = get_language_from_request(request)
    schema = generate_openapi_for_lang(lang)
    return JSONResponse(schema)


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui(request: Request):
    lang = get_language_from_request(request)
    from fastapi.openapi.docs import get_swagger_ui_html
    return get_swagger_ui_html(
        openapi_url=f"/openapi.json?lang={lang}",
        title="SQLBot API Docs",
        swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
        swagger_js_url="/swagger-ui-bundle.js",
        swagger_css_url="/swagger-ui.css",
    )


mcp_app = FastAPI()
# mcp server, images path
images_path = settings.MCP_IMAGE_PATH
os.makedirs(images_path, exist_ok=True)
mcp_app.mount("/images", StaticFiles(directory=images_path), name="images")

mcp = FastApiMCP(
    app,
    name="SQLBot MCP Server",
    description="SQLBot MCP Server",
    describe_all_responses=True,
    describe_full_response_schema=True,
    include_operations=["mcp_datasource_list", "get_model_list", "mcp_question", "mcp_start", "mcp_assistant"]
)

mcp.mount(mcp_app)

# Set all CORS enabled origins
# 确保添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8503"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TokenMiddleware)
app.add_middleware(ResponseMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(RequestContextMiddlewareCommon)
app.include_router(api_router, prefix=settings.API_V1_STR)

# Register exception handlers
app.add_exception_handler(StarletteHTTPException, exception_handler.http_exception_handler)
app.add_exception_handler(Exception, exception_handler.global_exception_handler)

mcp.setup_server()

# 暂时注释掉SQLBot XPack的初始化
# sqlbot_xpack.init_fastapi_app(app)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True, reload_excludes=[".venv"]) 
    # uvicorn.run("main:mcp_app", host="0.0.0.0", port=8003) # mcp server
