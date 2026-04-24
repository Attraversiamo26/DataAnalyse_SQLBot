from sqlbot_xpack.core import sqlbot_decrypt as xpack_sqlbot_decrypt, sqlbot_encrypt as xpack_sqlbot_encrypt

async def sqlbot_decrypt(text: str) -> str:
    try:
        # 检查文本长度是否为 256 字节
        if len(text) != 256:
            # 如果不是 256 字节，直接返回原始文本
            return text
        return await xpack_sqlbot_decrypt(text)
    except Exception:
        # 如果解密失败，返回原始文本
        return text

async def sqlbot_encrypt(text: str) -> str:
    return await xpack_sqlbot_encrypt(text)