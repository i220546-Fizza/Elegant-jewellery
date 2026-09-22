import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUserById);

export default router;
