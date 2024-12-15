import express from 'express';
import authenticateFirebaseToken from '../middlewares/auth';
import { addVoca, getAllVoca, getVocaByDayList, getVocaByDay } from '../controllers/vocaController';

const router = express.Router();

router.use(express.json());

router.post('/add', addVoca);

router.get('/:user_id', authenticateFirebaseToken, getAllVoca);
router.get('/:user_id/list', authenticateFirebaseToken, getVocaByDayList);
router.get('/:user_id/list/:created_at', authenticateFirebaseToken, getVocaByDay);

export default router;
