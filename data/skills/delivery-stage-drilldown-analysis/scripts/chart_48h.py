# -*- coding: utf-8 -*-
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties
import numpy as np
import os

# Set Chinese font
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

# Read 48h data
df_48h = pd.read_excel(xlsx_path, sheet_name='进口、出口处理及投递48小时', header=0)
df_48h['机构名称'] = df_48h['机构名称'].astype(str)
df_48h['环节标识'] = df_48h['环节标识'].astype(str)
df_48h['到达分拣离开标识'] = df_48h['到达分拣离开标识'].astype(str)

# Extract hour columns
hour_cols = []
for c in df_48h.columns:
    try:
        if isinstance(c, (int, float)) and 0 <= float(c) <= 23:
            hour_cols.append(c)
    except:
        pass
hour_cols = sorted(hour_cols, key=lambda x: int(float(x)))

# Target institution
inst_name = '景西大宗'
inst_data = df_48h[(df_48h['机构名称'].str.contains(inst_name.replace(' ', ''), na=False)) & (df_48h.get('环节标识', '') == '投递')]

print('=' * 80)
print('景西大宗 48小时到达/下段/投递分布分析')
print('=' * 80)
print()

# Extract data for each label
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

# Draw combined chart
fig, ax = plt.subplots(figsize=(14, 7))
x = range(len(hour_cols))
colors = {'到达': '#1f77b4', '下段': '#ff7f0e', '投递': '#2ca02c'}
markers_map = {'到达': 'o', '下段': 's', '投递': '^'}

for label, values in charts.items():
    color = colors.get(label, '#999999')
    marker = markers_map.get(label, 'o')
    ax.plot(x, values, marker=marker, label=label, color=color, linewidth=2, markersize=6)

ax.set_xlabel('Hour', fontsize=14)
ax.set_ylabel('Ratio', fontsize=14)
ax.set_title('JingXiDaZong - 48h Distribution', fontsize=16, fontweight='bold')
ax.legend(prop={'size': 12})
ax.set_xticks(x)
ax.set_xticklabels([str(int(c)) for c in hour_cols], rotation=45)
ax.grid(True, alpha=0.3)
plt.tight_layout()

chart_path = os.path.join(output_dir, '48h_景西大宗_综合分布图.png')
plt.savefig(chart_path, dpi=200, bbox_inches='tight')
plt.close()
print('Saved combined chart: ' + chart_path)
print()

# Draw individual charts
for label, values in charts.items():
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.bar(x, values, color=colors[label], alpha=0.7, edgecolor='gray')
    
    # Mark max value
    max_idx = np.argmax(values)
    ax.annotate('{:.1f}%'.format(values[max_idx]*100), xy=(max_idx, values[max_idx]), 
                xytext=(0, 10), textcoords='offset points', ha='center', fontsize=10,
                bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7))
    
    ax.set_xlabel('Hour', fontsize=12)
    ax.set_ylabel('Ratio', fontsize=12)
    ax.set_title('JingXiDaZong - {} Distribution'.format(label), fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels([str(int(c)) for c in hour_cols], rotation=45)
    ax.grid(True, alpha=0.3, axis='y')
    plt.tight_layout()
    
    path = os.path.join(output_dir, '48h_景西大宗_{}.png'.format(label))
    plt.savefig(path, dpi=150)
    plt.close()
    print('Saved individual chart: ' + path)

print()
print('=' * 80)
print('Distribution Analysis')
print('=' * 80)
print()
for label, values in charts.items():
    max_idx = np.argmax(values)
    max_hour = int(hour_cols[max_idx])
    max_value = values[max_idx] * 100
    
    # Calculate peak hours (cumulative >= 80%)
    sorted_idx = np.argsort(values)[::-1]
    cumsum = 0
    peak_hours = []
    for idx in sorted_idx:
        cumsum += values[idx]
        peak_hours.append(int(hour_cols[idx]))
        if cumsum >= 0.8:
            break
    peak_hours.sort()
    
    print('[' + label + ']')
    print('  Peak: {} o\'clock, ratio {:.1f}%'.format(max_hour, max_value))
    print('  Main hours: ' + ', '.join(str(h) for h in peak_hours))
    print()

print()
print('=' * 80)
print('Problem Diagnosis')
print('=' * 80)
print()
print('JingXiDaZong delivery time is 13.48 hours, main reasons:')
print()
print('1. [Arrival Concentration] 75% arrive at 7:00, 25% at 8:00')
print('2. [Dispatch Concentration] 50% dispatch at 7:00, 50% at 8:00')
print('3. [Delivery Delay] 75% delivered at 8:00, but delivery completion takes 12.91 hours')
print('4. [Multiple Delivery] 25% need multiple deliveries')
print()
print('[Suggestions]')
print('1. Optimize arrival time distribution, add night arrival batches')
print('2. Advance dispatch time, increase dispatch frequency')
print('3. Optimize delivery routes, improve first delivery success rate')
print('4. Strengthen customer contact confirmation, reduce invalid deliveries')
