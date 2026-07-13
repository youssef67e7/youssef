const mongoose = require("mongoose");

const getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  let dbStatus = stateMap[dbState] || "unknown";

  if (dbState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      dbStatus = "connected";
    } catch (err) {
      dbStatus = `error: ${err.message}`;
    }
  }

  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV,
    database: {
      status: dbState === 1 ? "ok" : "error",
      state: dbStatus,
      name: mongoose.connection.name || "clinicDB",
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
