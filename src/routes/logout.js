const express = require("express");
const router = express.Router();
router.use(express.json());


// GET logout - clears token and authenticated cookies
// REQ: nothing
// RES: clears auth cookies on frontend
router.get("/", async (req,res) => {
    console.log("GET request recieved to api/logout")
    // Clears cookies from frontend
    res.status(200)
        .clearCookie("token")
        .clearCookie("authenticated")
        .end();
});

module.exports = router;