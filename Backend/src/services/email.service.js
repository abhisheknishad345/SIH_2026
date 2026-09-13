
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Load Email Verification Template
const emailVerificationTemplate = fs.readFileSync(
    path.join(
        __dirname,
        "../templates/email-verification.html"
    ),
    "utf8"
);

const passwordResetTemplate = fs.readFileSync(
    path.join(
        __dirname,
        "../templates/password-reset.html"
    ),
    "utf8"
);


// Email Verification OTP
const sendOTPEmail = async (email, otp) => {

    const html = emailVerificationTemplate.replace(
        "{{OTP}}",
        otp
    );

    await transporter.sendMail({
        from: `"Cooperative Services" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Verification OTP",
        html: html
    });
};


// Password Reset OTP
const passwordResetOTPEmail = async (email, otp) => {

    const html = passwordResetTemplate.replace(
        "{{OTP}}",
        otp
    );

    await transporter.sendMail({
        from: `"Cooperative Services" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        html: html
    });
};

const cooperativeAdminCreatedTemplate = fs.readFileSync(
    path.join(
        __dirname,
        "../templates/cooperative-admin-created.html"
    ),
    "utf8"
);

const cooperativeAdminCreatedEmail = async (email, fullName) => {

    let html = cooperativeAdminCreatedTemplate;

    html = html.replaceAll("{{FULL_NAME}}", fullName);
    html = html.replaceAll("{{EMAIL}}", email);

    await transporter.sendMail({
        from: `"Cooperative Services" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Cooperative Admin Account Has Been Created",
        html
    });
};


module.exports = {
    sendOTPEmail,
    passwordResetOTPEmail,
    cooperativeAdminCreatedEmail
};