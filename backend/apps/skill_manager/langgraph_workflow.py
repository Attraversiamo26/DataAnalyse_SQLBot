import asyncio
import logging
from typing import Dict, Any, List, Optional, TypedDict
from .skill_manager import SkillManager
from .intent_parser import IntentParser
from .skill_model import (
    SkillExecutionResult, IntentMatchResult, SkillLayer,
    WorkflowDefinition, WorkflowStep, WorkflowExecutionResult
)

logger = logging.getLogger(__name__)


class WorkflowState(TypedDict, total=False):
    user_query: str
    matched_skills: List[Dict[str, Any]]
    selected_skill_id: Optional[str]
    extracted_params: Dict[str, Any]
    execution_results: List[Dict[str, Any]]
    chain_results: List[Dict[str, Any]]
    final_output: str
    error: Optional[str]


class LangGraphWorkflow:
    def __init__(self, skill_manager: SkillManager):
        self.skill_manager = skill_manager
        self.intent_parser = IntentParser(skill_manager)

    async def run(self, user_query: str, params: Dict[str, Any] = None,
                  timeout: int = 300) -> WorkflowState:
        params = params or {}
        state: WorkflowState = {
            'user_query': user_query,
            'matched_skills': [],
            'selected_skill_id': None,
            'extracted_params': {},
            'execution_results': [],
            'chain_results': [],
            'final_output': '',
            'error': None
        }

        state = await self._intent_recognition(state)
        if state.get('error'):
            return state

        state = await self._skill_selection(state)
        if state.get('error'):
            return state

        state = await self._parameter_extraction(state, params)
        if state.get('error'):
            return state

        state = await self._skill_execution(state, timeout)
        if state.get('error'):
            return state

        state = await self._chain_execution(state, timeout)

        state = self._format_final_output(state)

        return state

    async def _intent_recognition(self, state: WorkflowState) -> WorkflowState:
        user_query = state['user_query']
        try:
            matches = self.intent_parser.parse_intent(user_query)
            state['matched_skills'] = [
                {
                    'skill_id': m.skill_id,
                    'confidence': m.confidence,
                    'reason': m.reason,
                    'extracted_params': m.extracted_params,
                    'layer': m.skill_info.layer.value if m.skill_info else 'stage'
                }
                for m in matches
            ]
            if not matches:
                state['error'] = '未匹配到任何技能，请尝试更具体的描述'
                logger.warning(f"意图识别无匹配: {user_query}")
            else:
                logger.info(f"意图识别结果: {[(m.skill_id, m.confidence) for m in matches]}")
        except Exception as e:
            state['error'] = f'意图识别失败: {str(e)}'
            logger.error(f"意图识别异常: {e}")
        return state

    async def _skill_selection(self, state: WorkflowState) -> WorkflowState:
        matched_skills = state.get('matched_skills', [])
        if not matched_skills:
            state['error'] = state.get('error', '无匹配技能')
            return state

        best_match = matched_skills[0]
        if best_match['confidence'] < 0.3:
            state['error'] = '匹配置信度过低，请尝试更具体的描述'
            return state

        state['selected_skill_id'] = best_match['skill_id']
        state['extracted_params'] = best_match.get('extracted_params', {})
        logger.info(f"选择技能: {best_match['skill_id']} (置信度: {best_match['confidence']})")
        return state

    async def _parameter_extraction(self, state: WorkflowState,
                                     extra_params: Dict[str, Any] = None) -> WorkflowState:
        skill_id = state.get('selected_skill_id')
        if not skill_id:
            return state

        skill = self.skill_manager.get_skill(skill_id)
        if not skill:
            state['error'] = f'技能不存在: {skill_id}'
            return state

        merged_params = {}

        for param_def in skill.input_params:
            if param_def.default is not None:
                merged_params[param_def.name] = param_def.default

        intent_params = state.get('extracted_params', {})
        merged_params.update(intent_params)

        if extra_params:
            merged_params.update(extra_params)

        missing_required = [
            p.name for p in skill.input_params
            if p.required and p.name not in merged_params and p.default is None
        ]

        if missing_required:
            logger.warning(f"技能 {skill_id} 缺少必填参数: {missing_required}")

        state['extracted_params'] = merged_params
        logger.info(f"参数提取完成: {merged_params}")
        return state

    async def _skill_execution(self, state: WorkflowState, timeout: int = 300) -> WorkflowState:
        skill_id = state.get('selected_skill_id')
        params = state.get('extracted_params', {})

        if not skill_id:
            state['error'] = '未选择技能'
            return state

        logger.info(f"开始执行技能: {skill_id}, 参数: {params}")
        result = await self.skill_manager.execute_skill(skill_id, params, timeout)

        state['execution_results'] = [result.model_dump()]
        if not result.success:
            state['error'] = f'技能执行失败: {result.error_message}'
            logger.error(f"技能执行失败: {result.error_message}")
        else:
            logger.info(f"技能执行成功: {skill_id}, 耗时: {result.execution_time:.2f}s")
        return state

    async def _chain_execution(self, state: WorkflowState, timeout: int = 300) -> WorkflowState:
        skill_id = state.get('selected_skill_id')
        if not skill_id:
            return state

        skill = self.skill_manager.get_skill(skill_id)
        if not skill or not skill.chain_triggers:
            return state

        execution_results = state.get('execution_results', [])
        if not execution_results or not execution_results[0].get('success'):
            return state

        main_result_data = execution_results[0]
        main_extracted_params = main_result_data.get('extracted_params', {})
        user_params = state.get('extracted_params', {})

        chain_results = []
        for trigger in skill.chain_triggers:
            should_trigger = True
            if trigger.condition:
                condition_str = trigger.condition
                for key, val in main_extracted_params.items():
                    condition_str = condition_str.replace(f'${{outputs.{key}}}', str(val))
                for key, val in user_params.items():
                    condition_str = condition_str.replace(f'${{params.{key}}}', str(val))
                try:
                    should_trigger = bool(eval(condition_str))
                except Exception:
                    should_trigger = False

            if not should_trigger:
                logger.info(f"链式触发条件不满足，跳过: {trigger.skill_id}")
                continue

            chain_params = {}
            for target_param, source_expr in trigger.params_mapping.items():
                if source_expr.startswith('${') and source_expr.endswith('}'):
                    expr = source_expr[2:-1]
                    if expr.startswith('outputs.'):
                        key = expr.split('outputs.')[-1]
                        chain_params[target_param] = main_extracted_params.get(key, '')
                    elif expr.startswith('params.'):
                        key = expr.split('params.')[-1]
                        chain_params[target_param] = user_params.get(key, '')
                else:
                    chain_params[target_param] = source_expr

            logger.info(f"链式触发技能: {trigger.skill_id}, 参数: {chain_params}")
            chain_result = await self.skill_manager.execute_skill(trigger.skill_id, chain_params, timeout)
            chain_results.append(chain_result.model_dump())

            if chain_result.success:
                sub_chain_results = await self._execute_sub_chain(
                    trigger.skill_id, chain_result.extracted_params, user_params, timeout
                )
                chain_results.extend(sub_chain_results)

        state['chain_results'] = chain_results
        return state

    async def _execute_sub_chain(self, skill_id: str, extracted_params: Dict[str, Any],
                                  user_params: Dict[str, Any], timeout: int) -> List[Dict[str, Any]]:
        skill = self.skill_manager.get_skill(skill_id)
        if not skill or not skill.chain_triggers:
            return []

        results = []
        for trigger in skill.chain_triggers:
            should_trigger = True
            if trigger.condition:
                condition_str = trigger.condition
                for key, val in extracted_params.items():
                    condition_str = condition_str.replace(f'${{outputs.{key}}}', str(val))
                for key, val in user_params.items():
                    condition_str = condition_str.replace(f'${{params.{key}}}', str(val))
                try:
                    should_trigger = bool(eval(condition_str))
                except Exception:
                    should_trigger = False

            if not should_trigger:
                continue

            chain_params = {}
            for target_param, source_expr in trigger.params_mapping.items():
                if source_expr.startswith('${') and source_expr.endswith('}'):
                    expr = source_expr[2:-1]
                    if expr.startswith('outputs.'):
                        key = expr.split('outputs.')[-1]
                        chain_params[target_param] = extracted_params.get(key, '')
                    elif expr.startswith('params.'):
                        key = expr.split('params.')[-1]
                        chain_params[target_param] = user_params.get(key, '')
                else:
                    chain_params[target_param] = source_expr

            result = await self.skill_manager.execute_skill(trigger.skill_id, chain_params, timeout)
            results.append(result.model_dump())

        return results

    def _format_final_output(self, state: WorkflowState) -> WorkflowState:
        execution_results = state.get('execution_results', [])
        chain_results = state.get('chain_results', [])

        output_parts = []

        for result in execution_results:
            if result.get('success'):
                output_parts.append(f"主技能执行成功 (耗时: {result.get('execution_time', 0):.2f}s)")
                if result.get('output_files'):
                    output_parts.append(f"输出文件: {', '.join(result['output_files'])}")
                if result.get('output'):
                    output_parts.append(result['output'][:2000])
            else:
                output_parts.append(f"主技能执行失败: {result.get('error_message', '未知错误')}")

        for i, result in enumerate(chain_results):
            if result.get('success'):
                output_parts.append(f"\n链式技能[{i+1}]执行成功 (耗时: {result.get('execution_time', 0):.2f}s)")
                if result.get('output_files'):
                    output_parts.append(f"输出文件: {', '.join(result['output_files'])}")
            else:
                output_parts.append(f"\n链式技能[{i+1}]执行失败: {result.get('error_message', '未知错误')}")

        state['final_output'] = '\n'.join(output_parts)
        return state

    async def run_workflow(self, workflow: WorkflowDefinition,
                           params: Dict[str, Any] = None,
                           timeout: int = 600) -> WorkflowExecutionResult:
        import time
        start_time = time.time()
        params = params or {}

        step_results: Dict[str, SkillExecutionResult] = {}
        completed_steps: set = set()

        for step in workflow.steps:
            if step.depends_on:
                all_deps_met = all(dep in completed_steps for dep in step.depends_on)
                if not all_deps_met:
                    logger.warning(f"步骤 {step.id} 的依赖未满足，跳过")
                    continue

            if step.condition:
                condition_str = step.condition
                for key, val in params.items():
                    condition_str = condition_str.replace(f'${{params.{key}}}', str(val))
                for step_id, result in step_results.items():
                    for k, v in result.extracted_params.items():
                        condition_str = condition_str.replace(f'${{{step_id}.{k}}}', str(v))
                try:
                    if not bool(eval(condition_str)):
                        logger.info(f"步骤 {step.id} 条件不满足，跳过")
                        continue
                except Exception:
                    pass

            step_params = {**step.params, **params}

            if step.skill_id:
                result = await self.skill_manager.execute_skill(
                    step.skill_id, step_params, timeout
                )
                step_results[step.id] = result

                if result.success:
                    completed_steps.add(step.id)
                    params.update(result.extracted_params)

        execution_time = time.time() - start_time
        all_success = all(r.success for r in step_results.values())

        return WorkflowExecutionResult(
            workflow_id=workflow.workflow_id,
            success=all_success,
            step_results=step_results,
            final_output='\n'.join(
                f"步骤 {sid}: {'成功' if r.success else '失败'}"
                for sid, r in step_results.items()
            ),
            execution_time=execution_time
        )

    async def run_parallel(self, skill_ids: List[str], params: Dict[str, Any] = None,
                            timeout: int = 300) -> List[SkillExecutionResult]:
        params = params or {}
        tasks = [
            self.skill_manager.execute_skill(skill_id, params, timeout)
            for skill_id in skill_ids
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                final_results.append(SkillExecutionResult(
                    skill_id=skill_ids[i], success=False,
                    error_message=str(result), execution_time=0
                ))
            else:
                final_results.append(result)

        return final_results
