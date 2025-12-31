import cors from 'cors';
import type { Application } from 'express';
import express from 'express';

import dotenv from 'dotenv';
import { requestLogger } from './utils/logger.ts';

import connectDB from './configs/mongoDB.ts';
import baseRouter from './routes/base.ts';


const app: Application = express();

// Database connection
connectDB(); // TODO: Uncomment this line if you want to connect to the database on app start

dotenv.config({path: '.env'});

app.use(express.json());
app.use(requestLogger);
app.use(
  cors({
    origin: [
      // 'https://prod.example.com', // prod
      'http://localhost:5173', // dev
      'http://localhost:3000', // dev
    ],
    credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/', baseRouter);


export default app;