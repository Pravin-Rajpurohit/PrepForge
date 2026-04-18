import express from 'express';
import { startSession, submitSession, getSessionById, getSessionHistory } from '../controllers/sessionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/start', auth, startSession);
router.post('/:id/submit', auth, submitSession);
router.get('/history', auth, getSessionHistory);
router.get('/:id', auth, getSessionById);

export default router;
