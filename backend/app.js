import express from 'express';
import cookieParser from 'cookie-parser';
import authRoute from './src/route/auth.route.js';
import articleRoute from './src/route/article.route.js';
import { authenticated } from './src/middleware/auth.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World! AI SaaS API is running.');
});

app.use('/api/auth', authRoute);app.use('/api/article', articleRoute);

export default app;