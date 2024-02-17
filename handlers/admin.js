
const { User, FishingTrip } = require("../models");
const client = require("../config/mqtt");

const findAllHandler = async (req, res) => {
    try {
        const allActiveFishingTrips = await FishingTrip.find({
            tripstatus: 1
        });

        const userDetailsPromises = allActiveFishingTrips.map(async (doc) => {
            const userDetail = await User.findOne({ phonenumber: doc.phonenumber });
            return userDetail;
        });

        const allUserDetails = [];
        await Promise.all(userDetailsPromises.map(async (userDetailPromise) => {
            const userDetail = await userDetailPromise;
            if (userDetail) {
                allUserDetails.push(userDetail);
            }
        }));

        return res.status(200).json({
            userDetails: allUserDetails,
            fishingTripDetails: allActiveFishingTrips
        });
    }
    catch (err) {
        console.error(err);
        return res.status(200).json({
            message: "Failed to load details from db"
        });
    }
}


function generateOtp() {
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    return otp;
}

const tripStartHandler = async (phoneNumber) => {
    try {
        const existingTrip = await FishingTrip.find({
            phonenumber: phoneNumber
        });

        for (const trip of existingTrip) {
            trip.tripstatus = 0;
            await trip.save();
        }
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

module.exports = { findAllHandler, tripStartHandler }