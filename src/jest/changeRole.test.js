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
    await db.connection.query("INSERT INTO user_activity (user_id, username, nopuzzlessolved, user_role) VALUES ('G29-333', 'user2', 0, 'solver')");
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

describe("Test the PATCH api/changeRole route", () => {
    test("Should allow an admin to change another users role", () => {
      return request(app)
          .patch("/api/changeRole/")
          .set("Cookie", ["token=" + JWT + ";authenticated=true"])
          .set("accept", "application/json")
          .send({user_id: "G29-34", role: "creator"})
          .then(response => {
              expect(response.statusCode).toBe(200);
              return request(app)
                .get("/api/account/G29-34")
                .set("Cookie", ["token=" + JWT + ";authenticated=true"])
                .set("accept", "application/json")
                .expect('Content-Type', /json/)
                .then(response => {
                    expect(response.statusCode).toBe(200);
                    expect(response.body.role).toBe("creator");
                });
          });
    });

    test("Shouldn't allow an admin to change another admins role", () => {
        return request(app)
            .patch("/api/changeRole/")
            .set("Cookie", ["token=" + JWT + ";authenticated=true"])
            .set("accept", "application/json")
            .send({user_id: "G29-34", role: "administrator"})
            .then(response => {
                expect(response.statusCode).toBe(200);
                return request(app)
                    .patch("/api/changeRole/")
                    .set("Cookie", ["token=" + JWT + ";authenticated=true"])
                    .set("accept", "application/json")
                    .send({user_id: "G29-34", role: "solver"})
                    .then(response => {
                      expect(response.statusCode).toBe(401);
                  });
            });
      });

      test("Shouldn't allow a non-admin to change their own role", () => {
        return request(app)
            .patch("/api/changeRole/")
            .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
            .set("accept", "application/json")
            .send({user_id: "G29-34", role: "solver"})
            .then(response => {
                expect(response.statusCode).toBe(401);
            });
      });

      test("Shouldn't allow a non-admin to change another users role", () => {
        return request(app)
            .patch("/api/changeRole/")
            .set("Cookie", ["token=" + JWT2 + ";authenticated=true"])
            .set("accept", "application/json")
            .send({user_id: "G29-333", role: "creator"})
            .then(response => {
                expect(response.statusCode).toBe(401);
            });
      });
});