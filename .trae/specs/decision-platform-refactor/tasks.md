# 决策智能引擎平台重构 - 实现任务列表

## [x] Task 1: 统一前端入口，配置默认路由
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改根路径路由，默认重定向到决策平台工具选择页面
  - 确保访问应用时直接显示决策智能引擎平台界面
  - 导航栏显示"决策智能引擎平台"
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 访问根路径 `/` 自动重定向到 `/tools/tool-select`
  - `human-judgement` TR-1.2: 页面顶部导航栏正确显示"决策智能引擎平台"
- **Notes**: 参考现有路由配置进行修改

## [x] Task 2: 后端功能完整性检查与补充
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 对比 SQLBot-main_raw 与当前 backend，确认缺失的模块
  - 补充缺失的后端功能模块（dashboard、terminology、data_training、system相关模块等）
  - 确保所有 API 路由都完整可用
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `programmatic` TR-2.1: 后端代码包含完整的 apps/dashboard 模块
  - `programmatic` TR-2.2: 后端代码包含完整的 apps/terminology 模块
  - `programmatic` TR-2.3: 后端代码包含完整的 apps/data_training 模块
  - `programmatic` TR-2.4: 后端代码包含完整的 apps/system 相关功能
  - `programmatic` TR-2.5: 所有 API 端点正常响应，无 404 错误
- **Notes**: 优先从 SQLBot-main_raw 复制缺失的模块代码

## [x] Task 3: 智能问数功能集成
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 确保智能问数页面在决策平台的 `/tools/chat` 路由下正常工作
  - 验证智能问数功能与后端 API 正常对接
  - 集成 SQLBot 的完整智能问数功能
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: `/tools/chat` 路由正常加载聊天界面
  - `programmatic` TR-3.2: 发送自然语言问题能正常生成和执行 SQL
  - `programmatic` TR-3.3: 查询结果正确展示
- **Notes**: 复用现有的 chat 组件，确保在决策平台布局中正常显示

## [x] Task 4: 仪表板功能集成
- **Priority**: P0
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 将仪表板功能集成到决策平台的数据分析/报告查看模块
  - 确保仪表板的创建、编辑、查看功能正常
  - 添加相应的路由和菜单配置
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: `/tools/analysis` 路由能正常访问仪表板功能
  - `programmatic` TR-4.2: 可以创建新的仪表板
  - `programmatic` TR-4.3: 可以编辑和保存仪表板
  - `programmatic` TR-4.4: 可以添加和配置图表
- **Notes**: 参考 SQLBot-main_raw 的前端仪表板代码

## [x] Task 5: 术语配置功能集成
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 在决策平台中添加术语配置功能入口
  - 集成 SQLBot 的术语管理功能
  - 确保术语在智能问数中生效
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-5.1: 可以访问术语配置页面
  - `programmatic` TR-5.2: 可以添加、编辑、删除业务术语
  - `programmatic` TR-5.3: 配置的术语在智能问数中被正确识别
- **Notes**: 术语配置可放在智能问数工具的设置或独立页面

## [x] Task 6: SQL 示例库功能集成
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 在决策平台中添加 SQL 示例库功能
  - 集成 SQLBot 的 SQL 示例库功能
  - 确保示例可以被查看和使用
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-6.1: 可以访问 SQL 示例库页面
  - `programmatic` TR-6.2: 可以查看各种数据库类型的 SQL 示例
  - `programmatic` TR-6.3: 示例可以正确显示和复制
- **Notes**: 示例库可放在智能问数工具或系统设置中

## [x] Task 7: 用户管理功能集成
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 在系统管理模块中集成 SQLBot 的用户管理功能
  - 确保可以添加、编辑、删除用户
  - 确保可以设置用户权限
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-7.1: `/tools/system` 路由下可以访问用户管理
  - `programmatic` TR-7.2: 可以添加新用户
  - `programmatic` TR-7.3: 可以编辑和删除用户
  - `programmatic` TR-7.4: 可以设置用户权限
- **Notes**: 参考 SQLBot-main_raw 的用户管理代码

## [x] Task 8: 工作空间功能集成
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 在系统管理模块中集成 SQLBot 的工作空间功能
  - 确保可以创建、编辑、切换工作空间
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-8.1: 可以访问工作空间管理
  - `programmatic` TR-8.2: 可以创建新的工作空间
  - `programmatic` TR-8.3: 可以编辑工作空间
  - `programmatic` TR-8.4: 可以切换工作空间
- **Notes**: 工作空间管理可放在系统管理模块中

## [x] Task 9: AI 模型配置功能集成
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 在系统管理模块中集成 SQLBot 的 AI 模型配置功能
  - 确保可以添加、编辑、删除 AI 模型配置
  - 确保可以测试模型连接
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-9.1: 可以访问 AI 模型配置
  - `programmatic` TR-9.2: 可以添加新的 AI 模型
  - `programmatic` TR-9.3: 可以编辑和删除 AI 模型
  - `programmatic` TR-9.4: 可以测试模型连接
- **Notes**: 参考 SQLBot-main_raw 的 AI 模型配置代码

## [x] Task 10: 数据源管理功能完整集成
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 确保决策平台的数据源管理功能完整
  - 集成 SQLBot 的完整数据源管理功能
  - 支持多种类型的数据源连接
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-10.1: `/tools/datasource` 路由正常工作
  - `programmatic` TR-10.2: 可以添加各种类型的数据源（MySQL、PostgreSQL 等）
  - `programmatic` TR-10.3: 可以测试数据源连接
  - `programmatic` TR-10.4: 可以编辑和删除数据源
  - `programmatic` TR-10.5: 可以查看数据源的表和字段信息
- **Notes**: 确保数据源管理功能与 SQLBot 完全一致

## [x] Task 11: 菜单结构优化与完善
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 优化决策平台的菜单结构
  - 为新增的功能添加菜单项
  - 确保菜单导航流畅
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-11.1: 菜单结构清晰，包含所有功能模块
  - `human-judgement` TR-11.2: 菜单项可以正常点击和导航
  - `human-judgement` TR-11.3: 当前激活的菜单项有正确的高亮样式
- **Notes**: 参考 ToolMenu.vue 进行菜单调整

## [x] Task 12: 系统测试与验证
- **Priority**: P0
- **Depends On**: Task 3-11
- **Description**: 
  - 对所有集成的功能进行完整测试
  - 验证前端与后端的所有 API 对接
  - 确保无 "No response from server" 错误
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10
- **Test Requirements**:
  - `programmatic` TR-12.1: 所有功能模块正常工作，无错误
  - `programmatic` TR-12.2: 所有 API 请求正常响应，无 404 或 500 错误
  - `human-judgement` TR-12.3: 用户体验流畅，操作直观
  - `human-judgement` TR-12.4: 界面风格统一，符合决策平台设计
- **Notes**: 进行端到端的完整测试
