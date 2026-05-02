const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { convertToPdf } = require('../pdf_utils');

const routeName = process.argv[2];
const topN = parseInt(process.argv[3]) || 5;

if (!routeName) {
    console.error('请提供线路名称，例如：node analyze.js "北京 - 上海"');
    process.exit(1);
}

async function analyze() {
    console.log('开始执行中转环节下钻分析...');
    console.log('目标线路:', routeName);
    
    const processedRouteName = routeName.replace(/[到\-\s]/g, '');
    console.log('处理后的线路名:', processedRouteName);
    
    const dataFile = path.join(__dirname, '../data/寄递时限对标分析指标大全.xlsx');
    const outputDir = path.join(__dirname, '输出结果');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('\n正在读取 Excel 数据...');
    const workbook = xlsx.readFile(dataFile);
    
    const sheetName = '线路表';
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`使用 Sheet: ${sheetName}, 读取到 ${data.length - 1} 条线路数据`);
    
    const routeData = data.slice(1).filter(row => {
        const route = (row[6] || '').replace(/[到\-\s]/g, '');
        return route.includes(processedRouteName) || route === processedRouteName;
    });
    
    if (routeData.length === 0) {
        console.error(`未找到线路 ${processedRouteName} 的中转数据`);
        return;
    }
    
    console.log(`找到线路：${routeData[0][6]}`);
    
    const route = routeData[0];
    
    const tekuaiTransitTimeIndex = 11;
    const jingpinTransitTimeIndex = 18;
    
    const tekuaiTransitTime = route[tekuaiTransitTimeIndex] || 0;
    const jingpinTransitTime = route[jingpinTransitTimeIndex] || 0;
    const diff = tekuaiTransitTime - jingpinTransitTime;
    
    console.log(`特快中转时限：${tekuaiTransitTime.toFixed(2)} 小时`);
    console.log(`竞品中转时限：${jingpinTransitTime.toFixed(2)} 小时`);
    console.log(`差值：${diff >= 0 ? '+' : ''}${diff.toFixed(2)} 小时`);
    
    let tekuaiTransitCityCount = 0;
    let jingpinTransitCityCount = 0;
    const headers = data[0];
    headers.forEach((header, index) => {
        if (header && header.includes('特快') && header.includes('中转城市数')) {
            tekuaiTransitCityCount = route[index] || 0;
        }
        if (header && header.includes('竞品') && header.includes('中转城市数')) {
            jingpinTransitCityCount = route[index] || 0;
        }
    });
    
    console.log(`特快中转城市数：${tekuaiTransitCityCount} 个`);
    console.log(`竞品中转城市数：${jingpinTransitCityCount} 个`);

    const now = new Date();
    const timestamp = now.getFullYear().toString() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + 
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0') + 
                     String(now.getSeconds()).padStart(2, '0');
    console.log('\n正在生成分析结果 PDF...');

    const diffLabel = diff > 0 ? `特快比竞品慢 ${diff.toFixed(2)} 小时` : 
                      diff < 0 ? `特快比竞品快 ${Math.abs(diff).toFixed(2)} 小时` :
                      `特快与竞品中转时限相同`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>中转环节下钻分析报告</title>
<style>
body{font-family:"Microsoft YaHei","PingFang SC","Hiragino Sans GB",sans-serif;margin:40px 60px;color:#333;line-height:1.8}
h1{text-align:center;font-size:22px;border-bottom:2px solid #006633;padding-bottom:10px}
h2{font-size:16px;color:#006633;margin-top:25px;border-left:4px solid #006633;padding-left:10px}
.info{color:#666;font-size:13px;margin:5px 0}
table{border-collapse:collapse;width:100%;margin:15px 0;font-size:13px}
th{background:#006633;color:#fff;padding:8px 10px;text-align:center}
td{border:1px solid #ddd;padding:8px 10px;text-align:center}
tr:nth-child(even){background:#f9f9f9}
.summary{background:#f5f5f5;padding:15px;border-radius:5px;margin:15px 0;font-size:14px}
</style></head><body>
<h1>中转环节下钻分析报告</h1>
<p class="info">线路：${routeName}</p>

<h2>一、中转时限对比</h2>
<table>
<tr><th>指标</th><th>特快</th><th>竞品</th><th>差值</th></tr>
<tr><td>中转时限</td><td>${tekuaiTransitTime.toFixed(2)} 小时</td><td>${jingpinTransitTime.toFixed(2)} 小时</td><td>${diff >= 0 ? '+' : ''}${diff.toFixed(2)} 小时</td></tr>
</table>

<h2>二、中转特征</h2>
<table>
<tr><th>指标</th><th>特快</th><th>竞品</th><th>差值</th></tr>
<tr><td>中转城市数</td><td>${tekuaiTransitCityCount} 个</td><td>${jingpinTransitCityCount} 个</td><td>${tekuaiTransitCityCount - jingpinTransitCityCount} 个</td></tr>
</table>

<h2>三、分析总结</h2>
<div class="summary">
${routeName} 线路特快中转时限为 ${tekuaiTransitTime.toFixed(2)} 小时，竞品为 ${jingpinTransitTime.toFixed(2)} 小时。
${diffLabel}。
特快中转城市数 ${tekuaiTransitCityCount} 个，竞品 ${jingpinTransitCityCount} 个。
</div>
</body></html>`;

    const htmlFile = path.join(outputDir, `中转环节下钻分析结果_${routeName}_${timestamp}.html`);
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
