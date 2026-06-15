import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: String,
    company: String,
    tags: [String],
    notes: String,
    preferences: mongoose.Schema.Types.Mixed,
    healthScore: { type: Number, default: 70 }
  },
  { timestamps: true }
);

export const Customer = mongoose.model("Customer", customerSchema);
