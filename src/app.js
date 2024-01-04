// Routing layout from https://stackoverflow.com/a/58770205
const path = require("path");
const postsRoute = require("./routes/posts.js");
const recentPostsRoute = require("./routes/recentPosts.js");
const submitSolveRoute = require("./routes/submitSolve.js");
const registerRoute = require("./routes/register.js");
const loginRoute = require("./routes/login.js");
const logoutRoute = require("./routes/logout.js");
const validateAndSetRoute = require("./routes/validateAndSet.js");
const accountDetailsRoute = require("./routes/accountDetails.js");
const commentsRoute = require("./routes/comments.js");
const repliesRoute = require("./routes/replies.js");
const commentRoute = require("./routes/comment.js");
const accountRoute = require("./routes/account.js");
const changeRoleRoute = require("./routes/changeRole.js");
const searchPostsRoute = require("./routes/searchPosts.js");
const leaderboardRoute = require("./routes/leaderboard.js");
const getKeyRoute = require("./routes/getKey.js");
const express = require("express");
const { expressjwt: jwt } = require("express-jwt");
require("dotenv").config();
const db = require("./db.js");
const cookieParser = require("cookie-parser");

// Function to allow jwt to be taken from cookie rather than the default header
function tokenFromCookie(req) {
    let cookie = req.cookies["token"];
    if (cookie == undefined) {
        return null;
    } else {
        return cookie;
    }
}

// Function to allow jwt to use different public keys based on group issuer
async function getPublicKey(req, token) {
    // Throw error if there is no token in cookie
    if (!token || !token.payload) {
        throw {name: "UnauthorizedError", message: "JWT Invalid: No token/payload set in 'token' cookie. Please log out and log in again."};
    }

    // Throw error if the group is undefined
    let group = token.payload.groupID;
    if (group == undefined) {
        throw {name: "UnauthorizedError", message: "JWT Invalid: No groupID defined in token. Please log out and log in again."};
    }

    // Get key from db, and throw error if the public key cannot be found
    let publicKey = await db.getPublicKey(group);
    if (publicKey == undefined) {
        throw {name: "UnauthorizedError", message: "JWT Invalid: Cannot find public key associated with group " + group + ".  Please log out and log in again."};
    } else {
        return publicKey;
    }
}

// Layout from https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/
const app = express();
app.use(cookieParser());
// All api / auth routes
app.use("/api/posts", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), postsRoute);
app.use("/api/comments", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), commentsRoute);
app.use("/api/replies", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), repliesRoute);
app.use("/api/comment", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), commentRoute);
app.use("/api/recentPosts", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), recentPostsRoute);
app.use("/api/submitSolve", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), submitSolveRoute);
app.use("/api/accountDetails", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), accountDetailsRoute);
app.use("/api/account", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), accountRoute);
app.use("/api/changeRole", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), changeRoleRoute);
app.use("/api/searchPosts", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), searchPostsRoute);
app.use("/api/leaderboard", jwt({ secret : getPublicKey, algorithms: ["RS256"], getToken: tokenFromCookie }), leaderboardRoute);
app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/logout", logoutRoute);
app.use("/auth/retrieveToken", validateAndSetRoute);
app.use("/auth/getKey", getKeyRoute);

// https://www.npmjs.com/package/express-jwt Error Handling section
app.use(function (err, req, res, next) {
    // Handles errors with JWT auth by sending a custom message
    if (err.name === "UnauthorizedError") {
      console.log(err.message);
      res.status(401).send({message: err.message});
    } 
    //https://stackoverflow.com/questions/58134287/catch-error-for-bad-json-format-thrown-by-express-json-middleware  
    else if(err instanceof SyntaxError && err.status === 400 && 'body' in err){
        console.error(err);
        return res.status(400).send({ status: 404, message: err.message }); // Bad request when JSON is malformed
    }
    else {
      next(err);
    }
});

// Serves the static build folder of the react app
app.use(express.static(path.join(__dirname, "frontend", "build")));
app.use(express.static("public"));

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

module.exports = app;
