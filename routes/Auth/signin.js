import express from 'express';
import { signIn } from '../../Controller/signInController.js';

const router = express.Router();

router.post('/', signIn);

export default router;