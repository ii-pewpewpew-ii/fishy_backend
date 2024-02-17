
const { User, FishingTrip } = require("../models");


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

module.exports = { findAllHandler }