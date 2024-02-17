const mongoose = require("mongoose");
const models = require("../models");
const dotenv = require("dotenv").config();

const dbUri = process.env.MONGODB_URI;

console.log("Connecting to DB");
mongoose.connect(dbUri)


console.log("Connected");