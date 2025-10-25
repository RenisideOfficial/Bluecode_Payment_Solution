// Server is used to bypass web browser CORS policy.

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to handle CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allowed methods
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No content for preflight requests
  }

  next();
});

// Proxy middleware to forward requests to Acquibase API
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://acquibase-api.acq.int.bluecode.ng",
    changeOrigin: true,
    pathRewrite: { "^/api": "" }, // Remove /api prefix when forwarding
    onProxyReq: (proxyReq, req, res) => {
      console.log("Proxy Request:", req.method, req.url); // Log the request
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("Proxy Response:", proxyRes.statusCode); // Log the response
    },
  })
);

// Serve static files from the public directory
app.use(express.static("public"));

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
