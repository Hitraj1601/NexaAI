import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoute from './src/route/auth.route.js';
import articleRoute from './src/route/article.route.js';
import blogtitleRoute from './src/route/blogtitle.route.js';
import imageRoute from './src/route/imgae.route.js';
import removeBGRoute from './src/route/removeBG.route.js';
import profileRoute from './src/route/profile.route.js';
const app = express();

// CORS must be registered before routes are mounted so preflight (OPTIONS)
// requests are handled and proper Access-Control-* headers are sent.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
}));

console.log("🔍 CORS configured for origins:", [FRONTEND_URL, 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173']);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World! AI SaaS API is running.');
});

app.use('/api/auth', authRoute);
app.use('/api/article', articleRoute);
app.use('/api/blogtitle', blogtitleRoute);
app.use('/api/image', imageRoute);
app.use('/api/background', removeBGRoute);
app.use('/api/user', profileRoute);

// Centralized error handler — must be registered after all routes
import ApiError from './src/utils/ApiError.js';

app.use((err, req, res, next) => {
    // Log error server-side for debugging
    console.error(err && err.stack ? err.stack : err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode || 500).json({
            status: 'error',
            statusCode: err.statusCode || 500,
            message: err.message || 'Internal Server Error',
        });
    }

    // For other errors, send generic message in production
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: err?.message || 'Internal Server Error'
    });
});

export default app;