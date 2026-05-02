
import requests
import json

def test_api():
    # 测试后端API
    url = "http://localhost:8002/api/chat/58"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        data = response.json()
        print("=" * 80)
        print("API响应测试")
        print("=" * 80)
        print(f"状态码: {response.status_code}")
        print(f"响应长度: {len(response.content)} 字节")
        print()
        
        # 检查Chat信息
        print("Chat信息:")
        print(f"  ID: {data.get('id')}")
        print(f"  创建时间: {data.get('create_time')}")
        print(f"  简短描述: {data.get('brief')}")
        print(f"  记录数量: {len(data.get('records', []))}")
        print()
        
        # 查找记录ID为141的记录
        records = data.get('records', [])
        record_141 = None
        for record in records:
            if record.get('id') == 141:
                record_141 = record
                break
        
        if record_141:
            print("=" * 80)
            print("记录ID: 141 的详细信息")
            print("=" * 80)
            print(f"问题: {record_141.get('question')}")
            print(f"data字段类型: {type(record_141.get('data'))}")
            print(f"data字段值: {record_141.get('data')}")
            print()
            
            # 检查data字段结构
            data_value = record_141.get('data')
            if data_value:
                print("data字段结构:")
                print(f"  类型: {type(data_value)}")
                if isinstance(data_value, dict):
                    print(f"  包含键: {list(data_value.keys())}")
                    print(f"  fields: {data_value.get('fields')}")
                    print(f"  data: {data_value.get('data')}")
                elif isinstance(data_value, str):
                    print(f"  字符串内容: {data_value[:200]}...")
            print()
            
            # 检查其他字段
            print("其他字段:")
            print(f"  sql_answer: {'有数据' if record_141.get('sql_answer') else '空'}")
            print(f"  chart_answer: {'有数据' if record_141.get('chart_answer') else '空'}")
            print(f"  chart: {'有数据' if record_141.get('chart') else '空'}")
            print(f"  analysis_record_id: {record_141.get('analysis_record_id')}")
        else:
            print("未找到记录ID为141的记录")
            print(f"所有记录ID: {[r.get('id') for r in records]}")
            
        print()
        print("=" * 80)
        print("测试完成")
        print("=" * 80)
        
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
    except json.JSONDecodeError as e:
        print(f"JSON解析失败: {e}")

if __name__ == "__main__":
    test_api()
