import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendSimpleMessage({otp, email, fullname, userId, message = ""}) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    const data = await mg.messages.create("raj-kumar.me", {
      from: "Mailgun Sandbox <postmaster@raj-kumar.me>",
      to: ["Raj kumar <rajk.ug22.cs@nitp.ac.in>"],
      subject: "BlogSite OTP Verification",
      text:    `Congratulations ${fullname}, you just sent an email with Mailgun! You are truly awesome! This is your OTP: ${otp}
        for userID: ${userId} ${message} If this was not you, please ignore this email. `,
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}