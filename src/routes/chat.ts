import express from 'express';
import authenticateFirebaseToken from '../middlewares/auth';
import { createThread, chat, getChatList, getChatDetail } from '../controllers/chatController';

const router = express.Router();

router.use(express.json());

router.get('/', authenticateFirebaseToken, chat);
router.get('/history', authenticateFirebaseToken, getChatList);
router.get('/history/:id', authenticateFirebaseToken, getChatDetail);

router.post('/', authenticateFirebaseToken, createThread);

export default router;
