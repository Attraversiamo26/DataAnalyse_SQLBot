from typing import List, Optional, Dict
from apps.ai_model.model_factory import LLMFactory, get_default_config


async def generate_report(
    content: str,
    questions: Optional[List[str]] = None,
    data: Optional[Dict] = None,
) -> str:
    """
    根据模板内容和数据生成报告
    
    Args:
        content: 报告模板内容
        questions: 用户选择的问题列表
        data: 分析数据
    
    Returns:
        生成的报告内容
    """
    prompt = f"""
你是一个专业的报告生成助手。请根据以下模板和数据生成一份专业的分析报告。

报告模板：
{content}

分析问题：
{questions or "无"}

分析数据：
{data or "无"}

请按照模板格式生成完整的报告，保持专业、简洁、清晰的风格。
"""
    
    config = await get_default_config()
    llm = LLMFactory.create_llm(config)
    
    if hasattr(llm, 'generate'):
        result = llm.llm.invoke(prompt)
    else:
        result = llm.llm.invoke(prompt)
    
    if hasattr(result, 'content'):
        return result.content
    elif isinstance(result, str):
        return result
    else:
        return str(result)
