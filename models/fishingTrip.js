const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.MONGODB_URI;
console.log(URI);
mongoose.connect(URI);

const fishTripSchema = new mongoose.Schema({
    id : String,
    phonenumber : String,
    location : [{
        lat : String,
        long : String,
        timestamp : String,
        speciesfound :String,
    }],
    tripstatus : Number
});

const suggestionRequestSchema = new mongoose.Schema({
    lat : String,
    long : String,
    phonenumber : String
})

const FishingSuggestion = mongoose.model("fishingsuggestion",suggestionRequestSchema);
const FishingTrip = mongoose.model("fishingtrip",fishTripSchema);

module.exports = {FishingTrip,FishingSuggestion};