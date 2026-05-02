from common.core.db import get_session
from sqlalchemy import text

db = next(get_session())

# 检查相同问题但不同类型的会话
result = db.execute(text('''
SELECT c1.brief, c1.chat_type as type1, c2.chat_type as type2, c1.id as id1, c2.id as id2
FROM chat c1
JOIN chat c2 ON c1.brief = c2.brief AND c1.chat_type != c2.chat_type
WHERE c1.id < c2.id
ORDER BY c1.create_time DESC
LIMIT 10
'''))

print('相同问题但不同类型的会话:')
print('-' * 120)
print(f'{"Brief":<50} {"Type 1":<15} {"Type 2":<15} {"ID 1":<8} {"ID 2":<8}')
print('-' * 120)
for row in result:
    brief, type1, type2, id1, id2 = row
    brief_short = (brief[:48] + '...') if brief and len(brief) > 48 else brief
    print(f'{brief_short:<50} {type1:<15} {type2:<15} {id1:<8} {id2:<8}')
