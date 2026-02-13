import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createList,
  updateList,
  deleteList,
  reorderLists
} from '../controllers/list.controller';

const router = Router();

// All routes are protected with JWT authentication
router.use(authenticateToken);

// POST /api/boards/:boardId/lists - Create list in board
router.post('/boards/:boardId/lists', createList);

// PUT /api/lists/:id - Update list title
router.put('/lists/:id', updateList);

// DELETE /api/lists/:id - Delete list
router.delete('/lists/:id', deleteList);

// PUT /api/lists/reorder - Reorder multiple lists
router.put('/lists/reorder', reorderLists);

export default router;
