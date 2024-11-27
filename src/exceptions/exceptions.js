const { StatusCodes } = require("http-status-codes");

class Exception extends Error {
  constructor({ code = StatusCodes.INTERNAL_SERVER_ERROR, message }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

module.exports = Exception;
