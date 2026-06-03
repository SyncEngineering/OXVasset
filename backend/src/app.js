import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount all routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
