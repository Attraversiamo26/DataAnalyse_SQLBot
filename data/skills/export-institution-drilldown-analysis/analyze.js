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
    console.log('开始执行出口机构下钻分析...');
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
    const targetSheetName = sheetNames.find(name => name.includes('进口、出口'));
    
    if (!targetSheetName) {
        console.error('未找到进口、出口处理及投递 48 小时 sheet');
        return;
    }
    
    const sheet = workbook.Sheets[targetSheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`使用 Sheet: ${targetSheetName}, 读取到 ${data.length - 1} 条数据`);
    
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

    const exportData = data.slice(1).filter(row => {
        const instName = String(row[4] || '');
        const route = String(row[8] || '');
        const step = String(row[9] || '');
        return matchInstitution(instName, institutionName) && 
               (route === processedRouteName || route.includes(processedRouteName)) && 
               step === '出口';
    });
    
    console.log(`筛选到 ${exportData.length} 条出口数据`);
    
    if (exportData.length === 0) {
        console.error(`未找到机构 ${institutionName} 在线路 ${processedRouteName} 的出口数据`);
        process.exit(1);
    }
    
    const arrivalData = exportData.find(row => String(row[10] || '') === '到达');
    const leaveData = exportData.find(row => String(row[10] || '') === '离开');
    
    console.log(`到达数据：${arrivalData ? '有' : '无'}`);
    console.log(`离开数据：${leaveData ? '有' : '无'}`);
    
    if (!arrivalData && !leaveData) {
        console.error('未找到到达或离开数据');
        return;
    }
    
    let arrivalDistribution = [];
    let leaveDistribution = [];
    
    if (arrivalData) {
        for (let i = 0; i < 24; i++) {
            arrivalDistribution.push(arrivalData[11 + i] || 0);
        }
    }
    
    if (leaveData) {
        for (let i = 0; i < 48; i++) {
            leaveDistribution.push(leaveData[11 + i] || 0);
        }
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
    
    const arrivalPeaks = findPeaks(arrivalDistribution);
    const leavePeaks = findPeaks(leaveDistribution);
    
    console.log('\n到达时间分布峰值:');
    arrivalPeaks.forEach(m => console.log(`  ${m.hour}时：占比 ${(m.value * 100).toFixed(2)}%`));
    
    console.log('\n离开时间分布峰值:');
    leavePeaks.forEach(m => console.log(`  ${m.hour}时：占比 ${(m.value * 100).toFixed(2)}%`));

    const now = new Date();
    const timestamp = now.getFullYear().toString() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + 
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0') + 
                     String(now.getSeconds()).padStart(2, '0');
    console.log('\n正在生成分析结果 PDF...');

    let arrivalRows = '';
    arrivalPeaks.forEach((m, i) => {
        arrivalRows += `<tr><td>${i + 1}</td><td>${m.hour}时</td><td>${(m.value * 100).toFixed(2)}%</td></tr>`;
    });

    let leaveRows = '';
    leavePeaks.forEach((m, i) => {
        leaveRows += `<tr><td>${i + 1}</td><td>${m.hour}时</td><td>${(m.value * 100).toFixed(2)}%</td></tr>`;
    });

    let compareSection = '';
    if (arrivalPeaks.length > 0 && leavePeaks.length > 0) {
        const arrivalPeak = arrivalPeaks.reduce((max, m) => m.value > max.value ? m : max, arrivalPeaks[0]);
        const leavePeak = leavePeaks.reduce((max, m) => m.value > max.value ? m : max, leavePeaks[0]);
        const timeDiff = leavePeak.hour - arrivalPeak.hour;
        compareSection = `
<h2>四、到达离开对比分析</h2>
<table>
<tr><th>指标</th><th>到达</th><th>离开</th></tr>
<tr><td>主高峰时点</td><td>${arrivalPeak.hour}时</td><td>${leavePeak.hour}时</td></tr>
<tr><td>主高峰占比</td><td>${(arrivalPeak.value * 100).toFixed(2)}%</td><td>${(leavePeak.value * 100).toFixed(2)}%</td></tr>
<tr><td>峰值数量</td><td>${arrivalPeaks.length}个</td><td>${leavePeaks.length}个</td></tr>
</table>
<p>${timeDiff > 0 ? `从到达高峰到离开高峰约 ${timeDiff} 小时，处理效率${timeDiff <= 4 ? '良好' : '有待提升'}。` : '到达和离开高峰时点相同或接近。'}</p>`;
    }

    let summary = `${institutionName}（${routeName}）出口环节`;
    if (arrivalPeaks.length > 0 && leavePeaks.length > 0) {
        const ap = arrivalPeaks.reduce((max, m) => m.value > max.value ? m : max, arrivalPeaks[0]);
        const lp = leavePeaks.reduce((max, m) => m.value > max.value ? m : max, leavePeaks[0]);
        summary += `到达时间分布有 ${arrivalPeaks.length} 个峰值，主高峰在 ${ap.hour} 时（${(ap.value * 100).toFixed(2)}%）；`;
        summary += `离开时间分布有 ${leavePeaks.length} 个峰值，主高峰在 ${lp.hour} 时（${(lp.value * 100).toFixed(2)}%）。`;
    } else if (arrivalPeaks.length > 0) {
        summary += `到达时间分布有 ${arrivalPeaks.length} 个峰值，但离开数据无明显峰值。`;
    } else if (leavePeaks.length > 0) {
        summary += `离开时间分布有 ${leavePeaks.length} 个峰值，但到达数据无明显峰值。`;
    } else {
        summary += '到达和离开时间分布均无明显峰值。';
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>出口机构下钻分析报告</title>
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
<h1>出口机构下钻分析报告</h1>
<p class="info">机构名称：${institutionName}</p>
<p class="info">线路名称：${routeName}</p>

<h2>一、数据筛选结果</h2>
<p>环节标识：出口</p>
<p>到达数据：${arrivalData ? '有' : '无'} | 离开数据：${leaveData ? '有' : '无'}</p>

<h2>二、到达时间分布分析（0-23 小时）</h2>
${arrivalPeaks.length > 0 ? `<table><tr><th>序号</th><th>峰值时点</th><th>占比</th></tr>${arrivalRows}</table>` : '<p>无明显峰值</p>'}

<h2>三、离开时间分布分析（0-47 小时）</h2>
${leavePeaks.length > 0 ? `<table><tr><th>序号</th><th>峰值时点</th><th>占比</th></tr>${leaveRows}</table>` : '<p>无明显峰值</p>'}

${compareSection}

<h2>五、分析总结</h2>
<div class="summary">${summary}</div>
</body></html>`;

    const htmlFile = path.join(outputDir, `出口机构下钻分析结果_${institutionName}_${timestamp}.html`);
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
    console.error('分析过程中出现错误:', err);
    process.exit(1);
});
