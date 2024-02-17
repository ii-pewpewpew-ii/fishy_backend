const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.MONGODB_URI;
console.log(URI);
mongoose.connect(URI);

const fishTripSchema = new mongoose.Schema({
    id : {
        type : String,
        required : true,
        unique : true
    },
    tripId : String,
    phonenumber : String,
    location : [{
        lat : String,
        long : String,
        timestamp : String
    }],
    speciesfound : {type : Array, "default" : []},
    tripStatus : Number
})

const FishingTrip = mongoose.model("fishingtrip",fishTripSchema);

module.exports = {FishingTrip};