import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";
import { cookieOptions, generateAccessToken } from "./user.controllers.js";
import { z } from "zod";
import OTP_Generator from "../utils/otp-generator.js";
import SendOtp from "../utils/otp-sender.js";
import { sendSimpleMessage } from "../utils/mailgun.js";
import logger from "../utils/logger.js";


const VerifyUser = AsyncHandler(async (req, res) => {
    const { userId, otp } = req.body;
    // console.log("userId: ", userId);
    // console.log("otp: ", otp);
    if (mongoose.Types.ObjectId.isValid(userId) === false || otp.length !== 6) {
        throw new ApiError(400, "Invalid userId or OTP.");
    }
    const user = await User.findById({_id: userId});
    if (!user) {
        throw new ApiError(400, "User not found.");
    }
    // if (user.verified) {
    //     return res.status(200).json(new ApiResponse(200, {}, "User already verified. Please login."));
    // }
    if (user.verificationCodeExpiry === null || user.verificationCodeExpiry < Date.now()) {
        logger.silly("verification limit time: ", user.verificationCodeExpiry);
        logger.silly("current time: ", Date.now());
        throw new ApiError(400, "OTP expired. Please request a new one.");
    }
    if (!bcrypt.compareSync(otp, user.verificationCode)) {
        throw new ApiError(400, "Invalid OTP.");
    }
    user.verified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    const { accessToken } = await generateAccessToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password")

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(new ApiResponse(200, { "user": loggedInUser, accessToken }, "User verification successfull!"))
})

const forgetPasswordSchema = z.object({
    username: z.string().min(2).max(20),
    email: z.string().email(),
})

const RequestOTP = AsyncHandler(async (req, res) => {
    const { username, email } = req.body;
    if (!email || !username || forgetPasswordSchema.safeParse({ username, email }).success === false) {
        throw new ApiError(400, "Invalid request. Please provide valid username and email.");
    }
    const user = await User.findOne({ username, email });
    if (!user) {
        throw new ApiError(404, "User not found with the provided username and email.");
    }
    const otp = OTP_Generator(6);
    const hashedOtp = bcrypt.hashSync(otp, 10);
    // sending OTP to email
    const info = await SendOtp(email, otp);
    logger.info("SendOtp function response: ", info);
    await sendSimpleMessage( {otp, email, fullname:user.fullname, userId:user._id, message: "This is the second email!"} )
    user.verificationCode = hashedOtp;
    user.verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {}, "OTP sent to your email. Please check your inbox."));
})
export { VerifyUser,
    RequestOTP
 }