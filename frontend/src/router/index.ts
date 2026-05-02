import { createRouter, createWebHashHistory } from 'vue-router'
// import Layout from '@/components/layout/index.vue'
import LayoutDsl from '@/components/layout/LayoutDsl.vue'
import ToolDispatchLayout from '@/components/layout/ToolDispatchLayout.vue'
import SinglePage from '@/components/layout/SinglePage.vue'
import login from '@/views/login/index.vue'
import chat from '@/views/chat/index.vue'
import DashboardEditor from '@/views/dashboard/editor/index.vue'
import DashboardPreview from '@/views/dashboard/preview/SQPreviewSingle.vue'
import Dashboard from '@/views/dashboard/index.vue'
import Model from '@/views/system/model/Model.vue'
import DataAgentView from '@/views/data-agent/index.vue'
import AnalysisView from '@/views/analysis/index.vue'
import ReportView from '@/views/report/index.vue'
import SkillManagerView from '@/views/skill-manager/index.vue'
import HomePage from '@/views/HomePage.vue'
// import ToolDispatcher from '@/views/tool-dispatcher/index.vue'
// import Embedded from '@/views/system/embedded/index.vue'
// import SetAssistant from '@/views/system/embedded/iframe.vue'
import SystemEmbedded from '@/views/system/embedded/Page.vue'
import Variables from '@/views/system/variables/index.vue'

import assistantTest from '@/views/system/embedded/Test.vue'
import assistant from '@/views/embedded/index.vue'
import EmbeddedPage from '@/views/embedded/page.vue'
import EmbeddedCommon from '@/views/embedded/common.vue'
import Member from '@/views/system/member/index.vue'
import Professional from '@/views/system/professional/index.vue'
import Training from '@/views/system/training/index.vue'
import Prompt from '@/views/system/prompt/index.vue'
import Audit from '@/views/system/audit/index.vue'
import Appearance from '@/views/system/appearance/index.vue'
import Parameter from '@/views/system/parameter/index.vue'
import Authentication from '@/views/system/authentication/index.vue'
import Platform from '@/views/system/platform/index.vue'
import Permission from '@/views/system/permission/index.vue'
import User from '@/views/system/user/User.vue'
import Workspace from '@/views/system/workspace/index.vue'
import Page401 from '@/views/error/index.vue'
import ChatPreview from '@/views/chat/preview.vue'

import { i18n } from '@/i18n'
import { watchRouter } from './watch'

const t = i18n.global.t
export const routes = [
  {
    path: '/login',
    name: 'login',
    component: login,
  },
  {
    path: '/',
    name: 'home',
    component: ToolDispatchLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home-page',
        component: HomePage,
        meta: { title: '智能数据分析助手', iconActive: 'chat', iconDeActive: 'noChat' },
      },
    ],
  },
  {
    path: '/chat',
    component: ToolDispatchLayout,
    redirect: '/chat/history',
    children: [
      {
        path: 'history',
        name: 'chat-history',
        component: () => import('@/views/chat/history/Index.vue'),
        meta: { title: '会话管理', iconActive: 'chat', iconDeActive: 'noChat' },
      },
    ],
  },
  {
    path: '/tools',
    component: ToolDispatchLayout,
    redirect: '/tools/tool-select',
    children: [
      {
        path: 'tool-select',
        name: 'tools-tool-select',
        meta: { title: '工具选择' },
        redirect: '/tools/chat',
      },
      {
        path: 'chat',
        name: 'tools-chat',
        component: chat,
        props: (route: any) => {
          return { 
            startChatDsId: route.query.start_chat,
            chat_id: route.query.chat_id,
            record_id: route.query.record_id
          }
        },
        meta: { title: '智能问数', iconActive: 'chat', iconDeActive: 'noChat' },
      },
      {
        path: 'analysis',
        name: 'tools-analysis',
        component: AnalysisView,
        props: (route: any) => {
          return { 
            chat_id: route.query.chat_id,
            record_id: route.query.record_id
          }
        },
        meta: { title: '数据分析', iconActive: 'analysis', iconDeActive: 'noAnalysis' },
      },
      {
        path: 'report',
        name: 'tools-report',
        component: ReportView,
        meta: { title: '报告生成', iconActive: 'chart', iconDeActive: 'noChart' },
      },
      {
        path: 'skill-manager',
        name: 'tools-skill-manager',
        component: SkillManagerView,
        meta: { title: '技能管理', iconActive: 'dashboard', iconDeActive: 'noDashboard' },
      },
      {
        path: 'data-agent',
        name: 'tools-data-agent',
        component: DataAgentView,
        meta: { title: '数据分析工具', iconActive: 'analysis', iconDeActive: 'noAnalysis' },
      },
      {
        path: 'datasource',
        name: 'tools-datasource',
        component: () => import('@/views/ds/index.vue'),
        meta: { title: '数据源管理', iconActive: 'ds', iconDeActive: 'noDs' },
      },
      {
        path: 'model',
        name: 'tools-model',
        component: Model,
        meta: { title: '模型配置', iconActive: 'model', iconDeActive: 'noModel' },
      },
      {
        path: 'terminology',
        name: 'tools-terminology',
        component: Professional,
        meta: { title: '术语配置', iconActive: 'set', iconDeActive: 'noSet' },
      },
      {
        path: 'system',
        name: 'tools-system',
        redirect: '/tools/system/user',
        meta: { title: '系统管理', iconActive: 'set', iconDeActive: 'noSet' },
        children: [
          {
            path: 'user',
            name: 'tools-system-user',
            component: User,
            meta: { title: '用户管理', iconActive: 'user', iconDeActive: 'noUser' },
          },
          {
            path: 'workspace',
            name: 'tools-system-workspace',
            component: Workspace,
            meta: { title: '工作空间', iconActive: 'workspace', iconDeActive: 'noWorkspace' },
          },
          {
            path: 'model',
            name: 'tools-system-model',
            component: Model,
            meta: { title: 'AI模型配置', iconActive: 'model', iconDeActive: 'noModel' },
          },
          {
            path: 'setting',
            name: 'tools-system-setting',
            redirect: '/tools/system/setting/appearance',
            meta: { title: '系统设置', iconActive: 'set', iconDeActive: 'noSet' },
            children: [
              {
                path: 'appearance',
                name: 'tools-system-appearance',
                component: Appearance,
                meta: { title: '外观设置' },
              },
              {
                path: 'parameter',
                name: 'tools-system-parameter',
                component: Parameter,
                meta: { title: '参数配置' },
              },
              {
                path: 'variables',
                name: 'tools-system-variables',
                component: Variables,
                meta: { title: '系统变量' },
              },
              {
                path: 'authentication',
                name: 'tools-system-authentication',
                component: Authentication,
                meta: { title: '认证设置' },
              },
              {
                path: 'platform',
                name: 'tools-system-platform',
                component: Platform,
                meta: { title: '平台设置' },
              },
            ],
          },
          {
            path: 'audit',
            name: 'tools-system-audit',
            component: Audit,
            meta: { title: '审计日志', iconActive: 'log', iconDeActive: 'noLog' },
          },
        ],
      },
    ],
  },
  {
    path: '/dsTable',
    component: SinglePage,
    children: [
      {
        path: ':dsId/:dsName',
        name: 'dsTable',
        component: () => import('@/views/ds/TableList.vue'),
        props: true,
      },
    ],
  },
  /* {
    path: '/ds',
    component: LayoutDsl,
    name: 'ds-menu',
    redirect: '/ds/index',
    children: [
      {
        path: 'index',
        name: 'ds',
        component: Datasource,
        meta: { title: t('menu.Data Connections'), iconActive: 'ds', iconDeActive: 'noDs' },
      },
    ],
  }, */
  {
    path: '/dashboard',
    component: LayoutDsl,
    redirect: '/dashboard/index',
    children: [
      {
        path: 'index',
        name: 'dashboard',
        component: Dashboard,
        meta: {
          title: t('dashboard.dashboard'),
          iconActive: 'dashboard',
          iconDeActive: 'noDashboard',
        },
      },
    ],
  },
  {
    path: '/set',
    name: 'set',
    component: LayoutDsl,
    redirect: '/set/member',
    meta: { title: t('workspace.set'), iconActive: 'set', iconDeActive: 'noSet' },
    children: [
      {
        path: '/set/member',
        name: 'member',
        component: Member,
        meta: { title: t('workspace.member_management') },
      },
      {
        path: '/set/permission',
        name: 'permission',
        component: Permission,
        meta: { title: t('workspace.permission_configuration') },
      },
      /* {
        path: '/set/assistant',
        name: 'setAssistant',
        component: SetAssistant,
        meta: { title: t('embedded.assistant_app') },
      }, */
      {
        path: '/set/professional',
        name: 'professional',
        component: Professional,
        meta: { title: t('professional.professional_terminology') },
      },
      {
        path: '/set/training',
        name: 'training',
        component: Training,
        meta: { title: t('training.data_training') },
      },
      {
        path: '/set/prompt',
        name: 'prompt',
        component: Prompt,
        meta: { title: t('prompt.customize_prompt_words') },
      },
    ],
  },
  {
    path: '/canvas',
    name: 'canvas',
    component: DashboardEditor,
    meta: { title: 'canvas', icon: 'dashboard' },
  },
  {
    path: '/dashboard-preview',
    name: 'preview',
    component: DashboardPreview,
    meta: { title: 'DashboardPreview', icon: 'dashboard' },
  },
  {
    path: '/system',
    name: 'system',
    component: LayoutDsl,
    redirect: '/system/user',
    meta: { hidden: true },
    children: [
      {
        path: 'user',
        name: 'user',
        component: User,
        meta: { title: t('user.user_management'), iconActive: 'user', iconDeActive: 'noUser' },
      },
      {
        path: 'workspace',
        name: 'workspace',
        component: Workspace,
        meta: {
          title: t('user.workspace'),
          iconActive: 'workspace',
          iconDeActive: 'noWorkspace',
        },
      },
      {
        path: 'model',
        name: 'model',
        component: Model,
        meta: {
          title: t('model.ai_model_configuration'),
          iconActive: 'model',
          iconDeActive: 'noModel',
        },
      },
      {
        path: 'embedded',
        name: 'embedded',
        component: SystemEmbedded,
        meta: {
          title: t('embedded.embedded_management'),
          iconActive: 'embedded',
          iconDeActive: 'noEmbedded',
        },
      },
      {
        path: 'setting',
        meta: { title: t('system.system_settings'), iconActive: 'set', iconDeActive: 'noSet' },
        redirect: 'appearance',
        name: 'setting',
        children: [
          {
            path: 'appearance',
            name: 'appearance',
            component: Appearance,
            meta: { title: t('system.appearance_settings') },
          },
          {
            path: 'parameter',
            name: 'parameter',
            component: Parameter,
            meta: { title: t('parameter.parameter_configuration') },
          },
          {
            path: 'variables',
            name: 'variables',
            component: Variables,
            meta: { title: t('variables.system_variables') },
          },
          {
            path: 'authentication',
            name: 'authentication',
            component: Authentication,
            meta: { title: t('system.authentication_settings') },
          },
          {
            path: 'platform',
            name: 'platform',
            component: Platform,
            meta: { title: t('platform.title') },
          },
        ],
      },
      {
        path: 'audit',
        name: 'audit',
        component: Audit,
        meta: { title: t('audit.system_log'), iconActive: 'log', iconDeActive: 'noLog' },
      },
    ],
  },

  {
    path: '/assistant',
    name: 'assistant',
    component: assistant,
  },
  {
    path: '/embeddedPage',
    name: 'embeddedPage',
    component: EmbeddedPage,
  },
  {
    path: '/embeddedCommon',
    name: 'embeddedCommon',
    component: EmbeddedCommon,
  },
  {
    path: '/assistantTest',
    name: 'assistantTest',
    component: assistantTest,
  },
  {
    path: '/chatPreview',
    name: 'chatPreview',
    component: ChatPreview,
  },
  {
    path: '/admin-login',
    name: 'admin-login',
    component: login,
  },
  {
    path: '/401',
    name: '401',
    hidden: true,
    meta: {},
    component: Page401,
  },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
watchRouter(router)
export default router
