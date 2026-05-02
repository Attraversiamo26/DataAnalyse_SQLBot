from sqlalchemy import create_engine, text
from common.core.config import settings

# 创建数据库引擎
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

# 执行查询
with engine.connect() as conn:
    result = conn.execute(text('SELECT * FROM chat_record WHERE id = 142'))
    rows = result.fetchall()
    
    print('Column names:', result.keys())
    for row in rows:
        print(dict(zip(result.keys(), row)))
