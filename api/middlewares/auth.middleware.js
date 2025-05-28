import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import logger from "../utils/logger.js";

export const authMiddleware = AsyncHandler(async (req, res, next)=> {
    try {
        // console.log("Request cookie : ",req.cookies.accessToken)
        console.log("Request cookie : its classiffied!")
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "") // figure out this portion
        if(!token){
            throw new ApiError(405, "Unauthorized request!\n Your login token might be expired.")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password")
        if(!user){
            throw new ApiError(405, "Invalid access token!")
        }
        if(user.verified === false){
            throw new ApiError(405, "User not verified!")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(405, error?.message || "Invalid access token!")
    }
})