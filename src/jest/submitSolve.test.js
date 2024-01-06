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

//JWT for jam G29-63. Valid until 5th Nov 2023
const JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJHMjktNjMiLCJncm91cElEIjoyOSwiZGlzcGxheU5hbWUiOiJqYW0iLCJpYXQiOjE2Njc2NDc5ODEsImV4cCI6MTY5OTIwNTU4MX0.FRdKd0lPoz-gmaZQWx0A0Cz8C4Qbarkb6ZKXxWDYEHyVi1B_5kpdRtOda1OG0DqK871PpETl3uE53QAEsRLXXVyWhz_0e3T7jhklIIE0niFf298ncrq3LNegdQjXvmQfnDCqjXHy32Kr8Ga6RDE0STHjxrdFwJpY9UvsutZ4MvA"
// JWT for user1 G29-34. Valid until 27th Oct 2023
const JWT2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJHMjktMzQiLCJncm91cElEIjoyOSwiZGlzcGxheU5hbWUiOiJ1c2VyMSIsImlhdCI6MTY2Njg3MDU2OCwiZXhwIjoxNjk4NDI4MTY4fQ.bUZvFKvlfbD5Zs1KRgZUhQUw3jJD1dGBBaz2Wq0GL1ZAQdKv-STj7eq7jkuJ4Kq2iEC36Js6gntbYJdetaoUoXOT7GDKP_eaqXHsFv0rZ2zj2fwqqE899eyxPwn8sOO2Bc7AHnITKVbPFHPxk4RyBdKvOzZSDXiK6gjuPSB8Ayg";

var puzzle = {
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

var solution = [[9, 4, 8, 2, 7, 5, 1, 3, 6],
                [5, 2, 6, 4, 1, 3, 9, 7, 8],
                [7, 3, 1, 6, 9, 8, 5, 4, 2],
                [4, 8, 2, 3, 5, 1, 7, 6, 9],
                [6, 9, 3, 7, 8, 4, 2, 5, 1],
                [1, 7, 5, 9, 6, 2, 4, 8, 3],
                [2, 1, 4, 5, 3, 6, 8, 9, 7],
                [8, 6, 7, 1, 4, 9, 3, 2, 5],
                [3, 5, 9, 8, 2, 7, 6, 1, 4]];

var notMatchingtemplate = [[8, 4, 8, 2, 7, 5, 1, 3, 6],
                            [5, 2, 6, 4, 1, 3, 9, 7, 8],
                            [7, 3, 1, 6, 9, 8, 5, 4, 2],
                            [4, 8, 2, 3, 5, 1, 7, 6, 9],
                            [6, 9, 3, 7, 8, 4, 2, 5, 1],
                            [1, 7, 5, 9, 6, 2, 4, 8, 3],
                            [2, 1, 4, 5, 3, 6, 8, 9, 7],
                            [8, 6, 7, 1, 4, 9, 3, 2, 5],
                            [3, 5, 9, 8, 2, 7, 6, 1, 4]];

var incorrectSolution = [[9, 4, 8, 2, 2, 5, 1, 3, 6],
                        [5, 2, 6, 4, 1, 3, 9, 7, 8],
                        [7, 3, 1, 6, 9, 8, 5, 4, 2],
                        [4, 8, 2, 3, 5, 1, 7, 6, 9],
                        [6, 9, 3, 7, 8, 4, 2, 5, 1],
                        [1, 7, 5, 9, 6, 2, 4, 8, 3],
                        [2, 1, 4, 5, 3, 6, 8, 9, 7],
                        [8, 6, 7, 1, 4, 9, 3, 2, 5],
                        [3, 5, 9, 8, 2, 7, 6, 1, 4]];

var stringSolution = "this wont work";

var xSolution = [[1, 4, 8, 5, 6, 2, 9, 7, 3],
                [7, 2, 3, 1, 9, 4, 6, 5, 8],
                [6, 9, 5, 7, 3, 8, 4, 2, 1],
                [3, 1, 6, 8, 5, 9, 7, 4, 2],
                [9, 8, 2, 4, 7, 3, 1, 6, 5],
                [4, 5, 7, 2, 1, 6, 8, 3, 9],
                [2, 7, 1, 9, 4, 5, 3, 8, 6],
                [5, 6, 4, 3, 8, 1, 2, 9, 7],
                [8, 3, 9, 6, 2, 7, 5, 1, 4]];

var xIncorrectSolution = [[1, 4, 7, 5, 6, 2, 8, 9, 3],
                          [8, 9, 5, 1, 4, 3, 6, 2, 7],
                          [2, 6, 3, 7, 9, 8, 4, 1, 5],
                          [3, 1, 6, 8, 5, 9, 7, 4, 2],
                          [9, 5, 2, 4, 7, 6, 1, 3, 8],
                          [7, 8, 4, 2, 3, 1, 5, 6, 9],
                          [6, 7, 1, 9, 2, 5, 3, 8, 4],
                          [5, 2, 8, 3, 1, 4, 9, 7, 6],
                          [4, 3, 9, 6, 8, 7, 2, 5, 1]];

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
    await db.connection.query("INSERT INTO user_login (user_id, username, email, password) VALUES (63, 'jam', 'jam@jam.com', '$2a$10$bGCwqWn3YxkgtuYn1TAKz.OXSNy8KiQ4A5I71ZO6b/0v/OlH1M/xi')");
    await db.connection.query("INSERT INTO user_login (user_id, username, email, password) VALUES (34, 'user1', 'user1@gmail.com', '$2a$10$bGCwqWn3YxkgtuYn1TAKz.OXSNy8KiQ4A5I71ZO6b/0v/OlH1M/xi')");
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-63', 'jam', 0, 'solver')");
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-34', 'user1', 0, 'solver')");
    let sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (1, 'G29-34', 'First Post', ?, '2022-10-27T11:43:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzle)]);
    sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (2, 'G29-34', 'Second Post', ?, '2022-10-27T11:56:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzle)]);
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (1, 'G29-63')");
    sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (3, 'G29-34', 'Third Post', ?, '2022-10-27T11:56:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzleX)]);
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

describe("Test the the POST api/submitSolve route", () => {
    test("Return an error if the post being solved isn't in the database", () => {
      return request(app)
        .post("/api/submitSolve")
        .send({post_id: 4, solution: solution})
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .then(response => {
          expect(response.statusCode).toBe(404);
          expect(response.body.message).toBe("Post not found");
        });
    });

    test("Return an error if the user has already solved the post before", () => {
        return request(app)
          .post("/api/submitSolve")
          .send({post_id: 1, solution: solution})
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Puzzle already solved by this user");
        });
    });

    test("Return an error if the user submits a solution that does not match the original values", () => {
        return request(app)
          .post("/api/submitSolve")
          .send({post_id: 2, solution: notMatchingtemplate})
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Given solution does not match the initial values");
        });
    });

    test("Return an error if the user submits a solution matches the initial values but is incorrect", () => {
        return request(app)
          .post("/api/submitSolve")
          .send({post_id: 2, solution: incorrectSolution})
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Given solution is incorrect");
        });
    });

    test("Return an error if the user submits a solution that is a string", () => {
      return request(app)
        .post("/api/submitSolve")
        .send({post_id: 2, solution: stringSolution})
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .then(response => {
          expect(response.statusCode).toBe(400);
          expect(response.body.message).toBe("Given solution does not match the initial values");
      });
    });

    test("Return an error if the user is trying to submit a puzzle that they created", () => {
      return request(app)
        .post("/api/submitSolve")
        .send({post_id: 2, solution: solution})
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .then(response => {
          expect(response.statusCode).toBe(400);
          expect(response.body.message).toBe("You cannot solve a puzzle that you have created");
      });
    });

    test("Notify the user that the puzzle is submitted if it everything is correct", () => {
        return request(app)
          .post("/api/submitSolve")
          .send({post_id: 2, solution: solution})
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Solve submitted");
        });
    });

    test("Return an error if the user submits a solution matches the initial values but is incorrect for x-sudoku", () => {
      return request(app)
        .post("/api/submitSolve")
        .send({post_id: 3, solution: xIncorrectSolution})
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .then(response => {
          expect(response.statusCode).toBe(400);
          expect(response.body.message).toBe("Given solution is incorrect");
      });
    });

    test("Notify the user that the puzzle is submitted if it everything is correct for x-sudoku", () => {
      return request(app)
        .post("/api/submitSolve")
        .send({post_id: 3, solution: xSolution})
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body.message).toBe("Solve submitted");
      });
    });
});

// Potentially need tests for x sudoku checking