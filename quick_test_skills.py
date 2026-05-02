#!/usr/bin/env python3
"""
快速验证8个技能的基本功能
"""
import asyncio
import os
import sys
import json
from pathlib import Path

# 添加后端路径到 sys.path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from apps.skill_manager.skill_manager import SkillManager
from apps.skill_manager.skill_model import SkillLayer


async def main():
    print("\n" + "="*80)
    print("           8个技能快速验证工具")
    print("="*80)
    
    skill_manager = SkillManager()
    
    # 获取所有技能
    all_skills = skill_manager.get_all_skills()
    print(f"\n✅ 成功加载 {len(all_skills)} 个技能:")
    
    # 技能分类计数
    skill_by_layer = {
        SkillLayer.OVERVIEW: 0,
        SkillLayer.STAGE: 0,
        SkillLayer.INSTITUTION: 0
    }
    
    print("\n📋 技能详情:")
    print("-"*80)
    
    for i, skill in enumerate(all_skills, 1):
        layer_text = {
            SkillLayer.OVERVIEW: "全景分析层",
            SkillLayer.STAGE: "环节分析层",
            SkillLayer.INSTITUTION: "机构下钻层"
        }.get(skill.layer, "未知")
        
        skill_by_layer[skill.layer] += 1
        
        print(f"\n{i}. {skill.name}")
        print(f"   ID: {skill.skill_id}")
        print(f"   层级: {layer_text}")
        print(f"   语言: {skill.language.value}")
        
        # 检查脚本文件
        script_path = Path(skill.skill_dir)
        has_scripts = False
        script_files = []
        
        # 检查 scripts 文件夹
        scripts_dir = script_path / "scripts"
        if scripts_dir.exists():
            for ext in ['*.py', '*.js']:
                script_files.extend([f"scripts/{f.name}" for f in scripts_dir.glob(ext)])
        
        # 检查根目录
        for ext in ['*.py', '*.js']:
            script_files.extend([f.name for f in script_path.glob(ext)])
        
        has_scripts = len(script_files) > 0
        script_status = "✅" if has_scripts else "❌"
        print(f"   脚本文件: {script_status} ({len(script_files)} 个)")
        
        if script_files:
            for f in script_files[:5]:
                print(f"     - {f}")
            if len(script_files) > 5:
                print(f"     ... 还有 {len(script_files)-5} 个")
        
        # 检查输出结果目录
        output_dir = script_path / "输出结果"
        has_output = output_dir.exists()
        output_status = "✅" if has_output else "❌"
        print(f"   输出目录: {output_status}")
        
        if has_output:
            existing_outputs = list(output_dir.glob("*"))
            if existing_outputs:
                print(f"   现有输出: {len(existing_outputs)} 个文件")
                for f in existing_outputs[:3]:
                    print(f"     - {f.name}")
                if len(existing_outputs) > 3:
                    print(f"     ... 还有 {len(existing_outputs)-3} 个")
        
        # 检查 workflow.yaml
        workflow_path = script_path / "workflow.yaml"
        has_workflow = workflow_path.exists()
        workflow_status = "✅" if has_workflow else "❌"
        print(f"   工作流配置: {workflow_status}")
        
        # 检查 SKILL.md
        skill_md = script_path / "SKILL.md"
        has_skill_md = skill_md.exists()
        skill_md_status = "✅" if has_skill_md else "❌"
        print(f"   技能文档: {skill_md_status}")
        
        print(f"   触发模式: {len(skill.trigger_patterns)} 个")
        if skill.trigger_patterns:
            for pattern in skill.trigger_patterns[:2]:
                print(f"     - {pattern[:50]}...")
        
        print(f"   输入参数: {len(skill.input_params)} 个")
        for param in skill.input_params:
            print(f"     - {param.name}: {param.type}")
        
        print(f"   工作流步骤: {len(skill.steps)} 个")
        for step in skill.steps:
            print(f"     - {step.id}: {step.name}")
        
        print(f"   输出格式: {len(skill.output_formats)} 个")
        for fmt in skill.output_formats:
            print(f"     - {fmt.name}")
        
        print(f"   链式输出: {len(skill.outputs)} 个")
        for output in skill.outputs:
            print(f"     - {output.name} ({output.type})")
        
        print(f"   链接触发: {len(skill.chain_triggers)} 个")
        for trigger in skill.chain_triggers:
            print(f"     - 触发: {trigger.skill_id}")
    
    # 统计输出
    print("\n" + "="*80)
    print("📊 技能分布统计:")
    print("-"*80)
    print(f"   全景分析层 (Overview): {skill_by_layer[SkillLayer.OVERVIEW]} 个")
    print(f"   环节分析层 (Stage): {skill_by_layer[SkillLayer.STAGE]} 个")
    print(f"   机构下钻层 (Institution): {skill_by_layer[SkillLayer.INSTITUTION]} 个")
    print(f"   总计: {sum(skill_by_layer.values())} 个")
    
    # 检查是否有8个技能
    has_8_skills = len(all_skills) == 8
    print("\n" + "="*80)
    if has_8_skills:
        print("✅ 验证通过: 找到完整的8个技能!")
    else:
        print(f"❌ 验证失败: 期望8个技能，实际 {len(all_skills)} 个")
    
    # 验证三层结构
    all_layers_ok = (skill_by_layer[SkillLayer.OVERVIEW] >= 1 and
                     skill_by_layer[SkillLayer.STAGE] >= 1 and
                     skill_by_layer[SkillLayer.INSTITUTION] >= 1)
    
    if all_layers_ok:
        print("✅ 验证通过: 三层结构完整!")
    else:
        print("❌ 验证失败: 三层结构不完整")
    
    # 收集所有技能的输出格式
    print("\n" + "="*80)
    print("📁 所有技能支持的输出格式:")
    print("-"*80)
    
    all_output_formats = set()
    for skill in all_skills:
        for fmt in skill.output_formats:
            if '.' in fmt.name:
                ext = fmt.name.split('.')[-1].lower()
                all_output_formats.add(f".{ext}")
    
    # 检查已有的输出文件
    existing_output_files = []
    for skill in all_skills:
        output_dir = Path(skill.skill_dir) / "输出结果"
        if output_dir.exists():
            existing_output_files.extend(list(output_dir.glob("*")))
    
    # 检查已有的输出格式
    existing_formats = set()
    for f in existing_output_files:
        ext = f.suffix.lower()
        if ext:
            existing_formats.add(ext)
    
    # 显示现有格式
    expected_formats = {".pdf", ".pptx", ".docx", ".png"}
    print("\n🎯 输出格式验证:")
    print("-"*80)
    
    for fmt in sorted(expected_formats):
        found = fmt in existing_formats
        status = "✅" if found else "❌"
        print(f"  {status} {fmt}: {'已有示例' if found else '暂无示例'}")
    
    if existing_formats:
        print(f"\n已有的输出格式: {sorted(existing_formats)}")
    
    # 显示示例输出
    if existing_output_files:
        print(f"\n📋 已有的示例输出文件:")
        for f in sorted(existing_output_files, key=lambda x: x.stat().st_mtime, reverse=True)[:10]:
            print(f"  - {f.name}")
    
    print("\n" + "="*80)
    print("✅ 快速验证完成!")
    print("="*80)
    
    # 保存验证结果
    result_data = {
        "total_skills": len(all_skills),
        "skills_by_layer": {
            "overview": skill_by_layer[SkillLayer.OVERVIEW],
            "stage": skill_by_layer[SkillLayer.STAGE],
            "institution": skill_by_layer[SkillLayer.INSTITUTION]
        },
        "has_8_skills": has_8_skills,
        "all_layers_ok": all_layers_ok,
        "existing_output_formats": sorted(existing_formats),
        "skills": [
            {
                "skill_id": skill.skill_id,
                "name": skill.name,
                "layer": skill.layer.value,
                "language": skill.language.value,
                "has_scripts": len(skill.steps) > 0,
                "has_workflow": len(skill.steps) > 0,
                "num_trigger_patterns": len(skill.trigger_patterns),
                "num_input_params": len(skill.input_params),
                "num_steps": len(skill.steps),
                "num_output_formats": len(skill.output_formats),
                "num_outputs": len(skill.outputs),
                "num_chain_triggers": len(skill.chain_triggers)
            }
            for skill in all_skills
        ]
    }
    
    result_path = Path(__file__).parent / "quick_verification_result.json"
    with open(result_path, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 验证结果已保存至: {result_path}")


if __name__ == "__main__":
    asyncio.run(main())
