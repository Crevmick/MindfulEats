import express from 'express';
import { signUp } from '../../Controller/signUpController';

const router = express.Router();

router.post('/signUp', signUp);

export default router;