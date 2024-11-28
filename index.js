const express = require("express");
const connectDB = require("./src/data/db");
const helmet = require("helmet");
const authRoute = require("./src/routes/AuthRoute");
const messageRoute = require("./src/routes/MessageRoute");
const userRoute = require("./src/routes/UserRoute");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorMiddleware = require("./src/middleware/errorHandler");
const net = require("net");

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "https://hushhive-frontend.vercel.app",
      "http://localhost:5173",
      "https://hushhive.yemscript.com",
    ],
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
  // res.send("Welcome to the chat app");
  const host = "smtp.mailtrap.io"; // Replace with the server's address
  const port = 2525; // Replace with the port number to check

  (async () => {
    const socket = new net.Socket();

    const isPortOpen = await new Promise((resolve) => {
      socket.setTimeout(2000); // Set a timeout for the connection

      socket.connect(port, host, () => {
        socket.destroy(); // Close the connection
        resolve(true); // Port is open
      });

      socket.on("error", () => {
        socket.destroy();
        // Close the connection on error
        resolve(false); // Port is closed
      });

      socket.on("timeout", () => {
        socket.destroy(); // Close the connection on timeout
        resolve(false); // Port is closed due to timeout
      });
    });

    if (isPortOpen) {
      res.send(`Port ${port} on ${host} is OPEN.`);
      console.log(`Port ${port} on ${host} is OPEN.`);
    } else {
      res.send(`Port ${port} on ${host} is CLOSED.`);
      console.log(`Port ${port} on ${host} is CLOSED.`);
    }
  })();
});

app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
