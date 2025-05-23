import { registerUser, userLogin, userLogout, publicProfile } from "../controllers/user.controllers.js";
import { VerifyUser } from "../controllers/verification.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router()

// Open routes
router.route("/register").post(registerUser);
router.route("/login").post(userLogin)
router.route("/profile/:username").get(publicProfile)
router.route("/verify").post(VerifyUser)

// protected route
router.route("/logout").post(authMiddleware, userLogout)


export default router;