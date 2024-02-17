
const {User, FishingTrip} = require("../models");


const findAllHandler = async (req,res)=> {
try{
    const allActiveFishingTrips = await FishingTrip.find({
        tripStatus : 1
    });
    let allUserDetails = []
    allActiveFishingTrips.forEach(async (doc)=>{
        let userDetail = await User.findOne({
            phonenumber : doc.phonenumber
        });
        allUserDetails.push(userDetail);
    });
    return res.status(200).json({
        userDetails : allUserDetails,
        fishingTripDetails : allActiveFishingTrips
    });    
    }
    catch(err){
        console.error(err);
        return res.status(200).json({
            message : "Failed to load details from db"
        });
    }
} 

module.exports = {findAllHandler}