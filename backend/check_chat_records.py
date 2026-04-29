from common.core.db import get_session
from sqlalchemy import text

db = next(get_session())

# 检查chat_id=135的所有记录
result = db.execute(text('''
SELECT cr.id, cr.question, cr.data, cr.analysis, cr.finish, cr.analysis_record_id
FROM chat_record cr
WHERE cr.chat_id = 135
ORDER BY cr.id
'''))

print('Chat ID 135 的所有记录:')
print('-' * 80)
for row in result:
    record_id, question, data, analysis, finish, analysis_record_id = row
    print(f'Record ID: {record_id}')
    print(f'  Question: {question}')
    print(f'  Has data: {bool(data)}')
    print(f'  Has analysis: {bool(analysis)}')
    print(f'  Finish: {finish}')
    print(f'  Analysis record ID: {analysis_record_id}')
    print()