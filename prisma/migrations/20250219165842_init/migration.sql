-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "maxFrequency" INTEGER,
    "maxFrequencyUnit" TEXT,
    "maxTime" INTEGER,
    "maxTimeUnit" TEXT
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "totalDays" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PlanDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    CONSTRAINT "PlanDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanDayActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planDayId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PlanDayActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanDayActivity_planDayId_fkey" FOREIGN KEY ("planDayId") REFERENCES "PlanDay" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PlanDay_planId_dayNumber_idx" ON "PlanDay"("planId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PlanDayActivity_planDayId_activityId_key" ON "PlanDayActivity"("planDayId", "activityId");
