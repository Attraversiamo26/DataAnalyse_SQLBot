"""
Simple mock module for sqlbot_xpack to allow SQLBot to run without the full xpack functionality.
This provides basic replacements for the missing classes and functions.
"""

try:
    # Try to import from pydantic 2.x
    from pydantic import BaseModel
except ImportError:
    # Fallback
    class BaseModel:
        pass

class DsRules(BaseModel):
    """Mock DsRules class"""
    id: int = 1
    permission_list: str = '[]'
    user_list: str = '[]'
    
    @classmethod
    def __getattr__(cls, name):
        """Mock SQLAlchemy query methods"""
        class MockQuery:
            @staticmethod
            def all():
                return []
            
            @staticmethod
            def filter(*args, **kwargs):
                return MockQuery()
            
            @staticmethod
            def first():
                return None
        
        return MockQuery()

class DsPermission(BaseModel):
    """Mock DsPermission class"""
    id: int = 1
    table_id: int = 1
    type: str = ''
    permissions: str = '[]'
    
    @classmethod
    def __getattr__(cls, name):
        """Mock SQLAlchemy query methods"""
        class MockQuery:
            @staticmethod
            def all():
                return []
            
            @staticmethod
            def filter(*args, **kwargs):
                return MockQuery()
            
            @staticmethod
            def first():
                return None
        
        return MockQuery()

class PermissionDTO:
    """Mock PermissionDTO class"""
    pass

def transRecord2DTO(session, record):
    """Mock transRecord2DTO function"""
    return record

class CustomPromptTypeEnum:
    """Mock CustomPromptTypeEnum"""
    pass

def find_custom_prompts(*args, **kwargs):
    """Mock find_custom_prompts function"""
    return []

class SysArgModel:
    """Mock SysArgModel class"""
    pass

# Module structure
class permissions:
    class models:
        ds_rules = type('ds_rules', (), {'DsRules': DsRules})
        ds_permission = type('ds_permission', (), {'DsPermission': DsPermission, 'PermissionDTO': PermissionDTO})
    class api:
        permission = type('permission', (), {'transRecord2DTO': transRecord2DTO})

class custom_prompt:
    class curd:
        custom_prompt = type('custom_prompt', (), {'find_custom_prompts': find_custom_prompts})
    class models:
        custom_prompt_model = type('custom_prompt_model', (), {'CustomPromptTypeEnum': CustomPromptTypeEnum})

class config:
    model = type('model', (), {'SysArgModel': SysArgModel})
