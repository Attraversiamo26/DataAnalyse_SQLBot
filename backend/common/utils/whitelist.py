# app/utils/whitelist.py
import re
from typing import List, Pattern
from common.core.config import settings
from common.utils.utils import SQLBotLogUtil
wlist = [
    "/",
    "/docs",
    "/login/*",
    "*.ico",
    "*.html",
    "*.js",
    "*.css",
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.svg",
    "*.woff",
    "*.woff2",
    "*.ttf",
    "*.eot",
    "*.otf",
    "*.css.map",
    "/mcp*",
    "/system/license*",
    "/system/config/key",
    "/images/*",
    "/sse",
    "/system/appearance/ui",
    "/system/appearance/picture/*",
    "/system/assistant/*",
    "/system/authentication/*",
    "/system/platform/*",
    "/system/parameter/*",
    "/system/aimodel*",
    "/system/embedded*",
    "/system/workspace*",
    "/system/setting*",
    "/system/user*",
    "/system/audit*",
    "/user*",
    "/chat*",
    "/dashboard*",
    "/dsTable*",
    "/datasource*",
    "/recommended_problem*",
    "/api/v1/user/info",
    "/api/v1/*",
    "/api/v1/system/*",
    "/api/v1/user/*",
    "/api/v1/chat/*",
    "/api/v1/dashboard/*",
    "/api/v1/datasource/*"
]

class WhitelistChecker:
    def __init__(self, paths: List[str] = None):
        self.whitelist = paths or wlist
        self._compiled_patterns: List[Pattern] = []
        self._compile_patterns()
    
    def _compile_patterns(self) -> None:
        for pattern in self.whitelist:
            if "*" in pattern:
                regex_pattern = (
                    pattern.replace(".", r"\.")
                    .replace("*", ".*")
                )
                if not pattern.startswith("/"):
                    regex_pattern = f"^{regex_pattern}$"
                else:
                    regex_pattern = f"^{regex_pattern}$"
                try:
                    self._compiled_patterns.append(re.compile(regex_pattern))
                except re.error:
                    SQLBotLogUtil.error(f"Invalid regex pattern: {regex_pattern}")
    
    def is_whitelisted(self, path: str) -> bool:
        # 首先检查原始路径
        original_path = path
        
        # 直接检查路径是否匹配白名单模式
        for pattern in self.whitelist:
            if pattern == path:
                return True
            if '*' in pattern:
                # 简单的通配符匹配
                if pattern.startswith('*'):
                    if path.endswith(pattern[1:]):
                        return True
                elif pattern.endswith('*'):
                    if path.startswith(pattern[:-1]):
                        return True
                elif pattern.startswith('/') and pattern.endswith('*'):
                    if path.startswith(pattern[:-1]):
                        return True
        
        # 检查编译后的正则模式
        check_path_stripped = path.rstrip('/')
        if any(
            pattern.match(check_path_stripped) is not None 
            for pattern in self._compiled_patterns
        ):
            return True
        
        # 特殊处理：对于/api/v1路径、/api/v1/user/info路径和/api/v1/system/appearance/ui路径，直接返回True
        if path == '/api/v1' or path == '/api/v1/user/info' or path == '/api/v1/system/appearance/ui':
            return True
        
        return False

    def add_path(self, path: str) -> None:
       
        if path not in self.whitelist:
            self.whitelist.append(path)
            if "*" in path:
                self._compile_patterns()

whiteUtils = WhitelistChecker()
