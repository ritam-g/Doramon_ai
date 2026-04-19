import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { redis } from '../config/chache.js';

export async function authVerifyMiddleware(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // 🔥 1. Check Redis blacklist
        const isBlacklisted = await redis.get(`blacklist:${token}`);

        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token expired / logged out'
            });
        }

        // 🔥 2. Verify JWT
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decode;

        next();

    } catch (err) {
        console.log("jwt err", err);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
}