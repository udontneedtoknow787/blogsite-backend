import nodemailer from 'nodemailer';
import { ApiError } from './apiError.js';

export default async function SendOtp(email, otp, message = "") {
    console.log("SendOtp called");
    console.log("Host:", process.env.EMAIL_HOST);
    console.log("Port:", process.env.EMAIL_PORT);
    console.log("User:", process.env.EMAIL_USER);
    console.log("Email:", email);
    
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

        console.log("About to send mail");

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        console.log(`OTP sent to ${email}, OTP: ${otp}`);
        return info;
    } catch (error) {
        console.log("Error sending OTP email:", error);
        throw new ApiError(500, "Failed to send OTP email. Please try again later.");
    }
}