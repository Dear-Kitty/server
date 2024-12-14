import express, { Application } from 'express';
import dotenv from 'dotenv';
import usersRouter from './src/routes/users';
import vocaRouter from './src/routes/voca';

dotenv.config();

const app: Application = express();

app.use(express.json());

app.use('/users', usersRouter);
app.use('/voca', vocaRouter);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
