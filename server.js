const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

//connect to mongoDB
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to Mongo DB"))
    .catch((err) => console.log("Could not connect to the server"))

//middleware
app.use(express.json());

//routes
app.use("/api/auth", require("./routes/authRoutes"));

// The server listens on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));