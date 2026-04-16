-- CreateEnum
CREATE TYPE "BookingQuestionType" AS ENUM ('short_text', 'long_text', 'select');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('booking_confirmed', 'booking_cancelled', 'booking_rescheduled');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('logged', 'failed');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'rescheduled';

-- DropIndex
DROP INDEX "Availability_userId_dayOfWeek_idx";

-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "scheduleName" TEXT NOT NULL DEFAULT 'Default Schedule';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rescheduledFromId" TEXT;

-- AlterTable
ALTER TABLE "EventType" ADD COLUMN     "bufferAfterMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bufferBeforeMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'bg-blue-500';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeAvailabilitySchedule" TEXT NOT NULL DEFAULT 'Default Schedule',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/New_York';

-- CreateTable
CREATE TABLE "BookingQuestion" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "BookingQuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "optionsJson" TEXT,
    "eventTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAnswer" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingQuestionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DateOverride" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TIME(0),
    "endTime" TIME(0),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DateOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'logged',
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingQuestion_eventTypeId_position_idx" ON "BookingQuestion"("eventTypeId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "BookingAnswer_bookingId_bookingQuestionId_key" ON "BookingAnswer"("bookingId", "bookingQuestionId");

-- CreateIndex
CREATE INDEX "DateOverride_userId_date_idx" ON "DateOverride"("userId", "date");

-- CreateIndex
CREATE INDEX "Availability_userId_scheduleName_dayOfWeek_idx" ON "Availability"("userId", "scheduleName", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingQuestion" ADD CONSTRAINT "BookingQuestion_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAnswer" ADD CONSTRAINT "BookingAnswer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAnswer" ADD CONSTRAINT "BookingAnswer_bookingQuestionId_fkey" FOREIGN KEY ("bookingQuestionId") REFERENCES "BookingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DateOverride" ADD CONSTRAINT "DateOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
