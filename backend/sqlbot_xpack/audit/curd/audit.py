from sqlalchemy import select, func, String, union_all, literal_column


def build_resource_union_query():
    """Mock resource union query that doesn't require DsPermission or DsRules"""
    
    # Create a simple dummy query that doesn't depend on DsRules or DsPermission
    from sqlalchemy.sql import select, func, String, literal_column
    
    # Use a simple select from dual or just a literal for compatibility
    # We'll return a simple select that will work with any table
    # Let's use a dummy query that returns nothing
    dummy_query = select(
        literal_column("'0'").label("id"),
        literal_column("'dummy'").label("name"),
        literal_column("'dummy'").label("module")
    ).where(literal_column("1=0"))
    
    return dummy_query
