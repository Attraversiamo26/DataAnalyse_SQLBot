/**
 * 线路五环节时限对标分析
 * 
 * 功能：读取 data/寄递时限对标分析指标大全.xlsx 中的线路表，
 *      基于 PPT 模板自动更新数据和图表，生成线路五环节时限对标分析结果.pptx
 *      并导出为 PDF 格式
 */

const XLSX = require('xlsx');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const { convertToPdf } = require('../pdf_utils');

/**
 * 主函数 - 执行线路五环节时限对标分析
 * @param {string} routeName - 线路名称，如"北京-上海"
 */
async function analyzeRoute(routeName = '北京 - 上海') {
    console.log('开始执行线路五环节时限对标分析...');
    console.log('目标线路:', routeName);
    
    // 1. 确定文件路径
    const skillDir = __dirname;
    const dataDir = path.join(skillDir, '..', 'data');
    const excelFile = path.join(dataDir, '寄递时限对标分析指标大全.xlsx');
    const templateFile = path.join(skillDir, '线路五环节时限对标分析模板.pptx');
    
    // 创建输出结果文件夹
    const outputDir = path.join(skillDir, '输出结果');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        console.log('创建输出文件夹:', outputDir);
    }
    
    // 生成本地时间的时间戳，格式为：YYYYMMDDHHmmss
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    
    const outputFile = path.join(outputDir, '线路五环节时限对标分析结果_' + routeName + '_' + timestamp + '.pptx');
    
    console.log('\n文件路径:');
    console.log('  数据文件:', excelFile);
    console.log('  模板文件:', templateFile);
    console.log('  输出文件:', outputFile);
    
    // 2. 检查文件是否存在
    if (!fs.existsSync(excelFile)) {
        throw new Error('数据文件不存在：' + excelFile);
    }
    if (!fs.existsSync(templateFile)) {
        throw new Error('模板文件不存在：' + templateFile);
    }
    
    // 3. 读取 Excel 数据
    console.log('\n正在读取 Excel 数据...');
    const workbook = XLSX.readFile(excelFile);
    
    // 查找"线路表"sheet（第 1 个 sheet，索引为 0）
    const sheetName = workbook.SheetNames[0];
    console.log('使用 Sheet:', sheetName);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});
    
    console.log('读取到', data.length - 1, '条线路数据');
    
    // 4. 筛选指定线路
    console.log('\n筛选线路:', routeName);
    const parts = routeName.split('-').map(s => s.trim());
    
    let routeRow = null;
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row[6]) {
            const routeStr = String(row[6]);
            // 如果没有连字符，直接匹配整个线路名
            if (parts.length === 1) {
                if (routeStr.includes(parts[0])) {
                    routeRow = row;
                    console.log('找到线路:', routeStr, '(行', i, ')');
                    break;
                }
            } else {
                if (routeStr.includes(parts[0]) && routeStr.includes(parts[1])) {
                    routeRow = row;
                    console.log('找到线路:', routeStr, '(行', i, ')');
                    break;
                }
            }
        }
    }
    
    if (!routeRow) {
        throw new Error('未找到线路"' + routeName + '"的数据');
    }
    
    // 5. 提取五环节时限数据（基于列索引）
    const fiveStages = {
        '收寄': parseFloat(routeRow[9]) || 0,
        '出口': parseFloat(routeRow[10]) || 0,
        '中转': parseFloat(routeRow[11]) || 0,
        '进口': parseFloat(routeRow[12]) || 0,
        '投递': parseFloat(routeRow[13]) || 0
    };
    
    const totalTime = parseFloat(routeRow[8]) || 0;
    
    console.log('\n五环节时限数据:');
    Object.entries(fiveStages).forEach(([stage, time]) => {
        console.log('  ' + stage + ': ' + time.toFixed(2) + ' 小时');
    });
    console.log('  总时限:', totalTime.toFixed(2), '小时');
    
    // 6. 提取竞品数据用于对标
    const competitorStages = {
        '收寄': parseFloat(routeRow[16]) || 0,
        '出口': parseFloat(routeRow[17]) || 0,
        '中转': parseFloat(routeRow[18]) || 0,
        '进口': parseFloat(routeRow[19]) || 0,
        '投递': parseFloat(routeRow[20]) || 0
    };
    
    const competitorTotalTime = parseFloat(routeRow[15]) || 0;
    
    console.log('\n竞品五环节时限数据:');
    Object.entries(competitorStages).forEach(([stage, time]) => {
        console.log('  ' + stage + ': ' + time.toFixed(2) + ' 小时');
    });
    console.log('  总时限:', competitorTotalTime.toFixed(2), '小时');
    
    // 7. 计算差异
    const timeDiff = totalTime - competitorTotalTime;
    
    // 计算各环节差值，找出差值最大的环节
    const stageDiffs = {};
    let maxDiffStage = '';
    let maxDiff = 0;
    
    Object.keys(fiveStages).forEach(stage => {
        const diff = Math.abs(fiveStages[stage] - competitorStages[stage]);
        stageDiffs[stage] = diff;
        if (diff > maxDiff) {
            maxDiff = diff;
            maxDiffStage = stage;
        }
    });
    
    console.log('\n关键指标:');
    console.log('  时间差:', timeDiff.toFixed(2), '小时');
    console.log('  与竞品差值最大的环节:', maxDiffStage, '(差值:', maxDiff.toFixed(2), '小时)');
    
    // 8. 读取并修改 PPT 模板
    console.log('\n正在读取 PPT 模板...');
    const templateBuffer = fs.readFileSync(templateFile);
    const zip = await JSZip.loadAsync(templateBuffer);
    
    // 读取幻灯片 XML
    const slideFile = 'ppt/slides/slide1.xml';
    let slideContent = await zip.files[slideFile].async('string');
    
    // 格式化城市名称（去除"市"后缀）
    const formatCity = (city) => {
        if (!city) return '';
        return city.replace(/市/g, '');
    };
    
    // 根据线路名称格式提取城市
    let originCity, destCity;
    if (parts.length === 1) {
        // 没有连字符的格式：滨州市晋城市
        const routeStr = parts[0];
        // 查找第一个"市"字，分割收寄市和投递市
        const cityIndex = routeStr.indexOf('市');
        if (cityIndex > 0) {
            originCity = formatCity(routeStr.substring(0, cityIndex + 1));
            destCity = formatCity(routeStr.substring(cityIndex + 1));
        } else {
            originCity = formatCity(routeStr);
            destCity = '未知';
        }
    } else {
        originCity = formatCity(parts[0]);
        destCity = formatCity(parts[1]);
    }
    
    const routeDisplayName = originCity + '—' + destCity;
    
    // 替换模板中的文本
    // 1. 替换线路名称（哈尔滨—伊春 → 北京—上海）
    slideContent = slideContent.replace(/哈尔滨/g, originCity);
    slideContent = slideContent.replace(/伊春/g, destCity);
    
    // 2. 替换时限数据
    // 模板中的原始数据：
    // 特快总时限：30.1
    // 竞品总时限：21.4
    // 差异：8.7
    // 进口差异：4.7
    // 特快各环节：2.2, 8.6, 6.9, 7.9, 4.5
    // 竞品各环节：2.4, 6.6, 6.5, 3.2, 2.6
    
    // 替换总时限（只替换第一个）
    slideContent = slideContent.replace(/30\.1/, totalTime.toFixed(1));
    slideContent = slideContent.replace(/21\.4/, competitorTotalTime.toFixed(1));
    slideContent = slideContent.replace(/8\.7/, Math.abs(timeDiff).toFixed(1));
    
    // 替换差异最大的环节名称（仅替换 PPT 上半部分文本框中的"进口段"，只替换一次）
    slideContent = slideContent.replace(/进口段/, maxDiffStage + '段');
    
    // 替换关键环节的差距值（模板中 4.7 是进口段差距，需要替换为实际最大差距环节的差距值）
    const maxDiffValue = Math.abs(fiveStages[maxDiffStage] - competitorStages[maxDiffStage]).toFixed(1);
    slideContent = slideContent.replace(/4\.7/, maxDiffValue);
    
    // 替换各环节数据 - 使用精确的 XML 标签匹配
    // 特快数据
    slideContent = slideContent.replace(/(<a:t>)2\.2(<\/a:t>)/, '$1' + fiveStages['收寄'].toFixed(1) + '$2');
    slideContent = slideContent.replace(/(<a:t>)8\.6(<\/a:t>)/, '$1' + fiveStages['出口'].toFixed(1) + '$2');
    slideContent = slideContent.replace(/(<a:t>)6\.9(<\/a:t>)/, '$1' + fiveStages['中转'].toFixed(1) + '$2');
    slideContent = slideContent.replace(/(<a:t>)7\.9(<\/a:t>)/, '$1' + fiveStages['进口'].toFixed(1) + '$2');
    slideContent = slideContent.replace(/(<a:t>)4\.5(<\/a:t>)/, '$1' + fiveStages['投递'].toFixed(1) + '$2');
    
    // 竞品数据
    slideContent = slideContent.replace(/(<a:t>)2\.4(<\/a:t>)/, '$1' + competitorStages['收寄'].toFixed(1) + '$2');
    slideContent = slideContent.replace(/(<a:t>)6\.6(<\/a:t>)/, '$1' + competitorStages['出口'].toFixed(1) + '$2');
    slideContent = slideContent.replace(/(<a:t>)6\.5(<\/a:t>)/, '$1' + competitorStages['中转'].toFixed(1) + '$2');
    slideContent = slideContent.replace(/(<a:t>)3\.2(<\/a:t>)/, '$1' + competitorStages['进口'].toFixed(1) + '$2');
    slideContent = slideContent.replace(/(<a:t>)2\.6(<\/a:t>)/, '$1' + competitorStages['投递'].toFixed(1) + '$2');
    
    // 更新幻灯片内容
    zip.file(slideFile, slideContent);
    
    // 保存修改后的 PPT
    console.log('正在保存 PPT 文件...');
    const outputBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE'
    });
    
    fs.writeFileSync(outputFile, outputBuffer);
    console.log('\nPPT 文件已保存至:', outputFile);
    
    // 9. 生成分析结果摘要 PDF
    const summaryPdfFile = path.join(outputDir, '线路五环节时限对标分析结果摘要_' + routeName + '_' + timestamp + '.pdf');
    console.log('\n正在生成分析结果摘要 PDF...');
    
    const stages = ['收寄', '出口', '中转', '进口', '投递'];

    let stageRows = '';
    stages.forEach((stage) => {
        const myTime = fiveStages[stage];
        const competitorTime = competitorStages[stage];
        const diff = myTime - competitorTime;
        const isBetter = diff < 0;
        stageRows += `<tr><td>${stage}</td><td>${myTime.toFixed(1)}</td><td>${competitorTime.toFixed(1)}</td><td style="color:${isBetter ? '#00AA00' : '#AA0000'}">${diff > 0 ? '+' : ''}${diff.toFixed(1)}（${isBetter ? '特快领先' : '竞品领先'}）</td></tr>`;
    });

    const summary = `${routeDisplayName}线路整体表现${timeDiff < 0 ? '优异' : '一般'}，总时限${timeDiff < 0 ? '领先' : '落后'}竞品${Math.abs(timeDiff).toFixed(1)}小时。${maxDiffStage}环节是核心竞争优势，领先幅度达${maxDiff.toFixed(1)}小时。建议在保持优势环节的同时，重点关注劣势环节的优化。`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>线路五环节时限对标分析结果</title>
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
.highlight{font-size:18px;font-weight:bold;margin:10px 0}
</style></head><body>
<h1>线路五环节时限对标分析结果</h1>
<p class="info">线路：${routeDisplayName}</p>

<h2>一、总时限对比</h2>
<div class="highlight">
<p>特快总时限：<b>${totalTime.toFixed(1)} 小时</b></p>
<p>竞品总时限：<b>${competitorTotalTime.toFixed(1)} 小时</b></p>
<p>时间差：<b style="color:${timeDiff < 0 ? '#00AA00' : '#AA0000'}">${Math.abs(timeDiff).toFixed(1)} 小时（${timeDiff < 0 ? '特快快' : '竞品快'}）</b></p>
</div>

<h2>二、五环节时限详细对比</h2>
<table>
<tr><th>环节</th><th>特快(h)</th><th>竞品(h)</th><th>差值</th></tr>
${stageRows}
</table>

<h2>三、关键环节</h2>
<p>与竞品差值最大的环节：<b>${maxDiffStage}环节</b></p>
<p>差值：<b style="color:#0066CC">${maxDiff.toFixed(1)} 小时</b></p>

<h2>四、分析总结</h2>
<div class="summary">${summary}</div>
</body></html>`;

    const htmlFile = path.join(outputDir, '线路五环节时限对标分析结果摘要_' + routeName + '_' + timestamp + '.html');
    fs.writeFileSync(htmlFile, html, 'utf8');

    const pdfResult = convertToPdf(htmlFile, outputDir);
    if (pdfResult) {
        fs.unlinkSync(htmlFile);
    } else {
        console.log('LibreOffice转换失败，HTML报告已保存至：' + htmlFile);
    }
    
    console.log('\n分析完成！');
    console.log('\n相关分析已经保存为 PPT 及报告');
    
    return {
        success: true,
        outputFile: outputFile,
        fiveStages: fiveStages,
        competitorStages: competitorStages,
        totalTime: totalTime,
        competitorTotalTime: competitorTotalTime,
        timeDiff: timeDiff
    };
}

// 主程序
const routeName = process.argv[2] || '北京 - 上海';

analyzeRoute(routeName)
    .then(result => {
        console.log('\n分析成功！');
        console.log('输出文件:', result.outputFile);
        process.exit(0);
    })
    .catch(error => {
        console.error('\n分析失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    });
