import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { notifications } from "@db/schema";

export const notificationRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(100);
  }),

  unreadCount: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.read, false));
    return { count: rows[0].count };
  }),

  create: publicQuery
    .input(
      z.object({
        type: z.enum([
          "case_booked",
          "case_completed",
          "priority_changed",
          "in_theatre",
          "edit",
          "system",
        ]),
        title: z.string().min(1),
        message: z.string().min(1),
        caseId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(notifications).values({
        type: input.type,
        title: input.title,
        message: input.message,
        caseId: input.caseId ?? null,
        read: false,
        createdAt: new Date(),
      });
      return { id: Number(result[0].insertId) };
    }),

  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllRead: publicQuery.mutation(async () => {
    const db = getDb();
    await db.update(notifications).set({ read: true });
    return { success: true };
  }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(notifications).where(eq(notifications.id, input.id));
      return { success: true };
    }),
});
