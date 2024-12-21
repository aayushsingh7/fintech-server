import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import connectToDB from "./database/connection.js";
import aiRouter from "./routes/aiRoutes.js";
import recordRouter from "./routes/financialRecordRoutes.js";

dotenv.config();
const app = express();

connectToDB();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/records", recordRouter);

app.listen(4000, () => {
  console.log("Server started at PORTL:4000");
});
