import nodemailer from 'nodemailer';

export default function SendOtp(email, otp, message) {
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: process.env.EMAIL,
    //         pass: process.env.MAIL_PASSWORD
    //     }
    // });

    // Looking to send emails in production? Check out our Email API/SMTP product!
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "fd39ddb1f84372",
            pass: "28824c07494b28"
        }
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'BlogSite OTP Verification',
        text: `<HTML> <p> Your OTP is ${otp}. <br /> ${message} <br /> If this was not you, please ignore this email. </p> </HTML>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}