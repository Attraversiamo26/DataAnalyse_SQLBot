import { request } from '@/utils/request';
/**
 * 技能管理API服务
 */
export const skillManagerApi = {
    /**
     * 获取所有技能列表
     * @param layer 技能层级过滤（可选）
     * @returns 技能列表
     */
    getAllSkills: (layer) => {
        const params = layer ? { layer } : {};
        return request.get('/skill-manager/skills', { params });
    },
    /**
     * 搜索技能
     * @param keyword 搜索关键词
     * @returns 匹配的技能列表
     */
    searchSkills: (keyword) => {
        return request.get('/skill-manager/skills/search', { params: { keyword } });
    },
    /**
     * 获取技能详情
     * @param skillId 技能ID
     * @returns 技能详情
     */
    getSkill: (skillId) => {
        return request.get(`/skill-manager/skills/${skillId}`);
    },
    /**
     * 执行技能
     * @param skillId 技能ID
     * @param params 执行参数
     * @param timeout 超时时间（可选，默认300秒）
     * @returns 执行结果
     */
    executeSkill: (skillId, params, timeout) => {
        const requestBody = {
            skill_id: skillId,
            params,
            timeout,
        };
        return request.post(`/skill-manager/skills/${skillId}/execute`, requestBody);
    },
    /**
     * 按步骤执行技能（工作流模式）
     * @param skillId 技能ID
     * @param params 执行参数
     * @param timeout 超时时间（可选，默认600秒）
     * @returns 执行结果
     */
    executeSkillSteps: (skillId, params, timeout) => {
        const requestBody = {
            skill_id: skillId,
            params,
            timeout,
        };
        return request.post(`/skill-manager/skills/${skillId}/execute-steps`, requestBody);
    },
    /**
     * 执行技能链
     * @param skillId 技能ID
     * @param params 执行参数
     * @param timeout 超时时间（可选，默认300秒）
     * @returns 执行结果列表
     */
    executeSkillChain: (skillId, params, timeout) => {
        const requestBody = {
            skill_id: skillId,
            params,
            timeout,
        };
        return request.post(`/skill-manager/skills/${skillId}/execute-chain`, requestBody);
    },
    /**
     * 确认链式触发
     * @param skillId 技能ID
     * @param confirmation 确认信息
     * @returns 执行结果
     */
    confirmChain: (skillId, confirmation) => {
        return request.post(`/skill-manager/skills/${skillId}/confirm-chain`, confirmation);
    },
    /**
     * 并行执行多个技能
     * @param requestData 并行执行请求
     * @returns 执行结果映射
     */
    executeParallel: (requestData) => {
        return request.post('/skill-manager/skills/execute-parallel', requestData);
    },
    /**
     * 解析用户意图
     * @param query 用户查询
     * @returns 匹配的技能列表
     */
    parseIntent: (query) => {
        return request.post('/skill-manager/intent/parse', { query });
    },
    /**
     * 获取最佳匹配技能
     * @param query 用户查询
     * @param minConfidence 最小置信度（可选，默认0.5）
     * @returns 最佳匹配结果
     */
    getBestMatch: (query, minConfidence) => {
        return request.post('/skill-manager/intent/best-match', { query }, { params: { min_confidence: minConfidence } });
    },
    /**
     * 获取决策树推荐
     * @param query 用户查询
     * @returns 推荐结果
     */
    getDecisionTree: (query) => {
        return request.post('/skill-manager/intent/decision-tree', { query });
    },
    /**
     * 运行工作流
     * @param query 用户查询
     * @param params 参数（可选）
     * @param timeout 超时时间（可选，默认300秒）
     * @returns 执行结果
     */
    runWorkflow: (query, params, timeout) => {
        return request.post('/skill-manager/workflow/run', { query, params, timeout });
    },
    /**
     * 执行工作流
     * @param requestData 工作流执行请求
     * @returns 执行结果
     */
    executeWorkflow: (requestData) => {
        return request.post('/skill-manager/workflow/execute', requestData);
    },
    /**
     * 获取工作流列表
     * @returns 工作流列表
     */
    listWorkflows: () => {
        return request.get('/skill-manager/workflow/list');
    },
    /**
     * 重新加载技能
     * @returns 重新加载结果
     */
    reloadSkills: () => {
        return request.post('/skill-manager/skills/reload');
    },
};
