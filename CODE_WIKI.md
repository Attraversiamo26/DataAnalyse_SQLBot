# YZ_DataAnalyseBot 项目 Code Wiki

## 目录

1. [项目概述](#项目概述)
2. [整体架构](#整体架构)
3. [技术栈](#技术栈)
4. [项目结构](#项目结构)
5. [核心模块详解](#核心模块详解)
6. [关键类与函数说明](#关键类与函数说明)
7. [数据库设计](#数据库设计)
8. [API接口说明](#api接口说明)
9. [技能系统](#技能系统)
10. [依赖关系](#依赖关系)
11. [项目运行方式](#项目运行方式)
12. [开发指南](#开发指南)

---

## 项目概述

### 简介

YZ_DataAnalyseBot 是一款基于大语言模型（LLM）和 RAG（检索增强生成）技术的智能问数系统。该系统实现了对话式数据分析（ChatBI），用户可以通过自然语言提问，系统自动生成 SQL 查询并返回数据结果及可视化图表。

### 核心特性

- **开箱即用**：简单配置大模型与数据源即可快速开启智能问数
- **Text-to-SQL**：基于大模型和 RAG 技术实现高质量的自然语言转 SQL
- **安全可控**：工作空间级资源隔离，细粒度数据权限配置
- **易于集成**：支持 Web 嵌入、弹窗嵌入、MCP 调用等多种集成方式
- **持续优化**：支持自定义提示词、术语库配置，效果随使用逐步提升

### 工作原理

```
用户提问 → 自然语言理解 → RAG检索相关表/字段 → 生成SQL → 执行查询 → 数据可视化 → 智能分析
```

---

## 整体架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端层 (Frontend)                        │
│  Vue 3 + TypeScript + Element Plus + AntV G2/S2                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                         后端层 (Backend)                         │
│  FastAPI + SQLModel + LangChain + LangGraph                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Chat 模块   │  │ Datasource   │  │  AI Model    │          │
│  │  对话问答    │  │  数据源管理   │  │  模型管理    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Skill Manager│  │   Report     │  │   System     │          │
│  │  技能管理    │  │   报告生成   │  │   系统管理   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         数据层 (Data Layer)                      │
│  PostgreSQL + pgvector    │    多种数据源    │    文件存储       │
│  (主数据库+向量存储)        │  MySQL/Oracle等  │   Excel/PDF      │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      外部服务层 (External Services)               │
│  大语言模型 (OpenAI/通义千问/本地模型)  │  MCP Server            │
└─────────────────────────────────────────────────────────────────┘
```

### 核心流程

1. **问答流程**：用户提问 → LLM理解意图 → RAG检索相关知识 → 生成SQL → 执行查询 → 生成图表
2. **技能执行流程**：技能识别 → 参数解析 → 工作流执行 → 结果输出
3. **报告生成流程**：数据收集 → 模板渲染 → 文档生成 → 导出下载

---

## 技术栈

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.11 | 主要编程语言 |
| FastAPI | 0.115.12+ | Web框架 |
| SQLModel | 0.0.21+ | ORM框架 |
| LangChain | 0.3+ | LLM应用框架 |
| LangGraph | 0.3+ | 工作流编排 |
| PostgreSQL | - | 主数据库 + pgvector向量存储 |
| Alembic | 1.12.1+ | 数据库迁移 |
| Pydantic | 2.7.4+ | 数据验证 |
| sentence-transformers | 4.0.2+ | 文本嵌入 |

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.13 | 前端框架 |
| TypeScript | 5.7.2 | 类型支持 |
| Vite | 6.3.1 | 构建工具 |
| Element Plus | 2.10.1 | UI组件库 |
| AntV G2 | 5.3.3 | 图表库 |
| AntV S2 | 2.4.3 | 表格组件 |
| Pinia | 3.0.2 | 状态管理 |
| Vue Router | 4.5.0 | 路由管理 |

### 支持的数据源

- MySQL / MariaDB
- PostgreSQL
- Oracle
- Microsoft SQL Server
- ClickHouse
- Elasticsearch
- Doris / StarRocks
- 达梦数据库 (DM)
- 人大金仓 (Kingbase)
- AWS Redshift
- Excel 文件

---

## 项目结构

```
DataAnalyse_SQLBot-main/
├── backend/                    # 后端代码
│   ├── alembic/               # 数据库迁移脚本
│   │   └── versions/          # 迁移版本文件
│   ├── apps/                  # 应用模块
│   │   ├── ai_model/         # AI模型管理
│   │   │   ├── openai/       # OpenAI集成
│   │   │   ├── embedding.py  # 向量嵌入
│   │   │   ├── llm.py        # LLM基础类
│   │   │   └── model_factory.py # 模型工厂
│   │   ├── chat/             # 对话问答模块
│   │   │   ├── api/          # API接口
│   │   │   ├── curd/         # 数据库操作
│   │   │   ├── models/       # 数据模型
│   │   │   └── task/         # 任务处理
│   │   ├── dashboard/        # 仪表盘模块
│   │   ├── data_agent/       # 数据代理模块
│   │   ├── data_training/    # 数据训练模块
│   │   ├── datasource/       # 数据源管理
│   │   │   ├── api/          # API接口
│   │   │   ├── crud/         # 数据库操作
│   │   │   ├── embedding/    # 向量嵌入
│   │   │   ├── models/       # 数据模型
│   │   │   └── utils/        # 工具函数
│   │   ├── db/               # 数据库引擎
│   │   ├── home/             # 首页模块
│   │   ├── mcp/              # MCP服务
│   │   ├── report/           # 报告生成
│   │   ├── settings/         # 系统设置
│   │   ├── skill_manager/    # 技能管理器
│   │   ├── swagger/          # API文档
│   │   ├── system/           # 系统管理
│   │   │   ├── api/          # API接口
│   │   │   ├── crud/         # 数据库操作
│   │   │   ├── middleware/   # 中间件
│   │   │   ├── models/       # 数据模型
│   │   │   └── schemas/      # 数据模式
│   │   ├── template/         # 模板管理
│   │   ├── terminology/      # 术语库
│   │   └── api.py            # API路由汇总
│   ├── common/               # 公共模块
│   │   ├── audit/           # 审计日志
│   │   ├── core/            # 核心功能
│   │   │   ├── config.py    # 配置管理
│   │   │   ├── db.py        # 数据库连接
│   │   │   ├── deps.py      # 依赖注入
│   │   │   ├── security.py  # 安全认证
│   │   │   └── sqlbot_cache.py # 缓存管理
│   │   └── utils/           # 工具函数
│   ├── locales/             # 国际化文件
│   ├── scripts/             # 脚本文件
│   ├── sqlbot_xpack/        # 扩展包
│   ├── templates/           # 模板文件
│   │   └── sql_examples/    # SQL示例
│   ├── main.py              # 应用入口
│   └── pyproject.toml       # 项目配置
├── frontend/                 # 前端代码
│   ├── public/              # 静态资源
│   ├── src/                 # 源代码
│   │   ├── api/            # API接口
│   │   ├── assets/         # 资源文件
│   │   ├── components/     # 组件
│   │   ├── i18n/           # 国际化
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # 状态管理
│   │   ├── styles/         # 样式文件
│   │   ├── utils/          # 工具函数
│   │   └── views/          # 页面视图
│   ├── index.html          # 入口HTML
│   └── package.json        # 项目配置
├── data/                    # 数据目录
│   ├── excel/              # Excel文件
│   ├── logs/               # 日志文件
│   └── skills/             # 技能定义
│       ├── line-five-stage-time-benchmark-analysis/
│       ├── export-link-drilldown-analysis/
│       ├── import-link-drilldown-analysis/
│       ├── delivery-stage-drilldown-analysis/
│       ├── transit-link-drilldown-analysis/
│       ├── pickup-stage-drilldown-analysis/
│       ├── pickup-institution-drilldown-analysis/
│       └── export-institution-drilldown-analysis/
├── docs/                    # 文档
├── DataAgent-main/         # DataAgent子项目
├── docker-compose.yaml     # Docker编排配置
├── Dockerfile              # Docker镜像构建
└── README.md               # 项目说明
```

---

## 核心模块详解

### 1. Chat 模块（对话问答）

**位置**: `backend/apps/chat/`

**职责**:
- 管理对话会话和记录
- 处理用户提问并生成SQL
- 执行SQL查询并返回结果
- 生成图表配置
- 支持智能分析和预测

**核心组件**:
- `api/chat.py`: 对话API接口
- `curd/chat.py`: 数据库CRUD操作
- `models/chat_model.py`: 数据模型定义
- `task/llm.py`: LLM服务核心逻辑

**关键流程**:
```
用户提问 → 创建ChatRecord → LLM生成SQL → 执行SQL → 生成图表 → 保存结果
```

### 2. Datasource 模块（数据源管理）

**位置**: `backend/apps/datasource/`

**职责**:
- 管理多种数据源连接
- 同步表结构和字段信息
- 提供数据预览功能
- 管理数据权限

**核心组件**:
- `api/datasource.py`: 数据源API
- `crud/datasource.py`: 数据源操作
- `crud/table.py`: 表管理
- `crud/field.py`: 字段管理
- `embedding/utils.py`: 向量嵌入

**支持的数据源类型**:
```python
# 数据源类型映射
DATASOURCE_TYPES = {
    'mysql': MySQL,
    'postgresql': PostgreSQL,
    'oracle': Oracle,
    'sqlserver': SQLServer,
    'clickhouse': ClickHouse,
    'elasticsearch': Elasticsearch,
    'doris': Doris,
    'excel': Excel
}
```

### 3. AI Model 模块（AI模型管理）

**位置**: `backend/apps/ai_model/`

**职责**:
- 管理大语言模型配置
- 提供统一的模型调用接口
- 处理文本嵌入向量

**核心组件**:
- `model_factory.py`: 模型工厂，创建不同类型的LLM实例
- `embedding.py`: 文本嵌入服务
- `llm.py`: LLM基础类

**支持的模型类型**:
- OpenAI (GPT-3.5, GPT-4)
- 通义千问 (Qwen)
- 本地模型 (通过 LangChain)
- 自定义模型

### 4. Skill Manager 模块（技能管理）

**位置**: `backend/apps/skill_manager/`

**职责**:
- 管理技能定义和配置
- 解析用户意图匹配技能
- 执行技能工作流
- 管理技能链式调用

**核心组件**:
- `skill_manager.py`: 技能管理器核心
- `skill_model.py`: 技能数据模型
- `intent_parser.py`: 意图解析器
- `api.py`: 技能API接口

**技能工作流**:
```yaml
# 技能定义示例
skill_id: line-five-stage-time-benchmark-analysis
name: 线路五环节时限对标分析
description: 分析线路的五个环节时限并生成报告
workflow:
  - step_1: 获取数据
  - step_2: 计算指标
  - step_3: 生成图表
  - step_4: 生成报告
```

### 5. System 模块（系统管理）

**位置**: `backend/apps/system/`

**职责**:
- 用户认证与授权
- 工作空间管理
- 助手配置
- API密钥管理
- 系统参数配置

**核心组件**:
- `api/login.py`: 登录认证
- `api/user.py`: 用户管理
- `api/workspace.py`: 工作空间管理
- `api/assistant.py`: 助手管理
- `middleware/auth.py`: 认证中间件

### 6. Report 模块（报告生成）

**位置**: `backend/apps/report/`

**职责**:
- 管理报告模板
- 生成分析报告
- 支持多种输出格式（PDF、Word、PPT）

**核心组件**:
- `api.py`: 报告API
- `generators/report_generator.py`: 报告生成器
- `crud/report_template.py`: 模板管理

### 7. Terminology 模块（术语库）

**位置**: `backend/apps/terminology/`

**职责**:
- 管理业务术语定义
- 提供术语向量检索
- 增强SQL生成准确性

**核心组件**:
- `api/terminology.py`: 术语API
- `curd/terminology.py`: 术语操作

---

## 关键类与函数说明

### 1. LLMService 类

**位置**: `backend/apps/chat/task/llm.py`

**职责**: 核心LLM服务类，处理问答流程

**关键属性**:
```python
class LLMService:
    ds: CoreDatasource              # 数据源
    chat_question: ChatQuestion     # 用户问题
    record: ChatRecord              # 对话记录
    config: LLMConfig               # LLM配置
    llm: BaseChatModel              # LLM实例
    sql_message: List               # SQL生成消息
    chart_message: List             # 图表生成消息
    current_user: CurrentUser       # 当前用户
    current_assistant: Assistant    # 当前助手
```

**关键方法**:
```python
# 创建LLM服务实例
@staticmethod
async def create(session, current_user, chat_question, current_assistant, embedding) -> LLMService

# 初始化对话记录
def init_record(self, session)

# 异步运行任务
def run_task_async(self, in_chat, stream, finish_step)

# 运行分析或预测任务
def run_analysis_or_predict_task_async(self, session, action_type, record, in_chat, stream)

# 生成推荐问题
def run_recommend_questions_task_async(self)
```

### 2. Settings 配置类

**位置**: `backend/common/core/config.py`

**职责**: 全局配置管理

**关键配置项**:
```python
class Settings(BaseSettings):
    PROJECT_NAME: str = "YZ_DataAnalyseBot"    # 项目名称
    SECRET_KEY: str                        # 密钥
    ACCESS_TOKEN_EXPIRE_MINUTES: int       # Token过期时间

    # 数据库配置
    POSTGRES_SERVER: str                   # PostgreSQL服务器
    POSTGRES_PORT: int                     # 端口
    POSTGRES_USER: str                     # 用户名
    POSTGRES_PASSWORD: str                 # 密码
    POSTGRES_DB: str                       # 数据库名

    # 缓存配置
    CACHE_TYPE: str                        # 缓存类型
    CACHE_REDIS_URL: str                   # Redis URL

    # 嵌入配置
    EMBEDDING_ENABLED: bool                # 是否启用嵌入
    EMBEDDING_DEFAULT_SIMILARITY: float    # 默认相似度阈值

    # 路径配置
    EXCEL_PATH: str                        # Excel路径
    MCP_IMAGE_PATH: str                    # MCP图片路径
    LOCAL_MODEL_PATH: str                  # 本地模型路径
```

### 3. ChatRecord 模型

**位置**: `backend/apps/chat/models/chat_model.py`

**职责**: 对话记录数据模型

**关键字段**:
```python
class ChatRecord(SQLModel, table=True):
    id: int                               # 记录ID
    chat_id: int                          # 会话ID
    question: str                         # 用户问题
    sql: str                              # 生成的SQL
    data: dict                            # 查询结果数据
    chart: dict                           # 图表配置
    analysis: str                         # 分析结果
    predict_data: dict                    # 预测数据
    ai_modal_id: int                      # AI模型ID
    create_time: datetime                 # 创建时间
    create_by: int                        # 创建者
```

### 4. CoreDatasource 模型

**位置**: `backend/apps/datasource/models/datasource.py`

**职责**: 数据源数据模型

**关键字段**:
```python
class CoreDatasource(SQLModel, table=True):
    id: int                               # 数据源ID
    name: str                             # 数据源名称
    description: str                      # 描述
    type: str                             # 类型
    type_name: str                        # 类型名称
    configuration: str                    # 连接配置(JSON)
    create_time: datetime                 # 创建时间
    create_by: int                        # 创建者
    status: str                           # 状态
    oid: int                              # 工作空间ID
    table_relation: List                  # 表关系
    embedding: str                        # 向量嵌入
```

### 5. SkillManager 类

**位置**: `backend/apps/skill_manager/skill_manager.py`

**职责**: 技能管理核心类

**关键方法**:
```python
class SkillManager:
    # 加载所有技能
    def load_skills(self) -> List[SkillInfo]

    # 根据ID获取技能
    def get_skill_by_id(self, skill_id: str) -> Optional[SkillInfo]

    # 执行技能
    async def execute_skill(
        self,
        skill_id: str,
        params: Dict[str, Any],
        session: Session,
        user: CurrentUser
    ) -> SkillExecutionResult

    # 解析用户意图匹配技能
    def match_skill_by_intent(self, question: str) -> Optional[SkillInfo]
```

### 6. 关键函数

#### 数据库操作函数

**位置**: `backend/apps/db/db.py`

```python
# 执行SQL查询
def exec_sql(ds: CoreDatasource, sql: str) -> List[Dict]

# 获取数据库版本
def get_version(ds: CoreDatasource) -> str

# 检查数据库连接
def check_connection(ds: CoreDatasource) -> bool

# 获取表结构
def get_schema(ds: CoreDatasource, table_name: str) -> List[Dict]
```

#### 向量嵌入函数

**位置**: `backend/apps/datasource/embedding/utils.py`

```python
# 生成文本嵌入向量
def generate_embedding(text: str) -> List[float]

# 计算相似度
def calculate_similarity(vec1: List[float], vec2: List[float]) -> float

# 检索相似内容
def search_similar(query: str, top_k: int) -> List[Dict]
```

---

## 数据库设计

### 核心表结构

#### 1. chat（对话会话表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInteger | 主键 |
| oid | BigInteger | 工作空间ID |
| create_time | DateTime | 创建时间 |
| create_by | BigInteger | 创建者ID |
| brief | VARCHAR(64) | 会话标题 |
| chat_type | VARCHAR(20) | 会话类型 |
| datasource | BigInteger | 数据源ID |
| engine_type | VARCHAR(64) | 引擎类型 |
| origin | Integer | 来源(0:默认, 1:MCP, 2:助手) |
| brief_generate | Boolean | 是否生成标题 |
| recommended_question | Text | 推荐问题 |

#### 2. chat_record（对话记录表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInteger | 主键 |
| chat_id | BigInteger | 会话ID |
| question | Text | 用户问题 |
| sql | Text | 生成的SQL |
| data | JSONB | 查询结果 |
| chart | JSONB | 图表配置 |
| analysis | Text | 分析结果 |
| predict_data | JSONB | 预测数据 |
| ai_modal_id | BigInteger | AI模型ID |
| create_time | DateTime | 创建时间 |
| create_by | BigInteger | 创建者ID |
| first_chat | Boolean | 是否首次提问 |
| regenerate_record_id | BigInteger | 重新生成记录ID |
| analysis_record_id | BigInteger | 分析记录ID |
| predict_record_id | BigInteger | 预测记录ID |

#### 3. core_datasource（数据源表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInteger | 主键 |
| name | VARCHAR(128) | 数据源名称 |
| description | VARCHAR(512) | 描述 |
| type | VARCHAR(64) | 类型 |
| type_name | VARCHAR(64) | 类型名称 |
| configuration | Text | 连接配置(JSON) |
| create_time | DateTime | 创建时间 |
| create_by | BigInteger | 创建者ID |
| status | VARCHAR(64) | 状态 |
| num | VARCHAR(256) | 编号 |
| oid | BigInteger | 工作空间ID |
| table_relation | JSONB | 表关系 |
| embedding | Text | 向量嵌入 |
| recommended_config | BigInteger | 推荐配置 |

#### 4. core_table（数据表表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInteger | 主键 |
| ds_id | BigInteger | 数据源ID |
| checked | Boolean | 是否选中 |
| table_name | Text | 表名 |
| table_comment | Text | 表注释 |
| custom_comment | Text | 自定义注释 |
| embedding | Text | 向量嵌入 |

#### 5. core_field（字段表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInteger | 主键 |
| ds_id | BigInteger | 数据源ID |
| table_id | BigInteger | 表ID |
| checked | Boolean | 是否选中 |
| field_name | Text | 字段名 |
| field_type | VARCHAR(128) | 字段类型 |
| field_comment | Text | 字段注释 |
| custom_comment | Text | 自定义注释 |
| field_index | BigInteger | 字段序号 |

#### 6. chat_log（对话日志表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInteger | 主键 |
| type | Enum | 类型 |
| operate | Enum | 操作类型 |
| pid | BigInteger | 父ID |
| ai_modal_id | BigInteger | AI模型ID |
| base_modal | VARCHAR(255) | 基础模型 |
| messages | JSONB | 消息列表 |
| reasoning_content | Text | 推理内容 |
| start_time | DateTime | 开始时间 |
| finish_time | DateTime | 结束时间 |
| token_usage | JSONB | Token使用量 |
| error | Boolean | 是否错误 |

### 数据库迁移

项目使用 Alembic 进行数据库版本管理：

```bash
# 生成迁移脚本
alembic revision --autogenerate -m "description"

# 执行迁移
alembic upgrade head

# 回退迁移
alembic downgrade -1
```

迁移脚本位置: `backend/alembic/versions/`

---

## API接口说明

### API 路由结构

**位置**: `backend/apps/api.py`

```python
api_router = APIRouter()
api_router.include_router(login.router)           # 登录认证
api_router.include_router(user.router)            # 用户管理
api_router.include_router(workspace.router)       # 工作空间
api_router.include_router(assistant.router)       # 助手管理
api_router.include_router(aimodel.router)         # AI模型
api_router.include_router(terminology.router)     # 术语库
api_router.include_router(data_training.router)   # 数据训练
api_router.include_router(datasource)             # 数据源
api_router.include_router(chat.router)            # 对话问答
api_router.include_router(dashboard_api.router)   # 仪表盘
api_router.include_router(mcp.router)             # MCP服务
api_router.include_router(skill_manager_router)   # 技能管理
api_router.include_router(report_router)          # 报告生成
```

### 核心 API 接口

#### 1. 对话问答 API

**基础路径**: `/api/v1/chat`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /list | 获取对话列表 |
| GET | /{chat_id} | 获取对话详情 |
| POST | /start | 开始新对话 |
| POST | /question | 提问问题 |
| POST | /rename | 重命名对话 |
| DELETE | /{chat_id}/{brief} | 删除对话 |
| GET | /record/{record_id}/data | 获取记录数据 |
| POST | /record/{record_id}/analysis | 分析数据 |
| POST | /record/{record_id}/predict | 预测数据 |
| GET | /record/{record_id}/excel/export/{chat_id} | 导出Excel |

**请求示例**:
```json
// POST /api/v1/chat/question
{
  "chat_id": 123,
  "question": "查询上个月的销售总额",
  "datasource_id": 1
}
```

**响应示例**:
```json
{
  "type": "sql",
  "content": "SELECT SUM(amount) as total FROM sales WHERE..."
}
{
  "type": "data",
  "content": {"fields": [...], "data": [...]}
}
{
  "type": "chart",
  "content": {"chart_type": "bar", "config": {...}}
}
```

#### 2. 数据源 API

**基础路径**: `/api/v1/datasource`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /list | 获取数据源列表 |
| POST | /get/{id} | 获取数据源详情 |
| POST | /add | 添加数据源 |
| POST | /check | 检查连接状态 |
| DELETE | /{id} | 删除数据源 |
| POST | /chooseTables/{id} | 选择表 |
| GET | /tables/{id} | 获取表列表 |
| GET | /fields/{table_id} | 获取字段列表 |
| POST | /preview | 预览数据 |

#### 3. 技能管理 API

**基础路径**: `/api/v1/skill-manager`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /skills | 获取技能列表 |
| GET | /skills/{skill_id} | 获取技能详情 |
| POST | /skills/{skill_id}/execute | 执行技能 |
| POST | /skills/match | 匹配技能 |

#### 4. 系统管理 API

**基础路径**: `/api/v1`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /login | 用户登录 |
| POST | /logout | 用户登出 |
| GET | /users | 获取用户列表 |
| POST | /users | 创建用户 |
| GET | /workspaces | 获取工作空间列表 |
| GET | /assistants | 获取助手列表 |
| GET | /ai-models | 获取AI模型列表 |

### API 认证

所有API请求需要在Header中携带Token：

```
X-YZ_DATANALYSEBOT-TOKEN: <your_token>
```

或对于助手模式：

```
X-YZ_DATANALYSEBOT-ASSISTANT-TOKEN: <assistant_token>
```

### API 文档

访问 Swagger UI 文档：
- 中文文档: `http://localhost:8000/docs?lang=zh`
- 英文文档: `http://localhost:8000/docs?lang=en`

---

## 技能系统

### 技能概述

技能系统是 YZ_DataAnalyseBot 的扩展机制，允许用户定义和执行复杂的数据分析工作流。每个技能包含：

- **技能定义**: 描述技能的元数据
- **工作流**: 定义执行步骤
- **输入参数**: 技能接收的参数
- **输出定义**: 技能的输出结果

### 技能目录结构

```
data/skills/
├── line-five-stage-time-benchmark-analysis/    # 线路五环节时限对标分析
│   ├── SKILL.md                               # 技能说明
│   ├── workflow.yaml                          # 工作流定义
│   ├── analyze.js                             # 分析脚本
│   └── 输出结果/                              # 输出目录
├── export-link-drilldown-analysis/            # 出口环节下钻分析
├── import-link-drilldown-analysis/            # 进口环节下钻分析
├── delivery-stage-drilldown-analysis/         # 投递环节下钻分析
├── transit-link-drilldown-analysis/           # 中转环节下钻分析
├── pickup-stage-drilldown-analysis/           # 收寄环节下钻分析
├── pickup-institution-drilldown-analysis/     # 收寄机构下钻分析
└── export-institution-drilldown-analysis/     # 出口机构下钻分析
```

### 技能定义示例

```yaml
# workflow.yaml
skill_id: line-five-stage-time-benchmark-analysis
name: 线路五环节时限对标分析
description: 分析指定线路的五个环节时限，生成对标分析报告
version: 1.0.0
language: javascript

input_params:
  - name: route_name
    type: string
    description: 线路名称
    required: true
  - name: start_date
    type: date
    description: 开始日期
    required: true
  - name: end_date
    type: date
    description: 结束日期
    required: true

output_format:
  - name: ppt_report
    type: file
    description: PPT报告
  - name: pdf_summary
    type: file
    description: PDF摘要
  - name: key_problem_stage
    type: string
    description: 关键问题环节
  - name: metrics
    type: object
    description: 指标数据

workflow:
  - step: step_1_get_data
    action: query_data
    params:
      sql_template: "SELECT * FROM routes WHERE route_name = ?"

  - step: step_2_calc_metrics
    action: calculate
    script: analyze.js

  - step: step_3_generate_charts
    action: generate_charts
    template: chart_template.json

  - step: step_4_identify_problem
    action: analyze
    model: gpt-4

  - step: step_5_generate_ppt
    action: generate_document
    template: ppt_template.pptx

  - step: step_6_generate_pdf
    action: generate_document
    template: pdf_template.pdf

chain_triggers:
  - skill_id: export-link-drilldown-analysis
    trigger_type: on_user_confirm
    params_mapping:
      route_name: "${params.route_name}"
```

### 技能执行流程

```
1. 用户输入问题
   ↓
2. IntentParser 解析意图
   ↓
3. SkillManager 匹配技能
   ↓
4. 验证输入参数
   ↓
5. 执行工作流步骤
   ├── 查询数据
   ├── 计算指标
   ├── 生成图表
   ├── 分析问题
   └── 生成报告
   ↓
6. 返回执行结果
   ↓
7. 触发链式技能（可选）
```

### 技能开发指南

#### 1. 创建技能目录

```bash
mkdir -p data/skills/my-skill
cd data/skills/my-skill
```

#### 2. 编写技能说明 (SKILL.md)

```markdown
# 技能名称

## 功能描述
描述技能的功能和用途

## 输入参数
- param1: 参数说明
- param2: 参数说明

## 输出结果
- output1: 输出说明
- output2: 输出说明

## 使用示例
示例调用方式
```

#### 3. 定义工作流 (workflow.yaml)

```yaml
skill_id: my-skill
name: 我的技能
description: 技能描述
version: 1.0.0

input_params:
  - name: param1
    type: string
    required: true

output_format:
  - name: result
    type: object

workflow:
  - step: step_1
    action: custom_action
    script: analyze.js
```

#### 4. 编写分析脚本 (analyze.js)

```javascript
async function execute(params, context) {
  // 获取数据
  const data = await context.query(sql);

  // 处理数据
  const result = processData(data);

  // 返回结果
  return {
    result: result
  };
}

module.exports = { execute };
```

---

## 依赖关系

### 后端依赖关系图

```
main.py
├── apps.api
│   ├── chat.api.chat
│   │   ├── chat.curd.chat
│   │   ├── chat.task.llm
│   │   │   ├── ai_model.model_factory
│   │   │   ├── datasource.crud.datasource
│   │   │   └── terminology.curd.terminology
│   │   └── chat.models.chat_model
│   ├── datasource.api.datasource
│   │   ├── datasource.crud.datasource
│   │   ├── datasource.crud.table
│   │   ├── datasource.crud.field
│   │   └── db.engine
│   ├── skill_manager.api
│   │   ├── skill_manager.skill_manager
│   │   └── skill_manager.intent_parser
│   └── system.api.*
│       ├── system.crud.*
│       └── system.middleware.auth
├── common.core.config
├── common.core.db
├── common.core.security
└── common.utils.*
```

### 模块依赖关系

```
┌─────────────┐
│    Chat     │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ↓              ↓              ↓
┌─────────────┐ ┌──────────┐ ┌────────────┐
│  AI Model   │ │Datasource│ │Terminology │
└─────────────┘ └──────────┘ └────────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ↓
              ┌──────────────┐
              │   Database   │
              └──────────────┘
```

### 外部服务依赖

```
YZ_DataAnalyseBot
├── 大语言模型服务
│   ├── OpenAI API
│   ├── 通义千问 API
│   └── 本地模型服务
├── 数据库服务
│   ├── PostgreSQL (主数据库)
│   ├── MySQL
│   ├── Oracle
│   └── 其他数据源
├── 缓存服务
│   └── Redis (可选)
└── 文件存储
    ├── Excel文件
    ├── PDF文件
    └── 图片文件
```

---

## 项目运行方式

### 环境要求

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (带 pgvector 扩展)
- Docker (可选，用于容器化部署)

### 本地开发环境搭建

#### 1. 克隆项目

```bash
git clone https://github.com/your-repo/YZ_DataAnalyseBot.git
cd YZ_DataAnalyseBot
```

#### 2. 后端配置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等

# 初始化数据库
alembic upgrade head

# 启动后端服务
python main.py
# 或
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. 前端配置

```bash
cd frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产构建
npm run build
```

### Docker 部署

#### 方式一：使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 方式二：使用 Docker 命令

```bash
docker run -d \
  --name yz_dataanalysebot \
  --restart unless-stopped \
  -p 8000:8000 \
  -p 8001:8001 \
  -v ./data/yz_dataanalysebot/excel:/opt/yz_dataanalysebot/data/excel \
  -v ./data/yz_dataanalysebot/file:/opt/yz_dataanalysebot/data/file \
  -v ./data/yz_dataanalysebot/images:/opt/yz_dataanalysebot/images \
  -v ./data/yz_dataanalysebot/logs:/opt/yz_dataanalysebot/app/logs \
  -v ./data/postgresql:/var/lib/postgresql/data \
  --privileged=true \
  your-repo/yz_dataanalysebot
```

### 环境变量配置

#### 后端环境变量

```bash
# .env 文件配置示例

# 项目基础配置
PROJECT_NAME=YZ_DataAnalyseBot
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# 数据库配置
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=yz_dataanalysebot

# 前端地址
FRONTEND_HOST=http://localhost:8504

# CORS配置
BACKEND_CORS_ORIGINS=http://localhost,http://localhost:5173

# 日志配置
LOG_LEVEL=INFO
SQL_DEBUG=False

# 缓存配置
CACHE_TYPE=memory  # 或 redis
CACHE_REDIS_URL=redis://localhost:6379/0

# 嵌入配置
EMBEDDING_ENABLED=True
EMBEDDING_DEFAULT_SIMILARITY=0.4

# 文件路径
EXCEL_PATH=/path/to/excel
MCP_IMAGE_PATH=/path/to/images
LOCAL_MODEL_PATH=/path/to/models
```

#### 前端环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api/v1

# .env.production
VITE_API_BASE_URL=/api/v1
```

### 访问应用

- 前端界面: `http://localhost:8000`
- API文档: `http://localhost:8000/docs`
- 默认账号: `admin`
- 默认密码: `YZ_DataAnalyseBot@123456`

### 常用命令

```bash
# 后端开发
python main.py                          # 启动开发服务器
alembic upgrade head                    # 执行数据库迁移
alembic revision --autogenerate -m "msg" # 生成迁移脚本
pytest                                  # 运行测试
ruff check .                            # 代码检查

# 前端开发
npm run dev                             # 启动开发服务器
npm run build                           # 生产构建
npm run lint                            # 代码检查

# Docker
docker-compose up -d                    # 启动服务
docker-compose logs -f                  # 查看日志
docker-compose down                     # 停止服务
docker-compose restart                  # 重启服务
```

---

## 开发指南

### 代码规范

#### Python 代码规范

- 遵循 PEP 8 规范
- 使用 Ruff 进行代码检查
- 使用类型注解
- 函数和类添加文档字符串

```python
def get_datasource_list(
    session: SessionDep,
    user: CurrentUser
) -> List[CoreDatasource]:
    """
    获取用户有权限的数据源列表

    Args:
        session: 数据库会话
        user: 当前用户

    Returns:
        数据源列表
    """
    pass
```

#### TypeScript/Vue 代码规范

- 使用 ESLint + Prettier
- 使用 TypeScript 类型
- 组件使用 Composition API

```typescript
// 组件示例
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  title: string
}

const props = defineProps<Props>()
const data = ref<any[]>([])

onMounted(async () => {
  // 初始化逻辑
})
</script>
```

### 添加新数据源

1. 在 `backend/apps/db/` 创建引擎文件
2. 在 `backend/apps/datasource/models/datasource.py` 添加类型
3. 在 `backend/templates/sql_examples/` 添加SQL模板
4. 更新文档

### 添加新API接口

1. 在对应模块的 `api/` 目录创建接口
2. 在 `models/` 定义数据模型
3. 在 `curd/` 实现数据库操作
4. 在 `apps/api.py` 注册路由
5. 添加API文档注释

### 添加新技能

1. 在 `data/skills/` 创建技能目录
2. 编写 `SKILL.md` 技能说明
3. 创建 `workflow.yaml` 工作流定义
4. 编写分析脚本
5. 在 `skill_manager.py` 注册技能

### 调试技巧

#### 后端调试

```python
# 启用调试日志
LOG_LEVEL=DEBUG

# 打印SQL语句
SQL_DEBUG=True

# 使用断点
import pdb; pdb.set_trace()
```

#### 前端调试

```javascript
// 使用 Vue DevTools
// 在代码中使用 console.log
console.log('debug info:', data)
```

### 测试

```bash
# 后端测试
cd backend
pytest tests/ -v

# 前端测试
cd frontend
npm run test
```

### 日志查看

```bash
# 查看后端日志
tail -f backend/logs/debug.log

# 查看Docker日志
docker logs yz_dataanalysebot -f
```

---

## 附录

### 常见问题

#### 1. 数据库连接失败

检查以下配置：
- PostgreSQL 服务是否启动
- 连接参数是否正确
- 防火墙是否开放端口

#### 2. AI模型调用失败

检查以下配置：
- API Key 是否正确
- 模型服务是否可用
- 网络连接是否正常

#### 3. 前端无法访问后端

检查以下配置：
- CORS 配置是否正确
- 后端服务是否启动
- 前端 API 地址配置

### 性能优化建议

1. **数据库优化**
   - 创建合适的索引
   - 使用连接池
   - 定期清理日志数据

2. **缓存优化**
   - 启用 Redis 缓存
   - 缓存常用查询结果
   - 缓存嵌入向量

3. **前端优化**
   - 使用懒加载
   - 压缩静态资源
   - 使用 CDN

### 安全建议

1. 修改默认密码
2. 使用 HTTPS
3. 定期更新依赖
4. 配置防火墙规则
5. 启用审计日志

### 相关资源

- [项目官网](https://github.com/your-repo/YZ_DataAnalyseBot)
- [问题反馈](https://github.com/your-repo/YZ_DataAnalyseBot/issues)
- [开发文档](https://github.com/your-repo/YZ_DataAnalyseBot/wiki)

---

**文档版本**: 1.0.0
**最后更新**: 2026-05-11
**维护者**: YZ_DataAnalyseBot 开发团队
