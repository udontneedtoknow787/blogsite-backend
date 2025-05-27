import nodemailer from 'nodemailer';
import { ApiError } from './apiError.js';
import logger from './logger.js';

export default async function SendOtp(email, otp, message = "") {    
    try {
        var transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: Number(process.env.EMAIL_PORT) == 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'BlogSite OTP Verification',
            text: `Your OTP is ${otp}. ${message}. If this was not you, please ignore this email.`,
            html: `<p> Your OTP is ${otp}. <br /> ${message} <br /> If this was not you, please ignore this email. </p>`
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info("Email sent:", info.response);
        return info;
    } catch (error) {
        throw new ApiError(500, "Failed to send OTP email. Please try again later.");
    }
}