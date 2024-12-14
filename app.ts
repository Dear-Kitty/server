import express, { Application } from 'express';
import dotenv from 'dotenv';
import usersRouter from './src/routes/users';

dotenv.config();

const app: Application = express();

app.use(express.json());

app.use('/users', usersRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
