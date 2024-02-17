const bcrypt = require("bcrypt");
const { User, Otp } = require("../models");
const router = require("../routers/auth");
const uuidv4 = require('uuid');

const handleRegister = async (req, res) => {
    try {
        console.log("Handling Register");
        const { otp, phoneNumber, fullName } = req.body;
        const existingUser = await User.findOne({ phonenumber: phoneNumber });
        if (existingUser) {
            return res.status(400).json({ isRegistered: false, message: 'User already registered.' });
        } else {
            const newUser = new User({
                fullname: fullName,
                phonenumber: phoneNumber,
                otp: otp
            });

            await newUser.save();

            console.log("User saved successfully");

            res.status(200).json({ isRegistered: 1 });
        }
    }
    catch (err) {
        console.error(err);
        res.send({ message: "Failed to register user" });
    }
}

const handleCheckPhoneNumber = async (req,res)=>{
    try {
        const { phoneNumber } = req.body;
        console.log("Got Check Phone Number Request. : " + phoneNumber);

        const existingUser = await User.findOne({ phonenumber: phoneNumber });
        if (existingUser) {
            console.log("Existing Phone Number - " + phoneNumber);
            return res.status(200).json({ isAvailable: false });
        } else {
            console.log("No Existing Phone Number - " + phoneNumber);
            return res.status(200).json({ isAvailable: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ isAvailable: false, message: 'Internal server error' });
    }
}


const handleGetOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        console.log("Got Get OTP Request. : " + phoneNumber);

        const generatedOTP = generateOtp();
        let otpRecord = await Otp.findOne({ phonenumber: phoneNumber });

        if (!otpRecord) {
            otpRecord = new Otp({ phonenumber: phoneNumber, otp: generatedOTP });
            await otpRecord.save();
        } else {

            otpRecord = await Otp.findOneAndUpdate(
                { phonenumber: phoneNumber },
                { $set: { otp: generatedOTP } },
                { new: true }
            );
        }

        if (otpRecord) {
            console.log("OTP sent for Phone Number - " + phoneNumber);
            return res.status(200).json({ isOtpSent: true });
        } else {
            console.log("Failed to send OTP for Phone Number - " + phoneNumber);
            return res.status(200).json({ isOtpSent: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ isOtpSent: false, message: 'Internal server error' });
    }

}

function generateOtp(){
    const uuid = uuidv4(); 
    const uuidDigits = uuid.replace('/\D/g', ''); 
    const randomNumber = parseInt(uuidDigits.substring(0, 6)); 
    console.log('Random Number : ' + randomNumber);
    return randomNumber;
}

module.exports = {handleRegister,handleCheckPhoneNumber,handleGetOtp};