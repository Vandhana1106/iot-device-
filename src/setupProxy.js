const response = await fetch("http://pinesphere.pinesphere.co.in/api/user_login/", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
});

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://oceanatlantic.pinesphere.co.in',
      changeOrigin: true,
    })
  );
};