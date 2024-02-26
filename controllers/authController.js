const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Home 
exports.getHome = async (req, res) => {
    try {
        res.render("home");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

//otp page
exports.otp = async (req, res) => {
    try {
        res.render("otp");
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