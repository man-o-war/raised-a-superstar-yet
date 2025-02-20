import express from 'express';
import { planController } from '../controllers/planController';
import { planValidation } from '../middleware/planValidation';

const router = express.Router();

router.post('/', planValidation.validateCreate, planController.create);
router.get('/', planController.getAll);
router.get('/:id', planValidation.validateId, planController.getById);
router.get('/:id/activities', planValidation.validateId, planController.getPlanWithActivities);
router.get('/:id/day/:dayNumber', [planValidation.validateId, planValidation.validateDayNumber], planController.getPlanDayActivities);
router.put('/:id/day/:dayNumber/activities', [planValidation.validateId, planValidation.validateDayNumber], planController.updatePlanDayActivities);
router.patch('/:id/name', [planValidation.validateId, planValidation.validatePlanNameUpdate], planController.updatePlanName);
router.delete('/:id', planValidation.validateId, planController.deletePlan);

export default router;
