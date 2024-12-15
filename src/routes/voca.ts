import express from 'express';
import authenticateFirebaseToken from '../middlewares/auth';
import { addVoca, getAllVoca, getVocaByDateList, getVocaByDate } from '../controllers/vocaController';

const router = express.Router();

router.use(express.json());

router.post('/', addVoca);

router.get('/', authenticateFirebaseToken, getAllVoca);
router.get('/list', authenticateFirebaseToken, getVocaByDateList);
router.get('/list/:created_at', authenticateFirebaseToken, getVocaByDate);

export default router;
