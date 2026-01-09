import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const updateStreak = async (userId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 1. Find or Create the streak record
  let streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    return await prisma.streak.create({
      data: {
        userId,
        currentCount: 1,
        longestStreak: 1,
        lastActivityAt: new Date(),
      },
    });
  }

  const lastActivity = new Date(streak.lastActivityAt);
  lastActivity.setHours(0, 0, 0, 0);

  // 2. Determine Action
  if (lastActivity.getTime() === today.getTime()) {
    // Already active today, do nothing
    return streak;
  } else if (lastActivity.getTime() === yesterday.getTime()) {
    // Consecutive day! Increment
    const newCount = streak.currentCount + 1;
    return await prisma.streak.update({
      where: { userId },
      data: {
        currentCount: newCount,
        longestStreak: Math.max(newCount, streak.longestStreak),
        lastActivityAt: new Date(),
      },
    });
  } else {
    // Missed a day or more. Reset to 1
    return await prisma.streak.update({
      where: { userId },
      data: {
        currentCount: 1,
        lastActivityAt: new Date(),
      },
    });
  }
};
export const getUserStreak = async (user_id) => {
  try {
    const streak = await prisma.streak.findUnique({
      where: { userId: user_id },
    });

    if (!streak) return { currentCount: 0 };

    // Check if the streak expired (user didn't post yesterday or today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = new Date(streak.lastActivityAt);
    lastActivity.setHours(0, 0, 0, 0);

    const diffInDays =
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays > 1) {
      // Streak expired since last check
      return { currentCount: 0, message: "Streak lost" };
    }

    return streak;
  } catch (error) {
    return { message: "Error fetching streak" };
  }
};
