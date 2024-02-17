const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://broker.emqx.io");
const {fishingTrip} = require("../handlers")

client.on("connect", function () {
    console.log("Connected to MQTT broker");
    
});

client.on("error", function (error) {
    console.error("Error occurred:", error);
});

client.subscribe("smser", (err => {
    console.error("Error occurred:", err);
}) )

client.on("message", (topic, message) => {
    console.log(JSON.parse(message))
})

module.exports = client;