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
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-34', 'user1', 0, 'administrator')");
    let sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (1, 'G29-34', 'First Post', ?, '2022-10-27T11:43:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzle)]);
    sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (2, 'G29-34', 'Second Post', ?, '2022-10-27T11:56:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzle)]);
    sql = "INSERT INTO posts (post_id, user_id, title, puzzlejson, date_posted) VALUES (3, 'G29-34', 'Third Post', ?, '2022-10-27T11:56:45Z')";
    await db.connection.execute(sql, [JSON.stringify(puzzle)]);
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (1, 'G29-63')");
    await db.connection.query("INSERT INTO comments (comment_id, post_id, user_id, content, date_posted, likes, parent_comment_id) VALUES (1, 1, 'G29-34', 'this is a comment', 'date', 5, NULL);");
    await db.connection.query("INSERT INTO comments (comment_id, post_id, user_id, content, date_posted, likes, parent_comment_id) VALUES (2, 1, 'G29-63', 'this is a another comment', 'date', 5, NULL);");
    await db.connection.query("INSERT INTO comments (comment_id, post_id, user_id, content, date_posted, likes, parent_comment_id) VALUES (3, 1, 'G29-63', 'this is a reply to another comment', 'date', 5, 2);");
    await db.connection.query("INSERT INTO comments (comment_id, post_id, user_id, content, date_posted, likes, parent_comment_id) VALUES (4, 1, 'G29-34', 'this is a reply to a reply', 'date', 5, 3);");
    await db.connection.query("INSERT INTO comments (comment_id, post_id, user_id, content, date_posted, likes, parent_comment_id) VALUES (5, 3, 'G29-34', 'hi', 'date', 5, NULL);");
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

describe("Test the the GET api/comments/id route", () => {
    test("Should return all top level comments of a post", () => {
        return request(app)
        .get("/api/comments/1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body[0].username).toBe("user1");
            expect(response.body[1].username).toBe("jam");
        });
    });
    test("Should return 404 if no comments found for that post", () => {
        return request(app)
        .get("/api/comments/2")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(404);
        });
    });
});

describe("Test the the GET api/replies/id route", () => {
    test("Should return all top level replies of a comment", () => {
        return request(app)
        .get("/api/replies/2")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].username).toBe("jam");
        });
    });
    test("Should return all top level replies of another reply", () => {
        return request(app)
        .get("/api/replies/3")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].username).toBe("user1");
        });
    });
    test("Should return 404 if no replies found for that comment", () => {
        return request(app)
        .get("/api/replies/1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(404);
        });
    });
});

describe("Test the the GET api/comment/id route", () => {
    test("Should return a specific comment", () => {
        return request(app)
        .get("/api/comment/2")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            console.log(response.body);
            expect(response.body.username).toBe("jam");
        });
    });
    test("Should return 404 if no comments found", () => {
        return request(app)
        .get("/api/comment/77")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(404);
        });
    });
});

describe("Test the the POST api/comment route", () => {
    test("Should allow comments to be posted", () => {
        return request(app)
          .post("/api/comment")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_id: 1, content: "new comment!"})
          .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Comment submitted");
            expect(response.body.comment_id).toBe(6);
          });
    });
    test("Shouldn’t allow comments to be posted to a nonexistent post", () => {
        return request(app)
          .post("/api/comment")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_id: 13, content: "new comment!"})
          .then(response => {
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe("Error inserting into database");
          });
    });
    test("Should allow comments to be replied to", () => {
        return request(app)
          .post("/api/comment")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_id: 1, content: "new reply!", parent_comment_id: 1})
          .then(response => {
            expect(response.statusCode).toBe(200);
          });
    });
    test("Shouldn’t allow a reply where the comment being replied to is not from the post being commented on", () => {
        return request(app)
          .post("/api/comment")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_id: 1, content: "new reply!", parent_comment_id: 5})
          .then(response => {
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe("Error inserting into database");
          });
    });
    test("Shouldn’t allow a reply to a nonexistent comment", () => {
        return request(app)
          .post("/api/comment")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({post_id: 1, content: "new reply!", parent_comment_id: 66})
          .then(response => {
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe("Error inserting into database");
          });
    });
});

describe("Test the the DELETE api/comment route", () => {
    test("Should allow a user to delete their own comment", () => {
        return request(app)
          .del("/api/comment/1")
          .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
          .set("accept", "application/json")
          .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Comment deleted");
            return request(app)
                .get("/api/comment/1")
                .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
                .set("accept", "application/json")
                .expect('Content-Type', /json/)
                .then(response => {
                    expect(response.statusCode).toBe(200);
                    expect(response.body.content).toBe("[comment deleted]");
                });
          });
    });
    test("Shouldnt allow a user to delete a comment that does not belong to the deleter", () => {
        return request(app)
          .del("/api/comment/1")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .then(response => {
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe("User not authorised to delete this comment");
          });
    });

    test("Should allow an admin to delete a comment that does not belong to the deleter", () => {
        return request(app)
          .del("/api/comment/2")
          .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
          .set("accept", "application/json")
          .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Comment deleted");
          });
    });
});

describe("Test the the PATCH api/comment route", () => {
    test("Should allow users to edit own comments", () => {
        return request(app)
          .patch("/api/comment/1")
          .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
          .set("accept", "application/json")
          .send({content: "edited!"})
          .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Comment edited");
            return request(app)
                .get("/api/comment/1")
                .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
                .set("accept", "application/json")
                .expect('Content-Type', /json/)
                .then(response => {
                    expect(response.statusCode).toBe(200);
                    expect(response.body.content).toBe("edited!");
                });
          });
    });
    test("Shouldn't allow editing a comment that does not belong to the editor", () => {
        return request(app)
          .patch("/api/comment/1")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({content: "edited!"})
          .then(response => {
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe("User not authorised to edit this comment");
          });
    });
    test("Shouldnt' allow a user to edit a comment without providing new content", () => {
        return request(app)
          .patch("/api/comment/1")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Incorrect parameters. Requires content to edit comment with");
          });
    });
});