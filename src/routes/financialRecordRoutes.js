import express from "express";
import {
  createRecord,
  getRecords,
  deleteRecord,
  incomeGrowth,
  expenseGrowth,
} from "../controllers/financialRecordControllers.js";

const recordRouter = express.Router();

recordRouter.post("/create", createRecord);
recordRouter.get("/", getRecords);
recordRouter.delete("/delete", deleteRecord);
recordRouter.get("/income-growth", incomeGrowth);
recordRouter.get("/expense-growth", expenseGrowth);

export default recordRouter;
