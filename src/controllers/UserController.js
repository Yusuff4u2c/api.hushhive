const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const Exception = require("../exceptions/exceptions");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) {
      throw new Exception({
        code: StatusCodes.NOT_FOUND,
        message: "No users found",
      });
    }
    res.status(StatusCodes.OK).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });
    if (!user) {
      throw new Exception({
        code: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }
    res.status(200).json({ success: true, user: user.username });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Exception({
        code: StatusCodes.BAD_REQUEST,
        message: "User ID is required to update user",
      });
    }
    const user = await User.findByIdAndUpdate(id, req.body);
    if (!user) {
      throw new Exception({
        code: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }
    res.status(200).json({ status: true, user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Exception({
        code: StatusCodes.BAD_REQUEST,
        message: "User ID is required to delete user",
      });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new Exception({
        code: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }
    res.status(StatusCodes.OK).json({ status: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser };
