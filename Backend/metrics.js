const client = require('prom-client');

// Registry with default Node.js metrics (memory, CPU, event loop, GC)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Metric 1 — HTTP request counter
// Labels: method, route, status_code
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

// Metric 3 — HTTP response duration histogram
// Enables latency percentile panels (p50, p95, p99)
const httpRequestDurationSeconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register],
});

// Middleware — tracks request count and duration, skips /metrics itself
function httpMetricsMiddleware(req, res, next) {
    // Don't track the /metrics scrape endpoint
    if (req.path === '/metrics') return next();

    const end = httpRequestDurationSeconds.startTimer();

    res.on('finish', () => {
        const route = req.route ? req.baseUrl + req.route.path : req.path;
        const labels = {
            method: req.method,
            route,
            status_code: res.statusCode,
        };
        httpRequestsTotal.inc(labels);
        end(labels);
    });
    next();
}

module.exports = { register, httpMetricsMiddleware, productOperationsTotal };
