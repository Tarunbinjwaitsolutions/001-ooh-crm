import {
  processEscalations,
} from "./escalation.service.js";

export async function runEscalationWorker() {
  try {
    const startedAt = new Date();

    console.log(
      "[D4] Escalation worker started",
      startedAt.toISOString(),
    );

    await processEscalations();

    console.log(
      "[D4] Escalation worker completed",
    );
  } catch (error) {
    console.error(
      "[D4] Escalation worker failed",
      error,
    );
  }
}