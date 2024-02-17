const bcrypt = require("bcrypt");
const { User, Otp } = require("../models");
const router = require("../routers/auth");
const {v4 :  uuidv4} = require('uuid');
const client = require("../config/mqtt");

const handleRegister = async (req, res) => {
    try {
        console.log("Handling Register");
        const { otp, phoneNumber, fullName } = req.body;
        const existingUser = await User.findOne({ phonenumber: phoneNumber });
        if (existingUser) {
            return res.status(200).json({ isRegistered: false, message: 'User already registered.' });
        } else {
            const otpVerify = await Otp.findOne({ phonenumber: phoneNumber });
            if (otpVerify && otpVerify.otp === otp) {

                const newUser = new User({
                    fullname: fullName,
                    phonenumber: phoneNumber,
                    otp: otp
                });

                await newUser.save();

                console.log("User saved successfully");

                res.status(200).json({ isRegistered: 1 , message : "Successfully Registered"});
            }
            else {
                res.status(200).json({ isRegistered: 0, message : "Invalid OTP" });
            }
        }
    }
    catch (err) {
        console.error(err);
        res.send({ message: "Failed to register user", isRegistered : 0 });
    }
}

const handleCheckPhoneNumber = async (req, res) => {
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
        res.status(200).json({ isAvailable: false, message: 'Internal server error' });
    }
}


const handleGetOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        console.log("Got Get OTP Request. : " + phoneNumber);

        const generatedOTP = generateOtp();
        send_otp(generatedOTP,phoneNumber);
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
        res.status(200).json({ isOtpSent: false, message: 'Internal server error' });
    }

}

const handleLogin = async (req, res) => {
    try {
        console.log("Handling Login");
        const { otp, phoneNumber } = req.body;
        const existingUser = await User.findOne({ phonenumber: phoneNumber });
        if (existingUser) {
            const otpVerify = await Otp.findOne({ phonenumber: phoneNumber });
            if (otpVerify && otpVerify.otp === otp) {
                console.log("User saved successfully");
                res.status(200).json({ isLoggedIn: 1 });
            }
            else {
                res.status(200).send({ message: "Invalid OTP" });
            }
        } else {
            return res.status(200).send({message : "Register before logging in"});
        }
    }
    catch (err) {
        console.error(err);
        res.status(200).send({ message: "Failed to register user" });
    }
}

function send_otp(otp_number,phoneNumber) {
    client.publish("smser", JSON.stringify({
        "from": "+918925423535",
        "to": `+91${phoneNumber}`,
        "msg": "Your OTP is " + otp_number + ". Don't Share OTP."
    }), function (err) {
        if (err) {
            console.error("Error occurred while publishing message:", err);
        } else {
            console.log("Message published successfully");
        }
    });
}


function generateOtp() {
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    return otp;
}

module.exports = { handleRegister, handleCheckPhoneNumber, handleGetOtp, handleLogin };