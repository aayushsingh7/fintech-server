import { Schema, model } from "mongoose";

const financialRecordSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user" },
    annualIncome: { type: Number, default: 0 },
    totalDebt: { type: Number, default: 0 },
    currentDebtPaymentPerMonth: { type: Number, default: 0 },
    title: {
      type: String,
      required: true, // Ensure title is always provided
      trim: true, // Remove extra spaces
    },
    recordType: {
      type: String,
      enum: ["debt", "income", "expense"],
      required: true, // Ensure recordType is always provided
    },
    amount: {
      type: Number,
      min: 0, // Ensure amount is non-negative
    },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    repaymentPeroid: { type: Number, default: 1 },
    // Financial period details
    period: {
      type: Number, // Number of months for recurring records
      min: 1, // Period must be at least 1 month
    },
    month: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
        validate: {
          validator: function (v) {
            return v > this.month.startDate; // Ensure endDate is after startDate
          },
          message: "End date must be after start date",
        },
      },
    },

    // Payment status and details
    paidSoFar: {
      type: Number,
      default: 0,
      min: 0, // Ensure paidSoFar is non-negative
    },
    expensePerMonth: {
      type: Number,
      default: 0,
      min: 0, // Ensure expensePerMonth is non-negative
    },
    savings: {
      type: Number,
      default: 0,
      min: 0, // Ensure savings is non-negative
    },
    amountToBePayedPerMonth: {
      type: Number,
      default: 0,
      min: 0, // Ensure amountToBePayedPerMonth is non-negative
    },
    interest: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create a model from the schema
const FinancialRecord = model("FinancialRecord", financialRecordSchema);

export default FinancialRecord;
