# SQLBot UI 和数据库问题修复 - Product Requirement Document

## Overview
- **Summary**: 修复 SQLBot 系统中的三个关键问题：数据库错误、左侧工具栏滚动问题、页面切换闪黑问题
- **Purpose**: 提高系统的稳定性和用户体验，确保所有功能模块正常工作
- **Target Users**: SQLBot 系统的所有用户

## Goals
- 修复数据库相关错误，确保所有 API 正常响应
- 修复左侧工具栏不能向下拖动的问题
- 修复页面切换时上部闪黑的问题
- 确保整个系统的用户体验流畅

## Non-Goals (Out of Scope)
- 不涉及新功能开发
- 不涉及架构重构
- 不影响现有功能的正常使用

## Background & Context
从浏览器控制台日志可以看到多个数据库错误，包括：
- `sys_user_ws.uid` 字段不存在
- `system_variable` 表不存在
- API 请求失败等

同时用户反馈了两个 UI 问题：
- 左侧工具栏不能向下拖动
- 点击用户管理、工作空间等模块时页面上部闪黑

## Functional Requirements
- **FR-1**: 修复所有数据库相关错误
- **FR-2**: 实现左侧工具栏的正常滚动功能
- **FR-3**: 修复页面切换时的闪黑问题

## Non-Functional Requirements
- **NFR-1**: 修复后的系统应保持与原系统相同的性能表现
- **NFR-2**: UI 修复应保持原有的视觉风格和交互方式
- **NFR-3**: 修复不应引入新的 bug 或问题

## Constraints
- **Technical**: 必须使用现有的技术栈（Vue 3, TypeScript, FastAPI）
- **Business**: 修复应在不破坏现有功能的前提下进行
- **Dependencies**: 依赖现有的数据库结构和代码架构

## Assumptions
- 数据库迁移脚本是正确的
- 现有代码架构是稳定的
- UI 问题主要集中在样式和交互逻辑上

## Acceptance Criteria

### AC-1: 数据库错误修复
- **Given**: 系统正常运行
- **When**: 用户使用任何功能模块
- **Then**: 浏览器控制台不应该出现数据库相关的错误信息
- **Verification**: `programmatic`
- **Notes**: 需要测试所有功能模块的 API 调用

### AC-2: 左侧工具栏滚动功能
- **Given**: 用户在决策平台页面
- **When**: 尝试向下滚动左侧工具栏
- **Then**: 工具栏应该可以正常向下滚动，显示所有菜单项
- **Verification**: `human-judgment`
- **Notes**: 测试长菜单列表的滚动效果

### AC-3: 页面切换闪黑修复
- **Given**: 用户在系统首页
- **When**: 点击用户管理、工作空间等菜单项
- **Then**: 页面切换应该平滑过渡，不应该出现上部闪黑现象
- **Verification**: `human-judgment`
- **Notes**: 测试多个模块的页面切换效果

## Open Questions
- [ ] 是否需要运行完整的数据库迁移？
- [ ] UI 闪黑问题是否与路由切换或样式加载有关？
