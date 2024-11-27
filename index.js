const express = require("express");
const connectDB = require("./src/data/db");
const helmet = require("helmet");
const authRoute = require("./src/routes/AuthRoute");
const messageRoute = require("./src/routes/MessageRoute");
const userRoute = require("./src/routes/UserRoute");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorMiddleware = require("./src/middleware/errorHandler");

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: ["https://hushhive-frontend.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);

connectDB();
app.use(express.json());

app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
app.use("/api/users", userRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the chat app");
});

app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
