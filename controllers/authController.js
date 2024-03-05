const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);




// Generate a random string
function generateRandomString(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Function to send OTP link via email
async function sendOtpEmail(email, otp) {
    try {
        const msg = {
            to: email,
            from: 'your_email@example.com', // Use the email you verified with SendGrid
            subject: 'OTP for Login',
            text: `Your OTP for login is ${otp}.`,
            html: `<p>Your OTP for login is <strong>${otp}</strong>.</p>`
        };
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error occurred while sending email:', error);
    }
}



//otp page
exports.otp = async (req, res) => {
    try {
        //Dummy
        const otp = generateRandomString(6); // You can adjust the length as needed
        console.log('otp :', otp)
        const userEmail = 'kausikrstnj@gmail.com';

        // Send the OTP via email
        await sendOtpEmail(userEmail, otp);
        //
        res.status(200).json({ success: true, message: "Please check your email for the One Time Password." });

        // res.render("otp");
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


//signUp page
exports.signUp = async (req, res) => {
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
        //check user already exists
        let user = await User.findOne({ username });
        if (!user) {
            return res
                .status(400)
                .json({ msg: "Username or password is  incorrect." });
        }

        //validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ msg: "Username or password is  incorrect." })
        }

        //Generate JWT (Json web token)

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

        //  res.status(201).json({ msg: "USer logged in successfully." })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error")
    }
};