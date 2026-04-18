import rateLimit from "express-rate-limit";

 const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many requests"
});

export default generalLimiter