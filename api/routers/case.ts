import { z } from "zod";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { cases, priorityChanges } from "@db/schema";

const priorityOrder = sql`case when ${cases.priority} = 'red' then 0 when ${cases.priority} = 'orange' then 1 else 2 end`;

export const caseRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(cases)
      .orderBy(priorityOrder, desc(cases.bookedAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(cases)
        .where(eq(cases.id, input.id))
        .limit(1);
      return rows[0] ?? null;
    }),

  search: publicQuery
    .input(
      z.object({
        q: z.string().optional(),
        priority: z.enum(["red", "orange", "yellow"]).optional(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        asa: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.q && input.q.trim()) {
        const pattern = `%${input.q}%`;
        conditions.push(
          or(
            like(cases.patientName, pattern),
            like(cases.patientSurname, pattern),
            like(cases.surgeonName, pattern),
            like(cases.procedure, pattern),
            like(cases.indication, pattern)
          )
        );
      }

      if (input.priority) {
        conditions.push(eq(cases.priority, input.priority));
      }

      if (input.status) {
        conditions.push(eq(cases.status, input.status));
      }

      if (input.asa) {
        conditions.push(eq(cases.asaGrade, input.asa));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return db
        .select()
        .from(cases)
        .where(whereClause)
        .orderBy(priorityOrder, desc(cases.bookedAt));
    }),

  statistics: publicQuery.query(async () => {
    const db = getDb();
    const allCases = await db.select().from(cases);

    const total = allCases.length;
    const active = allCases.filter(
      (c) => c.status === "pending" || c.status === "in_progress"
    ).length;
    const completed = allCases.filter((c) => c.status === "completed").length;
    const cancelled = allCases.filter((c) => c.status === "cancelled").length;
    const inTheatre = allCases.filter((c) => c.status === "in_progress").length;

    const priorityCounts = {
      red: allCases.filter((c) => c.priority === "red").length,
      orange: allCases.filter((c) => c.priority === "orange").length,
      yellow: allCases.filter((c) => c.priority === "yellow").length,
    };

    const asaCounts: Record<string, number> = {};
    for (const c of allCases) {
      if (c.asaGrade) {
        asaCounts[c.asaGrade] = (asaCounts[c.asaGrade] ?? 0) + 1;
      }
    }

    const surgeonCounts: Record<string, number> = {};
    for (const c of allCases) {
      if (c.surgeonName) {
        surgeonCounts[c.surgeonName] = (surgeonCounts[c.surgeonName] ?? 0) + 1;
      }
    }

    return {
      total,
      active,
      completed,
      cancelled,
      inTheatre,
      priorityCounts,
      asaCounts,
      surgeonCounts,
    };
  }),

  create: publicQuery
    .input(
      z.object({
        patientName: z.string().min(1),
        patientSurname: z.string().min(1),
        age: z.number().int().min(0),
        ageUnit: z.string().optional(),
        weight: z.number().int().optional(),
        ward: z.string().min(1),
        postOpWard: z.string().optional(),
        pmi: z.string().min(1),
        procedure: z.string().min(1),
        indication: z.string().min(1),
        discipline: z.string().min(1),
        surgeonName: z.string().min(1),
        surgeonContact: z.string().min(1),
        priority: z.enum(["red", "orange", "yellow"]),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        bookedBy: z.string().min(1),
        notes: z.string().optional(),
        asaGrade: z.string().optional(),
        allergies: z.string().optional(),
        comorbidities: z.string().optional(),
        npoStatus: z.string().optional(),
        consentObtained: z.boolean().optional(),
        consentType: z.enum(["written", "verbal"]).optional(),
        bloodRequired: z.boolean().optional(),
        bloodUnits: z.number().int().optional(),
        theatreArrivalTime: z.string().datetime().optional(),
        procedureStartTime: z.string().datetime().optional(),
        procedureEndTime: z.string().datetime().optional(),
        anaesthetistName: z.string().optional(),
        anaesthetistPhone: z.string().optional(),
        assistantSurgeonName: z.string().optional(),
        reasonForDelay: z.string().optional(),
        theatreNumber: z.number().int().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(cases).values({
        patientName: input.patientName,
        patientSurname: input.patientSurname,
        age: input.age,
        ageUnit: input.ageUnit ?? "years",
        weight: input.weight ?? null,
        ward: input.ward,
        postOpWard: input.postOpWard ?? null,
        pmi: input.pmi,
        procedure: input.procedure,
        indication: input.indication,
        discipline: input.discipline,
        surgeonName: input.surgeonName,
        surgeonContact: input.surgeonContact,
        priority: input.priority,
        status: input.status ?? "pending",
        bookedBy: input.bookedBy,
        notes: input.notes ?? null,
        asaGrade: input.asaGrade ?? null,
        allergies: input.allergies ?? null,
        comorbidities: input.comorbidities ?? null,
        npoStatus: input.npoStatus ?? null,
        consentObtained: input.consentObtained ?? false,
        consentType: input.consentType ?? null,
        bloodRequired: input.bloodRequired ?? false,
        bloodUnits: input.bloodUnits ?? 0,
        theatreArrivalTime: input.theatreArrivalTime ? new Date(input.theatreArrivalTime) : null,
        procedureStartTime: input.procedureStartTime ? new Date(input.procedureStartTime) : null,
        procedureEndTime: input.procedureEndTime ? new Date(input.procedureEndTime) : null,
        anaesthetistName: input.anaesthetistName ?? null,
        anaesthetistPhone: input.anaesthetistPhone ?? null,
        assistantSurgeonName: input.assistantSurgeonName ?? null,
        reasonForDelay: input.reasonForDelay ?? null,
        theatreNumber: input.theatreNumber ?? null,
        bookedAt: new Date(),
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        patientName: z.string().min(1).optional(),
        patientSurname: z.string().min(1).optional(),
        age: z.number().int().min(0).optional(),
        ageUnit: z.string().optional(),
        weight: z.number().int().optional(),
        ward: z.string().min(1).optional(),
        postOpWard: z.string().optional(),
        pmi: z.string().min(1).optional(),
        procedure: z.string().min(1).optional(),
        indication: z.string().min(1).optional(),
        discipline: z.string().min(1).optional(),
        surgeonName: z.string().min(1).optional(),
        surgeonContact: z.string().min(1).optional(),
        priority: z.enum(["red", "orange", "yellow"]).optional(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        bookedBy: z.string().min(1).optional(),
        notes: z.string().optional(),
        asaGrade: z.string().optional(),
        allergies: z.string().optional(),
        comorbidities: z.string().optional(),
        npoStatus: z.string().optional(),
        consentObtained: z.boolean().optional(),
        consentType: z.enum(["written", "verbal"]).optional(),
        bloodRequired: z.boolean().optional(),
        bloodUnits: z.number().int().optional(),
        theatreArrivalTime: z.string().datetime().optional(),
        procedureStartTime: z.string().datetime().optional(),
        procedureEndTime: z.string().datetime().optional(),
        anaesthetistName: z.string().optional(),
        anaesthetistPhone: z.string().optional(),
        assistantSurgeonName: z.string().optional(),
        reasonForDelay: z.string().optional(),
        theatreNumber: z.number().int().optional(),
        inProgressTheatre: z.number().int().optional(),
        completedAt: z.string().datetime().optional(),
        inProgressAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      const setData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          if (
            key === "theatreArrivalTime" ||
            key === "procedureStartTime" ||
            key === "procedureEndTime" ||
            key === "completedAt" ||
            key === "inProgressAt"
          ) {
            setData[key] = value ? new Date(value as string) : null;
          } else {
            setData[key] = value;
          }
        }
      }

      await db
        .update(cases)
        .set(setData as typeof cases.$inferInsert)
        .where(eq(cases.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cases).where(eq(cases.id, input.id));
      return { success: true };
    }),

  complete: publicQuery
    .input(
      z.object({
        id: z.number(),
        completedAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(cases)
        .set({
          status: "completed",
          completedAt: input.completedAt ? new Date(input.completedAt) : new Date(),
        })
        .where(eq(cases.id, input.id));
      return { success: true };
    }),

  cancel: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(cases)
        .set({ status: "cancelled" })
        .where(eq(cases.id, input.id));
      return { success: true };
    }),

  moveToTheatre: publicQuery
    .input(
      z.object({
        id: z.number(),
        theatre: z.number().min(1).max(2),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(cases)
        .set({
          status: "in_progress",
          inProgressTheatre: input.theatre,
          inProgressAt: new Date(),
        })
        .where(eq(cases.id, input.id));
      return { success: true };
    }),

  changePriority: publicQuery
    .input(
      z.object({
        id: z.number(),
        toPriority: z.enum(["red", "orange", "yellow"]),
        reason: z.string().min(1),
        changedBy: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const rows = await db
        .select()
        .from(cases)
        .where(eq(cases.id, input.id))
        .limit(1);
      const currentCase = rows[0];
      if (!currentCase) {
        throw new Error("Case not found");
      }

      await db
        .update(cases)
        .set({ priority: input.toPriority })
        .where(eq(cases.id, input.id));

      await db.insert(priorityChanges).values({
        caseId: input.id,
        fromPriority: currentCase.priority,
        toPriority: input.toPriority,
        reason: input.reason,
        changedBy: input.changedBy,
        changedAt: new Date(),
      });

      return { success: true };
    }),
});
