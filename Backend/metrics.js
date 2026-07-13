const client = require('prom-client');

// Create a registry and enable default Node.js metrics (memory, CPU, event loop)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Metric 1 — HTTP request counter
// Labels: method (GET/POST/PUT/DELETE), route (e.g. /products), status_code (200/422/500)
const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

// Metric 2 — Product CRUD operation counter
// Labels: operation (create/read/update/delete)
const productOperationsTotal = new client.Counter({
    name: 'product_operations_total',
    help: 'Total number of product CRUD operations',
    labelNames: ['operation'],
    registers: [register],
});

// Middleware — increments http_requests_total after every response
function httpMetricsMiddleware(req, res, next) {
    res.on('finish', () => {
        // Normalize dynamic route params like /products/123 → /products/:id
        const route = req.route ? req.baseUrl + req.route.path : req.path;
        httpRequestsTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode,
        });
    });
    next();
}

module.exports = { register, httpMetricsMiddleware, productOperationsTotal };
