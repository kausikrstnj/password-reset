const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController")
const app = express();

//Register
// router.post("/register", authController.register);
app.get("/register", authController.register);
app.post("/login", authController.login);
//Login
router.post("/login", authController.login);

module.exports = router;