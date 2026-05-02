import re
import logging
from typing import List, Dict, Optional, Any
from .skill_manager import SkillManager
from .skill_model import IntentMatchResult, SkillInfo, SkillInputParam, SkillLayer

logger = logging.getLogger(__name__)


class IntentParser:
    def __init__(self, skill_manager: SkillManager):
        self.skill_manager = skill_manager

    def parse_intent(self, user_query: str) -> List[IntentMatchResult]:
        results = []
        matched_skills = self.skill_manager.match_skills(user_query)

        for match in matched_skills:
            skill_info = match['skill_info']
            extracted_params = self._extract_params(user_query, skill_info)
            decision_path = self._build_decision_path(user_query, skill_info)

            results.append(IntentMatchResult(
                skill_id=match['skill_id'],
                confidence=match['confidence'],
                reason=match['reason'],
                skill_info=skill_info,
                extracted_params=extracted_params,
                decision_path=decision_path
            ))

        return results

    def _build_decision_path(self, user_query: str, skill: SkillInfo) -> str:
        query = user_query.lower()
        paths = []

        if skill.layer == SkillLayer.OVERVIEW:
            paths.append("想要整体了解线路表现")
        elif skill.layer == SkillLayer.STAGE:
            stage_names = {
                'export-link-drilldown-analysis': '出口',
                'import-link-drilldown-analysis': '进口',
                'delivery-stage-drilldown-analysis': '投递',
                'transit-link-drilldown-analysis': '中转',
                'pickup-stage-drilldown-analysis': '收寄',
            }
            stage = stage_names.get(skill.skill_id, '')
            if stage:
                paths.append(f"已经知道问题在{stage}环节")
        elif skill.layer == SkillLayer.INSTITUTION:
            inst_names = {
                'pickup-institution-drilldown-analysis': '收寄',
                'export-institution-drilldown-analysis': '出口',
            }
            inst = inst_names.get(skill.skill_id, '')
            if inst:
                paths.append(f"已经知道具体哪个{inst}机构慢")

        return ' → '.join(paths) if paths else ""

    def _extract_params(self, user_query: str, skill: SkillInfo) -> Dict[str, Any]:
        params = {}
        for param_def in skill.input_params:
            value = self._extract_single_param(user_query, param_def, skill)
            if value is not None:
                params[param_def.name] = value
        return params

    def _extract_single_param(self, user_query: str, param_def: SkillInputParam,
                               skill: SkillInfo) -> Optional[Any]:
        name = param_def.name
        query = user_query

        if name in ('route_name', 'route', '线路'):
            return self._extract_route_name(query)
        elif name in ('top_n', 'top', '数量', '排名'):
            return self._extract_top_n(query)
        elif name in ('institution_name', 'institution', '机构名称', '机构'):
            return self._extract_institution_name(query)
        elif name in ('stage', '环节', '阶段'):
            return self._extract_stage(query)
        elif name in ('time_period', 'period', '时间', '时间段'):
            return self._extract_time_period(query)
        elif param_def.type == 'number':
            return self._extract_number(query, name)
        elif param_def.default is not None:
            return param_def.default
        return None

    def _extract_route_name(self, query: str) -> Optional[str]:
        route_match = re.search(
            r'(?:线路|路线)[：:为]?\s*["""]?([^\s，。、"""]+?)\s*[-—到至]\s*([^\s，。、"""]+)["""]?',
            query
        )
        if route_match:
            return f"{route_match.group(1)} - {route_match.group(2)}"

        city_match = re.search(
            r'([^\s，。、的]{2,8}?(?:市|省|区|县))\s*[-—到至]\s*([^\s，。、的]{2,8}?(?:市|省|区|县))',
            query
        )
        if city_match:
            return f"{city_match.group(1)} - {city_match.group(2)}"

        prefix_words = r'(?:开展|分析|生成|进行|查看|请|帮我|帮忙|看看|想|要|需要|做)'
        generic_match = re.search(
            prefix_words + r'*\s*([\u4e00-\u9fff]{2,4}?)\s*[-—到至]\s*([\u4e00-\u9fff]{2,4}?)(?:线路|环节|机构|的|$)',
            query
        )
        if generic_match:
            g1, g2 = generic_match.group(1), generic_match.group(2)
            skip_words = {'开展', '分析', '生成', '进行', '查看', '线路', '环节', '机构'}
            if g1 not in skip_words and g2 not in skip_words:
                return f"{g1} - {g2}"

        return None

    def _extract_top_n(self, query: str) -> Optional[int]:
        patterns = [
            r'[前]?\s*(\d+)\s*[个名位条]',
            r'[Tt]op\s*(\d+)',
            r'前\s*(\d+)',
            r'(\d+)\s*名',
        ]
        for pattern in patterns:
            match = re.search(pattern, query)
            if match:
                return int(match.group(1))
        return None

    def _extract_institution_name(self, query: str) -> Optional[str]:
        patterns = [
            r'机构[：:]\s*([^\s，。]+)',
            r'([^\s，。]+(?:局|所|站|中心))',
        ]
        for pattern in patterns:
            match = re.search(pattern, query)
            if match:
                return match.group(1)
        return None

    def _extract_stage(self, query: str) -> Optional[str]:
        stage_map = {
            '收寄': 'pickup', '出口': 'export', '进口': 'import',
            '中转': 'transit', '投递': 'delivery',
            'pickup': 'pickup', 'export': 'export', 'import': 'import',
            'transit': 'transit', 'delivery': 'delivery',
        }
        for cn_name, en_name in stage_map.items():
            if cn_name in query:
                return en_name
        return None

    def _extract_time_period(self, query: str) -> Optional[str]:
        patterns = [
            r'(\d{4})\s*[年-]\s*(\d{1,2})\s*[月-]\s*(\d{1,2})\s*日?',
            r'(\d{4})\s*年\s*(\d{1,2})\s*月',
            r'(\d{4})\s*年',
            r'近\s*(\d+)\s*[天周月年]',
        ]
        for pattern in patterns:
            match = re.search(pattern, query)
            if match:
                return match.group(0)
        return None

    def _extract_number(self, query: str, param_name: str) -> Optional[int]:
        match = re.search(rf'{param_name}[：:]\s*(\d+)', query, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None

    def suggest_skills(self, user_query: str, top_k: int = 3) -> List[IntentMatchResult]:
        results = self.parse_intent(user_query)
        return results[:top_k]

    def get_best_match(self, user_query: str, min_confidence: float = 0.5) -> Optional[IntentMatchResult]:
        results = self.parse_intent(user_query)
        if results and results[0].confidence >= min_confidence:
            return results[0]
        return None

    def get_decision_tree_recommendation(self, user_query: str) -> Dict[str, Any]:
        query = user_query.lower()
        recommendation = {
            'layer': None,
            'skill_id': None,
            'reason': '',
            'next_options': []
        }

        if any(kw in query for kw in ['整体', '全景', '五环节', '全程', '对标分析']):
            recommendation['layer'] = 'overview'
            recommendation['skill_id'] = 'line-five-stage'
            recommendation['reason'] = '想要整体了解线路表现'
            recommendation['next_options'] = [
                {'label': '出口环节', 'skill_id': 'export-link'},
                {'label': '进口环节', 'skill_id': 'import-link'},
                {'label': '投递环节', 'skill_id': 'delivery-stage'},
                {'label': '中转环节', 'skill_id': 'transit-link'},
                {'label': '收寄环节', 'skill_id': 'pickup-stage'},
            ]
        elif any(kw in query for kw in ['机构', '48小时', '48h']):
            recommendation['layer'] = 'institution'
            if '收寄' in query:
                recommendation['skill_id'] = 'pickup-institution'
                recommendation['reason'] = '已知某个收寄机构慢'
            elif '出口' in query:
                recommendation['skill_id'] = 'export-institution'
                recommendation['reason'] = '已知某个出口机构慢'
            else:
                recommendation['reason'] = '已知具体哪个机构慢'
                recommendation['next_options'] = [
                    {'label': '收寄机构', 'skill_id': 'pickup-institution'},
                    {'label': '出口机构', 'skill_id': 'export-institution'},
                ]
        elif any(kw in query for kw in ['环节', '下钻', '出口', '进口', '投递', '中转', '收寄']):
            recommendation['layer'] = 'stage'
            if '出口' in query:
                recommendation['skill_id'] = 'export-link'
                recommendation['reason'] = '怀疑出口环节有问题'
            elif '进口' in query:
                recommendation['skill_id'] = 'import-link'
                recommendation['reason'] = '怀疑进口环节有问题'
            elif '投递' in query:
                recommendation['skill_id'] = 'delivery-stage'
                recommendation['reason'] = '怀疑投递环节有问题'
            elif '中转' in query:
                recommendation['skill_id'] = 'transit-link'
                recommendation['reason'] = '怀疑中转环节有问题'
            elif '收寄' in query:
                recommendation['skill_id'] = 'pickup-stage'
                recommendation['reason'] = '怀疑收寄环节有问题'
            else:
                recommendation['reason'] = '已经知道问题在哪个环节'
                recommendation['next_options'] = [
                    {'label': '出口环节', 'skill_id': 'export-link'},
                    {'label': '进口环节', 'skill_id': 'import-link'},
                    {'label': '投递环节', 'skill_id': 'delivery-stage'},
                    {'label': '中转环节', 'skill_id': 'transit-link'},
                    {'label': '收寄环节', 'skill_id': 'pickup-stage'},
                ]
        else:
            recommendation['reason'] = '无法确定分析需求，建议先做全景分析'
            recommendation['skill_id'] = 'line-five-stage'
            recommendation['next_options'] = [
                {'label': '全景分析', 'skill_id': 'line-five-stage'},
            ]

        return recommendation
