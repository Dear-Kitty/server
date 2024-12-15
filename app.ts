import express, { Application } from 'express';
import dotenv from 'dotenv';
import usersRouter from './src/routes/users';
import vocaRouter from './src/routes/voca';
import chatRouter from './src/routes/chat';

dotenv.config();

const app: Application = express();

app.use(express.json());

app.use('/chat', chatRouter);
app.use('/users', usersRouter);
app.use('/voca', vocaRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
