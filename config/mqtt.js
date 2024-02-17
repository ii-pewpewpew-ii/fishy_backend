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
    // console.log(JSON.parse(message))
    parsedMessage = JSON.parse(message);
    handleMessage(parsedMessage);
})

const handleMessage = async(parsedMessage)=>{
    let message = parsedMessage.msg;
    let contents = message.split(' ');
    if(contents[0] === 'G'){
        fishingTrip.handleLocationUpdate({fromNumber : from,lat : contents[1],long : contents[2],timestamp : contents[3]});
    }else if(contents[0] === 'C'){
        fishingTrip.handleCaptureUpdate({fromNumber : from,lat : contents[1],long : contents[2],timestamp : contents[3],species : contents[4]});
    }
}
module.exports = client;