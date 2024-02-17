const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const routers = require('./routers');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/auth",routers.authRouter);

const dbUri = process.env.MONGODB_URI;
mongoose.connect(dbUri);



app.listen(8080,()=>{
    console.log("listening on port http://localhost:8080");
})