const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser };
