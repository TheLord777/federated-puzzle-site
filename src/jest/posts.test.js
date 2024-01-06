const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '../.env')});
// Fill these out with the local host, user, password and db name
console.log(process.env.TESTDB_HOST);
process.env.DB_HOST = process.env.TESTDB_HOST;
process.env.DB_USER = process.env.TESTDB_USER;
process.env.DB_PASSWORD = process.env.TESTDB_PASSWORD;
process.env.DB = process.env.TESTDB_DB;
const app = require("../app.js");
const request = require("supertest");
const db = require("../db.js");

// JWT for user1 G29-34. Valid until 27th Oct 2023
const JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJHMjktMzQiLCJncm91cElEIjoyOSwiZGlzcGxheU5hbWUiOiJ1c2VyMSIsImlhdCI6MTY2Njg3MDU2OCwiZXhwIjoxNjk4NDI4MTY4fQ.bUZvFKvlfbD5Zs1KRgZUhQUw3jJD1dGBBaz2Wq0GL1ZAQdKv-STj7eq7jkuJ4Kq2iEC36Js6gntbYJdetaoUoXOT7GDKP_eaqXHsFv0rZ2zj2fwqqE899eyxPwn8sOO2Bc7AHnITKVbPFHPxk4RyBdKvOzZSDXiK6gjuPSB8Ayg";
//JWT for jam G29-63. Valid until 5th Nov 2023
const JWT2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJHMjktNjMiLCJncm91cElEIjoyOSwiZGlzcGxheU5hbWUiOiJqYW0iLCJpYXQiOjE2Njc2NDc5ODEsImV4cCI6MTY5OTIwNTU4MX0.FRdKd0lPoz-gmaZQWx0A0Cz8C4Qbarkb6ZKXxWDYEHyVi1B_5kpdRtOda1OG0DqK871PpETl3uE53QAEsRLXXVyWhz_0e3T7jhklIIE0niFf298ncrq3LNegdQjXvmQfnDCqjXHy32Kr8Ga6RDE0STHjxrdFwJpY9UvsutZ4MvA"

var puzzle = {
  "puzzle-type": "sudoku",
  "values":[[3,4,0,0,7,0,2,9,0],
            [7,0,0,3,0,0,0,0,0],
            [0,9,0,2,0,6,0,4,0],
            [0,8,7,9,0,5,0,3,2],
            [0,0,3,0,2,0,6,0,0],
            [0,0,4,0,0,3,0,1,0],
            [1,6,0,5,9,0,3,0,0],
            [0,0,0,1,3,2,8,0,5],
            [0,3,8,0,0,4,0,2,9]],
    "solution":[[3,4,5,8,7,1,2,9,6],
                [7,2,6,3,4,9,5,8,1],
                [8,9,1,2,5,6,7,4,3],
                [6,8,7,9,1,5,4,3,2],
                [9,1,3,4,2,7,6,5,8],
                [2,5,4,6,8,3,9,1,7],
                [1,6,2,5,9,8,3,7,4],
                [4,7,9,1,3,2,8,6,5],
                [5,3,8,7,6,4,1,2,9]]
}

var puzzleMultiple = {
    "puzzle-type": "sudoku",
    "values": [[9, 0, 0, 0, 0, 5, 0, 3, 6],
               [5, 0, 6, 4, 0, 0, 0, 7, 0],
               [7, 0, 0, 0, 0, 0, 5, 4, 2],
               [4, 0, 2, 0, 5, 0, 7, 0, 0],
               [6, 9, 0, 7, 0, 0, 0, 0, 0],
               [0, 0, 0, 9, 0, 2, 4, 0, 0],
               [0, 0, 0, 5, 0, 6, 0, 9, 0],
               [8, 6, 7, 0, 4, 9, 0, 2, 5],
               [0, 0, 0, 0, 0, 0, 0, 0, 4]],
    "solution": [[9, 4, 8, 2, 7, 5, 1, 3, 6],
                 [5, 2, 6, 4, 1, 3, 9, 7, 8],
                 [7, 3, 1, 6, 9, 8, 5, 4, 2],
                 [4, 8, 2, 3, 5, 1, 7, 6, 9],
                 [6, 9, 3, 7, 8, 4, 2, 5, 1],
                 [1, 7, 5, 9, 6, 2, 4, 8, 3],
                 [2, 1, 4, 5, 3, 6, 8, 9, 7],
                 [8, 6, 7, 1, 4, 9, 3, 2, 5],
                 [3, 5, 9, 8, 2, 7, 6, 1, 4]]
}

var puzzleX = {
  "puzzle-type": "x-sudoku",
  "values": [[1, 4, 0, 0, 0, 0, 0, 0, 3],
              [0, 0, 0, 0, 0, 0, 6, 0, 0],
              [0, 0, 0, 7, 0, 8, 0, 0, 0],
              [3, 0, 6, 8, 5, 9, 7, 0, 0],
              [0, 0, 2, 0, 0, 0, 1, 0, 0],
              [0, 0, 0, 2, 0, 0, 0, 0, 9],
              [0, 0, 0, 9, 0, 5, 0, 8, 0],
              [0, 0, 0, 3, 0, 0, 0, 0, 0],
              [0, 0, 9, 6, 0, 7, 0, 0, 0]],
  "solution": [[1, 4, 8, 5, 6, 2, 9, 7, 3],
              [7, 2, 3, 1, 9, 4, 6, 5, 8],
              [6, 9, 5, 7, 3, 8, 4, 2, 1],
              [3, 1, 6, 8, 5, 9, 7, 4, 2],
              [9, 8, 2, 4, 7, 3, 1, 6, 5],
              [4, 5, 7, 2, 1, 6, 8, 3, 9],
              [2, 7, 1, 9, 4, 5, 3, 8, 6],
              [5, 6, 4, 3, 8, 1, 2, 9, 7],
              [8, 3, 9, 6, 2, 7, 5, 1, 4]]
}

var errorpuzzle = {
    "puzzle-type": "sudoku",
    "values": [[9, 0, 0, 0, 0, 5, 0, 3, 6],
               [5, 0, 6, 4, 0, 0, 0, 7, 0],
               [7, 0, 0, 0, 0, 0, 5, 4, 2],
               [4, 0, 2, 0, 5, 0, 7, 0, 0],
               [6, 9, 0, 7, 0, 0, 0, 0, 0],
               [0, 0, 0, 9, 0, 2, 4, 0, 0],
               [0, 0, 0, 5, 0, 6, 0, 9, 0],
               [8, 6, 7, 0, 4, 9, 0, 2, 5],
               [0, 0, 0, 0, 0, 0, 0, 0, 4]],
    "solution": [[9, 4, 8, 2, 7, 5, 1, 3, 6],
                 [5, 2, 6, 4, 1, 3, 9, 7, 8],
                 [7, 3, 1, 6, 9, 8, 5, 4, 2],
                 [4, 8, 2, 3, 5, 1, 7, 6, 9],
                 [6, 9, 3, 7, 8, 7, 2, 5, 1],
                 [1, 7, 5, 9, 6, 2, 4, 8, 3],
                 [2, 1, 4, 5, 3, 6, 8, 9, 7],
                 [8, 6, 7, 1, 4, 9, 3, 2, 5],
                 [3, 5, 9, 8, 2, 7, 6, 1, 4]]
}
var nonmatchingpuzzle = {
    "puzzle-type": "sudoku",
    "values": [[3, 0, 0, 0, 0, 5, 0, 3, 6],
               [5, 0, 6, 4, 0, 0, 0, 7, 0],
               [7, 0, 0, 0, 0, 0, 5, 4, 2],
               [4, 0, 2, 0, 5, 0, 7, 0, 0],
               [6, 9, 0, 6, 0, 0, 0, 0, 0],
               [0, 0, 0, 9, 0, 2, 4, 0, 0],
               [0, 0, 0, 5, 2, 6, 0, 9, 0],
               [8, 6, 7, 0, 4, 9, 0, 2, 5],
               [0, 0, 0, 0, 0, 0, 0, 0, 1]],
    "solution": [[9, 4, 8, 2, 7, 5, 1, 3, 6],
                 [5, 2, 6, 4, 1, 3, 9, 7, 8],
                 [7, 3, 1, 6, 9, 8, 5, 4, 2],
                 [4, 8, 2, 3, 5, 1, 7, 6, 9],
                 [6, 9, 3, 7, 8, 4, 2, 5, 1],
                 [1, 7, 5, 9, 6, 2, 4, 8, 3],
                 [2, 1, 4, 5, 3, 6, 8, 9, 7],
                 [8, 6, 7, 1, 4, 9, 3, 2, 5],
                 [3, 5, 9, 8, 2, 7, 6, 1, 4]]
}
var nonNumPuzzle = {
  "puzzle-type": "sudoku",
  "values": [[3, 0, 0, 0, 0, 5, 0, 3, 6],
             [5, 0, "t", 4, 0, 0, 0, 7, 0],
             [7, 0, 0, 0, 0, 0, 5, 4, 2],
             [4, 0, 2, 0, 5, 0, 7, 0, 0],
             [6, 9, 0, 6, 0, 0, 0, 0, 0],
             [0, 0, 0, 9, 0, 2, 4, 0, 0],
             [0, 0, 0, 5, 2, 6, 0, 9, 0],
             [8, 6, 7, 0, 4, 9, 0, 2, 5],
             [0, 0, 0, 0, 0, 0, 0, 0, 1]],
  "solution": [[9, 4, 8, 2, 7, 5, 1, 3, 6],
               [5, 2, "t", 4, 1, 3, 9, 7, 8],
               [7, 3, 1, 6, 9, 8, 5, 4, 2],
               [4, 8, 2, 3, 5, 1, 7, 6, 9],
               [6, 9, 3, 7, 8, 4, 2, 5, 1],
               [1, 7, 5, 9, 6, 2, 4, 8, 3],
               [2, 1, 4, 5, 3, 6, 8, 9, 7],
               [8, 6, 7, 1, 4, 9, 3, 2, 5],
               [3, 5, 9, 8, 2, 7, 6, 1, 4]]
}
var toofewinitialvalues = {
  "puzzle-type": "sudoku",
  "values": [[1, 0, 0, 2, 3, 4, 5, 6, 7],
             [0, 2, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 3, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 4, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 5, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 6, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0]],
  "solution": [[1, 8, 9, 2, 3, 4, 5, 6, 7],
               [4, 2, 5, 1, 6, 7, 3, 9, 8],
               [6, 7, 3, 5, 8, 9, 1, 2, 4],
               [2, 1, 6, 4, 7, 8, 9, 3, 5],
               [7, 3, 4, 9, 5, 2, 8, 1, 6],
               [5, 9, 8, 3, 1, 6, 4, 7, 2],
               [3, 6, 2, 8, 9, 5, 7, 4, 1],
               [9, 5, 7, 6, 4, 1, 2, 8, 3],
               [8, 4, 1, 7, 2, 3, 6, 5, 9]]
}
var toomanyinitialvalues = {
  "puzzle-type": "sudoku",
  "values": [[1, 8, 9, 2, 3, 4, 5, 6, 7],
            [4, 2, 5, 1, 6, 7, 3, 9, 8],
            [6, 7, 3, 5, 8, 9, 1, 2, 4],
            [2, 1, 6, 4, 7, 8, 9, 3, 5],
            [7, 3, 4, 9, 5, 2, 8, 1, 6],
            [5, 9, 8, 3, 1, 6, 4, 7, 2],
            [3, 6, 2, 8, 9, 5, 7, 4, 1],
            [9, 5, 7, 6, 4, 1, 2, 8, 3],
            [8, 4, 1, 7, 2, 3, 6, 5, 9]],
  "solution": [[1, 8, 9, 2, 3, 4, 5, 6, 7],
               [4, 2, 5, 1, 6, 7, 3, 9, 8],
               [6, 7, 3, 5, 8, 9, 1, 2, 4],
               [2, 1, 6, 4, 7, 8, 9, 3, 5],
               [7, 3, 4, 9, 5, 2, 8, 1, 6],
               [5, 9, 8, 3, 1, 6, 4, 7, 2],
               [3, 6, 2, 8, 9, 5, 7, 4, 1],
               [9, 5, 7, 6, 4, 1, 2, 8, 3],
               [8, 4, 1, 7, 2, 3, 6, 5, 9]]
}

var toomanyinitialvalues = {
  "puzzle-type": "sudoku",
  "values": [[1, 8, 9, 2, 3, 4, 5, 6, 7],
            [4, 2, 5, 1, 6, 7, 3, 9, 8],
            [6, 7, 3, 5, 8, 9, 1, 2, 4],
            [2, 1, 6, 4, 7, 8, 9, 3, 5],
            [7, 3, 4, 9, 5, 2, 8, 1, 6],
            [5, 9, 8, 3, 1, 6, 4, 7, 2],
            [3, 6, 2, 8, 9, 5, 7, 4, 1],
            [9, 5, 7, 6, 4, 1, 2, 8, 3],
            [8, 4, 1, 7, 2, 3, 6, 5, 9]],
  "solution": [[1, 8, 9, 2, 3, 4, 5, 6, 7],
               [4, 2, 5, 1, 6, 7, 3, 9, 8],
               [6, 7, 3, 5, 8, 9, 1, 2, 4],
               [2, 1, 6, 4, 7, 8, 9, 3, 5],
               [7, 3, 4, 9, 5, 2, 8, 1, 6],
               [5, 9, 8, 3, 1, 6, 4, 7, 2],
               [3, 6, 2, 8, 9, 5, 7, 4, 1],
               [9, 5, 7, 6, 4, 1, 2, 8, 3],
               [8, 4, 1, 7, 2, 3, 6, 5, 9]]
}

var toomanyinitialvalues = {
  "puzzle-type": "sudoku",
  "values": [[1, 8, 9, 2, 3, 4, 5, 6, 7],
            [4, 2, 5, 1, 6, 7, 3, 9, 8],
            [6, 7, 3, 5, 8, 9, 1, 2, 4],
            [2, 1, 6, 4, 7, 8, 9, 3, 5],
            [7, 3, 4, 9, 5, 2, 8, 1, 6],
            [5, 9, 8, 3, 1, 6, 4, 7, 2],
            [3, 6, 2, 8, 9, 5, 7, 4, 1],
            [9, 5, 7, 6, 4, 1, 2, 8, 3],
            [8, 4, 1, 7, 2, 3, 6, 5, 9]],
  "solution": [[1, 8, 9, 2, 3, 4, 5, 6, 7],
               [4, 2, 5, 1, 6, 7, 3, 9, 8],
               [6, 7, 3, 5, 8, 9, 1, 2, 4],
               [2, 1, 6, 4, 7, 8, 9, 3, 5],
               [7, 3, 4, 9, 5, 2, 8, 1, 6],
               [5, 9, 8, 3, 1, 6, 4, 7, 2],
               [3, 6, 2, 8, 9, 5, 7, 4, 1],
               [9, 5, 7, 6, 4, 1, 2, 8, 3],
               [8, 4, 1, 7, 2, 3, 6, 5, 9]]
}

var puzzleWrongType = {
  "puzzle-type": "lightsout",
  "values": [[9, 0, 0, 0, 0, 5, 0, 3, 6],
             [5, 0, 6, 4, 0, 0, 0, 7, 0],
             [7, 0, 0, 0, 0, 0, 5, 4, 2],
             [4, 0, 2, 0, 5, 0, 7, 0, 0],
             [6, 9, 0, 7, 0, 0, 0, 0, 0],
             [0, 0, 0, 9, 0, 2, 4, 0, 0],
             [0, 0, 0, 5, 0, 6, 0, 9, 0],
             [8, 6, 7, 0, 4, 9, 0, 2, 5],
             [0, 0, 0, 0, 0, 0, 0, 0, 4]],
  "solution": [[9, 4, 8, 2, 7, 5, 1, 3, 6],
               [5, 2, 6, 4, 1, 3, 9, 7, 8],
               [7, 3, 1, 6, 9, 8, 5, 4, 2],
               [4, 8, 2, 3, 5, 1, 7, 6, 9],
               [6, 9, 3, 7, 8, 4, 2, 5, 1],
               [1, 7, 5, 9, 6, 2, 4, 8, 3],
               [2, 1, 4, 5, 3, 6, 8, 9, 7],
               [8, 6, 7, 1, 4, 9, 3, 2, 5],
               [3, 5, 9, 8, 2, 7, 6, 1, 4]]
}

var incorrectVariant = {
  "puzzle-type": "x-sudoku",
  "values": [[9, 0, 0, 0, 0, 5, 0, 3, 6],
             [5, 0, 6, 4, 0, 0, 0, 7, 0],
             [7, 0, 0, 0, 0, 0, 5, 4, 2],
             [4, 0, 2, 0, 5, 0, 7, 0, 0],
             [6, 9, 0, 7, 0, 0, 0, 0, 0],
             [0, 0, 0, 9, 0, 2, 4, 0, 0],
             [0, 0, 0, 5, 0, 6, 0, 9, 0],
             [8, 6, 7, 0, 4, 9, 0, 2, 5],
             [0, 0, 0, 0, 0, 0, 0, 0, 4]],
  "solution": [[9, 4, 8, 2, 7, 5, 1, 3, 6],
               [5, 2, 6, 4, 1, 3, 9, 7, 8],
               [7, 3, 1, 6, 9, 8, 5, 4, 2],
               [4, 8, 2, 3, 5, 1, 7, 6, 9],
               [6, 9, 3, 7, 8, 4, 2, 5, 1],
               [1, 7, 5, 9, 6, 2, 4, 8, 3],
               [2, 1, 4, 5, 3, 6, 8, 9, 7],
               [8, 6, 7, 1, 4, 9, 3, 2, 5],
               [3, 5, 9, 8, 2, 7, 6, 1, 4]]
}

let nonJsonPuzzle = "this is a string";

let wrongInitialValuesPuzzle = {
  "puzzle-type": "variant",
  "values": "this is wrong",
  "solution": "this is wrong"
}

beforeEach(async () => {
    // Truncate all tables IN ONE TRANSACTION
    newConnection = await db.connection.getConnection();
    await newConnection.beginTransaction();
    const queryPromises = [];
    queryPromises.push(newConnection.query("SET FOREIGN_KEY_CHECKS=0"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE user_login"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE solved_puzzles"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE comments"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE posts"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE user_activity"));
    queryPromises.push(newConnection.query("SET FOREIGN_KEY_CHECKS=1"));
    const results = await Promise.all(queryPromises);
    await newConnection.commit();
    await newConnection.release();

    // Ensures there is the correct user and post
    await db.connection.query("INSERT INTO user_login (user_id, username, email, password) VALUES (34, 'user1', 'user1@gmail.com', '$2a$10$bGCwqWn3YxkgtuYn1TAKz.OXSNy8KiQ4A5I71ZO6b/0v/OlH1M/xi')");
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-34', 'user1', 0, 'creator')");
    let sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (1, 'G29-34', 'First Post', ?, '2022-10-27T11:43:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzle)]);
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (1, 'G29-34')");
    return;
});
  
afterEach(async () => {
    // Truncate all tables IN ONE TRANSACTION
    newConnection = await db.connection.getConnection();
    await newConnection.beginTransaction();
    const queryPromises = [];
    queryPromises.push(newConnection.query("SET FOREIGN_KEY_CHECKS=0"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE user_login"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE solved_puzzles"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE comments"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE posts"));
    queryPromises.push(newConnection.query("TRUNCATE TABLE user_activity"));
    queryPromises.push(newConnection.query("SET FOREIGN_KEY_CHECKS=1"));
    const results = await Promise.all(queryPromises);
    await newConnection.commit();
    await newConnection.release();
});
  
describe("Test the the GET api/posts route", () => {
    test("Should allow an existing post to be retrieved", () => {
      return request(app)
        .get("/api/posts/1")
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body.post_title).toBe("First Post");
          expect(response.body.solved_by_user).toBe(true); // Checks whether posts correctly give if theyve been solved by this user or not
        });
    });

    test("Should allow an existing post to be retrieved - checks that solved_by works correctly", () => {
      return request(app)
        .get("/api/posts/1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body.post_title).toBe("First Post");
          expect(response.body.solved_by_user).toBe(false); // Checks whether posts correctly give if theyve been solved by this user or not
        });
    });
  
    test("Should return 404 if no post can be found", () => {
        return request(app)
          .get("/api/posts/2")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .expect('Content-Type', /json/)
          .then(response => {
            console.log("response: " + response.error);
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Post ID not found");
        });
    });

    test("Should return error if invalid token cookie given", () => {
        return request(app)
          .get("/api/posts/2")
          .set("Cookie", ["token=thisisaninvalidtoken!;authenticated=true"])
          .set("accept", "application/json")
          .expect('Content-Type', /json/)
          .then(response => {
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe("JWT Invalid: No token/payload set in 'token' cookie. Please log out and log in again.");
        });
    });
});

describe("Test the the POST api/posts route", () => {
    test("Should allow a new post to be created", () => {
      return request(app)
        .post("/api/posts")
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .send({post_title: "new post", puzzle: JSON.stringify(puzzle)})
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body.message).toBe("Puzzle submitted");
        });
    });

    test("Shouldn't allow invalid solution to a puzzle be submitted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(errorpuzzle)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Given solution is incorrect");
          });
      });

      test("Shouldn't allow problem and solution with non numeric characters to be submitted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(nonNumPuzzle)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Given initial values are not in valid configuration");
          });
      });

      test("Shouldn't allow valid but non-matching solution to a puzzle be submitted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(nonmatchingpuzzle)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Given initial values are not in valid configuration");
          });
      });

      test("Shouldn't allow initial values with less than 17 hints to be submitted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(toofewinitialvalues)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Given initial values are not in valid configuration");
          });
      });

      test("Shouldn't allow initial values with more than 80 hints to be submitted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(toomanyinitialvalues)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Given initial values are not in valid configuration");
          });
      });

      test("Shouldn't allow puzzle that is an unsupported type to be submitted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(puzzleWrongType)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Puzzle is not a valid type: only sudoku and x-sudoku puzzles are supported currently");
          });
      });

      test("Shouldn't allow post title that is not a string to be submitted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: {title: "new post"}, puzzle: JSON.stringify(puzzleWrongType)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Post title must be a valid string");
          });
      });

      test("Shouldn't allow puzzle that is not a json string to be submitted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(nonJsonPuzzle)})
          .then(response => {
            expect(response.statusCode).toBe(400);
          });
      });

      test("Shouldn't allow puzzle to have a string instead of array as initial values and solution", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title:  "new post", puzzle: JSON.stringify(wrongInitialValuesPuzzle)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Puzzle is not a valid type: only sudoku and x-sudoku puzzles are supported currently");
          });
      });

      test("Should return error if invalid token cookie given", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=invalid;authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(nonmatchingpuzzle)})
          .then(response => {
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe("JWT Invalid: No token/payload set in 'token' cookie. Please log out and log in again.");
          });
      });

      test("Should allow a correct x-sudoku variant to be posted", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(puzzleX)})
          .then(response => {
            expect(response.statusCode).toBe(200);
          });
      });

      test("Should reject an incorrect x-sudoku variant", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(incorrectVariant)})
          .then(response => {
            expect(response.statusCode).toBe(400);
          });
      });

      test("Should reject a solver trying to post a puzzle", async () => {
        await db.connection.query("UPDATE user_activity SET user_role='solver' WHERE user_id = 'G29-34'");
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(incorrectVariant)})
          .then(response => {
            expect(response.statusCode).toBe(401);
          });
      });

      test("Shouldn't allow a new post to be created if it has multiple solutions", () => {
        return request(app)
          .post("/api/posts")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_title: "new post", puzzle: JSON.stringify(puzzleMultiple)})
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("This puzzle has multiple solutions");
          });
      });
});

describe("Test the the DELETE api/posts route", () => {
  test("Should allow a post to be deleted", () => {
    return request(app)
      .delete("/api/posts/1")
      .set("Cookie", ["token=" + JWT + ";authenticated=true"])
      .set("accept", "application/json")
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Post deleted");
        return request(app)
          .get("/api/posts/1")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .expect('Content-Type', /json/)
          .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.user_id).toBe(undefined);
          });
      });
  });

  test("Shouldn't allow a post to be deleted by someone who doesn't own it", () => {
    return request(app)
      .delete("/api/posts/1")
      .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
      .set("accept", "application/json")
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("User not authorised to delete this post");
      });
  });

  test("Should allow a post to be deleted by someone who doesn't own it if they are an admin", async () => {
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-63', 'user2', 0, 'administrator')");
    return request(app)
      .delete("/api/posts/1")
      .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
      .set("accept", "application/json")
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.statusCode).toBe(200);
      });
  });
});