const express = require("express");
const db = require("../db.js");
const bcrypt = require('bcrypt'); 
const saltRounds = 10;
const router = express.Router();
const jwt = require("jsonwebtoken");
router.use(express.json());
require("dotenv").config();

// POST login, verifies details and returns a JWT in JSON and sets cookies
// REQ:{ username: "username", password: "password" }
// RES: code 200 upon successful login, as well as a JWT, 4xx/5xx if any issues, as well as custom message

router.post("/", async (req, res) => {
    console.log("POST request recieved to api/login")
    if(!(req.body.username && req.body.password)){
        console.log("No username or password");
        res.status(400).send({message: "Not all fields have been filled out"});
        return;
    }

    // Ensure username and password are strings
    if (!(typeof req.body.username === 'string' && typeof req.body.password === 'string')) {
        console.log("Username or password are not strings");
        res.status(400).send({message: "Username and password must be strings"});
        return;
    }
    
    let userObject = await db.getUserFromLogin(req.body.username);

    if (userObject != null) {
        // Convert user_login id to supergroup id, via appending G29- to the start
        let uid = "G29-" + userObject.user_id;

        // Compare (hashed) password received with (hashed) password in the db, true if equivalent and vice-versa
        const comparison = await bcrypt.compare(req.body.password, userObject.password)
        //if both passwords are equivalent 
        if (comparison) {
            // Ensure user is added to user_activity
            let addedUser = await db.addUserToActivity(uid, req.body.username);
            if (!addedUser) {
                console.log("Database Error");
                res.status(500).send({message: "Unable to add user to activity table"});
                return;
            }

            // Generate JWT
            let token = await generateJWT(uid, req.body.username);
            // Set token as httponly cookie, set auth cookie, and return JWT in json also
            console.log("Information correct, setting cookies");
            res.status(200)
            .cookie("token", token, { httpOnly: true, sameSite: true, secure: true, maxAge: 86400000 })
            .cookie("authenticated", true, {sameSite: true, secure: true, maxAge: 86400000})
            .json({"token" : token});
            return;
        } else {
            console.log("Incorrect password");
            res.status(400).send({message: "Incorrect username or password"});
            return;
        }
    } else {
        console.log("Incorrect username")
        res.status(400).send({message: "Incorrect username or password"}); 
        return;
    }

});

// Helper function to generate JWT
async function generateJWT(user_id, username) {
    let payload = {
        userID : user_id,
        groupID: 29,
        displayName: username
    };
    let privateKey = process.env.JWTPRIVATEKEY.replace(/\\n/g, '\n'); //https://stackoverflow.com/a/55459738
    // Sign JWT to last a day with the correct payload
    let token = jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn : "1d"});
    return token;
}

module.exports = router;