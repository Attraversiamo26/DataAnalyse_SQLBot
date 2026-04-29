from common.core.db import get_session
from sqlalchemy import text
import json

db = next(get_session())

# 检查analysis类型的会话及其记录
result = db.execute(text('''
SELECT c.id as chat_id, c.brief, c.chat_type, cr.id as record_id, cr.question, cr.data, cr.analysis, cr.finish
FROM chat c
LEFT JOIN chat_record cr ON c.id = cr.chat_id
WHERE c.chat_type = 'analysis'
ORDER BY c.create_time DESC
LIMIT 10
'''))

print('数据分析会话记录:')
print('-' * 100)
print(f'{"Chat ID":<10} {"Brief":<40} {"Type":<10} {"Record ID":<12} {"Has Q":<5} {"Has Data":<10} {"Has Analysis":<15} {"Finish":<8}')
print('-' * 100)
for row in result:
    chat_id, brief, chat_type, record_id, question, data, analysis, finish = row
    brief_short = (brief[:38] + '...') if brief and len(brief) > 38 else brief
    has_q = '✓' if question else '✗'
    has_data = '✓' if data else '✗'
    has_analysis = '✓' if analysis else '✗'
    print(f'{chat_id:<10} {brief_short:<40} {chat_type:<10} {record_id:<12} {has_q:<5} {has_data:<10} {has_analysis:<15} {str(finish):<8}')

print()
print('会话管理页面查询的是所有chat_type != "analysis"的会话')