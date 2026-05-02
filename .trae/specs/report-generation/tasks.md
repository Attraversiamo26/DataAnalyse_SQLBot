# 报告生成功能模块 - 实现计划

## [x] Task 1: 后端API - 模板上传与解析
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 添加模板上传API，支持markdown格式文件上传
  - 实现【重点关注】章节解析逻辑
  - 存储上传的模板到数据库
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: POST /api/v1/data-agent/upload-template 返回200状态码
  - `programmatic` TR-1.2: 正确解析模板中的【重点关注】内容并返回
  - `programmatic` TR-1.3: 模板正确存储到report_template表

## [x] Task 2: 后端API - 问题列表生成
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 添加问题列表生成API
  - 调用大模型根据模板内容生成问题列表
  - 返回结构化的问题列表数据
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: POST /api/v1/data-agent/generate-questions 返回200状态码
  - `programmatic` TR-2.2: 返回包含问题列表的JSON数据
  - `programmatic` TR-2.3: 问题数量在5-20个之间

## [x] Task 3: 后端API - 问题执行与报告生成
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 添加报告生成API
  - 调用智能问数或数据分析工具执行问题
  - 收集执行结果，调用大模型进行推理分析
  - 生成最终报告内容
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: POST /api/v1/data-agent/generate-report-from-template 返回200状态码
  - `programmatic` TR-3.2: 正确执行所有问题并返回结果
  - `programmatic` TR-3.3: 生成包含分析推理的完整报告

## [x] Task 4: 后端API - 历史会话获取
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 添加获取用户历史会话API
  - 支持按条件筛选会话
  - 返回会话的问题、答案和元数据
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: GET /api/v1/data-agent/chat-records 返回200状态码
  - `programmatic` TR-4.2: 返回当前用户的会话列表
  - `programmatic` TR-4.3: 支持按datasource_id筛选

## [x] Task 5: 后端API - 基于会话生成报告
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 添加基于选中会话生成报告的API
  - 收集选中会话的问题和答案
  - 调用大模型进行综合分析推理
  - 生成综合报告
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: POST /api/v1/data-agent/generate-report-from-chats 返回200状态码
  - `programmatic` TR-5.2: 正确处理多个会话数据
  - `programmatic` TR-5.3: 生成包含综合分析的完整报告

## [x] Task 6: 前端 - 模板上传组件
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 创建模板上传组件
  - 支持拖拽上传和点击上传
  - 显示上传进度和解析结果
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-6.1: 界面美观，操作流畅
  - `human-judgment` TR-6.2: 上传成功后显示解析的【重点关注】内容
  - `programmatic` TR-6.3: 正确调用上传API

## [x] Task 7: 前端 - 问题列表展示与管理
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 创建问题列表展示组件
  - 支持查看、编辑、删除问题
  - 支持批量选择问题执行
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-7.1: 问题列表清晰易读
  - `human-judgment` TR-7.2: 支持问题的增删改操作
  - `programmatic` TR-7.3: 正确调用问题执行API

## [x] Task 8: 前端 - 历史会话选择组件
- **Priority**: P1
- **Depends On**: Task 4
- **Description**: 
  - 创建会话选择组件
  - 支持多选会话
  - 显示会话预览信息
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-8.1: 会话列表清晰展示
  - `human-judgment` TR-8.2: 支持多选操作
  - `programmatic` TR-8.3: 正确调用会话获取API

## [x] Task 9: 前端 - 报告生成进度展示
- **Priority**: P1
- **Depends On**: Task 3, Task 5
- **Description**: 
  - 创建进度展示组件
  - 显示问题执行进度
  - 显示报告生成进度
- **Acceptance Criteria Addressed**: AC-3, AC-5
- **Test Requirements**:
  - `human-judgment` TR-9.1: 进度条清晰展示执行状态
  - `human-judgment` TR-9.2: 实时更新进度信息
  - `programmatic` TR-9.3: 正确处理长时间运行的任务

## [x] Task 10: 前端 - 报告展示与下载组件
- **Priority**: P1
- **Depends On**: Task 3, Task 5
- **Description**: 
  - 创建报告展示组件
  - 支持Markdown渲染
  - 支持报告下载功能
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-10.1: 报告内容清晰可读
  - `human-judgment` TR-10.2: 支持Markdown格式渲染
  - `programmatic` TR-10.3: 下载功能正常工作

## [x] Task 11: 前端 - 页面整合
- **Priority**: P1
- **Depends On**: Task 6-10
- **Description**: 
  - 整合所有组件到报告生成页面
  - 实现两种生成方式的切换
  - 优化页面布局和用户体验
- **Acceptance Criteria Addressed**: AC-1-6
- **Test Requirements**:
  - `human-judgment` TR-11.1: 页面布局合理
  - `human-judgment` TR-11.2: 两种生成方式切换流畅
  - `human-judgment` TR-11.3: 整体用户体验良好
