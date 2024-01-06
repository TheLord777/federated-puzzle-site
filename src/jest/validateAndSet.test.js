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
// JWT with invalid group id
const JWT3 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJHMTktMDIzMjMiLCJkaXNwbGF5TmFtZSI6IkpvaG4gRG9lIiwiZ3JvdXBJRCI6MTksImlhdCI6MTcxNjIzOTAyMn0.RQPoWL-C80DbYBcgJzYAsRfdBvF63ehlgwZcMUg0LVU";
// JWT with wrong payload
const JWT4 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzE2MjM5MDIyfQ.gFgwPdkGPEcQGjoy934vFv9pyjVO6e_18MAF7Fpf9kI";
// JWT with invalid signature
const JWT5 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJHMTktMDIzMjMiLCJkaXNwbGF5TmFtZSI6IkpvaG4gRG9lIiwiZ3JvdXBJRCI6MjksImlhdCI6MTcxNjIzOTAyMn0.oh5_aHjY_3Vxj5zIIq87RGzVlWyIIojOuW2F4mXr7fw";

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

describe("Test the GET api/retrieveToken route", () => {
  test("Should allow a user to validate their JWT, and sets it as their token cookie", () => {
    return request(app)
        .get("/auth/retrieveToken/" + JWT)
        .set("accept", "application/json")
        .then(response => {
            expect(response.statusCode).toBe(302); //is a redirect
            // Cookie header will contain the JWT
            expect(response.headers['set-cookie'][0].includes(JWT)).toBe(true);
        });
  });

  test("Should return an error if the JWT is not from a valid group", () => {
    return request(app)
        .get("/auth/retrieveToken/" + JWT3)
        .set("accept", "application/json")
        .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.text).toBe("Validation error: This groups public key has not been stored. Please return to /login");
        });
  });

  test("Should return an error if the JWT has incorrect payload", () => {
    return request(app)
        .get("/auth/retrieveToken/" + JWT4)
        .set("accept", "application/json")
        .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.text).toBe("Validation error: JWT does not contain payload with groupID, userID and displayName. Please return to /login");
        });
  });

  test("Should return an error if there is no JWT in URL", () => {
    return request(app)
        .get("/auth/retrieveToken/")
        .set("accept", "application/json")
        .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.text).toBe("Validation error: No token in URL. Please return to /login");
        });
  });

  test("Should return an error the JWT has an invalid signature", () => {
    return request(app)
        .get("/auth/retrieveToken/" + JWT5)
        .set("accept", "application/json")
        .then(response => {
            expect(response.statusCode).toBe(400);
            expect(response.text).toBe("Validation error: This token cannot be validated by the groups public key. Please return to /login");
        });
  });

  

});