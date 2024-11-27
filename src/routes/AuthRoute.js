const AuthController = require("../controllers/AuthController");
const userVerification = require("../middleware/isAuthenticated");
const router = require("express").Router();

const {
  Register,
  Login,
  Logout,
  VerifyEmail,
  handleRefreshToken,
  changePassword,
} = AuthController;

router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/verify_email", VerifyEmail);
router.post("/refresh_token", handleRefreshToken);
router.post("/change_password", userVerification, changePassword);

module.exports = router;
