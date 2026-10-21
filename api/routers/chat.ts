import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { chatMessages } from "@db/schema";

export const chatRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        room: z.enum(["general", "anaesthesia", "surgery"]),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.room, input.room))
        .orderBy(asc(chatMessages.timestamp))
        .limit(200);
    }),

  send: publicQuery
    .input(
      z.object({
        room: z.enum(["general", "anaesthesia", "surgery"]),
        content: z.string().min(1).max(2000),
        senderName: z.string().min(1),
        senderRole: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(chatMessages).values({
        room: input.room,
        content: input.content,
        senderName: input.senderName,
        senderRole: input.senderRole,
        timestamp: new Date(),
      });
      return { id: Number(result[0].insertId) };
    }),
});
