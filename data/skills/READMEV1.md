# DeerFlow Custom Skills 分析文档

> 本文档详细介绍了 `custom_skills` 目录下所有技能的功能、数据结构、执行方式和编排工作流设计。**每个技能都可以独立执行，也可以自由组合多个技能并行或顺序执行。**

---

## 目录

- [一、整体架构](#一整体架构)
- [二、技能概览与选择指南](#二技能概览与选择指南)
- [三、数据源说明](#三数据源说明)
- [四、技能详细说明与工作流定义](#四技能详细说明与工作流定义)
- [五、技能调用方式](#五技能调用方式)
- [六、技能依赖管理](#六技能依赖管理)
- [七、扩展开发指南](#七扩展开发指南)

---

## 一、整体架构

### 1.1 目录结构

```
custom_skills/
├── data/                                        # 共享数据源目录
│   └── 寄递时限对标分析指标大全.xlsx            # 主数据文件
│
├── package.json                                 # 根目录共享依赖
├── package-lock.json
├── analyze-route.js                             # 共享路由分析脚本
├── analyze_export_link.py                       # 共享出口链路分析脚本
├── check_routes.js                              # 路由检查脚本
│
├── line-five-stage-time-benchmark-analysis/     # 技能1：五环节综合分析
├── export-link-drilldown-analysis/              # 技能2：出口环节分析
├── import-link-drilldown-analysis/              # 技能3：进口环节分析
├── delivery-stage-drilldown-analysis/           # 技能4：投递环节分析
├── transit-link-drilldown-analysis/             # 技能5：中转环节分析
├── pickup-stage-drilldown-analysis/             # 技能6：收寄环节分析
├── pickup-institution-drilldown-analysis/       # 技能7：收寄机构下钻
└── export-institution-drilldown-analysis/       # 技能8：出口机构下钻
```

### 1.2 技能分层架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           第一层：全景分析层                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │         line-five-stage-time-benchmark-analysis                       │  │
│  │              （线路五环节时限对标分析）                                  │  │
│  │                    生成 PPT + PDF 综合报告                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           第二层：环节分析层                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│  │ export-link-    │ │ import-link-    │ │ delivery-stage- │ │ transit-   │ │
│  │ drilldown       │ │ drilldown       │ │ drilldown       │ │ link-      │ │
│  │ -analysis       │ │ -analysis       │ │ -analysis       │ │ drilldown  │ │
│  │ (出口环节)       │ │ (进口环节)       │ │ (投递环节)       │ │ (中转环节) │ │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └─────┬──────┘ │
│           │                   │                   │                │        │
│           └───────────────────┴───────────────────┴────────────────┘        │
│                                      │                                       │
│                              找出问题机构                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           第三层：机构下钻层                                  │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐            │
│  │ pickup-institution-         │ │ export-institution-         │            │
│  │ drilldown-analysis          │ │ drilldown-analysis          │            │
│  │ (收寄机构48h分布)            │ │ (出口机构48h分布)            │            │
│  └─────────────────────────────┘ └─────────────────────────────┘            │
│                                                                              │
│  ┌─────────────────────────────┐                                             │
│  │ pickup-stage-               │                                             │
│  │ drilldown-analysis          │  ← 可联动调用上述机构下钻技能                 │
│  │ (收寄环节慢机构列表)          │                                             │
│  └─────────────────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 二、技能概览与选择指南

### 2.1 技能清单

| 技能ID | 技能名称 | 层级 | 输入 | 输出 | 适用场景 |
|--------|---------|------|------|------|----------|
| `line-five-stage` | 线路五环节时限对标分析 | 全景 | 线路名 | PPT, PDF | 需要整体了解线路表现 |
| `export-link` | 出口环节下钻分析 | 环节 | 线路名, TopN | 控制台 | 怀疑出口环节有问题 |
| `import-link` | 进口环节下钻分析 | 环节 | 线路名 | DOCX, PDF, PNG | 怀疑进口环节有问题 |
| `delivery-stage` | 投递环节下钻分析 | 环节 | 线路名 | DOCX, PDF, PNG | 怀疑投递环节有问题 |
| `transit-link` | 中转环节下钻分析 | 环节 | 线路名 | DOCX, PDF | 怀疑中转环节有问题 |
| `pickup-stage` | 收寄环节下钻分析 | 环节 | 线路名, TopN | 控制台 | 怀疑收寄环节有问题 |
| `pickup-institution` | 收寄机构下钻分析 | 机构 | 机构名, 线路名 | PDF | 已知某个收寄机构慢 |
| `export-institution` | 出口机构下钻分析 | 机构 | 机构名, 线路名 | PDF | 已知某个出口机构慢 |

### 2.2 技能选择决策树

```
你的分析需求是什么？
│
├─ 📊 想要整体了解线路表现？
│   └─ 选择: line-five-stage (线路五环节时限对标分析)
│       → 输出: PPT报告 + PDF摘要
│       → 会告诉你哪个环节差距最大
│
├─ 🔍 已经知道问题在哪个环节？
│   │
│   ├─ 出口环节？
│   │   └─ 选择: export-link (出口环节下钻分析)
│   │       → 找出最慢的出口机构
│   │
│   ├─ 进口环节？
│   │   └─ 选择: import-link (进口环节下钻分析)
│   │       → 找出最慢的进口机构 + 48h分布图
│   │
│   ├─ 投递环节？
│   │   └─ 选择: delivery-stage (投递环节下钻分析)
│   │       → 找出最慢的投递机构 + 多次投递分析
│   │
│   ├─ 中转环节？
│   │   └─ 选择: transit-link (中转环节下钻分析)
│   │       → 对比经转路径差异
│   │
│   └─ 收寄环节？
│       └─ 选择: pickup-stage (收寄环节下钻分析)
│           → 找出最慢的收寄机构
│
└─ 🏢 已经知道具体哪个机构慢？
    │
    ├─ 收寄机构？
    │   └─ 选择: pickup-institution (收寄机构下钻分析)
    │       → 分析该机构的48h收寄/离开分布
    │
    └─ 出口机构？
        └─ 选择: export-institution (出口机构下钻分析)
            → 分析该机构的48h到达/离开分布
```

### 2.3 常见使用场景示例

| 场景 | 推荐技能组合 | 执行方式 |
|------|-------------|----------|
| 快速了解线路整体表现 | `line-five-stage` | 单独执行 |
| 对比所有环节找出问题 | `export-link` + `import-link` + `delivery-stage` + `transit-link` | 并行执行 |
| 深入分析出口环节 | `export-link` → `export-institution` | 顺序执行 |
| 深入分析收寄环节 | `pickup-stage` → `pickup-institution` | 顺序执行 |
| 完整分析（从全景到机构） | `line-five-stage` → 环节分析 → 机构分析 | 分阶段执行 |

---

## 三、数据源说明

### 3.1 主数据文件

**文件路径**: `data/寄递时限对标分析指标大全.xlsx`

### 3.2 Excel Sheet 结构

| Sheet 名称 | 用途 | 关键字段 |
|-----------|------|----------|
| 线路表 | 线路全程及五环节时限数据 | 线路名、全程时限、五环节时限、经转轨迹 |
| 收寄机构表 | 各机构收寄时限数据 | 收寄机构名称、收寄时间、次日离开占比 |
| 出口机构表 | 出口机构处理时限 | 出口机构名称、处理时限、分拣时限、待发运时限 |
| 进口机构表 | 进口机构处理时限 | 进口机构名称、处理时限、分拣时限、待发运时限 |
| 投递机构表 | 投递机构时限数据 | 投递机构名称、下段时间、妥投时间、多次投递占比 |
| 进口、出口处理及投递48小时 | 48小时时间分布 | 环节标识、到达分拣离开标识、0-23小时占比 |
| 收寄机构48小时 | 收寄机构48小时分布 | 环节标识（收寄/离开）、0-47小时占比 |

### 3.3 各技能使用的数据Sheet

| 技能 | 使用的Sheet |
|------|------------|
| `line-five-stage` | 线路表 |
| `export-link` | 出口机构表 |
| `import-link` | 线路表 + 进口机构表 + 48小时分布 |
| `delivery-stage` | 线路表 + 投递机构表 + 48小时分布 |
| `transit-link` | 线路表 |
| `pickup-stage` | 收寄机构表 |
| `pickup-institution` | 收寄机构48小时 |
| `export-institution` | 进口、出口处理及投递48小时 |

---

## 四、技能详细说明与工作流定义

### 4.1 线路五环节时限对标分析

**技能ID**: `line-five-stage`

**实现语言**: Node.js

**层级**: 全景分析

#### 功能描述

分析指定线路的全程时限及五个环节（收寄、出口、中转、进口、投递）的时限对标情况，自动更新 PPT 模板生成分析报告。

#### 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 线路名称 | string | 是 | 如 "北京市-上海市"、"北京市到上海市" |

#### 输出文件

| 文件 | 路径 |
|------|------|
| PPT 报告 | `输出结果/线路五环节时限对标分析结果_[线路名称].pptx` |
| PDF 摘要 | `输出结果/线路五环节时限对标分析结果摘要_[线路名称].pdf` |

#### 工作流定义

```yaml
workflow:
  id: line-five-stage
  name: 线路五环节时限对标分析工作流
  description: 分析线路全程及五环节时限，生成PPT报告
  
  trigger:
    type: user_request
    params:
      - name: route_name
        type: string
        required: true
        description: 线路名称，如"滨州市-晋城市"
  
  steps:
    - id: step_1_load_data
      name: 加载数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "线路表"
      outputs:
        - data: route_data
    
    - id: step_2_match_route
      name: 匹配线路
      action: filter_data
      config:
        source: "${step_1_load_data.route_data}"
        condition: "线路名 == route_name OR 线路名 CONTAINS route_name关键词"
      outputs:
        - data: matched_route
    
    - id: step_3_calc_metrics
      name: 计算指标
      action: calculate
      config:
        source: "${step_2_match_route.matched_route}"
        formulas:
          - total_gap: "特快-全程时限 - 竞品-全程时限"
          - pickup_gap: "差值-收寄时限"
          - export_gap: "差值-出口时限"
          - transit_gap: "差值-中转时限"
          - import_gap: "差值-进口时限"
          - delivery_gap: "差值-投递时限"
          - max_gap_stage: "MAX(pickup_gap, export_gap, transit_gap, import_gap, delivery_gap)"
      outputs:
        - data: metrics
    
    - id: step_4_identify_problem
      name: 识别问题环节
      action: analyze
      config:
        source: "${step_3_calc_metrics.metrics}"
        logic: |
          找出差距最大的环节
          分析差距原因
          生成优化建议
      outputs:
        - data: problem_analysis
    
    - id: step_5_generate_ppt
      name: 生成PPT报告
      action: generate_ppt
      config:
        template: "线路五环节时限对标分析模板.pptx"
        data: "${step_3_calc_metrics.metrics}"
        analysis: "${step_4_identify_problem.problem_analysis}"
      outputs:
        - file: "输出结果/线路五环节时限对标分析结果_[线路名称].pptx"
    
    - id: step_6_generate_pdf
      name: 生成PDF摘要
      action: generate_pdf
      config:
        source: "${step_5_generate_ppt.output}"
        format: "summary"
      outputs:
        - file: "输出结果/线路五环节时限对标分析结果摘要_[线路名称].pdf"
  
  outputs:
    - name: ppt_report
      type: file
      path: "${step_5_generate_ppt.output}"
    - name: pdf_summary
      type: file
      path: "${step_6_generate_pdf.output}"
    - name: key_problem_stage
      type: string
      value: "${step_4_identify_problem.problem_analysis.max_gap_stage}"
    - name: metrics
      type: object
      value: "${step_3_calc_metrics.metrics}"
```

#### 分析内容

1. 全程时限对比（特快 vs 竞品）
2. 五环节时限对比
3. 最大差距环节识别
4. 经转轨迹对比

#### 使用场景

- 向管理层汇报线路表现
- 快速定位问题环节
- 生成标准化分析报告

---

### 4.2 出口环节下钻分析

**技能ID**: `export-link`

**实现语言**: Node.js

**层级**: 环节分析

#### 功能描述

分析指定线路出口环节中机构的时限表现，识别哪些出口机构导致整体时限偏慢，找出问题机构。

#### 输入参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| 线路名称 | string | 是 | - | 如 "滨州市到大同市" |
| Top N | number | 否 | 5 | 取前N个最慢机构 |

#### 输出

控制台输出慢机构列表及各项指标。

#### 工作流定义

```yaml
workflow:
  id: export-link
  name: 出口环节下钻分析工作流
  description: 分析出口环节机构表现，找出慢机构
  
  trigger:
    type: user_request | workflow_chain
    params:
      - name: route_name
        type: string
        required: true
        description: 线路名称
      - name: top_n
        type: number
        required: false
        default: 5
        description: 取前N个最慢机构
  
  steps:
    - id: step_1_load_data
      name: 加载出口机构数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "出口机构表"
      outputs:
        - data: export_data
    
    - id: step_2_filter_route
      name: 筛选线路数据
      action: filter_data
      config:
        source: "${step_1_load_data.export_data}"
        condition: "线路名 == route_name"
      outputs:
        - data: route_export_data
    
    - id: step_3_sort_institutions
      name: 排序机构
      action: sort_data
      config:
        source: "${step_2_filter_route.route_export_data}"
        key: "出口-处理时限"
        order: "desc"
      outputs:
        - data: sorted_institutions
    
    - id: step_4_get_top_n
      name: 获取Top N慢机构
      action: limit
      config:
        source: "${step_3_sort_institutions.sorted_institutions}"
        count: "${params.top_n}"
      outputs:
        - data: slow_institutions
    
    - id: step_5_analyze_problems
      name: 分析问题原因
      action: analyze
      config:
        source: "${step_4_get_top_n.slow_institutions}"
        logic: |
          FOR each institution:
            IF 出口-待发运时限 > 阈值:
              problem = "待发运时间过长"
              suggestion = "建议增加发运频次"
            ELIF 出口-分拣时限 > 阈值:
              problem = "分拣效率低"
              suggestion = "建议优化分拣流程"
            ELSE:
              problem = "处理时间过长"
              suggestion = "建议优化处理流程"
      outputs:
        - data: problem_analysis
    
    - id: step_6_output_results
      name: 输出结果
      action: print
      config:
        format: "table"
        data:
          - header: "线路概况"
            content: |
              机构总数: ${step_2_filter_route.route_export_data.count}
              平均出口处理时限: ${step_2_filter_route.route_export_data.avg_time}小时
          - header: "慢机构列表"
            content: "${step_4_get_top_n.slow_institutions}"
          - header: "问题识别"
            content: "${step_5_analyze_problems.problem_analysis}"
          - header: "优化建议"
            content: "${step_5_analyze_problems.problem_analysis.suggestions}"
      outputs:
        - data: console_output
  
  outputs:
    - name: slow_institutions
      type: array
      value: "${step_4_get_top_n.slow_institutions}"
    - name: problem_analysis
      type: object
      value: "${step_5_analyze_problems.problem_analysis}"
    - name: slowest_institution
      type: string
      value: "${step_4_get_top_n.slow_institutions[0].机构名称}"
```

#### 分析维度

- 出口处理时限
- 出口分拣时限
- 出口待发运时限

#### 使用场景

- 定位出口环节瓶颈机构
- 分析出口处理效率

---

### 4.3 进口环节下钻分析

**技能ID**: `import-link`

**实现语言**: Python

**层级**: 环节分析

#### 功能描述

分析指定线路进口环节的时限对标情况，识别进口环节问题，下钻至问题机构，生成包含48小时分布图的完整分析报告。

#### 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 线路名称 | string | 是 | 如 "滨州市-惠州市" |

#### 输出文件

| 文件 | 路径 |
|------|------|
| Word 报告 | `scripts/线路进口环节时限分析报告_[线路名]_[时间戳].docx` |
| PDF 报告 | `scripts/线路进口环节时限分析报告_[线路名]_[时间戳].pdf` |
| 分布图 | `scripts/48h_[机构名]_进口综合分布图.png` |

#### 工作流定义

```yaml
workflow:
  id: import-link
  name: 进口环节下钻分析工作流
  description: 分析进口环节时限，下钻问题机构，生成完整报告
  
  trigger:
    type: user_request | workflow_chain
    params:
      - name: route_name
        type: string
        required: true
        description: 线路名称
  
  steps:
    - id: step_1_load_route_data
      name: 加载线路数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "线路表"
      outputs:
        - data: route_data
    
    - id: step_2_load_import_data
      name: 加载进口机构数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "进口机构表"
      outputs:
        - data: import_data
    
    - id: step_3_load_48h_data
      name: 加载48小时分布数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "进口、出口处理及投递48小时"
      outputs:
        - data: hour48_data
    
    - id: step_4_analyze_route
      name: 分析线路进口时限
      action: analyze
      config:
        route_source: "${step_1_load_route_data.route_data}"
        route_filter: "线路名 == route_name"
        metrics:
          - import_gap: "差值-进口时限"
          - import_time: "特快-进口时限"
          - competitor_import_time: "竞品-进口时限"
      outputs:
        - data: route_analysis
    
    - id: step_5_find_problem_institutions
      name: 找出问题进口机构
      action: filter_and_sort
      config:
        source: "${step_2_load_import_data.import_data}"
        filter: "线路名 == route_name"
        sort_key: "进口-处理时限"
        sort_order: "desc"
        limit: 5
      outputs:
        - data: problem_institutions
    
    - id: step_6_analyze_48h_distribution
      name: 分析48小时分布
      action: analyze_distribution
      config:
        source: "${step_3_load_48h_data.hour48_data}"
        filter: "线路名 == route_name AND 环节标识 == '进口'"
        institutions: "${step_5_find_problem_institutions.problem_institutions}"
        analysis:
          - type: "到达分布"
            key: "到达分拣离开标识 == '到达'"
            hours: "0-23"
          - type: "分拣分布"
            key: "到达分拣离开标识 == '分拣'"
            hours: "0-23"
          - type: "离开分布"
            key: "到达分拣离开标识 == '离开'"
            hours: "0-47"
      outputs:
        - data: distribution_analysis
        - charts: "48h_distribution_charts"
    
    - id: step_7_identify_peaks
      name: 识别波峰时段
      action: find_peaks
      config:
        source: "${step_6_analyze_48h_distribution.distribution_analysis}"
        algorithm: "local_maxima"
        threshold: 0.05
      outputs:
        - data: peak_hours
    
    - id: step_8_generate_charts
      name: 生成分布图
      action: generate_chart
      config:
        type: "bar_chart"
        data: "${step_6_analyze_48h_distribution.distribution_analysis}"
        peaks: "${step_7_identify_peaks.peak_hours}"
        output_dir: "scripts/"
        filename_pattern: "48h_[机构名]_进口综合分布图.png"
      outputs:
        - files: "chart_files"
    
    - id: step_9_generate_report
      name: 生成Word报告
      action: generate_docx
      config:
        template: "report_template.docx"
        data:
          route_name: "${params.route_name}"
          route_analysis: "${step_4_analyze_route.route_analysis}"
          problem_institutions: "${step_5_find_problem_institutions.problem_institutions}"
          distribution_analysis: "${step_6_analyze_48h_distribution.distribution_analysis}"
          peak_hours: "${step_7_identify_peaks.peak_hours}"
          charts: "${step_8_generate_charts.chart_files}"
        output_path: "scripts/线路进口环节时限分析报告_[线路名]_[时间戳].docx"
      outputs:
        - file: "docx_report"
    
    - id: step_10_convert_pdf
      name: 转换PDF
      action: convert_to_pdf
      config:
        source: "${step_9_generate_report.docx_report}"
        output_path: "scripts/线路进口环节时限分析报告_[线路名]_[时间戳].pdf"
      outputs:
        - file: "pdf_report"
  
  outputs:
    - name: docx_report
      type: file
      value: "${step_9_generate_report.docx_report}"
    - name: pdf_report
      type: file
      value: "${step_10_convert_pdf.pdf_report}"
    - name: charts
      type: array
      value: "${step_8_generate_charts.chart_files}"
    - name: problem_institutions
      type: array
      value: "${step_5_find_problem_institutions.problem_institutions}"
```

#### 分析内容

1. 进口时限对标分析
2. 问题进口机构列表 (Top 5)
3. 48小时到达/分拣/离开分布图
4. 波峰时段识别

---

### 4.4 投递环节下钻分析

**技能ID**: `delivery-stage`

**实现语言**: Python

**层级**: 环节分析

#### 功能描述

分析指定线路投递环节的时限表现，下钻至问题投递机构，分析48小时到达、下段、投递分布，生成完整分析报告。

#### 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 线路名称 | string | 是 | 如 "滨州市-惠州市" |

#### 输出文件

| 文件 | 路径 |
|------|------|
| Word 报告 | `scripts/线路投递环节时限分析报告_[线路名]_[时间戳].docx` |
| PDF 报告 | `scripts/线路投递环节时限分析报告_[线路名]_[时间戳].pdf` |
| 分布图 | `scripts/48h_[机构名]_综合分布图.png` |

#### 工作流定义

```yaml
workflow:
  id: delivery-stage
  name: 投递环节下钻分析工作流
  description: 分析投递环节时限，下钻问题机构，生成完整报告
  
  trigger:
    type: user_request | workflow_chain
    params:
      - name: route_name
        type: string
        required: true
        description: 线路名称
  
  steps:
    - id: step_1_load_route_data
      name: 加载线路数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "线路表"
      outputs:
        - data: route_data
    
    - id: step_2_load_delivery_data
      name: 加载投递机构数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "投递机构表"
      outputs:
        - data: delivery_data
    
    - id: step_3_load_48h_data
      name: 加载48小时分布数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "进口、出口处理及投递48小时"
      outputs:
        - data: hour48_data
    
    - id: step_4_analyze_delivery_gap
      name: 分析投递时限差距
      action: analyze
      config:
        route_source: "${step_1_load_route_data.route_data}"
        route_filter: "线路名 == route_name"
        metrics:
          - delivery_gap: "差值-投递时限"
          - delivery_time: "特快-投递时限"
          - competitor_delivery_time: "竞品-投递时限"
      outputs:
        - data: delivery_gap_analysis
    
    - id: step_5_find_slow_institutions
      name: 找出慢投递机构
      action: filter_and_sort
      config:
        source: "${step_2_load_delivery_data.delivery_data}"
        filter: "线路名 == route_name"
        sort_key: "投递时间（小时）"
        sort_order: "desc"
        limit: 5
      outputs:
        - data: slow_institutions
    
    - id: step_6_analyze_multi_delivery
      name: 分析多次投递情况
      action: analyze
      config:
        source: "${step_5_find_slow_institutions.slow_institutions}"
        metrics:
          - multi_delivery_rate: "多次投递占比"
          - multi_delivery_count: "多次投递样本量（件）"
        threshold: 0.1
      outputs:
        - data: multi_delivery_analysis
    
    - id: step_7_analyze_48h_distribution
      name: 分析48小时分布
      action: analyze_distribution
      config:
        source: "${step_3_load_48h_data.hour48_data}"
        filter: "线路名 == route_name AND 环节标识 == '投递'"
        institutions: "${step_5_find_slow_institutions.slow_institutions}"
        analysis:
          - type: "到达分布"
            key: "到达分拣离开标识 == '到达'"
          - type: "下段分布"
            key: "到达分拣离开标识 == '下段'"
          - type: "投递分布"
            key: "到达分拣离开标识 == '投递'"
      outputs:
        - data: distribution_analysis
    
    - id: step_8_generate_charts
      name: 生成分布图
      action: generate_chart
      config:
        type: "combined_bar_chart"
        data: "${step_7_analyze_48h_distribution.distribution_analysis}"
        output_dir: "scripts/"
        filename_pattern: "48h_[机构名]_综合分布图.png"
      outputs:
        - files: "chart_files"
    
    - id: step_9_generate_report
      name: 生成报告
      action: generate_docx
      config:
        template: "report_template.docx"
        data:
          route_name: "${params.route_name}"
          delivery_gap_analysis: "${step_4_analyze_delivery_gap.delivery_gap_analysis}"
          slow_institutions: "${step_5_find_slow_institutions.slow_institutions}"
          multi_delivery_analysis: "${step_6_analyze_multi_delivery.multi_delivery_analysis}"
          distribution_analysis: "${step_7_analyze_48h_distribution.distribution_analysis}"
          charts: "${step_8_generate_charts.chart_files}"
        output_path: "scripts/线路投递环节时限分析报告_[线路名]_[时间戳].docx"
      outputs:
        - file: "docx_report"
    
    - id: step_10_convert_pdf
      name: 转换PDF
      action: convert_to_pdf
      config:
        source: "${step_9_generate_report.docx_report}"
      outputs:
        - file: "pdf_report"
  
  outputs:
    - name: docx_report
      type: file
      value: "${step_9_generate_report.docx_report}"
    - name: pdf_report
      type: file
      value: "${step_10_convert_pdf.pdf_report}"
    - name: charts
      type: array
      value: "${step_8_generate_charts.chart_files}"
    - name: slow_institutions
      type: array
      value: "${step_5_find_slow_institutions.slow_institutions}"
```

#### 分析内容

1. 投递时限对标分析
2. 问题投递机构列表 (Top 5)
3. 多次投递情况分析
4. 48小时到达/下段/投递分布图

---

### 4.5 中转环节下钻分析

**技能ID**: `transit-link`

**实现语言**: Python

**层级**: 环节分析

#### 功能描述

分析指定线路中转环节的时限对标情况，对比邮政与竞品的中转城市数、中转机构数、运输时长等指标。

#### 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 线路名称 | string | 是 | 如 "滨州市-惠州市" |

#### 输出文件

| 文件 | 路径 |
|------|------|
| Word 报告 | `scripts/线路中转环节时限对标分析报告_[时间戳].docx` |
| PDF 报告 | `scripts/线路中转环节时限对标分析报告_[时间戳].pdf` |

#### 工作流定义

```yaml
workflow:
  id: transit-link
  name: 中转环节下钻分析工作流
  description: 分析中转环节时限，对比经转路径差异
  
  trigger:
    type: user_request | workflow_chain
    params:
      - name: route_name
        type: string
        required: true
        description: 线路名称
  
  steps:
    - id: step_1_load_route_data
      name: 加载线路数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "线路表"
      outputs:
        - data: route_data
    
    - id: step_2_filter_route
      name: 筛选线路
      action: filter_data
      config:
        source: "${step_1_load_route_data.route_data}"
        condition: "线路名 == route_name"
      outputs:
        - data: matched_route
    
    - id: step_3_parse_trajectory
      name: 解析经转轨迹
      action: parse
      config:
        source: "${step_2_filter_route.matched_route}"
        fields:
          - ems_trajectory: "主要轨迹-特快"
            split_by: "-"
          - competitor_trajectory: "主要轨迹-竞品"
            split_by: "-"
      outputs:
        - data: trajectory_data
    
    - id: step_4_calc_transit_metrics
      name: 计算中转指标
      action: calculate
      config:
        source: "${step_2_filter_route.matched_route}"
        formulas:
          - transit_gap: "差值-中转时限"
          - ems_transit_time: "特快-中转时限"
          - competitor_transit_time: "竞品-中转时限"
          - ems_transit_cities: "len(trajectory_data.ems_trajectory) - 2"
          - competitor_transit_cities: "len(trajectory_data.competitor_trajectory) - 2"
      outputs:
        - data: transit_metrics
    
    - id: step_5_analyze_path_diff
      name: 分析路径差异
      action: compare
      config:
        ems_path: "${step_3_parse_trajectory.trajectory_data.ems_trajectory}"
        competitor_path: "${step_3_parse_trajectory.trajectory_data.competitor_trajectory}"
        analysis:
          - extra_cities: "邮政比竞品多经过的城市"
          - path_efficiency: "路径效率评分"
      outputs:
        - data: path_analysis
    
    - id: step_6_generate_report
      name: 生成报告
      action: generate_docx
      config:
        template: "transit_report_template.docx"
        data:
          route_name: "${params.route_name}"
          transit_metrics: "${step_4_calc_transit_metrics.transit_metrics}"
          trajectory_data: "${step_3_parse_trajectory.trajectory_data}"
          path_analysis: "${step_5_analyze_path_diff.path_analysis}"
        output_path: "scripts/线路中转环节时限对标分析报告_[时间戳].docx"
      outputs:
        - file: "docx_report"
    
    - id: step_7_convert_pdf
      name: 转换PDF
      action: convert_to_pdf
      config:
        source: "${step_6_generate_report.docx_report}"
      outputs:
        - file: "pdf_report"
  
  outputs:
    - name: docx_report
      type: file
      value: "${step_6_generate_report.docx_report}"
    - name: pdf_report
      type: file
      value: "${step_7_convert_pdf.pdf_report}"
    - name: transit_gap
      type: number
      value: "${step_4_calc_transit_metrics.transit_metrics.transit_gap}"
    - name: path_analysis
      type: object
      value: "${step_5_analyze_path_diff.path_analysis}"
```

#### 分析内容

1. 中转时限对比
2. 经转城市数对比
3. 经转机构数对比
4. 路径效率分析

---

### 4.6 收寄环节下钻分析

**技能ID**: `pickup-stage`

**实现语言**: Node.js

**层级**: 环节分析

#### 功能描述

分析指定线路收寄环节的机构表现，找出收寄时间最长的 N 个机构，支持联动调用机构下钻分析。

#### 输入参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| 线路名称 | string | 是 | - | 如 "北京-上海" |
| Top N | number | 否 | 5 | 取前N个最慢机构 |

#### 输出

控制台输出慢机构列表，支持交互式联动。

#### 工作流定义

```yaml
workflow:
  id: pickup-stage
  name: 收寄环节下钻分析工作流
  description: 分析收寄环节机构表现，支持联动下钻
  
  trigger:
    type: user_request | workflow_chain
    params:
      - name: route_name
        type: string
        required: true
        description: 线路名称
      - name: top_n
        type: number
        required: false
        default: 5
        description: 取前N个最慢机构
  
  steps:
    - id: step_1_load_pickup_data
      name: 加载收寄机构数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "收寄机构表"
      outputs:
        - data: pickup_data
    
    - id: step_2_filter_route
      name: 筛选线路数据
      action: filter_data
      config:
        source: "${step_1_load_pickup_data.pickup_data}"
        condition: "线路名 == route_name"
      outputs:
        - data: route_pickup_data
    
    - id: step_3_sort_institutions
      name: 排序机构
      action: sort_data
      config:
        source: "${step_2_filter_route.route_pickup_data}"
        key: "收寄时间"
        order: "desc"
      outputs:
        - data: sorted_institutions
    
    - id: step_4_get_top_n
      name: 获取Top N慢机构
      action: limit
      config:
        source: "${step_3_sort_institutions.sorted_institutions}"
        count: "${params.top_n}"
      outputs:
        - data: slow_institutions
    
    - id: step_5_analyze_problems
      name: 分析问题原因
      action: analyze
      config:
        source: "${step_4_get_top_n.slow_institutions}"
        logic: |
          FOR each institution:
            IF 次日离开样本量占比 > 0.5:
              problem = "邮件滞留过夜"
            IF 当日最后一个市趟频次离开后收寄邮件占比 > 0.3:
              problem = "收寄时间晚于末班发运"
            CALCULATE gap_with_competitor
      outputs:
        - data: problem_analysis
    
    - id: step_6_output_results
      name: 输出结果
      action: print
      config:
        format: "table"
        data: "${step_4_get_top_n.slow_institutions}"
      outputs:
        - data: console_output
    
    - id: step_7_prompt_drilldown
      name: 提示联动下钻
      action: prompt_user
      config:
        message: "是否需要对收寄时间最长的机构 [${step_4_get_top_n.slow_institutions[0].机构名称}] 开展下钻分析？"
        options:
          - value: "y"
            action: "trigger_drilldown"
          - value: "n"
            action: "end"
      outputs:
        - data: user_choice
  
  outputs:
    - name: slow_institutions
      type: array
      value: "${step_4_get_top_n.slow_institutions}"
    - name: problem_analysis
      type: object
      value: "${step_5_analyze_problems.problem_analysis}"
    - name: slowest_institution
      type: string
      value: "${step_4_get_top_n.slow_institutions[0].机构名称}"
  
  on_user_confirm:
    condition: "${step_7_prompt_drilldown.user_choice == 'y'}"
    trigger:
      - skill: pickup-institution
        params:
          institution_name: "${outputs.slowest_institution}"
          route_name: "${params.route_name}"
```

#### 分析维度

- 收寄时间
- 次日离开占比
- 末班后收寄占比

---

### 4.7 收寄机构下钻分析

**技能ID**: `pickup-institution`

**实现语言**: Node.js

**层级**: 机构分析

#### 功能描述

分析指定收寄机构的48小时收寄和离开时间分布，识别业务量波峰，生成 PDF 分析报告。

#### 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 机构名称 | string | 是 | 如 "博兴二部" |
| 线路名称 | string | 是 | 如 "滨州市大同市" |

#### 输出文件

| 文件 | 路径 |
|------|------|
| PDF 报告 | `输出结果/收寄机构下钻分析结果_[机构名称].pdf` |

#### 工作流定义

```yaml
workflow:
  id: pickup-institution
  name: 收寄机构下钻分析工作流
  description: 分析收寄机构48小时分布，识别波峰
  
  trigger:
    type: user_request | workflow_chain
    params:
      - name: institution_name
        type: string
        required: true
        description: 机构名称
      - name: route_name
        type: string
        required: true
        description: 线路名称
  
  steps:
    - id: step_1_load_48h_data
      name: 加载48小时分布数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "收寄机构48小时"
      outputs:
        - data: hour48_data
    
    - id: step_2_filter_institution
      name: 筛选机构数据
      action: filter_data
      config:
        source: "${step_1_load_48h_data.hour48_data}"
        condition: "机构名称 == institution_name AND 线路名 == route_name"
      outputs:
        - data: institution_data
    
    - id: step_3_split_pickup_leave
      name: 分离收寄和离开数据
      action: split_data
      config:
        source: "${step_2_filter_institution.institution_data}"
        key: "环节标识"
        groups:
          - name: "pickup"
            value: "收寄"
          - name: "leave"
            value: "离开"
      outputs:
        - data: pickup_distribution
        - data: leave_distribution
    
    - id: step_4_find_pickup_peaks
      name: 找出收寄波峰
      action: find_peaks
      config:
        source: "${step_3_split_pickup_leave.pickup_distribution}"
        hours: "0-23"
        algorithm: "local_maxima"
        threshold: 0.03
      outputs:
        - data: pickup_peaks
    
    - id: step_5_find_leave_peaks
      name: 找出离开波峰
      action: find_peaks
      config:
        source: "${step_3_split_pickup_leave.leave_distribution}"
        hours: "0-47"
        algorithm: "local_maxima"
        threshold: 0.03
      outputs:
        - data: leave_peaks
    
    - id: step_6_analyze_gap
      name: 分析收寄离开时间差
      action: analyze
      config:
        pickup_peaks: "${step_4_find_pickup_peaks.pickup_peaks}"
        leave_peaks: "${step_5_find_leave_peaks.leave_peaks}"
        logic: |
          CALCULATE avg_gap = avg(leave_peak_hour - pickup_peak_hour)
          IF avg_gap > 12:
            problem = "邮件在机构内滞留时间过长"
          IF leave_peaks[0].hour > 24:
            problem = "邮件次日才能发运"
      outputs:
        - data: gap_analysis
    
    - id: step_7_generate_pdf
      name: 生成PDF报告
      action: generate_pdf
      config:
        template: "pickup_institution_template.pdf"
        data:
          institution_name: "${params.institution_name}"
          route_name: "${params.route_name}"
          pickup_distribution: "${step_3_split_pickup_leave.pickup_distribution}"
          leave_distribution: "${step_3_split_pickup_leave.leave_distribution}"
          pickup_peaks: "${step_4_find_pickup_peaks.pickup_peaks}"
          leave_peaks: "${step_5_find_leave_peaks.leave_peaks}"
          gap_analysis: "${step_6_analyze_gap.gap_analysis}"
        output_path: "输出结果/收寄机构下钻分析结果_[机构名称].pdf"
      outputs:
        - file: "pdf_report"
  
  outputs:
    - name: pdf_report
      type: file
      value: "${step_7_generate_pdf.pdf_report}"
    - name: pickup_peaks
      type: array
      value: "${step_4_find_pickup_peaks.pickup_peaks}"
    - name: leave_peaks
      type: array
      value: "${step_5_find_leave_peaks.leave_peaks}"
    - name: gap_analysis
      type: object
      value: "${step_6_analyze_gap.gap_analysis}"
```

#### 分析内容

1. 收寄时间分布图 (0-23小时)
2. 离开时间分布图 (0-47小时)
3. 波峰时段识别
4. 收寄-离开时间差分析

---

### 4.8 出口机构下钻分析

**技能ID**: `export-institution`

**实现语言**: Node.js

**层级**: 机构分析

#### 功能描述

分析指定出口机构的48小时到达和离开时间分布，识别到达和离开的波峰时段，生成 PDF 分析报告。

#### 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 机构名称 | string | 是 | 如 "济南齐河" |
| 线路名称 | string | 是 | 如 "滨州市东莞市" |

#### 输出文件

| 文件 | 路径 |
|------|------|
| PDF 报告 | `输出结果/出口机构下钻分析结果_[机构名称].pdf` |

#### 工作流定义

```yaml
workflow:
  id: export-institution
  name: 出口机构下钻分析工作流
  description: 分析出口机构48小时分布，识别处理瓶颈
  
  trigger:
    type: user_request | workflow_chain
    params:
      - name: institution_name
        type: string
        required: true
        description: 机构名称
      - name: route_name
        type: string
        required: true
        description: 线路名称
  
  steps:
    - id: step_1_load_48h_data
      name: 加载48小时分布数据
      action: read_excel
      config:
        file: "../data/寄递时限对标分析指标大全.xlsx"
        sheet: "进口、出口处理及投递48小时"
      outputs:
        - data: hour48_data
    
    - id: step_2_filter_institution
      name: 筛选机构数据
      action: filter_data
      config:
        source: "${step_1_load_48h_data.hour48_data}"
        condition: "机构名称 == institution_name AND 线路名 == route_name AND 环节标识 == '出口'"
      outputs:
        - data: institution_data
    
    - id: step_3_split_arrive_leave
      name: 分离到达和离开数据
      action: split_data
      config:
        source: "${step_2_filter_institution.institution_data}"
        key: "到达分拣离开标识"
        groups:
          - name: "arrive"
            value: "到达"
          - name: "leave"
            value: "离开"
      outputs:
        - data: arrive_distribution
        - data: leave_distribution
    
    - id: step_4_find_arrive_peaks
      name: 找出到达波峰
      action: find_peaks
      config:
        source: "${step_3_split_arrive_leave.arrive_distribution}"
        hours: "0-23"
        algorithm: "local_maxima"
      outputs:
        - data: arrive_peaks
    
    - id: step_5_find_leave_peaks
      name: 找出离开波峰
      action: find_peaks
      config:
        source: "${step_3_split_arrive_leave.leave_distribution}"
        hours: "0-47"
        algorithm: "local_maxima"
      outputs:
        - data: leave_peaks
    
    - id: step_6_analyze_bottleneck
      name: 分析处理瓶颈
      action: analyze
      config:
        arrive_peaks: "${step_4_find_arrive_peaks.arrive_peaks}"
        leave_peaks: "${step_5_find_leave_peaks.leave_peaks}"
        logic: |
          CALCULATE processing_gap = leave_peak_hour - arrive_peak_hour
          IF processing_gap > 6:
            bottleneck = "处理时间过长"
            suggestion = "建议增加处理频次或优化分拣流程"
          IF leave_peak_hour > 24:
            bottleneck = "次日发运"
            suggestion = "建议增加夜间发运班次"
          ANALYZE peak_mismatch:
            IF arrive_peak != leave_peak:
              issue = "到达和离开波峰不匹配"
      outputs:
        - data: bottleneck_analysis
    
    - id: step_7_generate_pdf
      name: 生成PDF报告
      action: generate_pdf
      config:
        template: "export_institution_template.pdf"
        data:
          institution_name: "${params.institution_name}"
          route_name: "${params.route_name}"
          arrive_distribution: "${step_3_split_arrive_leave.arrive_distribution}"
          leave_distribution: "${step_3_split_arrive_leave.leave_distribution}"
          arrive_peaks: "${step_4_find_arrive_peaks.arrive_peaks}"
          leave_peaks: "${step_5_find_leave_peaks.leave_peaks}"
          bottleneck_analysis: "${step_6_analyze_bottleneck.bottleneck_analysis}"
        output_path: "输出结果/出口机构下钻分析结果_[机构名称].pdf"
      outputs:
        - file: "pdf_report"
  
  outputs:
    - name: pdf_report
      type: file
      value: "${step_7_generate_pdf.pdf_report}"
    - name: arrive_peaks
      type: array
      value: "${step_4_find_arrive_peaks.arrive_peaks}"
    - name: leave_peaks
      type: array
      value: "${step_5_find_leave_peaks.leave_peaks}"
    - name: bottleneck_analysis
      type: object
      value: "${step_6_analyze_bottleneck.bottleneck_analysis}"
```

#### 分析内容

1. 到达时间分布图
2. 离开时间分布图
3. 波峰时段识别
4. 处理瓶颈分析

---

## 五、技能调用方式

> **重要说明**: 每个技能都可以独立执行，也可以自由组合多个技能并行或顺序执行。技能之间**没有强制依赖**，一个技能的输出**可以**作为另一个技能的输入，但**不是必须**。

### 5.1 单个技能独立执行

#### 5.1.1 命令行执行

每个技能都可以独立通过命令行执行：

```bash
# 技能1: 线路五环节分析
cd custom_skills/line-five-stage-time-benchmark-analysis
node analyze.js "滨州市-晋城市"

# 技能2: 出口环节分析
cd custom_skills/export-link-drilldown-analysis
node analyze.js "滨州市-大同市" 10

# 技能3: 进口环节分析
cd custom_skills/import-link-drilldown-analysis/scripts
python analyze_binzhou_huizhou.py

# 技能4: 投递环节分析
cd custom_skills/delivery-stage-drilldown-analysis/scripts
python analyze_binzhou_huizhou.py

# 技能5: 中转环节分析
cd custom_skills/transit-link-drilldown-analysis/scripts
python analyze_transit.py

# 技能6: 收寄环节分析
cd custom_skills/pickup-stage-drilldown-analysis
node analyze.js "滨州市-大同市" 5

# 技能7: 收寄机构下钻
cd custom_skills/pickup-institution-drilldown-analysis
node analyze.js "博兴二部" "滨州市大同市"

# 技能8: 出口机构下钻
cd custom_skills/export-institution-drilldown-analysis
node analyze.js "济南齐河" "滨州市东莞市"
```

#### 5.1.2 API 独立调用

每个技能都有独立的 API 端点：

```bash
# 技能1: 线路五环节分析
curl -X POST http://localhost:8001/api/skills/line-five-stage/execute \
  -H "Content-Type: application/json" \
  -d '{"route_name": "滨州市-晋城市"}'

# 技能2: 出口环节分析
curl -X POST http://localhost:8001/api/skills/export-link/execute \
  -H "Content-Type: application/json" \
  -d '{"route_name": "滨州市-大同市", "top_n": 10}'

# 技能3: 进口环节分析
curl -X POST http://localhost:8001/api/skills/import-link/execute \
  -H "Content-Type: application/json" \
  -d '{"route_name": "滨州市-惠州市"}'

# 技能4: 投递环节分析
curl -X POST http://localhost:8001/api/skills/delivery-stage/execute \
  -H "Content-Type: application/json" \
  -d '{"route_name": "滨州市-惠州市"}'

# 技能5: 中转环节分析
curl -X POST http://localhost:8001/api/skills/transit-link/execute \
  -H "Content-Type: application/json" \
  -d '{"route_name": "滨州市-惠州市"}'

# 技能6: 收寄环节分析
curl -X POST http://localhost:8001/api/skills/pickup-stage/execute \
  -H "Content-Type: application/json" \
  -d '{"route_name": "滨州市-大同市", "top_n": 5}'

# 技能7: 收寄机构下钻
curl -X POST http://localhost:8001/api/skills/pickup-institution/execute \
  -H "Content-Type: application/json" \
  -d '{"institution_name": "博兴二部", "route_name": "滨州市大同市"}'

# 技能8: 出口机构下钻
curl -X POST http://localhost:8001/api/skills/export-institution/execute \
  -H "Content-Type: application/json" \
  -d '{"institution_name": "济南齐河", "route_name": "滨州市东莞市"}'
```

#### 5.1.3 Python SDK 独立调用

```python
from deerflow.client import DeerFlowClient

client = DeerFlowClient()

# 技能1: 线路五环节分析
result = client.call_skill("line-five-stage", {"route_name": "滨州市-晋城市"})
print(f"PPT报告: {result.outputs['ppt_report']}")

# 技能2: 出口环节分析
result = client.call_skill("export-link", {"route_name": "滨州市-大同市", "top_n": 10})
for inst in result.outputs['slow_institutions']:
    print(f"{inst['name']}: {inst['time']}小时")

# 技能3: 进口环节分析
result = client.call_skill("import-link", {"route_name": "滨州市-惠州市"})
print(f"报告: {result.outputs['docx_report']}")

# 技能6: 收寄环节分析
result = client.call_skill("pickup-stage", {"route_name": "滨州市-大同市", "top_n": 5})
print(f"最慢机构: {result.outputs['slowest_institution']}")

# 技能7: 收寄机构下钻
result = client.call_skill("pickup-institution", {
    "institution_name": "博兴二部",
    "route_name": "滨州市大同市"
})
print(f"PDF报告: {result.outputs['pdf_report']}")
```

### 5.2 多个技能并行执行

当你想同时分析多个环节时，可以并行执行多个技能：

#### 5.2.1 API 并行调用

```bash
# 并行执行所有环节分析
curl -X POST http://localhost:8001/api/skills/execute-parallel \
  -H "Content-Type: application/json" \
  -d '{
    "skills": [
      {"id": "export-link", "params": {"route_name": "滨州市-大同市", "top_n": 5}},
      {"id": "import-link", "params": {"route_name": "滨州市-大同市"}},
      {"id": "delivery-stage", "params": {"route_name": "滨州市-大同市"}},
      {"id": "transit-link", "params": {"route_name": "滨州市-大同市"}}
    ]
  }'
```

#### 5.2.2 Python SDK 并行调用

```python
import asyncio
from deerflow.client import DeerFlowClient

async def analyze_all_stages():
    client = DeerFlowClient()
    
    # 并行执行4个环节分析
    results = await client.call_skills_parallel([
        ("export-link", {"route_name": "滨州市-大同市", "top_n": 5}),
        ("import-link", {"route_name": "滨州市-大同市"}),
        ("delivery-stage", {"route_name": "滨州市-大同市"}),
        ("transit-link", {"route_name": "滨州市-大同市"}),
    ])
    
    return results

results = asyncio.run(analyze_all_stages())
```

### 5.3 多个技能顺序执行

当你需要先获取结果再决定下一步时，可以顺序执行：

#### 5.3.1 Python SDK 顺序调用

```python
from deerflow.client import DeerFlowClient

client = DeerFlowClient()

# 第一步: 先做全景分析
overview = client.call_skill("line-five-stage", {"route_name": "滨州市-晋城市"})

# 第二步: 根据结果选择环节分析
problem_stage = overview.outputs['key_problem_stage']

if problem_stage == "收寄":
    # 执行收寄环节分析
    pickup_result = client.call_skill("pickup-stage", {
        "route_name": "滨州市-晋城市",
        "top_n": 5
    })
    
    # 第三步: 对最慢机构进行下钻
    drilldown = client.call_skill("pickup-institution", {
        "institution_name": pickup_result.outputs['slowest_institution'],
        "route_name": "滨州市-晋城市"
    })

elif problem_stage == "出口":
    export_result = client.call_skill("export-link", {
        "route_name": "滨州市-晋城市",
        "top_n": 5
    })
```

### 5.4 Web 界面多选执行

在 DeerFlow Web 界面，你可以自由选择一个或多个技能执行：

```
┌──────────────────────────────────────────────────────────┐
│                    技能选择界面                           │
│                                                          │
│  📋 请选择要执行的技能 (可多选):                         │
│                                                          │
│  全景分析                                                │
│  [ ] line-five-stage    线路五环节时限对标分析           │
│                                                          │
│  环节分析                                                │
│  [x] export-link        出口环节下钻分析                 │
│  [x] import-link        进口环节下钻分析                 │
│  [ ] delivery-stage     投递环节下钻分析                 │
│  [ ] transit-link       中转环节下钻分析                 │
│  [x] pickup-stage       收寄环节下钻分析                 │
│                                                          │
│  机构分析                                                │
│  [ ] pickup-institution 收寄机构下钻分析                 │
│  [ ] export-institution 出口机构下钻分析                 │
│                                                          │
│  执行方式:                                               │
│  ○ 并行执行 (同时运行所有选中的技能)                     │
│  ○ 顺序执行 (按选择顺序依次执行)                         │
│                                                          │
│  线路名称: [滨州市-晋城市        ]                       │
│                                                          │
│  [ 开始执行 ]                                            │
└──────────────────────────────────────────────────────────┘
```

### 5.5 自定义组合工作流

你可以定义自己的组合工作流：

```yaml
# my_workflow.yaml
name: my_custom_analysis
description: 我自定义的分析流程

skills:
  # 第一步: 全景分析
  - id: overview
    skill: line-five-stage
    params:
      route_name: "${input.route_name}"
  
  # 第二步: 并行分析所有环节
  - id: all_stages
    parallel: true
    skills:
      - skill: export-link
        params: {route_name: "${input.route_name}", top_n: 3}
      - skill: import-link
        params: {route_name: "${input.route_name}"}
      - skill: delivery-stage
        params: {route_name: "${input.route_name}"}
  
  # 第三步: 只对收寄机构下钻
  - id: pickup_drilldown
    skill: pickup-institution
    params:
      institution_name: "${input.institution_name}"
      route_name: "${input.route_name}"
```

执行自定义工作流：

```bash
curl -X POST http://localhost:8001/api/workflow/custom \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_file": "my_workflow.yaml",
    "input": {
      "route_name": "滨州市-晋城市",
      "institution_name": "博兴二部"
    }
  }'
```

---

## 六、技能依赖管理

### 6.1 Node.js 依赖

**根目录共享依赖** (`custom_skills/package.json`):
```json
{
  "dependencies": {
    "jszip": "^3.10.1",
    "pptxgenjs": "^4.0.1",
    "xlsx": "^0.18.5"
  }
}
```

**技能自有依赖**:
| 技能 | 额外依赖 | 用途 |
|------|----------|------|
| pickup-institution | pdfkit | PDF 生成 |
| export-institution | pdfkit | PDF 生成 |

### 6.2 Python 依赖

```txt
pandas
openpyxl
python-docx
matplotlib
```

安装:
```bash
pip install pandas openpyxl python-docx matplotlib
```

---

## 七、扩展开发指南

### 7.1 新增技能步骤

1. **创建技能目录**
```bash
mkdir custom_skills/new-skill-name
```

2. **编写 SKILL.md**
```markdown
---
id: "new-skill-id"
name: "技能名称"
description: "技能描述"
layer: "环节"  # 全景/环节/机构
inputs:
  - name: param1
    type: string
    required: true
outputs:
  - name: report
    type: file
---

# 技能详细说明
...
```

3. **编写执行脚本**
- Node.js: `analyze.js`
- Python: `scripts/analyze.py`

4. **注册技能**

技能会自动被扫描注册，无需额外配置。

### 7.2 技能接口规范

每个技能需要实现以下接口：

```python
# Python 技能接口
class Skill:
    def execute(self, params: dict) -> SkillResult:
        """
        执行技能
        
        Args:
            params: 技能参数
            
        Returns:
            SkillResult: 包含 outputs 和 files
        """
        pass
```

```javascript
// Node.js 技能接口
// analyze.js 需要接受命令行参数并输出结果

// 参数从 process.argv 获取
const routeName = process.argv[2];
const topN = process.argv[3] || 5;

// 执行分析逻辑
// ...

// 输出结果到控制台或文件
console.log(JSON.stringify(result));
```

---

## 附录

### A. 技能快速参考卡

```
┌─────────────────────────────────────────────────────────────┐
│                    技能快速参考卡                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 全景分析                                                │
│  line-five-stage <线路名>                                   │
│  → 输出: PPT + PDF                                          │
│                                                             │
│  🔍 环节分析                                                │
│  export-link <线路名> [TopN]                                │
│  import-link <线路名>                                       │
│  delivery-stage <线路名>                                    │
│  transit-link <线路名>                                      │
│  pickup-stage <线路名> [TopN]                               │
│                                                             │
│  🏢 机构分析                                                │
│  pickup-institution <机构名> <线路名>                       │
│  export-institution <机构名> <线路名>                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### B. 常见问题

**Q: 技能之间有依赖关系吗？**

A: 技能之间**没有强制依赖**。每个技能都可以独立执行。但某些技能的输出可以作为其他技能的输入，比如 `pickup-stage` 输出的 `slowest_institution` 可以作为 `pickup-institution` 的输入。

**Q: 可以同时执行多个技能吗？**

A: 可以。使用 `execute-parallel` API 或在 Web 界面选择多个技能后选择"并行执行"。

**Q: 如何知道该选哪个技能？**

A: 参考"技能选择决策树"，根据你的分析需求选择合适的技能。

**Q: 技能执行失败怎么办？**

A: 每个技能都是独立的，一个失败不影响其他技能的执行。可以单独重新执行失败的技能。

---

*文档版本: 4.0*
*最后更新: 2026-04-30*
