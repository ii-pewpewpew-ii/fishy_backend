const client = require("../config/mqtt");
const {FishingTrip} = require("../models");



const handleLocationUpdate = async(messageJson) =>{
    try{
        const phoneNumber = messageJson.fromNumber;
        const currentTrip = await FishingTrip.findOne({
            phonenumber : phoneNumber
        });
        if(!currentTrip){
            console.log("Cannot find trip with phone Number");
            return;
        }
        currentTrip.location.push({lat : messageJson.lat, long : messageJson.long, timestamp : messageJson.timestamp,speciesfound : ""});
        currentTrip.save();
        console.log("Location Updated Successfully");
        console.log("Updated location data : " + currentTrip);
    }
    catch(err){
        console.error(err);
    }
}

const handleCaptureUpdate = async (messageJson) => {
    try{
        const phoneNumber = messageJson.fromNumber;
        const lat = messageJson.lat;
        const long = messageJson.long;
        const timestamp = messageJson.timestamp;
        const species = messageJson.species;

        const currentTrip = await FishingTrip.findOne({
            phonenumber : phoneNumber
        })

        if(!currentTrip){
            console.log("No fishing trip associated with phone number");
            return;
        }

        currentTrip.location.push({
            lat : lat,
            long : long,
            timestamp : timestamp,
            speciesfound : species
        });

        console.log("Updated species data : " + currentTrip);
        currentTrip.save();

    }catch(err){
        console.error(err,"Cannot update capture data");
    }
}
module.exports = {handleLocationUpdate,handleCaptureUpdate};