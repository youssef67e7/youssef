const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error(`MongoDB error: ${err}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting to reconnect...");
  });

  const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Closing MongoDB connection...`);
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error(`Error during shutdown: ${err}`);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
};

module.exports = connectDB;
