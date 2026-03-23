import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL?.trim(),
    pass: process.env.GMAIL_SEND_EMAIL_PASSWORD?.trim(),
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});


console.log("Mail Transporter Configured. User:", process.env.GMAIL ? "Set" : "Not Set", "Pass:", process.env.GMAIL_SEND_EMAIL_PASSWORD ? "Set" : "Not Set");

export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.GMAIL,
    to,
    subject: "Reset your Password",
    html: `<P> your otp for your password reset is <b>${otp}</b>.Its expires in 5 mins`
  })
}