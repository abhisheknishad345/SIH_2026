const bcrypt = require("bcryptjs");
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerify");
const { sendOTPEmail } = require("./email.service");
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

module.exports = {
    signup, verifyEmail, login
};