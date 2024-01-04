const express = require("express");
const db = require("../db.js");
const bcrypt = require('bcrypt'); 
const saltRounds = 10;
const router = express.Router();
const jwt = require("jsonwebtoken");
router.use(express.json());
require("dotenv").config();

// Simple GET to all top replies of a comment
router.get("/:id", async (req, res) => {
    console.log("POST request recieved to /api/replies");

    // Get all top level replies from comment
    let repliesObject = await db.getTopLevelRepliesOfComment(req.params.id);
    if (repliesObject) {
        // Send replies object
        console.log("Sending top level replies");
        res.status(200).send(repliesObject);
        return;
    }

    res.status(404).send({message: "No replies found"});
    return;
});

module.exports = router;