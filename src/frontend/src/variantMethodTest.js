import { runAllSolutionTestsForXSudoku, runAllTemplateTestsForXSudoku, templateVerification } from "./puzzleMethodVariant.js"
var testTemplateCorrectX =
    [
        [0, 0, 0, 0, 0, 7, 9, 0, 0],
        [0, 0, 0, 0, 2, 0, 7, 0, 0],
        [0, 9, 0, 5, 0, 0, 2, 0, 4],
        [5, 0, 7, 0, 4, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0],
        [8, 6, 0, 0, 0, 0, 5, 0, 0],
        [9, 0, 3, 8, 0, 0, 0, 6, 0],
        [0, 4, 2, 0, 0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 7, 0]
    ];

var testSolutionCorrectX =
    [
        [4, 2, 1, 3, 6, 7, 9, 8, 5],
        [3, 8, 5, 4, 2, 9, 7, 1, 6],
        [7, 9, 6, 5, 8, 1, 2, 3, 4],
        [5, 3, 7, 2, 4, 8, 6, 9, 1],
        [2, 1, 9, 6, 7, 5, 8, 4, 3],
        [8, 6, 4, 9, 1, 3, 5, 2, 7],
        [9, 7, 3, 8, 5, 4, 1, 6, 2],
        [1, 4, 2, 7, 9, 6, 3, 5, 8],
        [6, 5, 8, 1, 3, 2, 4, 7, 9]
    ];

var testTemplateLengthError =
    [
        [0, 0, 0, 0, 0, 7, 0, 0],
        [0, 0, 0, 0, 2, 0, 7, 0, 0],
        [0, 9, 0, 5, 0, 0, 2, 0, 4],
        [5, 0, 7, 0, 4, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0],
        [8, 6, 0, 0, 0, 0, 5, 0, 0],
        [9, 0, 3, 8, 0, 0, 0, 6, 0],
        [0, 4, 2, 0, 0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 7, 0]
    ];




var testTemplateSpace =
    [
        [0, 0, 0, 0, 0, 7, 9, 0, 0],
        [0, 0, 0, 0, " ", 0, 7, 0, 0],
        [0, 9, 0, 5, 0, 0, 2, 0, 4],
        [5, 0, 7, 0, 4, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0],
        [8, 6, 0, 0, 0, 0, 5, 0, 0],
        [9, 0, 3, 8, 0, 0, 0, 6, 0],
        [0, 4, 2, 0, 0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 7, 0]
    ];

var testTemplateEmpty =
    [
        [0, 0, 0, 0, 0, 7, 9, 0, 0],
        [0, 0, 0, 0, 2, 0, 7, 0, 0],
        [0, 9, 0, "", 0, 0, 2, 0, 4],
        [5, 0, 7, 0, 4, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0],
        [8, 6, 0, 0, 0, 0, 5, 0, 0],
        [9, 0, 3, 8, 0, 0, 0, 6, 0],
        [0, 4, 2, 0, 0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 7, 0]
    ];

var testTemplateCorrectXtemplateHintLessThanSeventeenWhichIsSix =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 7, 0, 0],
        [0, 9, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

var testTemplateRepeatNum =
    [
        [0, 0, 0, 0, 0, 7, 9, 0, 0],
        [0, 0, 0, 0, 2, 0, 7, 0, 0],
        [0, 9, 0, 5, 0, 0, 2, 0, 4],
        [5, 0, 7, 0, 4, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0],
        [8, 6, 0, 0, 0, 0, 5, 0, 0],
        [9, 0, 3, 8, 0, 0, 0, 6, 0],
        [0, 4, 2, 0, 0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 4, 0]
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

var testEmptyInSolution =
    [
        [4, 2, 1, 3, "", 7, 9, 8, 5],
        [3, 8, 5, 4, 2, 9, 7, 1, 6],
        [7, 9, 6, 5, 8, 1, 2, 3, 4],
        [5, 3, 7, 2, 4, 8, 6, 9, 1],
        [2, 1, 9, 6, 7, 5, 8, 4, 3],
        [8, 6, 4, 9, 1, 3, 5, 2, 7],
        [9, 7, 3, 8, 5, 4, 1, 6, 2],
        [1, 4, 2, 7, 9, 6, 3, 5, 8],
        [6, 5, 8, 1, 3, 2, 4, 7, 9]
    ];

var testSpaceInSolution =
    [
        [4, 2, 1, 3, 6, 7, 9, 8, 5],
        [3, 8, 5, 4, 2, 9, 7, 1, 6],
        [7, 9, 6, 5, 8, " ", 2, 3, 4],
        [5, 3, 7, 2, 4, 8, 6, 9, 1],
        [2, 1, 9, 6, 7, 5, 8, 4, 3],
        [8, 6, 4, 9, 1, 3, 5, 2, 7],
        [9, 7, 3, 8, 5, 4, 1, 6, 2],
        [1, 4, 2, 7, 9, 6, 3, 5, 8],
        [6, 5, 8, 1, 3, 2, 4, 7, 9]
    ];

var testLengthErrorInSolution =
    [
        [4, 2, 1, 3, 6, 7, 9, 8,],
        [3, 8, 5, 4, 2, 9, 7, 1, 6],
        [7, 9, 6, 5, 8, 1, 2, 3, 4],
        [5, 3, 7, 2, 4, 8, 6, 9, 1],
        [2, 1, 9, 6, 7, 5, 8, 4, 3],
        [8, 6, 4, 9, 1, 3, 5, 2, 7],
        [9, 7, 3, 8, 5, 4, 1, 6, 2],
        [1, 4, 2, 7, 9, 6, 3, 5, 8],
        [6, 5, 8, 1, 3, 2, 4, 7, 9]
    ];

var testBigBoxErrorInSolution =
    [
        [4, 2, 1, 3, 6, 7, 9, 8, 5],
        [3, 9, 5, 4, 2, 9, 7, 1, 6],
        [7, 9, 6, 5, 8, 1, 2, 3, 4],
        [5, 3, 7, 2, 4, 8, 6, 9, 1],
        [2, 1, 9, 6, 7, 5, 8, 4, 3],
        [8, 6, 4, 9, 1, 3, 5, 2, 7],
        [9, 7, 3, 8, 5, 4, 1, 6, 2],
        [1, 4, 2, 7, 9, 6, 3, 5, 8],
        [6, 5, 8, 1, 3, 2, 4, 7, 9]
    ];

var testRowErrorSolution =
    [
        [4, 2, 1, 3, 6, 7, 9, 8, 5],
        [3, 8, 5, 4, 2, 9, 7, 1, 6],
        [7, 9, 6, 5, 8, 1, 2, 2, 4],
        [5, 3, 7, 2, 4, 8, 6, 9, 1],
        [2, 1, 9, 6, 7, 5, 8, 4, 3],
        [8, 6, 4, 9, 1, 3, 5, 2, 7],
        [9, 7, 3, 8, 5, 4, 1, 6, 2],
        [1, 4, 2, 7, 9, 6, 3, 5, 8],
        [6, 5, 8, 1, 3, 2, 4, 7, 9]
    ];

var testColumnErrorSolution =
    [
        [4, 2, 1, 3, 6, 7, 9, 8, 5],
        [3, 8, 5, 4, 2, 9, 7, 1, 6],
        [7, 9, 6, 5, 8, 1, 2, 2, 4],
        [5, 3, 7, 2, 4, 8, 6, 9, 1],
        [2, 3, 9, 6, 7, 5, 8, 4, 3],
        [8, 6, 4, 9, 1, 3, 5, 2, 7],
        [9, 7, 3, 8, 5, 4, 1, 6, 2],
        [1, 4, 2, 7, 9, 6, 3, 5, 8],
        [6, 5, 8, 1, 3, 2, 4, 7, 9]
    ];

var testNonNumInSolution =
    [
        [4, 2, 1, 3, 6, 7, 9, 8, 5],
        [3, 8, 5, 4, 2, 9, 7, 1, 6],
        [7, 9, 6, 5, 8, 1, 2, 3, 4],
        [5, 3, 7, 2, "Q", 8, 6, 9, 1],
        [2, 1, 9, 6, 7, 5, 8, 4, 3],
        [8, 6, 4, 9, 1, 3, 5, 2, 7],
        [9, 7, 3, 8, 5, 4, 1, 6, 2],
        [1, 4, 2, 7, 9, 6, 3, 5, 8],
        [6, 5, 8, 1, 3, 2, 4, 7, 9]
    ];

console.assert(runAllTemplateTestsForXSudoku(testTemplateCorrectX) == true);
console.assert(runAllTemplateTestsForXSudoku(testTemplateLengthError) == false);
console.assert(runAllTemplateTestsForXSudoku(testTemplateSpace) == false);
console.assert(runAllTemplateTestsForXSudoku(testTemplateEmpty) == false);
console.assert(runAllTemplateTestsForXSudoku(testTemplateCorrectXtemplateHintLessThanSeventeenWhichIsSix) == false);
console.assert(runAllTemplateTestsForXSudoku(testTemplateRepeatNum) == false);

console.assert(runAllSolutionTestsForXSudoku(testSolutionCorrectX) == true);
console.assert(runAllSolutionTestsForXSudoku(testEmptyInSolution) == false);
console.assert(runAllSolutionTestsForXSudoku(totalEmptySolution) == false);
console.assert(runAllSolutionTestsForXSudoku(testSpaceInSolution) == false);
console.assert(runAllSolutionTestsForXSudoku(testLengthErrorInSolution) == false);
console.assert(runAllSolutionTestsForXSudoku(testBigBoxErrorInSolution) == false);
console.assert(runAllSolutionTestsForXSudoku(testRowErrorSolution) == false);
console.assert(runAllSolutionTestsForXSudoku(testColumnErrorSolution) == false);
console.assert(runAllSolutionTestsForXSudoku(testNonNumInSolution) == false);
