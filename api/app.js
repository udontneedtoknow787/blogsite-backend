import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv";

const app = express()
dotenv.config();


// CORS error preventing middleware
app.use(cors({ 
  // origin: process.env.FRONTEND_URL || "*", // Allow frontend originx
  origin: "*",
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  // credentials: process.env.FRONTEND_URL ? true: false,
}));

// Handle preflight requests
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.sendStatus(204);
// });
// general middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static("public"))


// import routes
import HealthCheckRoute from "./routes/healthcheck.route.js"
import UserRoute from "./routes/user.route.js"
import BlogRoute from "./routes/blogs.route.js"
import {errorHandler} from "./middlewares/errorHandling.middleware.js"

// use routes
app.use("/api/v1/healthcheck", HealthCheckRoute)
app.use("/api/v1/users", UserRoute)
app.use("/api/v1/blogs", BlogRoute)

// oldest trick in the book
app.get("/", (req, res) => {
    return res.status(200).json({ message: "Welcome to the Homepage" })
})
app.get("/api", (req, res) => {
    return res.status(200).json({ message: "Welcome to the API" })
})
app.get("api/v1", (req, res) => {
    return res.status(200).json({ message: "Welcome to the API/v1" })
})

app.use(errorHandler)

export { app }