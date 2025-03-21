import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const authMiddleware = AsyncHandler(async (req, res, next)=> {
    try {
        console.log(req.cookies.accessToken)
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "") // figure out this portion
        if(!token){
            throw new ApiError(405, "Unauthorized request!")
        }
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password")
        if(!user){
            throw new ApiError(405, "Invalid access token!")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(405, error?.message || "Invalid access token!")
    }
})