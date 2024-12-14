import express from 'express';
import authenticateFirebaseToken from '../middlewares/auth';
import { addVoca, getAllVoca, getVocaList, getVocaCreatedAt } from '../controllers/vocaController';

const router = express.Router();

router.use(express.json());

router.post('/add', authenticateFirebaseToken, addVoca);

router.get('/all', authenticateFirebaseToken, getAllVoca);
router.get('/list', authenticateFirebaseToken, getVocaList);
router.get('/list/{createdAt}', authenticateFirebaseToken, getVocaCreatedAt);

export default router;
