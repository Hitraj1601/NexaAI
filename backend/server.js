import 'dotenv/config';
import app from './app.js';
import connectDB from './src/db/db.js';

// Connect to database first
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});