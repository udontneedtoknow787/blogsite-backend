import nodemailer from 'nodemailer';

export default function SendOtp(email, otp, message) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.MAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'BlogSite OTP Verification',
        text: `Your OTP is ${otp}. ${message}. If this was not you, please ignore this email.`,
        html: `<HTML> <p> Your OTP is ${otp}. <br /> ${message} <br /> If this was not you, please ignore this email. </p> </HTML>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}