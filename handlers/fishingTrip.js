const { User, FishingTrip, Otp, FishingSuggestion } = require("../models");
const client = require("../config/mqtt");
async function tripEndHandler(phoneNumber) {
    await FishingTrip.updateOne({
        phonenumber: phoneNumber,
        tripstatus: 1
    },
        {
            $set: 0
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


function generateOtp() {
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    return otp;
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

const handleIndividualTripAlert = async (req, res) => {
    try {
        const tripId = req.body.tripId;
        const alertMessage = req.body.alertMessage;
        const fishingTrip = await FishingTrip.findOne({
            id: tripId
        });
        const phonenumber = fishingTrip.phonenumber;
        client.publish("smser", JSON.stringify({
            "from": "+918925423535",
            "to": `+91${phonenumber}`,
            "msg": `Alert : ${alertMessage}`
        }), function (err) {
            if (err) {
                console.error("Error occurred while publishing message:", err);
                return res.status(201).send({ message: "Cannot send message" });
            } else {
                console.log("Message published successfully");
                return res.status(200).send({ message: "Message sent successfully" });
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(201).send({ message: "Cannot send message" });
    }
}

const handleFishingZoneSuggestionPing = async (parsedMessage) => {
    try {
        const {  lat, long ,phonenumber} = parsedMessage;
        const suggestionRequest = new FishingSuggestion({
            lat: lat,
            long: long,
            phonenumber : phonenumber
        });
        await suggestionRequest.save();
        return;
    }
    catch (err) {
        console.error(err);
    }
}

const handleFishingZoneSuggestionAlert = async (req, res) => {
    
    try{
    const { lat, long, phonenumber} = req.body;

    client.publish("smser", JSON.stringify({
        "from": "+918925423535",
        "to": `+91${phonenumber}`,
        "msg": `SR ${lat} ${long}`
    }), function (err) {
        if (err) {
            console.error("Error occurred while publishing message:", err);
            return res.status(201).send({ message: "Cannot send message" });
        } else {
            console.log("Message published successfully");
            return res.status(200).send({ message: "Message sent successfully" });
        }
    })}
    catch(err){
        console.error(err);
        return res.status(200).send({message : "Couldnt send message"});
    }

}

const getAllSuggestionPings= async(req,res) =>{
    try{
        const allSuggestionData = await FishingSuggestion.find();
        return res.status(200).json({suggestionData : allSuggestionData});
    }catch(err){
        console.error(err);
        return res.status(200).send({message : "Couldnt retreive suggestion pings"});
    }
}


module.exports = { getAllSuggestionPings, handleCaptureUpdate, handleLocationUpdate, tripStartHandler, tripEndHandler, handleIndividualTripAlert, handleFishingZoneSuggestionPing , handleFishingZoneSuggestionAlert};