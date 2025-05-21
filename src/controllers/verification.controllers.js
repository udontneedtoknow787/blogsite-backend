import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";


const VerifyUser = AsyncHandler(async (req, res) => {
    const { userId, otp } = req.body;
    // console.log("userId: ", userId);
    // console.log("otp: ", otp);
    if (mongoose.Types.ObjectId.isValid(userId) === false || otp.length !== 6) {
        throw new ApiError(400, "All fields are required.");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(400, "User not found.");
    }
    if (user.verified) {
        return res.status(200).json(new ApiResponse(200, {}, "User already verified. Please login."));
    }
    if(user.verificationCodeExpiry==null || user.verificationCodeExpiry < Date.now()){
        console.log("verification limit time: ",user.verificationCodeExpiry);
        console.log("current time: ", Date.now());
        throw new ApiError(400, "OTP expired. Please request a new one.");
    }
    if (!bcrypt.compareSync(otp, user.verificationCode)) {
        throw new ApiError(400, "Invalid OTP.");
    }
    user.verified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();
    return res.status(200).json(new ApiResponse(200, {}, "User verified successfully."));
})

export { VerifyUser }