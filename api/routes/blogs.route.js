import { Router } from "express";
import { postBlog, getBlogs, getBlogsById, deleteBlogById } from "../controllers/blog.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router()

// open routes
router.route("/allblogs").post(getBlogs)
router.route("/").get(getBlogsById)

// protected routes
router.route("/post-blog").post(authMiddleware, postBlog)
router.route("/delete-blog").delete(authMiddleware, deleteBlogById)

export default router