const express = require("express");
const db = require("../db.js");
const bcrypt = require('bcrypt'); 
const saltRounds = 10;
const router = express.Router();
const jwt = require("jsonwebtoken");
router.use(express.json());
require("dotenv").config();

// Simple GET to get details of a single comment
// Retrieves userid, username, content, date, likes, parent comment id
router.get("/:id", async (req, res) => {
    console.log("GET request recieved to /api/comment");

    // Get all top level comments from post
    let commentObject = await db.getComment(req.params.id);
    if (commentObject) {
        // Send comments object
        console.log("Sending comment details");
        res.status(200).send(commentObject[0]);
        return;
    }

    res.status(404).send({message: "No comment found"});
    return;
});

// POST post - add a new comment to a post
// REQ: send to api/comment {post_id: <value>, parent_comment_id: <null or value>, content: <text>}
// RES: 200 on success, 4xx/5xx and {message: <value>} upon failure
router.post("/", async (req, res) => {
    console.log("POST request recieved to /api/comment");
    //Check request formatted correctly 
    if(!(req.body.post_id && req.body.content)){
        console.log("Incorrect Parameters");
        res.status(400).send({message: "Incorrect parameters. Requires a post ID and comment content"});
        return;
    }

    // Check content is a string
    if (typeof req.body.content != 'string') {
        console.log("Content is not a string");
        res.status(400).send({message: "Comment content must be a valid string"});
        return;
    }
    // Check comment isn't too long
    if (req.body.content.length < 1 || req.body.content.length > 500) {
        console.log("Comment is incorrect length");
        res.status(400).send({message: "Comment must be between 1 and 500 characters"});
        return;
    }

    // Get date
    let date = new Date();
    date = date.toISOString();

    // Add comment to the database
    if (!req.body.parent_comment_id) {
        req.body.parent_comment_id = null;
    }
    let submitted = await db.insertUserComment(req.body.post_id, req.auth.userID, req.body.content, req.body.parent_comment_id, date);
    if(submitted != 0) {
        console.log("Comment submitted");
        res.status(200).send({message: "Comment submitted", comment_id: submitted});
    }
    else{
        console.log("Database Error");
        res.status(500).send({message: "Error inserting into database"});
    }  
});

// Simple DELETE to remove a comment
router.delete("/:id", async (req, res) => {
    console.log("DELETE request recieved to /api/comment");

    // Ensure this user owns the comment OR is an admin
    let owned = await db.doesUserOwnComment(req.auth.userID, req.params.id);
    let role = await db.getRole(req.auth.userID);

    if (owned || role == "administrator") {
        let success =await db.deleteComment(req.params.id);
        if (success) {
            console.log("Comment deleted");
            res.status(200).send({message: "Comment deleted"});
        } else {
            console.log("Database Error");
            res.status(200).send({message: "Database error"});
        }
        
    } else {
        console.log("Unauthorised");
        res.status(401).send({message: "User not authorised to delete this comment"});
    }
    return;
});

// PATCH method to alter a messages content. 
router.patch("/:id", async (req, res) => {
    console.log("PATCH request recieved to /api/comment");

    //Check request formatted correctly 
    if(!(req.body.content)){
        console.log("Incorrect Parameters");
        res.status(400).send({message: "Incorrect parameters. Requires content to edit comment with"});
        return;
    }

    // Ensure this user owns the comment
    let owned = await db.doesUserOwnComment(req.auth.userID, req.params.id);

    if (owned) {
        let success = await db.updateComment(req.params.id, req.body.content);
        if (success) {
            console.log("Comment Edited");
            res.status(200).send({message: "Comment edited"});
        } else {
            console.log("Database Error");
            res.status(500).send({message: "Database Error"});
        }
        
    } else {
        console.log("User Unauthorised");
        res.status(401).send({message: "User not authorised to edit this comment"});
    }
    return;
});

module.exports = router;