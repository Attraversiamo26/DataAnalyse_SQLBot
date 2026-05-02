#!/usr/bin/env python3
"""
重新生成所有8个技能的输出文件
不使用历史示例输出结果，而是真正执行技能生成新文件
"""

import asyncio
import os
import sys
import shutil
from datetime import datetime
from pathlib import Path

# 添加后端路径到 sys.path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from apps.skill_manager.skill_manager import SkillManager


def clear_old_outputs(skill_dir: Path):
    """清理旧的输出文件"""
    output_dir = skill_dir / "输出结果"
    if output_dir.exists():
        print(f"  清理旧输出: {output_dir}")
        shutil.rmtree(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    # 也清理scripts目录的旧输出
    scripts_dir = skill_dir / "scripts"
    if scripts_dir.exists():
        for file in scripts_dir.glob("*.docx"):
            file.unlink()
        for file in scripts_dir.glob("*.pdf"):
            file.unlink()
        for file in scripts_dir.glob("*.png"):
            file.unlink()
        for file in scripts_dir.glob("*.pptx"):
            file.unlink()


async def regenerate_all_skills():
    """重新生成所有技能的输出"""
    print("="*80)
    print("重新生成所有技能输出文件")
    print("="*80)
    print()
    
    skill_manager = SkillManager()
    all_skills = skill_manager.get_all_skills()
    
    print(f"找到 {len(all_skills)} 个技能")
    print()
    
    # 技能执行顺序：先全景，再环节，最后机构
    skills_order = [
        "line-five-stage-time-benchmark-analysis",  # 全景
        "export-link-drilldown-analysis",           # 环节
        "import-link-drilldown-analysis",           # 环节
        "delivery-stage-drilldown-analysis",        # 环节
        "transit-link-drilldown-analysis",          # 环节
        "pickup-stage-drilldown-analysis",          # 环节
        "pickup-institution-drilldown-analysis",    # 机构
        "export-institution-drilldown-analysis"     # 机构
    ]
    
    results = {}
    
    for skill_id in skills_order:
        print("="*80)
        print(f"执行技能: {skill_id}")
        print("="*80)
        
        skill = skill_manager.get_skill(skill_id)
        if not skill:
            print(f"❌ 找不到技能: {skill_id}")
            continue
        
        skill_dir = Path(skill.skill_dir)
        
        # 清理旧输出
        print()
        print("步骤1: 清理旧输出...")
        clear_old_outputs(skill_dir)
        
        # 确定执行参数
        params = {}
        if skill_id == "line-five-stage-time-benchmark-analysis":
            params = {"route_name": "滨州市 - 大同市"}
        elif skill_id in ["export-link-drilldown-analysis", 
                          "import-link-drilldown-analysis",
                          "delivery-stage-drilldown-analysis",
                          "transit-link-drilldown-analysis",
                          "pickup-stage-drilldown-analysis"]:
            params = {"route_name": "滨州市到大同市", "top_n": 3}
        elif skill_id == "pickup-institution-drilldown-analysis":
            params = {"institution_name": "博兴二部", "route_name": "滨州市到大同市"}
        elif skill_id == "export-institution-drilldown-analysis":
            params = {"institution_name": "济南齐河", "route_name": "滨州市到大同市"}
        
        print(f"步骤2: 执行参数: {params}")
        print()
        
        # 执行技能
        try:
            print(f"步骤3: 执行技能...")
            result = await skill_manager.execute_skill_steps(
                skill_id=skill_id,
                params=params,
                timeout=300
            )
            
            print()
            
            if result.success:
                print(f"✅ 执行成功！")
                print(f"   执行时间: {result.execution_time:.2f} 秒")
                print(f"   输出文件: {len(result.output_files)} 个")
                for file in result.output_files:
                    print(f"     - {Path(file).name}")
                
                results[skill_id] = {
                    "success": True,
                    "output_files": result.output_files,
                    "execution_time": result.execution_time
                }
            else:
                print(f"❌ 执行失败！")
                print(f"   错误: {result.error_message}")
                if result.error:
                    print(f"   详细:\n{result.error}")
                
                results[skill_id] = {
                    "success": False,
                    "error": result.error_message
                }
                
        except Exception as e:
            print(f"❌ 执行出错: {e}")
            import traceback
            traceback.print_exc()
            
            results[skill_id] = {
                "success": False,
                "error": str(e)
            }
        
        print()
    
    # 生成总结报告
    print("="*80)
    print("执行总结")
    print("="*80)
    print()
    
    success_count = sum(1 for r in results.values() if r["success"])
    total_count = len(results)
    
    print(f"总计: {success_count}/{total_count} 成功")
    print()
    
    for skill_id, result in results.items():
        status = "✅" if result["success"] else "❌"
        print(f"{status} {skill_id}")
    
    print()
    print("="*80)
    print("详细结果")
    print("="*80)
    
    for skill_id, result in results.items():
        print()
        print(f"{skill_id}:")
        if result["success"]:
            print(f"  状态: 成功")
            print(f"  执行时间: {result['execution_time']:.2f} 秒")
            print(f"  输出文件:")
            for file in result["output_files"]:
                print(f"    - {Path(file).name}")
        else:
            print(f"  状态: 失败")
            print(f"  错误: {result['error']}")
    
    return results


if __name__ == "__main__":
    results = asyncio.run(regenerate_all_skills())
    
    # 保存结果
    import json
    with open("技能重新生成结果.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print()
    print("结果已保存到: 技能重新生成结果.json")
