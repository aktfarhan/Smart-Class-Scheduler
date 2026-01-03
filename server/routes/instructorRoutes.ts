import { Router } from 'express';
import { getInstructors } from '../controllers/instructorController';

const router = Router();

router.get('/', getInstructors);

export default router;
