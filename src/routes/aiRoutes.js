import { Router } from "express";
import { askAI } from "../controllers/aiControllers.js";
const aiRouter = Router();
// import { askAI, learnAI } from "../controllers/aiControllers.js";

// aiRouter.get("/learn", learnAI);
aiRouter.post("/ask", askAI);

export default aiRouter;
