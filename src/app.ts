import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import activityRoutes from './routes/activityRoutes';
import planRoutes from './routes/planRoutes';
// import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// // Routes
app.use('/api/activities', activityRoutes);
app.use('/api/plans', planRoutes);

// // Error handling
// app.use(errorHandler);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
