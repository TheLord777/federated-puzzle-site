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

//JWT for jam G29-63. Valid until 5th Nov 2023
const JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJHMjktNjMiLCJncm91cElEIjoyOSwiZGlzcGxheU5hbWUiOiJqYW0iLCJpYXQiOjE2Njc2NDc5ODEsImV4cCI6MTY5OTIwNTU4MX0.FRdKd0lPoz-gmaZQWx0A0Cz8C4Qbarkb6ZKXxWDYEHyVi1B_5kpdRtOda1OG0DqK871PpETl3uE53QAEsRLXXVyWhz_0e3T7jhklIIE0niFf298ncrq3LNegdQjXvmQfnDCqjXHy32Kr8Ga6RDE0STHjxrdFwJpY9UvsutZ4MvA"
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
    
    // Ensures there is the correct user and post
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-34', 'user1', 7, 'solver')");
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

describe("Test the GET api/accountDetails route", () => {
  test("Should allow a user to retrieve the details of the account that they are logged into", () => {
    return request(app)
        .get("/api/accountDetails")
        .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body.username).toBe("user1");
            expect(response.body.group).toBe(29);
        });
  });

  test("Should return an error if token sent with get request is invalid", () => {
    return request(app)
        .get("/api/accountDetails")
        .set("Cookie", ["token=" + "notarealtoken" + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe("JWT Invalid: No token/payload set in 'token' cookie. Please log out and log in again.");
        });
  });

  test("Should return an error if user is not stored in user_activity", () => {
    return request(app)
        .get("/api/accountDetails")
        .set("Cookie", ["token=" + JWT + ";authenticated=true"])
        .set("accept", "application/json")
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe("Error: could not retrieve user info from database");
        });
  });

});