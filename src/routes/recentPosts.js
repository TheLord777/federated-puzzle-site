const express = require("express");
const db = require("../db.js");
const router = express.Router();
router.use(express.json());
var posts = [];

// GET recentPosts - returns most recent posts - up to 10
// REQ: 
// RES: {posts:[{ post_title: <value>, post_author: <value>, post_author_id: <value>, post_time: <value>, solved_by_user: <true/false>, post_type: <value>}]}, or 404 if no posts found
router.get("/", async (req,res) => {
    console.log("GET request recieved to /api/recentPosts");
    let rows = await db.getRecentPosts(10, req.auth.userID);
    if (rows.length) {
        posts = [];
        //push top 10 most recent posts to the posts array 
        for (let i =0; i < rows.length; i++) {
            let puzzleJSON = JSON.parse(rows[i].puzzlejson);
            let post = {post_id:rows[i].post_id,
                        post_title:rows[i].title,
                        post_author:rows[i].username,
                        post_author_id:rows[i].user_id,
                        post_time: rows[i].date_posted,
                        solved_by_user: rows[i].solved_by_user,
                        post_type: puzzleJSON["puzzle-type"]}
            posts.push(post);
        }
        // Send array as response
        let response = {
            posts: posts            
        };
        console.log("Sending recent posts");
        res.status(200).json(response);
    } else {
        console.log("No posts found");
        res.status(404).send({message: "No posts found"});
    }

});
module.exports = router;