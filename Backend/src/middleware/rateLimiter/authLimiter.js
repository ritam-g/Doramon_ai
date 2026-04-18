import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 60 * 1000,// 1 minute
  max: 5, // very strict
  message: "Too many login attempts"
});

export default authLimiter;