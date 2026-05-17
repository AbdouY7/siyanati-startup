const http = require('http');

const data = JSON.stringify({ email: 'test@example.com', password: 'password123' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let resData = '';
  res.on('data', (d) => resData += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', resData));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
