# Project Code

A Sudoku-solving site by 200016710 (Only in first semester), 200003285, 190031498, 200027532, 200014277

## Features of our site:

* Login Page where users can register and sign in
* Landing Page, where users can navigate recently posted puzzles and view the leaderboard
* Puzzle Page, where users can attempt to solve puzzles (either sudoku or x-sudoku) that have been created by other users
    * A comments section on each puzzle, where users can discuss puzzles and reply to threads of comments
* Submission Page, where users can create and submit their own Sudoku or X-sudoku puzzles
    * An import feature where puzzles from other sites and the same site can be uploaded and modified
    * An automated checker and solver to ensure all puzzles submitted have a single unique solution
* Search Page, where users can combine various filters and orderings to view all puzzles submitted to the site
* Account Page, where users can see stats and read bios of other users
* Unique roles for each user that allows access to different features of the site
* Navigation bar, that allows the user to navigate the entire site, as well as log out
* Supergroup interaction: 
    * Allowing accounts registered on other sites to be used to log in on this site
    * Allowing accounts registered on this site to be used to log in to other sites
    * Allowing puzzles downloaded from other sites to be uploaded to this site

All features are supported by a database and secure backend to allow all data to persist and be accurate.

## Structure of the Project:

* /src - stores the source code for the backend, such as the database functions and routing
    * /src/routes - stores the logic for each API endpoint
    * /src/.jest - stores the Jest integration tests
    * /src/frontend - the folder for the frontend
        * /src/frontend/public - the public folder where statically served files can be accessed
        * /src/frontend/src - the frontend source folder, contains all React.js and css files

## How to run the server:

1. Clone the repo onto your machine / download all the files
2. Run "npm install" from the src/ directory
3. Run "npm install" from the src/frontend/src directory
4. Set up a .env file in /src. This must contain:

    * DB_HOST - the server your database is stored on
    * DB_USER - the database user account
    * DB_PASSWORD - the password to the database
    * DB - the name of the database
    * JWTPRIVATEKEY - the RS256 private key used to sign JWT's from this group
    * JWTPUBLICKEY - the RS256 public key used to verify JWT's from this group

5. Run "npm run build" from src/frontend
6. Run "node server.js" from src/

The server should be running on port 22570.

Note: If you want to set up a database to run for the server, the schema.sql file in src contains the schema that the production database uses. Setting up a database with this schema and using those details in the .env file should allow the server to run using that database. The supergroup_info table should have at least the public key for group 29.

## How to run the Jest Backend tests

First, complete all above steps on running the server. 
Note: To run these tests you should be on a lab PC, not host server.

1. Create a mysql database and initialise it with the schema.sql file in src/
    * For example: "mysql -u [username] -p [test_database] < schema.sql
2. Add the following to the .env file:

    * TESTDB_HOST - the server your test db is stored on
    * TESTDB_USER - the test db user account
    * TESTDB_PASSWORD - the password to the test db
    * TESTDB_DB - the name of the test db

3. You can now run the unit tests from src/ with "npm test -- --runInBand"

## How to run the Puzzle Method tests

To ensure the methods used to check puzzle submissions are valid, and match templates, a series of test cases have been created and placed in /src/frontend/src/puzzleMethodTests.js

To run these tests, simply navigate to the folder and run "node puzzleMethodTests.js"

The successful output is for there to be no "Assertion Failed" messages in the output. Other Errors are intended.

Expected output is:

```
Length Error: Column 0 has 0 elements, should be 9
Length Error: Column 8 has 8 elements, should be 9
Empty Error: Empty space on Row 0 Column 1
Repeat Error: Repeat on Row 0 with number 4
Repeat Error: Repeat on Row 4 with number 4
Num Error: NaN on Row 1 Column 3
Length Error: Column 1 has 8 elements, should be 9
Empty Error: Empty space on Row 3 Column 2
Num Error: NaN on Row 4 Column 5
Repeat Error: Repeat on Row 1 with number 6
Empty Error: Empty space on Row 3 Column 1
Repeat Error: Repeat on Row 0 with number 4
Verification Error: The template is does not match with the solution
```

## How to run the Puzzle Variant Method tests

Similar tests exist for the X-Sudoku variant. To run these tests navigate to the /src/frontend/src/ folder and run "node variantMethodTest.js"

The successful output is for there to be no "Assertion Failed" messages in the output. Other Errors are intended.

Expected output is:

```
true
true
Length Error: Column 1 has 8 elements, should be 9
Empty Error: Empty space on Row 2 Column 5
Empty Error: Empty space on Row 3 Column 4
Repeat Error: Repeat on Row 9 with number 4
Empty Error: Empty space on Row 1 Column 5
Length Error: Column 1 has 0 elements, should be 9
Empty Error: Empty space on Row 3 Column 6
Length Error: Column 1 has 8 elements, should be 9
Repeat Error: Repeat on Row 2 with number 9
Repeat Error: Repeat on Row 3 with number 2
Repeat Error: Repeat on Row 3 with number 2
Num Error: NaN on Row 4 Column 5
```

## How to run the Unique Solution Checker tests

Similar tests exist for the unique solution checkers for puzzles. To run these tests navigate to the /src/frontend/src/ folder and run "node checkUniqueSolutionTest.js"

The successful result is for there to be nothing output by the program.

