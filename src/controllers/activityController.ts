import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const activityController = {
  // CREATE
  async create(req: Request, res: Response) {
    try {
      const activity = await prisma.activity.create({
        data: {
          taskName: req.body.taskName,
          category: req.body.category,
          maxFrequency: req.body.maxFrequency || null,
          maxFrequencyUnit: req.body.maxFrequencyUnit || null,
          maxTime: req.body.maxTime || null,
          maxTimeUnit: req.body.maxTimeUnit || null,
        },
      });
      res.status(201).json({
        success: true,
        data: activity
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({ 
          success: false,
          error: 'Database error',
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Internal server error' 
        });
      }
    }
  },
  // DELETE
  async deleteActivity(req: Request, res: Response): Promise<void> {
    try {
      const activityId = Number(req.params.id);
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
      });
      
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }
      // First check if activity is mapped to any plan
      const activityInUse = await prisma.planDayActivity.findFirst({
        where: {
          activityId: activityId
        },
        include: {
          planDay: {
            include: {
              plan: true
            }
          }
        }
      });
  
      // If activity is in use, return error with details
      if (activityInUse) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete activity as it is mapped to a plan',
          details: {
            planId: activityInUse.planDay.planId,
            planName: activityInUse.planDay.plan.name,
            dayNumber: activityInUse.planDay.dayNumber
          }
        });
        return;
      }
  
      // If activity is not in use, proceed with deletion
      await prisma.activity.delete({
        where: {
          id: activityId
        }
      });
  
      res.json({
        success: true,
        message: 'Activity deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete activity'
      });
    }
  },

  // GET
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const activities = await prisma.activity.findMany();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: Number(req.params.id) },
      });
      
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch activity' });
    }
  },

  // UPDATE
  async update(req: Request, res: Response) {
    try {
      const activity = await prisma.activity.update({
        where: { id: Number(req.params.id) },
        data: {
          taskName: req.body.taskName,
          category: req.body.category,
          maxFrequency: req.body.maxFrequency,
          maxFrequencyUnit: req.body.maxFrequencyUnit,
          maxTime: req.body.maxTime,
          maxTimeUnit: req.body.maxTimeUnit,
        },
      });
      res.json(activity);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update activity' });
    }
  },
};
