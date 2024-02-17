const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://broker.emqx.io");

client.on("connect", function () {
    console.log("Connected to MQTT broker");
    
});

client.on("error", function (error) {
    console.error("Error occurred:", error);
});

module.exports = client;