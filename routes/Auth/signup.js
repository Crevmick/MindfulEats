import express from 'express';
import { signUp } from '../../Controller/signUpController.js';

const router = express.Router();

router.post('/signUp', signUp);

export default router;