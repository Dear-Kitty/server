import express from 'express';
import authenticateFirebaseToken from '../middlewares/auth';
import { addVoca, getAllVoca, getVocaByDayList, getVocaByDay } from '../controllers/vocaController';

const router = express.Router();

router.use(express.json());

router.post('/add', addVoca);

router.get('/all', authenticateFirebaseToken, getAllVoca);
router.get('/list', authenticateFirebaseToken, getVocaByDayList);
router.get('/list/{createdAt}', authenticateFirebaseToken, getVocaByDay);

export default router;
