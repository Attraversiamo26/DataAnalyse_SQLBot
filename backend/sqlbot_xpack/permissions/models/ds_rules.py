"""Mock DsRules class"""

# Mock DsRules class that can be used with session.query()
class DsRules:
    id: int = None
    name: str = ''
    permission_list: str = '[]'
    user_list: str = '[]'
    
    # This method allows session.query(DsRules) to work
    @classmethod
    def __table__(cls):
        class MockTable:
            name = 'ds_rules'
        return MockTable()
    
    # This method allows session.query(DsRules) to work
    @classmethod
    def __mapper_args__(cls):
        return {}
    
    # Mock query methods
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
            
            @staticmethod
            def order_by(*args, **kwargs):
                return MockQuery()
        
        return MockQuery()
