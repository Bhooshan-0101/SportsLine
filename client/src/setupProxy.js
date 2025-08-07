const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api', // Keep the /api prefix when forwarding
      },
      timeout: 30000,
      proxyTimeout: 30000,
      pathRewrite: {
        '^/api': '/api', // Keep the /api prefix when forwarding
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({
          success: false,
          error: 'Proxy connection failed',
          details: err.message
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.url, '-> http://localhost:5000' + req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Proxy response:', proxyRes.statusCode, req.url);
      }
    })
  );
};
