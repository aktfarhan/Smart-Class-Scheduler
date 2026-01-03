import { Router } from 'express';
import { getSections } from '../controllers/sectionController';

const router = Router();

router.get('/', getSections);

export default router;
