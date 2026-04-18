import { Router } from "express";
import { getMeUserController, logoutController, registerController, userLoginController, verifyEmailController } from "../controller/auth.controller.js";
import { loginValidation, registerValidation } from "../middleware/validation.js";
import { authVerifyMiddleware } from "../middleware/auth.middleware.js";
import authLimiter from "../middleware/rateLimiter/authLimiter.js";

const authRouter = Router();
/**!SECTION
 * 
 * @description - register
 * @method - POST
 * @route - /api/auth/register
 * @access - Public
 * 
 */
authRouter.post("/register", registerValidation, registerController);

/**!SECTION
 * @access - Public
 * @description - verify email
 * @method - GET
 * @route - /api/auth/verify-email
 */
authRouter.get('/verify-email',verifyEmailController)

/**!SECTION
 * 
 * @description - login
 * @method - POST 
 * @route - /api/auth/login
 * @access - Public
 * 
 */

authRouter.post("/login",authLimiter, loginValidation,userLoginController)

/**!SECTION
 * @description - getme
 * @method - GET
 * @route - /api/auth/getme
 * @access - Private
 */
authRouter.get("/getme",authLimiter,authVerifyMiddleware,getMeUserController)

/**
 * @description - logout
 * @method - POST
 * @route - /api/auth/logout
 * @access - Private
 */
authRouter.post("/logout",authLimiter,authVerifyMiddleware,logoutController)


export default authRouter;
