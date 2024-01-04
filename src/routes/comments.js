const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());
require("dotenv").config();

// Simple GET to all top level comments of a post
router.get("/:id", async (req, res) => {
    console.log("GET request recieved to /api/comments");

    // Get all top level comments from post
    let commentsObject = await db.getTopLevelCommentsOfPost(req.params.id);
    if (commentsObject) {
        // Send comments object
        console.log("Sending top level comments");
        console.log(commentsObject)
        res.status(200).send(commentsObject);
        return;
    }

    res.status(404).send({message: "No comments found"});
    return;
});

module.exports = router;