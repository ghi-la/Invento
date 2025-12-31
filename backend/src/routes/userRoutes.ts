import express from 'express';
import {
  checkStatus,
  getAllUsers,
  login,
  logout,
  register,
} from '../controllers/userController.ts';

const router = express.Router();

// Public routes (no auth required)
router.post('/register', register);
router.post('/login', login);
router.get('/checkStatus', checkStatus);
router.post('/logout', logout);

router.get('/', (_req, res) => {
  res.send('User routes!');
});

router.get('/getAll', getAllUsers);

export default router;
