const { User, FishingTrip, Otp, FishingSuggestion } = require("../models");
const client = require("../config/mqtt");
async function tripEndHandler(phoneNumber) {
    await FishingTrip.updateOne({
        phonenumber: phoneNumber,
        tripstatus: 1
    },
        {
            $set: { tripstatus: 0 }
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
        const { lat, long, phonenumber } = parsedMessage;
        const suggestionRequest = new FishingSuggestion({
            lat: lat,
            long: long,
            phonenumber: phonenumber
        });
        await suggestionRequest.save();
        return;
    }
    catch (err) {
        console.error(err);
    }
}

const handleFishingZoneSuggestionAlert = async (req, res) => {

    try {
        const { lat, long, phonenumber } = req.body;

        const fishingSuggestion = await FishingSuggestion.findOne({
            phonenumber: phonenumber
        })

        const slat = parseFloat(fishingSuggestion.lat);
        const slong = parseFloat(fishingSuggestion.long);

        const elat = parseFloat(lat);
        const elong = parseFloat(long);

        const haversineDistance = haversine(slat, slong, elat, elong);
        const bearingCalculated = bearing(slat, slong, elat, elong);

        client.publish("smser", JSON.stringify({
            "from": "+918925423535",
            "to": `+91${phonenumber}`,
            "msg": `SR ${lat} ${long} ${haversineDistance} ${bearingCalculated}`
        }), function (err) {
            if (err) {
                console.error("Error occurred while publishing message:", err);
                return res.status(201).send({ message: "Cannot send message" });
            } else {
                console.log("Message published successfully");
                return res.status(200).send({ message: "Message sent successfully" });
            }
        })
    }
    catch (err) {
        console.error(err);
        return res.status(200).send({ message: "Couldnt send message" });
    }

}

const getAllSuggestionPings = async (req, res) => {
    try {
        const allSuggestionData = await FishingSuggestion.find();
        return res.status(200).json({ suggestionData: allSuggestionData });
    } catch (err) {
        console.error(err);
        return res.status(200).send({ message: "Couldnt retreive suggestion pings" });
    }
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c;
    distance = distance.toString()
    return distance;
}

function bearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
        Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    let brng = Math.atan2(y, x);
    brng = brng * 180 / Math.PI;
    brng = (brng + 360) % 360;
    brng = brng.toString();
    return brng;
}

module.exports = { getAllSuggestionPings, handleCaptureUpdate, handleLocationUpdate, tripStartHandler, tripEndHandler, handleIndividualTripAlert, handleFishingZoneSuggestionPing, handleFishingZoneSuggestionAlert };