const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());

// POST solution, verifies correct and adds to db
// REQ: { post_id: <value>, solution: <2d array> }
// RES: code 200 upon successful submission, 400 if request is bad, 404 if no user / post found matching

router.post("/", async (req, res) => {
    console.log("POST request recieved to /api/submitSolve");
    console.log(req.auth.userID);
    // Check post formatted correctly
    if (!(req.auth.userID && req.body.post_id && req.body.solution)) {
        console.log("Incorrect parameters");
        res.status(400).send({message: "Incorrect parameters"});
        return;
    }
    
    // Check that solution submitted is correct
    let submitSolveTest = await db.submitSolveChecks(req.auth.userID, req.body.post_id, req.body.solution);
    if(submitSolveTest.code==200){
        // Attempt to add to database that user has solved this puzzle
        let entered = await db.updateSolvedPuzzles(req.auth.userID, req.body.post_id)
        if (entered) {
            console.log("Solve submitted");
            res.status(200).send({message: "Solve submitted"});
            return;
        } else {
            console.log("Database error");
            res.status(500).send({message: "Unable to submit solve to database"});
        }
        
    }
    else {
        res.status(submitSolveTest.code).send({message: submitSolveTest.message});
    }
});

module.exports = router;