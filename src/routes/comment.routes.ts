import { Router } from 'express';
import { createComment, deleteComment } from '../controllers/comment.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.post('/cards/:cardId/comments', createComment);
router.delete('/comments/:id', deleteComment);

export default router;
