import FinancialRecord from "../models/financialRecordModel.js";
import mongoose from "mongoose";

// Helper function to get the first and last day of current month
const getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { firstDay, lastDay };
};

// Create a new financial record
export const createRecord = async (req, res) => {
  try {
    let recordData = req.body;
    console.log({
      msg: ` details :- Total Debt: ${recordData.totalDebt}, Repayment Period (Years): ${recordData.repaymentPeroid}, Annual Income: ${recordData.annualIncome}, Monthly Expenses: ${recordData.expensePerMonth}, Savings:${recordData.savings}, Interest Rate (%): ${recordData.interest}, current debt amount payment per month: ${recordData.currentDebtPaymentPerMonth}`,
    });
    // Validate required fields
    if (!recordData.title || !recordData.recordType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (recordData.recordType == "debt") {
      let aiRes = await fetch(`${process.env.API_URL}/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `
           You are a financial advisor, you will be given some details, based on the data, tell me most optimal monthly debt payment amount (in indian ruppe) which will result in upmost satisfaction of the user, give short and onpoint response, no need to explain anything & don't add any current sign or anything just numbers

           details :- Total Debt: ${recordData.totalDebt}, Repayment Period (Years): ${recordData.repaymentPeroid}, Annual Income: ${recordData.annualIncome}, Monthly Expenses: ${recordData.expensePerMonth}, Savings:${recordData.savings}, Interest Rate (%): ${recordData.interest}, current debt amount payment per month: ${recordData.currentDebtPaymentPerMonth}`,
        }),
      });
      const data = await aiRes.json();
      console.log({ data });
      recordData = {
        ...recordData,
        amountToBePayedPerMonth: Number(data.response),
      };
    }

    // Create new record
    const newRecord = new FinancialRecord(recordData);

    // Validate the record against schema
    await newRecord.validate();

    // Save the record
    const savedRecord = await newRecord.save();

    return res.status(201).json({
      success: true,
      data: savedRecord,
      message: "Financial record created successfully",
    });
  } catch (error) {
    // Handle validation errors separately
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating financial record",
      error: error.message,
    });
  }
};

// Get records by userId and recordType for current month
export const getRecords = async (req, res) => {
  try {
    const { userId, recordType } = req.query;
    console.log({ userId, recordType });

    // Validate required parameters
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Get current month date range
    const { firstDay, lastDay } = getCurrentMonthRange();
    console.log({ firstDay, lastDay });
    // Build query object
    const query = {
      user: userId,
      "month.startDate": { $lte: lastDay },
      "month.endDate": { $gte: firstDay },
    };

    // Add recordType to query if provided
    if (recordType) {
      query.recordType = recordType;
    }

    // Find matching records
    const records = await FinancialRecord.find(query);

    return res.status(200).json({
      success: true,
      data: records,
      message: "Records retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving financial records",
      error: error.message,
    });
  }
};

// Delete a record by recordId
export const deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.body;

    // Validate recordId
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: "recordId is required",
      });
    }

    // Find and delete the record
    const deletedRecord = await FinancialRecord.findByIdAndDelete(recordId);

    // Check if record was found and deleted
    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: deletedRecord,
      message: "Record deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting financial record",
      error: error.message,
    });
  }
};
// const getMonthlyAggregationPipeline = (recordType, userId) => [
//   // Match records for the entire year with specified recordType
//   {
//     $match: {
//       user:userId,
//       createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
//       recordType: recordType, // Use the parameter here
//     },
//   },
//   // Group by year and month, and calculate totals
//   {
//     $group: {
//       _id: {
//         year: { $year: "$createdAt" },
//         month: { $month: "$createdAt" },
//       },
//       totalAmount: { $sum: "$amount" },
//     },
//   },
//   // Generate all months for the current year
//   {
//     $facet: {
//       allMonths: [
//         {
//           $group: {
//             _id: null,
//             year: { $first: { $literal: new Date().getFullYear() } },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             months: { $range: [1, 13] },
//             year: 1,
//           },
//         },
//         { $unwind: "$months" },
//         {
//           $project: {
//             year: 1,
//             month: "$months",
//           },
//         },
//       ],
//       existingData: [
//         {
//           $project: {
//             year: "$_id.year",
//             month: "$_id.month",
//             totalAmount: 1,
//           },
//         },
//       ],
//     },
//   },
//   // Combine existing data with all months
//   {
//     $project: {
//       combined: {
//         $concatArrays: ["$allMonths", "$existingData"],
//       },
//     },
//   },
//   { $unwind: "$combined" },
//   // Group to eliminate duplicates and use the actual total when available
//   {
//     $group: {
//       _id: {
//         year: "$combined.year",
//         month: "$combined.month",
//       },
//       totalAmount: {
//         $max: {
//           $ifNull: ["$combined.totalAmount", 0],
//         },
//       },
//     },
//   },
//   // Final reshape and sort
//   {
//     $project: {
//       _id: 0,
//       year: "$_id.year",
//       month: "$_id.month",
//       totalAmount: 1,
//     },
//   },
//   {
//     $sort: { year: 1, month: 1 },
//   },
// ];

const getMonthlyAggregationPipeline = (recordType, userId) => [
  // Match records for the entire year with specified recordType
  {
    $match: {
      user: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
      createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
      recordType: recordType,
    },
  },
  // Group by year and month, and calculate totals
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
      totalAmount: { $sum: "$amount" },
    },
  },
  // Generate all months for the current year
  {
    $facet: {
      allMonths: [
        {
          $group: {
            _id: null,
            year: { $first: { $literal: new Date().getFullYear() } },
          },
        },
        {
          $project: {
            _id: 0,
            months: { $range: [1, 13] },
            year: 1,
          },
        },
        { $unwind: "$months" },
        {
          $project: {
            year: 1,
            month: "$months",
          },
        },
      ],
      existingData: [
        {
          $project: {
            year: "$_id.year",
            month: "$_id.month",
            totalAmount: 1,
          },
        },
      ],
    },
  },
  // Combine existing data with all months
  {
    $project: {
      combined: {
        $concatArrays: ["$allMonths", "$existingData"],
      },
    },
  },
  { $unwind: "$combined" },
  // Group to eliminate duplicates and use the actual total when available
  {
    $group: {
      _id: {
        year: "$combined.year",
        month: "$combined.month",
      },
      totalAmount: {
        $max: {
          $ifNull: ["$combined.totalAmount", 0],
        },
      },
    },
  },
  // Final reshape and sort
  {
    $project: {
      _id: 0,
      year: "$_id.year",
      month: "$_id.month",
      totalAmount: 1,
    },
  },
  {
    $sort: { year: 1, month: 1 },
  },
];

export const incomeGrowth = async (req, res) => {
  const { userId } = req.query;
  const results = await FinancialRecord.aggregate(
    getMonthlyAggregationPipeline("income", userId)
  );
  res.status(200).send({ results });
  try {
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error deleting financial record",
      error: err.message,
    });
  }
};

export const expenseGrowth = async (req, res) => {
  const { userId } = req.query;
  const results = await FinancialRecord.aggregate(
    getMonthlyAggregationPipeline("expense", userId)
  );
  res.status(200).send({ results });
  try {
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error deleting financial record",
      error: err.message,
    });
  }
};
