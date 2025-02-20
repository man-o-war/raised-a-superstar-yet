export interface PlanActivityInput {
  activityId: number;
}

export interface PlanDayInput {
  dayNumber: number;
  activities: PlanActivityInput[];
}

export interface CreatePlanInput {
  name: string;
  totalDays: number;
  planDays: PlanDayInput[];
}
