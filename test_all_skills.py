#!/usr/bin/env python3
"""
测试所有8个技能的完整工作流执行
"""
import asyncio
import os
import sys
import json
import time
from pathlib import Path

# 添加后端路径到 sys.path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from apps.skill_manager.skill_manager import SkillManager
from apps.skill_manager.skill_model import SkillInfo, SkillExecutionResult, SkillLayer


class SkillTester:
    """技能测试器"""
    
    def __init__(self):
        self.skill_manager = SkillManager()
        self.results = []
        self.test_route_name = "滨州市 - 大同市"
        self.test_institution_name = "博兴二部"
        
        # 8个技能的测试配置
        self.skill_test_configs = [
            {
                "skill_id": "line-five-stage-time-benchmark-analysis",
                "name": "五环节全景分析",
                "layer": "overview",
                "params": {"route_name": self.test_route_name},
                "expected_outputs": ["ppt_report", "pdf_summary", "key_problem_stage", "metrics"],
                "expected_formats": [".pptx", ".pdf"]
            },
            {
                "skill_id": "export-link-drilldown-analysis",
                "name": "出口环节下钻",
                "layer": "stage",
                "params": {"route_name": self.test_route_name},
                "expected_outputs": ["slow_institutions", "problem_analysis", "slowest_institution"],
                "expected_formats": [".pdf"]
            },
            {
                "skill_id": "import-link-drilldown-analysis",
                "name": "进口环节下钻",
                "layer": "stage",
                "params": {"route_name": self.test_route_name},
                "expected_outputs": [],
                "expected_formats": [".pdf"]
            },
            {
                "skill_id": "delivery-stage-drilldown-analysis",
                "name": "投递环节下钻",
                "layer": "stage",
                "params": {"route_name": self.test_route_name},
                "expected_outputs": [],
                "expected_formats": [".docx", ".pdf"]
            },
            {
                "skill_id": "transit-link-drilldown-analysis",
                "name": "中转环节下钻",
                "layer": "stage",
                "params": {"route_name": self.test_route_name},
                "expected_outputs": [],
                "expected_formats": [".docx", ".pdf"]
            },
            {
                "skill_id": "pickup-stage-drilldown-analysis",
                "name": "收寄环节下钻",
                "layer": "stage",
                "params": {"route_name": self.test_route_name},
                "expected_outputs": ["slow_institutions", "problem_analysis", "slowest_institution"],
                "expected_formats": [".pdf"]
            },
            {
                "skill_id": "pickup-institution-drilldown-analysis",
                "name": "收寄机构下钻",
                "layer": "institution",
                "params": {"institution_name": self.test_institution_name, "route_name": self.test_route_name},
                "expected_outputs": ["pdf_report", "pickup_peaks", "leave_peaks", "gap_analysis"],
                "expected_formats": [".pdf", ".png"]
            },
            {
                "skill_id": "export-institution-drilldown-analysis",
                "name": "出口机构下钻",
                "layer": "institution",
                "params": {"institution_name": "济南齐河", "route_name": self.test_route_name},
                "expected_outputs": ["pdf_report", "arrive_peaks", "leave_peaks", "bottleneck_analysis"],
                "expected_formats": [".pdf", ".png"]
            }
        ]
    
    def print_separator(self, title: str = ""):
        """打印分隔符"""
        print("\n" + "="*80)
        if title:
            print(f"  {title}")
            print("="*80)
    
    async def test_skill_loading(self) -> bool:
        """测试技能加载"""
        self.print_separator("测试技能加载")
        print(f"正在检查 data/skills 目录中的技能...")
        
        all_skills = self.skill_manager.get_all_skills()
        print(f"\n✅ 成功加载 {len(all_skills)} 个技能:")
        
        for i, skill in enumerate(all_skills, 1):
            layer_text = {
                SkillLayer.OVERVIEW: "全景分析层",
                SkillLayer.STAGE: "环节分析层",
                SkillLayer.INSTITUTION: "机构下钻层"
            }.get(skill.layer, "未知")
            print(f"\n技能 {i}: {skill.name}")
            print(f"  ID: {skill.skill_id}")
            print(f"  简称: {skill.short_id}")
            print(f"  层级: {layer_text}")
            print(f"  语言: {skill.language.value}")
            print(f"  触发模式: {len(skill.trigger_patterns)} 个")
            print(f"  输入参数: {len(skill.input_params)} 个")
            for param in skill.input_params:
                print(f"    - {param.name}: {param.type} (必填: {param.required})")
            print(f"  工作流步骤: {len(skill.steps)} 个")
            for step in skill.steps:
                print(f"    - {step.id}: {step.name}")
            print(f"  可执行文件: {skill.executable}")
        
        # 验证是否有8个技能
        has_8_skills = len(all_skills) == 8
        print(f"\n🎯 技能数量检查: {'✅ 通过' if has_8_skills else '❌ 失败'} (应该有8个)")
        return has_8_skills
    
    async def test_single_skill(self, config: dict) -> dict:
        """测试单个技能"""
        skill_id = config["skill_id"]
        skill_name = config["name"]
        
        self.print_separator(f"测试技能: {skill_name}")
        
        result_data = {
            "skill_id": skill_id,
            "name": skill_name,
            "success": False,
            "execution_time": 0,
            "output_files": [],
            "structured_outputs": {},
            "error": None
        }
        
        try:
            print(f"\n🚀 正在执行技能: {skill_id}")
            print(f"📋 参数: {config['params']}")
            
            start_time = time.time()
            result: SkillExecutionResult = await self.skill_manager.execute_skill_steps(
                skill_id=skill_id,
                params=config["params"],
                timeout=600
            )
            execution_time = time.time() - start_time
            
            result_data["execution_time"] = execution_time
            result_data["success"] = result.success
            
            if result.success:
                print(f"\n✅ 技能执行成功! (耗时: {execution_time:.2f} 秒)")
                
                # 输出文件
                result_data["output_files"] = result.output_files
                print(f"\n📁 输出文件: {len(result.output_files)} 个")
                for f in result.output_files:
                    print(f"   - {f}")
                
                # 结构化输出
                result_data["structured_outputs"] = result.structured_outputs
                print(f"\n📊 结构化输出:")
                for key, value in result.structured_outputs.items():
                    print(f"   - {key}: {value}")
                
                # 检查期望的输出格式
                if config.get("expected_formats"):
                    print(f"\n🔍 检查期望的输出格式:")
                    for fmt in config["expected_formats"]:
                        found = any(fmt in f for f in result.output_files)
                        status = "✅" if found else "❌"
                        print(f"  {status} {fmt}: {'找到' if found else '未找到'}")
                
                # 检查期望的结构化输出
                if config.get("expected_outputs"):
                    print(f"\n🔍 检查期望的结构化输出:")
                    for key in config["expected_outputs"]:
                        found = key in result.structured_outputs
                        status = "✅" if found else "❌"
                        print(f"  {status} {key}: {'找到' if found else '未找到'}")
                
                # 检查链接触发
                if result.pending_confirmation:
                    print(f"\n🔗 找到可下钻的链接触发:")
                    print(f"   - 提示: {result.pending_confirmation.get('message')}")
                    print(f"   - 触发技能: {result.pending_confirmation.get('trigger_skill_id')}")
                
            else:
                print(f"\n❌ 技能执行失败!")
                print(f"   错误: {result.error_message}")
                if result.error:
                    print(f"   详细:\n{result.error}")
                result_data["error"] = result.error_message
                
        except Exception as e:
            print(f"\n💥 测试过程出错: {str(e)}")
            result_data["error"] = str(e)
            import traceback
            traceback.print_exc()
        
        return result_data
    
    async def test_all_skills(self):
        """测试所有技能"""
        self.print_separator("开始完整技能测试")
        
        print(f"\n📋 测试准备:")
        print(f"   测试线路: {self.test_route_name}")
        print(f"   测试机构: {self.test_institution_name}")
        print(f"   测试技能数: {len(self.skill_test_configs)}")
        
        # 先测试加载
        load_ok = await self.test_skill_loading()
        
        # 逐个测试技能
        for i, config in enumerate(self.skill_test_configs):
            result = await self.test_single_skill(config)
            self.results.append(result)
        
        # 生成测试报告
        self.generate_test_report()
    
    def generate_test_report(self):
        """生成测试报告"""
        self.print_separator("测试总结报告")
        
        total = len(self.results)
        successful = sum(1 for r in self.results if r["success"])
        
        print(f"\n📊 整体测试结果: {successful}/{total} 成功")
        
        print(f"\n📋 详细结果:")
        for i, result in enumerate(self.results, 1):
            status = "✅" if result["success"] else "❌"
            print(f"\n{i}. {status} {result['name']}")
            print(f"   执行时间: {result['execution_time']:.2f} 秒")
            print(f"   输出文件: {len(result['output_files'])} 个")
            if not result["success"]:
                print(f"   错误: {result['error']}")
        
        # 保存为JSON
        report_path = Path(__file__).parent / "skill_test_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump({
                "summary": {
                    "total": total,
                    "successful": successful,
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                },
                "results": self.results
            }, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 完整测试报告已保存至: {report_path}")
        
        # 检查输出文件格式
        print(f"\n🎯 输出格式验证:")
        all_formats = set()
        for result in self.results:
            for f in result["output_files"]:
                ext = os.path.splitext(f)[1].lower()
                if ext:
                    all_formats.add(ext)
        
        expected_formats = {".pdf", ".pptx", ".docx", ".png"}
        for fmt in sorted(expected_formats):
            found = fmt in all_formats
            status = "✅" if found else "❌"
            print(f"  {status} {fmt}: {'支持' if found else '缺失'}")
        
        print(f"\n支持的输出格式: {sorted(all_formats)}")


async def main():
    """主函数"""
    print("\n" + "="*80)
    print("           智能体技能完整工作流测试工具")
    print("="*80)
    
    tester = SkillTester()
    await tester.test_all_skills()


if __name__ == "__main__":
    asyncio.run(main())
