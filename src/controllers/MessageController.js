const Message = require("../models/Message");
const User = require("../models/User");

const CreateMessage = async (req, res) => {
  try {
    const { message, username } = req.body;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const newMessage = new Message({ message, receiverId: user._id });
    await newMessage.save();
    res.status(201).json({
      message: "Message created successfully",
      success: true,
      newMessage,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const GetMessages = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json("Access Denied: No token provided");
    }

    const messages = await Message.find({
      receiverId: user.id,
    });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const GetMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);
    res.status(200).json({ message });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const DeleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);
    res.status(200).json({ message });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { CreateMessage, GetMessages, GetMessage, DeleteMessage };
