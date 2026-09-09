const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Cooperative Services" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Verification OTP",
        html: `
            <h2>Email Verification</h2>

            <p>Your OTP for email verification is:</p>

            <h1>${otp}</h1>

            <p>This OTP will expire in 10 minutes.</p>

            <p>If you did not create this account, please ignore this email.</p>
        `
    });
};

module.exports = {
    sendOTPEmail
};