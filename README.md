# YZ_DataAnalyseBot

智能寄递时限对标分析系统

## 项目简介

YZ_DataAnalyseBot 是一款基于大语言模型（LLM）和 RAG 技术的智能问数系统，专注于寄递行业时限对标分析场景。通过自然语言交互，用户可以快速完成线路五环节时限分析、问题环节下钻、机构级问题诊断等复杂数据分析任务。

## 核心功能

### 🎯 智能问答分析
- 自然语言驱动的数据分析
- 自动生成 SQL 查询语句
- 数据可视化图表自动生成
- 智能问题识别与归因

### 📊 线路五环节时限分析
- 收寄环节时限分析
- 出口环节时限分析
- 中转环节时限分析
- 进口环节时限分析
- 投递环节时限分析

### 🔍 智能下钻分析
- 问题环节自动识别
- 机构级问题诊断
- 48小时时间分布分析
- 业务量波峰识别

### 📈 报告自动生成
- PPT 综合报告自动生成
- Word 详细分析报告
- PDF 摘要报告
- 多维度对比分析

## 技术架构

### 后端技术栈
- **框架**: FastAPI 0.115.12+
- **ORM**: SQLModel 0.0.21+
- **LLM 框架**: LangChain 0.3+ / LangGraph 0.3+
- **向量数据库**: PostgreSQL + pgvector
- **数据处理**: Pandas, NumPy, Scikit-learn

### 前端技术栈
- **框架**: Vue 3.5.13
- **类型支持**: TypeScript 5.7.2
- **构建工具**: Vite 6.3.1
- **UI 组件**: Element Plus 2.10.1
- **图表库**: AntV G2 5.3.3 / S2 2.4.3

## 目录结构

```
DataAnalyse_SQLBot-main/
├── backend/                          # 后端服务
│   ├── apps/                        # 应用模块
│   │   ├── chat/                   # 对话问答
│   │   ├── datasource/             # 数据源管理
│   │   ├── ai_model/              # AI 模型
│   │   ├── skill_manager/          # 技能管理
│   │   └── system/                # 系统管理
│   ├── common/                     # 公共模块
│   ├── main.py                    # 应用入口
│   └── pyproject.toml            # 项目配置
│
├── frontend/                         # 前端应用
│   ├── src/                       # 源代码
│   ├── package.json              # 项目配置
│   └── vite.config.ts           # Vite 配置
│
├── data/                             # 数据目录
│   ├── skills/                    # 技能定义
│   │   ├── line-five-stage-time-benchmark-analysis/    # 线路五环节分析
│   │   ├── export-link-drilldown-analysis/             # 出口环节下钻
│   │   ├── import-link-drilldown-analysis/            # 进口环节下钻
│   │   ├── delivery-stage-drilldown-analysis/         # 投递环节下钻
│   │   ├── transit-link-drilldown-analysis/           # 中转环节下钻
│   │   ├── pickup-stage-drilldown-analysis/          # 收寄环节下钻
│   │   ├── pickup-institution-drilldown-analysis/    # 收寄机构下钻
│   │   └── export-institution-drilldown-analysis/   # 出口机构下钻
│   ├── excel/                     # Excel 数据文件
│   └── logs/                      # 日志文件
│
├── DataAgent-main/                  # DataAgent 子项目
├── docker-compose.yaml            # Docker 编排
└── README.md                      # 项目说明
```

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (带 pgvector 扩展)
- Redis (可选)

### 后端部署

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接

# 初始化数据库
alembic upgrade head

# 启动服务
python main.py
# 或
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 前端部署

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

### Docker 部署

```bash
# 使用 Docker Compose
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 技能系统

项目内置 8 个专业分析技能，覆盖寄递时限分析的完整场景：

### 全景分析层

| 技能 | 功能 | 输出 |
|------|------|------|
| 线路五环节时限对标分析 | 综合分析线路五个环节时限表现 | PPT + PDF |

### 环节分析层

| 技能 | 功能 | 输出 |
|------|------|------|
| 出口环节下钻分析 | 分析出口机构处理时限 | 控制台 |
| 进口环节下钻分析 | 分析进口环节时限及 48h 分布 | DOCX + PDF + PNG |
| 投递环节下钻分析 | 分析投递时限及多次投递情况 | DOCX + PDF + PNG |
| 中转环节下钻分析 | 分析中转路径和时限差异 | DOCX + PDF |
| 收寄环节下钻分析 | 分析收寄机构表现 | 控制台 |

### 机构下钻层

| 技能 | 功能 | 输出 |
|------|------|------|
| 收寄机构下钻分析 | 分析收寄机构 48h 分布 | PDF |
| 出口机构下钻分析 | 分析出口机构 48h 分布 | PDF |

### 技能执行示例

```bash
# 命令行执行五环节分析
cd data/skills/line-five-stage-time-benchmark-analysis
node analyze.js "滨州市-晋城市"

# API 调用
curl -X POST http://localhost:8001/api/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "line-five-stage-time-benchmark-analysis",
    "params": {"route_name": "滨州市-晋城市"}
  }'
```

## 支持的数据源

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

## 智能分析流程

```
用户提问 → 自然语言理解 → RAG 检索知识 → 生成 SQL → 执行查询 → 数据可视化 → 智能分析
```

### 分析流程说明

1. **问题理解**: LLM 解析用户意图，提取关键分析要素
2. **知识检索**: RAG 从术语库和表结构中检索相关知识
3. **SQL 生成**: 基于检索结果和上下文生成准确 SQL
4. **数据执行**: 安全执行查询，返回结构化数据
5. **可视化**: 根据数据特征自动生成合适图表
6. **智能分析**: 识别数据异常，给出优化建议

## 配置说明

### 环境变量配置 (.env)

```bash
# 项目配置
PROJECT_NAME=YZ_DataAnalyseBot
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# 数据库配置
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=YZ_DataAnalyseBot

# 前端地址
FRONTEND_HOST=http://localhost:8504

# 嵌入配置
EMBEDDING_ENABLED=True
EMBEDDING_DEFAULT_SIMILARITY=0.4

# 文件路径
EXCEL_PATH=/path/to/excel
MCP_IMAGE_PATH=/path/to/images
LOCAL_MODEL_PATH=/path/to/models
```

## 开发指南

### 添加新数据源

1. 在 `backend/apps/db/` 创建数据源引擎
2. 在模型中注册数据源类型
3. 添加 SQL 模板到 `templates/sql_examples/`

### 添加新技能

1. 在 `data/skills/` 创建技能目录
2. 编写 `SKILL.md` 技能说明
3. 创建 `workflow.yaml` 工作流定义
4. 实现分析脚本 (Node.js 或 Python)
5. 注册到技能管理器

### 代码规范

- Python: 遵循 PEP 8，使用 Ruff 检查
- TypeScript: ESLint + Prettier，Composition API
- 提交前运行测试和 lint 检查

## 性能优化

### 数据库优化
- 创建合适的索引
- 使用连接池
- 定期清理历史数据

### 缓存优化
- 启用 Redis 缓存
- 缓存常用查询结果
- 预计算热门报表

### 前端优化
- 组件懒加载
- 静态资源压缩
- CDN 加速

## 安全建议

1. 修改默认密码
2. 使用 HTTPS
3. 定期更新依赖
4. 配置防火墙规则
5. 启用审计日志
6. SQL 执行权限控制

## API 文档

启动服务后访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 认证方式

API 请求携带 Token：
```
X-YZ_DATANALYSEBOT-TOKEN: <your_token>
```

## 常见问题

### Q: 数据库连接失败？
检查 PostgreSQL 服务状态，确认连接参数正确，验证防火墙端口。

### Q: AI 模型调用失败？
检查 API Key 配置，确认模型服务可用性，排查网络连接。

### Q: 前端无法访问后端？
验证 CORS 配置，检查后端服务状态，确认前端 API 地址正确。

## 更新日志

### v1.6.0 (当前版本)
- 新增 8 个专业分析技能
- 优化 RAG 检索算法
- 增强图表自动生成能力
- 完善权限控制系统

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目采用 [LICENSE] 许可证。

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 技术支持: [Support Email]

---

**YZ_DataAnalyseBot** - 让数据驱动决策，让分析更智能
