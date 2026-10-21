import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { anaesthetists } from "@db/schema";

export const anaesthetistRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(anaesthetists)
      .orderBy(desc(anaesthetists.loggedAt));
  }),

  getByDate: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(anaesthetists)
        .where(eq(anaesthetists.date, input.date))
        .orderBy(desc(anaesthetists.loggedAt));
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().min(1),
        consultant: z.string().min(1),
        theatre: z.number().int(),
        date: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(anaesthetists).values({
        name: input.name,
        phone: input.phone,
        consultant: input.consultant,
        theatre: input.theatre,
        date: input.date,
        onDuty: false,
        loggedAt: new Date(),
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        consultant: z.string().min(1).optional(),
        theatre: z.number().int().optional(),
        date: z.string().min(1).optional(),
        onDuty: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rest } = input;
      await db
        .update(anaesthetists)
        .set(rest)
        .where(eq(anaesthetists.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(anaesthetists).where(eq(anaesthetists.id, input.id));
      return { success: true };
    }),

  toggleDuty: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({ onDuty: anaesthetists.onDuty })
        .from(anaesthetists)
        .where(eq(anaesthetists.id, input.id))
        .limit(1);
      if (rows.length === 0) {
        throw new Error("Anaesthetist not found");
      }
      const newDuty = !rows[0].onDuty;
      await db
        .update(anaesthetists)
        .set({ onDuty: newDuty })
        .where(eq(anaesthetists.id, input.id));
      return { id: input.id, onDuty: newDuty };
    }),
});
