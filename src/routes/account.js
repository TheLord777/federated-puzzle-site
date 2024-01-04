const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());

// Simple GET to retrieve details about a given user ID
// Details include: username, group ID, puzzles solved, puzzles created, role
router.get("/:id", async (req, res) => {
    console.log("GET request recieved to /api/account");

    // Ensures JWT is valid
    if(!(req.auth.displayName && req.auth.groupID && req.auth.userID)){
        res.status(400).send({message: "Invalid JWT - no displayName/groupID"});
        return;
    }

    // Get username and role
    let details = await db.getUserFromActivity(req.params.id)
    if (details == null) {
        console.log("no username and role");
        res.status(500).send({message: "Error: could not retrieve user info from database"});
        return;
    }

    // Get nopuzzlessolved
    let numSolved = await db.getNoPuzzlesSolved(req.params.id);
    // Handle database error
    if (numSolved == -1) {
        console.log("no numsolved");
        res.status(500).send({message: "Error: could not retrieve puzzles solved info from database"});
        return;
    }

    // Get number of puzzles created
    let numCreated = await db.getNoPuzzlesCreated(req.params.id);
    // Handle database error
    if (numCreated == -1) {
        console.log("no puzzles created");
        res.status(500).send({message: "Error: could not retrieve puzzles created info from database"});
        return;
    }

    // Get bio
    let bio = await db.getBioFromID(req.params.id);
    // Handle database error
    if (bio == null) {
        console.log("no bio");
        res.status(500).send({message: "Error: could not retrieve bio info from database"});
        return;
    }

    // Get their group from ID
    let group = req.params.id.substring(1, 3)

    // Send username, group ID and number of puzzles solved back to frontend
    console.log("Sending account details");
    res.status(200).send({username: details.username, role: details.user_role, group: group, noPuzzlesSolved: numSolved, noPuzzlesCreated: numCreated, bio: bio});
    return;
});

// PATCH to edit user details
router.patch("/", async (req, res) => {
    console.log("PATCH request recieved to /api/account");
    message = "";
    error = false;

    // Ensures JWT is valid
    if(!(req.auth.displayName && req.auth.groupID && req.auth.userID)){
        console.log("JWT Invalid");
        res.status(400).send({message: "Invalid JWT - no displayName/groupID"});
        return;
    }

    if (!req.body.username || req.body.bio == null) {
        console.log("Updated info not given");
        res.status(400).send({message: "Must give updated username and bio"});
        return;
    }

    // Ensure username, bio are strings
    if (!(typeof req.body.username === 'string' && typeof req.body.bio === 'string')) {
        console.log("Username, bio not all strings");
        res.status(400).send({message: "Username and bio must be strings"});
        return;
    }

    // Ensure username is the right size
    if (req.body.username.length < 3 || req.body.username.length > 25) {
        console.log("Username incorrect length");
        res.status(400).send({message: "Username must be between 3 and 25 characters"});
        return;
    }

    // Ensure bio is the right size
    if (req.body.bio.length > 200) {
        console.log("Bio incorrect length");
        res.status(400).send({message: "Bio must be under 200 characters"});
        return;
    }

    // Try to update username if it has been changed
    if (req.body.usernameChanged === "changed") {
        usernameUpdated = await db.updateUsername(req.auth.userID, req.body.username)
        if (usernameUpdated == 1) {
            message += "User cannot update username - doesn't belong to G29\n"
            error = true;
        } else if (usernameUpdated == 2) {
            message += "User cannot update username - user with this name already exists!\n"
            error = true;
        } else {
            message += "Username updated\n"
        }
    }
    

    bioUpdated = await db.updateBio(req.auth.userID, req.body.bio)
    if (!bioUpdated) {
        message += "Cannot update bio - database error\n"
        error = true;
    } else {
        message += "Bio Updated\n"
    }

    if (!error) {
        res.status(200).send({message: "Profile Updated", username: req.body.username, bio: req.body.bio});
    } else {
        res.status(500).send({message: message, username: req.body.username, bio: req.body.bio});
    }

    console.log(message)
    
    return;
});

// DELETE to delete user account
router.delete("/:id", async (req, res) => {
    console.log("DELETE request recieved to /api/account");
    
    let role = await db.getRole(req.auth.userID);
    let deletingRole = await db.getRole(req.params.id);

    // Ensure an admin cannot delete another admins account if they are two different admins
    if (req.auth.userID != req.params.id && role == "administrator" && deletingRole == "administrator") {
        console.log("Cannot delete another admin")
        res.status(401).send({message: "User is not authorised to delete this account (both admins)"});
        return;
    }

    // Either user is admin or this is their own account
    if (req.params.id == req.auth.userID || role == "administrator") {
        // Delete account - should cascade to posts and comments, deleting posts and removing id from comments
        let deleted = await db.deleteAccount(req.params.id);
        if (deleted) {
            if (req.params.id == req.auth.userID) {
                res.status(200).clearCookie("token").clearCookie("authenticated").send({message: "Account Deleted"});
                return;
            } else {
                console.log("Deletion successful");
                res.status(200).send({message: "Account Deleted"});
            return;
            }
        } else {
            console.log("Database Error");
            res.status(500).send({message: "Unable to delete this account"});
            return;
        }
    } else {
        console.log("Not authorised");
        res.status(401).send({message: "User is not authorised to delete this account"});
        return;
    }
});

module.exports = router;