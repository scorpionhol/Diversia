import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { initDb } from './config/mysql.js';

const app = express();
const PORT = process.env.PORT || 4000;

dotenv.config();

const requiredEnv = ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// try initialize DB pool (non-blocking)
initDb().then((pool) => {
	if (pool) console.log('DB pool initialized');
}).catch(() => {});

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Diversia backend running' }));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
