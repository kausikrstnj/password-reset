const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const axios = require('axios');

//otp page
exports.otp = async (req, res) => {
    try {
        res.render("sendEmail");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// Home 
exports.getHome = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


//redirect to signup page page
exports.register = async (req, res) => {
    try {
        res.render("signUp");
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error")
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ username });
        if (!user) {
            return res
                .status(400)
                .json({ msg: "Username or password is incorrect." });
        }

        //Validate password
        const isMath = await bcrypt.compare(password, user.password);
        if (!isMath) {
            return res
                .status(400)
                .json({ msg: "Username or password is incorrect." });
        }

        //Generate JWT token
        const payload = {
            user: {
                id: user.id,
                role: "mentor",
                hash: user.password,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
        res.status(201).json({ msg: "User Logged in successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
};

// Create a new mentor
exports.signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if the user already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Create a new user
        user = new User({ username, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ msg: "User registered successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

//To send random string via mail
exports.sendEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        // Generate random string for password reset
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store the resetToken in the database for future verification
        user.randomstring = resetToken;
        await user.save();

        // Send email with password reset link
        const url = process.env.URL;
        const resetLink = `${url}/passwordReset?token=${resetToken}&email=${email}`;
        // Send email with the resetLink using your email service
        await sendResetEmail(email, resetLink); // Implement this function to send email

        res.status(200).json({ msg: "Password reset link has been sent to your email successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
async function sendResetEmail(email, resetLink) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'kausikrstnj@gmail.com',
                pass: process.env.PASSWORD
            }
        });

        // Email content
        const mailOptions = {
            from: 'kausikrstnj@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `Your random string for password reset: ${resetLink}`,
            html: `<h3>Greetings ${email}!!</h3><b>Your random string for password reset: ${resetLink}</b>`
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Route to handle password reset link
exports.getResetPasswordLink = async (req, res) => {
    try {
        const { token } = req.query;
        // Query the database to find a user with the provided random string
        const user = await User.findOne({ randomstring: token });
        if (user) {
            res.render("resetPasswordForm", { token }); // Render your password reset form view with the token
        } else {
            res.status(404).send("Invalid password reset link");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// Route to handle password reset form submission
exports.postResetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Query the database to find a user with the provided random string
        const user = await User.findOne({ randomstring: token });

        if (user) {
            // Update the user's password in the database and clear the random string
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            user.randomstring = "";
            await user.save();
            return res.status(200).send("Password reset successfully");
        } else {
            return res.status(404).send("Invalid password reset link");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};
