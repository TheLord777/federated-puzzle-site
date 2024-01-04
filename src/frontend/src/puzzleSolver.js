import { PUZZLE_VARIANT } from "./models.js"
import { checkUniqueRgular, checkUniqueXSudoku } from "./checkUniqueSolution.js"
function cloneSudokuArray(sudokuArray) {
  return sudokuArray.map(row => [...row]);
}

// This file contains the auto solver methods for regular sudoku and X sudoku
export function solve(puzzleProblem, variant) {
  let solution;
  let numberSolutions;
  const clonedProblem = cloneSudokuArray(puzzleProblem);

  if (variant === PUZZLE_VARIANT.CLASSIC) {
    numberSolutions = checkUniqueRgular(clonedProblem);
    if (numberSolutions < 1) {
      return "No solution for this puzzle"
    } else if (numberSolutions > 1) {
      return "Multiple solutions for this puzzle"
    }
    solution = regularSolver(clonedProblem);
  } else if (variant === PUZZLE_VARIANT.X_SUDOKU) {
    numberSolutions = checkUniqueXSudoku(clonedProblem);
    if (numberSolutions < 1) {
      return "No solution for this puzzle"
    } else if (numberSolutions > 1) {
      return "Multiple solutions for this puzzle"
    }
    solution = xSolver(clonedProblem);
  }

  if (solution === undefined) {
    console.error("No solver for this variant");
    return "No solver for this variant";
  } else if (!solution) {
    console.error("No unique solution");
    return "No unique solution";
  } else {
    return solution;
  }

}
// Please note:
// For solving regular sudoku, call "regularSolver"
// For solving X sudoku, call "xSolver"

// This is the solver for regular sudokus
function regularSolver(puzzleArray) {
  // For checking if the number we try for filling is valid and safe to place
  function rowColChecker(puzzleArray, row, col, num) {
    for (var i = 0; i < 9; i++) {
      if (puzzleArray[row][i] == num || puzzleArray[i][col] == num) {
        return false;
      }
    }
    var boxRowStart = Math.floor(row / 3) * 3;
    var boxColStart = Math.floor(col / 3) * 3;
    // console.log(boxRowStart);
    for (var boxRowIncrement = 0; boxRowIncrement < 3; boxRowIncrement++) {
      for (var boxColIncrement = 0; boxColIncrement < 3; boxColIncrement++) {
        if (
          puzzleArray[boxRowStart + boxRowIncrement][boxColStart + boxColIncrement] == num
        ) {
          return false;
        }
      }
    }
    return true;
  }

  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      if (puzzleArray[row][col] == 0) {
        for (var num = 1; num < 10; num++) {
          if (rowColChecker(puzzleArray, row, col, num)) {
            puzzleArray[row][col] = num;
            if (regularSolver(puzzleArray)) {
              // console.log(row);
              return puzzleArray;
            } else {
              // Fail to place, erase and re-try
              puzzleArray[row][col] = 0;
            }
          }
        }
        return false;
      }
    }
  }
  return puzzleArray;
}





// The method "xSolver" should be called for solving X sudoku
function xSolver(xPuzzleArray) {
  // This method is used for if there is any elements duplicated in template past in

  // console.log(xPuzzleArray+" here");

  function repeatChecker(row, col, num) {
    for (let i = 0; i < xPuzzleArray.length; i++) {
      // Check if the number repeat in the row
      if (xPuzzleArray[row][i] === num) {
        return false;
      }

      // Check if the number repeat in the column
      if (xPuzzleArray[i][col] === num) {
        return false;
      }

      // Check if the number repeat in the diagonal from the top left
      if (row === col && xPuzzleArray[i][i] === num) {
        return false;
      }

      // Check if the number is repeat in another diagonal from the top right
      if (
        row + col === xPuzzleArray.length - 1 &&
        xPuzzleArray[i][xPuzzleArray.length - i - 1] === num
      ) {
        return false;
      }

      // check big box repeat
      let boxRowStart = Math.floor(row / 3) * 3;
      let boxColStart = Math.floor(col / 3) * 3;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (xPuzzleArray[boxRowStart + i][boxColStart + j] === num) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Recursive function to solve the X Sudoku

  function trySolve(xPuzzleArray, row, col) {
    // when the bound is reached, we got the solution
    if (row === xPuzzleArray.length) {
      return true;
    }

    // If the current box is not empty, move to the next box
    if (xPuzzleArray[row][col] !== 0) {
      if (col === xPuzzleArray.length - 1) {
        return trySolve(xPuzzleArray, row + 1, 0);
      } else {
        return trySolve(xPuzzleArray, row, col + 1);
      }
    }
    // fill the boxes
    for (let i = 1; i <= xPuzzleArray.length; i++) {
      if (repeatChecker(row, col, i)) {
        xPuzzleArray[row][col] = i;
        // To the next row
        if (col === xPuzzleArray.length - 1) {
          if (trySolve(xPuzzleArray, row + 1, 0)) {
            return true;
          }
          // To the next box
        } else {
          if (trySolve(xPuzzleArray, row, col + 1)) {
            return true;
          }
        }
        // Fail, erase the previous number when try to fill
        xPuzzleArray[row][col] = 0;
      }
    }
    return false;
  }

  // call method trySolve recursivly here
  // Call the method from the first element of the sudoku
  if (trySolve(xPuzzleArray, 0, 0)) {
    return xPuzzleArray;
  } else {
    return false;
  }
}

// This template is for testing
var templateTest = [
  [0, 0, 0, 0, 0, 7, 9, 0, 0],
  [0, 0, 0, 0, 2, 0, 7, 0, 0],
  [0, 9, 0, 5, 0, 0, 2, 0, 4],
  [5, 0, 7, 0, 4, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0],
  [8, 6, 0, 0, 0, 0, 5, 0, 0],
  [9, 0, 3, 8, 0, 0, 0, 6, 0],
  [0, 4, 2, 0, 0, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 4, 7, 0],
];

var diffcultToSolve =
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
// console.log("------------------------------")
// console.log(xSolver(diffcultToSolve));
// console.log(regularSolver(diffcultToSolve));
