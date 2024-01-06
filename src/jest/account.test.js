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

var solution = [[9, 4, 8, 2, 7, 5, 1, 3, 6],
                [5, 2, 6, 4, 1, 3, 9, 7, 8],
                [7, 3, 1, 6, 9, 8, 5, 4, 2],
                [4, 8, 2, 3, 5, 1, 7, 6, 9],
                [6, 9, 3, 7, 8, 4, 2, 5, 1],
                [1, 7, 5, 9, 6, 2, 4, 8, 3],
                [2, 1, 4, 5, 3, 6, 8, 9, 7],
                [8, 6, 7, 1, 4, 9, 3, 2, 5],
                [3, 5, 9, 8, 2, 7, 6, 1, 4]];

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
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-63', 'jam', 5, 'administrator')");
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-34', 'user1', 0, 'solver')");
    let sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (1, 'G29-34', 'First Post', ?, '2022-10-27T11:43:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzle)]);
    sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (2, 'G29-34', 'Second Post', ?, '2022-10-27T11:56:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzle)]);
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (1, 'G29-63')");
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

describe("Test the GET api/account route", () => {
    test("Should allow a user to retrieve the details of the account that they are logged into", () => {
      return request(app)
          .get("/api/account/G29-34")
          .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
          .set("accept", "application/json")
          .expect('Content-Type', /json/)
          .then(response => {
              expect(response.statusCode).toBe(200);
              expect(response.body.username).toBe("user1");
              expect(response.body.group).toBe("29");
              expect(response.body.noPuzzlesSolved).toBe(0);
              expect(response.body.noPuzzlesCreated).toBe(2);
              expect(response.body.role).toBe("solver");
          });
    });
    
    test("Should allow a user to retrieve the details of another account", () => {
        return request(app)
            .get("/api/account/G29-63")
            .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
            .set("accept", "application/json")
            .expect('Content-Type', /json/)
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.username).toBe("jam");
                expect(response.body.group).toBe("29");
                expect(response.body.noPuzzlesSolved).toBe(5);
                expect(response.body.noPuzzlesCreated).toBe(0);
                expect(response.body.role).toBe("administrator");
            });
      });

      test("Should give an error when retrieving info for a nonexistant account", () => {
        return request(app)
            .get("/api/account/G29-4000")
            .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
            .set("accept", "application/json")
            .expect('Content-Type', /json/)
            .then(response => {
                expect(response.statusCode).toBe(500);
                expect(response.body.message).toBe("Error: could not retrieve user info from database");
            });
      });

  
});

describe("Test the PATCH api/account route", () => {
    test("Should allow a user to alter their own account info", () => {
      return request(app)
          .patch("/api/account/")
          .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
          .set("accept", "application/json")
          .expect('Content-Type', /json/)
          .send({usernameChanged: "changed", username: "user2", bio: "hello I am user2"})
          .then(response => {
              expect(response.statusCode).toBe(200);
              expect(response.body.username).toBe("user2");
              expect(response.body.bio).toBe("hello I am user2");
          });
    });
    
    test("Should allow a user to only alter one value", () => {
        return request(app)
            .patch("/api/account/")
            .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
            .set("accept", "application/json")
            .expect('Content-Type', /json/)
            .send({usernameChanged: "not changed", username: "user1", bio: "hello I am user1"})
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.username).toBe("user1");
                expect(response.body.bio).toBe("hello I am user1");
            });
      });

      test("Should give an error when giving a username of incorrect length", () => {
        return request(app)
            .patch("/api/account/")
            .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
            .set("accept", "application/json")
            .expect('Content-Type', /json/)
            .send({usernameChanged: "changed", username: "hi", bio: "hello I am hi"})
            .then(response => {
                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Username must be between 3 and 25 characters");
            });
      });

      test("Should give an error when giving a bio of incorrect length", () => {
        return request(app)
            .patch("/api/account/")
            .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
            .set("accept", "application/json")
            .expect('Content-Type', /json/)
            .send({usernameChanged: "changed", username: "heeei", bio: "askdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhgaskdjhfbgakleriugfhbaeosrlkughbaerogstrnbgolksratuhg"})
            .then(response => {
                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Bio must be under 200 characters");
            });
      });

      test("Should give an error when giving a username that already exists", () => {
        return request(app)
            .patch("/api/account/")
            .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
            .set("accept", "application/json")
            .expect('Content-Type', /json/)
            .send({usernameChanged: "changed", username: "jam", bio: "hello there"})
            .then(response => {
                expect(response.statusCode).toBe(500);
                expect(response.body.message).toBe("User cannot update username - user with this name already exists!\nBio Updated\n");
            });
      });
});


describe("Test the DELETE api/account route", () => {
    test("Should allow a user to delete their own account", () => {
        return request(app)
                .post("/api/login/")
                .set("accept", "application/json")
                .send({username: "user1", password: "password123"})
                .expect('Content-Type', /json/)
                .then(response => {
                    expect(response.statusCode).toBe(200);
                    return request(app)
                        .delete("/api/account/G29-34")
                        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
                        .set("accept", "application/json")
                        .expect('Content-Type', /json/)
                        .then(response => {
                            expect(response.statusCode).toBe(200);
                            expect(response.body.message).toBe("Account Deleted");
                            return request(app)
                                .post("/api/login/")
                                .set("accept", "application/json")
                                .send({username: "user1", password: "password123"})
                                .expect('Content-Type', /json/)
                                .then(response => {
                                    expect(response.statusCode).toBe(400);
                                    expect(response.body.message).toBe("Incorrect username or password");
                            });
                        });
                });
    });

    test("Shouldn't allow a user to delete another account", () => {
        return request(app)
        .delete("/api/account/G29-64")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(401);
        });
    });

    test("Should allow an admin to delete another account", () => {
        return request(app)
        .delete("/api/account/G29-34")
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
        });
    });

    test("Should allow an admin to delete their own account", () => {
        return request(app)
        .delete("/api/account/G29-64")
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
        });
    });
    
});