const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();

const authController = require("./controllers/authController");

//connect to mongoDB
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to Mongo DB"))
    .catch((err) => console.log("Could not connect to the server"))

//middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

//routes
app.get("/", authController.getHome);//Done
app.post("/login", authController.login);//Done
app.post("/otp", authController.otp);//Done
app.post("/register", authController.register);//Done
app.post("/signUp", authController.signUp);//Done
app.post("/sendEmail", authController.sendEmail);//Done

app.get("/passwordReset", authController.getResetPasswordLink); // Route for password reset link
app.post("/resetPasswordForm", authController.postResetPassword); // Route for password reset form submission




// The server listens on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));