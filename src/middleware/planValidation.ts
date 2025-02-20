import { Request, Response, NextFunction } from 'express';

export const planValidation = {
  validateCreate: (req: Request, res: Response, next: NextFunction): void => {
    const { name, totalDays, planDays } = req.body;
    const errors: string[] = [];

    // Basic validations
    if (!name || typeof name !== 'string') errors.push('Valid plan name is required');
    if (!totalDays || typeof totalDays !== 'number' || totalDays <= 0) {
      errors.push('Valid totalDays is required');
    }

    // Validate plan days
    if (!Array.isArray(planDays)) {
      errors.push('planDays must be an array');
    } else {
      // Check if days match totalDays
      if (planDays.length !== totalDays) {
        errors.push('Number of plan days must match totalDays');
      }

      // Validate each day
      planDays.forEach((day, index) => {
        if (!day.dayNumber || day.dayNumber !== index + 1) {
          errors.push(`Invalid day number for day ${index + 1}`);
        }
        if (!Array.isArray(day.activities)) {
          errors.push(`Activities for day ${day.dayNumber} must be an array`);
        }
      });
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    next();
  },

  validateId: (req: Request, res: Response, next: NextFunction): void => {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid ID parameter' });
      return;
    }

    next();
  },

  validateDayNumber: (req: Request, res: Response, next: NextFunction): void => {
    const dayNumber = Number(req.params.dayNumber);
    
    if (isNaN(dayNumber) || dayNumber <= 0) {
      res.status(400).json({ error: 'Invalid Day Number' });
      return;
    }

    next();
  },

  validatePlanNameUpdate : (req: Request, res: Response, next: NextFunction): void => {
    const { name } = req.body;
    const errors: string[] = [];
  
    if (!name) {
      errors.push('Plan name is required');
    } else if (typeof name !== 'string') {
      errors.push('Plan name must be a string');
    } else if (name.trim().length < 3) {
      errors.push('Plan name must be at least 3 characters long');
    }
  
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }
  
    next();
  }
};
