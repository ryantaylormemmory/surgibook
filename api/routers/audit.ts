import { z } from "zod";
import { desc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { auditLogs } from "@db/schema";

export const auditRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(500);
  }),

  log: publicQuery
    .input(
      z.object({
        action: z.string().min(1),
        details: z.string().optional(),
        userName: z.string().min(1),
        userRole: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(auditLogs).values({
        action: input.action,
        details: input.details ?? null,
        userName: input.userName,
        userRole: input.userRole,
        timestamp: new Date(),
      });
      return { id: Number(result[0].insertId) };
    }),

  clear: publicQuery.mutation(async () => {
    const db = getDb();
    await db.delete(auditLogs);
    return { success: true };
  }),
});
