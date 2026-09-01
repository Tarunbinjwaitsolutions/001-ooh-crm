import { Schema, model } from "mongoose";

export type TaskType =
  | "Printing"
  | "Installation"
  | "Verification"
  | "Removal"
  | "Custom";

export type TaskStatus =
  | "Pending"
  | "InProgress"
  | "Completed";

const taskSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },

    siteId: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "Printing",
        "Installation",
        "Verification",
        "Removal",
        "Custom",
      ],
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    deadline: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "InProgress",
        "Completed",
      ],
      default: "Pending",
    },

    proofRequired: {
      type: Boolean,
      default: false,
    },

    proofId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({
  campaignId: 1,
  siteId: 1,
  type: 1,
});

export const Task = model(
  "Task",
  taskSchema,
);