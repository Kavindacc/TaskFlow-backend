import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  moveCard
} from '../controllers/card.controller';

const router = Router();

// All routes are protected with JWT authentication
router.use(authenticateToken);

// POST /api/lists/:listId/cards - Create card in list
router.post('/lists/:listId/cards', createCard);

// GET /api/cards/:id - Get single card
router.get('/cards/:id', getCard);

// PUT /api/cards/:id - Update card
router.put('/cards/:id', updateCard);

// DELETE /api/cards/:id - Delete card
router.delete('/cards/:id', deleteCard);

// PUT /api/cards/:id/move - Move card to different list
router.put('/cards/:id/move', moveCard);

export default router;
