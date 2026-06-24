import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import http from 'http';

const targetApp = express();

targetApp.use((req, res, next) => {
  console.log(`[Target] Method: ${req.method}, Path: ${req.path}, OriginalUrl: ${req.originalUrl}, Query:`, req.query);
  if (req.path === '/api/games/image/proxy') {
    res.send('Proxy route matched!');
  } else {
    res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
  }
});

const proxyApp = express();

proxyApp.use('/api/games', createProxyMiddleware({
  target: 'http://localhost:6001',
  changeOrigin: true,
  pathRewrite: (_path, req) => req.originalUrl
}));

const serverTarget = http.createServer(targetApp).listen(6001, () => {
  const serverProxy = http.createServer(proxyApp).listen(6000, () => {
    http.get('http://localhost:6000/api/games/image/proxy?url=http%3A%2F%2Fexample.com', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[Response] Status: ${res.statusCode}, Body: ${data}`);
        serverTarget.close();
        serverProxy.close();
      });
    });
  });
});
