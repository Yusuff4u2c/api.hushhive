const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
const Exception = require("../exceptions/exceptions");
const { StatusCodes } = require("http-status-codes");

const userVerification = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new Exception({
        code: StatusCodes.UNAUTHORIZED,
        message: "Access Denied: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token)
      throw new Exception({
        code: StatusCodes.UNAUTHORIZED,
        message: "Access Denied: No token provided",
      });

    const authenticatedUser = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(authenticatedUser.id);
    if (user.tokenVersion !== authenticatedUser.tokenVersion) {
      throw new Exception({
        code: StatusCodes.UNAUTHORIZED,
        message: "Invalid token",
      });
    }
    req.user = authenticatedUser;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = userVerification;
