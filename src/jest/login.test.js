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
const jwt = require("jsonwebtoken");

//NOTE: to use these tests, must have local test database set up with correct schema on the current pc, 
//as well as having the .env file in the src directory having defintions for TESTDB_HOST, TESTDB_USER etc.

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
  await db.connection.query("INSERT INTO user_login (username, email, password) VALUES ('user1', 'user1@gmail.com', '$2a$10$bGCwqWn3YxkgtuYn1TAKz.OXSNy8KiQ4A5I71ZO6b/0v/OlH1M/xi')");
  await db.connection.query("INSERT INTO user_login (username, email, password) VALUES ('user2', 'user2@gmail.com', '$2a$10$bGCwqWn3YxkgtuYn1TAKz.OXSNy8KiQ4A5I71ZO6b/0v/OlH1M/xi')");
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

describe("Test the POST api/login route", () => {
  test("Should allow a user to login with the correct API call, if they are registered", () => {
    return request(app)
      .post("/api/login")
      .send({username: "user1", password: "password123"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(200);
        // ensure the JWT is valid and correct username
        let cert = process.env.JWTPUBLICKEY.replace(/\\n/g, '\n');
        jwt.verify(response.body.token, cert, { algorithms: ["RS256"] }, function (err, payload) {
            expect(payload.displayName).toBe("user1");
        })
      });
  });

  test("Shouldn't allow a user to login if they give the wrong username", () => {
    return request(app)
      .post("/api/login")
      .send({username: "user123", password: "password123"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Incorrect username or password");
      });
  });

  test("Shouldn't allow a user to login if they give the wrong password", () => {
    return request(app)
      .post("/api/login")
      .send({username: "user1", password: "password1234"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Incorrect username or password");
      });
  });

  test("Shouldn't allow a user to login if they give incomplete data", () => {
    return request(app)
      .post("/api/login")
      .send({username: "user1"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Not all fields have been filled out");
      });
  });

  test("Shouldn't allow a user to login if do not give strings", () => {
    return request(app)
      .post("/api/login")
      .send({username: "user1", password: 12345678})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Username and password must be strings");
      });
  });
});