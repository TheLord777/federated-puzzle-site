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

describe("Test the POST api/register route", () => {
  test("Should allow a new user to register with the correct API call", () => {
    return request(app)
      .post("/api/register")
      .send({username: "newuser", email: "newuser@gmail.com", password: "supersecurepassword"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(200);
      });
  });

  test("Should stop a new user from registering with a username that is being used", () => {
    return request(app)
      .post("/api/register")
      .send({username: "user1", email: "newuser@gmail.com", password: "supersecurepassword"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("A user with the same username or email already exists");
      });
  });

  test("Should stop a new user from registering with an email that is being used", () => {
    return request(app)
      .post("/api/register")
      .send({username: "newuser", email: "user1@gmail.com", password: "supersecurepassword"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("A user with the same username or email already exists");
      });
  });

  test("Should respond with an error if not all fields are filled out", () => {
    return request(app)
      .post("/api/register")
      .send({username: "", email: "user1@gmail.com", password: "supersecurepassword"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Not all fields have been filled out");
      });
  });

  test("Should respond with an error if not all fields are present in the request", () => {
    return request(app)
      .post("/api/register")
      .send({username: "user1", email: "user1@gmail.com"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Not all fields have been filled out");
      });
  });

  test("Should respond with an error if fields are not strings", () => {
    return request(app)
      .post("/api/register")
      .send({username: 500000, email: "user1@gmail.com", password: "password"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Username, email and password must be strings");
      });
  });

  test("Should respond with an error if username is too long or short", () => {
    return request(app)
      .post("/api/register")
      .send({username: "h", email: "user1@gmail.com", password: "password"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Username must be between 3 and 25 characters");
      });
  });

  test("Should respond with an error if email does not have @ symbol and .", () => {
    return request(app)
      .post("/api/register")
      .send({username: "hellothere", email: "user1gmail.com", password: "password"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Email must contain an @ symbol and a .");
      });
  });

  test("Should respond with an error if password is too short", () => {
    return request(app)
      .post("/api/register")
      .send({username: "hellothere", email: "user1@gmail.com", password: "pass"})
      .set("Accept", "application/json")
      .then(response => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Password must be at least 6 characters long");
      });
  });
});