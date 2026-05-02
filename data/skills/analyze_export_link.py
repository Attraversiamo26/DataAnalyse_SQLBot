import pandas as pd
import os

# 数据文件路径
data_file = r'c:\Users\TJY\Desktop\对标 skill\.trae\skills\data\寄递时限对标分析指标大全.xlsx'

# 读取出口机构表
print("正在读取出口机构表...")
df = pd.read_excel(data_file, sheet_name='出口机构表')

# 显示列名，了解数据结构
print("\n数据表列名：")
print(df.columns.tolist())
print(f"\n数据行数：{len(df)}")
print("\n前 5 行数据预览：")
print(df.head())

# 查找包含"线路"的列
print("\n包含'线路'的列：")
route_columns = [col for col in df.columns if '线路' in col]
print(route_columns)

# 查找包含"滨州"或"大同"的数据
print("\n查找包含'滨州'或'大同'的数据：")
binzhou_datong = df[df.apply(lambda row: row.astype(str).str.contains('滨州|大同', na=False).any(), axis=1)]
print(f"找到 {len(binzhou_datong)} 条相关记录")
print(binzhou_datong)
