"""Mock DsPermission and PermissionDTO class"""

try:
    from sqlmodel import SQLModel, Field
except ImportError:
    class SQLModel:
        pass
    class Field:
        pass

class DsPermission(SQLModel if 'SQLModel' in globals() else object):
    id: int = None
    name: str = ''
    table_id: int = None
    type: str = ''
    permissions: str = '[]'
    
    @classmethod
    def __getattr__(cls, name):
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
    pass
