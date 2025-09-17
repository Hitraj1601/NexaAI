import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import app from './app.js';
import connectDB from './src/db/db.js';

dotenv.config();

connectDB();

app.use(cors());
app.use(express.json());    

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});