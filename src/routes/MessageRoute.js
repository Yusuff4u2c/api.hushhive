const {
  CreateMessage,
  GetMessages,
  DeleteMessage,
} = require("../controllers/MessageController");
const router = require("express").Router();
const userVerification = require("../middleware/isAuthenticated");

router.post("/create", CreateMessage);
router.get("/", userVerification, GetMessages);
router.delete("/:id", userVerification, DeleteMessage);

module.exports = router;
