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

//NOTE: to use these tests, must have local test database set up with correct schema on the current pc, 
//as well as having the .env file in the src directory having defintions for TESTDB_HOST, TESTDB_USER etc.

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

var puzzle2 = {
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

// JWT for user1 G29-34. Valid until 27th Oct 2023
const JWT2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJHMjktMzQiLCJncm91cElEIjoyOSwiZGlzcGxheU5hbWUiOiJ1c2VyMSIsImlhdCI6MTY2Njg3MDU2OCwiZXhwIjoxNjk4NDI4MTY4fQ.bUZvFKvlfbD5Zs1KRgZUhQUw3jJD1dGBBaz2Wq0GL1ZAQdKv-STj7eq7jkuJ4Kq2iEC36Js6gntbYJdetaoUoXOT7GDKP_eaqXHsFv0rZ2zj2fwqqE899eyxPwn8sOO2Bc7AHnITKVbPFHPxk4RyBdKvOzZSDXiK6gjuPSB8Ayg";

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

    // Ensures there is the correct user and posts
    await db.connection.query("INSERT INTO user_login (user_id, username, email, password) VALUES (34, 'user1', 'user1@gmail.com', '$2a$10$bGCwqWn3YxkgtuYn1TAKz.OXSNy8KiQ4A5I71ZO6b/0v/OlH1M/xi')");
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-34', 'user1', 0, 'creator')");
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G28-01', 'p1', 0, 'solver')");
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G28-02', 'p2', 0, 'solver')");
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G28-03', 'p3', 0, 'solver')");
    let sql = "INSERT INTO posts (user_id, title, puzzlejson, date_posted) VALUES ('G29-34', 'Test Post', ?, ?)";
    // Put in 24 puzzles with differing post times
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:45Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:46Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:47Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:48Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:49Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:50Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:51Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:52Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:53Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:54Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:55Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:56Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:65Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:66Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:67Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:68Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:69Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:70Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:71Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:72Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:73Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:74Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle), "2022-10-27T11:43:75Z"]);
    await db.connection.execute(sql, [JSON.stringify(puzzle2), "2022-10-27T11:43:76Z"]);
    // Insert some fake solves
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (24, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (24, 'G29-02')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (24, 'G29-03')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (20, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (20, 'G29-02')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (20, 'G29-03')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (16, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (16, 'G29-02')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (16, 'G29-03')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (17, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (17, 'G29-02')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (22, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (22, 'G29-02')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (8, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (8, 'G29-02')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (1, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (23, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (5, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (4, 'G28-01')");
    await db.connection.query("INSERT INTO solved_puzzles (post_id, user_id) VALUES (24, 'G29-34')");
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

describe("Test the GET api/searchPosts route", () => {
  test("Should allow a user get the first page of posts, type = all, order = recent", () => {
    return request(app)
        .get("/api/searchPosts?type=all&order=recent&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(24);
            expect(response.body.posts[1].post_id).toBe(23);
            expect(response.body.posts[2].post_id).toBe(22);
            expect(response.body.total_pages).toBe(3);
        });
  });

  test("Should allow a user get the first page of posts, type = sudoku, order = recent", () => {
    return request(app)
        .get("/api/searchPosts?type=sudoku&order=recent&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(23);
            expect(response.body.posts[1].post_id).toBe(21);
            expect(response.body.posts[2].post_id).toBe(19);
            expect(response.body.total_pages).toBe(2);
        });
  });

  test("Should allow a user get the first page of posts, type = x-sudoku, order = recent", () => {
    return request(app)
        .get("/api/searchPosts?type=x-sudoku&order=recent&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(24);
            expect(response.body.posts[1].post_id).toBe(22);
            expect(response.body.posts[2].post_id).toBe(20);
        });
  });

  test("Should allow a user get the first page of posts, type = all, order = popular", () => {
    return request(app)
        .get("/api/searchPosts?type=all&order=popular&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(24);
            expect(response.body.posts[0].post_solves).toBe(4);
            expect(response.body.posts[0].solved_by_user).toBe(1);
            expect(response.body.posts[1].post_id).toBe(20);
            expect(response.body.posts[1].solved_by_user).toBe(0);
            expect(response.body.posts[2].post_id).toBe(16);
            // This checks they are ordered by recency if tie
            expect(response.body.posts[3].post_id).toBe(22);
            expect(response.body.posts[4].post_id).toBe(17);
        });
  });

  test("Should allow a user get the first page of posts, type = sudoku, order = popular", () => {
    return request(app)
        .get("/api/searchPosts?type=sudoku&order=popular&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(17);
            expect(response.body.posts[1].post_id).toBe(23);
            expect(response.body.posts[2].post_id).toBe(5);
            expect(response.body.posts[3].post_id).toBe(1);
            expect(response.body.posts[4].post_id).toBe(21);
        });
  });

  test("Should allow a user get the first page of posts, type = x-sudoku, order = popular", () => {
    return request(app)
        .get("/api/searchPosts?type=x-sudoku&order=popular&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(24);
            expect(response.body.posts[1].post_id).toBe(20);
            expect(response.body.posts[2].post_id).toBe(16);
        });
  });

  test("Should allow a user get the second page of posts, type = all, order = recent", () => {
    return request(app)
        .get("/api/searchPosts?type=all&order=recent&page=2")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(14);
            expect(response.body.posts[1].post_id).toBe(13);
            expect(response.body.posts[2].post_id).toBe(12);
        });
  });

  test("Should allow a user get the third page of posts, type = all, order = recent", () => {
    return request(app)
        .get("/api/searchPosts?type=all&order=recent&page=3")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(4);
            expect(response.body.posts[0].post_id).toBe(4);
            expect(response.body.posts[1].post_id).toBe(3);
            expect(response.body.posts[2].post_id).toBe(2);
        });
  });

  test("Should allow a user get the first page of posts, type = all, order = recent, with date constraints", () => {
    return request(app)
        .get("/api/searchPosts?type=all&datefrom=2022-10-27T11:43:70Z&dateto=2022-10-27T11:43:74Z&order=recent&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(5);
            expect(response.body.posts[0].post_id).toBe(22);
            expect(response.body.posts[1].post_id).toBe(21);
            expect(response.body.posts[2].post_id).toBe(20);
            expect(response.body.posts[3].post_id).toBe(19);
            expect(response.body.posts[4].post_id).toBe(18);
            expect(response.body.total_pages).toBe(1);
        });
  });

  test("Should allow a user get the first page of posts, type = all, order = recent, exclude = yes", () => {
    return request(app)
        .get("/api/searchPosts?type=all&order=recent&page=1&exclude=yes&ascending=false")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(23);
            expect(response.body.posts[1].post_id).toBe(22);
            expect(response.body.posts[2].post_id).toBe(21);
        });
  });

  test("Should allow a user to order by ascending", () => {
    return request(app)
        .get("/api/searchPosts?type=all&order=recent&page=1&exclude=yes&ascending=true")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.posts.length).toBe(10);
            expect(response.body.posts[0].post_id).toBe(1);
            expect(response.body.posts[1].post_id).toBe(2);
            expect(response.body.posts[2].post_id).toBe(3);
        });
  });

  test("Should return a 404 when invalid page", () => {
    return request(app)
        .get("/api/searchPosts?type=all&order=recent&page=4")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(404);
        });
  });

  test("Should return a 404 when invalid type", () => {
    return request(app)
        .get("/api/searchPosts?type=edfdhf&order=recent&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(404);
        });
  });

  test("Should return a 404 when invalid order", () => {
    return request(app)
        .get("/api/searchPosts?type=all&order=dfsda&page=1")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(404);
        });
  });

  test("Should return a 401 when no mandatory fields sent", () => {
    return request(app)
        .get("/api/searchPosts")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(401);
        });
  });

});