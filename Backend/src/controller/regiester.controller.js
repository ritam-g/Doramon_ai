import userModel from "../models/user.model.js";

export async function registerController(req, res) {
    try {
        const { username, email, password } = req.body;
        const existingUser = await userModel.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email.toLowerCase()
                    ? 'Email already registered'
                    : 'Username already taken',
                err: "please change email and username and try again"
            });
        }


    } catch (error) {

    }
}

