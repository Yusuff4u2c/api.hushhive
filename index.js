const express = require("express");
const connectDB = require("./src/data/db");
const helmet = require("helmet");
const authRoute = require("./src/routes/AuthRoute");
const messageRoute = require("./src/routes/MessageRoute");
const userRoute = require("./src/routes/UserRoute");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "https://hushhive-frontend.vercel.app",
    credentials: true,
  })
);

connectDB();
app.use(express.json());

app.use(cookieParser());

app.use("auth", authRoute);
app.use("message", messageRoute);
app.use("user", userRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the chat app");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
