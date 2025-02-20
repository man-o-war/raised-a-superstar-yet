import express from 'express';
import { activityController } from '../controllers/activityController';
import { activityValidation } from '../middleware/activityValidation';

const router = express.Router();

router.post('/', activityValidation.validateCreate, activityController.create);
router.get('/', activityController.getAll);
router.get('/:id', activityValidation.validateId, activityController.getById);
router.put('/:id', [activityValidation.validateId, activityValidation.validateCreate], activityController.update);
router.delete('/:id', activityValidation.validateId, activityController.deleteActivity)

export default router;
