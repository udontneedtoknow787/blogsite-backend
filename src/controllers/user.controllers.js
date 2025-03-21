import { z } from "zod"
import {User} from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { AsyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const cookieOptions = {
    httpOnly: true,
    secure: false
}

const generateAccessToken = async (userId) => {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()

    return {accessToken}
}

const validateUserId = (userId) => {
    if(!userId){
        throw new ApiError(403, "No userId found.")
    }
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, "Invalid userId")
    }
}

const registerUserSchema = z.object({
    username: z.string().min(2).max(20),
    email: z.string().email(),
    password: z.string().min(6).max(20),
    fullname: z.string().min(2).max(50),
})

const registerUser = AsyncHandler( async (req, res) => {
    const { username, email, password, fullname } = req.body;
    const isValid = registerUserSchema.safeParse({ username, email, password, fullname });
    if(!isValid.success) {
        throw new ApiError(400, `All fields are required.\n *Password must be between 6 and 20 length.
    Fullname should be from 2 to 50 length only.`);
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if(existedUser) {
        throw new ApiError(400, "Username or email already registered.");
    }
    const newUser = await User.create({ username, email, password, fullname });
    const createdUser = await User.findOne({
        _id: newUser._id
    }).select("-password");
    if(!createdUser) {
        throw new ApiError(500, "Failed to create user.");
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully."));
})


const loginSchema = z.object({
    username: z.string().min(2).max(20),
    password: z.string().min(6).max(20),
})

const userLogin = AsyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const isValid = loginSchema.safeParse({ username, password });
    if(!isValid.success) {
        throw new ApiError(400, `All fields are required.\n *Password must be between 6 and 20 length.`);
    }
    const user = await User.findOne({ username });
    if(!user) {
        throw new ApiError(404, "User not found.");
    }
    const isMatch = user.comparePassword(password);
    if(!isMatch) {
        throw new ApiError(400, "Invalid credentials.");
    }
    const {accessToken} = await generateAccessToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password")

    // reverse the blogs field in user
    loggedInUser.blogs = loggedInUser.blogs.reverse()

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, {"user":loggedInUser, accessToken}, "User login successfull!"))
})


const userLogout = AsyncHandler(async (_, res) => {

    return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const publicProfile = AsyncHandler( async (req, res) => {
    console.log(req.params)
    const username = req.params?.username
    if(!z.string().min(2).max(20).safeParse(username).success){
        throw new ApiError(400, "Invalid username")
    }
    const user = await User.findOne({username}).select("-password -email")
    if(!user){
        throw new ApiError(404, "User not found")
    }
    
   return res.status(200).json(new ApiResponse(200, user, "Profile fetched successfully!"))
})

export {
    registerUser,
    userLogin,
    userLogout,
    publicProfile
}