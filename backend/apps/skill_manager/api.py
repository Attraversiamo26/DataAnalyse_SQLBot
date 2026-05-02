import yaml
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List, Dict, Any, Optional
from pathlib import Path
from .skill_model import (
    SkillInfo, SkillExecutionResult, IntentMatchResult, SkillExecutionRequest,
    SkillLayer, WorkflowDefinition, WorkflowExecutionRequest, WorkflowExecutionResult,
    ParallelExecutionRequest
)
from .skill_manager import SkillManager
from .intent_parser import IntentParser
from .langgraph_workflow import LangGraphWorkflow
from common.core.deps import get_current_user
from apps.system.models.user import UserModel as User

router = APIRouter()

_skill_manager: Optional[SkillManager] = None
_intent_parser: Optional[IntentParser] = None
_workflow: Optional[LangGraphWorkflow] = None


def _get_skill_manager() -> SkillManager:
    global _skill_manager
    if _skill_manager is None:
        _skill_manager = SkillManager()
    return _skill_manager


def _get_intent_parser() -> IntentParser:
    global _intent_parser
    if _intent_parser is None:
        _intent_parser = IntentParser(_get_skill_manager())
    return _intent_parser


def _get_workflow() -> LangGraphWorkflow:
    global _workflow
    if _workflow is None:
        _workflow = LangGraphWorkflow(_get_skill_manager())
    return _workflow


@router.get("/skills", response_model=List[SkillInfo])
async def get_all_skills(
    layer: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    manager = _get_skill_manager()
    if layer:
        try:
            skill_layer = SkillLayer(layer)
            return manager.get_skills_by_layer(skill_layer)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"无效的层级: {layer}")
    return manager.get_all_skills()


@router.get("/skills/search", response_model=List[SkillInfo])
async def search_skills(keyword: str, current_user: User = Depends(get_current_user)):
    manager = _get_skill_manager()
    skills = manager.search_skills(keyword)
    return skills


@router.get("/skills/{skill_id}", response_model=SkillInfo)
async def get_skill(skill_id: str, current_user: User = Depends(get_current_user)):
    manager = _get_skill_manager()
    skill = manager.get_skill(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="技能不存在")
    return skill


@router.get("/files/preview")
async def preview_file(file_path: str, current_user: User = Depends(get_current_user)):
    from fastapi.responses import FileResponse
    from pathlib import Path
    
    allowed_dirs = [
        Path("/Users/qiweideng/Desktop/DataAnalyse_SQLBot-main/data/skills"),
    ]
    
    file_path = Path(file_path).resolve()
    
    is_allowed = any(str(file_path).startswith(str(allowed_dir)) for allowed_dir in allowed_dirs)
    if not is_allowed:
        raise HTTPException(status_code=403, detail="无权访问此文件")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    
    ext = file_path.suffix.lower()
    content_type = "text/html" if ext == ".html" else "application/octet-stream"
    
    return FileResponse(file_path, media_type=content_type)


@router.post("/skills/{skill_id}/execute", response_model=SkillExecutionResult)
async def execute_skill(
    skill_id: str,
    request: SkillExecutionRequest = None,
    current_user: User = Depends(get_current_user)
):
    manager = _get_skill_manager()
    if request is None:
        request = SkillExecutionRequest(skill_id=skill_id)

    params = request.params if request.params else {}
    timeout = request.timeout if request.timeout else 300

    result = await manager.execute_skill(skill_id, params, timeout)
    return result


@router.post("/skills/{skill_id}/execute-steps", response_model=SkillExecutionResult)
async def execute_skill_steps(
    skill_id: str,
    request: SkillExecutionRequest = None,
    current_user: User = Depends(get_current_user)
):
    manager = _get_skill_manager()
    if request is None:
        request = SkillExecutionRequest(skill_id=skill_id)

    params = request.params if request.params else {}
    timeout = request.timeout if request.timeout else 600

    result = await manager.execute_skill_steps(skill_id, params, timeout)
    return result


@router.post("/skills/{skill_id}/execute-chain", response_model=List[SkillExecutionResult])
async def execute_skill_chain(
    skill_id: str,
    request: SkillExecutionRequest = None,
    current_user: User = Depends(get_current_user)
):
    manager = _get_skill_manager()
    if request is None:
        request = SkillExecutionRequest(skill_id=skill_id)

    params = request.params if request.params else {}
    timeout = request.timeout if request.timeout else 300

    results = await manager.execute_chain(skill_id, params, timeout)
    return results


@router.post("/skills/{skill_id}/confirm-chain", response_model=SkillExecutionResult)
async def confirm_chain_execution(
    skill_id: str,
    confirmation: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    manager = _get_skill_manager()
    params = confirmation.get('params', {})
    timeout = confirmation.get('timeout', 300)

    result = await manager.confirm_chain(skill_id, confirmation, params, timeout)
    return result


@router.post("/skills/execute-parallel", response_model=Dict[str, Any])
async def execute_skills_parallel(
    request: ParallelExecutionRequest,
    current_user: User = Depends(get_current_user)
):
    import asyncio
    manager = _get_skill_manager()

    tasks = []
    for req in request.skills:
        params = req.params if req.params else {}
        timeout = req.timeout if req.timeout else 300
        task = manager.execute_skill(req.skill_id, params, timeout)
        tasks.append(task)

    results = await asyncio.gather(*tasks)
    return {req.skill_id: result.model_dump() for req, result in zip(request.skills, results)}


@router.post("/intent/parse", response_model=List[IntentMatchResult])
async def parse_intent(
    query: Dict[str, str],
    current_user: User = Depends(get_current_user)
):
    parser = _get_intent_parser()
    user_query = query.get('query', '')
    if not user_query:
        raise HTTPException(status_code=400, detail="查询内容不能为空")

    matches = parser.parse_intent(user_query)
    return matches


@router.post("/intent/best-match", response_model=IntentMatchResult)
async def get_best_match(
    query: Dict[str, str],
    min_confidence: float = 0.5,
    current_user: User = Depends(get_current_user)
):
    parser = _get_intent_parser()
    user_query = query.get('query', '')
    if not user_query:
        raise HTTPException(status_code=400, detail="查询内容不能为空")

    result = parser.get_best_match(user_query, min_confidence)
    if not result:
        raise HTTPException(status_code=404, detail="未找到匹配的技能")
    return result


@router.post("/intent/decision-tree", response_model=Dict[str, Any])
async def get_decision_tree(
    query: Dict[str, str],
    current_user: User = Depends(get_current_user)
):
    parser = _get_intent_parser()
    user_query = query.get('query', '')
    if not user_query:
        raise HTTPException(status_code=400, detail="查询内容不能为空")

    recommendation = parser.get_decision_tree_recommendation(user_query)
    return recommendation


@router.post("/workflow/run", response_model=Dict[str, Any])
async def run_workflow_endpoint(
    query: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    workflow = _get_workflow()
    user_query = query.get('query', '')
    if not user_query:
        raise HTTPException(status_code=400, detail="查询内容不能为空")

    params = query.get('params', {})
    timeout = query.get('timeout', 300)

    result = await workflow.run(user_query, params, timeout)
    return result


@router.post("/workflow/execute", response_model=WorkflowExecutionResult)
async def execute_workflow(
    request: WorkflowExecutionRequest,
    current_user: User = Depends(get_current_user)
):
    workflow = _get_workflow()

    wf_def = None

    if request.workflow_file:
        wf_def = _load_workflow_from_file(request.workflow_file)

    if not wf_def and request.workflow_id:
        for wf in _get_builtin_workflows():
            if wf.workflow_id == request.workflow_id:
                wf_def = wf
                break

    if not wf_def:
        raise HTTPException(status_code=404, detail=f"工作流不存在: {request.workflow_id or request.workflow_file}")

    result = await workflow.run_workflow(wf_def, request.params, request.timeout)
    return result


@router.post("/workflow/upload", response_model=WorkflowExecutionResult)
async def upload_and_execute_workflow(
    file: UploadFile = File(...),
    params: str = "{}",
    timeout: int = 600,
    current_user: User = Depends(get_current_user)
):
    import json
    workflow = _get_workflow()

    try:
        content = await file.read()
        wf_data = yaml.safe_load(content.decode('utf-8'))
        wf_def = _parse_workflow_yaml(wf_data)

        parsed_params = json.loads(params) if isinstance(params, str) else params

        result = await workflow.run_workflow(wf_def, parsed_params, timeout)
        return result
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"YAML解析失败: {str(e)}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"参数JSON解析失败: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflow/list", response_model=List[WorkflowDefinition])
async def list_workflows(current_user: User = Depends(get_current_user)):
    return _get_builtin_workflows()


@router.post("/skills/reload")
async def reload_skills(current_user: User = Depends(get_current_user)):
    global _skill_manager, _intent_parser, _workflow
    manager = _get_skill_manager()
    manager.reload_skills()
    _intent_parser = IntentParser(manager)
    _workflow = LangGraphWorkflow(manager)
    return {"message": "技能重新加载成功", "count": len(manager.skills)}


def _load_workflow_from_file(file_path: str) -> Optional[WorkflowDefinition]:
    try:
        path = Path(file_path)
        if not path.exists():
            return None
        content = path.read_text(encoding='utf-8')
        wf_data = yaml.safe_load(content)
        return _parse_workflow_yaml(wf_data)
    except Exception:
        return None


def _parse_workflow_yaml(wf_data: dict) -> WorkflowDefinition:
    from .skill_model import WorkflowStep, SkillInputParam

    steps = []
    for step_data in wf_data.get('skills', wf_data.get('steps', [])):
        sub_skills = []
        if step_data.get('parallel') and 'skills' in step_data:
            for sub in step_data['skills']:
                sub_skills.append(WorkflowStep(
                    id=f"{step_data.get('id', '')}_{sub.get('skill', '')}",
                    skill_id=sub.get('skill', ''),
                    params=sub.get('params', {}),
                ))

        steps.append(WorkflowStep(
            id=step_data.get('id', ''),
            skill_id=step_data.get('skill', step_data.get('skill_id')),
            params=step_data.get('params', {}),
            condition=step_data.get('condition'),
            depends_on=step_data.get('depends_on', []),
            parallel=step_data.get('parallel', False),
            sub_skills=sub_skills,
        ))

    params = []
    for p in wf_data.get('params', wf_data.get('inputs', [])):
        if isinstance(p, dict):
            params.append(SkillInputParam(
                name=p.get('name', ''),
                type=p.get('type', 'string'),
                required=p.get('required', True),
                default=p.get('default'),
                description=p.get('description', '')
            ))

    return WorkflowDefinition(
        workflow_id=wf_data.get('id', wf_data.get('workflow_id', 'custom')),
        name=wf_data.get('name', ''),
        description=wf_data.get('description', ''),
        steps=steps,
        params=params,
    )


def _get_builtin_workflows() -> List[WorkflowDefinition]:
    from .skill_model import WorkflowStep, SkillInputParam
    return [
        WorkflowDefinition(
            workflow_id="full_benchmark_analysis",
            name="全环节对标分析",
            description="从全景分析开始，逐步下钻到各环节和机构的完整对标分析流程",
            steps=[
                WorkflowStep(id="overview", skill_id="line-five-stage-time-benchmark-analysis",
                             params={}, depends_on=[]),
                WorkflowStep(id="export_stage", skill_id="export-link-drilldown-analysis",
                             params={}, depends_on=["overview"],
                             condition="${overview.success} == True"),
                WorkflowStep(id="import_stage", skill_id="import-link-drilldown-analysis",
                             params={}, depends_on=["overview"],
                             condition="${overview.success} == True"),
                WorkflowStep(id="delivery_stage", skill_id="delivery-stage-drilldown-analysis",
                             params={}, depends_on=["overview"],
                             condition="${overview.success} == True"),
            ],
            params=[
                SkillInputParam(name="route_name", type="string", required=True,
                                description="线路名称，如 北京 - 上海"),
            ]
        ),
        WorkflowDefinition(
            workflow_id="export_deep_analysis",
            name="出口环节深度分析",
            description="出口环节下钻后继续分析出口机构",
            steps=[
                WorkflowStep(id="export_drilldown", skill_id="export-link-drilldown-analysis",
                             params={}, depends_on=[]),
                WorkflowStep(id="export_institution", skill_id="export-institution-drilldown-analysis",
                             params={}, depends_on=["export_drilldown"],
                             condition="${export_drilldown.success} == True"),
            ],
            params=[
                SkillInputParam(name="route_name", type="string", required=True,
                                description="线路名称"),
            ]
        ),
        WorkflowDefinition(
            workflow_id="pickup_deep_analysis",
            name="收寄环节深度分析",
            description="收寄环节下钻后继续分析收寄机构",
            steps=[
                WorkflowStep(id="pickup_drilldown", skill_id="pickup-stage-drilldown-analysis",
                             params={}, depends_on=[]),
                WorkflowStep(id="pickup_institution", skill_id="pickup-institution-drilldown-analysis",
                             params={}, depends_on=["pickup_drilldown"],
                             condition="${pickup_drilldown.success} == True"),
            ],
            params=[
                SkillInputParam(name="route_name", type="string", required=True,
                                description="线路名称"),
            ]
        ),
        WorkflowDefinition(
            workflow_id="parallel_stage_analysis",
            name="并行环节分析",
            description="并行执行所有环节分析，快速获取全貌",
            steps=[
                WorkflowStep(id="all_stages", skill_id=None, params={}, depends_on=[],
                             parallel=True, sub_skills=[
                    WorkflowStep(id="export", skill_id="export-link-drilldown-analysis", params={}),
                    WorkflowStep(id="import", skill_id="import-link-drilldown-analysis", params={}),
                    WorkflowStep(id="delivery", skill_id="delivery-stage-drilldown-analysis", params={}),
                    WorkflowStep(id="transit", skill_id="transit-link-drilldown-analysis", params={}),
                ]),
            ],
            params=[
                SkillInputParam(name="route_name", type="string", required=True,
                                description="线路名称"),
            ]
        ),
    ]
