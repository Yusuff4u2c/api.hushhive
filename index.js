const express = require("express");
const connectDB = require("./data/db");
const helmet = require("helmet");
const authRoute = require("./routes/AuthRoute");
const messageRoute = require("./routes/MessageRoute");
const userRoute = require("./routes/UserRoute");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
connectDB();
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoute);
app.use("/message", messageRoute);
app.use("/user", userRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the chat app");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
