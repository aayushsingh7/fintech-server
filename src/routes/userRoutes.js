import { Router } from "express";
const userRouter = Router();
import { login, logout, register } from "../controllers/userControllers.js";

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.delete("/logout", logout);

export default userRouter;
