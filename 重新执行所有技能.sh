#!/bin/bash
# 重新执行所有技能并生成新输出

set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$BASE_DIR/data/skills"
DATA_DIR="$SKILLS_DIR/data"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "============================================"
echo "重新执行所有技能并生成新输出"
echo "============================================"
echo "时间戳: $TIMESTAMP"
echo "技能目录: $SKILLS_DIR"
echo ""

# 1. 全景分析 - line-five-stage-time-benchmark-analysis
echo "============================================"
echo "1/8 执行: 五环节全景分析"
echo "============================================"
cd "$SKILLS_DIR/line-five-stage-time-benchmark-analysis"
echo "清理旧输出..."
rm -rf "输出结果"
mkdir -p "输出结果"
echo "执行技能..."
node analyze.js "滨州市 - 大同市"
echo ""

# 2. 出口环节 - export-link-drilldown-analysis
echo "============================================"
echo "2/8 执行: 出口环节下钻分析"
echo "============================================"
cd "$SKILLS_DIR/export-link-drilldown-analysis"
echo "清理旧输出..."
rm -rf "输出结果"
mkdir -p "输出结果"
echo "执行技能..."
node analyze.js "滨州市到大同市" 3
echo ""

# 3. 进口环节 - import-link-drilldown-analysis
echo "============================================"
echo "3/8 执行: 进口环节下钻分析"
echo "============================================"
cd "$SKILLS_DIR/import-link-drilldown-analysis"
echo "清理旧输出..."
rm -rf "输出结果"
mkdir -p "输出结果"
echo "执行技能..."
node analyze.js "滨州市到大同市" 3
echo ""

# 4. 投递环节 - delivery-stage-drilldown-analysis
echo "============================================"
echo "4/8 执行: 投递环节下钻分析"
echo "============================================"
cd "$SKILLS_DIR/delivery-stage-drilldown-analysis"
echo "清理旧输出..."
rm -rf "输出结果"
mkdir -p "输出结果"
rm -f scripts/*.docx scripts/*.pdf scripts/*.png
echo "执行技能..."
cd scripts
python analyze_binzhou_huizhou.py
mv -f *.docx *.pdf *.png "../输出结果/"
cd ..
echo ""

# 5. 中转环节 - transit-link-drilldown-analysis
echo "============================================"
echo "5/8 执行: 中转环节下钻分析"
echo "============================================"
cd "$SKILLS_DIR/transit-link-drilldown-analysis"
echo "清理旧输出..."
rm -rf "输出结果"
mkdir -p "输出结果"
rm -f scripts/*.docx scripts/*.pdf
echo "执行技能..."
cd scripts
python analyze_transit.py
mv -f *.docx *.pdf "../输出结果/"
cd ..
echo ""

# 6. 收寄环节 - pickup-stage-drilldown-analysis
echo "============================================"
echo "6/8 执行: 收寄环节下钻分析"
echo "============================================"
cd "$SKILLS_DIR/pickup-stage-drilldown-analysis"
echo "清理旧输出..."
rm -rf "输出结果"
mkdir -p "输出结果"
echo "执行技能..."
node analyze.js "滨州市到大同市" 3
echo ""

# 7. 收寄机构 - pickup-institution-drilldown-analysis
echo "============================================"
echo "7/8 执行: 收寄机构下钻分析"
echo "============================================"
cd "$SKILLS_DIR/pickup-institution-drilldown-analysis"
echo "清理旧输出..."
rm -rf "输出结果"
mkdir -p "输出结果"
echo "执行技能..."
node analyze.js "博兴二部" "滨州市到大同市"
echo ""

# 8. 出口机构 - export-institution-drilldown-analysis
echo "============================================"
echo "8/8 执行: 出口机构下钻分析"
echo "============================================"
cd "$SKILLS_DIR/export-institution-drilldown-analysis"
echo "清理旧输出..."
rm -rf "输出结果"
mkdir -p "输出结果"
echo "执行技能..."
node analyze.js "济南齐河" "滨州市到大同市"
echo ""

# 汇总输出
echo "============================================"
echo "所有技能执行完成！"
echo "============================================"
echo ""
echo "汇总输出文件:"
echo ""

find "$SKILLS_DIR" -path "*/输出结果/*" -type f | while read FILE; do
    echo "  - $(basename "$FILE")"
done

echo ""
echo "完成时间: $(date)"
