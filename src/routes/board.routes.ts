import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  inviteMember,
  removeMember
} from '../controllers/board.controller';

const router = Router();

// All routes are protected with JWT authentication
router.use(authenticateToken);

// GET /api/boards - Get all user's boards
router.get('/', getAllBoards);

// POST /api/boards - Create new board
router.post('/', createBoard);

// GET /api/boards/:id - Get single board with lists and cards
router.get('/:id', getBoardById);

// PUT /api/boards/:id - Update board
router.put('/:id', updateBoard);

// DELETE /api/boards/:id - Delete board
router.delete('/:id', deleteBoard);

router.post('/:id/members', inviteMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
