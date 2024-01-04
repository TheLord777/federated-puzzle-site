// Please note

// This file contains two methods for check if there is an unique solution for regular sudoku and X sudoku

// To check if there is an unique solution for regular sudoku, call "checkUniqueRgular"

// To check if there is an unique solution for regular sudoku, call "checkUniqueXSudoku"

// For return value 0 :No solution
// For return value 1 :It has a unique solutoin
// For return value 2 :It has more than one solutions

export function checkUniqueRgular(puzzleArray) {
  const LENGTH = 9;
  const BIGBOX_LENGTH = 3;
  const EMPTY_BOX = 0;
  const HINT_NUMBER = 17;
  function getBigBoxBound(row, col) {
    const bigBoxRow = Math.floor(row / BIGBOX_LENGTH) * BIGBOX_LENGTH;
    const bigBoxCol = Math.floor(col / BIGBOX_LENGTH) * BIGBOX_LENGTH;
    return {
      rowStart: bigBoxRow,
      rowEnd: bigBoxRow + BIGBOX_LENGTH,
      colStart: bigBoxCol,
      colEnd: bigBoxCol + BIGBOX_LENGTH,
    };
  }

  function repeatChecker(puzzleCopy, row, col, num) {
    for (var i = 0; i < LENGTH; i++) {
      // check row
      if (puzzleCopy[row][i] === num) {
        return false;
      }
      // check column
      if (puzzleCopy[i][col] === num) {
        return false;
      }
    }

    // check bigbox
    const {
      rowStart,
      rowEnd,
      colStart,
      colEnd
    } = getBigBoxBound(row, col);

    for (var i = rowStart; i < rowEnd; i++) {
      for (var j = colStart; j < colEnd; j++) {
        if (puzzleCopy[i][j] === num) {
          return false;
        }
      }
    }

    return true;
  }


  function trySolve(puzzleCopy, row, col) {

    if (row === LENGTH) {
      solutions.push(puzzleCopy.map(row => [...row]));
      return;
    }

    if (col === LENGTH) {
      trySolve(puzzleCopy, row + 1, 0);
      return;
    }

    if (puzzleCopy[row][col] !== EMPTY_BOX) {
      trySolve(puzzleCopy, row, col + 1);
      return;
    }

    if (solutions.length > 1) {
      return false;
    }

    for (var num = 1; num <= LENGTH; num++) {
      if (repeatChecker(puzzleCopy, row, col, num)) {
        puzzleCopy[row][col] = num;
        trySolve(puzzleCopy, row, col + 1);
        puzzleCopy[row][col] = EMPTY_BOX;
      }
    }
  }
  var hintCounter = 0;
  var solutions = [];
  var puzzleCopy = puzzleArray.map(row => [...row]);

  for (var row = 0; row < LENGTH; row++) {
    for (var col = 0; col < LENGTH; col++) {
      if (puzzleArray[row][col] != 0) {
        // console.log("here");
        hintCounter++;
      }
    }
  }

  if (hintCounter < HINT_NUMBER) {
    return solutions.length;
  }
  trySolve(puzzleCopy, 0, 0);
  // console.log(solutions);
  return solutions.length;
}


export function checkUniqueXSudoku(xPuzzleArray) {
  const LENGTH = 9;
  const BIGBOX_LENGTH = 3;
  const EMPTY_BOX = 0;
  // const HINT_NUMBER = 17;
  function getBigBoxBound(row, col) {
    const bigBoxRow = Math.floor(row / BIGBOX_LENGTH) * BIGBOX_LENGTH;
    const bigBoxCol = Math.floor(col / BIGBOX_LENGTH) * BIGBOX_LENGTH;
    return {
      rowStart: bigBoxRow,
      rowEnd: bigBoxRow + BIGBOX_LENGTH,
      colStart: bigBoxCol,
      colEnd: bigBoxCol + BIGBOX_LENGTH,
    };
  }

  function repeatChecker(puzzleCopy, row, col, num) {
    for (var i = 0; i < LENGTH; i++) {
      // check row
      if (puzzleCopy[row][i] === num) {
        return false;
      }
      // check column
      if (puzzleCopy[i][col] === num) {
        return false;
      }
    }

    // check bigbox
    const {
      rowStart,
      rowEnd,
      colStart,
      colEnd
    } = getBigBoxBound(row, col);

    for (var i = rowStart; i < rowEnd; i++) {
      for (var j = colStart; j < colEnd; j++) {
        if (puzzleCopy[i][j] === num) {
          return false;
        }
      }
    }

    // check diagonals

    // From the top left 
    if (row === col) {
      for (var i = 0; i < LENGTH; i++) {
        if (puzzleCopy[i][i] === num) {
          return false;
        }
      }
    }

    // From the top right
    if (row === LENGTH - col - 1) {
      for (var i = 0; i < LENGTH; i++) {
        if (puzzleCopy[i][LENGTH - i - 1] === num) {
          return false;
        }
      }
    }
    return true;
  }


  function trySolve(puzzleCopy, row, col) {

    if (row === LENGTH) {
      solutions.push(puzzleCopy.map(row => [...row]));
      return;
    }

    if (col === LENGTH) {
      trySolve(puzzleCopy, row + 1, 0);
      return;
    }

    if (puzzleCopy[row][col] !== EMPTY_BOX) {
      trySolve(puzzleCopy, row, col + 1);
      return;
    }

    if (solutions.length > 1) {
      return false;
    }

    for (var num = 1; num <= LENGTH; num++) {
      if (repeatChecker(puzzleCopy, row, col, num)) {
        puzzleCopy[row][col] = num;
        trySolve(puzzleCopy, row, col + 1);
        puzzleCopy[row][col] = EMPTY_BOX;
      }
    }
  }
  // var hintCounter = 0;
  var solutions = [];
  var puzzleCopy = xPuzzleArray.map(row => [...row]);
  trySolve(puzzleCopy, 0, 0);
  return solutions.length;
}

var templateTest =

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

var templateForRegularTestOne =
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

var templateForRegularTestOneMul =
  [
    [0, 3, 5, 0, 6, 0, 0, 8, 0],
    [6, 0, 2, 0, 0, 0, 0, 0, 3],
    [1, 0, 7, 0, 3, 0, 0, 0, 2],
    [8, 0, 0, 0, 0, 5, 0, 4, 7],
    [0, 0, 0, 0, 0, 0, 0, 1, 5],
    [0, 5, 1, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 7, 4],
    [0, 0, 0, 9, 0, 7, 1, 0, 0],
    [7, 0, 0, 0, 0, 0, 2, 0, 0]
  ];

var testTemplateCorrectX =
  [
    [0, 0, 0, 0, 0, 7, 9, 0, 0],
    [0, 0, 0, 0, 2, 0, 7, 0, 0],
    [0, 9, 0, 5, 0, 0, 2, 0, 4],
    [5, 0, 7, 0, 4, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [8, 6, 0, 0, 0, 0, 5, 0, 0],
    [0, 0, 3, 8, 0, 0, 0, 6, 0],
    [0, 4, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

var templateTestTwoCorrect =
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

var templateTestTwoForMulSol =
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

var templateXlessThan17 =
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 6],
    [0, 8, 0, 0, 0, 0, 0, 0, 9],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 8, 0, 5],
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

var allZero =
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

var testNewCorrectX =
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
var diffcultToSolveProbabalyNoSolution =
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
var problemCase = [[2, 9, 5, 7, 4, 3, 8, 6, 1], [4, 3, 1, 8, 6, 5, 9, 0, 0], [8, 7, 6, 1, 9, 2, 5, 4, 3], [3, 8, 7, 4, 5, 9, 2, 1, 6], [6, 1, 2, 3, 8, 7, 4, 9, 5], [5, 4, 9, 2, 1, 6, 7, 3, 8], [7, 6, 3, 5, 2, 4, 1, 8, 9], [9, 2, 8, 6, 7, 1, 3, 5, 4], [1, 5, 4, 9, 3, 8, 6, 0, 0]]
var definitelytwo = [[1, 2, 3, 4, 5, 6, 7, 8, 9], [7, 8, 9, 1, 2, 3, 4, 5, 6], [4, 5, 6, 7, 8, 9, 1, 2, 3], [0, 0, 7, 2, 1, 8, 9, 4, 5], [9, 1, 8, 5, 3, 4, 2, 6, 7], [5, 4, 2, 6, 9, 7, 8, 3, 1], [0, 0, 4, 9, 7, 2, 5, 1, 8], [8, 7, 1, 3, 4, 5, 6, 9, 2], [2, 9, 5, 8, 6, 1, 3, 7, 4]];
var definitelyone = [[1, 1, 3, 4, 5, 6, 7, 8, 9], [7, 8, 9, 1, 2, 3, 4, 5, 6], [4, 5, 6, 7, 8, 9, 1, 2, 3], [3, 0, 7, 2, 1, 8, 9, 4, 5], [9, 1, 8, 5, 3, 4, 2, 6, 7], [5, 4, 2, 6, 9, 7, 8, 3, 1], [0, 0, 4, 9, 7, 2, 5, 1, 8], [8, 7, 1, 3, 4, 5, 6, 9, 2], [2, 9, 5, 8, 6, 1, 3, 7, 4]];

// console.log(checkUniqueXSudoku(definitelytwo));
// console.log(checkUniqueRgular(diffcultToSolveProbabalyNoSolution));



