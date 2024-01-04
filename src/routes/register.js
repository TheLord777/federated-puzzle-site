const express = require("express");
const bcrypt = require('bcrypt'); 
const db = require("../db.js");
const router = express.Router();
router.use(express.json());

// POST registration, verifies user details unqiue, subsequently add to db 
// REQ:{ username: "username", email: "email", password: "password" }
// RES: code 200 upon successful submission, 400 if request is bad, 409 if
// user with register details already exits

router.post("/", async (req, res) => {
    console.log("POST request recieved to /api/register");
    //Check post formatted correctly 
    if(!(req.body.username && req.body.email && req.body.password)){
        console.log("Incorrect parameters");
        res.status(400).send({message: "Not all fields have been filled out"});
        return;
    }

    // Ensure username, email and password are strings
    if (!(typeof req.body.username === 'string' && typeof req.body.email === 'string' && typeof req.body.password === 'string')) {
        console.log("Username, email and password not all strings");
        res.status(400).send({message: "Username, email and password must be strings"});
        return;
    }
    
    // Ensure username is the right size
    if (req.body.username.length < 3 || req.body.username.length > 25) {
        console.log("Username incorrect length");
        res.status(400).send({message: "Username must be between 3 and 25 characters"});
        return;
    }
    // Ensure email conforms to rough regex
    const re = new RegExp(/^[^@]+@[^@]+\.[^@]+$/) //https://stackoverflow.com/a/50343015
    if (!re.test(req.body.email)) {
        console.log("Email invalid");
        res.status(400).send({message: "Email must contain an @ symbol and a ."});
        return;
    }
    if (req.body.email.length > 254) {
        console.log("Email length invalid");
        res.status(400).send({message: "Email cannot be longer than 254 characters"});
        return;
    }
    // Ensure password is long enough
    if (req.body.password.length < 6) {
        console.log("Password not long enough");
        res.status(400).send({message: "Password must be at least 6 characters long"});
        return;
    }
    
    // Salt and hash password
    const encryptedPassword = await bcrypt.hash(req.body.password, 10)
      
    // Attempt to register user
    let registered = await db.registerUser(req.body.username, req.body.email, encryptedPassword);
    if(registered){
        console.log("User registered")
        res.status(200).send({message: "user submitted"});
        return;
    }
    else{
        console.log("User already exists")
        res.status(409).send({message: "A user with the same username or email already exists"});
        return;
    }
});

module.exports = router;