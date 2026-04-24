# Tasks

- [x] **Task 1: 创建自定义提示词数据模型** - 定义数据库表结构和枚举类型
  - [x] SubTask 1.1: 创建 `backend/apps/system/models/prompt_model.py`
  - [x] SubTask 1.2: 定义 `CustomPromptModel` 类（包含 id, oid, type, create_time, name, prompt, specific_ds, datasource_ids, enabled 字段）
  - [x] SubTask 1.3: 定义 `CustomPromptTypeEnum` 枚举（GENERATE_SQL, ANALYSIS, PREDICT_DATA）
  - [x] SubTask 1.4: 创建 `backend/apps/system/models/__init__.py` 导出

- [x] **Task 2: 创建自定义提示词 Schema 定义** - 定义请求/响应数据结构
  - [x] SubTask 2.1: 创建 `backend/apps/system/schemas/prompt_schema.py`
  - [x] SubTask 2.2: 定义 `CreatePromptRequest` Schema（name, type, prompt, specific_ds, datasource_ids）
  - [x] SubTask 2.3: 定义 `UpdatePromptRequest` Schema（所有字段可选）
  - [x] SubTask 2.4: 定义 `PromptResponse` Schema（包含完整字段）
  - [x] SubTask 2.5: 定义 `PromptListItem` Schema（列表项简化版）
  - [x] SubTask 2.6: 创建 `backend/apps/system/schemas/__init__.py` 导出

- [x] **Task 3: 创建自定义提示词 CRUD 操作** - 实现数据访问层
  - [x] SubTask 3.1: 创建 `backend/apps/system/crud/prompt.py`
  - [x] SubTask 3.2: 实现 `create_prompt()` 函数（验证名称唯一性）
  - [x] SubTask 3.3: 实现 `get_prompt()` 函数（按 ID 查询）
  - [x] SubTask 3.4: 实现 `list_prompts()` 函数（支持分页、按 oid/type/datasource_id 过滤）
  - [x] SubTask 3.5: 实现 `update_prompt()` 函数（验证名称唯一性）
  - [x] SubTask 3.6: 实现 `delete_prompt()` 函数
  - [x] SubTask 3.7: 实现 `enable_prompt()` 函数（切换 enabled 状态）
  - [x] SubTask 3.8: 创建 `backend/apps/system/crud/__init__.py` 导出

- [x] **Task 4: 实现 find_custom_prompts 函数** - 替代 X-Pack 依赖
  - [x] SubTask 4.1: 创建 `backend/apps/system/utils/custom_prompt_utils.py`
  - [x] SubTask 4.2: 实现 `find_custom_prompts(session, custom_prompt_type, oid, ds_id)` 函数
  - [x] SubTask 4.3: 根据 type 过滤启用的提示词
  - [x] SubTask 4.4: 根据 oid 和 datasource_ids 匹配逻辑
  - [x] SubTask 4.5: 返回 (prompt_text, prompt_list) 格式
  - [x] SubTask 4.6: **移除许可证检查** - 直接使用 CRUD 查询

- [x] **Task 5: 创建自定义提示词 API 接口** - 实现 RESTful 端点
  - [x] SubTask 5.1: 创建 `backend/apps/system/api/prompt.py`
  - [x] SubTask 5.2: 实现 `create()` 接口 (POST /system/prompt/create)
  - [x] SubTask 5.3: 实现 `list()` 接口 (GET /system/prompt/list)
  - [x] SubTask 5.4: 实现 `get()` 接口 (GET /system/prompt/{id})
  - [x] SubTask 5.5: 实现 `update()` 接口 (PUT /system/prompt/update)
  - [x] SubTask 5.6: 实现 `delete()` 接口 (DELETE /system/prompt/{id})
  - [x] SubTask 5.7: 实现 `enable()` 接口 (PUT /system/prompt/enable)
  - [x] SubTask 5.8: 添加 `@system_log` 审计日志装饰器到所有写操作
  - [x] SubTask 5.9: 添加权限验证（使用现有权限机制）

- [x] **Task 6: 注册 API 路由** - 将新接口注册到应用
  - [x] SubTask 6.1: 修改 `backend/apps/system/api/__init__.py` 导入 prompt 路由
  - [x] SubTask 6.2: 修改 `backend/apps/api.py` 注册 prompt 路由

- [x] **Task 7: 修改 LLMService 移除许可证检查** - 使功能始终可用
  - [x] SubTask 7.1: 修改 `backend/apps/chat/task/llm.py` 中的 `filter_custom_prompts()` 方法
  - [x] SubTask 7.2: **移除** `if SQLBotLicenseUtil.valid():` 检查
  - [x] SubTask 7.3: 直接调用 `find_custom_prompts()` 函数
  - [x] SubTask 7.4: 确保导入路径正确

- [x] **Task 8: 补充国际化文本** - 完善多语言支持
  - [x] SubTask 8.1: 检查并补充 `backend/locales/zh-CN.json` 中的翻译（已有部分）
  - [x] SubTask 8.2: 补充 `backend/locales/en.json` 中的翻译（已完整）
  - [x] SubTask 8.3: 补充 `backend/locales/ko-KR.json` 中的翻译（已有部分）

# Task Dependencies

- Task 2 depends on Task 1 (Schema 依赖 Model)
- Task 3 depends on Task 1 (CRUD 依赖 Model)
- Task 4 depends on Task 3 (find_custom_prompts 依赖 CRUD)
- Task 5 depends on Task 2 and Task 3 (API 依赖 Schema 和 CRUD)
- Task 6 depends on Task 5 (路由注册依赖 API 定义)
- Task 7 depends on Task 4 (LLMService 依赖 find_custom_prompts 实现)
- Task 8 is independent (可并行执行)
