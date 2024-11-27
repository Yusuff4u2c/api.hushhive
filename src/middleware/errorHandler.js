const Exception = require("../exceptions/exceptions");

const errorHandler = (err, req, res, next) => {
  if (err instanceof Exception) {
    return res.status(err.code).json({
      success: false,
      message: err.message,
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }
  return res.status(500).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;
