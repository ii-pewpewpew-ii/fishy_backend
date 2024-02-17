const client = require("../config/mqtt");
const {FishingTrip} = require("../models");



const handleLocationUpdate = async(messageJson) =>{
    try{
        const {phoneNumber} = messagJson.fromNumber;
        const currentTrip = await FishingTrip.findOne({
            phonenumber : phoneNumber
        });
        if(!currentTrip){
            console.log("Cannot find trip with phone Number");
            return res.status(401).send({message : "No fishing trip found for the phone number"});
        }
        currentTrip.location.push({lat : messageJson.lat, long : messageJson.long, timestamp : messageJson.timestamp});
    
    }
    catch(err){
        console.error(err);
        return res.status(501).send({message : "Internal Server errorrr"});
    }
}

module.exports = {handleLocationUpdate};