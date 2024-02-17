const mongoose = require("mongoose");
const URI = process.env.MONGODB_URI;
mongoose.connect(URI);

const fishTripSchema = new mongoose.Schema({
    id : {
        type : mongoose.Schema.Types.ObjectId,
        default : mongoose.Types.ObjectId,
        required : true,
        unique : true
    },
    phoneNumber : String,
    location : [{
        lat : String,
        long : String
    }],
    speciesFound : {type : Array, "default" : []},
    tripStatus : Number
})

const FishingTrip = mongoose.model("fishingtrip",fishTripSchema);

module.exports = {FishingTrip};