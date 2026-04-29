from common.core.db import get_session
from sqlalchemy import text
import json

db = next(get_session())
result = db.execute(text('SELECT cr.data FROM chat_record cr JOIN chat c ON cr.chat_id = c.id WHERE c.chat_type = "analysis" AND cr.data IS NOT NULL ORDER BY cr.create_time DESC LIMIT 1'))
row = result.first()

if row:
    data = json.loads(row[0])
    print('Keys in data:', list(data.keys()))
    print()
    print('Has charts:', 'charts' in data)
    if 'charts' in data:
        print('Chart keys:', list(data['charts'].keys()))
        for key, chart in data['charts'].items():
            print(f'\nChart {key}:')
            print(f'  Type: {type(chart)}')
            print(f'  Value: {chart[:200] if isinstance(chart, str) else chart}')
