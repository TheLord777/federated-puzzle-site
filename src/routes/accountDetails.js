const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());

// Simple GET to retrieve username and group of user who is currently logged in, as well as number of puzzles they have solved
router.get("/", async (req, res) => {
    console.log("GET request recieved to /api/accountDetails");

    // Ensures JWT is valid
    if(!(req.auth.displayName && req.auth.groupID && req.auth.userID)){
        console.log("Invalid JWT");
        res.status(400).send({message: "Invalid JWT - no displayName/groupID"});
        return;
    }

    // Get role
    let details = await db.getUserFromActivity(req.auth.userID)
    if (details == null) {
        console.log("Database Error");
        res.status(500).send({message: "Error: could not retrieve user info from database"});
        return;
    }

    // Send username, user ID. group ID and role
    console.log("Sending account details");
    res.status(200).send({username: req.auth.displayName, user_id: req.auth.userID, group: req.auth.groupID, role: details.user_role});
    return;
});

module.exports = router;