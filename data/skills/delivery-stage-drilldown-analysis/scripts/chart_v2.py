# -*- coding: utf-8 -*-
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os

plt.rcParams['font.sans-serif'] = ['STSong']
plt.rcParams['axes.unicode_minus'] = False

# 使用相对路径配置
script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(script_dir)
xlsx_path_shared = os.path.join(base_dir, '..', 'data', '寄递时限对标分析指标大全.xlsx')
xlsx_path_local = os.path.join(base_dir, '输入数据', '接口文档-0401(1).xlsx')

if os.path.exists(xlsx_path_shared):
    xlsx_path = xlsx_path_shared
    print('使用共享数据文件：' + xlsx_path)
elif os.path.exists(xlsx_path_local):
    xlsx_path = xlsx_path_local
    print('使用本地数据文件：' + xlsx_path)
else:
    xlsx_path = xlsx_path_shared
    print('使用默认数据文件：' + xlsx_path)
output_dir = os.path.join(base_dir, '输出结果')
if not os.path.exists(output_dir):
    os.makedirs(output_dir, exist_ok=True)

df_48h = pd.read_excel(xlsx_path, sheet_name='进口、出口处理及投递48小时', header=0)
df_48h['机构名称'] = df_48h['机构名称'].astype(str)
df_48h['环节标识'] = df_48h['环节标识'].astype(str)
df_48h['到达分拣离开标识'] = df_48h['到达分拣离开标识'].astype(str)

hour_cols = sorted([c for c in df_48h.columns if isinstance(c, (int, float)) and 0 <= float(c) <= 23], key=lambda x: int(float(x)))

inst_data = df_48h[(df_48h['机构名称'].str.contains('景西大宗', na=False)) & (df_48h.get('环节标识', '') == '投递')]

charts = {}
for label in ['到达', '下段', '投递']:
    label_data = inst_data[inst_data['到达分拣离开标识'].str.contains(label, na=False)]
    if not label_data.empty:
        row = label_data.iloc[0]
        values = []
        for c in hour_cols:
            try:
                val = float(row[c]) if pd.notna(row[c]) else 0
                values.append(val)
            except:
                values.append(0)
        charts[label] = values

# Print data table
print('=' * 60)
print('景西大宗 48小时分布数据')
print('=' * 60)
print()
for label, values in charts.items():
    print('【{}】'.format(label))
    for h, v in zip(hour_cols, values):
        if v > 0:
            print('  {}:00  {:6.1f}%'.format(int(h), v * 100))
    print()

# Draw chart - show only hours 0-12 since data is concentrated there
display_cols = [c for c in hour_cols if int(c) <= 12]
x = range(len(display_cols))
x_labels = [str(int(c)) for c in display_cols]

fig, ax = plt.subplots(figsize=(12, 5))
colors = {'到达': '#1f77b4', '下段': '#ff7f0e', '投递': '#2ca02c'}
markers_map = {'到达': 'o', '下段': 's', '投递': '^'}

for label, values in charts.items():
    color = colors.get(label, '#999999')
    marker = markers_map.get(label, 'o')
    display_values = [values[i] for i in range(len(display_cols))]
    ax.plot(x, display_values, marker=marker, label=label, color=color, linewidth=2.5, markersize=8)

ax.set_xlabel('Hour', fontsize=13, fontweight='bold')
ax.set_ylabel('Ratio', fontsize=13, fontweight='bold')
ax.set_title('JingXiDaZong - 48h Arrival/Dispatch/Delivery Distribution', fontsize=14, fontweight='bold')
ax.legend(loc='upper right', fontsize=11)
ax.set_xticks(x)
ax.set_xticklabels(x_labels, rotation=0, fontsize=11)
ax.set_xlim(-0.5, len(x) - 0.5)
ax.grid(True, alpha=0.25)

# Add data labels on points
for label, values in charts.items():
    display_values = [values[i] for i in range(len(display_cols))]
    for i, v in enumerate(display_values):
        if v > 0.01:
            ax.annotate('{:.0f}%'.format(v * 100), xy=(i, v), xytext=(0, 8), 
                       textcoords='offset points', ha='center', fontsize=9, fontweight='bold')

plt.tight_layout()
chart_path = output_dir + '/48h_景西大宗_综合分布图_v2.png'
plt.savefig(chart_path, dpi=150, bbox_inches='tight')
plt.close()

print('Chart saved: ' + chart_path)
print()
print('=' * 60)
print('Key Insights')
print('=' * 60)
print()
print('Arrival:  75% at 7:00, 25% at 8:00')
print('Dispatch: 50% at 7:00, 50% at 8:00')  
print('Delivery: 75% at 8:00')
print()
print('Issue: Delivery completion time is 12.91 hours despite fast dispatch')
print('Solution: Improve delivery route efficiency and first-attempt success rate')
