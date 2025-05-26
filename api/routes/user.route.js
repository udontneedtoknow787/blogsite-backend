import { registerUser, userLogin, userLogout, publicProfile, updateUserPassword } from "../controllers/user.controllers.js";
import { RequestOTP, VerifyUser } from "../controllers/verification.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router()

// Open routes
router.route("/register").post(registerUser);
router.route("/login").post(userLogin)
router.route("/profile/:username").get(publicProfile)
router.route("/verify").post(VerifyUser)
router.route("/request-otp").post(RequestOTP)

// protected route
router.route("/logout").post(authMiddleware, userLogout)
router.route("/update-password").put(authMiddleware, updateUserPassword)


export default router;