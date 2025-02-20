import { Request, Response, NextFunction } from 'express';

export const activityValidation = {
  validateCreate: (req: Request, res: Response, next: NextFunction): void => {
    const { taskName, category } = req.body;
    
    const errors: string[] = [];

    // Required fields
    if (!taskName) errors.push('taskName is required');
    if (!category) errors.push('category is required');
    
    // String validations
    if (taskName && typeof taskName !== 'string') errors.push('taskName must be a string');
    if (category && typeof category !== 'string') errors.push('category must be a string');
    
    // Number validations
    if (req.body.maxFrequency && typeof req.body.maxFrequency !== 'number') {
      errors.push('maxFrequency must be a number');
    }
    if (req.body.maxTime && typeof req.body.maxTime !== 'number') {
      errors.push('maxTime must be a number');
    }

    // Unit validations
    const validUnits = ['per_day', 'per_week', 'seconds', 'minutes', 'hours'];
    if (req.body.maxFrequencyUnit && !validUnits.includes(req.body.maxFrequencyUnit)) {
      errors.push('Invalid maxFrequencyUnit');
    }
    if (req.body.maxTimeUnit && !validUnits.includes(req.body.maxTimeUnit)) {
      errors.push('Invalid maxTimeUnit');
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
  }
};
