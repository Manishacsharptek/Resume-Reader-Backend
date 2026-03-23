import express from "express";

import { signIn, signup, signOut, sendOtp, verifyOtp, resetPassword } from "../controllers/auth.controllers.js";

const authRouter = express.Router()

authRouter.post("/signup", signup);
authRouter.post("/signin", signIn);
authRouter.get("/signout", signOut);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword)

export default authRouter;