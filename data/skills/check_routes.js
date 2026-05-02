const xlsx = require('xlsx');
const path = require('path');

const dataFile = path.join(__dirname, 'data/寄递时限对标分析指标大全.xlsx');
const workbook = xlsx.readFile(dataFile);

console.log('可用的 Sheet:', workbook.SheetNames);

// 查找线路表
const routeSheetName = workbook.SheetNames.find(name => name.includes('线路'));
console.log('\n线路相关的 Sheet:', routeSheetName);

if (routeSheetName) {
    const sheet = workbook.Sheets[routeSheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log('\n表头:', data[0]);
    console.log('数据行数:', data.length);
    
    // 显示前 5 条线路
    console.log('\n前 5 条线路数据:');
    for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
        console.log(`  ${i}. ${data[i][6] || data[i][0]}`);
    }
    
    // 查找包含"滨州"或"大同"的线路
    console.log('\n包含"滨州"或"大同"的线路:');
    const matchingRoutes = data.slice(1).filter(row => {
        const route = String(row[6] || row[0] || '');
        return route.includes('滨州') || route.includes('大同');
    });
    
    matchingRoutes.forEach(row => {
        console.log(`  - ${row[6] || row[0]}`);
    });
}
