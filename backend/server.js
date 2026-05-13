import 'dotenv/config';
import app from './app.js';
import connectDB from './src/db/db.js';

// Connect to database first
connectDB();

const PORT = process.env.PORT || 3000;

// Only listen if not running on Vercel (Vercel uses Serverless Functions)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default app;