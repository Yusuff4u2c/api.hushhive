const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwt_simple = require("jwt-simple");
const { generateToken, sendVerificationEmail } = require("../data/utils");
const Exception = require("../exceptions/exceptions");
const { StatusCodes } = require("http-status-codes");

class AuthController {
  static async Register(req, res, next) {
    try {
      const { username, password, email } = req.body;

      if (!username || !password || !email) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "Username, email, and password are required",
        });
      }

      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "User already exists with that username or email",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({ username, password: passwordHash, email });
      await user.save();

      const verificationResult = await sendVerificationEmail(email, user);
      // if (!verificationResult.success) {
      //   throw new Exception({
      //     code: StatusCodes.INTERNAL_SERVER_ERROR,
      //     message: "Failed to send verification email",
      //   });
      // }

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "User registered successfully. Proceed to log in.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async VerifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) {
        throw new Exception({
          code: StatusCodes.UNAUTHORIZED,
          message: "No token provided",
        });
      }

      const { id } = jwt_simple.decode(token, process.env.JWT_SECRET);
      const user = await User.findById(id);

      if (!user) {
        throw new Exception({
          code: StatusCodes.NOT_FOUND,
          message: "User not found",
        });
      }

      if (user.isVerified) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "Email already verified",
        });
      }

      user.isVerified = true;
      await user.save();

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateEmail(req, res, next) {
    try {
      const { email } = req.body;

      if (!req.user) {
        throw new Exception({
          code: StatusCodes.UNAUTHORIZED,
          message: "Access Denied: Log in to update email",
        });
      }

      if (!email) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "Email is required",
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        throw new Exception({
          code: StatusCodes.NOT_FOUND,
          message: "User not found",
        });
      }

      user.email = email;
      await user.save();
      await sendVerificationEmail(email, user);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Email updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async Login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "Email and password are required",
        });
      }

      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "Incorrect email or password",
        });
      }

      if (!user.isVerified) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "Email not verified. Check your email for verification",
        });
      }

      const accessToken = generateToken(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          tokenVersion: user.tokenVersion,
        },
        "15m"
      );

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

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "User logged in successfully",
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "No refresh token provided",
        });
      }

      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await User.findById(payload.id);

      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "Invalid token",
        });
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

      res.status(StatusCodes.OK).json({
        success: true,
        accessToken: newAccessToken,
        message: "New access token issued",
      });
    } catch (error) {
      next(error);
    }
  }

  static async Logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "No refresh token provided",
        });
      }
      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await User.findById(payload.id);
      user.tokenVersion += 1;
      await user.save();
      res.status(StatusCodes.OK).json({
        success: true,
        message: "User logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { newPassword } = req.body;

      if (!req.user) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "Access Denied: Log in to change password",
        });
      }

      if (!newPassword) {
        throw new Exception({
          code: StatusCodes.BAD_REQUEST,
          message: "New password is required",
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        throw new Exception({
          code: StatusCodes.NOT_FOUND,
          message: "User not found",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.tokenVersion += 1;
      await user.save();

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
