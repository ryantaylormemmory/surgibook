import { createRouter, publicQuery } from "./middleware";
import { caseRouter } from "./routers/case";
import { anaesthetistRouter } from "./routers/anaesthetist";
import { chatRouter } from "./routers/chat";
import { notificationRouter } from "./routers/notification";
import { auditRouter } from "./routers/audit";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  case: caseRouter,
  anaesthetist: anaesthetistRouter,
  chat: chatRouter,
  notification: notificationRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
