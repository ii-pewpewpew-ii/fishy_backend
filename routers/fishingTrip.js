const express = require("express");
const router = express.Router();
const {fishingTrip} = require("../handlers");

router.post("/individualAlert",fishingTrip.handleIndividualTripAlert);

router.post("/fishingzonealert",fishingTrip.handleFishingZoneSuggestionAlert);

router.post("/suggestionpings",fishingTrip.getAllSuggestionPings);

module.exports = router;
