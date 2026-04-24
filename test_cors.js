const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8002,
  path: '/api/v1/datasource/list',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:8504'
  }
};

const req = http.request(options, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应数据:', data);
  });
});

req.on('error', (e) => {
  console.error('请求失败:', e.message);
});

req.end();