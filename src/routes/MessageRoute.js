const {
  CreateMessage,
  GetMessages,
  GetMessage,
  DeleteMessage,
} = require("../controllers/MessageController");
const router = require("express").Router();
const userVerification = require("../middleware/AuthMiddleware");

router.post("/create", CreateMessage);
router.get("/", userVerification, GetMessages);
router.get("/:id", userVerification, GetMessage);
router.delete("/:id", userVerification, DeleteMessage);

module.exports = router;
