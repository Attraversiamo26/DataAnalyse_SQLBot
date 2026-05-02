const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { convertToPdf } = require('../pdf_utils');

const institutionName = process.argv[2];
const routeName = process.argv[3];

if (!institutionName || !routeName) {
    console.error('请提供机构名称和线路名称，例如：node analyze.js "博兴二部" "滨州市大同市"');
    process.exit(1);
}

function processRouteName(route) {
    return route.replace(/[到\-\s]/g, '');
}

const processedRouteName = processRouteName(routeName);

async function analyze() {
    console.log('开始执行收寄机构下钻分析...');
    console.log('目标机构:', institutionName);
    console.log('输入线路:', routeName);
    console.log('处理后的线路:', processedRouteName);
    
    const dataFile = path.join(__dirname, '../data/寄递时限对标分析指标大全.xlsx');
    const outputDir = path.join(__dirname, '输出结果');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('\n正在读取 Excel 数据...');
    const workbook = xlsx.readFile(dataFile);
    
    const sheetNames = workbook.SheetNames;
    const sheetName = sheetNames[sheetNames.length - 1];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`使用 Sheet: ${sheetName}, 读取到 ${data.length - 1} 条机构数据`);
    
    function matchInstitution(dataName, searchName) {
        if (!dataName || !searchName) return false;
        dataName = String(dataName);
        searchName = String(searchName);
        if (dataName === searchName) return true;
        if (dataName.includes(searchName)) return true;
        if (searchName.includes(dataName)) return true;
        const dataChars = dataName.replace(/[省市邮局件处理中心一二三四五六七八九十部城区东西南北]/g, '');
        const searchChars = searchName.replace(/[省市邮局件处理中心一二三四五六七八九十部城区东西南北]/g, '');
        if (dataChars && searchChars && (dataChars.includes(searchChars) || searchChars.includes(dataChars))) return true;
        return false;
    }

    const pickupData = data.slice(1).find(row => {
        const name = row[4] || '';
        const stage = row[9] || '';
        const route = row[8] || '';
        return matchInstitution(name, institutionName) && 
               stage === '收寄' && 
               (route.includes(processedRouteName) || route === processedRouteName);
    });
    
    const leaveData = data.slice(1).find(row => {
        const name = row[4] || '';
        const stage = row[9] || '';
        const route = row[8] || '';
        return matchInstitution(name, institutionName) && 
               stage === '离开' && 
               (route.includes(processedRouteName) || route === processedRouteName);
    });
    
    if (!pickupData && !leaveData) {
        console.error(`未找到机构 ${institutionName} 的数据`);
        process.exit(1);
    }
    
    console.log(`找到机构数据：${pickupData ? pickupData[4] : leaveData[4]}`);
    console.log(`收寄数据：${pickupData ? '有' : '无'}, 离开数据：${leaveData ? '有' : '无'}`);
    
    const pickupDistribution = [];
    const leaveDistribution = [];
    
    if (pickupData) {
        for (let i = 0; i < 24; i++) {
            pickupDistribution.push(pickupData[10 + i] || 0);
        }
    } else {
        for (let i = 0; i < 24; i++) pickupDistribution.push(0);
    }
    
    if (leaveData) {
        for (let i = 0; i < 48; i++) {
            leaveDistribution.push(leaveData[10 + i] || 0);
        }
    } else {
        for (let i = 0; i < 48; i++) leaveDistribution.push(0);
    }
    
    function findPeaks(distribution) {
        const peaks = [];
        let i = 0;
        while (i < distribution.length) {
            while (i < distribution.length && distribution[i] === 0) i++;
            if (i >= distribution.length) break;
            let segmentMax = { hour: i, value: distribution[i] };
            while (i < distribution.length && distribution[i] > 0) {
                if (distribution[i] > segmentMax.value) {
                    segmentMax = { hour: i, value: distribution[i] };
                }
                i++;
            }
            peaks.push(segmentMax);
        }
        return peaks;
    }
    
    const pickupPeaks = findPeaks(pickupDistribution);
    const leavePeaks = findPeaks(leaveDistribution);
    
    console.log('\n收寄时间分布峰值:');
    pickupPeaks.forEach(peak => console.log(`  ${peak.hour}时：占比 ${(peak.value * 100).toFixed(2)}%`));
    
    console.log('\n离开时间分布峰值:');
    leavePeaks.forEach(peak => console.log(`  ${peak.hour}时：占比 ${(peak.value * 100).toFixed(2)}%`));

    const now = new Date();
    const timestamp = now.getFullYear().toString() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + 
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0') + 
                     String(now.getSeconds()).padStart(2, '0');
    console.log('\n正在生成分析结果 PDF...');

    let pickupRows = '';
    pickupPeaks.forEach((m, i) => {
        pickupRows += `<tr><td>${i + 1}</td><td>${m.hour}时</td><td>${(m.value * 100).toFixed(2)}%</td></tr>`;
    });

    let leaveRows = '';
    leavePeaks.forEach((m, i) => {
        leaveRows += `<tr><td>${i + 1}</td><td>${m.hour}时</td><td>${(m.value * 100).toFixed(2)}%</td></tr>`;
    });

    let analysis = '';
    if (pickupPeaks.length === 1) {
        analysis = '收寄时间呈现单峰分布，业务量集中在一个时段，便于资源集中配置。';
    } else if (pickupPeaks.length > 1) {
        analysis = `收寄时间呈现多峰分布（${pickupPeaks.length}个峰值），业务量分散在多个时段，需均衡资源配置。`;
    } else {
        analysis = '收寄时间分布较为平缓，无明显峰值，业务量分布均匀。';
    }

    let summary = `${institutionName}机构收寄时间分布`;
    if (pickupPeaks.length > 0) {
        const maxPeak = pickupPeaks.reduce((max, curr) => curr.value > max.value ? curr : max, pickupPeaks[0]);
        summary += `在${maxPeak.hour}时达到最高峰值，占比 ${(maxPeak.value * 100).toFixed(2)}%。`;
        if (pickupPeaks.length > 1) summary += `共有${pickupPeaks.length}个业务高峰时段。`;
    } else {
        summary += '分布较为均匀，无明显高峰时段。';
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>收寄机构下钻分析报告</title>
<style>
body{font-family:"Microsoft YaHei","PingFang SC","Hiragino Sans GB",sans-serif;margin:40px 60px;color:#333;line-height:1.8}
h1{text-align:center;font-size:22px;border-bottom:2px solid #006633;padding-bottom:10px}
h2{font-size:16px;color:#006633;margin-top:25px;border-left:4px solid #006633;padding-left:10px}
.info{color:#666;font-size:13px;margin:5px 0}
table{border-collapse:collapse;width:100%;margin:15px 0;font-size:13px}
th{background:#006633;color:#fff;padding:8px 10px;text-align:center}
td{border:1px solid #ddd;padding:6px 10px;text-align:center}
tr:nth-child(even){background:#f9f9f9}
.summary{background:#f5f5f5;padding:15px;border-radius:5px;margin:15px 0;font-size:14px}
</style></head><body>
<h1>收寄机构下钻分析报告</h1>
<p class="info">机构名称：${institutionName}</p>
<p class="info">线路名称：${routeName}</p>

<h2>一、数据筛选结果</h2>
<p>收寄数据：${pickupData ? '有' : '无'} | 离开数据：${leaveData ? '有' : '无'}</p>

<h2>二、收寄时间分布分析（0-23 小时）</h2>
${pickupPeaks.length > 0 ? `<table><tr><th>序号</th><th>峰值时点</th><th>占比</th></tr>${pickupRows}</table>` : '<p>无明显峰值</p>'}

<h2>三、离开时间分布分析（0-47 小时）</h2>
${leavePeaks.length > 0 ? `<table><tr><th>序号</th><th>峰值时点</th><th>占比</th></tr>${leaveRows}</table>` : '<p>无明显峰值</p>'}

<h2>四、峰值分析</h2>
<p>${analysis}</p>

<h2>五、分析总结</h2>
<div class="summary">${summary}</div>
</body></html>`;

    const htmlFile = path.join(outputDir, `收寄机构下钻分析结果_${institutionName}_${timestamp}.html`);
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
