const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());

// GET leaderboard - returns top 29 users by solves - up to 29
// REQ: 
// RES: {users:[{ username: <value>, user_id: <value>, nopuzzlessolved: <value>}]}, or 404 if no users found
router.get("/", async (req,res) => {
    console.log("GET request recieved to /api/leaderboard");
    let rows = await db.getTopSolvers(29);
    if (rows.length) {
        users = [];
        //push top 10 users to the users array 
        for (let i =0; i < rows.length; i++) {
            let user = {username:rows[i].username,
                        user_id:rows[i].user_id,
                        nopuzzlessolved:rows[i].nopuzzlessolved}
            users.push(user);
        }
        // Send array as response
        let response = {
            users: users            
        };
        console.log("Sending top users");
        res.status(200).json(response);
    } else {
        console.log("No users found");
        res.status(404).send({message: "No users found"});
    }

});
module.exports = router;