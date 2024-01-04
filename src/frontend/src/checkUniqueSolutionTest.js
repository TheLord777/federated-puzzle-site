import { checkUniqueRgular, checkUniqueXSudoku } from "./checkUniqueSolution.js"

var templateForRegularCorrect =
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

var templateTestForXSudokuCorrect =
    [
        [0, 0, 8, 9, 0, 0, 0, 5, 2],
        [0, 0, 2, 0, 0, 3, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 6],
        [0, 8, 0, 4, 0, 0, 0, 0, 9],
        [0, 0, 0, 0, 0, 0, 5, 0, 4],
        [4, 7, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 4, 0, 0, 0, 8, 0, 5],
        [1, 6, 0, 3, 0, 0, 0, 0, 0],
        [0, 0, 9, 0, 0, 0, 2, 0, 0]
    ];

var templateTestRegularMoreThanOneSolutions =
    [
        [0, 0, 0, 9, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 3, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 6],
        [0, 8, 0, 4, 0, 0, 0, 0, 9],
        [0, 0, 0, 0, 0, 0, 5, 0, 4],
        [4, 7, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 4, 0, 0, 0, 8, 0, 5],
        [1, 6, 0, 3, 0, 0, 0, 0, 0],
        [0, 0, 9, 0, 0, 0, 2, 0, 0]
    ];

var diffcultToSolveRegular =
    [
        [0, 9, 0, 0, 0, 3, 7, 0, 0],
        [0, 0, 0, 0, 5, 0, 0, 0, 4],
        [0, 0, 1, 2, 0, 0, 0, 6, 0],
        [0, 4, 5, 0, 6, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 4, 0, 0, 0],
        [2, 0, 0, 7, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 9, 3, 0, 0],
        [0, 0, 6, 0, 0, 0, 0, 1, 0],
        [7, 0, 0, 0, 8, 0, 0, 0, 2]
    ];

var templateTestForXSudokuMoreThanOneSolution = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [0, 0, 7, 2, 1, 8, 9, 4, 5],
    [9, 1, 8, 5, 3, 4, 2, 6, 7],
    [5, 4, 2, 6, 9, 7, 8, 3, 1],
    [0, 0, 4, 9, 7, 2, 5, 1, 8],
    [8, 7, 1, 3, 4, 5, 6, 9, 2],
    [2, 9, 5, 8, 6, 1, 3, 7, 4]];

// Test if a diffcult regular(classical) sudoku can be solved with a unique solution
console.assert(checkUniqueRgular(diffcultToSolveRegular) == 1);
// Test if a regular sudoku which has more than one solutions can be solved with more than one solutions
console.assert(checkUniqueRgular(templateTestRegularMoreThanOneSolutions) == 2);
// Test if a regular sudoku with fair diffculty can be solved with only one solution
console.assert(checkUniqueRgular(templateForRegularCorrect) == 1);
// Test if an X sudoku with fair diffculty can be solved with only one solution
console.assert(checkUniqueXSudoku(templateTestForXSudokuCorrect) == 1);
// // Test if an X sudoku which has more that one solution can be solved with more than one solutions
console.assert(checkUniqueXSudoku(templateTestForXSudokuMoreThanOneSolution) == 2);