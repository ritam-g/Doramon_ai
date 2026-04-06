import userModel from "../models/user.model.js";
import sendEmail from "../services/email.service.js";
import jwt from "jsonwebtoken";
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === "production";
const shouldSendVerificationEmail = (process.env.SEND_VERIFICATION_EMAIL || "false") === "true";
const appUrl = (
    process.env.APP_URL ||
    process.env.APP_BASE_URL ||
    ""
).replace(/\/+$/, "");
const rawSameSite = (process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax")).toLowerCase();
const configuredSameSite = ["lax", "strict", "none"].includes(rawSameSite)
    ? rawSameSite
    : (isProduction ? "none" : "lax");
const cookieSecure = configuredSameSite === "none"
    ? true
    : process.env.COOKIE_SECURE === "true";
const cookieDomain = process.env.COOKIE_DOMAIN;

function getAuthCookieOptions() {
    const options = {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: configuredSameSite,
        path: '/',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    if (cookieDomain) {
        options.domain = cookieDomain;
    }

    return options;
}

function getClearCookieOptions() {
    const options = {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: configuredSameSite,
        path: '/',
    };

    if (cookieDomain) {
        options.domain = cookieDomain;
    }

    return options;
}
/**
 * Controller for user registration
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 * @throws {Error} - If user already exists
 */
export async function registerController(req, res) {
    try {
        const username = req.body?.username?.trim();
        const email = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;

        // Check if user already exists
        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Create new user
        const userResponse = await userModel.create({
            username: username,
            email,
            password: password
        });

        if (shouldSendVerificationEmail) {
            // Create verification token only when verification email is enabled.
            const verificaitonToken = jwt.sign({
                email: userResponse.email,
                id: userResponse._id
            }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })
            const requestBaseUrl = `${req.protocol}://${req.get('host')}`.replace(/\/+$/, '');
            const verificationBaseUrl = appUrl || requestBaseUrl;
            const verificationUrl = `${verificationBaseUrl}/api/auth/verify-email?token=${verificaitonToken}`;
            // Send verification mail
            let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Email Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="420" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:12px;padding:30px;color:#e5e7eb;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0;color:#38bdf8;">Doraemon AI</h2>
              <p style="margin:5px 0 0;font-size:12px;color:#9ca3af;">Secure AI Workspace</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td>
              <p style="font-size:16px;">Hi <strong>${userResponse.username}</strong>,</p>
              <p style="font-size:14px;color:#9ca3af;">
                Welcome! Please confirm your email address to activate your account.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:25px 0;">
              <a href="${verificationUrl}"
                 style="background:linear-gradient(135deg,#22d3ee,#3b82f6);
                        color:#000;
                        text-decoration:none;
                        padding:12px 24px;
                        border-radius:8px;
                        font-weight:bold;
                        display:inline-block;">
                Verify Email
              </a>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td>
              <p style="font-size:12px;color:#9ca3af;">
                This link will expire in 10 minutes.
              </p>
              <p style="font-size:12px;color:#9ca3af;">
                If you didn’t create this account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:15px 0;">
              <hr style="border:none;border-top:1px solid #1f2937;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <p style="font-size:12px;color:#6b7280;">
                Need help? Contact support@cognitive.ai
              </p>
              <p style="font-size:12px;color:#6b7280;">
                © ${new Date().getFullYear()} Cognitive AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
            try {
                await sendEmail({
                    to: userResponse.email,
                    subject: 'Email Verification',
                    text: `Please click the following link to verify your email: ${verificationUrl}`,
                    html: html
                });
            } catch (emailError) {
                // In verification-email mode, email delivery is required.
                await userModel.findByIdAndDelete(userResponse._id).catch((cleanupError) => {
                    console.error('Failed to rollback user after email failure:', cleanupError);
                });

                return res.status(503).json({
                    success: false,
                    message: 'Unable to send verification email right now. Please try again in a moment.'
                });
            }
        }


        return res.status(201).json({
            success: true,
            message: shouldSendVerificationEmail
                ? 'Registration successful. Please check your email to verify your account.'
                : 'Registration successful. Please login.',
            user: {
                id: userResponse._id,
                fullName: userResponse.username,
                username: userResponse.username,
                email: userResponse.email,
                createdAt: userResponse.createdAt,
                verified: userResponse.verified,
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        if (error?.code === 11000) {
            const duplicateField = Object.keys(error?.keyPattern || {})[0];
            const duplicateMessage =
                duplicateField === 'email'
                    ? 'Email already registered'
                    : duplicateField === 'username'
                        ? 'Username already taken'
                        : 'User already exists';

            return res.status(400).json({
                success: false,
                message: duplicateMessage
            });
        }

        if (error?.name === 'ValidationError') {
            const firstValidationError = Object.values(error.errors || {})[0];
            return res.status(400).json({
                success: false,
                message: firstValidationError?.message || 'Invalid registration data'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
}

/**
 * 
 * @description - verify email
 * @method - GET
 * @route - /api/auth/verify-email
 * @access - Public
 * 
 */
export async function verifyEmailController(req, res, next) {
    try {
        // Get token from query parameter
        const token = req.query.token?.trim();

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }
        // Verify token
        let decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!decode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token'
            });
        }
        // Check if user exists
        const user = await userModel.findOne({ email: decode.email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if user is already verified
        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: 'User is already verified'
            });
        }
        user.verified = true
        await user.save()

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (err) {
        // Handle error
        console.error('Email verification error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        })
    }
}

/**!SECTION
 * 
 * @description - user login 
 * @method - POST
 * @route - /api/auth/login
 * @access - Public
 * 
 */

export async function userLoginController(req, res, next) {
    try {
        const normalizedEmail = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Check if user exists
        const user = await userModel.findOne({ email: normalizedEmail }).select('+password')
        //! Check if user exists and is verified
        if (!user || !user.verified) {
            return res.status(400).json({
                success: false,
                message: 'User not found or not verified'
            });
        }
        // Check if password is correct
        if (!await user.comparePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'

            })
        }
        // Create token
        const token = jwt.sign({
            email: user.email,
            id: user._id
        }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })
        // Set token in cookie
        res.cookie('token', token, getAuthCookieOptions())
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                fullName: user.username,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                verified: user.verified,
            }
        })
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
}
/**
 * 
 * @description - get me
 * @method - GET
 * @route - /api/auth/me
 * @access - Private
 */
export async function getMeUserController(req, res, next) {
    try {
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'User found',
            user: {
                id: user._id,
                fullName: user.username,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                verified: user.verified,
            }
        })
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during get me'
        });
    }
}

export async function logoutController(req, res) {
    try {
        res.clearCookie('token', getClearCookieOptions())
        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        })
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during logout'
        })
    }
}
