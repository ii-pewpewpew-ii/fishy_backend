const express = require("express");
const {auth} = require("../handlers")
const {handleLogin,handleGetOtp,handleRegister} = require("../config/mqtt");
const router = express.Router();

router.post("/register",handleRegister);

router.post("/getOTP",handleGetOtp);

router.post('/checkPhoneNo',auth.handleCheckPhoneNumber);

router.post("/login",handleLogin);

module.exports = router;
