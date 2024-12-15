import express from 'express';
//import authenticateFirebaseToken from '../middlewares/auth';
import { addVoca, getAllVoca, getVocaByDayList, getVocaByDay } from '../controllers/vocaController';

const router = express.Router();

router.use(express.json());

router.post('/add', addVoca);

router.get('/:userid', authenticateFirebaseToken, getAllVoca);
router.get('/:userid/list', authenticateFirebaseToken, getVocaByDayList);
router.get('/:userid/list/:createdAt', authenticateFirebaseToken, getVocaByDay);

export default router;
