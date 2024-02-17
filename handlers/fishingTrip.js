const {FishingTrip} = require("../models");

const handleLocationUpdate = async(req,res) =>{
    try{
        const {phoneNumber} = req.body.phoneNumber;
        const currentTrip = await FishingTrip.findOne({
            phonenumber : phoneNumber
        });
        if(!currentTrip){
            console.log("Cannot find trip with phone Number");
            return res.status(401).send({message : "No fishing trip found for the phone number"});
        }
        currentTrip.updateOne()
    }
    catch(err){
        console.error(err);
        return res.status(501).send({message : "Internal Server errorrr"});
    }
}