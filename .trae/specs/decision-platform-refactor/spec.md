# 决策智能引擎平台重构 - 产品需求文档

## Overview
- **Summary**: 以决策平台为主要前端展示，参考 SQLBot-main_raw 核心源码重构当前前后端代码，完整集成 SQLBot 的核心功能。
- **Purpose**: 统一前端展示，确保决策平台的所有模块都有完整的后端支持，提供完整的 SQLBot 功能体验。
- **Target Users**: 数据分析师、业务决策者、SQLBot 现有用户。

## Goals
- 以决策平台为主要前端展示，移除或隐藏传统 SQLBot 界面
- 完整集成 SQLBot-main_raw 的核心功能到决策平台
- 智能问数工具集成：智能问数、仪表板、术语配置、SQL 示例库
- 系统管理集成：用户管理、工作空间、AI 模型配置
- 数据源管理集成：完整的数据源管理功能
- 导航栏统一显示"决策智能引擎平台"

## Non-Goals (Out of Scope)
- 不开发全新的功能模块
- 不修改 SQLBot 的核心业务逻辑
- 不进行大规模的架构重构
- 不涉及权限管理系统的重大变更

## Background & Context
- 当前项目存在两套前端展示：传统 SQLBot 界面和决策智能引擎平台界面
- 决策平台界面是新设计，带有中国邮政品牌标识
- SQLBot-main_raw 文件夹包含 SQLBot 的完整核心源码
- 需要将 SQLBot 的功能完整集成到决策平台中
- 当前决策平台主要支持三个模块，但功能不完整

## Functional Requirements
- **FR-1**: 统一前端入口，以决策平台为主要展示
- **FR-2**: 智能问数工具集成 SQLBot 智能问数功能
- **FR-3**: 智能问数工具集成 SQLBot 仪表板功能
- **FR-4**: 智能问数工具集成 SQLBot 术语配置功能
- **FR-5**: 智能问数工具集成 SQLBot SQL 示例库功能
- **FR-6**: 系统管理集成 SQLBot 用户管理功能
- **FR-7**: 系统管理集成 SQLBot 工作空间功能
- **FR-8**: 系统管理集成 SQLBot AI 模型配置功能
- **FR-9**: 数据源管理集成 SQLBot 完整数据源功能
- **FR-10**: 确保所有前端模块有对应的后端 API 支持

## Non-Functional Requirements
- **NFR-1**: 保持决策平台的界面风格和导航
- **NFR-2**: 确保功能集成后的性能和稳定性
- **NFR-3**: 代码结构清晰，易于维护
- **NFR-4**: 用户体验流畅，操作直观

## Constraints
- **Technical**: 基于现有的 Vue 3 + FastAPI 架构
- **Business**: 需要保持决策平台的品牌标识
- **Dependencies**: 依赖 SQLBot-main_raw 的核心功能代码
- **Timeline**: 短期完成功能集成和代码重构

## Assumptions
- SQLBot-main_raw 中的功能是完整且可用的
- 数据库结构与 SQLBot-main_raw 保持兼容
- 后端 API 可以直接复用或稍作调整
- 前端组件可以根据决策平台风格进行适配

## Acceptance Criteria

### AC-1: 统一前端入口
- **Given**: 用户访问应用
- **When**: 应用加载完成
- **Then**: 显示决策智能引擎平台界面，导航栏显示"决策智能引擎平台"
- **Verification**: `human-judgment`

### AC-2: 智能问数工具集成
- **Given**: 用户进入智能问数工具
- **When**: 使用智能问数功能
- **Then**: 可以正常进行自然语言转 SQL 查询，功能与 SQLBot 一致
- **Verification**: `programmatic`

### AC-3: 仪表板功能集成
- **Given**: 用户有可用的数据源
- **When**: 访问仪表板功能
- **Then**: 可以创建、编辑、查看仪表板和图表
- **Verification**: `programmatic`

### AC-4: 术语配置集成
- **Given**: 用户进入设置相关功能
- **When**: 配置业务术语
- **Then**: 可以添加、编辑、删除术语，术语在智能问数中生效
- **Verification**: `programmatic`

### AC-5: SQL 示例库集成
- **Given**: 用户进入设置相关功能
- **When**: 查看和管理 SQL 示例
- **Then**: 可以查看、添加 SQL 示例库
- **Verification**: `programmatic`

### AC-6: 用户管理集成
- **Given**: 管理员用户进入系统管理
- **When**: 管理用户
- **Then**: 可以添加、编辑、删除用户，设置用户权限
- **Verification**: `programmatic`

### AC-7: 工作空间集成
- **Given**: 用户进入系统管理
- **When**: 管理工作空间
- **Then**: 可以创建、编辑、切换工作空间
- **Verification**: `programmatic`

### AC-8: AI 模型配置集成
- **Given**: 用户进入系统管理
- **When**: 配置 AI 模型
- **Then**: 可以添加、编辑、删除 AI 模型配置
- **Verification**: `programmatic`

### AC-9: 数据源管理集成
- **Given**: 用户进入数据源管理
- **When**: 管理数据源
- **Then**: 可以添加、编辑、测试、删除各种类型的数据源
- **Verification**: `programmatic`

### AC-10: 后端 API 完整性
- **Given**: 前端调用任意功能
- **When**: 发送 API 请求
- **Then**: 后端正常响应，无 "No response from server" 错误
- **Verification**: `programmatic`

## Open Questions
- [ ] 如何处理传统 SQLBot 界面的路由和入口？
- [ ] 数据库迁移是否需要重新执行？
- [ ] 是否需要保留向后兼容性？
