const mongoose = require("mongoose");

async function connectDB() {
  const dbPassword = process.env.DB_PASSWORD;
  try {
    await mongoose.connect(
      `mongodb+srv://yusuff4u2c:${dbPassword}@cluster0.jxkxq.mongodb.net/hushhive`
    );
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection failed: ", error.message);
  }
}
module.exports = connectDB;
