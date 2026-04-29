from common.core.db import get_session
from sqlalchemy import text

db = next(get_session())

result = db.execute(text('''
SELECT c.id as chat_id, c.brief, cr.id as record_id, cr.question, cr.data, cr.analysis
FROM chat c
LEFT JOIN chat_record cr ON c.id = cr.chat_id
WHERE c.chat_type = "analysis"
ORDER BY c.create_time DESC
LIMIT 5
'''))

print('最新的分析会话记录:')
print('-' * 80)
for row in result:
    chat_id, brief, record_id, question, data, analysis = row
    brief_short = (brief[:30] + '...') if brief and len(brief) > 30 else brief
    question_short = (question[:30] + '...') if question and len(question) > 30 else question
    print(f'Chat ID: {chat_id}')
    print(f'  Brief: {brief_short}')
    print(f'  Record ID: {record_id}')
    print(f'  Question: {question_short}')
    print(f'  Has data: {bool(data)}')
    print(f'  Has analysis: {bool(analysis)}')
    print()