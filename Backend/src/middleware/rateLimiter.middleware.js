import rateLimit from 'express-rate-limit'

const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 15,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false
})
export default globalLimiter