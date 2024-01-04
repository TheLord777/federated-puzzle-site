const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());
require("dotenv").config();

// Simple GET to send public key to requesters
router.get("/", async (req, res) => {
    console.log("GET request recieved to /auth/getKey");

    res.status(200).send(process.env.JWTPUBLICKEY.replace(/\\n/g, '\n'));
    return;
});

module.exports = router;