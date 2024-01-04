const MAX_LENGTH = 9;

// Notice: There are some similar methods referenced from file puzzleMethodFronted since the logic part is similar in X suduku
// ---Integrated test all methods---
function runAllTemplateTests(template) {
    try {
        let result = checkTemplateLength(template) && checkNumberForTemplate(template) && checkNoEmptySpaceInTemplate(template) && checkRowRepeatInTemplate(template) &&
            checkColumnRepeatInTemplate(template) && checkBigBoxesInTemplate(template) && checkTemplateNumHints(template);
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function runAllSolutionTests(puzzleArray) {
    try {
        let result = checkPuzzleLength(puzzleArray) && checkNoEmptySpaceInSolution(puzzleArray) && checkNumberInSolution(puzzleArray) && checkNumberInRange(puzzleArray) &&
            checkRowRepeatInSolution(puzzleArray) && checkColumnRepeatInSolution(puzzleArray) && checkBigBoxesInSolution(puzzleArray);
        return result;
    } catch (error) {
        return false;
    }
}

//--- Methods for verificate if a template is changed---

function templateVerification(template, solution) {
    var oneDTemplateArray = twoDimensionsToOne(template);
    var oneDSolutionArray = twoDimensionsToOne(solution);
    var notMatchFlag = 0;
    // Checks through each element of the array and ensures they are identical
    // Skips element if template is zero, as this means solution can have any value
    for (let i = 0; i < oneDTemplateArray.length; i++) {
        if (!(oneDTemplateArray[i] == 0)) {
            //console.log(oneDTemplateArray[i])
            if (oneDTemplateArray[i] == oneDSolutionArray[i]) {
            } else {
                notMatchFlag = 1;
                //console.log(oneDTemplateArray[i] + "" + oneDSolutionArray[i])
            }
        }
    }
    if (notMatchFlag == 0) {
        return true;
    } else {
        console.error(`Verification Error: The template is does not match with the solution`);
        return false;
    }
}

// ---Methods for templates checking begin from here.---

//Check if each array of a two dimension array is in length of 9 
function checkTemplateLength(template) {
    if (template.length == MAX_LENGTH) {
        for (let i = 0; i < template.length; i++) {
            if (template[i].length != MAX_LENGTH) {
                console.error(`Length Error: Column ${i + 1} has ${template[i].length} elements, should be 9`);
                if (typeof window !== 'undefined') {alert(`Length Error: Column ${i + 1} has ${template[i].length} elements, should be 9`)};
                return false;
            }
        }
    } else {
        console.error(`Length Error: Template has ${template.length} columns, should be 9`);
        if (typeof window !== 'undefined') {alert(`Length Error: Template has ${template.length} columns, should be 9`)};
        return false;
    }
    return true;
}

// Check if there is no space or if there is any element lost in the array
function checkNoEmptySpaceInTemplate(template) {
    for (let row = 0; row < template.length; row++) {
        for (let col = 0; col < template[row].length; col++) {
            if (template[row][col] === " " || template[row][col] === "") {
                console.error(`Empty Error: Empty space on Row ${row + 1} Column ${col + 1}`);
                if (typeof window !== 'undefined') {alert(`Empty Error: Empty space on Row ${row + 1} Column ${col + 1}`)};
                return false;
            }
        }
    }
    return true;
}

// Check if there is any repeat number in every row of the template array
function checkRowRepeatInTemplate(template) {
    for (let row = 0; row < template.length; row++) {
        var rowArray = [...template[row]];
        var rowArrayWithoutZero = new Array;
        var index = 0;
        for (let i = 0; i < rowArray.length; i++) {
            if (rowArray[i] == 0) {

            } else {
                rowArrayWithoutZero[index] = rowArray[i];
                index++
            }
        }
        var sortedRow = rowArrayWithoutZero.sort();
        // console.log(sortedRow);
        for (let col = 0; col < sortedRow.length; col++) {
            if (sortedRow[col] === sortedRow[col + 1]) {
                console.error(`Repeat Error: Repeat on Row ${row + 1} with number ${sortedRow[col]}`);
                if (typeof window !== 'undefined') {alert(`Repeat Error: Repeat on Row ${row + 1} with number ${sortedRow[col]}`)};
                return false;
            }
        }
    }
    return true;
}

// Check if there is any repeat number in every column of the template array
function checkColumnRepeatInTemplate(template) {
    for (let col = 0; col < MAX_LENGTH; col++) {
        var columnArray = new Array;
        var columnArrayWithoutZero = new Array;
        var offsetFlag = 0;
        var index = 0;
        for (let row = 0; row < template.length; row++) {
            columnArray[row] = template[row][col];
        }
        for (let i = 0; i < columnArray.length; i++) {
            if (columnArray[i] == 0) {
                offsetFlag++
            } else {
                columnArrayWithoutZero[index] = columnArray[i];
                index++
            }
        }
        var sortedColumn = [...columnArrayWithoutZero].sort();
        // console.log(sortedColumn);
        for (let i = 0; i < sortedColumn.length; i++) {
            if (sortedColumn[i] == sortedColumn[i + 1]) {
                console.error(`Repeat Error: Repeat on Column ${col + 1} with number ${sortedColumn[i]}`);
                if (typeof window !== 'undefined') {alert(`Repeat Error: Repeat on Column ${col + 1} with number ${sortedColumn[i]}`)};
                return false;
            }
        }
    }
    return true;
}

// Check if every value if the template array is a number and should lie in the interval 0-9
function checkNumberForTemplate(templateArray) {
    for (let row = 0; row < templateArray.length; row++) {
        for (let col = 0; col < templateArray[row].length; col++) {
            // if (isNaN(puzzleArray[row][col])) {
            //     console.error(`Num Error: NaN on Row ${row} Column ${col}`);
            //     return false;
            // }
            if (isNumForTemplate(templateArray[row][col])) {
                //console.log("is num");
            } else {
                console.error(`Num Error: NaN on Row ${row + 1} Column ${col + 1} in template`);
                if (typeof window !== 'undefined') {alert(`Num Error: NaN on Row ${row + 1} Column ${col + 1} in template`)};
                return false;
            }
        }
    }
    return true;
}

// Check if the value pass in is numebr in the interval 0-9 (According to the protocal of the supergroup, empty should be 0)
function isNumForTemplate(valueInput) {
    if (valueInput < 0 || valueInput > 9) {
        return false;
    } else if (isNaN(valueInput)) {
        return false;
    } else {
        return true;
    }
}

// This method is checking if there is no repeat number in every bigboxes
function checkBigBoxesInTemplate(templateArray) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let col = i * 3;
            let row = j * 3;
            if (!checkSingleBigBoxInTemplate(row, row + 3, col, col + 3)) {
                return false;
            }
        }
    }

    // This method is checking if there is no repeat number in a bigbox
    function checkSingleBigBoxInTemplate(rowStart, rowEnd, colStart, colEnd) {
        var bigBoxArray = new Array;
        for (let i = rowStart; i < rowEnd; i++) {
            for (let j = colStart; j < colEnd; j++) {
                bigBoxArray.push(templateArray[i][j]);
            }
            bigBoxArray.sort();
            for (let i = 0; i < bigBoxArray.length; i++) {
                if (bigBoxArray[i] == bigBoxArray[i + 1] && !(bigBoxArray[i] == 0)) {
                    console.error(`Repeat Error: Repeat in big box with number ${bigBoxArray[i]}`);
                    if (typeof window !== 'undefined') {alert(`Repeat Error: Repeat in big box with number ${bigBoxArray[i]}`)};
                    /*console.log(rowStart);
                    console.log(rowEnd - 1);
                    console.log(colStart);
                    console.log(colEnd - 1);*/
                    return false;
                }
            }
        }
        return true;
    }
    return true;
}

// Check that there are at least 17 and no more than 80 hints in the template
function checkTemplateNumHints(templateArray) {
    let spaces = 0;
    for (let row = 0; row < templateArray.length; row++) {
        for (let col = 0; col < templateArray[row].length; col++) {
            // Count each 0 value space
            if (templateArray[row][col] === 0) {
                spaces++
            }
        }
    }

    // must be between 1 and 64 spaces
    if (spaces >= 1 && spaces <= 64) {
        return true;
    }
    return false;
}

// ---Methods for solutions begin from here.---


//Check if each array of a two dimension array is in length of 9 
function checkPuzzleLength(puzzleArray) {
    if (puzzleArray.length == MAX_LENGTH) {
        for (let i = 0; i < puzzleArray.length; i++) {
            if (puzzleArray[i].length != MAX_LENGTH) {
                console.error(`Length Error: Column ${i + 1} has ${puzzleArray[i].length} elements, should be 9`);
                if (typeof window !== 'undefined') {alert(`Length Error: Column ${i + 1} has ${puzzleArray[i].length} elements, should be 9`)};
                return false;
            }
        }
    } else {
        console.error(`Length Error: Solution has ${puzzleArray.length} columns, should be 9`);
        if (typeof window !== 'undefined') {alert(`Length Error: Solution has ${puzzleArray.length} columns, should be 9`)};
        return false;
    }

    return true;
}

// Check if there is no empty(which is 0 in the protocal), space and any element lost in the array
function checkNoEmptySpaceInSolution(puzzleArray) {
    for (let row = 0; row < puzzleArray.length; row++) {
        for (let col = 0; col < puzzleArray[row].length; col++) {
            if (puzzleArray[row][col] == " " || puzzleArray[row][col] == "" || puzzleArray[row][col] == 0) {
                console.error(`Empty Error: Empty space on Row ${row + 1} Column ${col + 1}`);
                if (typeof window !== 'undefined') {alert(`Empty Error: Empty space on Row ${row + 1} Column ${col + 1}`)};
                return false;
            }
        }
    }

    return true;
}

// Check if every value in the sulution array is a valid number which should lie in the interval 1-9
function checkNumberInSolution(puzzleArray) {
    for (let row = 0; row < puzzleArray.length; row++) {
        for (let col = 0; col < puzzleArray[row].length; col++) {
            // if (isNaN(puzzleArray[row][col])) {
            //     console.error(`Num Error: NaN on Row ${row} Column ${col}`);
            //     return false;
            // }
            if (isNumForSolution(puzzleArray[row][col])) {
            } else {
                console.error(`Num Error: NaN on Row ${row + 1} Column ${col + 1}`);
                if (typeof window !== 'undefined') {alert(`Num Error: NaN on Row ${row + 1} Column ${col + 1}`)};
                return false;
            }
        }
    }

    return true;
}

// Function to test if every value is between 1 and 9
function checkNumberInRange(puzzleArray) {
    for (let row = 0; row < puzzleArray.length; row++) {
        for (let col = 0; col < puzzleArray[row].length; col++) {
            if (puzzleArray[row][col] < 1 || puzzleArray[row][col] > 9) {
                console.error(`Num Error: Out of range on Row ${row + 1} Column ${col + 1}`);
                if (typeof window !== 'undefined') {alert(`Num Error: Out of range on Row ${row + 1} Column ${col + 1}`)};
                return false;
            }
        }
    }

    return true;
}

// Check if there is any repeat number in row of the solution
function checkRowRepeatInSolution(puzzleArray) {
    for (let row = 0; row < puzzleArray.length; row++) {
        var rowArray = [...puzzleArray[row]];
        var sortedRow = rowArray.sort();
        for (let col = 0; col < sortedRow.length; col++) {
            if (sortedRow[col] === sortedRow[col + 1]) {
                console.error(`Repeat Error: Repeat on Row ${row + 1} with number ${sortedRow[col]}`);
                if (typeof window !== 'undefined') {alert(`Repeat Error: Repeat on Row ${row + 1} with number ${sortedRow[col]}`)};
                return false;
            }
        }
    }
    return true;
}

// Check if there is any repeat number in column of the solution
function checkColumnRepeatInSolution(puzzleArray) {
    for (let col = 0; col < MAX_LENGTH; col++) {
        var columnArray = new Array;
        for (let row = 0; row < puzzleArray.length; row++) {
            columnArray[row] = puzzleArray[row][col];
        }
        var sortedColumn = [...columnArray].sort();
        for (let i = 0; i < sortedColumn.length; i++) {
            if (sortedColumn[i] == sortedColumn[i + 1]) {
                console.error(`Repeat Error: Repeat on Column ${col + 1} with number ${sortedColumn[i]}`);
                if (typeof window !== 'undefined') {alert(`Repeat Error: Repeat on Column ${col + 1} with number ${sortedColumn[i]}`)};
                return false;
            }
        }
    }
    return true;
}

// Bigbox is a 3*3 box of a 9*9 puzzle
// This method is checking if there is no repeat number in all the bigboxes
function checkBigBoxesInSolution(puzzleArray) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let col = i * 3;
            let row = j * 3;
            if (!checkSingleBigBoxInSolution(row, row + 3, col, col + 3)) {
                return false;
            }
        }
    }

    // This method is checking if there is no repeat number in a bigbox
    function checkSingleBigBoxInSolution(rowStart, rowEnd, colStart, colEnd) {
        var bigBoxArray = new Array;
        for (let i = rowStart; i < rowEnd; i++) {
            for (let j = colStart; j < colEnd; j++) {
                bigBoxArray.push(puzzleArray[i][j]);
            }
            bigBoxArray.sort();
            for (let i = 0; i < bigBoxArray.length; i++) {
                if (bigBoxArray[i] == bigBoxArray[i + 1]) {
                    console.error(`Repeat Error: Repeat in big box with number ${bigBoxArray[i]}`);
                    if (typeof window !== 'undefined') {alert(`Repeat Error: Repeat in big box with number ${bigBoxArray[i]}`)};
                    /*console.log(rowStart);
                    console.log(rowEnd - 1);
                    console.log(colStart);
                    console.log(colEnd - 1);*/
                    return false;
                }
            }
        }

        return true;
    }

    return true;
}

// This method can be replaced by new mathod checkBigBoxes
function checkBigBoxesVersionOne(puzzleArray) {
    var oneDArray = twoDimensionsToOne(puzzleArray);
    const BIG_BOX_COUNT = 9;
    var boxCounter = 0;
    var bigBoxesBorder;
    for (let i = 0; i < BIG_BOX_COUNT; i++) {
        var bigBoxArray = new Array;
        var bigBoxArrayIndex = 0;

        // boxCounter is counting how many big boxes we went through
        // The 9*9 whole box was divided into 3 rows, so the bigBoxCounter is counting which row we should jump to
        // Since there is 3 rows, every row contains 3 big boxes, so if the numeber of boxes went through is under 3,
        // then the bigBoxesBorder is 0, if the numnber of boxes went through is 3-5, that means we should jump to the next row
        // so the bigBoxesBorder is 1......
        if (boxCounter < 6 && boxCounter > 2) {
            bigBoxesBorder = 1;
        } else if (boxCounter > 5) {
            bigBoxesBorder = 2
        } else {
            bigBoxesBorder = 0
        };

        // This is navagating which where we should begin to check 
        let wholePuzzleArrayindex = (boxCounter * 3) + (2 * 9 * bigBoxesBorder);

        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                bigBoxArray[bigBoxArrayIndex] = oneDArray[wholePuzzleArrayindex + z];
                bigBoxArrayIndex++;
            }
            // +9 to jump to the same place in the next row
            wholePuzzleArrayindex = wholePuzzleArrayindex + 9;
        }

        var sortedBigBox = bigBoxArray.slice(0).sort();

        for (let t = 0; t < sortedBigBox.length; t++) {
            if (sortedBigBox[t] == sortedBigBox[t + 1]) {
                console.error(`Big Box Error: Error`);
                return false;
            }
        }
        boxCounter++;
    }

    return true;
}

// To convert a two dimension puzzle array to a reguler one dimension array
function twoDimensionsToOne(puzzleArray) {
    var i;
    var n;
    var oneDimensionArray = new Array;
    var arrayIndex = 0;
    for (let i = 0; i < puzzleArray.length; i++) {
        for (let n = 0; n < puzzleArray[i].length; n++) {
            oneDimensionArray[arrayIndex] = puzzleArray[i][n];
            arrayIndex++;
        }
    }
    // console.log(oneDimensionArray);
    return oneDimensionArray;
}

// Check if the value pass in is a number, the valid interval for solution should be 1-9
function isNumForSolution(valueInput) {
    if (valueInput < 1 || valueInput > 9) {
        return false;
    } else if (isNaN(valueInput)) {
        return false;
    } else {
        return true;
    }
}

// Please note the code below is [FOR X SODUKU]

// [FOR SOLUTION] Checking if there is any number repeats in the x zone in the solution

// Notice: These 2-D Arrays are used for testing

// correct solution for X sudoku
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

// correct template for X sudoku
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


// [FOR solution] Checking if there is any number repeats in the x zone in the SOLUTION
function checkSolutionRepeatInXZone(xPuzzleArray) {
    var xZoneArrayFromUpLeft = new Array;
    var xZoneArrayFromUpRight = new Array;
    var arrayIndex = 0;
    for (let i = 0; i < xPuzzleArray.length; i++) {
        xZoneArrayFromUpLeft[arrayIndex] = xPuzzleArray[i][i];
        var inverseIndex = xPuzzleArray.length - i - 1;
        xZoneArrayFromUpRight[arrayIndex] = xPuzzleArray[i][inverseIndex];
        arrayIndex++;
    }
    var copyXZoneArrayFromUpLeft = [...xZoneArrayFromUpLeft];
    var copyXZoneArrayFromUpRight = [...xZoneArrayFromUpRight];
    var sortedXZoneArrayFromUpLeft = copyXZoneArrayFromUpLeft.sort();
    var sortedXZoneArrayFromUpRight = copyXZoneArrayFromUpRight.sort();
    for (let i = 0; i < sortedXZoneArrayFromUpLeft.length; i++) {
        if (sortedXZoneArrayFromUpLeft[i] === sortedXZoneArrayFromUpLeft[i + 1]) {
            console.error(`Repeat Error: [SOLUTION] Repeat on X Zone at row ${i + 1} with number ${sortedXZoneArrayFromUpLeft[i]}`);
            if (typeof window !== 'undefined') {alert(`Repeat Error: [SOLUTION] Repeat on X Zone at row ${i + 1} with number ${sortedXZoneArrayFromUpLeft[i]}`)};
            return false;
        }
    }
    for (let i = 0; i < sortedXZoneArrayFromUpRight.length; i++) {
        if (sortedXZoneArrayFromUpRight[i] === sortedXZoneArrayFromUpRight[i + 1]) {
            console.error(`Repeat Error: [SOLUTION] Repeat on X Zone at row ${i + 1} with number ${sortedXZoneArrayFromUpRight[i]}`);
            if (typeof window !== 'undefined') {alert(`Repeat Error: [SOLUTION] Repeat on X Zone at row ${i + 1} with number ${sortedXZoneArrayFromUpRight[i]}`)};
            return false;
        }
    }
    // console.log(sortedXZoneArrayFromUpLeft);
    // console.log(xZoneArrayFromUpRight);
    return true;
}


// [FOR TEMPLATE] Checking if there is any number repeats in the x zone in the TEMPLATE
function checkTemplateInXZone(xPuzzleArray) {
    var xZoneArrayFromUpLeft = new Array;
    var xZoneArrayFromUpRight = new Array;
    var arrayIndex = 0;
    for (let i = 0; i < xPuzzleArray.length; i++) {
        xZoneArrayFromUpLeft[arrayIndex] = xPuzzleArray[i][i];
        var inverseIndex = xPuzzleArray.length - i - 1;
        xZoneArrayFromUpRight[arrayIndex] = xPuzzleArray[i][inverseIndex];
        arrayIndex++;
    }
    var copyXZoneArrayFromUpLeft = [...xZoneArrayFromUpLeft];
    var copyXZoneArrayFromUpRight = [...xZoneArrayFromUpRight];
    var sortedXZoneArrayFromUpLeft = copyXZoneArrayFromUpLeft.sort();
    var sortedXZoneArrayFromUpRight = copyXZoneArrayFromUpRight.sort();

    for (let i = 0; i < sortedXZoneArrayFromUpLeft.length; i++) {
        if (sortedXZoneArrayFromUpLeft[i] === sortedXZoneArrayFromUpLeft[i + 1]) {
            if (sortedXZoneArrayFromUpLeft[i] == 0) {
            } else {
                console.error(`Repeat Error: [TEMPLATE] Repeat on X Zone in template, please inspect from the up left corner`);
                return false;
            }
        }
    }

    for (let i = 0; i < sortedXZoneArrayFromUpRight.length; i++) {
        if (sortedXZoneArrayFromUpRight[i] === sortedXZoneArrayFromUpRight[i + 1]) {
            if (sortedXZoneArrayFromUpRight[i] == 0) {

            } else {
                console.error(`Repeat Error: [TEMPLATE] Repeat on X Zone in template, please inspect from the up right corner`);
                return false;
            }
        }
    }

    return true;
}

function runAllSolutionTestsForXSudoku(xPuzzleSolution) {
    try {
        let result = checkPuzzleLength(xPuzzleSolution) && checkNoEmptySpaceInSolution(xPuzzleSolution) && checkNumberInSolution(xPuzzleSolution) && checkNumberInRange(xPuzzleSolution) &&
            checkRowRepeatInSolution(xPuzzleSolution) && checkColumnRepeatInSolution(xPuzzleSolution) && checkBigBoxesInSolution(xPuzzleSolution) && checkSolutionRepeatInXZone(xPuzzleSolution);
        return result;
    } catch (error) {
        return false;
    }
}

function runAllTemplateTestsForXSudoku(xPuzzleTemplate) {
    try {
        let result = checkTemplateLength(xPuzzleTemplate) && checkNumberForTemplate(xPuzzleTemplate) && checkNoEmptySpaceInTemplate(xPuzzleTemplate) && checkRowRepeatInTemplate(xPuzzleTemplate) &&
            checkColumnRepeatInTemplate(xPuzzleTemplate) && checkBigBoxesInTemplate(xPuzzleTemplate) && checkTemplateNumHints(xPuzzleTemplate) && checkTemplateInXZone(xPuzzleTemplate);
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Use for test
console.log(runAllSolutionTestsForXSudoku(testSolutionCorrectX));
console.assert(runAllSolutionTestsForXSudoku(testSolutionCorrectX) == true);
console.log(runAllTemplateTestsForXSudoku(testTemplateCorrectX));
console.assert(runAllTemplateTestsForXSudoku(testTemplateCorrectX) == true);

export { runAllSolutionTests, runAllTemplateTests, runAllSolutionTestsForXSudoku, runAllTemplateTestsForXSudoku, templateVerification };