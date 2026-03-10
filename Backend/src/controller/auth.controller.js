import User from "../models/user.model.js";

export async function registerController(req, res) {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email.toLowerCase()
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email: email.toLowerCase(),
            password
        });

        await newUser.save();

        // Return success response (exclude password)
        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            verified: newUser.verified
        };

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
}

