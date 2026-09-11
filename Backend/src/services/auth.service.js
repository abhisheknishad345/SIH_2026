const bcrypt = require("bcryptjs");
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerify");
const PasswordReset = require("../models/PasswordReset");
const { sendOTPEmail, passwordResetOTPEmail } = require("./email.service");
const generateToken = require("../utils/jwt");

const signup = async ({ fullName, email, password, role }) => {

    // 3. Normalize email
    email = email.toLowerCase().trim();

    // 4. Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create user
    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role
    });

    // 7. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 8. Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 9. OTP expiry - 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 10. Save OTP verification record
    await EmailVerification.create({
        userId: user._id,
        otpHash,
        expiresAt
    });

    // 11. Send OTP
    await sendOTPEmail(email, otp);

    return {
        message: "Signup successful. OTP sent to your email.",
        userId: user._id
    };

};

// verify
const verifyEmail = async ({ email, otp }) => {

    // 1. Basic validation
    if (!email || !otp) {
        throw new Error("Email and OTP are required");
    }

    // 2. Normalize email
    email = email.toLowerCase().trim();

    // 3. Find user
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    // 4. Check if already verified
    if (user.emailVerified) {
        throw new Error("Email is already verified");
    }

    // 5. Find OTP record
    const verification = await EmailVerification.findOne({
        userId: user._id
    });

    if (!verification) {
        throw new Error("OTP not found or expired");
    }

    // 6. Check expiry
    if (verification.expiresAt < new Date()) {
        await EmailVerification.deleteOne({
            _id: verification._id
        });

        throw new Error("OTP has expired");
    }

    // 7. Check maximum attempts
    if (verification.attempts >= 5) {
        await EmailVerification.deleteOne({
            _id: verification._id
        });

        throw new Error("Too many incorrect attempts. Please request a new OTP");
    }

    // 8. Compare OTP
    const isOTPValid = await bcrypt.compare(
        otp,
        verification.otpHash
    );

    if (!isOTPValid) {

        verification.attempts += 1;
        await verification.save();

        throw new Error("Invalid OTP");
    }

    // 9. Mark email as verified
    user.emailVerified = true;
    await user.save();

    // 10. Delete OTP record
    await EmailVerification.deleteOne({
        _id: verification._id
    });

    // 11. Generate JWT
    const token = generateToken(
        user._id.toString(),
        user.role
    );

    return {
        message: "Email verified successfully",
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }
    };
};

//resend otp
const resendOTP = async (email) => {
    if (!email) {
        throw new Error("Email is required");
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.emailVerified) {
        throw new Error("Email is already verified");
    }

    const existingVerification = await EmailVerification.findOne({
        userId: user._id
    });

    if (
        existingVerification &&
        existingVerification.createdAt &&
        Date.now() - existingVerification.createdAt.getTime() < 60 * 1000
    ) {
        throw new Error(
            "Please wait 60 seconds before requesting a new OTP"
        );
    }

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
    );

    await EmailVerification.findOneAndUpdate(
        { userId: user._id },
        {
            otpHash,
            expiresAt,
            attempts: 0
        },
        {
            upsert: true
        }
    );

    await sendOTPEmail(email, otp);

    return {
        message: "New OTP sent to your email"
    };
};

// login
const login = async ({ email, password }) => {

    // 1. Normalize email
    email = email.toLowerCase().trim();

    // 2. Find user
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 3. Check email verification
    if (!user.emailVerified) {
        throw new Error("Please verify your email first");
    }

    // 4. Compare password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // 5. Generate JWT
    const token = generateToken(
        user._id.toString(),
        user.role
    );

    return {
        message: "Login successful",
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }
    };
};

const forgotPassword = async (email) => {
    if (!email) {
        throw new Error("Email is required");
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.emailVerified) {
        throw new Error("Please verify your email first");
    }

    const existingReset = await PasswordReset.findOne({
        userId: user._id
    });

    // 60-second cooldown
    if (
        existingReset &&
        existingReset.updatedAt &&
        Date.now() - existingReset.updatedAt.getTime() < 60 * 1000
    ) {
        throw new Error(
            "Please wait 60 seconds before requesting a new OTP"
        );
    }

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
    );

    await PasswordReset.findOneAndUpdate(
        { userId: user._id },
        {
            otpHash,
            expiresAt,
            attempts: 0
        },
        {
            upsert: true
        }
    );

    await passwordResetOTPEmail(email, otp);

    return {
        message: "Password reset OTP sent to your email"
    };
};

// reset password
const resetPassword = async ({
    email,
    otp,
    newPassword
}) => {
    if (!email || !otp || !newPassword) {
        throw new Error(
            "Email, OTP and new password are required"
        );
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    const reset = await PasswordReset.findOne({
        userId: user._id
    });

    if (!reset) {
        throw new Error("OTP not found or expired");
    }

    // Check OTP expiry
    if (reset.expiresAt < new Date()) {
        await PasswordReset.deleteOne({
            _id: reset._id
        });

        throw new Error("OTP has expired");
    }

    // Verify OTP
    const isOTPValid = await bcrypt.compare(
        otp,
        reset.otpHash
    );

    // Maximum 5 incorrect attempts
    if (!isOTPValid) {
        reset.attempts += 1;

        if (reset.attempts >= 5) {
            await PasswordReset.deleteOne({
                _id: reset._id
            });

            throw new Error(
                "Too many incorrect attempts. Please request a new OTP"
            );
        }

        await reset.save();

        throw new Error("Invalid OTP");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    user.password = hashedPassword;

    await user.save();

    // OTP cannot be reused
    await PasswordReset.deleteOne({
        _id: reset._id
    });

    return {
        message: "Password reset successfully"
    };
};

module.exports = {
    signup, verifyEmail, login, resendOTP, forgotPassword, resetPassword
};