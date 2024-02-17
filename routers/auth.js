const express = require("express");
const {auth} = require("../handlers")
const {handleLogin} = require("../config/mqtt");
const router = express.Router();

router.post("/register",auth.handleRegister);

router.post("/getOTP",auth.handleGetOtp);

router.post('/checkPhoneNo',auth.handleCheckPhoneNumber);

router.post("/login",auth.handleLogin);

module.exports = router;
