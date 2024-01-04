const { parse } = require("dotenv");
const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());

// Dynamic import. This allows the backend to share the same puzzle verification methods as the frontend,
// without having to refactor every require to use import syntax instead
let puzzleMethods;
async function loadPuzzleMethods() {
    puzzleMethods = await import("../frontend/src/puzzleMethodFrontend.js");
}

let puzzleMethodsX;
async function loadPuzzleMethodsX() {
    puzzleMethodsX = await import("../frontend/src/puzzleMethodVariant.js");
}

let uniqueMethods;
async function loadUniqueMethods() {
    uniqueMethods = await import("../frontend/src/checkUniqueSolution.js");
}

// GET post - returns specific post
// REQ: send to /api/posts/<POST ID>
// RES: {post_title: <value>, post_author: <value>, post_author_id: <value>, post_time: <value (in Date.toJSON() format)>, puzzle: <puzzle JSON>}, 404 if no post found
router.get("/:id", async (req, res) => {
    console.log("GET request recieved to /api/posts");
    let postObject = await db.getUserPost(req.params.id);
    if (postObject) {
        // Remove solution from puzzle so users cannot look at GET request for answer
        let puzzle = JSON.parse(postObject.puzzlejson)
        //puzzle.solution = null;
        puzzle = JSON.stringify(puzzle);
        postObject.puzzlejson = puzzle;
        // Check if user has solved this post before:
        let solvedBefore = await db.hasUserSolvedPost(req.auth.userID, req.params.id);
        // Format and send response
        let response = {
            post_title: postObject.title, 
            post_author: postObject.username,
            post_author_id: postObject.user_id,
            post_time: postObject.date_posted,
            puzzle: postObject.puzzlejson,
            solved_by_user: solvedBefore
        };
        console.log("Sending post");
        res.status(200).setHeader('Content-Type', 'application/json').json(response);
    } else {
        console.log("Post ID not found");
        res.status(404).send({message: "Post ID not found"});
    }
});

// POST post - enter a new puzzle/post into the database
// REQ: send to /api/posts/ {post_title: <value>, puzzle: <puzzle JSON>}
// RES: 200 on success, 4xx/5xx and {message: <value> } upon failure
router.post("/", async (req, res) => {
    console.log("POST request recieved to /api/posts");
    //Check post formatted correctly 
    if(!(req.body.post_title && req.body.puzzle && req.auth.userID)){
        console.log("Incorrect Parameters");
        res.status(400).send({message: "Incorrect parameters. Requires post title, submitted puzzle, and must have a valid JWT"});
        return;
    }

    // Check that user has the "creator" or "administrator" role
    let role = await db.getRole(req.auth.userID);
    if (!role) {
        console.log("Database Error");
        res.status(500).send({message: "Cannot retrieve user details from database"});
        return;
    } else if (role != "creator" && role != "administrator") {
        console.log("Unauthorised to create puzzle");
        res.status(401).send({message: "User does not have correct permissions to submit a new puzzle"});
        return;
    }

    // Check post title is a string
    if (typeof req.body.post_title != 'string') {
        console.log("Post title is not a string");
        res.status(400).send({message: "Post title must be a valid string"});
        return;
    }
    // Check post title isn't too long
    if (req.body.post_title.length < 3 || req.body.post_title.length > 100) {
        console.log("Post title is incorrect length");
        res.status(400).send({message: "Post title must be between 3 and 100 characters"});
        return;
    }

    // Get date
    let date = new Date();
    date = date.toISOString();

    // Attempt to parse puzzle and handle failure to parse
    let parsedPuzzle;
    try {
        parsedPuzzle = JSON.parse(req.body.puzzle);
    } catch (error) {
        console.log(error);
        res.status(400).send({message: "Given puzzle not in correct JSON format"});
        return;
    }
    console.log(parsedPuzzle["puzzle-type"]);
    // Ensures the submitted puzzle is sudoku
    if (!["x-sudoku", "sudoku"].includes(parsedPuzzle["puzzle-type"])) {
        console.log("Puzzle is not sudoku")
        res.status(400).send({message: "Puzzle is not a valid type: only sudoku and x-sudoku puzzles are supported currently"});
        return;
    }

    // Runs different tests based on puzzle type
    if (parsedPuzzle["puzzle-type"] == "sudoku") {
        // Dynamically import the methods from puzzleMethodFrontend.js
        await loadPuzzleMethods();
        await loadUniqueMethods();

        // Check validity of puzzle, initial values, and that they match
        if (!puzzleMethods.runAllTemplateTests(parsedPuzzle.values)) {
            console.log("Template not valid");
            res.status(400).send({message: "Given initial values are not in valid configuration"});
            return;
        } else if (!puzzleMethods.templateVerification(parsedPuzzle.values, parsedPuzzle.solution)) {
            console.log("Solution does not match template");
            res.status(400).send({message: "Given solution does not match the initial values given"});
            return;
        } else if (!puzzleMethods.runAllSolutionTests(parsedPuzzle.solution)) {
            console.log("Solution incorrect");
            res.status(400).send({message: "Given solution is incorrect"});
            return;
        } else if (uniqueMethods.checkUniqueRgular(parsedPuzzle.values) != 1) {
            console.log("Multiple Solutions!");
            res.status(400).send({message: "This puzzle has multiple solutions"});
            return;
        }
    } else if (parsedPuzzle["puzzle-type"] == "x-sudoku") {
        // Dynamically import the methods from puzzleMethodFrontend.js
        await loadPuzzleMethodsX();
        await loadUniqueMethods();

        // Check validity of puzzle, initial values, and that they match
        if (!puzzleMethodsX.runAllTemplateTestsForXSudoku(parsedPuzzle.values)) {
            console.log("Template not valid");
            res.status(400).send({message: "Given initial values are not in valid configuration"});
            return;
        } else if (!puzzleMethodsX.templateVerification(parsedPuzzle.values, parsedPuzzle.solution)) {
            console.log("Solution does not match template");
            res.status(400).send({message: "Given solution does not match the initial values given"});
            return;
        } else if (!puzzleMethodsX.runAllSolutionTestsForXSudoku(parsedPuzzle.solution)) {
            console.log("Solution incorrect");
            res.status(400).send({message: "Given solution is incorrect"});
            return;
        } else if (uniqueMethods.checkUniqueXSudoku(parsedPuzzle.values) != 1) {
            console.log("Multiple Solutions!");
            res.status(400).send({message: "This puzzle has multiple solutions"});
            return;
        }
    }

    else {
        console.log("Puzzle type isn't supported")
        res.status(400).send({message: "Puzzle is not a valid type: only sudoku and x-sudoku puzzles are supported currently"});
        return;
    }

    // If tests succeed, add puzzle to db and respond
    let puzzleJson = {};
    puzzleJson['puzzle-type'] = parsedPuzzle['puzzle-type'];
    puzzleJson.values = parsedPuzzle.values;
    puzzleJson.solution = parsedPuzzle.solution;
    
        let submitted = await db.insertUserPost(req.auth.userID, req.body.post_title, puzzleJson, date );
        if(submitted) {
            console.log("Puzzle Submitted");
            res.status(200).send({message: "Puzzle submitted"});
        }
        else{
            console.log("Database Error");
            res.status(500).send({message: "Error inserting into database"});
        }
    
});

// DELETE post - remove a post from the database
// REQ: send to /api/posts/ {post_id: <value>}
// RES: 200 on success, 4xx/5xx and {message: <value> } upon failure
router.delete("/:id", async (req, res) => {
    console.log("DELETE request recieved to /api/post");

    let owned = await db.doesUserOwnPost(req.auth.userID, req.params.id);
    let role = await db.getRole(req.auth.userID);

    if (owned || role == "administrator") {
        await db.deletePost(req.params.id);
        res.status(200).send({message: "Post deleted"})
    } else {
        await db.deletePost(req.params.id);
        res.status(401).send({message: "User not authorised to delete this post"});
    }
    return;
});

module.exports = router;