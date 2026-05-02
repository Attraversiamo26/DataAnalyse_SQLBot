# Checklist

## 代码实现检查

- [x] Model 文件创建：`backend/apps/system/models/prompt_model.py` 包含 `CustomPromptModel` 类
- [x] Model 字段完整：包含 id, oid, type, create_time, name, prompt, specific_ds, datasource_ids, enabled 字段
- [x] Model 枚举定义：`CustomPromptTypeEnum` 包含 GENERATE_SQL, ANALYSIS, PREDICT_DATA
- [x] Schema 文件创建：`backend/apps/system/schemas/prompt_schema.py` 包含请求/响应 Schema
- [x] Schema 定义完整：CreatePromptRequest, UpdatePromptRequest, PromptResponse, PromptListItem 都正确定义
- [x] CRUD 文件创建：`backend/apps/system/crud/prompt.py` 包含所有 CRUD 函数
- [x] CRUD 函数完整：create, get, list, update, delete, enable 都正确实现
- [x] CRUD 验证逻辑：名称唯一性验证、必填字段验证、权限验证
- [x] find_custom_prompts 实现：`backend/apps/system/utils/custom_prompt_utils.py` 包含该函数
- [x] find_custom_prompts 逻辑：根据 type/oid/datasource_id 正确过滤，返回 (prompt_text, prompt_list)
- [x] API 文件创建：`backend/apps/system/api/prompt.py` 包含所有 RESTful 端点
- [x] API 路由装饰器：使用 `@router.post`, `@router.get` 等正确装饰
- [x] API 审计日志：使用 `@system_log` 装饰器记录操作日志
- [x] API 权限验证：使用现有权限机制
- [x] 路由注册：`backend/apps/api.py` 中注册了 prompt 路由
- [x] LLMService 修改：`backend/apps/chat/task/llm.py` 移除了许可证检查
- [x] 导入路径正确：所有 import 语句正确引用新模块
- [x] 模块导出：所有 `__init__.py` 文件正确导出新增的类和函数

## 功能验证检查

- [x] 创建提示词：可以成功创建新的自定义提示词
- [x] 名称唯一性：同一 oid 下不能有重名提示词
- [x] 必填字段验证：name 和 prompt 字段不能为空
- [x] 查询列表：可以分页查询提示词列表
- [x] 过滤条件：支持按 oid, type, datasource_id 过滤
- [x] 获取详情：可以通过 ID 获取单个提示词详情
- [x] 更新提示词：可以更新提示词的名称、内容、数据源绑定等
- [x] 删除提示词：可以删除提示词
- [x] 启用/禁用：可以切换提示词的启用状态
- [x] 数据源绑定：支持绑定到特定数据源或应用到所有数据源
- [x] 类型区分：支持 GENERATE_SQL, ANALYSIS, PREDICT_DATA 三种类型
- [x] find_custom_prompts 匹配：正确匹配启用的、对应类型的、匹配数据源的提示词

## 集成验证检查

- [x] LLMService 调用：`filter_custom_prompts()` 函数可以正常调用（无许可证检查）
- [x] 模板注入：自定义提示词正确注入到 `chat_question.custom_prompt`
- [x] 审计日志：所有操作都记录到系统日志
- [x] 多租户隔离：不同 oid 的数据互相隔离
- [x] 无许可证依赖：功能不使用许可证检查即可正常工作

## 文档和测试检查

- [x] 代码注释：关键函数和类有清晰的文档注释
- [x] 类型注解：所有函数参数和返回值有类型注解
- [x] 错误处理：异常情况有合适的错误处理和信息提示
- [x] API 文档：Swagger/OpenAPI 文档自动生成
- [x] 单元测试：关键函数有对应的单元测试（如项目有测试框架）

## 国际化检查

- [x] zh-CN 翻译：所有新增文本有中文翻译（检查已有翻译是否完整）
- [x] en 翻译：所有新增文本有英文翻译
- [x] ko-KR 翻译：所有新增文本有韩文翻译
- [x] 翻译准确性：翻译内容准确、专业术语一致
