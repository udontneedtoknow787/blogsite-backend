import dotenv from "dotenv"
dotenv.config();

import winston from "winston";
import DatadogWinston from "datadog-winston";
import os from "os"

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport for local debugging
    new winston.transports.Console(),
    // Datadog transport for sending logs to Datadog
    new DatadogWinston({
      apiKey: process.env.DATADOG_API_KEY, // Set your Datadog API key in env
      hostname: os.hostname(),
      service: "blogsite-backend", // Change to your service name
      ddsource: "nodejs",
      ddtags: "env:development,project:blogsite",
      intakeRegion: "us5",
    })
  ]
});

logger.on('error', (err) => {
  console.error('Logger error:', err);
});

// for refrence level (decreasing order of severity):
// "error"
// "warn"
// "info"
// "http"
// "verbose"
// "debug"
// "silly"

export default logger;