import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv";
import logger from "./utils/logger.js";

const app = express()
dotenv.config();

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  logger.info({
    message: `${req.method} request for '${req.url}'`,
    ip: ip,
    method: req.method,
    url: req.url
  });
  next();
});

// CORS error preventing middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // Allow frontend originx
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
}));

// Handle preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});
// general middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static("public"))

// oldest trick in the book
app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the Homepage" })
})
app.get("/api", (req, res) => {
  return res.status(200).json({ message: "Welcome to the API" })
})
app.get("/api/v2", (req, res) => {
  return res.status(200).json({ message: "Welcome to the API/v2" })
})

// import routes
import HealthCheckRoute from "./routes/healthcheck.route.js"
import UserRoute from "./routes/user.route.js"
import BlogRoute from "./routes/blogs.route.js"
import { errorHandler } from "./middlewares/errorHandling.middleware.js"

// use routes
app.use("/api/v1/healthcheck", HealthCheckRoute)
app.use("/api/v1/users", UserRoute)
app.use("/api/v1/blogs", BlogRoute)

app.use(errorHandler)

export { app }