import { runAllSolutionTests, runAllTemplateTests, templateVerification } from "./puzzleMethodFrontend.js"

var testSolutionCorrect =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var totalEmptySolution = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
];

var testSolutionMissSomeElements =
    [
        [, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, , 2, 5, 7, 1, 4, 9, 3],
        [1, 9, , 8, 3, 4, 5, 6, 2],
        [8, 2, 6, , 9, 5, 3, 4, 7],
        [3, 7, 4, 6, , 2, 9, 1, 5],
        [9, 5, 1, 7, 4, , 6, 2, 8],
        [5, 1, 9, 3, 2, 6, , 7, 4],
        [2, 4, 8, 9, 5, 7, 1, , 6],
        [7, 6, 3, 4, 1, 8, 2, 5,]
    ];

var testSolutionManyEmpty =
    [
        [4, 0, 5, 2, 6, 9, 7, 0, 1],
        [6, 8, 0, 5, 7, 1, 0, 9, 3],
        [1, 9, 7, 0, 3, 0, 5, 6, 2],
        [8, 2, 6, 1, 0, 5, 3, 4, 7],
        [3, 7, 4, 0, 8, 0, 9, 1, 5],
        [9, 5, 0, 7, 4, 3, 0, 2, 8],
        [5, 0, 9, 3, 2, 6, 8, 0, 4],
        [0, 4, 8, 9, 5, 7, 1, 3, 0],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var testSolutionRowError =
    [
        [4, 3, 4, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var testSolutionColumnError =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [4, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

// Element missed in the middle of the array
var testSolutionLengthErrorTypeOne =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, , 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

// Element missed in the tail of the array
var testSolutionLengthErrorTypeTwo =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9,],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var testSolutionEmptyError =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, "", 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var testSolutionNotNumError =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, "Q", 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var testSolutionBigBoxError =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 6, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var testSpaceAndColumnError =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [4, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, " ", 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var testEmptyAndColumnError =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [4, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, "", 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

// It's a template that used for testing, 0 means the boxes to be filled by player.
var templateOne =
    [
        [4, 3, 5, 0, 6, 9, 0, 8, 0],
        [6, 0, 2, 5, 7, 1, 4, 0, 3],
        [1, 9, 7, 0, 3, 0, 5, 0, 2],
        [8, 2, 0, 1, 0, 5, 3, 4, 7],
        [0, 7, 4, 6, 8, 0, 0, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 0, 8],
        [0, 1, 0, 3, 0, 6, 0, 7, 4],
        [2, 0, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 0, 4, 0, 8, 2, 5, 0]
    ];

// It's a sample for tests, to compare with templates to see if there is anywhere
// of the original template is changed
var sampleOneSolved =
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ];

var incorrectSolutionForTemplate =
    [
        [8, 7, 3, 2, 4, 1, 9, 5, 6],
        [9, 4, 5, 7, 8, 6, 3, 2, 1],
        [1, 2, 6, 9, 3, 5, 8, 7, 4],
        [3, 1, 4, 5, 6, 8, 2, 9, 7],
        [2, 5, 7, 4, 1, 9, 6, 3, 8],
        [6, 9, 8, 3, 7, 2, 1, 4, 5],
        [4, 6, 2, 1, 5, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 3, 7, 8, 9],
        [5, 3, 1, 8, 9, 7, 4, 6, 2]
    ];

var templateHintLessThanSeventeen =
    [
        [0, 0, 0, 0, 0, 0, 0, 8, 0],
        [0, 0, 2, 5, 0, 0, 0, 0, 0],
        [0, 0, 7, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 4, 6, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 4],
        [0, 0, 0, 0, 0, 0, 1, 0, 6],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

var templateRepeatNumbers =
    [
        [4, 3, 4, 0, 6, 9, 0, 4, 0],
        [6, 0, 2, 5, 7, 1, 4, 0, 3],
        [1, 9, 7, 0, 3, 0, 5, 0, 2],
        [8, 2, 0, 1, 0, 3, 3, 4, 7],
        [0, 7, 4, 6, 8, 0, 0, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 0, 8],
        [0, 1, 0, 3, 0, 3, 0, 7, 4],
        [2, 0, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 0, 4, 0, 1, 2, 3, 0]
    ];

// Test each solution/template

// Correct solution should evaluate to true
console.assert(runAllSolutionTests(testSolutionCorrect) == true);
// Empty solution should evaluate to false
console.assert(runAllSolutionTests(totalEmptySolution) == false);
// Solution missing elements should evaluate to false
console.assert(runAllSolutionTests(testSolutionMissSomeElements) == false);
// Solution with 0's should evaluate to false
console.assert(runAllSolutionTests(testSolutionManyEmpty) == false);
// Solution with repeated element in a row should evaluate to false
console.assert(runAllSolutionTests(testSolutionRowError) == false);
// Solution with repeated element in a column should evaluate to false
console.assert(runAllSolutionTests(testSolutionColumnError) == false);
// Solution with element missing in a middle of a row should evaluate to false
console.assert(runAllSolutionTests(testSolutionLengthErrorTypeOne) == false);
// Solution with element missing at the end of a row should evaluate to false
console.assert(runAllSolutionTests(testSolutionLengthErrorTypeTwo) == false);
// Solution with element that is an empty string should evaluate to false
console.assert(runAllSolutionTests(testSolutionEmptyError) == false);
// Solution with a non-numeric element should evaluate to false
console.assert(runAllSolutionTests(testSolutionNotNumError) == false);
// Solution with a repeated element in a Sudoku box should evaluate to false
console.assert(runAllSolutionTests(testSolutionBigBoxError) == false);
// Solution with a whitespace character, and a repeated element in a column should evaluate to false
console.assert(runAllSolutionTests(testSpaceAndColumnError) == false);
// Solution with an empty string, and a repeated element in a column should evaluate to false

// Template with correct layout should evaluate to true
console.assert(runAllTemplateTests(templateOne) == true);
// Template with incorrect layout should evaluate to false
console.assert(runAllTemplateTests(templateRepeatNumbers) == false);
// Template with less than 17 initial values should evaluate to false
console.assert(runAllTemplateTests(templateHintLessThanSeventeen) == false);

// Template and solution should match
console.assert(templateVerification(templateOne, sampleOneSolved) == true);
// Non-matching template and solution should evaluate to false
console.assert(templateVerification(templateOne, incorrectSolutionForTemplate) == false);

// TESTS PASS IF OUTPUT HAS NO "Assertion failed" MESSAGES
