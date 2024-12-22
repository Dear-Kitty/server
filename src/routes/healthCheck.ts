import { Router } from 'express';
import { sendStatus } from '../controllers/healthCheckController';

const router = Router();

router.get('/', sendStatus);

export default router;
