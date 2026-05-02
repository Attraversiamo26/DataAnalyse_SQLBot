const xlsx = require('xlsx');
const path = require('path');

const excelFile = path.join(__dirname, '../data/寄递时限对标分析指标大全.xlsx');
const workbook = xlsx.readFile(excelFile);

console.log('Excel 文件中的所有 Sheet:');
workbook.SheetNames.forEach((name, index) => {
    console.log(`  [${index}] ${name}`);
});

console.log('\n第 5 个 Sheet (索引 4):', workbook.SheetNames[4]);
console.log('包含"线路"的 Sheet:', workbook.SheetNames.filter(name => name.includes('线路')));
