import { request } from '@/utils/request';
/**
 * 数据代理API服务
 */
export const dataAgentApi = {
    /**
     * 执行数据分析
     * @param params 数据分析请求参数
     * @returns 数据分析响应
     */
    analyzeData: (params) => {
        return request.post('/data-agent/analyze', params);
    },
    /**
     * 生成分析报告
     * @param params 报告生成请求参数
     * @returns 报告生成响应
     */
    generateReport: (params) => {
        return request.post('/data-agent/generate-report', params);
    },
    /**
     * 获取分析结果列表
     * @param skip 跳过条数
     * @param limit 限制条数
     * @returns 分析结果列表
     */
    getAnalysisResults: (skip = 0, limit = 100) => {
        return request.get('/data-agent/analysis-results', {
            params: { skip, limit },
        });
    },
    /**
     * 获取分析结果详情
     * @param analysisId 分析结果ID
     * @returns 分析结果详情
     */
    getAnalysisResult: (analysisId) => {
        return request.get(`/data-agent/analysis-results/${analysisId}`);
    },
    /**
     * 获取报告模板列表
     * @param skip 跳过条数
     * @param limit 限制条数
     * @returns 报告模板列表
     */
    getReportTemplates: (skip = 0, limit = 100) => {
        return request.get('/data-agent/report-templates', {
            params: { skip, limit },
        });
    },
    /**
     * 创建报告
     * @param params 创建报告请求参数
     * @returns 报告详情
     */
    createReport: (params) => {
        return request.post('/data-agent/reports', params);
    },
    /**
     * 获取报告列表
     * @param skip 跳过条数
     * @param limit 限制条数
     * @returns 报告列表
     */
    getReports: (skip = 0, limit = 100) => {
        return request.get('/data-agent/reports', { params: { skip, limit } });
    },
    /**
     * 获取报告详情
     * @param reportId 报告ID
     * @returns 报告详情
     */
    getReport: (reportId) => {
        return request.get(`/data-agent/reports/${reportId}`);
    },
    /**
     * 获取数据基本统计信息
     * @param params 数据基本统计请求参数
     * @returns 数据基本统计响应
     */
    getDataBasicStats: (params) => {
        return request.post('/data-agent/basic-stats', params);
    },
    /**
     * 获取支持的分析类型
     * @returns 分析类型列表
     */
    getAnalysisTypes: () => {
        return request.get('/data-agent/analysis-types');
    },
    /**
     * 生成分析需求
     * @param params 分析需求生成请求参数
     * @returns 分析需求生成响应
     */
    generateRequirement: (params) => {
        return request.post('/data-agent/generate-requirement', params);
    },
    /**
     * 获取数据源列表
     * @returns 数据源列表
     */
    getDatasources: () => {
        return request.get('/datasource/list');
    },
    /**
     * 获取数据表列表
     * @param datasourceId 数据源ID
     * @returns 数据表列表
     */
    getTables: (datasourceId) => {
        return request.post(`/datasource/tableList/${datasourceId}`);
    },
    /**
     * 根据模板内容生成问题列表
     * @param params 问题生成请求参数
     * @returns 问题生成响应
     */
    generateQuestions: (params) => {
        return request.post('/data-agent/generate-questions', params);
    },
    /**
     * 从模板生成报告
     * @param params 报告生成请求参数
     * @returns 报告详情
     */
    generateReportFromTemplate: (params) => {
        return request.post('/data-agent/generate-report-from-template', params);
    },
    /**
     * 从会话生成报告
     * @param params 报告生成请求参数
     * @returns 报告详情
     */
    generateReportFromChats: (params) => {
        return request.post('/data-agent/generate-report-from-chats', params);
    },
};
