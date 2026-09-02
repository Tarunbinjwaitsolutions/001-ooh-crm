export type EscalationLevel =
  | "L1"
  | "L2"
  | "L3";

export interface Escalation {
  _id: string;
  taskId: string;
  level: EscalationLevel;
  triggeredAt: string;
  notifiedUserIds: string[];
  createdAt?: string;
  updatedAt?: string;
}