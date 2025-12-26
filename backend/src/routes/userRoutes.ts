import express from 'express';
import { getAllUsers } from '../controllers/userController.ts';

const router = express.Router();


router.get('/', (_req, res) => {
  res.send('User routes!');
});

router.get('/getAll', getAllUsers);

export default router;
