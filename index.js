import "dotenv/config";
import express from "express";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import resumeRouter from "./routes/resume.routes.js";
connectDB();

const app = express();



// middleware
app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:5173",
//   credentials: true
// }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://resume-reader-theta.vercel.app"
];
console.log(allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps / Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use("/api/auth", authRouter);
app.use("/api/resume", resumeRouter);

// test route
app.get("/", (req, res) => {
  debugger;
  res.send("Backend is running 🚀");
});

// port
const PORT = process.env.PORT || 3000;

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
