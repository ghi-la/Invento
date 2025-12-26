import express from 'express';
import { fakeLogin } from '../controllers/userController.ts';
import authMiddleware from '../middlewares/authMiddleware.ts';
import userRoutes from './userRoutes.ts';

const router = express.Router();

router.get('/', (_req, res) => {
  res.send('Hello, World!');
});

router.get('/status', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.use('/user', userRoutes);

router.post('/fake-login', fakeLogin);

router.get('/protected', authMiddleware, (req:any, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

export default router;
