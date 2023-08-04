// Proxy to make replicate api work in the browser w/ cors
const proxy = require('http-proxy-middleware');

module.exports = function expressMiddleware(router) {
  router.use(
    proxy.createProxyMiddleware('/trpc', {
      //   secure: false,
      target: process.env.PUBLIC_API_HTTP_SERVER_URL,
      changeOrigin: true,
      onProxyReq(proxyReq, req) {
        console.log(req.url);
        proxyReq.setHeader('Host', `localhost:4400`);
        proxyReq.removeHeader('origin');
        console.log(proxyReq.url);
      },
    })
  );
};
