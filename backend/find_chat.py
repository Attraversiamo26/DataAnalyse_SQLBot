from common.core.db import get_session
from sqlalchemy import text
import json

db = next(get_session())

# 找到包含 '分析Sheet1_af6e554c6f' 的会话
result = db.execute(text('''
SELECT c.id, c.brief, cr.id as record_id, cr.question, cr.data, cr.analysis
FROM chat c
LEFT JOIN chat_record cr ON c.id = cr.chat_id
WHERE c.brief LIKE '%Sheet1_af6e554c6f%' OR cr.question LIKE '%Sheet1_af6e554c6f%'
'''))

print('找到的会话记录:')
for row in result:
    chat_id, brief, record_id, question, data, analysis = row
    print(f'Chat ID: {chat_id}')
    print(f'  Brief: {brief}')
    print(f'  Record ID: {record_id}')
    print(f'  Question: {question}')
    print(f'  Has data: {bool(data)}')
    print(f'  Has analysis: {bool(analysis)}')
    if analysis:
        try:
            analysis_json = json.loads(analysis)
            print(f'  Analysis content length: {len(analysis_json.get("content", ""))}')
        except:
            print(f'  Analysis is not valid JSON')
    print()