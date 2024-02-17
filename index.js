const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const routers = require('./routers');
const app = express();
const client = require("./config/mqtt");
client;



require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/auth",routers.authRouter);

app.use("/admin",routers.adminRouter);

const dbUri = process.env.MONGODB_URI;
console.log(dbUri + " in indexjs")
mongoose.connect(dbUri);



app.listen(8080,()=>{
    console.log("listening on port http://localhost:8080");
})