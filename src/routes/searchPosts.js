const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());
var posts = [];

// GET searchPosts - returns posts based on a filter and page
// REQ: {type: <all/sudoku/xsudoku>, datefrom: <optional>, dateto:<optional>, order: <recent/popular>, ascending: <true, false>, exclude: <"yes"/"no">, page:<number>}
// RES: {posts:[{ post_title: <value>, post_author: <value>, post_author_id: <value>}]}, or 404 if no posts found matching criteria
router.get("/", async (req,res) => {
    console.log("GET request recieved to /api/recentPosts");
    console.log(req.query);

    if (!(req.query.type && req.query.order && req.query.page)) {
        console.log("Invalid search query");
        res.status(401).send({message: "Invalid query, need a post type, order, and page"});
        return;
    }

    // Set dates
    if (req.query.datefrom == "null" || req.query.datefrom == "undefined" || !req.query.datefrom) {
        req.query.datefrom = "2000-01-01T10:10:00.000Z" // Arbitrary date in the past for lower date bound
    }

    if (req.query.dateto == "null" || req.query.dateto == "undefined" || !req.query.dateto) {
        // Get date
        let date = new Date();
        req.query.dateto = date.toISOString(); // Default get posts up until current datetime
    }

    // Set ordering direction
    if (req.query.ascending == "true") {
        req.query.ascending = true;
    } else {
        req.query.ascending = false;
    }

    // Query the database
    let rows;
    if (req.query.exclude == "yes") {
        rows = await db.searchPosts(req.query.type, req.query.datefrom, req.query.dateto, req.query.order, req.auth.userID, req.query.ascending, true);
    } else {
        rows = await db.searchPosts(req.query.type, req.query.datefrom, req.query.dateto, req.query.order, req.auth.userID, req.query.ascending, false);
    }
    if (rows && rows.length) {
        posts = [];
        // Use page to get the 10 posts in that page bracket
        let first = (req.query.page-1) * 10;
        if (first > rows.length) {
            console.log("No posts found for this page");
            res.status(404).send({message: "No posts found"});
            return;
        }
        let last = Math.min(rows.length, first + 10);

        //push the posts on the selected page to the posts array
        for (let i = first; i < last; i++) {
            let puzzleJSON = JSON.parse(rows[i].puzzlejson);
            let post = {post_id:rows[i].post_id,
                        post_title:rows[i].title,
                        post_author:rows[i].username,
                        post_author_id:rows[i].user_id,
                        post_time: rows[i].date_posted,
                        post_solves: rows[i].solves,
                        solved_by_user: rows[i].solved_by_user,
                        post_type: puzzleJSON["puzzle-type"]}
            posts.push(post);
        }
        // Send array as response
        let response = {
            posts: posts,
            total_pages: Math.ceil(rows.length / 10)         
        };
        console.log("Sending matching posts");
        res.status(200).json(response);
    } else {
        console.log("No posts found");
        res.status(404).send({message: "No posts found"});
    }

});
module.exports = router;