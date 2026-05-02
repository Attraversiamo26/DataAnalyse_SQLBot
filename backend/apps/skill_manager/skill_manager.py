import os
import re
import json
import yaml
import asyncio
import subprocess
import logging
from typing import List, Dict, Optional, Any, Tuple
from pathlib import Path
from .skill_model import (
    SkillInfo, SkillInputParam, SkillOutputFormat, SkillOutputDef,
    SkillChainTrigger, SkillExecutionResult, SkillLayer, SkillLanguage
)

logger = logging.getLogger(__name__)

# 使用绝对路径：从backend目录向上找到项目根目录，然后定位data/skills
# 当前文件位置: backend/apps/skill_manager/skill_manager.py
# 需要从skill_manager目录向上3层到项目根目录
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))  # backend目录
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)  # 项目根目录
SKILLS_DIR = os.environ.get("SKILLS_DIR", os.path.join(PROJECT_ROOT, "data", "skills"))
logger.info(f"技能目录路径: {SKILLS_DIR}")

SHORT_ID_MAP = {
    'line-five-stage-time-benchmark-analysis': 'line-five-stage',
    'export-link-drilldown-analysis': 'export-link',
    'import-link-drilldown-analysis': 'import-link',
    'delivery-stage-drilldown-analysis': 'delivery-stage',
    'transit-link-drilldown-analysis': 'transit-link',
    'pickup-stage-drilldown-analysis': 'pickup-stage',
    'pickup-institution-drilldown-analysis': 'pickup-institution',
    'export-institution-drilldown-analysis': 'export-institution',
}

DATA_SHEETS_MAP = {
    'line-five-stage-time-benchmark-analysis': ["线路表"],
    'export-link-drilldown-analysis': ["出口机构表"],
    'import-link-drilldown-analysis': ["线路表", "进口机构表", "进口、出口处理及投递48小时"],
    'delivery-stage-drilldown-analysis': ["线路表", "投递机构表", "进口、出口处理及投递48小时"],
    'transit-link-drilldown-analysis': ["线路表"],
    'pickup-stage-drilldown-analysis': ["收寄机构表"],
    'pickup-institution-drilldown-analysis': ["收寄机构48小时"],
    'export-institution-drilldown-analysis': ["进口、出口处理及投递48小时"],
}

SKILL_OUTPUTS_MAP = {
    'line-five-stage-time-benchmark-analysis': [
        SkillOutputDef(name="ppt_report", type="file", value="${step_5_generate_ppt.output}"),
        SkillOutputDef(name="pdf_summary", type="file", value="${step_6_generate_pdf.output}"),
        SkillOutputDef(name="key_problem_stage", type="string", value="${step_4_identify_problem.problem_analysis.max_gap_stage}"),
        SkillOutputDef(name="metrics", type="object", value="${step_3_calc_metrics.metrics}"),
    ],
    'export-link-drilldown-analysis': [
        SkillOutputDef(name="slow_institutions", type="array", value="${step_4_get_top_n.slow_institutions}"),
        SkillOutputDef(name="problem_analysis", type="object", value="${step_5_analyze_problems.problem_analysis}"),
        SkillOutputDef(name="slowest_institution", type="string", value="${step_4_get_top_n.slow_institutions[0].机构名称}"),
    ],
    'pickup-stage-drilldown-analysis': [
        SkillOutputDef(name="slow_institutions", type="array", value="${step_4_get_top_n.slow_institutions}"),
        SkillOutputDef(name="problem_analysis", type="object", value="${step_5_analyze_problems.problem_analysis}"),
        SkillOutputDef(name="slowest_institution", type="string", value="${step_4_get_top_n.slow_institutions[0].机构名称}"),
    ],
    'pickup-institution-drilldown-analysis': [
        SkillOutputDef(name="pdf_report", type="file", value="${step_7_generate_pdf.pdf_report}"),
        SkillOutputDef(name="pickup_peaks", type="array", value="${step_4_find_pickup_peaks.pickup_peaks}"),
        SkillOutputDef(name="leave_peaks", type="array", value="${step_5_find_leave_peaks.leave_peaks}"),
        SkillOutputDef(name="gap_analysis", type="object", value="${step_6_analyze_gap.gap_analysis}"),
    ],
    'export-institution-drilldown-analysis': [
        SkillOutputDef(name="pdf_report", type="file", value="${step_7_generate_pdf.pdf_report}"),
        SkillOutputDef(name="arrive_peaks", type="array", value="${step_4_find_arrive_peaks.arrive_peaks}"),
        SkillOutputDef(name="leave_peaks", type="array", value="${step_5_find_leave_peaks.leave_peaks}"),
        SkillOutputDef(name="bottleneck_analysis", type="object", value="${step_6_analyze_bottleneck.bottleneck_analysis}"),
    ],
}

CHAIN_TRIGGERS_MAP = {
    'pickup-stage-drilldown-analysis': [
        SkillChainTrigger(
            skill_id='pickup-institution-drilldown-analysis',
            trigger_type='on_user_confirm',
            params_mapping={
                'institution_name': '${outputs.slowest_institution}',
                'route_name': '${params.route_name}'
            }
        )
    ],
    'export-link-drilldown-analysis': [
        SkillChainTrigger(
            skill_id='export-institution-drilldown-analysis',
            trigger_type='on_user_confirm',
            params_mapping={
                'institution_name': '${outputs.slowest_institution}',
                'route_name': '${params.route_name}'
            }
        )
    ],
    'line-five-stage-time-benchmark-analysis': [
        SkillChainTrigger(
            skill_id='${outputs.key_problem_stage}-link-drilldown-analysis',
            trigger_type='on_user_confirm',
            params_mapping={'route_name': '${params.route_name}'}
        )
    ],
}


class SkillManager:
    def __init__(self, skills_dir: str = None):
        self.skills_dir = skills_dir or SKILLS_DIR
        self.skills: Dict[str, SkillInfo] = {}
        self._short_id_index: Dict[str, str] = {}
        self._load_skills()

    def _load_skills(self):
        skills_path = Path(self.skills_dir).resolve()
        if not skills_path.exists():
            logger.warning(f"技能目录不存在: {self.skills_dir}")
            return

        for item in skills_path.iterdir():
            if not item.is_dir():
                continue
            skill_id = item.name
            if skill_id.startswith('.') or skill_id == 'data':
                continue

            skill_md_path = item / "SKILL.md"
            if not skill_md_path.exists():
                continue
            try:
                skill_info = self._parse_skill_md(skill_md_path, str(item))
                if skill_info:
                    self.skills[skill_id] = skill_info
                    if skill_info.short_id:
                        self._short_id_index[skill_info.short_id] = skill_id
                    logger.info(f"加载技能成功: {skill_id} ({skill_info.layer.value}) short_id={skill_info.short_id}")
            except Exception as e:
                logger.error(f"加载技能失败 {skill_id}: {e}")

    def _parse_skill_md(self, file_path: Path, skill_dir: str) -> Optional[SkillInfo]:
        try:
            skill_dir = str(Path(skill_dir).resolve())
            content = file_path.read_text(encoding='utf-8')

            metadata = {}
            yaml_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
            if yaml_match:
                try:
                    metadata = yaml.safe_load(yaml_match.group(1)) or {}
                except yaml.YAMLError:
                    pass

            content_after_yaml = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)

            skill_id = file_path.parent.name
            short_id = metadata.get('id', SHORT_ID_MAP.get(skill_id))
            if not short_id:
                parts = skill_id.replace('-analysis', '').replace('-drilldown', '').replace('-time-benchmark', '')
                short_id = parts

            trigger_patterns = self._extract_trigger_patterns(content_after_yaml, skill_id)
            input_params = self._extract_input_params(content_after_yaml, metadata)
            output_formats = self._extract_output_formats(content_after_yaml, metadata)
            outputs = self._extract_outputs(content_after_yaml, metadata, skill_id)
            chain_triggers = self._extract_chain_triggers(content_after_yaml, metadata, skill_id)
            data_sheets = DATA_SHEETS_MAP.get(skill_id, [])

            name = metadata.get('name', file_path.parent.name)
            description = metadata.get('description', '')
            layer = self._determine_layer(skill_dir, metadata, content_after_yaml)
            language = self._determine_language(skill_dir)

            executable = self._find_executable(Path(skill_dir))

            workflow_steps, env_requirements, data_file = self._load_workflow_yaml(Path(skill_dir))

            return SkillInfo(
                skill_id=skill_id,
                short_id=short_id,
                name=name,
                description=description,
                layer=layer,
                language=language,
                trigger_patterns=trigger_patterns,
                input_params=input_params,
                output_formats=output_formats,
                outputs=outputs,
                chain_triggers=chain_triggers,
                data_sheets=data_sheets,
                executable=executable,
                skill_dir=skill_dir,
                args=[],
                steps=workflow_steps,
                data_file=data_file,
                env_requirements=env_requirements
            )
        except Exception as e:
            logger.error(f"解析 SKILL.md 失败 {file_path}: {e}")
            return None

    def _extract_trigger_patterns(self, content: str, skill_id: str = '') -> List[str]:
        patterns = []

        trigger_match = re.search(r'\*?\*?触发示例\*?\*?\s*[：:]\s*(.*?)(?=\n##|\n#\s|\Z)', content, re.DOTALL)
        if trigger_match:
            block = trigger_match.group(1)
            quoted = re.findall(r'["""]([^"""]+)["""]', block)
            patterns.extend(quoted)
            dash_items = re.findall(r'^\s*-\s*"([^"]+)"', block, re.MULTILINE)
            patterns.extend(dash_items)
            dash_items2 = re.findall(r'^\s*-\s*(.+)', block, re.MULTILINE)
            for item in dash_items2:
                clean = item.strip().strip('"').strip('"').strip('"')
                if clean and clean not in patterns:
                    patterns.append(clean)

        example_match = re.search(r'使用示例\s*[：:]*\s*(.*?)(?=\n##|\n#\s|\Z)', content, re.DOTALL)
        if example_match:
            block = example_match.group(1)
            code_blocks = re.findall(r'```[^\n]*\n(.*?)```', block, re.DOTALL)
            for cb in code_blocks:
                for line in cb.strip().split('\n'):
                    line = line.strip()
                    if line and len(line) > 5 and not line.startswith('#'):
                        patterns.append(line)

        specific_auto = {
            'line-five-stage-time-benchmark-analysis': {'五环节': '五环节时限对标分析'},
            'export-link-drilldown-analysis': {'出口环节': '出口环节分析'},
            'import-link-drilldown-analysis': {'进口环节': '进口环节分析'},
            'delivery-stage-drilldown-analysis': {'投递环节': '投递环节分析'},
            'transit-link-drilldown-analysis': {'中转环节': '中转环节分析'},
            'pickup-stage-drilldown-analysis': {'收寄环节': '收寄环节分析'},
            'export-institution-drilldown-analysis': {'出口机构': '出口机构下钻分析', '48小时': '48小时分布分析'},
            'pickup-institution-drilldown-analysis': {'收寄机构': '收寄机构下钻分析', '48小时': '48小时分布分析'},
        }
        if skill_id in specific_auto:
            for kw, pattern in specific_auto[skill_id].items():
                if kw in content and pattern not in patterns:
                    patterns.append(pattern)

        if '对标分析' in content and '对标分析' not in patterns:
            patterns.append('对标分析')

        return list(dict.fromkeys(patterns))

    def _extract_input_params(self, content: str, metadata: dict) -> List[SkillInputParam]:
        params = []

        if 'inputs' in metadata and isinstance(metadata['inputs'], list):
            for p in metadata['inputs']:
                params.append(SkillInputParam(
                    name=p.get('name', ''),
                    type=p.get('type', 'string'),
                    required=p.get('required', True),
                    default=p.get('default'),
                    description=p.get('description', '')
                ))
            if params:
                return params

        params_section = re.search(r'参数说明\s*\n(.*?)(?=\n##|\n#\s|\Z)', content, re.DOTALL)
        if params_section:
            section_text = params_section.group(1)
            param_items = re.findall(r'-\s*\*?\*?第[一二三四五]个参数\*?\*?\s*[：:]\s*(.+?)(?:\n|$)', section_text)
            if not param_items:
                param_items = re.findall(r'-\s*\*?\*?([^*，。]+?)\*?\*?\s*[（(]([^)）]+)[)）]\s*[：:]\s*(.+?)(?:\n|$)', section_text)

            for i, item in enumerate(param_items):
                if isinstance(item, str):
                    item_text = item.strip()
                    required = '必填' in item_text or '可选' not in item_text
                    param_name = self._normalize_param_name(item_text, i)
                    default_match = re.search(r'默认[为：:]?\s*(\d+)', item_text)
                    default_val = int(default_match.group(1)) if default_match else None
                    params.append(SkillInputParam(
                        name=param_name, type="string", required=required,
                        default=default_val, description=item_text
                    ))

        if not params:
            params_table = re.search(r'输入参数\s*\n\s*\|.*?\n\s*\|[-| :]+\n((?:\|.*\n?)+)', content)
            if params_table:
                rows = params_table.group(1).strip().split('\n')
                for row in rows:
                    cells = [c.strip() for c in row.split('|') if c.strip()]
                    if len(cells) >= 2:
                        param_name = self._normalize_param_name(cells[0], len(params))
                        param_type = cells[1] if len(cells) > 1 else "string"
                        required = "否" not in cells[2] if len(cells) > 2 else True
                        description = cells[3] if len(cells) > 3 else ""
                        default_val = None
                        if "默认" in description:
                            default_match = re.search(r'默认[为：:]?\s*(\S+)', description)
                            if default_match:
                                default_val = default_match.group(1)
                        params.append(SkillInputParam(
                            name=param_name, type=param_type, required=required,
                            default=default_val, description=description
                        ))

        if not params:
            has_route = bool(re.search(r'线路|route', content, re.IGNORECASE))
            has_institution = bool(re.search(r'机构|institution', content, re.IGNORECASE))
            has_top_n = bool(re.search(r'前\s*\d+|top\s*\d+|取前', content, re.IGNORECASE))

            if has_institution:
                params.append(SkillInputParam(name="institution_name", type="string", required=True,
                                              description="机构名称"))
            if has_route:
                params.append(SkillInputParam(name="route_name", type="string", required=True,
                                              description="线路名称，如 北京 - 上海"))
            if has_top_n:
                params.append(SkillInputParam(name="top_n", type="number", required=False,
                                              default=5, description="取前N个机构"))

        return params

    def _normalize_param_name(self, text: str, index: int) -> str:
        cn_to_en = {
            '取前': 'top_n', '排名': 'top_n', '数量': 'top_n',
            '机构名称': 'institution_name', '机构': 'institution_name',
            '线路名称': 'route_name', '线路': 'route_name',
            '环节': 'stage', '时间': 'time_period', '时间段': 'time_period',
        }
        for cn, en in cn_to_en.items():
            if cn in text:
                return en
        if '名称' in text:
            return 'name'
        return f'param_{index + 1}'

    def _extract_outputs(self, content: str, metadata: dict, skill_id: str) -> List[SkillOutputDef]:
        outputs = list(SKILL_OUTPUTS_MAP.get(skill_id, []))

        if not outputs and 'outputs' in metadata and isinstance(metadata['outputs'], list):
            for o in metadata['outputs']:
                outputs.append(SkillOutputDef(
                    name=o.get('name', ''),
                    type=o.get('type', 'string'),
                    value=o.get('value', ''),
                    description=o.get('description', '')
                ))

        return outputs

    def _extract_output_formats(self, content: str, metadata: dict) -> List[SkillOutputFormat]:
        outputs = []
        output_patterns = [
            r'输出结果[/\\]([^\s，。]+)',
            r'(\S+\.pptx)', r'(\S+\.pdf)', r'(\S+\.docx)',
            r'(\S+\.xlsx)', r'(\S+\.png)',
        ]
        seen = set()
        for pattern in output_patterns:
            matches = re.findall(pattern, content)
            for m in matches:
                if m not in seen and not m.startswith('http'):
                    seen.add(m)
                    ext = m.split('.')[-1] if '.' in m else ""
                    outputs.append(SkillOutputFormat(name=m, format=ext, path=""))

        output_table = re.search(r'输出文件\s*\n\s*\|.*?\n\s*\|[-| :]+\n((?:\|.*\n?)+)', content)
        if output_table:
            rows = output_table.group(1).strip().split('\n')
            for row in rows:
                cells = [c.strip() for c in row.split('|') if c.strip()]
                if len(cells) >= 2:
                    name = cells[0]
                    if name not in seen:
                        seen.add(name)
                        outputs.append(SkillOutputFormat(
                            name=name, format=name.split('.')[-1] if '.' in name else "",
                            path=cells[1] if len(cells) > 1 else ""
                        ))

        if not outputs and 'output_formats' in metadata:
            for o in metadata['output_formats']:
                outputs.append(SkillOutputFormat(**o))

        return outputs

    def _extract_chain_triggers(self, content: str, metadata: dict, skill_id: str) -> List[SkillChainTrigger]:
        triggers = list(CHAIN_TRIGGERS_MAP.get(skill_id, []))

        chain_match = re.search(r'联动触发\s*\n\s*```yaml\s*\n(.*?)\n```', content, re.DOTALL)
        if chain_match:
            try:
                chain_data = yaml.safe_load(chain_match.group(1))
                if isinstance(chain_data, dict) and 'on_success' in chain_data:
                    for item in chain_data['on_success']:
                        triggers.append(SkillChainTrigger(
                            skill_id=item.get('skill', ''),
                            condition=item.get('condition'),
                            params_mapping=item.get('params', {}),
                            trigger_type='on_success'
                        ))
                if isinstance(chain_data, dict) and 'on_user_confirm' in chain_data:
                    for item in chain_data['on_user_confirm']:
                        triggers.append(SkillChainTrigger(
                            skill_id=item.get('skill', ''),
                            condition=item.get('condition'),
                            params_mapping=item.get('params', {}),
                            trigger_type='on_user_confirm'
                        ))
            except yaml.YAMLError:
                pass

        if not triggers and 'chain_triggers' in metadata:
            for t in metadata['chain_triggers']:
                triggers.append(SkillChainTrigger(**t))

        return triggers

    def _determine_layer(self, skill_dir: str, metadata: dict, content: str) -> SkillLayer:
        if 'layer' in metadata:
            layer_str = str(metadata['layer']).lower()
            layer_cn_map = {'全景': 'overview', '环节': 'stage', '机构': 'institution'}
            if layer_str in layer_cn_map:
                layer_str = layer_cn_map[layer_str]
            if layer_str == 'overview':
                return SkillLayer.OVERVIEW
            elif layer_str == 'institution':
                return SkillLayer.INSTITUTION
            return SkillLayer.STAGE

        dir_name = Path(skill_dir).name.lower()
        if 'five-stage' in dir_name or 'benchmark' in dir_name or 'overview' in dir_name:
            return SkillLayer.OVERVIEW
        elif 'institution' in dir_name:
            return SkillLayer.INSTITUTION

        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else dir_name

        if '五环节' in title or '全景' in title:
            return SkillLayer.OVERVIEW
        elif '机构' in title or '48小时' in title:
            return SkillLayer.INSTITUTION

        if '机构' in dir_name:
            return SkillLayer.INSTITUTION

        return SkillLayer.STAGE

    def _determine_language(self, skill_dir: str) -> SkillLanguage:
        path = Path(skill_dir)
        js_files = list(path.glob("*.js")) + list(path.glob("scripts/*.js"))
        py_files = list(path.glob("*.py")) + list(path.glob("scripts/*.py"))
        if js_files and not py_files:
            return SkillLanguage.NODEJS
        if py_files and not js_files:
            return SkillLanguage.PYTHON
        if js_files and py_files:
            return SkillLanguage.NODEJS
        return SkillLanguage.PYTHON

    def _find_executable(self, skill_dir: Path) -> Optional[str]:
        search_paths = [skill_dir, skill_dir / "scripts"]
        priority_names = ["analyze.js", "main.js", "index.js", "analyze.py", "main.py", "index.py"]

        for search_path in search_paths:
            if not search_path.exists():
                continue
            for name in priority_names:
                exec_path = search_path / name
                if exec_path.exists():
                    return str(exec_path)

        for search_path in search_paths:
            if not search_path.exists():
                continue
            for ext in ['*.js', '*.py']:
                files = list(search_path.glob(ext))
                if files:
                    return str(files[0])

        return None

    def _load_workflow_yaml(self, skill_dir: Path) -> tuple:
        from .skill_model import SkillInternalStep, SkillOutputDef, SkillLanguage

        workflow_path = skill_dir / "workflow.yaml"
        steps = []
        env_requirements = []
        data_file = "../data/寄递时限对标分析指标大全.xlsx"

        if not workflow_path.exists():
            return steps, env_requirements, data_file

        try:
            content = workflow_path.read_text(encoding='utf-8')
            wf_data = yaml.safe_load(content) or {}

            data_file = wf_data.get('data_file', data_file)
            env_requirements = wf_data.get('env_requirements', [])

            for step_data in wf_data.get('steps', []):
                step_outputs = []
                for o in step_data.get('outputs', []):
                    step_outputs.append(SkillOutputDef(
                        name=o.get('name', ''),
                        type=o.get('type', 'string'),
                        value=o.get('value', ''),
                        description=o.get('description', '')
                    ))

                lang = SkillLanguage.PYTHON
                script = step_data.get('script', '')
                if script.endswith('.js'):
                    lang = SkillLanguage.NODEJS

                steps.append(SkillInternalStep(
                    id=step_data.get('id', ''),
                    name=step_data.get('name', ''),
                    description=step_data.get('description', ''),
                    script=script,
                    language=lang,
                    args_template=step_data.get('args_template', []),
                    depends_on=step_data.get('depends_on', []),
                    condition=step_data.get('condition'),
                    timeout=step_data.get('timeout', 120),
                    optional=step_data.get('optional', False),
                    outputs=step_outputs
                ))

            logger.info(f"加载工作流: {skill_dir.name}, {len(steps)} 个步骤")
        except Exception as e:
            logger.error(f"加载 workflow.yaml 失败: {e}")

        return steps, env_requirements, data_file

    def _extract_chinese_keywords(self, text: str) -> List[str]:
        keywords = set()
        stop_words = {'的', '了', '在', '是', '和', '与', '或', '及', '等', '中',
                      '为', '对', '从', '到', '由', '被', '把', '让', '向', '往',
                      '这', '那', '些', '个', '些', '其', '之', '以', '于', '而'}
        for length in [4, 3, 2]:
            for i in range(len(text) - length + 1):
                segment = text[i:i + length]
                if all('\u4e00' <= c <= '\u9fff' for c in segment):
                    has_stop = any(c in stop_words for c in segment)
                    if not has_stop:
                        keywords.add(segment)
        return list(keywords)

    def get_all_skills(self) -> List[SkillInfo]:
        return list(self.skills.values())

    def get_skills_by_layer(self, layer: SkillLayer) -> List[SkillInfo]:
        return [s for s in self.skills.values() if s.layer == layer]

    def get_skill(self, skill_id: str) -> Optional[SkillInfo]:
        skill = self.skills.get(skill_id)
        if skill:
            return skill
        full_id = self._short_id_index.get(skill_id)
        if full_id:
            return self.skills.get(full_id)
        return None

    def resolve_skill_id(self, skill_id: str) -> str:
        if skill_id in self.skills:
            return skill_id
        return self._short_id_index.get(skill_id, skill_id)

    def search_skills(self, keyword: str) -> List[SkillInfo]:
        keyword = keyword.lower()
        results = []
        for skill in self.skills.values():
            if (keyword in skill.name.lower() or
                keyword in skill.description.lower() or
                (skill.short_id and keyword in skill.short_id.lower()) or
                any(keyword in p.lower() for p in skill.trigger_patterns)):
                results.append(skill)
        return results

    def match_skills(self, user_query: str) -> List[Dict[str, Any]]:
        query_lower = user_query.lower()
        results = []
        for skill in self.skills.values():
            confidence = 0.0
            matched_reasons = []

            for pattern in skill.trigger_patterns:
                if pattern.lower() in query_lower:
                    confidence = min(0.95, confidence + 0.4)
                    matched_reasons.append(f"触发模式匹配: {pattern}")
                else:
                    keywords = self._extract_chinese_keywords(pattern)
                    matched_kws = [kw for kw in keywords if kw in query_lower and len(kw) >= 3]
                    if matched_kws:
                        kw_score = min(0.15, len(matched_kws) * 0.05)
                        confidence = min(0.9, confidence + kw_score)
                        matched_reasons.append(f"关键词匹配: {', '.join(matched_kws[:3])}")

            if skill.name.lower() in query_lower:
                confidence = min(0.95, confidence + 0.25)
                matched_reasons.append(f"名称匹配: {skill.name}")

            stage_specific_keywords = {
                'line-five-stage-time-benchmark-analysis': ["五环节", "全程时限", "全景分析", "对标分析"],
                'export-link-drilldown-analysis': ["出口环节", "出口下钻", "出口时限"],
                'import-link-drilldown-analysis': ["进口环节", "进口下钻", "进口时限"],
                'delivery-stage-drilldown-analysis': ["投递环节", "投递下钻", "投递时限"],
                'transit-link-drilldown-analysis': ["中转环节", "中转下钻", "中转时限"],
                'pickup-stage-drilldown-analysis': ["收寄环节", "收寄下钻", "收寄时限"],
                'export-institution-drilldown-analysis': ["出口机构", "出口48小时"],
                'pickup-institution-drilldown-analysis': ["收寄机构", "收寄48小时"],
            }
            specific_kws = stage_specific_keywords.get(skill.skill_id, [])
            for kw in specific_kws:
                if kw in query_lower:
                    confidence = min(0.95, confidence + 0.3)
                    matched_reasons.append(f"专有关键词: {kw}")
                    break

            layer_keywords = {
                SkillLayer.OVERVIEW: ["全景", "综合", "五环节"],
                SkillLayer.STAGE: ["环节", "下钻"],
                SkillLayer.INSTITUTION: ["机构", "48小时", "48h", "分布"],
            }
            for kw in layer_keywords.get(skill.layer, []):
                if kw in query_lower:
                    confidence = min(0.9, confidence + 0.1)
                    matched_reasons.append(f"层级关键词: {kw}")
                    break

            if confidence > 0.3:
                exact_match_count = sum(
                    1 for p in skill.trigger_patterns if p.lower() in query_lower
                )
                results.append({
                    'skill_id': skill.skill_id,
                    'confidence': round(confidence, 3),
                    'reason': '; '.join(matched_reasons) if matched_reasons else "模糊匹配",
                    'skill_info': skill,
                    '_exact_matches': exact_match_count
                })

        results.sort(key=lambda x: (x['confidence'], x['_exact_matches']), reverse=True)
        for r in results:
            del r['_exact_matches']
        return results

    async def execute_skill(self, skill_id: str, params: Dict[str, Any] = None,
                           timeout: int = 300) -> SkillExecutionResult:
        import time
        start_time = time.time()
        params = params or {}

        resolved_id = self.resolve_skill_id(skill_id)
        skill = self.get_skill(resolved_id)
        if not skill:
            return SkillExecutionResult(
                skill_id=skill_id, success=False,
                error_message=f"技能不存在: {skill_id}", execution_time=0
            )

        if not skill.executable:
            return SkillExecutionResult(
                skill_id=resolved_id, success=False,
                error_message=f"技能没有可执行文件: {resolved_id}", execution_time=0
            )

        try:
            exec_path = Path(skill.executable)
            args = []

            if exec_path.suffix == '.js':
                args = ['node', str(exec_path)]
            elif exec_path.suffix == '.py':
                args = ['python', str(exec_path)]

            ordered_param_values = self._build_ordered_params(skill, params)
            args.extend(ordered_param_values)

            logger.info(f"执行技能 {resolved_id}: {' '.join(args)}")

            process = await asyncio.create_subprocess_exec(
                *args,
                cwd=skill.skill_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), timeout=timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                execution_time = time.time() - start_time
                return SkillExecutionResult(
                    skill_id=resolved_id, success=False,
                    error_message=f"执行超时（{timeout}秒）",
                    execution_time=execution_time
                )

            execution_time = time.time() - start_time

            output_files = self._collect_output_files(skill.skill_dir, start_time)
            stdout_str = stdout.decode('utf-8', errors='ignore')
            stderr_str = stderr.decode('utf-8', errors='ignore')
            extracted = self._extract_result_params(stdout_str, skill)
            structured = self._parse_structured_outputs(stdout_str, skill, output_files)

            pending_confirm = None
            for trigger in skill.chain_triggers:
                if trigger.trigger_type == 'on_user_confirm':
                    chain_params = {}
                    for target_param, source_expr in trigger.params_mapping.items():
                        if source_expr.startswith('${outputs.'):
                            key = source_expr.split('outputs.')[-1].rstrip('}')
                            chain_params[target_param] = structured.get(key, extracted.get(key, ''))
                        elif source_expr.startswith('${params.'):
                            key = source_expr.split('params.')[-1].rstrip('}')
                            chain_params[target_param] = params.get(key, '')
                        else:
                            chain_params[target_param] = source_expr

                    resolved_trigger_id = trigger.skill_id
                    if resolved_trigger_id.startswith('${'):
                        stage_name = structured.get('key_problem_stage', '')
                        stage_map = {'收寄': 'pickup-stage', '出口': 'export-link',
                                     '进口': 'import-link', '投递': 'delivery-stage',
                                     '中转': 'transit-link'}
                        resolved_trigger_id = stage_map.get(stage_name, '')

                    pending_confirm = {
                        'message': f"是否需要对 [{structured.get('slowest_institution', '最慢机构')}] 开展下钻分析？",
                        'trigger_skill_id': resolved_trigger_id,
                        'params': chain_params,
                        'original_trigger': trigger.model_dump()
                    }
                    break

            if process.returncode == 0:
                return SkillExecutionResult(
                    skill_id=resolved_id, success=True,
                    output_files=output_files, execution_time=execution_time,
                    output=stdout_str, error=stderr_str,
                    extracted_params=extracted,
                    structured_outputs=structured,
                    pending_confirmation=pending_confirm
                )
            else:
                return SkillExecutionResult(
                    skill_id=resolved_id, success=False,
                    output_files=output_files,
                    error_message=f"执行失败，返回码: {process.returncode}",
                    execution_time=execution_time,
                    output=stdout_str, error=stderr_str,
                    extracted_params=extracted,
                    structured_outputs=structured
                )

        except Exception as e:
            execution_time = time.time() - start_time
            return SkillExecutionResult(
                skill_id=resolved_id, success=False,
                error_message=str(e), execution_time=execution_time
            )

    async def execute_skill_steps(self, skill_id: str, params: Dict[str, Any] = None,
                                   timeout: int = 600) -> SkillExecutionResult:
        import time
        start_time = time.time()
        params = params or {}

        resolved_id = self.resolve_skill_id(skill_id)
        skill = self.get_skill(resolved_id)
        if not skill:
            return SkillExecutionResult(
                skill_id=skill_id, success=False,
                error_message=f"技能不存在: {skill_id}", execution_time=0
            )

        if not skill.steps:
            return await self.execute_skill(skill_id, params, timeout)

        logger.info(f"按工作流步骤执行技能 {resolved_id}: {len(skill.steps)} 个步骤")

        step_results: Dict[str, Dict[str, Any]] = {}
        all_output_files = []
        all_stdout = []
        all_stderr = []
        structured = {}
        extracted = {}
        has_failure = False

        for step in skill.steps:
            if step.depends_on:
                deps_met = all(
                    step_results.get(dep_id, {}).get('success', False)
                    for dep_id in step.depends_on
                )
                if not deps_met:
                    logger.warning(f"步骤 {step.id} 依赖未满足，跳过")
                    step_results[step.id] = {'success': False, 'skipped': True}
                    continue

            if step.condition:
                condition_str = step.condition
                for key, val in params.items():
                    condition_str = condition_str.replace(f'${{params.{key}}}', str(val))
                for prev_id, prev_result in step_results.items():
                    for k, v in prev_result.get('structured_outputs', {}).items():
                        condition_str = condition_str.replace(f'${{{prev_id}.{k}}}', str(v))
                try:
                    if not bool(eval(condition_str)):
                        logger.info(f"步骤 {step.id} 条件不满足，跳过")
                        step_results[step.id] = {'success': True, 'skipped': True}
                        continue
                except Exception:
                    pass

            step_args = self._resolve_step_args(step, params, step_results)

            script_path = Path(skill.skill_dir) / step.script
            if not script_path.exists():
                logger.error(f"步骤 {step.id} 脚本不存在: {script_path}")
                if step.optional:
                    step_results[step.id] = {'success': False, 'skipped': False, 'error': '脚本不存在'}
                    continue
                has_failure = True
                break

            cmd_args = []
            if step.language == SkillLanguage.NODEJS:
                cmd_args = ['node', str(script_path)]
            else:
                cmd_args = ['python', str(script_path)]
            cmd_args.extend(step_args)

            logger.info(f"执行步骤 {step.id} ({step.name}): {' '.join(cmd_args)}")

            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd_args,
                    cwd=skill.skill_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), timeout=step.timeout
                )

                stdout_str = stdout.decode('utf-8', errors='ignore')
                stderr_str = stderr.decode('utf-8', errors='ignore')
                all_stdout.append(f"[{step.id}] {stdout_str}")
                all_stderr.append(f"[{step.id}] {stderr_str}")

                step_output_files = self._collect_output_files(skill.skill_dir, start_time)
                step_structured = self._parse_structured_outputs(stdout_str, skill, step_output_files)

                step_success = process.returncode == 0
                step_results[step.id] = {
                    'success': step_success,
                    'returncode': process.returncode,
                    'structured_outputs': step_structured,
                    'output_files': step_output_files
                }

                structured.update(step_structured)
                all_output_files.extend(f for f in step_output_files if f not in all_output_files)

                if not step_success and not step.optional:
                    logger.error(f"步骤 {step.id} 执行失败: returncode={process.returncode}")
                    has_failure = True
                    break

            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                logger.error(f"步骤 {step.id} 执行超时")
                if step.optional:
                    step_results[step.id] = {'success': False, 'error': 'timeout'}
                    continue
                has_failure = True
                break
            except Exception as e:
                logger.error(f"步骤 {step.id} 执行异常: {e}")
                if step.optional:
                    step_results[step.id] = {'success': False, 'error': str(e)}
                    continue
                has_failure = True
                break

        execution_time = time.time() - start_time

        pending_confirm = None
        for trigger in skill.chain_triggers:
            if trigger.trigger_type == 'on_user_confirm':
                chain_params = {}
                for target_param, source_expr in trigger.params_mapping.items():
                    if source_expr.startswith('${outputs.'):
                        key = source_expr.split('outputs.')[-1].rstrip('}')
                        chain_params[target_param] = structured.get(key, extracted.get(key, ''))
                    elif source_expr.startswith('${params.'):
                        key = source_expr.split('params.')[-1].rstrip('}')
                        chain_params[target_param] = params.get(key, '')
                    else:
                        chain_params[target_param] = source_expr
                pending_confirm = {
                    'message': f"是否需要对 [{structured.get('slowest_institution', '最慢机构')}] 开展下钻分析？",
                    'trigger_skill_id': trigger.skill_id,
                    'params': chain_params,
                    'original_trigger': trigger.model_dump()
                }
                break

        return SkillExecutionResult(
            skill_id=resolved_id,
            success=not has_failure,
            output_files=all_output_files,
            execution_time=execution_time,
            output='\n'.join(all_stdout),
            error='\n'.join(all_stderr),
            extracted_params=extracted,
            structured_outputs=structured,
            pending_confirmation=pending_confirm
        )

    def _resolve_step_args(self, step, params: Dict[str, Any],
                            step_results: Dict[str, Dict[str, Any]]) -> List[str]:
        resolved = []
        for arg_template in step.args_template:
            arg_value = arg_template
            for key, val in params.items():
                arg_value = arg_value.replace(f'${{params.{key}}}', str(val))
            for prev_id, prev_result in step_results.items():
                for k, v in prev_result.get('structured_outputs', {}).items():
                    arg_value = arg_value.replace(f'${{{prev_id}.{k}}}', str(v))
            resolved.append(arg_value)
        return resolved

    def _build_ordered_params(self, skill: SkillInfo, params: Dict[str, Any]) -> List[str]:
        ordered = []
        # 检查技能的步骤模板，确定实际需要的参数
        actual_params_needed = set()
        
        for step in skill.steps:
            for arg_template in step.args_template:
                if arg_template.startswith('${params.'):
                    param_name = arg_template.split('params.')[-1].rstrip('}')
                    actual_params_needed.add(param_name)
        
        # 如果没有定义步骤模板，则使用所有输入参数
        if not actual_params_needed:
            actual_params_needed = {p.name for p in skill.input_params}
        
        for param_def in skill.input_params:
            # 只添加脚本实际需要的参数
            if param_def.name not in actual_params_needed:
                continue
                
            value = params.get(param_def.name)
            if value is None:
                value = param_def.default
            # 跳过空字符串（用户未选择的可选参数）
            if value is not None and value != '':
                ordered.append(str(value))
        
        # 添加额外的未定义参数
        for key, value in params.items():
            if key not in actual_params_needed and not any(p.name == key for p in skill.input_params):
                if isinstance(value, list):
                    ordered.extend(str(v) for v in value if v != '')
                elif value != '':
                    ordered.append(str(value))
        
        return ordered

    def _collect_output_files(self, skill_dir: str, start_time: float = None) -> List[str]:
        output_files = []
        search_dirs = [Path(skill_dir) / "输出结果", Path(skill_dir) / "scripts", Path(skill_dir)]
        
        for search_dir in search_dirs:
            if not search_dir.exists():
                continue
            for ext in ['*.pdf', '*.pptx', '*.docx', '*.xlsx', '*.png', '*.jpg', '*.csv', '*.html']:
                for f in search_dir.glob(ext):
                    # 过滤模板文件
                    if '模板' in f.name:
                        continue
                    # 如果提供了开始时间，只返回执行后创建/修改的文件
                    # 添加5秒容差，避免时区或系统时间精度问题
                    if start_time is not None:
                        mtime = f.stat().st_mtime
                        if mtime >= start_time - 5:
                            output_files.append(str(f))
                            logger.debug(f"收集文件: {f.name}, 修改时间: {mtime}, 开始时间: {start_time}")
                    else:
                        output_files.append(str(f))
        return output_files

    def _extract_result_params(self, stdout: str, skill: SkillInfo) -> Dict[str, Any]:
        extracted = {}
        for trigger in skill.chain_triggers:
            for target_param, source_expr in trigger.params_mapping.items():
                if source_expr.startswith('${') and source_expr.endswith('}'):
                    expr = source_expr[2:-1]
                    if 'outputs.' in expr:
                        key = expr.split('outputs.')[-1]
                        json_match = re.search(rf'"{key}"\s*:\s*"([^"]*)"', stdout)
                        if json_match:
                            extracted[key] = json_match.group(1)
        return extracted

    def _parse_structured_outputs(self, stdout: str, skill: SkillInfo,
                                   output_files: List[str]) -> Dict[str, Any]:
        structured = {}

        for output_def in skill.outputs:
            name = output_def.name
            if output_def.type == 'file':
                matching = [f for f in output_files if name.split('_')[0] in f.lower() or
                           any(ext in f for ext in ['.pptx', '.pdf', '.docx', '.png'])]
                if matching:
                    structured[name] = matching[0]
            elif output_def.type == 'string':
                json_match = re.search(rf'"{name}"\s*:\s*"([^"]*)"', stdout)
                if json_match:
                    structured[name] = json_match.group(1)
            elif output_def.type == 'array':
                json_match = re.search(rf'"{name}"\s*:\s*(\[.*?\])', stdout, re.DOTALL)
                if json_match:
                    try:
                        structured[name] = json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        pass
            elif output_def.type == 'object':
                json_match = re.search(rf'"{name}"\s*:\s*(\{{.*?\}})', stdout, re.DOTALL)
                if json_match:
                    try:
                        structured[name] = json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        pass
            elif output_def.type == 'number':
                json_match = re.search(rf'"{name}"\s*:\s*(\d+\.?\d*)', stdout)
                if json_match:
                    val = json_match.group(1)
                    structured[name] = float(val) if '.' in val else int(val)

        if 'slowest_institution' not in structured:
            slowest_match = re.search(r'(?:最慢|慢机构|Top\s*1)[:\s]*([^\n,，]+)', stdout)
            if slowest_match:
                structured['slowest_institution'] = slowest_match.group(1).strip()

        if 'key_problem_stage' not in structured:
            stage_gaps = {}
            for stage in ['收寄', '出口', '进口', '投递', '中转']:
                gap_match = re.search(rf'{stage}.*?[差值差异][距离]?\s*[：:]\s*[特快慢于优于竞品]*\s*([\d.]+)\s*小时', stdout)
                if gap_match:
                    stage_gaps[stage] = float(gap_match.group(1))
                elif f'{stage}时限' in stdout:
                    stage_gaps.setdefault(stage, 0)
            if stage_gaps:
                worst_stage = max(stage_gaps, key=stage_gaps.get)
                structured['key_problem_stage'] = worst_stage

        if 'transit_gap' not in structured:
            gap_match = re.search(r'差值[：:]\s*[-]?([\d.]+)\s*小时', stdout)
            if gap_match:
                structured['transit_gap'] = float(gap_match.group(1))

        if 'route_data' not in structured:
            route_match = re.search(r'找到线路[：:]\s*(\S+)', stdout)
            if route_match:
                structured['route_data'] = {'route_name': route_match.group(1)}

        if 'import_gap' not in structured:
            gap_match = re.search(r'进口.*?[差值差异]\s*[：:]\s*[-]?([\d.]+)\s*小时', stdout)
            if gap_match:
                structured['import_gap'] = float(gap_match.group(1))

        if 'delivery_gap' not in structured:
            gap_match = re.search(r'投递.*?[差值差异]\s*[：:]\s*[-]?([\d.]+)\s*小时', stdout)
            if gap_match:
                structured['delivery_gap'] = float(gap_match.group(1))

        for output_def in skill.outputs:
            if output_def.name not in structured and output_def.type == 'file':
                for f in output_files:
                    if output_def.name in f or any(kw in f for kw in ['报告', '分析结果']):
                        structured[output_def.name] = f
                        break

        return structured

    async def execute_chain(self, skill_id: str, params: Dict[str, Any] = None,
                           timeout: int = 300) -> List[SkillExecutionResult]:
        results = []
        main_result = await self.execute_skill(skill_id, params, timeout)
        results.append(main_result)

        if not main_result.success:
            return results

        resolved_id = self.resolve_skill_id(skill_id)
        skill = self.get_skill(resolved_id)
        if not skill or not skill.chain_triggers:
            return results

        for trigger in skill.chain_triggers:
            if trigger.trigger_type == 'on_user_confirm':
                continue

            should_trigger = True
            if trigger.condition:
                condition_str = trigger.condition
                for key, val in main_result.extracted_params.items():
                    condition_str = condition_str.replace(f'${{outputs.{key}}}', str(val))
                for key, val in params.items():
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
                        chain_params[target_param] = main_result.structured_outputs.get(
                            key, main_result.extracted_params.get(key, ''))
                    elif expr.startswith('params.'):
                        key = expr.split('params.')[-1]
                        chain_params[target_param] = params.get(key, '')
                else:
                    chain_params[target_param] = source_expr

            chain_result = await self.execute_skill(trigger.skill_id, chain_params, timeout)
            results.append(chain_result)

        return results

    async def confirm_chain(self, skill_id: str, confirmation: Dict[str, Any],
                            params: Dict[str, Any] = None,
                            timeout: int = 300) -> SkillExecutionResult:
        trigger_skill_id = confirmation.get('trigger_skill_id', '')
        chain_params = confirmation.get('params', {})

        logger.info(f"用户确认联动触发: {trigger_skill_id}, 参数: {chain_params}")
        result = await self.execute_skill(trigger_skill_id, chain_params, timeout)
        return result

    def reload_skills(self):
        self.skills.clear()
        self._short_id_index.clear()
        self._load_skills()
        logger.info(f"重新加载技能完成，共加载 {len(self.skills)} 个技能")


def get_skill_manager() -> SkillManager:
    return SkillManager()
