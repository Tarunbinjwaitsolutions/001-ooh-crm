import { Schema, model } from "mongoose";

const taskTemplateSchema = new Schema(
  {
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

    title: {
      type: String,
      required: true,
      trim: true,
    },

    offsetDays: {
      type: Number,
      required: true,
    },

    proofRequired: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const TaskTemplate = model(
  "TaskTemplate",
  taskTemplateSchema,
);