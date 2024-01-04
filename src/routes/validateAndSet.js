const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Code to set token to one sent from another group in the supergroup - required for interoperability
router.get("/:jwt?", async (req,res) => {
    console.log("GET request recieved to /auth/retrieveToken");
    
    // Get JWT and validate that it is signed by a known supergroup
    let token = req.params.jwt;
    if (!token) {
        console.log("No token in URL");
        res.status(400).send("Validation error: No token in URL. Please return to /login");
        return;
    }

    // Check that the token contains the correct details in the payload
    let decoded = jwt.decode(token);
    if (!decoded || !decoded.groupID || !decoded.userID || !decoded.displayName) {
        console.log("Invalid token");
        res.status(400).send("Validation error: JWT does not contain payload with groupID, userID and displayName. Please return to /login");
        return;
    }

    // Get public key from database
    let publickey = await db.getPublicKey(decoded.groupID);
    if(publickey == null) {
        console.log("Group has not been stored in db");
        res.status(400).send("Validation error: This groups public key has not been stored. Please return to /login");
        return;
    }

    // If token cannot be verified, notify user. Otherwise set token and auth cookies and redirect to front page
    jwt.verify(token, publickey, { algorithms: ["RS256"] }, async function(err, decoded) {
        if (err) {
            console.log(err);
            res.status(400).send("Validation error: This token cannot be validated by the groups public key. Please return to /login");
            return;
        } else {
            // Ensure user is added to user_activity
            let added = await db.addUserToActivity(decoded.userID, decoded.displayName);
            if (!added){
                res.status(500).send("Database error: Could not store user in database");
            }
            
            // get exp claim and figure out how long to set the cookies for
            let exp = decoded.exp;
            let currentDate = new Date / 1000;
            let ageRemaining = (exp - currentDate) * 1000;
            // Ensure the cookies expire exactly when the token expires
            console.log("Token valid, setting cookies and redirecting");
            res.cookie("token", token, { httpOnly: true, sameSite: true, secure: true, maxAge: ageRemaining })
            .cookie("authenticated", true, {sameSite: true, secure: true, maxAge: ageRemaining})
            .redirect("/");
            return;
        }
    });


});

module.exports = router;