const mqtt = require("mqtt");
const { User, FishingTrip ,Otp} = require("../models");
//const { handleGetOtp, handleRegister } = require("../handlers/auth");

const client = mqtt.connect("mqtt://broker.emqx.io");

client.on("connect", function () {
    console.log("Connected to MQTT broker");
    
});

client.on("error", function (error) {
    console.error("Error occurred:", error);
});

client.subscribe("smser", (err => {
    console.error("Error occurred:", err);
}) )

client.on("message", (topic, message) => {
    console.log(JSON.parse(message))
    parsedMessage = JSON.parse(message);
    handleMessage(parsedMessage);
})

const handleMessage = async(parsedMessage)=>{
    const {fishingTrip,admin} = require("../handlers");
    let message = parsedMessage.msg;
    parsedMessage.from = parsedMessage.from.substr(3);
    let contents = message.split(' ');
    console.log(contents);
    if(contents[0] === 'G'){
        handleLocationUpdate({fromNumber : parsedMessage.from,lat : contents[1],long : contents[2],timestamp : contents[3]});
    }else if(contents[0] === 'C'){
        handleCaptureUpdate({fromNumber : parsedMessage.from,lat : contents[1],long : contents[2],timestamp : contents[3],species : contents[4]});
    }else if(contents[0] === 'Trip' && contents[1] === 'started'){
        tripStartHandler(parsedMessage.from)
    }else if(contents[0] === 'Trip' && contents[1] === 'ended'){
        tripEndHandler(parsedMessage.from);
    }
}

async function tripEndHandler(phoneNumber){    
    await FishingTrip.updateOne({
        phonenumber : phoneNumber,
        tripstatus : 1
    },
    {
        $set : 0
    });
}
function generateOtp() {
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    return otp;

}

const tripStartHandler = async (phoneNumber) => {
    try {
        const updateResult = await FishingTrip.updateMany(
            { phonenumber: phoneNumber, tripstatus: 1 }, 
            { $set: { tripstatus: 0 } } 
        );
        const tripId = generateOtp();
        const newTrip = new FishingTrip(
            {
                id: tripId,
                tripstatus: 1,
                phonenumber: phoneNumber,
            }
        );
        await newTrip.save();
        client.publish("smser", JSON.stringify({
            "from": "+918925423535",
            "to": `+91${phoneNumber}`,
            "msg": `TID-${tripId}`
        }), function (err) {
            if (err) {
                console.error("Error occurred while publishing message:", err);
            } else {
                console.log("Message published successfully");
            }
        });
    } catch (error) {
        console.error(error);
    }
}

const handleLocationUpdate = async (messageJson) => {
    try {
        const phoneNumber = messageJson.fromNumber;
        const lat = messageJson.lat;
        const long = messageJson.long;
        const timestamp = messageJson.timestamp;
        const updateResult = await FishingTrip.updateMany(
            { phonenumber: phoneNumber, tripstatus: 1 }, 
            {
                $push: {
                    location: {
                        lat: lat,
                        long: long,
                        timestamp: timestamp,
                        speciesfound: ""
                    }
                }
            }
        );
        console.log("Updated location data : " + currentTrip);
    }
    catch (err) {
        console.error(err);
    }
}

const handleCaptureUpdate = async (messageJson) => {
    try {
        const phoneNumber = messageJson.fromNumber;
        const lat = messageJson.lat;
        const long = messageJson.long;
        const timestamp = messageJson.timestamp;
        const species = messageJson.species;

        if (!currentTrip) {
            console.log("No fishing trip associated with phone number");
            return;
        }
        const updateResult = await FishingTrip.updateMany(
            { phonenumber: phoneNumber, tripstatus: tripstatus }, 
            {
                $push: {
                    location: {
                        lat: lat,
                        long: long,
                        timestamp: timestamp,
                        speciesfound: species
                    }
                }
            }
        );

        console.log("Updated species data : " + currentTrip);
    } catch (err) {
        console.error(err, "Cannot update capture data");
    }
}

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

module.exports = {client,handleLogin,handleGetOtp,handleRegister};