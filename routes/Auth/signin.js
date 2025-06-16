import express from 'express';
import { signIn } from '../../Controller/signInController.js';

const router = express.Router();

router.post('/signIn', signIn);

export default router;