const Exception = require("../exceptions/exceptions");
const Message = require("../models/Message");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const CreateMessage = async (req, res, next) => {
  try {
    const { message, username } = req.body;

    const user = await User.findOne({ username: username });

    if (!user) {
      throw new Exception({
        code: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    const newMessage = new Message({ message, receiverId: user._id });
    await newMessage.save();
    res.status(StatusCodes.OK).json({
      message: "Message created successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const GetMessages = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Exception({
        code: StatusCodes.UNAUTHORIZED,
        message: "Access Denied: Log in to view messages",
      });
    }

    const { page = 1 } = req.query;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const messages = await Message.find({ receiverId: user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalMessages = await Message.countDocuments({ receiverId: user.id });

    res.status(StatusCodes.OK).json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(parseInt(totalMessages) / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// const GetMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const message = await Message.findById(id);
//     res.status(200).json({ message });
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// };

const DeleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);
    res.status(StatusCodes.OK).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

module.exports = { CreateMessage, GetMessages, DeleteMessage };
