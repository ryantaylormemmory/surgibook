import {
  boolean,
  bigint,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------------------
// 1. cases – Emergency surgery cases
// ---------------------------------------------------------------------------
export const cases = mysqlTable("cases", {
  id: serial("id").primaryKey(),
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  patientSurname: varchar("patient_surname", { length: 255 }).notNull(),
  age: int("age").notNull(),
  ageUnit: varchar("age_unit", { length: 10 }).default("years"),
  weight: int("weight"),
  ward: varchar("ward", { length: 100 }).notNull(),
  postOpWard: varchar("post_op_ward", { length: 100 }),
  pmi: varchar("pmi", { length: 50 }).notNull(),
  procedure: varchar("procedure", { length: 255 }).notNull(),
  indication: text("indication").notNull(),
  discipline: varchar("discipline", { length: 100 }).notNull(),
  surgeonName: varchar("surgeon_name", { length: 255 }).notNull(),
  surgeonContact: varchar("surgeon_contact", { length: 50 }).notNull(),
  priority: mysqlEnum("priority", ["red", "orange", "yellow"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"])
    .notNull()
    .default("pending"),
  bookedAt: timestamp("booked_at").notNull().defaultNow(),
  bookedBy: varchar("booked_by", { length: 255 }).notNull(),
  inProgressAt: timestamp("in_progress_at"),
  inProgressTheatre: int("in_progress_theatre"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  asaGrade: varchar("asa_grade", { length: 10 }),
  allergies: text("allergies"),
  comorbidities: text("comorbidities"),
  npoStatus: varchar("npo_status", { length: 50 }),
  consentObtained: boolean("consent_obtained").default(false),
  consentType: mysqlEnum("consent_type", ["written", "verbal"]),
  bloodRequired: boolean("blood_required").default(false),
  bloodUnits: int("blood_units").default(0),
  theatreArrivalTime: timestamp("theatre_arrival_time"),
  procedureStartTime: timestamp("procedure_start_time"),
  procedureEndTime: timestamp("procedure_end_time"),
  anaesthetistName: varchar("anaesthetist_name", { length: 255 }),
  anaesthetistPhone: varchar("anaesthetist_phone", { length: 50 }),
  assistantSurgeonName: varchar("assistant_surgeon_name", { length: 255 }),
  reasonForDelay: varchar("reason_for_delay", { length: 255 }),
  theatreNumber: int("theatre_number"),
});

// ---------------------------------------------------------------------------
// 2. priority_changes – Tracks priority change history
// ---------------------------------------------------------------------------
export const priorityChanges = mysqlTable("priority_changes", {
  id: serial("id").primaryKey(),
  caseId: bigint("case_id", { mode: "number", unsigned: true }).notNull(),
  fromPriority: mysqlEnum("from_priority", ["red", "orange", "yellow"]).notNull(),
  toPriority: mysqlEnum("to_priority", ["red", "orange", "yellow"]).notNull(),
  reason: text("reason").notNull(),
  changedAt: timestamp("changed_at").notNull().defaultNow(),
  changedBy: varchar("changed_by", { length: 255 }).notNull(),
});

// ---------------------------------------------------------------------------
// 3. anaesthetists – Anaesthetist roster
// ---------------------------------------------------------------------------
export const anaesthetists = mysqlTable("anaesthetists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  consultant: varchar("consultant", { length: 255 }).notNull(),
  theatre: int("theatre").notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  onDuty: boolean("on_duty").default(false),
  loggedAt: timestamp("logged_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// 4. chat_messages – Real-time theatre communication
// ---------------------------------------------------------------------------
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  senderRole: varchar("sender_role", { length: 50 }).notNull(),
  content: text("content").notNull(),
  room: mysqlEnum("room", ["general", "anaesthesia", "surgery"]).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// 5. notifications – System notifications
// ---------------------------------------------------------------------------
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", [
    "case_booked",
    "case_completed",
    "priority_changed",
    "in_theatre",
    "edit",
    "system",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  caseId: bigint("case_id", { mode: "number", unsigned: true }),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// 6. audit_logs – Immutable audit trail
// ---------------------------------------------------------------------------
export const auditLogs = mysqlTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  userName: varchar("user_name", { length: 255 }).notNull(),
  userRole: varchar("user_role", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});
