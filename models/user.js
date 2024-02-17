const  mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.MONGODB_URI;

mongoose.connect(URI);

const userSchema = new mongoose.Schema({
    fullname: String,
    phonenumber: { type: String, unique: true },
    otp: String
});

const User = mongoose.model('User', userSchema);

const otpSchema = new mongoose.Schema({
    phonenumber: { type: String, unique: true },
    otp: String,
    createdAt: { type: Date, default: Date.now, expires: '5m' } 
});

const Otp = mongoose.model("Otp",otpSchema);
module.exports = {User , Otp};
