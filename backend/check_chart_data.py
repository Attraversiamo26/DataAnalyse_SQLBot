from common.core.db import get_session
from sqlalchemy import text
import json

db = next(get_session())

# 获取最新的分析会话记录
result = db.execute(text('''
SELECT cr.data, cr.analysis
FROM chat_record cr
JOIN chat c ON cr.chat_id = c.id
WHERE c.chat_type = 'analysis' AND cr.data IS NOT NULL
ORDER BY cr.create_time DESC
LIMIT 1
'''))

row = result.first()
if row:
    data, analysis = row
    try:
        data_obj = json.loads(data)
        print('数据包含的键:', list(data_obj.keys()))
        if 'charts' in data_obj:
            print('图表数量:', len(data_obj['charts']))
            print('图表名称:', list(data_obj['charts'].keys()))
            for chart_name, chart_data in data_obj['charts'].items():
                print(f'{chart_name}: {type(chart_data).__name__}, 长度: {len(str(chart_data)) if chart_data else 0}')
        else:
            print('没有图表数据')
    except Exception as e:
        print('解析数据失败:', e)
        print('数据内容（前500字符）:', data[:500])
