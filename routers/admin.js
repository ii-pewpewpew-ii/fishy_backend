const express = require("express");
const router = express.Router();
const {admin} = require("../handlers");

router.post("/",admin.findAllHandler);

module.exports = router;

