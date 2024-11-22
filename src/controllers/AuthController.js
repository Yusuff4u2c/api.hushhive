const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken, sendVerificationEmail } = require("../data/utils");
const jwt = require("jsonwebtoken");
const jwt_simple = require("jwt-simple");

const Register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: passwordHash, email });
    await user.save();

    const verificationResult = await sendVerificationEmail(email, user);
    console.log("verificationResult", verificationResult.success);

    if (!verificationResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Proceed to log in.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const VerifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid verification link" });
  }

  try {
    const { id } = await jwt_simple.decode(token, process.env.JWT_SECRET);

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification token" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateEmail = async (req, res) => {
  const { email } = req.body;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: Log in to update email",
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    user.email = email;
    await user.save();
    await sendVerificationEmail(email, user);
    res
      .status(200)
      .json({ success: true, message: "Email updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid login details" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid login details" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email not verified" });
    }

    const accessToken = generateToken({
      id: user._id,
      username: user.username,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = generateToken(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        tokenVersion: user.tokenVersion,
      },
      "7d"
    );

    res.cookie("refreshToken", refreshToken, {
      withCredentials: true,
      httpOnly: true,
    });

    res.status(201).json({
      message: "User logged in successfully",
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "No refresh token provided" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = generateToken(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        tokenVersion: user.tokenVersion + 1,
      },
      "15m"
    );

    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      message: "New access token issued",
    });
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

const Logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(204)
        .json({ success: true, message: "User already logged out" });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
    });

    res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout Error: ", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  console.log("newPassword", newPassword);

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: Log in to change password",
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    user.tokenVersion += 1;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  Register,
  VerifyEmail,
  Login,
  Logout,
  handleRefreshToken,
  changePassword,
};
