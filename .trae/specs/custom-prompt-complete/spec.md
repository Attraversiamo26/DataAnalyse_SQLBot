# 自定义提示词功能完善 Spec

## Why

当前项目已引入自定义提示词功能的基础架构（数据库表已创建、LLMService 已调用），但缺少关键实现组件：
1. 缺少自定义提示词的 CRUD 操作接口和管理功能
2. 缺少自定义提示词的 API 路由和 Schema 定义
3. `find_custom_prompts` 函数调用的是 X-Pack 模块，需要在主项目中实现该函数
4. 许可证检查限制了功能使用，需要移除限制使功能可用

需要完善这些缺失部分，使自定义提示词功能可以正常使用，且不依赖许可证。

## What Changes

- ✅ **新增自定义提示词 CRUD 模块** - 实现创建、查询、更新、删除操作
- ✅ **新增自定义提示词 API 接口** - 提供 RESTful API 端点
- ✅ **新增自定义提示词 Schema 定义** - 定义请求/响应数据结构
- ✅ **新增自定义提示词模型定义** - 补充数据库模型
- ✅ **实现 find_custom_prompts 函数** - 在主项目中实现（替代 X-Pack 依赖）
- ✅ **移除许可证检查** - 使功能不依赖许可证即可使用
- ✅ **新增国际化文本** - 补充缺失的多语言翻译
- ✅ **新增审计日志支持** - 完善操作日志记录

## Impact

- **Affected specs**: 新增自定义提示词完整管理能力，移除许可证依赖
- **Affected code**: 
  - `backend/apps/system/api/prompt.py` (新增)
  - `backend/apps/system/crud/prompt.py` (新增)
  - `backend/apps/system/models/prompt_model.py` (新增)
  - `backend/apps/system/schemas/prompt_schema.py` (新增)
  - `backend/apps/system/utils/custom_prompt_utils.py` (新增 - 实现 find_custom_prompts)
  - `backend/locales/*.json` (补充翻译)
  - `backend/apps/chat/task/llm.py` (修改 - 移除许可证检查)
  - `backend/common/audit/models/log_model.py` (已存在)
  - `backend/apps/api.py` (路由注册)

## ADDED Requirements

### Requirement: 自定义提示词 CRUD 操作
系统 SHALL 提供完整的自定义提示词数据访问层，包括：
- `create_prompt()` - 创建自定义提示词
- `get_prompt()` - 获取单个提示词详情
- `list_prompts()` - 分页查询提示词列表
- `update_prompt()` - 更新提示词信息
- `delete_prompt()` - 删除提示词
- `enable_prompt()` - 启用/禁用提示词

#### Scenario: 创建提示词
- **WHEN** 用户创建新的自定义提示词
- **THEN** 系统应验证名称唯一性、必填字段，并保存到数据库

#### Scenario: 查询提示词列表
- **WHEN** 用户查询提示词列表
- **THEN** 系统应根据 oid、type、datasource_id 等条件过滤并分页返回

### Requirement: 自定义提示词 API 接口
系统 SHALL 提供 RESTful API 端点：
- `POST /system/prompt/create` - 创建提示词
- `GET /system/prompt/list` - 查询列表
- `GET /system/prompt/{id}` - 获取详情
- `PUT /system/prompt/update` - 更新提示词
- `DELETE /system/prompt/{id}` - 删除提示词
- `PUT /system/prompt/enable` - 启用/禁用

#### Scenario: API 调用
- **WHEN** 前端调用 API 接口
- **THEN** 系统应验证权限、参数，并返回统一格式响应

### Requirement: find_custom_prompts 函数实现
系统 SHALL 在主项目中实现 `find_custom_prompts()` 函数：
- 位置：`backend/apps/system/utils/custom_prompt_utils.py`
- 功能：根据 oid、type、datasource_id 查询匹配的自定义提示词
- 返回：(prompt_text, prompt_list) 元组
- **移除许可证检查** - 不再依赖 `SQLBotLicenseUtil.valid()`

### Requirement: 自定义提示词数据模型
系统 SHALL 定义完整的数据模型：
- `CustomPromptModel` - 数据库表模型
- `CustomPromptTypeEnum` - 类型枚举（已存在）
- 支持 oid 隔离、数据源绑定

### Requirement: 国际化支持
系统 SHALL 提供多语言翻译：
- 中文 (zh-CN)
- 英文 (en)
- 韩文 (ko-KR)

## MODIFIED Requirements

### Requirement: 审计日志模块
**现有**: `OperationModules.PROMPT_WORDS` 已定义

**增强**: 在 API 接口中使用 `@system_log` 装饰器记录操作日志

## REMOVED Requirements

无
