import express from 'express';
import authenticateFirebaseToken from '../middlewares/auth';
import { createUser, getUser, updateUser } from '../controllers/usersController';

const router = express.Router();

router.use(express.json());

router.get('/', authenticateFirebaseToken, getUser);
router.put('/', authenticateFirebaseToken, updateUser);

router.post('/join', authenticateFirebaseToken, createUser);

export default router;
