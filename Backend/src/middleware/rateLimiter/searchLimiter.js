import rateLimit from "express-rate-limit";

 const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // higher limit for search
  message: "Too many search requests"
});


export default searchLimiter