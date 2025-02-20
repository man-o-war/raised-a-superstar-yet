import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreatePlanInput, PlanDayInput, PlanActivityInput } from '../types/plan.types';

const prisma = new PrismaClient();

export const planController = {

  // CREATE
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, totalDays, planDays }: CreatePlanInput = req.body;
  
      // First validate if all activity IDs exist
      const activityIds = new Set(
        planDays.flatMap(day => day.activities.map(activity => activity.activityId))
      );
  
      const existingActivities = await prisma.activity.findMany({
        where: {
          id: {
            in: Array.from(activityIds)
          }
        },
        select: { id: true }
      });
  
      const existingActivityIds = new Set(existingActivities.map(a => a.id));
      const invalidActivityIds = Array.from(activityIds).filter(id => !existingActivityIds.has(id));
  
      if (invalidActivityIds.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid activity IDs found',
          details: {
            invalidActivityIds,
            message: `Activities with IDs ${invalidActivityIds.join(', ')} do not exist`
          }
        });
        return;
      }
  
      // Validate day numbers
      const invalidDays = planDays.filter(day => 
        day.dayNumber < 1 || 
        day.dayNumber > totalDays || 
        day.dayNumber !== Math.floor(day.dayNumber)
      );
  
      if (invalidDays.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid day numbers found',
          details: {
            invalidDays: invalidDays.map(day => day.dayNumber),
            message: 'Day numbers must be positive integers within total days range'
          }
        });
        return;
      }
  
      // Check for duplicate day numbers
      const dayNumbers = planDays.map(day => day.dayNumber);
      const hasDuplicateDays = new Set(dayNumbers).size !== dayNumbers.length;
      
      if (hasDuplicateDays) {
        res.status(400).json({
          success: false,
          error: 'Duplicate day numbers found',
          details: {
            message: 'Each day number must be unique within the plan'
          }
        });
        return;
      }
  
      const plan = await prisma.$transaction(async (tx) => {
        const newPlan = await tx.plan.create({
          data: {
            name,
            totalDays,
            planDays: {
              create: planDays.map((day: PlanDayInput) => ({
                dayNumber: day.dayNumber,
                activities: {
                  create: day.activities.map((activity: PlanActivityInput) => ({
                    activity: {
                      connect: { id: activity.activityId }
                    }
                  }))
                }
              }))
            }
          },
          include: {
            planDays: {
              include: {
                activities: {
                  include: {
                    activity: true
                  }
                }
              }
            }
          }
        });
        
        return newPlan;
      });
  
      res.status(201).json({
        success: true,
        data: plan
      });
    } catch (error: any) { 
      console.error('Plan creation error:', error);
      
      if (error?.code) {
        if (error.code === 'P2002') {
          res.status(400).json({
            success: false,
            error: 'Duplicate plan name or constraint violation'
          });
        } else if (error.code === 'P2003') {
          res.status(400).json({
            success: false,
            error: 'Foreign key constraint failed',
            details: {
              message: 'Referenced activity or plan does not exist'
            }
          });
        }
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create plan',
          details: {
            message: 'An unexpected error occurred while creating the plan'
          }
        });
      }
    }
  },

  // UPDATE
  async updatePlanDayActivities(req: Request, res: Response): Promise<void> {
    try {
      const planId = Number(req.params.id);
      const dayNumber = Number(req.params.dayNumber);
      const { activities }: { activities: { activityId: number }[] } = req.body;
  
      // First verify the plan and day exist
      const planDay = await prisma.planDay.findFirst({
        where: {
          planId: planId,
          dayNumber: dayNumber
        }
      });
  
      if (!planDay) {
        res.status(404).json({
          success: false,
          error: 'Plan day not found'
        });
        return;
      }
  
      const updatedPlanDay = await prisma.$transaction(async (tx) => {
        // Delete existing activities for this day
        await tx.planDayActivity.deleteMany({
          where: {
            planDayId: planDay.id
          }
        });
  
        // Create new activity mappings
        const newActivities = await tx.planDayActivity.createMany({
          data: activities.map(activity => ({
            planDayId: planDay.id,
            activityId: activity.activityId
          }))
        });
  
        // Return updated day with new activities
        return tx.planDay.findUnique({
          where: { id: planDay.id },
          include: {
            activities: {
              include: {
                activity: true
              }
            }
          }
        });
      });
  
      res.json({
        success: true,
        data: updatedPlanDay
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update plan day activities'
      });
    }
  },

  async updatePlanName(req: Request, res: Response): Promise<void> {
    try {
      const planId = Number(req.params.id);
      const { name } = req.body;
      
      const plan = await prisma.plan.findFirst({
        where: {
          id: planId,
        }
      });
  
      if (!plan) {
        res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
        return;
      }


      const updatedPlan = await prisma.plan.update({
        where: { id: planId },
        data: { name },
        select: {
          id: true,
          name: true,
          totalDays: true
        }
      });
  
      res.json({
        success: true,
        data: updatedPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update plan name'
      });
    }
  },

  // DELETE
  async deletePlan(req: Request, res: Response): Promise<void> {
    try {
      const planId = Number(req.params.id);
            
      const plan = await prisma.plan.findFirst({
        where: {
          id: planId,
        }
      });
  
      if (!plan) {
        res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
        return;
      }
      await prisma.$transaction(async (tx) => {
        // First find all planDays for this plan
        const planDays = await tx.planDay.findMany({
          where: { planId }
        });
  
        // Delete all activity mappings for each day
        for (const day of planDays) {
          await tx.planDayActivity.deleteMany({
            where: { planDayId: day.id }
          });
        }
  
        // Delete all plan days
        await tx.planDay.deleteMany({
          where: { planId }
        });
  
        // Finally delete the plan
        await tx.plan.delete({
          where: { id: planId }
        });
      });
  
      res.json({
        success: true,
        message: 'Plan and all associated data deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete plan'
      });
    }
  },

  // GET
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const plans = await prisma.plan.findMany({
        select: {
          id: true,
          name: true,
          totalDays: true
        }
      });
      
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch plans'
      });
    }
  },
  
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const plan = await prisma.plan.findUnique({
        where: { id: Number(req.params.id) },
        select: {
          id: true,
          name: true,
          totalDays: true
        }
      });
      
      if (!plan) {
        res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch plan'
      });
    }
  },
  
  async getPlanWithActivities(req: Request, res: Response): Promise<void> {
    try {
      const plan = await prisma.plan.findUnique({
        where: { id: Number(req.params.id) },
        include: {
          planDays: {
            orderBy: {
              dayNumber: 'asc'
            },
            include: {
              activities: {
                include: {
                  activity: true
                }
              }
            }
          }
        }
      });
      
      if (!plan) {
        res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch plan with activities'
      });
    }
  },
  async getPlanDayActivities(req: Request, res: Response): Promise<void> {
    try {
      const planId = Number(req.params.id);
      const dayNumber = Number(req.params.dayNumber);
  
      const planDay = await prisma.planDay.findFirst({
        where: {
          planId: planId,
          dayNumber: dayNumber
        },
        include: {
          activities: {
            include: {
              activity: true
            }
          },
          plan: {
            select: {
              name: true
            }
          }
        }
      });
  
      if (!planDay) {
        res.status(404).json({
          success: false,
          error: `No activities found for day ${dayNumber} in plan ${planId}`
        });
        return;
      }
  
      res.json({
        success: true,
        data: {
          planName: planDay.plan.name,
          dayNumber: planDay.dayNumber,
          activities: planDay.activities.map(pa => pa.activity)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch day activities'
      });
    }
  }
};
