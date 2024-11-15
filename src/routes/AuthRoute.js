const {
  Register,
  Login,
  Logout,
  handleRefreshToken,
  VerifyEmail,
  changePassword,
} = require("../controllers/AuthController");
const userVerification = require("../middleware/AuthMiddleware");
const router = require("express").Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/verify_email", VerifyEmail);
router.post("/refresh_token", handleRefreshToken);
router.post("/change_password", userVerification, changePassword);

module.exports = router;
