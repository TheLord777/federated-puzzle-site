// Setup from https://stackoverflow.com/a/30545872
// and https://stackoverflow.com/a/58219560
const mysql = require("mysql2/promise");
require("dotenv").config();

// Must have .env file in src directory with values filled out correctly
const config = {
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB
};

// Dynamic import. This allows the backend to share the same puzzle verification methods as the frontend,
// without having to refactor every require to use import syntax instead
let puzzleMethods;
async function loadPuzzleMethods() {
    puzzleMethods = await import("./frontend/src/puzzleMethodFrontend.js");
}

let puzzleMethodsX;
async function loadPuzzleMethodsX() {
    puzzleMethodsX = await import("./frontend/src/puzzleMethodVariant.js");
}

const connection = mysql.createPool(config);

// Gets the public key for the given groupID, returns null if fails
async function getPublicKey(groupID) {
    // Get public key from database
    try {
        let sql = "SELECT public_key FROM supergroup_info WHERE supergroup_id = ?";
        const [rows, fields] = await connection.execute(sql, [groupID]);
        // Returns either null or the public key correctly formatted
        if (!rows.length) {
            return null;
        } else {
            return rows[0].public_key.replace(/\\n/g, '\n');
        }
    } catch (e) {
        console.log(e);
        return null;
    }
    
}

// Get all information about a post by a user, applying the posts id in the search
async function getUserPost(id) {
    try {
        let sql = "SELECT posts.*, user_activity.username, user_activity.user_id FROM posts LEFT OUTER JOIN user_activity ON posts.user_id = user_activity.user_id WHERE post_id = ?";
        const [rows, fields] = await connection.execute(sql, [id]);
        if(rows.length == 0) {
            return null;
        } else {
            return rows[0]
        }
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

// Insert a users post (puzzle) into the db, returns true if sucessful, false otherwise
async function insertUserPost(user_id, title, puzzlejson, date_posted) {
    try {
        let sql = "INSERT INTO posts (user_id, title, puzzlejson, date_posted) VALUES (?, ?, ?, ?)";
        await connection.execute(sql, [user_id, title, JSON.stringify(puzzlejson), date_posted]);    
        return true; 
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Add user to user_login, return true if successful insertion and null in the event of a failure 
async function registerUser(username, email,password) {
    try {
        let sql = "INSERT INTO user_login (username, email, password) VALUES (?, ?, ?)";
        await connection.execute(sql, [username, email, password])
        return true; 
    }
    catch(e){
        console.log(e);
        return false;
    }

}

// Gets a number (amount) of the most recent posts made by users, returns null if failure
async function getRecentPosts(amount, id){
    try {
        let sql = "SELECT UNIQUE *, CASE WHEN EXISTS (SELECT * FROM solved_puzzles WHERE solved_puzzles.post_id = groups.post_id AND solved_puzzles.user_id = ?) THEN 1 ELSE 0 END AS solved_by_user FROM "
        + "(SELECT posts.*, user_activity.username FROM posts INNER JOIN user_activity ON posts.user_id = user_activity.user_id LEFT JOIN solved_puzzles ON solved_puzzles.post_id = posts.post_id) groups ORDER BY groups.date_posted DESC LIMIT 0,?";;
        const [rows, fields] = await connection.execute(sql, [id, amount]);
        return rows
    }
    catch (e){
        console.log(e);
        return null;
    }
}

// Gets posts made by users based on search conditions, returns null if failure
async function searchPosts(type, datefrom, dateto, order, id, asc, exclude) {
    try {
        // Set up where statements, filtering type and date
        let where = "WHERE date_posted >= ? AND date_posted <= ? ";
        let sql = "";

        if (type == "sudoku") {
            where += "AND JSON_CONTAINS(puzzlejson, '{\"puzzle-type\":\"sudoku\"}') ";
        } else if (type == "x-sudoku") {
            where += "AND JSON_CONTAINS(puzzlejson, '{\"puzzle-type\":\"x-sudoku\"}') ";
        } else if (type != "all") {
            return null;
        }

        // Excludes already solved posts if an id is given
        if (exclude) {
            where += " AND post_id NOT IN (SELECT post_id FROM solved_puzzles WHERE user_id = ?) "
        }

        // SQL statement was debugged with assistance from ChatGPT - https://chat.openai.com/
        sql = "SELECT *, CASE WHEN EXISTS (SELECT * FROM solved_puzzles WHERE solved_puzzles.post_id = groups.post_id AND solved_puzzles.user_id = ?) THEN 1 ELSE 0 END AS solved_by_user" 
            + " FROM (SELECT posts.*, COUNT(solved_puzzles.post_id) AS solves FROM posts LEFT JOIN solved_puzzles ON solved_puzzles.post_id = posts.post_id GROUP BY posts.post_id" 
            + " ORDER BY solves DESC, date_posted DESC) groups INNER JOIN user_activity ON groups.user_id = user_activity.user_id " + where;

        // Change select based on ordering by popularity or date posted, as well as ascending or descending
        if (order == "recent" && asc) {
            sql += " ORDER BY date_posted ASC";
        } else if (order == "recent") {
            sql += " ORDER BY date_posted DESC";
        } else if (order == "popular" && asc) {
            sql += " ORDER BY solves ASC, date_posted DESC";
        } else if (order == "popular") {
            sql += " ORDER BY solves DESC, date_posted DESC";
        } else {
            return null;
        }

        // Exclude already solved puzzles
        let [rows, fields] = [];
        if (exclude) {
            [rows, fields] = await connection.execute(sql, [id, datefrom, dateto, id]);
        } else {
            [rows, fields] = await connection.execute(sql, [id, datefrom, dateto]);
        }
        
        return rows;
    }
    catch (e){
        console.log(e);
        return null;
    }
}

// Insert new solved_puzzles entry into solved_puzzles 
// And increment the number of puzzles that the user has solved
// Returns true if sucess, false if failure
async function updateSolvedPuzzles(user_id, post_id){
    try {
        // If all pass, create new entry in solved_puzzles table saying user has complete post
        sql = "INSERT INTO solved_puzzles (user_id, post_id) VALUES (?, ?)";
        [rows, fields] = await connection.execute(sql, [user_id, post_id]);
        // Increment puzzles solved
        sql = "UPDATE user_activity SET nopuzzlessolved = nopuzzlessolved + 1 WHERE user_id = ?";
        [rows, fields] = await connection.execute(sql, [user_id]);
        // Upgrade solver to creator
        sql = "SELECT nopuzzlessolved FROM user_activity WHERE user_id = ?";
        [rows, fields] = await connection.execute(sql, [user_id]);
        let role = await getRole(user_id);
        // Upgrade to creator on fifth solve - as long as they are a solver
        if (rows[0].nopuzzlessolved >= 5 && role == "solver") {
            sql = "UPDATE user_activity SET user_role = 'creator' WHERE user_id = ?";
            await connection.execute(sql, [user_id]);
        }
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }

}

// Checks that given puzzle solution is valid
// Returns "success" if all valid, {code: <errorcode>, message: <errormessage>} if an error occurs
async function submitSolveChecks(userID, post_id,solution) {
    try {
        // First query the db to check that the post and user exists
        let sql = "SELECT count(*), username FROM user_activity WHERE user_id = ?";
        let [rows, fields] = await connection.execute(sql, [userID]);
        if (rows[0]['count(*)'] == 0) {
            let errormsg ="User not found";
            return {code: 404, message: errormsg};
        }
        sql = "SELECT count(*) FROM posts WHERE post_id = ?";
        [rows, fields] = await connection.execute(sql, [post_id]);
        if (rows[0]['count(*)'] == 0) {
            let errormsg = "Post not found";
            return {code: 404, message: errormsg};
        }
        // Next check that user hasnt solved puzzle already
        sql = "SELECT count(*)  FROM solved_puzzles WHERE user_id = ? AND post_id = ?";
        [rows, fields] = await connection.execute(sql, [userID, post_id]);
        if (rows[0]['count(*)'] != 0) {
            // Get username - to prove they are logged in as the right user
            let errormsg = "Puzzle already solved by this user";
            return {code: 400, message: errormsg};
        }

        // Next check that the user is not the creator of the puzzle
        sql = "SELECT user_id FROM posts WHERE post_id = ?";
        [rows, fields] = await connection.execute(sql, [post_id]);
        if (rows[0].user_id == userID) {
            let errormsg = "You cannot solve a puzzle that you have created";
            return {code: 400, message: errormsg};
        }

        // Check that the given solution matches the initial values in the database
        sql = "SELECT puzzlejson FROM posts WHERE post_id = ?";
        [rows, fields] = await connection.execute(sql, [post_id]);
        let puzzle = JSON.parse(rows[0].puzzlejson);
        let type = puzzle["puzzle-type"];
        
        let errormsg = "Unknown Error";
        // Runs different checks depending on the type of the puzzle
        if (type == "sudoku") {
            // Waits for puzzle methods to be imported
            await loadPuzzleMethods();
            
            // Use puzzleMethodFrontend.js to ensure solution matches template and is valid
            if (!puzzleMethods.templateVerification(puzzle.values,solution)) {
                errormsg = "Given solution does not match the initial values";
                return {code: 400, message: errormsg};
            } else if (!puzzleMethods.runAllSolutionTests(solution)) {
                errormsg = "Given solution is incorrect";
                return {code: 400, message: errormsg};
            }
            errormsg = "Solve submitted";
        } else if (type == "x-sudoku") {
            // Waits for puzzle methods to be imported
            await loadPuzzleMethodsX();
            
            // Use puzzleMethodFrontend.js to ensure solution matches template and is valid
            if (!puzzleMethodsX.templateVerification(puzzle.values,solution)) {
                errormsg = "Given solution does not match the initial values";
                return {code: 400, message: errormsg};
            } else if (!puzzleMethodsX.runAllSolutionTestsForXSudoku(solution)) {
                errormsg = "Given solution is incorrect";
                return {code: 400, message: errormsg};
            }
            errormsg = "Solve submitted";
        }
        return {code: 200, message: errormsg};
    }
    catch (e){
        console.log(e);
        return {code: 500, message: "Error when searching the database"};
    }

}

// Given a username, returns a row object which contains user_id, username, email and password fields for that user.
// If no users can be found, returns null instead
async function getUserFromLogin(username) {
    try {
        let sql = "SELECT * FROM user_login WHERE username = ?";
        const [rows, fields] = await connection.execute(sql, [username]);
        if (rows.length == 0) {
            return null;
        } else {
            return rows[0]
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

// Given a user id, gets username and role
async function getUserFromActivity(userID) {
    try {
        let sql = "SELECT username, user_role FROM user_activity WHERE user_id = ?";
        const [rows, fields] = await connection.execute(sql, [userID]);
        if (rows.length == 0) {
            return null;
        } else {
            return rows[0]
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

// Given a user id and username, ensures this user is logged in the user activity table
async function addUserToActivity(user_id, username) {
    try {
        let sql = "SELECT * FROM user_activity WHERE user_id = ?";
        const [rows, fields] = await connection.execute(sql, [user_id]);
        if (!rows.length) {
            // User not in table yet
            let sql = "INSERT INTO user_activity (user_id, username, user_role, nopuzzlessolved) VALUES (?, ?, 'solver', nopuzzlessolved)";
            await connection.execute(sql, [user_id, username]);
        } else {
            // ELSE update the username in case username changed on other server
            let sql = "UPDATE user_activity SET username = ? WHERE user_id = ?";
            await connection.execute(sql, [username, user_id]);
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

// Given a user id, retrieve the number of puzzle solved by this user
// Returns number if successful, -1 if error occurs
async function getNoPuzzlesSolved(user_id) {
    try {
        let sql = "SELECT nopuzzlessolved FROM user_activity WHERE user_id = ?";
        const [rows, fields] = await connection.execute(sql,  [user_id]);
        if (!rows.length) {
            console.log("NoPuzzlesSolved: User not found in user_activity");
            return -1;
        }
        return rows[0].nopuzzlessolved;
    } catch (e) {
        console.log(e);
        return -1;
    }
}

// Gets the number of puzzles created by a given user_id
async function getNoPuzzlesCreated(user_id) {
    try {
        // Selects all records of posts that this user created
        let sql = "SELECT * FROM posts WHERE user_id = ?";
        const [rows, fields] = await connection.execute(sql,  [user_id]);
        if (!rows.length) {
            console.log("User has not created any puzzles");
            return 0;
        }
        return rows.length;
    } catch (e) {
        console.log(e);
        return -1;
    }
}

// Retrieves all top level comments of a given post
async function getTopLevelCommentsOfPost(post_id) {
    try {
        let sql = "SELECT comments.*, user_activity.username, EXISTS(SELECT * FROM comments c2 WHERE c2.parent_comment_id = comments.comment_id) as hasReplies FROM comments INNER JOIN posts ON posts.post_id = comments.post_id LEFT OUTER JOIN user_activity ON user_activity.user_id = comments.user_id WHERE posts.post_id = ? AND comments.parent_comment_id IS NULL ORDER BY posts.date_posted DESC";
        const [rows, fields] = await connection.execute(sql, [post_id]);
        if (!rows.length) {
            console.log("No comments found for post");
            return null;
        }
        return rows;
    }
    catch (e){
        console.log(e);
        return null;
    }
}

// Retrieves all top level replies of a given comment
async function getTopLevelRepliesOfComment(comment_id) {
    try {
        let sql = "SELECT comments.*, user_activity.username, EXISTS(SELECT * FROM comments c2 WHERE c2.parent_comment_id = comments.comment_id) as hasReplies FROM comments LEFT OUTER JOIN user_activity ON user_activity.user_id = comments.user_id WHERE comments.parent_comment_id=? ORDER BY comments.date_posted DESC";
        const [rows, fields] = await connection.execute(sql, [comment_id]);
        if (!rows.length) {
            console.log("No replies found for comment");
            return null;
        }
        return rows
    }
    catch (e){
        console.log(e);
        return null;
    }
}

// Retrieves a comment given the id
async function getComment(comment_id) {
    try {
        let sql = "SELECT comments.user_id, user_activity.username, comments.content, comments.date_posted, comments.likes, comments.parent_comment_id FROM comments LEFT OUTER JOIN user_activity ON user_activity.user_id = comments.user_id WHERE comments.comment_id = ?";
        const [rows, fields] = await connection.execute(sql, [comment_id]);
        if (!rows.length) {
            console.log("No comments found with this id");
            return null;
        }
        return rows
    }
    catch (e){
        console.log(e);
        return null;
    }
}

// Insert a users comment into the database
async function insertUserComment(post_id, user_id, content, parent_comment_id, date_posted) {
    try {
        let sql;
        if (parent_comment_id != null) {
            sql = "SELECT * FROM comments WHERE post_id = ? AND comment_id = ?";
            let [rows, fields] = await connection.execute(sql, [post_id, parent_comment_id]);
            // Comment being replied to does not exist under this post!
            if (!rows.length) {
                return 0;
            }
        }
        sql = "INSERT INTO comments (post_id, user_id, content, parent_comment_id, date_posted, likes ) VALUES (?, ?, ?, ?, ?, 0)";
        let [rows, fields] = await connection.execute(sql, [post_id, user_id, content, parent_comment_id, date_posted]);
        return rows.insertId;
    }
    catch (e) {
        console.log(e);
        return 0;
    }
}

// Check if a user owns a comment
async function doesUserOwnComment(user_id, comment_id) {
    try {
        let sql = "SELECT user_id FROM comments WHERE comment_id = ?";
        const [rows, fields] = await connection.execute(sql, [comment_id]);
        if (rows[0].user_id == user_id) {
            return true;
        }
        return false;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Check if a user owns a post
async function doesUserOwnPost(user_id, post_id) {
    try {
        let sql = "SELECT user_id FROM posts WHERE post_id = ?";
        const [rows, fields] = await connection.execute(sql, [post_id]);
        if (rows[0].user_id == user_id) {
            return true;
        }
        return false;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Check if a user has solved a post
async function hasUserSolvedPost(user_id, post_id) {
    try {
        let sql = "SELECT count(*) FROM solved_puzzles WHERE user_id = ? AND post_id = ?";
        [rows, fields] = await connection.execute(sql, [user_id, post_id]);
        if (rows[0]['count(*)'] != 0)  {
            return true;
        }
        return false;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Delete a comment
async function deleteComment(comment_id) {
    try {
        let sql = "UPDATE comments SET content = '[comment deleted]' WHERE comment_id = ?";
        await connection.execute(sql, [comment_id]);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Update a comment
async function updateComment(comment_id, content) {
    try {
        let sql = "UPDATE comments SET content = ? WHERE comment_id = ?";
        await connection.execute(sql, [content, comment_id]);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Update a username
// Returns 0 if success
// Returns 1 if invalid group
// returns 2 if db error
async function updateUsername(user_id, username) {
    try {
        // If user not in group 29, cannot change their username
        let group = user_id.substring(0,3);
        if (!(group === "G29")) {
            return 1;
        }
        // Change user_login and user_activity in one transaction to ensure atomicity
        newConnection = await connection.getConnection();
        await newConnection.beginTransaction();
        const queryPromises = [];
        queryPromises.push(newConnection.query("UPDATE user_login SET username = ? WHERE user_id = ?", [username, parseInt(user_id.substring(4))]));
        queryPromises.push(newConnection.query("UPDATE user_activity SET username = ? WHERE user_id = ?", [username, user_id]));
        const results = await Promise.all(queryPromises);
        await newConnection.commit();
        await newConnection.release();

        return 0;
    }
    catch (e) {
        console.log(e);
        await newConnection.rollback();
        await newConnection.release();
        
        return 2;
    }
}

// Update a bio
async function getBioFromID(user_id) {
    try {
        let sql = "SELECT bio FROM user_activity WHERE user_id = ?";
        const [rows, fields] = await connection.execute(sql, [user_id]);
        if (rows.length == 0) {
            return null;
        } else {
            return rows[0].bio == null ? "" : rows[0].bio; // if empty, send empty string still (to differentiate from null for errors)
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

// Update a bio
async function updateBio(user_id, bio) {
    try {
        let sql = "UPDATE user_activity SET bio = ? WHERE user_id = ?";
        await connection.execute(sql, [bio, user_id]);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Delete a post
async function deletePost(post_id) {
    try {
        let sql = "UPDATE posts SET user_id = NULL WHERE post_id = ?";
        await connection.execute(sql, [post_id]);
        sql = "SELECT * FROM posts WHERE post_id = ?";
        const [rows, fields] =  await connection.execute(sql, [post_id]);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Get user role
async function getRole(user_id) {
    try {
        let sql = "SELECT user_role FROM user_activity WHERE user_id = ?";
        const [rows, fields] = await connection.execute(sql, [user_id]);
        if (rows.length == 0) {
            return null;
        } else {
            return rows[0]["user_role"];
        }
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

// Get user role
async function changeRole(user_id, role) {
    try {
        let sql = "UPDATE user_activity SET user_role = ? WHERE user_id = ?";
        const [rows, fields] = await connection.execute(sql, [role, user_id]);
        if (rows.length == 0) {
            return false;
        } else {
            return true;
        }
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// Delete an account
async function deleteAccount(user_id) {
    try {
        // Change user_login and user_activity in one transaction to ensure atomicity
        newConnection = await connection.getConnection();
        await newConnection.beginTransaction();
        const queryPromises = [];
        queryPromises.push(newConnection.query("DELETE FROM user_activity WHERE user_id = ?", [user_id]));
        if (user_id.substring(0,3) === "G29") { // Also delete account from login table if from G29
            queryPromises.push(newConnection.query("DELETE FROM user_login WHERE user_id = ?", [parseInt(user_id.substring(4))]));
        }
        // Also delete all rows with same id in solves table to keep consistency
        queryPromises.push(newConnection.query("DELETE FROM solved_puzzles WHERE user_id = ?", [user_id]));
        const results = await Promise.all(queryPromises);
        await newConnection.commit();
        await newConnection.release();
        return true;
    }
    catch (e) {
        console.log(e);
        await newConnection.rollback();
        await newConnection.release();
        return false;
    }
}

// Returns the 10 users with the most puzzles solved
async function getTopSolvers(amount) {
    try {
        let sql = "SELECT username, user_id, nopuzzlessolved FROM user_activity ORDER BY nopuzzlessolved DESC, username ASC LIMIT 0,?";
        const [rows, fields] = await connection.execute(sql, [amount]);
        return rows;
    } catch (e) {
        console.log(e);
        return null;
    }
}

module.exports = { connection, getPublicKey, getUserFromLogin, getUserFromActivity, addUserToActivity, getNoPuzzlesSolved, getUserPost, insertUserPost, registerUser,
    submitSolveChecks, updateSolvedPuzzles, getRecentPosts, searchPosts, getTopLevelCommentsOfPost, getTopLevelRepliesOfComment, getComment, insertUserComment,
    doesUserOwnComment, deleteComment, updateComment, getNoPuzzlesCreated, updateUsername, getBioFromID, updateBio, doesUserOwnPost, hasUserSolvedPost, deletePost, deleteAccount, getRole,
    changeRole, getTopSolvers } ;