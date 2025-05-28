import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0
import logger from "./logger.js";
import { ApiError } from "./apiError.js";

export async function MailgunEmailService({otp, email, fullname, userId, message = ""}) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    const data = await mg.messages.create("raj-kumar.me", {
      from: "BlogSite <postmaster@raj-kumar.me>",
      to: [`$<${email}>`], // <-- FIXED LINE
      subject: "BlogSite OTP Verification",
      text:    `Hi ${fullname}, Your One Time Password is : ${otp} for userID: ${userId} ${message} If this was not you, please ignore this email. `,
      html:    `<p>Hi ${fullname},</p><p>Your One Time Password is : <strong>${otp}</strong> for userID: <strong>${userId}</strong> ${message}</p><p>If this was not you, please ignore this email.</p>`,
    });

    logger.info(data); // logs response data
    if(data.status!==200) {
      logger.error(`Mailgun API error: ${data.message}`);
      throw new ApiError(500, "Could not send mail at this moment!")
    }
  } catch (error) {
    console.log(error); //logs any error
  }
}