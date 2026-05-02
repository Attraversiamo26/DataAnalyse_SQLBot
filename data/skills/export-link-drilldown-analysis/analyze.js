const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { convertToPdf } = require('../pdf_utils');

const routeName = process.argv[2];
const topN = parseInt(process.argv[3]) || 5;

if (!routeName) {
    console.error('请提供线路名称，例如：node analyze.js "滨州市到大同市"');
    process.exit(1);
}

async function analyze() {
    console.log('开始执行出口环节下钻分析...');
    console.log('目标线路:', routeName);
    
    let cities = [];
    if (routeName.includes('到')) {
        cities = routeName.split('到');
    } else if (routeName.includes('-')) {
        cities = routeName.split('-');
    } else {
        const match = routeName.match(/(.+ 市)(.+)/);
        if (match) {
            cities = [match[1], match[2]];
        }
    }
    
    const startCity = cities[0] || '';
    const endCity = cities[1] || '';
    
    console.log('起点城市:', startCity);
    console.log('终点城市:', endCity);
    
    const dataFile = path.join(__dirname, '../data/寄递时限对标分析指标大全.xlsx');
    const outputDir = path.join(__dirname, '输出结果');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('\n正在读取 Excel 数据...');
    const workbook = xlsx.readFile(dataFile);
    
    const sheetNames = workbook.SheetNames;
    const targetSheetName = sheetNames.find(name => name.includes('出口机构'));
    
    if (!targetSheetName) {
        console.error('未找到出口机构表 sheet');
        return;
    }
    
    const sheet = workbook.Sheets[targetSheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`使用 Sheet: ${targetSheetName}`);
    console.log(`读取到 ${data.length - 1} 条机构数据`);
    
    console.log('\n筛选条件:');
    console.log(`  收寄市：${startCity}`);
    console.log(`  投递市：${endCity}`);
    
    const routeData = data.slice(1).filter(row => {
        const pickupCity = row[1] || '';
        const deliveryCity = row[3] || '';
        return pickupCity.includes(startCity) && deliveryCity.includes(endCity);
    });
    
    if (routeData.length === 0) {
        console.error(`未找到收寄市为 ${startCity}、投递市为 ${endCity} 的出口机构数据`);
        return;
    }
    
    console.log(`找到 ${routeData.length} 个机构数据`);
    
    routeData.sort((a, b) => (b[10] || 0) - (a[10] || 0));
    
    const topInstitutions = routeData.slice(0, topN);
    
    console.log(`\n出口处理时限最长的 ${topN} 个机构:`);
    topInstitutions.forEach((inst, index) => {
        const instName = inst[8] || '未知';
        const handleTime = inst[10] || 0;
        console.log(`  ${index + 1}. ${instName}: ${handleTime.toFixed(2)} 小时`);
    });
    
    const avgTime = topInstitutions.reduce((sum, inst) => sum + (inst[10] || 0), 0) / topInstitutions.length;
    const maxTimeInst = topInstitutions.reduce((max, inst) => (inst[10] || 0) > (max[10] || 0) ? inst : max, topInstitutions[0]);
    
    console.log('\n=== 分析总结 ===');
    console.log(`\n${routeName}线路出口环节 Top ${topN} 个机构平均出口处理时间为${avgTime.toFixed(2)}小时。`);
    console.log(`其中，${maxTimeInst[8]}出口处理时间最长，达到${(maxTimeInst[10] || 0).toFixed(2)}小时。`);
    
    const mainBottleneck = topInstitutions.reduce((max, inst) => {
        const sortPct = (inst[11] || 0) / Math.max(inst[10] || 1, 0.01);
        const transportPct = (inst[12] || 0) / Math.max(inst[10] || 1, 0.01);
        return sortPct > transportPct ? '分拣' : '发运';
    }, '分拣');

    const now = new Date();
    const timestamp = now.getFullYear().toString() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + 
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0') + 
                     String(now.getSeconds()).padStart(2, '0');
    console.log('\n正在生成分析结果 PDF...');

    let instRows = '';
    topInstitutions.forEach((inst, index) => {
        const instName = inst[8] || '未知';
        const handleTime = (inst[10] || 0).toFixed(2);
        const sortTime = (inst[11] || 0).toFixed(2);
        const sortPct = inst[10] > 0 ? ((inst[11] || 0) / inst[10] * 100).toFixed(1) : '0.0';
        const transportTime = (inst[12] || 0).toFixed(2);
        const transportPct = inst[10] > 0 ? ((inst[12] || 0) / inst[10] * 100).toFixed(1) : '0.0';
        const sampleSize = inst[13] || 0;
        const reason = inst[14] || '无';
        instRows += `<tr><td>${index + 1}</td><td>${instName}</td><td>${handleTime}</td><td>${sortTime} (${sortPct}%)</td><td>${transportTime} (${transportPct}%)</td><td>${sampleSize}</td><td>${reason}</td></tr>`;
    });

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>出口环节下钻分析报告</title>
<style>
body{font-family:"Microsoft YaHei","PingFang SC","Hiragino Sans GB",sans-serif;margin:40px 60px;color:#333;line-height:1.8}
h1{text-align:center;font-size:22px;border-bottom:2px solid #006633;padding-bottom:10px}
h2{font-size:16px;color:#006633;margin-top:25px;border-left:4px solid #006633;padding-left:10px}
.info{color:#666;font-size:13px;margin:5px 0}
table{border-collapse:collapse;width:100%;margin:15px 0;font-size:12px}
th{background:#006633;color:#fff;padding:8px 6px;text-align:center}
td{border:1px solid #ddd;padding:6px;text-align:center}
tr:nth-child(even){background:#f9f9f9}
.summary{background:#f5f5f5;padding:15px;border-radius:5px;margin:15px 0;font-size:14px}
</style></head><body>
<h1>出口环节下钻分析报告</h1>
<p class="info">线路：${routeName}</p>
<p class="info">出口处理时限最长的 ${topN} 个机构</p>

<h2>一、概览</h2>
<p>该线路共有 <b>${routeData.length}</b> 个出口机构</p>
<p>Top ${topN} 机构平均出口处理时间：<b>${avgTime.toFixed(2)} 小时</b></p>
<p>最慢机构：<b>${maxTimeInst[8]}</b>（${(maxTimeInst[10] || 0).toFixed(2)} 小时）</p>

<h2>二、机构详情</h2>
<table>
<tr><th>序号</th><th>机构名称</th><th>出口处理时限(h)</th><th>出口分拣时限(h)</th><th>出口带发运时限(h)</th><th>样本量</th><th>原因分析</th></tr>
${instRows}
</table>

<h2>三、分析总结</h2>
<div class="summary">
${routeName} 线路出口环节 Top ${topN} 个机构平均出口处理时间为 ${avgTime.toFixed(2)} 小时。
其中最慢的是 ${maxTimeInst[8]}，达到 ${(maxTimeInst[10] || 0).toFixed(2)} 小时。
主要瓶颈出现在${mainBottleneck}环节。
</div>
</body></html>`;

    const htmlFile = path.join(outputDir, `出口环节下钻分析结果_${routeName}_${timestamp}.html`);
    fs.writeFileSync(htmlFile, html, 'utf8');

    const pdfResult = convertToPdf(htmlFile, outputDir);
    if (pdfResult) {
        fs.unlinkSync(htmlFile);
    } else {
        console.log('LibreOffice转换失败，HTML报告已保存至：' + htmlFile);
    }
    
    console.log('\n分析完成！');
}

analyze().catch(err => {
    console.error('分析失败:', err);
    process.exit(1);
});
