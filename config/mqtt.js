const mqtt = require("mqtt");
const { User, FishingTrip } = require("../models");

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
    }
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

module.exports = {client,handleLogin};