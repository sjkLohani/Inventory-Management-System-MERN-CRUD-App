const connectToMongo = require('./db')
connectToMongo();

const express = require('express')
const app = express()
const port = process.env.PORT || 5000

const cors = require('cors')
const router = require('./Routes/router')
const { register, httpMetricsMiddleware } = require('./metrics')

app.use(cors());
app.use(express.json());

// Collect HTTP metrics on every request
app.use(httpMetricsMiddleware);

// Expose /metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.use(router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
