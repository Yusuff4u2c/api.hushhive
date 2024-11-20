const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

const userVerification = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json("Access Denied: No token provided");
  }

  const token = authHeader.split(" ")[1];
  // console.log("token :", token);

  if (!token) return res.status(401).json("Access Denied: No token provided");

  try {
    const authenticatedUser = jwt.verify(token, process.env.JWT_SECRET);
    console.log(authenticatedUser);
    const user = await User.findById(authenticatedUser.id);
    if (user.tokenVersion !== authenticatedUser.tokenVersion) {
      return res.status(401).json("Invalid or expired token");
    }
    req.user = authenticatedUser;

    next();
  } catch (error) {
    res.status(400).json("Invalid or expired token");
  }
};

module.exports = userVerification;
