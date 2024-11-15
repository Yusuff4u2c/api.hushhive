const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken, sendVerificationEmail } = require("../data/utils");
const jwt = require("jsonwebtoken");
const jwt_simple = require("jwt-simple");

const Register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (
      (await User.findOne({ username: username })) ||
      (await User.findOne({ email: email }))
    ) {
      return res.status(400).send("Username or email already taken");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: passwordHash, email });
    await user.save();

    const verificationResult = await sendVerificationEmail(email, user);
    if (!verificationResult.success) {
      return res.status(400).send("Email not sent");
    } else {
      res
        .status(201)
        .send({ message: "User created successfully", success: true, user });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const VerifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send("Invalid verification link");
  }

  try {
    const { id } = await jwt_simple.decode(token, process.env.JWT_SECRET);
    console.log(id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).send("Invalid verification token");
    }
    if (user.isVerified) {
      return res.status(400).send("Email already verified");
    }
    user.isVerified = true;
    await user.save();
    res.status(200).send("Email verified successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid login details");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid login details");
    }

    if (!user.isVerified) {
      throw new Error("Email not verified");
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
    res.status(400).send(error.message);
  }
};

const handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).send("No refresh token provided");

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newAccessToken = generateToken(
      { id: payload.id, username: payload.username, email: payload.email },
      "15m"
    );
    const newRefreshToken = generateToken(
      { id: payload.id, username: payload.username, email: payload.email },
      "7d"
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({ message: "New access token issued" });
  } catch (error) {
    res.status(401).send("Could not refresh token");
  }
};

const Logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "User logged out successfully" });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(req.body);
  console.log(req.user);

  try {
    const user = await User.findById(req.user.id);
    console.log(user);

    if (!user) {
      return res.status(400).send("User not found");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid password");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    user.tokenVersion += 1;
    await user.save();

    res.status(200).send("Password changed successfully");
  } catch (error) {
    res.status(400).send(error.message);
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
